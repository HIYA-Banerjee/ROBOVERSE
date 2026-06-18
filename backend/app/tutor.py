import os
import httpx
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Expert responses dictionary for fallback when API key is missing
MOCK_EXPERT_DATABASE = {
    "ultrasonic": (
        "### HC-SR04 Ultrasonic Sensor\n\n"
        "An **Ultrasonic Sensor** measures distance by emitting high-frequency sound waves (40 kHz) "
        "and timing how long they take to bounce off an object and return.\n\n"
        "#### Pin Configuration:\n"
        "* **VCC**: Connects to 5V power supply.\n"
        "* **TRIG (Trigger)**: Input pin. Set HIGH for 10µs to send an acoustic pulse.\n"
        "* **ECHO**: Output pin. Sends a pulse whose width corresponds to the time taken for the echo to return.\n"
        "* **GND**: Connects to Ground (common ground).\n\n"
        "#### How it Works:\n"
        "1. Microcontroller sends a 10µs pulse to the TRIG pin.\n"
        "2. HC-SR04 emits 8 ultrasonic pulses.\n"
        "3. ECHO pin goes HIGH. It stays HIGH until the reflected wave is received.\n"
        "4. Calculate distance: `Distance = (Time ECHO was HIGH * Speed of Sound) / 2`.\n"
        "   * In centimeters: `Distance = (Duration_in_microseconds * 0.0343) / 2`."
    ),
    "dc_motor": (
        "### DC Motors and Motor Drivers (like L298N)\n\n"
        "A **DC Motor** converts electrical energy into mechanical rotation. Microcontrollers cannot supply "
        "enough current (typically 20mA max per pin) to power motors (which need 200mA to 2A+).\n\n"
        "#### Why use a Motor Driver?\n"
        "If you connect a DC motor directly to an Arduino pin, it will try to draw more current than the board "
        "can supply, damaging the microcontroller. A motor driver acts as a high-current switch, using logic signals "
        "from the controller to channel power from a battery directly to the motors.\n\n"
        "#### L298N Motor Driver Connections:\n"
        "* **12V / VS**: Connect to external power (battery +).\n"
        "* **GND**: Common ground (MUST connect to both Battery - and Arduino GND).\n"
        "* **5V**: Logic power output (can power the Arduino if jumped) or input.\n"
        "* **IN1, IN2, IN3, IN4**: Direction logic pins from Arduino digital pins.\n"
        "* **ENA, ENB**: Speed control (PWM) pins. Remove jumper and connect to Arduino PWM pins (e.g. D9, D10).\n"
        "* **OUT1, OUT2, OUT3, OUT4**: Connect to the DC motors."
    ),
    "ground": (
        "### The Importance of Common Ground (GND)\n\n"
        "A **Common Ground** is the universal reference point for voltage levels in your circuit.\n\n"
        "#### Why do we need it?\n"
        "Voltage is potential difference *between two points*. If a sensor is powered by a 9V battery and the "
        "Arduino is powered by a USB port, and they communicate via a signal wire, the Arduino cannot interpret the signal "
        "voltage because it doesn't know what '0V' is for the sensor. Connecting the sensor GND and Arduino GND "
        "aligns their reference points so that logic signals (0V = LOW, 5V/3.3V = HIGH) match perfectly. "
        "**Without a common ground, your signals will be extremely noisy or fail entirely.**"
    ),
    "not_moving": (
        "### Troubleshooting: Why is my robot not moving?\n\n"
        "Here is a step-by-step checklist to debug a stationary robot:\n\n"
        "1. **Common Ground check**: Is the Motor Driver's GND connected to the Arduino's GND? (Most common mistake!)\n"
        "2. **External Power**: Is the motor driver connected to a charged external battery (e.g. 7.4V LiPo or 9V)? Microcontrollers cannot power motors via USB.\n"
        "3. **Enable Jumpers**: Are the L298N ENA/ENB jumpers installed, or are they wired to PWM pins set to HIGH/speed value?\n"
        "4. **Logic Inputs**: Are you sending opposing signals? (e.g., IN1=HIGH and IN2=LOW moves forward; IN1=LOW and IN2=LOW stops).\n"
        "5. **Code Execution**: Is your microcontroller running? Add a blinking LED in your code to verify it is looping."
    ),
    "servo": (
        "### SG90 Servo Motors\n\n"
        "A **Servo Motor** is a closed-loop system containing a DC motor, gears, feedback potentiometer, and control circuit. "
        "It can rotate to specific angles (usually 0 to 180 degrees) based on a PWM (Pulse Width Modulation) signal.\n\n"
        "#### Wiring:\n"
        "* **Orange/Yellow**: Signal. Connect to a PWM-capable pin (e.g., D9 on Arduino Uno).\n"
        "* **Red**: VCC (5V).\n"
        "* **Brown/Black**: GND.\n\n"
        "#### Control Signal:\n"
        "Servos expect a pulse every 20 milliseconds (50Hz frequency):\n"
        "* **1.0ms pulse**: 0 degrees.\n"
        "* **1.5ms pulse**: 90 degrees (neutral).\n"
        "* **2.0ms pulse**: 180 degrees."
    ),
    "rl": (
        "### Reinforcement Learning in Robotics\n\n"
        "**Reinforcement Learning (RL)** trains a robot controller (policy) by letting it interact with the simulator (PyBullet) "
        "and learning from trial and error. The agent receives observations (sensors), takes actions (motor speeds), and gets rewards.\n\n"
        "#### Key Components:\n"
        "* **PPO (Proximal Policy Optimization)**: A policy gradient method popular in robotics due to its training stability and data efficiency.\n"
        "* **DQN (Deep Q-Network)**: Value-based method suited for discrete action spaces (e.g., Move Forward, Turn Left).\n"
        "* **Reward function**: Guides learning. E.g., `Reward = distance_to_target_gain - obstacle_penalty - time_penalty`."
    ),
    "general": (
        "### Welcome to RoboVerse AI Tutor!\n\n"
        "I am your virtual robotics lab assistant. Ask me questions about:\n"
        "* Wiring components (Arduino, Sensors, Actuators, Battery)\n"
        "* Pin mappings and voltage mismatches\n"
        "* Python and C++ robotics programming\n"
        "* Simulating robots using PyBullet/RoboSim\n"
        "* Reinforcement Learning (PPO/DQN)\n\n"
        "**Try asking**: *'How do I connect an ultrasonic sensor?'* or *'Why do I need a common ground?'*"
    )
}

