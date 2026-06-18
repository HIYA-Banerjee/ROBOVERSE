# Getting Started with RoboVerse AI

Welcome to **RoboVerse AI**, a comprehensive, interactive ecosystem for robotics learning, virtual hardware simulation, circuit wiring validation, and reinforcement learning agent training.

## System Prerequisites
- **Python**: 3.10 or 3.11
- **Node.js**: 18.x or newer (npm 9+)
- **OS**: Windows, macOS, or Linux

---

## Local Installation

### 1. Clone & Set Up the Repository
```bash
git clone https://github.com/yourusername/roboverse.git
cd roboverse
```

### 2. Backend Setup
The backend is powered by FastAPI, leveraging PyBullet/RoboSim for kinematics and Stable-Baselines3/Torch for Reinforcement Learning.

1. Navigate to the backend directory and build a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   ```
2. Activate the virtual environment:
   - **Windows (PowerShell)**: `.\venv\Scripts\Activate.ps1`
   - **macOS/Linux**: `source venv/bin/activate`
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Uvicorn development server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

### 3. Frontend Setup
The frontend is built using Next.js with React 19, Lucide icons, Three.js (via React Three Fiber), and Plotly.

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Running with Docker Compose
To launch both the frontend and backend in unified containers:

```bash
docker-compose up --build
```
This starts the backend on port `8000` and the frontend on port `3000` automatically.
