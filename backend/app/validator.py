import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# Component pin definitions and requirements
COMPONENT_SPECS = {
    "arduino_uno": {
        "name": "Arduino Uno",
        "type": "controller",
        "pins": ["5V", "3.3V", "GND", "A0", "A1", "A2", "A3", "A4", "A5", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13"],
        "pwm_pins": ["D3", "D5", "D6", "D9", "D10", "D11"]
    },
    "arduino_nano": {
        "name": "Arduino Nano",
        "type": "controller",
        "pins": ["5V", "3.3V", "GND", "A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13"],
        "pwm_pins": ["D3", "D5", "D6", "D9", "D10", "D11"]
    },
    "esp32": {
        "name": "ESP32 DevKit",
        "type": "controller",
        "pins": ["3V3", "5V", "GND", "GPIO2", "GPIO4", "GPIO5", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO25", "GPIO26", "GPIO27", "GPIO32", "GPIO33", "GPIO34", "GPIO35"],
        "pwm_pins": ["GPIO2", "GPIO4", "GPIO5", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO25", "GPIO26", "GPIO27"]
    },
    "raspberry_pi": {
        "name": "Raspberry Pi 4",
        "type": "controller",
        "pins": ["5V", "3.3V", "GND", "GPIO2", "GPIO3", "GPIO4", "GPIO17", "GPIO27", "GPIO22", "GPIO10", "GPIO9", "GPIO11", "GPIO5", "GPIO6", "GPIO13", "GPIO19", "GPIO26"],
        "pwm_pins": ["GPIO12", "GPIO13", "GPIO18", "GPIO19"]
    },
    "ultrasonic": {
        "name": "Ultrasonic Sensor (HC-SR04)",
        "type": "sensor",
        "pins": ["VCC", "TRIG", "ECHO", "GND"],
        "voltage": 5.0
    },
    "ir": {
        "name": "IR Obstacle Sensor",
        "type": "sensor",
        "pins": ["VCC", "GND", "OUT"],
        "voltage": 3.3
    },
    "ldr": {
        "name": "LDR Light Sensor Module",
        "type": "sensor",
        "pins": ["VCC", "GND", "AO", "DO"],
        "voltage": 3.3
    },
    "camera": {
        "name": "Camera Module",
        "type": "sensor",
        "pins": ["VCC", "GND", "SDA", "SCL"],
        "voltage": 3.3
    },
    "gps": {
        "name": "GPS Module (NEO-6M)",
        "type": "sensor",
        "pins": ["VCC", "GND", "TX", "RX"],
        "voltage": 3.3
    },
    "temperature": {
        "name": "Temperature Sensor (DHT11)",
        "type": "sensor",
        "pins": ["VCC", "GND", "DATA"],
        "voltage": 3.3
    },
    "servo": {
        "name": "SG90 Servo Motor",
        "type": "actuator",
        "pins": ["PWM", "VCC", "GND"],
        "voltage": 5.0
    },
    "dc_motor": {
        "name": "DC Motor (Yellow Gear)",
        "type": "actuator",
        "pins": ["MOTOR+", "MOTOR-"],
        "voltage": 6.0
    },
    "motor_driver": {
        "name": "L298N Motor Driver",
        "type": "driver",
        "pins": ["12V", "5V", "GND", "OUT1", "OUT2", "OUT3", "OUT4", "IN1", "IN2", "IN3", "IN4", "ENA", "ENB"],
        "voltage": 12.0
    },
    "stepper_motor": {
        "name": "28BYJ-48 Stepper Motor",
        "type": "actuator",
        "pins": ["IN1", "IN2", "IN3", "IN4", "5V", "GND"],
        "voltage": 5.0
    },
    "battery": {
        "name": "9V Battery",
        "type": "power",
        "pins": ["V+", "V-"],
        "voltage": 9.0
    },
    "power_supply": {
        "name": "5V Power Supply Module",
        "type": "power",
        "pins": ["5V", "GND"],
        "voltage": 5.0
    }
}

class CircuitValidator:
    @staticmethod
    def validate(components: List[Dict[str, Any]], wires: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validates the circuit connection map.
        components format: [{"id": "c1", "type": "arduino_uno"}]
        wires format: [{"id": "w1", "from": "c1", "fromPin": "5V", "to": "c2", "toPin": "VCC"}]
        """
        errors = []
        warnings = []
        info = []

        comp_dict = {c["id"]: c for c in components}
        
        # Build node pin mapping to find who is connected to what
        pin_connections = {}
        for c_id in comp_dict:
            pin_connections[c_id] = {}

        for w in wires:
            f_id, f_pin = w.get("from"), w.get("fromPin")
            t_id, t_pin = w.get("to"), w.get("toPin")
            if f_id and f_pin and t_id and t_pin:
                if f_pin not in pin_connections[f_id]:
                    pin_connections[f_id][f_pin] = []
                pin_connections[f_id][f_pin].append((t_id, t_pin))

                if t_pin not in pin_connections[t_id]:
                    pin_connections[t_id][t_pin] = []
                pin_connections[t_id][t_pin].append((f_id, f_pin))

        # Check: Common Ground
        controllers = [c for c in components if COMPONENT_SPECS.get(c["type"], {}).get("type") == "controller"]
        gnd_components = []
        for c in components:
            has_gnd_conn = False
            for p in pin_connections.get(c["id"], {}):
                if "GND" in p or "V-" in p or p == "GND":
                    # Check if it connects to a controller ground or power supply ground
                    for dst_id, dst_pin in pin_connections[c["id"]][p]:
                        if "GND" in dst_pin or "V-" in dst_pin or dst_pin == "GND":
                            has_gnd_conn = True
            if has_gnd_conn:
                gnd_components.append(c["id"])

        if len(components) > 1 and len(gnd_components) < len(components):
            missing_gnd = [comp_dict[cid]["type"] for cid in comp_dict if cid not in gnd_components]
            warnings.append({
                "code": "MISSING_COMMON_GND",
                "message": f"Potential missing common ground. Components {', '.join(missing_gnd)} do not seem to share a GND connection. A common ground is required for stable logic signals.",
                "severity": "warning"
            })

        # Check for DC Motor direct connections to Microcontrollers
        dc_motors = [c for c in components if c["type"] == "dc_motor"]
        for motor in dc_motors:
            motor_id = motor["id"]
            direct_controller_conn = False
            has_driver_conn = False

            for pin in ["MOTOR+", "MOTOR-"]:
                conns = pin_connections.get(motor_id, {}).get(pin, [])
                for dest_id, dest_pin in conns:
                    dest_type = comp_dict.get(dest_id, {}).get("type", "")
                    if COMPONENT_SPECS.get(dest_type, {}).get("type") == "controller":
                        direct_controller_conn = True
                    if dest_type == "motor_driver":
                        has_driver_conn = True

            if direct_controller_conn:
                errors.append({
                    "code": "DIRECT_MOTOR_TO_MCU",
                    "message": "CRITICAL: DC Motor is connected directly to a Microcontroller IO pin! Drawing high current directly from microcontroller IO pins will permanently damage/fry the board. Please use a Motor Driver (e.g. L298N) between them.",
                    "severity": "error"
                })
            elif not has_driver_conn and len(wires) > 0:
                warnings.append({
                    "code": "MOTOR_WITHOUT_DRIVER",
                    "message": "DC Motor is not connected to a Motor Driver. DC Motors require driver boards to handle high current draw.",
                    "severity": "warning"
                })

        # Check voltage match for sensors
        sensors = [c for c in components if COMPONENT_SPECS.get(c["type"], {}).get("type") == "sensor"]
        for s in sensors:
            s_id = s["id"]
            s_type = s["type"]
            spec = COMPONENT_SPECS.get(s_type, {})
            req_voltage = spec.get("voltage", 5.0)

            # Look at VCC pin
            vcc_conns = pin_connections.get(s_id, {}).get("VCC", [])
            connected_voltage = None
            for dst_id, dst_pin in vcc_conns:
                dst_type = comp_dict.get(dst_id, {}).get("type", "")
                if dst_type in COMPONENT_SPECS:
                    # If connected to controller 5V or 3.3V
                    if dst_pin == "5V":
                        connected_voltage = 5.0
                    elif dst_pin == "3.3V" or dst_pin == "3V3":
                        connected_voltage = 3.3
                    elif dst_pin == "V+" and dst_type == "battery":
                        connected_voltage = 9.0

            if len(vcc_conns) == 0:
                warnings.append({
                    "code": "SENSOR_NO_POWER",
                    "message": f"Sensor '{spec.get('name')}' is missing VCC power connection.",
                    "severity": "warning"
                })
            elif connected_voltage is not None:
                if connected_voltage > req_voltage + 0.5:
                    errors.append({
                        "code": "VOLTAGE_OVERLOAD",
                        "message": f"Voltage Mismatch: Sensor '{spec.get('name')}' (VCC max {req_voltage}V) is powered by {connected_voltage}V. This will overload and damage the sensor.",
                        "severity": "error"
                    })
                elif connected_voltage < req_voltage - 0.5:
                    warnings.append({
                        "code": "VOLTAGE_UNDERLOAD",
                        "message": f"Voltage Warning: Sensor '{spec.get('name')}' (requires {req_voltage}V) is connected to {connected_voltage}V. It may operate erratically or fail to trigger.",
                        "severity": "warning"
                    })

        # Check PWM pin connection for Servos
        servos = [c for c in components if c["type"] == "servo"]
        for servo in servos:
            servo_id = servo["id"]
            pwm_conns = pin_connections.get(servo_id, {}).get("PWM", [])
            for dst_id, dst_pin in pwm_conns:
                dst_type = comp_dict.get(dst_id, {}).get("type", "")
                dst_spec = COMPONENT_SPECS.get(dst_type, {})
                if dst_spec.get("type") == "controller":
                    pwm_pins = dst_spec.get("pwm_pins", [])
                    if dst_pin not in pwm_pins:
                        warnings.append({
                            "code": "NON_PWM_SERVO_PIN",
                            "message": f"Servo control connected to non-PWM pin '{dst_pin}' on {dst_spec.get('name')}. Servo control requires PWM signal for variable angle control.",
                            "severity": "warning"
                        })

        # Check ESP32/Raspberry Pi IO limits (ESP32 / Pi are 3.3V logic)
        for c in components:
            if c["type"] in ["esp32", "raspberry_pi"]:
                c_id = c["id"]
                # If a 5V sensor's output pin goes directly to ESP32 input pin, warn about 5V logic overload
                for pin in pin_connections.get(c_id, {}):
                    if pin.startswith("GPIO"):
                        conns = pin_connections[c_id][pin]
                        for dst_id, dst_pin in conns:
                            dst_type = comp_dict.get(dst_id, {}).get("type", "")
                            dst_spec = COMPONENT_SPECS.get(dst_type, {})
                            if dst_type == "ultrasonic" and dst_pin == "ECHO":
                                errors.append({
                                    "code": "LOGIC_LEVEL_MISMATCH",
                                    "message": f"Logic level mismatch: Ultrasonic Echo (5V logic) is connected to {c['type'].upper()} {pin} (3.3V logic max). You must use a voltage divider (1k & 2k resistors) or logic level converter to protect the pin.",
                                    "severity": "error"
                                })

        if len(errors) == 0 and len(warnings) == 0 and len(components) > 0:
            info.append({
                "code": "CIRCUIT_OK",
                "message": "Circuit validation passed. Power, Ground, and digital signal configurations are valid.",
                "severity": "info"
            })

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "info": info
        }
