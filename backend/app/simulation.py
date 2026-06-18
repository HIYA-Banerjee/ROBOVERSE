import time
import math
import random
import logging
from typing import Dict, Any, List, Tuple

logger = logging.getLogger(__name__)

# Try importing pybullet. If it fails, we log it and use RoboSim kinematics.
HAS_PYBULLET = False
try:
    import pybullet as p
    import pybullet_data
    HAS_PYBULLET = True
except ImportError:
    logger.info("PyBullet is not installed. Defaulting to RoboSim kinematic engine.")

# Environment layout definitions (obstacles represented as rectangles: [x1, y1, x2, y2])
ENVIRONMENTS = {
    "empty": [
        # Just outer boundary walls
        [-10, -10, -9.5, 10],  # Left wall
        [9.5, -10, 10, 10],   # Right wall
        [-10, -10, 10, -9.5],  # Bottom wall
        [-10, 9.5, 10, 10]     # Top wall
    ],
    "warehouse": [
        [-10, -10, -9.5, 10], [9.5, -10, 10, 10], [-10, -10, 10, -9.5], [-10, 9.5, 10, 10],
        # Racks
        [-5, -5, -3, -1], [-5, 1, -3, 5],
        [3, -5, 5, -1], [3, 1, 5, 5],
        [-1, -2, 1, 2] # Center pile
    ],
    "hospital": [
        [-10, -10, -9.5, 10], [9.5, -10, 10, 10], [-10, -10, 10, -9.5], [-10, 9.5, 10, 10],
        # Corridors and rooms
        [-9.5, 3, -2, 3.5], [2, 3, 9.5, 3.5], # Horizontal wall dividing rooms
        [-4, -9.5, -3.5, -2], [4, -9.5, 4.5, -2], # Room pillars
        [-2, -3, 2, -2.5]
    ],
    "factory": [
        [-10, -10, -9.5, 10], [9.5, -10, 10, 10], [-10, -10, 10, -9.5], [-10, 9.5, 10, 10],
        # Conveyor lanes
        [-8, -8, 2, -7.5], [-2, 7.5, 8, 8],
        # Machinery blocks
        [-6, -2, -3, 2], [3, -2, 6, 2]
    ],
    "smart_home": [
        [-10, -10, -9.5, 10], [9.5, -10, 10, 10], [-10, -10, 10, -9.5], [-10, 9.5, 10, 10],
        # Kitchen, living room, bedroom walls
        [-9.5, 0, 2, 0.5], [4, 0, 9.5, 0.5],
        [0, -9.5, 0.5, -3], [0, 3, 0.5, 9.5]
    ]
}

