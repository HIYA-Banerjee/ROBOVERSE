import unittest
from app.validator import CircuitValidator

class TestCircuitValidator(unittest.TestCase):
    def test_empty_circuit(self):
        """
        Verify that an empty components list passes validation as active but info-free.
        """
        result = CircuitValidator.validate([], [])
        self.assertTrue(result["valid"])
        self.assertEqual(len(result["errors"]), 0)
        self.assertEqual(len(result["warnings"]), 0)

    def test_missing_common_ground(self):
        """
        Verify warning is raised when there are components without a shared ground reference.
        """
        components = [
            {"id": "c1", "type": "arduino_uno"},
            {"id": "c2", "type": "ultrasonic"}
        ]
        # Wire only VCC, no GND wired
        wires = [
            {"id": "w1", "from": "c1", "fromPin": "5V", "to": "c2", "toPin": "VCC"}
        ]
        result = CircuitValidator.validate(components, wires)
        self.assertTrue(result["valid"]) # Still valid, but raises a warning
        self.assertTrue(any(w["code"] == "MISSING_COMMON_GND" for w in result["warnings"]))

    def test_direct_motor_to_mcu(self):
        """
        Verify that connecting a high-current DC motor directly to MCU IO pin raises a critical error.
        """
        components = [
            {"id": "c1", "type": "arduino_uno"},
            {"id": "c2", "type": "dc_motor"}
        ]
        wires = [
            {"id": "w1", "from": "c1", "fromPin": "D3", "to": "c2", "toPin": "MOTOR+"}
        ]
        result = CircuitValidator.validate(components, wires)
        self.assertFalse(result["valid"])
        self.assertTrue(any(e["code"] == "DIRECT_MOTOR_TO_MCU" for e in result["errors"]))

    def test_voltage_overload(self):
        """
        Verify that connecting a 3.3V sensor to 9V battery raises a voltage overload error.
        """
        components = [
            {"id": "c1", "type": "battery"},
            {"id": "c2", "type": "ir"} # IR is 3.3V spec
        ]
        wires = [
            {"id": "w1", "from": "c1", "fromPin": "V+", "to": "c2", "toPin": "VCC"}
        ]
        result = CircuitValidator.validate(components, wires)
        self.assertFalse(result["valid"])
        self.assertTrue(any(e["code"] == "VOLTAGE_OVERLOAD" for e in result["errors"]))

    def test_logic_level_mismatch(self):
        """
        Verify that connecting a 5V logic ECHO signal directly to a 3.3V GPIO input of ESP32 raises logic mismatch error.
        """
        components = [
            {"id": "c1", "type": "esp32"},
            {"id": "c2", "type": "ultrasonic"} # 5V device
        ]
        wires = [
            {"id": "w1", "from": "c1", "fromPin": "GPIO4", "to": "c2", "toPin": "ECHO"}
        ]
        result = CircuitValidator.validate(components, wires)
        self.assertFalse(result["valid"])
        self.assertTrue(any(e["code"] == "LOGIC_LEVEL_MISMATCH" for e in result["errors"]))

if __name__ == "__main__":
    unittest.main()
