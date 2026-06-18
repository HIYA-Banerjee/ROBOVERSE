# RoboVerse AI

RoboVerse AI is an AI-powered Virtual-to-Physical Robotics Learning Platform. It enables students, educators, and robotics enthusiasts to design circuits, map pins, program autonomous robots, and simulate behaviors in real-time, then export complete physical assembly checklists, components shopping lists, and ready-to-run microcontroller source codes to build the exact same robot physically.

---

## Core Features
1. **Interactive Learning Hub**: Dive into robotics fundamentals, electronics logic, sensor theories, and test your knowledge through checkpoints.
2. **Virtual Wiring Studio**: Connect microcontrollers (Arduino, ESP32, Raspberry Pi) to sensors and actuators in an interactive, visual drag-and-drop circuit simulator.
3. **AI Circuit Validator**: Automatically analyzes power constraints, logic level compatibility, missing ground links, or direct high-current motor connections.
4. **Robot Builder Studio**: Configure chassis properties (2-wheel differential, 4-wheel rover, drone, robotic arm) and load controllers or sensors.
5. **Real-Time Physics Simulation**: Step through robot kinematics and environments (Warehouse, Hospital, Smart Home) over high-performance WebSockets.
6. **Code Lab**: Write Arduino C++ sketches or Raspberry Pi Python scripts with dry-run compilers.
7. **Real Hardware Generator**: Instantly translate your virtual circuit into bills of materials, cost estimators, wiring maps, and downloadable files.
8. **Reinforcement Learning (RL) Sandbox**: Train navigation policies (PPO/DQN) while monitoring rewards.
9. **Diagnostics Check (/testing)**: Run automated self-checks to verify network, WebSockets, and API logic.

---

## Directory Structure
```
ROBOVERSE/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint, websocket loops, endpoints
│   │   ├── simulation.py     # Kinematic simulator & PyBullet client wrapper
│   │   ├── validator.py      # Circuit constraints and logic validation
│   │   ├── tutor.py          # AI tutoring and fallback answers
│   │   └── generator.py      # Hardware guides & code generation templates
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx          # Cyber landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx      # Integrated Robotics Dashboard workspace
│   │   ├── testing/
│   │   │   └── page.tsx      # Diagnostic testing suite
│   │   └── globals.css       # Custom futuristic neon styling system
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Setup & Run Instructions

### Option 1: Docker Compose (Recommended)
Orchestrate both the frontend and backend with a single command:
```bash
docker-compose up --build
```
* Frontend will list on: `http://localhost:3000`
* Backend API will list on: `http://localhost:8000`
* Self-diagnostics portal: `http://localhost:3000/testing`

---

### Option 2: Localhost Run (Manual Shells)

#### 1. Backend Startup
Ensure you have Python 3.10+ installed. Navigate to the `/backend` directory:
```bash
# Create a virtual environment
python -m venv venv
# Activate virtual environment (Windows)
.\venv\Scripts\activate
# Activate virtual environment (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) If you have VC++ Build tools installed, compile PyBullet:
# pip install pybullet

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Frontend Startup
Navigate to the `/frontend` directory:
```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev
```

---

### AI Tutor Integration
If you wish to unlock the live AI LLM capability for circuit reviews, create a `.env` file in the project root:
```env
GROQ_API_KEY=your_groq_api_key_here
```
If no key is configured, RoboVerse automatically utilizes its local **Robo-Expert** rule system, providing immediate responses.

---

## 📚 Detailed Documentation

Comprehensive architectural descriptions, API endpoints, and guides are located in the [docs/](file:///C:/Users/asus/Documents/ROBOVERSE/docs) folder:

- **[Getting Started Guide](file:///C:/Users/asus/Documents/ROBOVERSE/docs/getting-started.md)**: Steps to spin up backend/frontend.
- **[Backend API Spec](file:///C:/Users/asus/Documents/ROBOVERSE/docs/backend-api.md)**: REST endpoints and WebSockets interface.
- **[Frontend Architecture](file:///C:/Users/asus/Documents/ROBOVERSE/docs/frontend-structure.md)**: Explains React 19 structure, Next.js routes, and Three.js / R3F Canvas components.
- **[Reinforcement Learning Lab](file:///C:/Users/asus/Documents/ROBOVERSE/docs/rl-lab.md)**: Deep dive into the custom Gymnasium environment and PPO training loop.

---

## 🛠️ Advanced Simulation & RL Lab
- **3D Robot Simulation**: Uses React Three Fiber to render robot models, obstacle layouts, live LIDAR beams, and ultrasonic cones based on 20Hz telemetry.
- **Reinforcement Learning Workspace**: Train policies headlessly in python via Stable-Baselines3, tracking training metrics over live WebSockets on a beautiful, custom Plotly chart interface.

