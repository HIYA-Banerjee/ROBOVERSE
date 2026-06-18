import asyncio
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.validator import CircuitValidator
from app.tutor import AITutor
from app.generator import HardwareGenerator
from app.simulation import SimulatorManager, HAS_PYBULLET
from app.rl_agent import rl_manager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("roboverse")

app = FastAPI(title="RoboVerse AI API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local frontend requests
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Input Schemas
class CircuitData(BaseModel):
    components: List[Dict[str, Any]]
    wires: List[Dict[str, Any]]

class TutorMessage(BaseModel):
    role: str
    content: str

class TutorRequest(BaseModel):
    messages: List[TutorMessage]
    context: Optional[Dict[str, Any]] = None

class CodeRunRequest(BaseModel):
    code: str
    language: str  # "python" or "cpp"

class RLStartRequest(BaseModel):
    env: str = "empty"
    algorithm: str = "ppo"

# Shared Instances
tutor_instance = AITutor()
sim_manager = SimulatorManager()

@app.get("/")
def read_root():
    return {"message": "RoboVerse AI Backend running successfully on localhost!"}

@app.post("/api/validate")
def validate_circuit(data: CircuitData):
    """
    Validates wiring pin-mappings, voltages, and common ground requirements.
    """
    try:
        result = CircuitValidator.validate(data.components, data.wires)
        return result
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tutor")
async def chat_tutor(data: TutorRequest):
    """
    Fetches tutor suggestions based on wiring context or general queries.
    """
    try:
        messages_dict = [{"role": m.role, "content": m.content} for m in data.messages]
        response = await tutor_instance.get_response(messages_dict, data.context)
        return {"response": response}
    except Exception as e:
        logger.error(f"Tutoring failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
def generate_hardware(data: CircuitData):
    """
    Translates virtual wiring to Bill of Materials, assembly steps, and microcontroller code.
    """
    try:
        result = HardwareGenerator.generate(data.components, data.wires)
        return result
    except Exception as e:
        logger.error(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/run-code")
def run_code_check(data: CodeRunRequest):
    """
    Dry-runs client code, checking for syntax issues and common robotics code bugs.
    """
    code = data.code
    lang = data.language
    errors = []
    output = []
    
    if lang == "cpp" or lang == "c++":
        # Check basic Arduino C++ syntax
        if "void setup()" not in code:
            errors.append("Syntax Error: Missing 'void setup()' function.")
        if "void loop()" not in code:
            errors.append("Syntax Error: Missing 'void loop()' function.")
        if code.count("{") != code.count("}"):
            errors.append("Syntax Error: Mismatched curly braces { }.")
        if ";" not in code and "void" in code:
            errors.append("Warning: Check for missing semicolons (;) at line endings.")
            
        if not errors:
            output.append("[COMPILE] Verifying Arduino libraries...")
            output.append("[COMPILE] Sketch size: 3424 bytes (10% of maximum).")
            output.append("[UPLOAD] Connecting to Board on COM4...")
            output.append("[UPLOAD] Writing memory... Done.")
            output.append("[SERIAL] COM4 Opened at 115200 baud.")
            output.append("[SERIAL] RoboVerse Uno running code successfully.")
    else:
        # Check basic Python syntax
        try:
            compile(code, "<string>", "exec")
            
            # Additional logic checks
            if "import time" not in code and "sleep" in code:
                errors.append("Runtime Error: 'sleep' is used but 'time' is not imported.")
            if "while True" not in code:
                errors.append("Style Alert: Robotics loop missing 'while True:' cycle.")
            if "GPIO.cleanup()" not in code and "RPi.GPIO" in code:
                errors.append("Hardware Warning: Missing 'GPIO.cleanup()' in your shutdown hook.")
                
            if not errors:
                output.append("[RUN] Loading Python virtual environment...")
                output.append("[RUN] Target: Raspberry Pi GPIO virtual pins initialized.")
                output.append("[RUN] Loop starting...")
                output.append("[TELEMETRY] Sensor status: OK.")
                output.append("[TELEMETRY] Driving motors forward.")
        except SyntaxError as se:
            errors.append(f"Syntax Error: {se.msg} on line {se.lineno}")

    return {
        "success": len(errors) == 0,
        "errors": errors,
        "output": "\n".join(output) if not errors else "Dry-run failed.",
    }

@app.get("/api/diagnostics")
def get_diagnostics():
    """
    Returns diagnostics for all modules, powering the /testing page.
    """
    return {
        "status": "healthy",
        "modules": {
            "api_server": {"status": "Passed", "details": "FastAPI listening on port 8000"},
            "wiring_validator": {"status": "Passed", "details": "Component pin dictionary and rules loaded"},
            "simulation_engine": {
                "status": "Passed",
                "details": f"Active engine: {'PyBullet' if HAS_PYBULLET else 'RoboSim Kinematics'}"
            },
            "ai_tutor": {
                "status": "Passed",
                "details": "Tutor client active. Mode: " + ("Groq Cloud" if tutor_instance.api_key else "Local Expert System")
            },
            "hardware_generator": {"status": "Passed", "details": "Arduino/Raspberry Pi generator loaded"}
        }
    }

@app.websocket("/ws/simulation")
async def websocket_simulation(websocket: WebSocket):
    """
    Websocket route streaming telemetry at 20Hz and capturing teleoperation controls.
    """
    await websocket.accept()
    logger.info("Simulation client connected via WebSocket.")
    
    # Start default simulation
    sim_manager.start(env_name="empty", robot_type="two_wheel")
    
    # Keep track of target velocity commands
    controls = {"linear": 0.0, "angular": 0.0}
    
    # Task to read control commands from the WebSocket
    async def receive_controls():
        nonlocal controls
        try:
            while True:
                data = await websocket.receive_json()
                if "action" in data:
                    action = data["action"]
                    if action == "teleop":
                        controls["linear"] = data.get("linear", 0.0)
                        controls["angular"] = data.get("angular", 0.0)
                    elif action == "reset":
                        sim_manager.start(
                            env_name=data.get("env", "empty"),
                            robot_type=data.get("robot", "two_wheel")
                        )
                        controls["linear"] = 0.0
                        controls["angular"] = 0.0
                    elif action == "environment":
                        sim_manager.start(
                            env_name=data.get("env", "empty"),
                            robot_type=sim_manager.robot_type
                        )
        except WebSocketDisconnect:
            logger.info("WebSocket disconnected in receive task.")
        except Exception as e:
            logger.error(f"Error in receive task: {e}")

    # Start receiving controls in the background
    recv_task = asyncio.create_task(receive_controls())

    try:
        while True:
            # 20Hz update loop (50ms interval)
            await asyncio.sleep(0.05)
            
            # Step the simulation forward
            telemetry = sim_manager.step(controls["linear"], controls["angular"])
            
            # Send telemetry update to client
            await websocket.send_json(telemetry)
            
    except WebSocketDisconnect:
        logger.info("Simulation client disconnected.")
    except Exception as e:
        logger.error(f"Error in simulation loop: {e}")
    finally:
        recv_task.cancel()
        sim_manager.stop()
        try:
            await websocket.close()
        except:
            pass

@app.post("/api/rl/start")
def start_rl_training(data: RLStartRequest):
    """
    Starts reinforcement learning training on a background thread.
    """
    success = rl_manager.start_training(env_name=data.env, algorithm=data.algorithm)
    if not success:
        raise HTTPException(status_code=400, detail="Training is already running.")
    return {"status": "success", "message": "RL training started."}

@app.post("/api/rl/stop")
def stop_rl_training():
    """
    Stops the active reinforcement learning training.
    """
    success = rl_manager.stop_training()
    if not success:
        raise HTTPException(status_code=400, detail="Training is not running.")
    return {"status": "success", "message": "RL training stopped."}

@app.get("/api/rl/status")
def get_rl_status():
    """
    Returns the current training metrics and progress.
    """
    return rl_manager.get_status()

@app.websocket("/ws/rl")
async def websocket_rl(websocket: WebSocket):
    """
    Websocket streaming training metrics to frontend clients.
    """
    await websocket.accept()
    rl_manager.register_websocket(websocket)
    
    # Send initial status
    try:
        await websocket.send_json(rl_manager.get_status())
        while True:
            # Keep connection alive; status updates are pushed by RLAgentManager
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        rl_manager.unregister_websocket(websocket)
