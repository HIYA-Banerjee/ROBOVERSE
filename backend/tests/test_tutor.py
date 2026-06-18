import unittest
import asyncio
from app.tutor import AITutor

class TestAITutor(unittest.TestCase):
    def setUp(self):
        self.tutor = AITutor()
        # Force empty key for testing local fallback system specifically
        self.tutor.api_key = ""

    def test_ultrasonic_fallback(self):
        """
        Verify that queries about ultrasonic sensors return the HC-SR04 guide.
        """
        messages = [{"role": "user", "content": "How do I wire an ultrasonic sensor?"}]
        response = asyncio.run(self.tutor.get_response(messages))
        self.assertIn("HC-SR04 Ultrasonic Sensor", response)
        self.assertIn("TRIG", response)
        self.assertIn("ECHO", response)

    def test_ground_fallback(self):
        """
        Verify that queries containing 'ground' or 'GND' trigger ground alignment guides.
        """
        messages = [{"role": "user", "content": "Why do we need a common ground GND?"}]
        response = asyncio.run(self.tutor.get_response(messages))
        self.assertIn("Common Ground (GND)", response)
        self.assertIn("0V", response)

    def test_motor_fallback(self):
        """
        Verify motor and driver queries trigger driver checklists.
        """
        messages = [{"role": "user", "content": "Explain the L298N motor driver connection"}]
        response = asyncio.run(self.tutor.get_response(messages))
        self.assertIn("L298N Motor Driver", response)
        self.assertIn("Motor Driver", response)

    def test_generic_fallback(self):
        """
        Verify generic query fallback returns general list.
        """
        messages = [{"role": "user", "content": "Hello! Introduce yourself."}]
        response = asyncio.run(self.tutor.get_response(messages))
        self.assertIn("RoboVerse AI Tutor!", response)
        self.assertIn("RoboVerse AI Tutor", response)

if __name__ == "__main__":
    unittest.main()