class RoboSimKinematics:
    """
    High-fidelity kinematic simulation engine providing sensor models,
    rigid-body obstacle collision detection, and teleoperation physics.
    """
    def __init__(self, env_name: str = "empty", robot_type: str = "two_wheel"):
        self.env_name = env_name
        self.robot_type = robot_type
        self.obstacles = ENVIRONMENTS.get(env_name, ENVIRONMENTS["empty"])
        
        # Robot State
        self.x = 0.0
        self.y = 0.0
        self.theta = 0.0  # Radians
        self.vx = 0.0
        self.vy = 0.0
        self.omega = 0.0
        
        # Telemetry
        self.battery_level = 100.0
        self.last_update = time.time()
        self.radius = 0.6  # Collision radius of the robot

    def update(self, v_target: float, w_target: float) -> Dict[str, Any]:
        """
        Updates robot physics and runs collision resolution.
        """
        now = time.time()
        dt = min(now - self.last_update, 0.1)  # Cap dt at 100ms
        self.last_update = now

        # Update battery
        drain = (abs(v_target) * 0.5 + abs(w_target) * 0.3 + 0.1) * dt
        self.battery_level = max(0.0, self.battery_level - drain)

        if self.battery_level <= 0.0:
            v_target = 0.0
            w_target = 0.0

        # Simple lag representation
        self.vx = 0.8 * self.vx + 0.2 * v_target
        self.omega = 0.8 * self.omega + 0.2 * w_target

        # Kinematic integration
        dx = self.vx * math.cos(self.theta) * dt
        dy = self.vx * math.sin(self.theta) * dt
        dtheta = self.omega * dt

        # Apply proposed motion
        new_x = self.x + dx
        new_y = self.y + dy
        new_theta = (self.theta + dtheta) % (2 * math.pi)

        # Check collision for new position
        collision = False
        for obs in self.obstacles:
            if self._check_circle_rect_collision(new_x, new_y, self.radius, obs):
                collision = True
                break

        if not collision:
            self.x = new_x
            self.y = new_y
            self.theta = new_theta
        else:
            # Rebound slightly and stop linear velocity
            self.vx = -0.2 * self.vx
            # Allow steering even when stuck
            self.theta = new_theta

        # Run sensor calculations
        distance = self._read_ultrasonic()
        lidar_data = self._read_lidar()
        gps_x, gps_y = self._read_gps()
        ax, ay = self._read_accelerometer(dt)

        return {
            "engine": "RoboSim (Kinematics)",
            "x": self.x,
            "y": self.y,
            "theta": self.theta,
            "battery": round(self.battery_level, 2),
            "sensors": {
                "ultrasonic": round(distance, 3),
                "lidar": [round(d, 3) for d in lidar_data],
                "gps": [round(gps_x, 4), round(gps_y, 4)],
                "accelerometer": [round(ax, 3), round(ay, 3)]
            }
        }

    def _check_circle_rect_collision(self, cx: float, cy: float, radius: float, rect: List[float]) -> bool:
        # rect format: [x1, y1, x2, y2]
        x1, y1, x2, y2 = rect
        # Find closest point on rect to circle center
        closest_x = max(x1, min(cx, x2))
        closest_y = max(y1, min(cy, y2))
        
        # Calculate distance from circle center to this closest point
        dist_x = cx - closest_x
        dist_y = cy - closest_y
        dist_sq = dist_x**2 + dist_y**2
        return dist_sq < radius**2

    def _raycast(self, start_x: float, start_y: float, angle: float, max_range: float = 10.0) -> float:
        """
        Casts a ray into the environment and returns the distance to the nearest obstacle.
        """
        dx = math.cos(angle)
        dy = math.sin(angle)
        
        # Step-based ray casting for simplicity and robust obstacle detection
        steps = 100
        step_size = max_range / steps
        for i in range(steps):
            t = i * step_size
            rx = start_x + dx * t
            ry = start_y + dy * t
            
            # Check if this point falls inside any obstacle
            for obs in self.obstacles:
                x1, y1, x2, y2 = obs
                if x1 <= rx <= x2 and y1 <= ry <= y2:
                    return t
        return max_range

    def _read_ultrasonic(self) -> float:
        # Ultrasonic sensor faces directly forward (angle = self.theta)
        return self._raycast(self.x, self.y, self.theta, max_range=5.0)

    def _read_lidar(self, num_rays: int = 16) -> List[float]:
        # LIDAR spins 360 degrees, scanning multiple angles
        distances = []
        for i in range(num_rays):
            angle = self.theta + (i * 2 * math.pi / num_rays)
            dist = self._raycast(self.x, self.y, angle, max_range=8.0)
            # Add a small amount of random measurement noise
            dist = max(0.0, dist + random.gauss(0.0, 0.05))
            distances.append(dist)
        return distances

    def _read_gps(self) -> Tuple[float, float]:
        # Return coordinates with 2cm Gaussian noise
        gx = self.x + random.gauss(0.0, 0.02)
        gy = self.y + random.gauss(0.0, 0.02)
        return gx, gy

    def _read_accelerometer(self, dt: float) -> Tuple[float, float]:
        if dt <= 0:
            return 0.0, 0.0
        # Acceleration is change in velocity / dt
        # With added white noise
        ax = (self.vx * math.cos(self.theta)) / dt + random.gauss(0.0, 0.1)
        ay = (self.vx * math.sin(self.theta)) / dt + random.gauss(0.0, 0.1)
        return ax, ay


