import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_read_root(self):
        """
        Test that root path responds with success.
        """
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("RoboVerse AI", response.json()["message"])

    def test_diagnostics_endpoint(self):
        """
        Test that /api/diagnostics responds with healthy states.
        """
        response = self.client.get("/api/diagnostics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("api_server", data["modules"])
        self.assertEqual(data["modules"]["api_server"]["status"], "Passed")

    def test_circuit_validate_endpoint(self):
        """
        Test that validate endpoint works with POST data.
        """
        payload = {
            "components": [
                {"id": "uno_1", "type": "arduino_uno"},
                {"id": "sensor_1", "type": "ultrasonic"}
            ],
            "wires": [
                {"id": "w1", "from": "uno_1", "fromPin": "GND", "to": "sensor_1", "toPin": "GND"},
                {"id": "w2", "from": "uno_1", "fromPin": "5V", "to": "sensor_1", "toPin": "VCC"}
            ]
        }
        response = self.client.post("/api/validate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["valid"])

    def test_tutor_endpoint(self):
        """
        Test that AI Tutor endpoint handles chat payload.
        """
        payload = {
            "messages": [
                {"role": "user", "content": "How do I wire an ultrasonic sensor?"}
            ],
            "context": None
        }
        response = self.client.post("/api/tutor", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertIn("response", response.json())
        self.assertIn("HC-SR04", response.json()["response"])

    def test_generate_endpoint(self):
        """
        Test that generator compiles BOM and files.
        """
        payload = {
            "components": [
                {"id": "uno_1", "type": "arduino_uno"}
            ],
            "wires": []
        }
        response = self.client.post("/api/generate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("bom", data)
        self.assertIn("total_cost", data)
        self.assertIn("arduino_code", data)

    def test_run_code_cpp(self):
        """
        Test compiler dry-run with C++ sketch.
        """
        # Test missing loop
        payload = {
            "code": "void setup() {}",
            "language": "cpp"
        }
        response = self.client.post("/api/run-code", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["success"])
        self.assertTrue(any("loop" in err for err in response.json()["errors"]))

        # Test valid loop/setup
        payload = {
            "code": "void setup() { Serial.begin(9600); } void loop() {}",
            "language": "cpp"
        }
        response = self.client.post("/api/run-code", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])

    def test_rl_endpoints_flow(self):
        """
        Test the starting, status checks, and stopping workflow of RL training.
        """
        # Get status initially (should be training is False)
        response = self.client.get("/api/rl/status")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["is_training"])

        # Start training (PPO empty environment)
        payload = {"env": "empty", "algorithm": "ppo"}
        response = self.client.post("/api/rl/start", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "success")

        # Get status again (should be training is True)
        response = self.client.get("/api/rl/status")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["is_training"])

        # Stop training
        response = self.client.post("/api/rl/stop")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "success")

        # Get status again (should be training is False)
        response = self.client.get("/api/rl/status")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["is_training"])

if __name__ == "__main__":
    unittest.main()
