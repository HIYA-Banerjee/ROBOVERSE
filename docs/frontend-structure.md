# Frontend Architecture & Structures

The RoboVerse AI user interface is a responsive, dark-mode dashboard built with **Next.js V16** and **React 19**. It features visual workspace layouts, custom interactive nodes, and advanced 3D environments.

## Directory Structure

```
frontend/
├── public/                 # Static graphical assets (e.g. hero-bg.png)
├── src/
│   ├── app/
│   │   ├── page.tsx        # Dynamic landing page
│   │   ├── layout.tsx      # Global App container & metadata
│   │   ├── dashboard/      # Primary workspace console (wiring, editor, simulator)
│   │   └── rl-lab/         # Reinforcement learning control center
│   ├── components/
│   │   ├── ThreeRobotViewer.tsx # 3D rendering engine (React Three Fiber)
│   │   └── RLChart.tsx          # Real-time Plotly reward plotting component
│   └── styles/
│       └── globals.css     # Styling utilities & variables
```

---

## 3D Simulation Engine (`ThreeRobotViewer.tsx`)
Rather than relying on flat 2D canvas layouts, RoboVerse simulates the robot dynamics in a fully realized 3D environment using **React Three Fiber (R3F)** and **Three.js**:

- **Grid System**: Draws coordinate grounds with responsive grid markers.
- **Robot Chassis**: Composed of meshes (base chassis, cylindrical wheels, sensor sphere dome, nose pointer).
- **LIDAR Visuals**: Generates raycast pointer lines reflecting active telemetry range values.
- **Ultrasonic Cone**: Builds a translucent glow frustum ahead of the chassis showing proximity ranges.
- **OrbitControls**: Offers full mouse/touch orbital camera navigation.
- **Fog & Shadows**: Uses custom canvas shadows, fog thresholds, and directional point-lights for premium depth.
