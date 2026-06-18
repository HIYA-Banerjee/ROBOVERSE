import threading
import time
import math
import random
import logging
import asyncio
import numpy as np
import gymnasium as gym
from gymnasium import spaces
from typing import Dict, Any, List, Set

from stable_baselines3 import PPO
from stable_baselines3.common.monitor import Monitor
from stable_baselines3.common.callbacks import BaseCallback

from app.simulation import RoboSimKinematics

logger = logging.getLogger("roboverse.rl")

class RobotEnv(gym.Env):
    """
    Custom Gymnasium environment wrapping RoboSimKinematics for RL navigation training.
    """
    metadata = {"render_modes": ["human"]}

    def __init__(self, env_name: str = "empty"):
        super(RobotEnv, self).__init__()
        self.env_name = env_name
        self.kinematics = RoboSimKinematics(env_name=env_name, robot_type="two_wheel")
        
        # Action space: [linear_velocity_target, angular_velocity_target]
        self.action_space = spaces.Box(
            low=np.array([-1.0, -1.5], dtype=np.float32),
            high=np.array([1.5, 1.5], dtype=np.float32),
            dtype=np.float32
        )
        
        # Observation space: [x, y, theta, target_x, target_y] + 16 LIDAR values
        self.observation_space = spaces.Box(
            low=-np.inf,
            high=np.inf,
            shape=(21,),
            dtype=np.float32
        )
        
        self.target_x = 0.0
        self.target_y = 0.0
        self.max_steps = 150
        self.current_step = 0
        self.reset()

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.kinematics.x = random.uniform(-2.0, 2.0)
        self.kinematics.y = random.uniform(-2.0, 2.0)
        self.kinematics.theta = random.uniform(0, 2 * math.pi)
        self.kinematics.battery_level = 100.0
        
        # Set a target position within a reasonable circle
        angle = random.uniform(0, 2 * math.pi)
        dist = random.uniform(3.0, 6.0)
        self.target_x = self.kinematics.x + dist * math.cos(angle)
        self.target_y = self.kinematics.y + dist * math.sin(angle)
        
        # Bound target to simulation area (-9 to 9)
        self.target_x = max(-9.0, min(9.0, self.target_x))
        self.target_y = max(-9.0, min(9.0, self.target_y))
        
        # Make sure target does not collide with obstacles
        attempts = 0
        while attempts < 30:
            collides = False
            for obs in self.kinematics.obstacles:
                if self.kinematics._check_circle_rect_collision(self.target_x, self.target_y, 0.5, obs):
                    collides = True
                    break
            if not collides:
                break
            # Try another spot
            self.target_x = random.uniform(-7.0, 7.0)
            self.target_y = random.uniform(-7.0, 7.0)
            attempts += 1

        self.current_step = 0
        return self._get_obs(), {}

    def _get_obs(self):
        lidar_data = self.kinematics._read_lidar()
        obs = np.array([
            self.kinematics.x,
            self.kinematics.y,
            self.kinematics.theta,
            self.target_x,
            self.target_y
        ] + lidar_data, dtype=np.float32)
        return obs

    def step(self, action):
        v_target, w_target = float(action[0]), float(action[1])
        
        # Step kinematics
        state = self.kinematics.update(v_target, w_target)
        self.current_step += 1
        
        # Calculate reward
        dist = math.hypot(self.kinematics.x - self.target_x, self.kinematics.y - self.target_y)
        
        # Distance-based reward (closer is better)
        reward = -dist * 0.1
        
        # Step penalty to encourage direct paths
        reward -= 0.02
        
        # Collision penalty
        collided = False
        for obs in self.kinematics.obstacles:
            if self.kinematics._check_circle_rect_collision(self.kinematics.x, self.kinematics.y, self.kinematics.radius, obs):
                collided = True
                break
        if collided:
            reward -= 2.0
            
        terminated = False
        truncated = False
        
        # Target reached
        if dist < 0.7:
            reward += 50.0
            terminated = True
            
        if self.current_step >= self.max_steps:
            truncated = True
            
        obs = self._get_obs()
        return obs, float(reward), terminated, truncated, {}


