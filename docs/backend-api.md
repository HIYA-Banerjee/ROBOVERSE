# Backend API Documentation

RoboVerse AI's backend is a high-performance REST and WebSocket API built with **FastAPI**. It manages real-time kinematic simulation, circuit syntax validation, AI tutor generation, and reinforcement learning streaming.

## REST Endpoints

### 1. Circuit Validation
- **URL**: `/api/validate`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "components": [
      { "id": "arduino_uno_0", "type": "arduino_uno" }
    ],
    "wires": [
      { "from": "arduino_uno_0", "fromPin": "GND", "to": "servo_0", "toPin": "GND" }
    ]
  }
  ```
- **Response**: Validates electrical connectivity, matching logical pin types, common ground rules, and voltage levels.

### 2. Hardware Generator
- **URL**: `/api/generate`
- **Method**: `POST`
- **Response**: Generates a Bill of Materials, step-by-step assembly guides, and production-ready microcontroller C++/Python code from virtual wiring layouts.

### 3. Programming dry-run Compiler
- **URL**: `/api/run-code`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "code": "void setup() { ... }",
    "language": "cpp"
  }
  ```
- **Response**: Analyzes program scripts for common robotics bugs, mismatched loops, and syntactical logic errors.

### 4. RL Training Controls
- **URL**: `/api/rl/start`
  - **Method**: `POST`
  - **Body**: `{ "env": "warehouse", "algorithm": "ppo" }`
- **URL**: `/api/rl/stop`
  - **Method**: `POST`
- **URL**: `/api/rl/status`
  - **Method**: `GET`

---

## WebSocket Connections

### 1. Simulation Telemetry
- **URL**: `/ws/simulation`
- **Behavior**: Streams real-time kinematic telemetry coordinates (X, Y, theta, battery, sensor beams) at 20Hz and captures keypress directions (`teleop` action) for virtual robot control.

### 2. RL Training Metrics
- **URL**: `/ws/rl`
- **Behavior**: Broadcasts training progress metrics, mean reward numbers, and episode counts at 20Hz during live agent training.
