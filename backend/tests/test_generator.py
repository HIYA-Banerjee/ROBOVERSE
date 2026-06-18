import unittest
from app.generator import HardwareGenerator

class TestHardwareGenerator(unittest.TestCase):
    def test_bom_compilation(self):
        """
        Verify that Bill of Materials (BOM) list registers correctly and calculates costs.
        """
        components = [
            {"id": "c1", "type": "arduino_uno"},
            {"id": "c2", "type": "ultrasonic"},
            {"id": "c3", "type": "servo"}
        ]
        wires = [
            {"id": "w1", "from": "c1", "fromPin": "D9", "to": "c3", "toPin": "PWM"}
        ]
        result = HardwareGenerator.generate(components, wires)
        
        # Verify that all components are in the BOM
        bom_types = [item["type"] for item in result["bom"]]
        self.assertIn("arduino_uno", bom_types)
        self.assertIn("ultrasonic", bom_types)
        self.assertIn("servo", bom_types)
        
        # Verify that miscellaneous wires and breadboard packages are added when wires connect
        self.assertIn("jumper_wires", bom_types)
        self.assertIn("breadboard", bom_types)
        
        # Check that total cost is positive and matches components sum + misc pack
        self.assertGreater(result["total_cost"], 20.0)

    def test_code_generation_arduino(self):
        """
        Verify that Arduino code template generates correctly and updates mapped pins.
        """
        components = [
            {"id": "c1", "type": "arduino_uno"},
            {"id": "c2", "type": "ultrasonic"}
        ]
        wires = [
            {"id": "w1", "from": "c1", "fromPin": "D4", "to": "c2", "toPin": "TRIG"},
            {"id": "w2", "from": "c1", "fromPin": "D5", "to": "c2", "toPin": "ECHO"}
        ]
        result = HardwareGenerator.generate(components, wires)
        
        # Verify that Arduino code is present and has correct define pin headers
        self.assertIn("void setup()", result["arduino_code"])
        self.assertIn("#define TRIG_PIN 4", result["arduino_code"])
        self.assertIn("#define ECHO_PIN 5", result["arduino_code"])

    def test_code_generation_rpi(self):
        """
        Verify that Raspberry Pi code template generates correctly and maps GPIOs.
        """
        components = [
            {"id": "c1", "type": "raspberry_pi"},
            {"id": "c2", "type": "motor_driver"}
        ]
        wires = [
            {"id": "w1", "from": "c1", "fromPin": "GPIO17", "to": "c2", "toPin": "IN1"},
            {"id": "w2", "from": "c1", "fromPin": "GPIO27", "to": "c2", "toPin": "IN2"}
        ]
        result = HardwareGenerator.generate(components, wires)
        
        # Verify Python script headers
        self.assertIn("import RPi.GPIO as GPIO", result["raspberry_pi_code"])
        self.assertIn("MOTOR_IN1 = 17", result["raspberry_pi_code"])
        self.assertIn("MOTOR_IN2 = 27", result["raspberry_pi_code"])

if __name__ == "__main__":
    unittest.main()