class AITutor:
    def __init__(self):
        self.api_key = os.environ.get("GROQ_API_KEY", "")
        self.model = "mixtral-8x7b-32768"  # Fast, high-quality open model on Groq

    async def get_response(self, messages: List[Dict[str, str]], context: Dict[str, Any] = None) -> str:
        """
        Retrieves a tutor response, calling Groq if an API key is present,
        or using the localized expert system fallback.
        """
        # If API key exists, call Groq
        if self.api_key:
            try:
                system_message = {
                    "role": "system",
                    "content": (
                        "You are Antigravity-Tutor, a world-class robotics, circuit design, and embedded systems educator. "
                        "Help students debug wiring errors, write Arduino/Python code, understand sensor logic, and "
                        "simulate autonomous robots. Be direct, encourage physical debugging, and explain core electronics "
                        "concepts (voltage, current, PWM, ground) clearly. Format all responses in beautiful Markdown."
                    )
                }
                
                # Append context if available
                if context:
                    system_message["content"] += f"\n\nCurrent Circuit Context: {context}"

                payload = {
                    "model": self.model,
                    "messages": [system_message] + messages,
                    "temperature": 0.3,
                    "max_tokens": 1500
                }
                
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }

                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        json=payload,
                        headers=headers,
                        timeout=15.0
                    )
                    if response.status_code == 200:
                        data = response.json()
                        return data["choices"][0]["message"]["content"]
                    else:
                        logger.error(f"Groq API error: {response.text}")
            except Exception as e:
                logger.error(f"Failed to communicate with Groq: {e}")

        # Fallback to Local Expert System
        user_query = ""
        if messages:
            user_query = messages[-1].get("content", "").lower()

        # Match keywords in the query to find custom guides
        if "ultrasonic" in user_query or "hc-sr04" in user_query or "distance" in user_query:
            return MOCK_EXPERT_DATABASE["ultrasonic"]
        elif "dc motor" in user_query or "driver" in user_query or "l298n" in user_query or "motor" in user_query and "servo" not in user_query:
            return MOCK_EXPERT_DATABASE["dc_motor"]
        elif "ground" in user_query or "gnd" in user_query:
            return MOCK_EXPERT_DATABASE["ground"]
        elif "not moving" in user_query or "why isn't my" in user_query or "stuck" in user_query or "stop" in user_query:
            return MOCK_EXPERT_DATABASE["not_moving"]
        elif "servo" in user_query or "sg90" in user_query:
            return MOCK_EXPERT_DATABASE["servo"]
        elif "reinforcement" in user_query or "rl" in user_query or "ppo" in user_query or "dqn" in user_query:
            return MOCK_EXPERT_DATABASE["rl"]
        
        # Generic response
        return (
            "### RoboVerse AI Assistant (Local Mode)\n\n"
            f"I analyzed your question: *\"{messages[-1].get('content', '')}\"*\n\n"
            "Here is the relevant learning material from my local knowledge bank:\n\n"
            f"{MOCK_EXPERT_DATABASE['general']}"
        )
