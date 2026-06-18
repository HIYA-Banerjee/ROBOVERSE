import json
from typing import Dict, Any, List

COMPONENT_COSTS = {
    "arduino_uno": {"name": "Arduino Uno R3", "cost": 15.00, "link": "https://store.arduino.cc/products/arduino-uno-rev3"},
    "arduino_nano": {"name": "Arduino Nano", "cost": 10.00, "link": "https://store.arduino.cc/products/arduino-nano"},
    "esp32": {"name": "ESP32 DevKit V1", "cost": 6.50, "link": "https://www.amazon.com/s?k=esp32+devkit+v1"},
    "raspberry_pi": {"name": "Raspberry Pi 4 Model B (4GB)", "cost": 55.00, "link": "https://www.raspberrypi.com/products/raspberry-pi-4-model-b/"},
    "ultrasonic": {"name": "HC-SR04 Ultrasonic Distance Sensor", "cost": 3.00, "link": "https://www.amazon.com/s?k=hc-sr04"},
    "ir": {"name": "IR Obstacle Avoidance Sensor Module", "cost": 1.50, "link": "https://www.amazon.com/s?k=ir+sensor+module+robot"},
    "ldr": {"name": "LDR Photoresistor Module", "cost": 1.20, "link": "https://www.amazon.com/s?k=ldr+sensor+module"},
    "camera": {"name": "ESP32-CAM or RPi Camera Module", "cost": 9.00, "link": "https://www.amazon.com/s?k=rpi+camera+module"},
    "gps": {"name": "NEO-6M GPS Module", "cost": 12.00, "link": "https://www.amazon.com/s?k=neo-6m+gps+module"},
    "temperature": {"name": "DHT11 Temperature & Humidity Sensor", "cost": 2.50, "link": "https://www.amazon.com/s?k=dht11+sensor"},
    "servo": {"name": "SG90 9g Micro Servo Motor", "cost": 3.50, "link": "https://www.amazon.com/s?k=sg90+servo"},
    "dc_motor": {"name": "TT Motor Gearbox DC Motor (Dual Shaft)", "cost": 2.50, "link": "https://www.amazon.com/s?k=tt+motor+dc"},
    "motor_driver": {"name": "L298N Dual H-Bridge Motor Driver Module", "cost": 4.50, "link": "https://www.amazon.com/s?k=l298n+motor+driver"},
    "stepper_motor": {"name": "28BYJ-48 Stepper Motor + ULN2003 Driver", "cost": 5.00, "link": "https://www.amazon.com/s?k=28byj-48+uln2003"},
    "battery": {"name": "9V Alkaline Battery or 7.4V LiPo Pack", "cost": 6.00, "link": "https://www.amazon.com/s?k=lipo+battery+7.4v+robot"},
    "power_supply": {"name": "Breadboard Power Supply Module 3.3V/5V", "cost": 3.00, "link": "https://www.amazon.com/s?k=breadboard+power+supply+module"}
}