class RLAgentCallback(BaseCallback):
    """
    Custom stable-baselines3 callback to stream training metrics back to RLAgentManager.
    """
    def __init__(self, manager, verbose=0):
        super(RLAgentCallback, self).__init__(verbose)
        self.manager = manager
        self.last_log_step = 0

    def _on_step(self) -> bool:
        # Check if user cancelled training
        if not self.manager.is_training:
            logger.info("RL training stop requested via callback.")
            return False

        # Gather training stats periodically (every 50 steps)
        if self.num_timesteps - self.last_log_step >= 50:
            self.last_log_step = self.num_timesteps
            
            # Estimate mean reward from monitor wrapper
            mean_reward = 0.0
            episodes = 0
            if len(self.model.ep_info_buffer) > 0:
                mean_reward = float(np.mean([ep_info['r'] for ep_info in self.model.ep_info_buffer]))
                episodes = len(self.model.ep_info_buffer)
            else:
                # Fallback if no full episodes yet
                mean_reward = float(np.mean(self.locals.get("rewards", [0.0])))
                
            self.manager.add_metric(self.num_timesteps, mean_reward, episodes)
            
        return True


class RLAgentManager:
    """
    Manages RL PPO training lifecycle, including threading and websocket status streaming.
    """
    def __init__(self):
        self.is_training = False
        self.current_step = 0
        self.current_reward = 0.0
        self.episodes = 0
        self.algorithm = "ppo"
        self.env_name = "empty"
        self.metrics: List[Dict[str, Any]] = []
        self.thread: threading.Thread = None
        self.loop = None
        self.websockets: Set[Any] = set()

    def register_websocket(self, websocket):
        self.websockets.add(websocket)
        logger.info(f"Registered RL WebSocket client. Active: {len(self.websockets)}")

    def unregister_websocket(self, websocket):
        self.websockets.discard(websocket)
        logger.info(f"Unregistered RL WebSocket client. Active: {len(self.websockets)}")

    def start_training(self, env_name: str = "empty", algorithm: str = "ppo"):
        if self.is_training:
            logger.warning("RL training already in progress.")
            return False

        self.env_name = env_name
        self.algorithm = algorithm
        self.is_training = True
        self.current_step = 0
        self.current_reward = -100.0
        self.episodes = 0
        self.metrics = []
        
        # Fetch current asyncio loop to schedule websocket sends from thread safely
        try:
            self.loop = asyncio.get_running_loop()
        except RuntimeError:
            self.loop = None

        self.thread = threading.Thread(target=self._run_training_loop, daemon=True)
        self.thread.start()
        logger.info(f"Started RL training thread in environment: {env_name} using PPO.")
        return True

    def stop_training(self):
        if not self.is_training:
            return False
        self.is_training = False
        logger.info("Stopping RL training.")
        if self.thread:
            self.thread.join(timeout=3.0)
        return True

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_training": self.is_training,
            "current_step": self.current_step,
            "current_reward": round(self.current_reward, 2),
            "episodes": self.episodes,
            "env_name": self.env_name,
            "algorithm": self.algorithm,
            "metrics": self.metrics
        }

    def add_metric(self, step: int, reward: float, episodes: int):
        self.current_step = step
        self.current_reward = reward
        self.episodes = episodes
        
        metric_point = {
            "step": step,
            "reward": round(reward, 2),
            "episodes": episodes
        }
        self.metrics.append(metric_point)
        
        # Broadcast metric_point via websockets
        if self.websockets and self.loop:
            # Thread-safe broadcast schedule
            asyncio.run_coroutine_threadsafe(self._broadcast_status(), self.loop)

    async def _broadcast_status(self):
        status = self.get_status()
        disconnected = []
        for ws in self.websockets:
            try:
                await ws.send_json(status)
            except Exception as e:
                logger.error(f"WebSocket send failed, client disconnected: {e}")
                disconnected.append(ws)
        for ws in disconnected:
            self.unregister_websocket(ws)

    def _run_training_loop(self):
        try:
            # Create environment
            raw_env = RobotEnv(env_name=self.env_name)
            env = Monitor(raw_env)
            
            # Instantiate simplified PPO model for ultra fast local training
            model = PPO(
                "MlpPolicy",
                env,
                verbose=1,
                n_steps=128,              # Small batch size to trigger callbacks frequently
                batch_size=32,
                n_epochs=3,
                learning_rate=3e-4,
                policy_kwargs=dict(net_arch=dict(pi=[32, 32], vf=[32, 32])), # Extremely light architecture
                device="cpu"              # CPU is plenty fast for this small model and avoids GPU overhead
            )
            
            callback = RLAgentCallback(self)
            
            # Train for a maximum of 10000 steps (can be stopped via callback at any point)
            model.learn(total_timesteps=10000, callback=callback)
            
            logger.info("RL training loop completed successfully.")
        except Exception as e:
            logger.error(f"Error in training thread execution: {e}")
        finally:
            self.is_training = False
            # Send final status update
            if self.websockets and self.loop:
                asyncio.run_coroutine_threadsafe(self._broadcast_status(), self.loop)

# Shared global instance
rl_manager = RLAgentManager()