class PyBulletSimulation:
    """
    PyBullet Simulation Wrapper.
    Initializes headless physical simulator if installed.
    """
    def __init__(self, env_name: str = "empty", robot_type: str = "two_wheel"):
        self.env_name = env_name
        self.robot_type = robot_type
        self.client_id = -1
        self.robot_id = -1
        self.battery_level = 100.0
        self.last_update = time.time()
        
        if HAS_PYBULLET:
            try:
                self.client_id = p.connect(p.DIRECT)  # Headless mode
                p.setAdditionalSearchPath(pybullet_data.getDataPath())
                p.setGravity(0, 0, -9.81)
                
                # Load Ground Plane
                self.plane_id = p.loadURDF("plane.urdf")
                
                # Setup obstacles based on env
                self._load_obstacles()
                
                # Setup robot (we will spawn a simple box representational robot)
                self._spawn_robot()
            except Exception as e:
                logger.error(f"Failed to start PyBullet: {e}")
                self.client_id = -1

    def _load_obstacles(self):
        # Programmatically create simple visual boxes in PyBullet for obstacles
        obstacles = ENVIRONMENTS.get(self.env_name, ENVIRONMENTS["empty"])
        for idx, obs in enumerate(obstacles):
            x1, y1, x2, y2 = obs
            cx = (x1 + x2) / 2.0
            cy = (y1 + y2) / 2.0
            w = x2 - x1
            h = y2 - y1
            
            col_id = p.createCollisionShape(p.GEOM_BOX, halfExtents=[w/2, h/2, 1.0])
            vis_id = p.createVisualShape(p.GEOM_BOX, halfExtents=[w/2, h/2, 1.0], rgbaColor=[0.2, 0.2, 0.3, 1])
            p.createMultiBody(baseMass=0, baseCollisionShapeIndex=col_id, baseVisualShapeIndex=vis_id, basePosition=[cx, cy, 1.0])

    def _spawn_robot(self):
        # Create a basic car chassis with 4 wheels or 2 wheels
        chassis_col = p.createCollisionShape(p.GEOM_BOX, halfExtents=[0.5, 0.4, 0.2])
        chassis_vis = p.createVisualShape(p.GEOM_BOX, halfExtents=[0.5, 0.4, 0.2], rgbaColor=[0.1, 0.8, 0.8, 1])
        
        self.robot_id = p.createMultiBody(
            baseMass=5.0,
            baseCollisionShapeIndex=chassis_col,
            baseVisualShapeIndex=chassis_vis,
            basePosition=[0, 0, 0.3]
        )

    def update(self, v_target: float, w_target: float) -> Dict[str, Any]:
        """
        Step simulation and extract state.
        """
        if self.client_id == -1 or not HAS_PYBULLET:
            # Fallback automatically if client failed to start
            return {}

        now = time.time()
        dt = min(now - self.last_update, 0.1)
        self.last_update = now

        # Update battery level
        drain = (abs(v_target) * 0.5 + abs(w_target) * 0.3 + 0.1) * dt
        self.battery_level = max(0.0, self.battery_level - drain)

        if self.battery_level > 0:
            # Apply velocities to PyBullet body
            # Translate linear/angular speed to differential wheels command
            l_speed = v_target - w_target * 0.4
            r_speed = v_target + w_target * 0.4
            
            # In headless box representation, we apply forces/velocities directly
            # to make it follow target velocities.
            yaw = self._get_robot_yaw()
            vx = v_target * math.cos(yaw)
            vy = v_target * math.sin(yaw)
            p.resetBaseVelocity(self.robot_id, linearVelocity=[vx, vy, 0], angularVelocity=[0, 0, w_target])
            
        p.stepSimulation()

        # Get robot position and orientation
        pos, orn = p.getBasePositionAndOrientation(self.robot_id)
        euler = p.getEulerFromQuaternion(orn)
        
        # Calculate mock sensor readings inside PyBullet coordinates
        distance = self._pybullet_raycast(pos, euler[2], 0.0, max_range=5.0)
        
        lidar_data = []
        for i in range(16):
            angle_offset = i * 2 * math.pi / 16
            dist = self._pybullet_raycast(pos, euler[2], angle_offset, max_range=8.0)
            lidar_data.append(dist)

        return {
            "engine": "PyBullet (Rigid-Body)",
            "x": pos[0],
            "y": pos[1],
            "theta": euler[2],
            "battery": round(self.battery_level, 2),
            "sensors": {
                "ultrasonic": round(distance, 3),
                "lidar": [round(d, 3) for d in lidar_data],
                "gps": [round(pos[0] + random.gauss(0, 0.02), 4), round(pos[1] + random.gauss(0, 0.02), 4)],
                "accelerometer": [0.0, 0.0]  # Simplified
            }
        }

    def _get_robot_yaw(self) -> float:
        _, orn = p.getBasePositionAndOrientation(self.robot_id)
        euler = p.getEulerFromQuaternion(orn)
        return euler[2]

    def _pybullet_raycast(self, pos: List[float], yaw: float, angle_offset: float, max_range: float) -> float:
        angle = yaw + angle_offset
        to_x = pos[0] + max_range * math.cos(angle)
        to_y = pos[1] + max_range * math.sin(angle)
        
        results = p.rayTest([pos[0], pos[1], 0.3], [to_x, to_y, 0.3])
        if results and results[0][0] != -1:
            hit_fraction = results[0][2]
            return hit_fraction * max_range
        return max_range

    def shutdown(self):
        if self.client_id != -1 and HAS_PYBULLET:
            p.disconnect(self.client_id)
            self.client_id = -1


# Dynamic Simulator Manager
class SimulatorManager:
    def __init__(self):
        self.active_sim = None
        self.env_name = "empty"
        self.robot_type = "two_wheel"

    def start(self, env_name: str = "empty", robot_type: str = "two_wheel"):
        self.env_name = env_name
        self.robot_type = robot_type
        
        if HAS_PYBULLET:
            try:
                self.active_sim = PyBulletSimulation(env_name, robot_type)
                logger.info("Started PyBullet simulation engine.")
                return
            except Exception as e:
                logger.error(f"PyBullet failed to start: {e}. Falling back to RoboSim.")
                
        self.active_sim = RoboSimKinematics(env_name, robot_type)
        logger.info("Started RoboSim kinematics simulation engine.")

    def step(self, v_target: float, w_target: float) -> Dict[str, Any]:
        if not self.active_sim:
            self.start(self.env_name, self.robot_type)
        
        state = self.active_sim.update(v_target, w_target)
        if not state:
            # If pybullet update returned empty (meaning it failed internally), fall back
            self.active_sim = RoboSimKinematics(self.env_name, self.robot_type)
            state = self.active_sim.update(v_target, w_target)
            
        return state

    def stop(self):
        if hasattr(self.active_sim, 'shutdown'):
            self.active_sim.shutdown()
        self.active_sim = None