class HardwareGenerator:
    @staticmethod
    def generate(components: List[Dict[str, Any]], wires: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generates Bill of Materials, assembly guide, wiring checklist,
        and custom code based on the virtual circuit design.
        """
        # 1. Generate BOM (Bill of Materials)
        bom = []
        total_cost = 0.0
        
        comp_dict = {c["id"]: c for c in components}
        
        # Count components of each type
        counts = {}
        for c in components:
            ctype = c["type"]
            counts[ctype] = counts.get(ctype, 0) + 1

        for ctype, qty in counts.items():
            spec = COMPONENT_COSTS.get(ctype, {"name": f"Unknown Component ({ctype})", "cost": 5.00, "link": "#"})
            item_cost = spec["cost"] * qty
            total_cost += item_cost
            bom.append({
                "type": ctype,
                "name": spec["name"],
                "qty": qty,
                "unit_cost": spec["cost"],
                "total_cost": item_cost,
                "purchase_link": spec["link"]
            })

        # Add miscellaneous items (breadboard, jumper wires) if there are connections
        if len(wires) > 0:
            bom.append({
                "type": "jumper_wires",
                "name": "Jumper Wires M-M / M-F / F-F Pack",
                "qty": 1,
                "unit_cost": 3.50,
                "total_cost": 3.50,
                "purchase_link": "https://www.amazon.com/s?k=jumper+wires"
            })
            bom.append({
                "type": "breadboard",
                "name": "Solderless Breadboard (830 Points)",
                "qty": 1,
                "unit_cost": 5.00,
                "total_cost": 5.00,
                "purchase_link": "https://www.amazon.com/s?k=solderless+breadboard"
            })
            total_cost += 8.50

        # 2. Build pin connections map
        pin_connections = {}
        for c_id in comp_dict:
            pin_connections[c_id] = {}

        for w in wires:
            f_id, f_pin = w.get("from"), w.get("fromPin")
            t_id, t_pin = w.get("to"), w.get("toPin")
            if f_id and f_pin and t_id and t_pin:
                if f_pin not in pin_connections[f_id]: pin_connections[f_id][f_pin] = []
                pin_connections[f_id][f_pin].append((t_id, t_pin))
                if t_pin not in pin_connections[t_id]: pin_connections[t_id][t_pin] = []
                pin_connections[t_id][t_pin].append((f_id, f_pin))

        # 3. Create step-by-step assembly guide
        steps = [
            "Gather all components listed in the Bill of Materials (BOM).",
            "Prepare a clean workspace. Keep your USB cables and batteries unplugged during wiring."
        ]
        
        # Power & GND connections steps
        steps.append("Connect all Ground (GND / V- / negative) pins to create a common reference plane.")
        
        controller_id = None
        controller_type = None
        for c in components:
            if c["type"] in ["arduino_uno", "arduino_nano", "esp32", "raspberry_pi"]:
                controller_id = c["id"]
                controller_type = c["type"]
                break

        if controller_type:
            steps.append(f"Place the {comp_dict[controller_id]['type'].replace('_', ' ').upper()} controller in a central spot or mount it onto your chassis.")

        # Add steps for specific sensors/actuators
        wiring_checklist = []
        for w in wires:
            f_name = comp_dict.get(w["from"], {}).get("type", "Unknown").replace("_", " ").title()
            t_name = comp_dict.get(w["to"], {}).get("type", "Unknown").replace("_", " ").title()
            wiring_checklist.append(
                f"Connect {f_name} Pin [{w['fromPin']}] ──> {t_name} Pin [{w['toPin']}]"
            )

        for c_id, c in comp_dict.items():
            if c["type"] == "ultrasonic":
                steps.append("Ultrasonic Sensor: Align HC-SR04 facing forward on the chassis. Hook up VCC to 5V, GND to Ground, and map TRIG and ECHO to controller digital IO pins.")
            elif c["type"] == "servo":
                steps.append("Servo Motor: Attach the servo horn. Hook up Red wire (VCC) to 5V, Brown wire (GND) to GND, and Orange wire (PWM) to a PWM-enabled digital IO pin.")
            elif c["type"] == "motor_driver":
                steps.append("L298N Motor Driver: Wire the DC motor terminals to OUT1/OUT2 or OUT3/OUT4. Route control pins (IN1-IN4, ENA, ENB) to your microcontroller. Feed 12V terminal with external battery power.")

        steps.append("Perform a visual inspection: ensure there are no short circuits between power rails (VCC and GND).")
        steps.append("Connect the microcontroller to your computer via USB to compile and upload the control program.")
        steps.append("Plug in the external battery pack (e.g. 7.4V/9V) to the motor driver to power your actuators.")

        # 4. Generate Arduino / Python Source Code dynamically based on active wiring
        arduino_code = HardwareGenerator._generate_arduino_code(comp_dict, pin_connections)
        rpi_code = HardwareGenerator._generate_python_code(comp_dict, pin_connections)

        return {
            "bom": bom,
            "total_cost": round(total_cost, 2),
            "steps": steps,
            "wiring_checklist": wiring_checklist,
            "arduino_code": arduino_code,
            "raspberry_pi_code": rpi_code
        }

    @staticmethod
    def _generate_arduino_code(comp_dict: Dict[str, Any], pin_connections: Dict[str, Any]) -> str:
        # Check if there is an ultrasonic sensor connected to an Arduino
        arduino_id = None
        for cid, c in comp_dict.items():
            if c["type"] in ["arduino_uno", "arduino_nano"]:
                arduino_id = cid
                break

        if not arduino_id:
            return (
                "// RoboVerse Virtual-to-Physical Code Generator\n"
                "// No Arduino board detected in your workspace design.\n"
                "void setup() {\n"
                "  Serial.begin(9600);\n"
                "}\n\n"
                "void loop() {\n"
                "  Serial.println(\"Add a microcontroller in the Robot Builder to generate code.\");\n"
                "  delay(1000);\n"
                "}"
            )

        # Detect pins mapped on Arduino
        trig_pin = "2"
        echo_pin = "3"
        servo_pin = "9"
        motor_ena = "5"
        motor_in1 = "6"
        motor_in2 = "7"

        # Let's inspect active pins connected to the Arduino
        ard_connections = pin_connections.get(arduino_id, {})
        for pin, conns in ard_connections.items():
            for dest_id, dest_pin in conns:
                dtype = comp_dict.get(dest_id, {}).get("type", "")
                if dtype == "ultrasonic":
                    if dest_pin == "TRIG": trig_pin = pin.replace("D", "")
                    if dest_pin == "ECHO": echo_pin = pin.replace("D", "")
                elif dtype == "servo":
                    if dest_pin == "PWM": servo_pin = pin.replace("D", "")
                elif dtype == "motor_driver":
                    if dest_pin == "ENA": motor_ena = pin.replace("D", "")
                    if dest_pin == "IN1": motor_in1 = pin.replace("D", "")
                    if dest_pin == "IN2": motor_in2 = pin.replace("D", "")

        code = f"""// Generated by RoboVerse AI - Virtual-to-Physical Generator
// Target Board: Arduino Uno / Nano

#include <Servo.h>

// Sensor Pins
#define TRIG_PIN {trig_pin}
#define ECHO_PIN {echo_pin}

// Actuator Pins
#define SERVO_PIN {servo_pin}
#define MOTOR_ENA {motor_ena}
#define MOTOR_IN1 {motor_in1}
#define MOTOR_IN2 {motor_in2}

Servo myServo;

void setup() {{
  Serial.begin(115200);
  
  // Ultrasonic Sensor setup
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  // DC Motor control setup
  pinMode(MOTOR_ENA, OUTPUT);
  pinMode(MOTOR_IN1, OUTPUT);
  pinMode(MOTOR_IN2, OUTPUT);
  
  // Servo setup
  myServo.attach(SERVO_PIN);
  myServo.write(90); // Center position
  
  Serial.println("RoboVerse Physical Robot Initialized!");
}}

long readDistance() {{
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  if (duration == 0) return 400; // Return max distance on timeout
  return duration * 0.0343 / 2;
}}

void loop() {{
  long distance = readDistance();
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  // Basic Obstacle Avoidance logic
  if (distance < 20 && distance > 0) {{
    Serial.println("Obstacle Alert! Stopping and searching...");
    // Stop Motor
    analogWrite(MOTOR_ENA, 0);
    digitalWrite(MOTOR_IN1, LOW);
    digitalWrite(MOTOR_IN2, LOW);
    delay(500);
    
    // Look Left
    myServo.write(45);
    delay(600);
    long distLeft = readDistance();
    
    // Look Right
    myServo.write(135);
    delay(600);
    long distRight = readDistance();
    
    // Center servo
    myServo.write(90);
    delay(300);
    
    if (distRight > distLeft) {{
      Serial.println("Turning Right...");
      analogWrite(MOTOR_ENA, 180);
      digitalWrite(MOTOR_IN1, LOW);
      digitalWrite(MOTOR_IN2, HIGH);
      delay(800);
    }} else {{
      Serial.println("Turning Left...");
      analogWrite(MOTOR_ENA, 180);
      digitalWrite(MOTOR_IN1, HIGH);
      digitalWrite(MOTOR_IN2, LOW);
      delay(800);
    }}
  }} else {{
    // Drive Forward
    analogWrite(MOTOR_ENA, 150); // Speed 0-255
    digitalWrite(MOTOR_IN1, HIGH);
    digitalWrite(MOTOR_IN2, LOW);
  }}
  
  delay(100);
}}
"""
        return code

    @staticmethod
    def _generate_python_code(comp_dict: Dict[str, Any], pin_connections: Dict[str, Any]) -> str:
        # Checks for Raspberry Pi configuration
        rpi_id = None
        for cid, c in comp_dict.items():
            if c["type"] == "raspberry_pi":
                rpi_id = cid
                break

        if not rpi_id:
            return (
                "# RoboVerse Virtual-to-Physical Code Generator\n"
                "# No Raspberry Pi board detected in your workspace design.\n"
                "import time\n\n"
                "while True:\n"
                "    print('Add a Raspberry Pi controller in your builder workspace to generate Python code.')\n"
                "    time.sleep(1)\n"
            )

        # RPi pins (using BCM pin naming)
        trig_pin = "23"
        echo_pin = "24"
        motor_in1 = "17"
        motor_in2 = "27"
        motor_ena = "12" # PWM

        ard_connections = pin_connections.get(rpi_id, {})
        for pin, conns in ard_connections.items():
            for dest_id, dest_pin in conns:
                dtype = comp_dict.get(dest_id, {}).get("type", "")
                if dtype == "ultrasonic":
                    if dest_pin == "TRIG": trig_pin = pin.replace("GPIO", "")
                    if dest_pin == "ECHO": echo_pin = pin.replace("GPIO", "")
                elif dtype == "motor_driver":
                    if dest_pin == "IN1": motor_in1 = pin.replace("GPIO", "")
                    if dest_pin == "IN2": motor_in2 = pin.replace("GPIO", "")
                    if dest_pin == "ENA": motor_ena = pin.replace("GPIO", "")

        code = f"""# Generated by RoboVerse AI - Virtual-to-Physical Generator
# Target Board: Raspberry Pi 4 (Python 3)
# Uses RPi.GPIO library

import RPi.GPIO as GPIO
import time

# Pin Definitions (BCM numbering)
TRIG_PIN = {trig_pin}
ECHO_PIN = {echo_pin}
MOTOR_IN1 = {motor_in1}
MOTOR_IN2 = {motor_in2}
MOTOR_ENA = {motor_ena}

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# Configure IO Direction
GPIO.setup(TRIG_PIN, GPIO.OUT)
GPIO.setup(ECHO_PIN, GPIO.IN)
GPIO.setup(MOTOR_IN1, GPIO.OUT)
GPIO.setup(MOTOR_IN2, GPIO.OUT)
GPIO.setup(MOTOR_ENA, GPIO.OUT)

# Initialize PWM on Speed pin
motor_pwm = GPIO.PWM(MOTOR_ENA, 1000) # 1kHz frequency
motor_pwm.start(0) # Off initially

print("RoboVerse RPi Physical Robot Initialized!")

def read_distance():
    GPIO.output(TRIG_PIN, True)
    time.sleep(0.00001) # 10us pulse
    GPIO.output(TRIG_PIN, False)
    
    pulse_start = time.time()
    pulse_end = time.time()
    
    timeout = time.time()
    while GPIO.input(ECHO_PIN) == 0:
        pulse_start = time.time()
        if pulse_start - timeout > 0.03:
            return 400.0 # Timeout
            
    while GPIO.input(ECHO_PIN) == 1:
        pulse_end = time.time()
        
    pulse_duration = pulse_end - pulse_start
    distance = pulse_duration * 34300 / 2 # cm
    return round(distance, 1)

try:
    while True:
        distance = read_distance()
        print(f"Current Distance: {{distance}} cm")
        
        if distance < 20.0:
            print("Obstacle Detected! Stopping and turning...")
            # Stop
            GPIO.output(MOTOR_IN1, GPIO.LOW)
            GPIO.output(MOTOR_IN2, GPIO.LOW)
            motor_pwm.ChangeDutyCycle(0)
            time.sleep(0.5)
            
            # Spin left to evade
            GPIO.output(MOTOR_IN1, GPIO.LOW)
            GPIO.output(MOTOR_IN2, GPIO.HIGH)
            motor_pwm.ChangeDutyCycle(60) # 60% speed
            time.sleep(0.8)
        else:
            # Move Forward
            GPIO.output(MOTOR_IN1, GPIO.HIGH)
            GPIO.output(MOTOR_IN2, GPIO.LOW)
            motor_pwm.ChangeDutyCycle(50) # 50% speed
            
        time.sleep(0.1)

except KeyboardInterrupt:
    print("Stopping robot...")
finally:
    motor_pwm.stop()
    GPIO.cleanup()
"""
        return code
