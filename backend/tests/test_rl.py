import unittest
import numpy as np
import gymnasium as gym
from app.rl_agent import RobotEnv
from stable_baselines3 import PPO

class TestRLTrainer(unittest.TestCase):
    def test_environment_gym_specs(self):
        """
        Verify that the RobotEnv satisfies standard Gymnasium specification API.
        """
        env = RobotEnv(env_name="empty")
        obs, info = env.reset()
        
        self.assertEqual(obs.shape, (21,))
        self.assertIsInstance(obs, np.ndarray)
        self.assertIsInstance(info, dict)
        
        # Test taking a step
        action = np.array([0.5, 0.1], dtype=np.float32)
        next_obs, reward, terminated, truncated, info = env.step(action)
        
        self.assertEqual(next_obs.shape, (21,))
        self.assertIsInstance(reward, float)
        self.assertIsInstance(terminated, bool)
        self.assertIsInstance(truncated, bool)

    def test_ppo_learning_integration(self):
        """
        Ensure that the PPO model can be initialized and learn in RobotEnv.
        """
        env = RobotEnv(env_name="empty")
        model = PPO(
            "MlpPolicy",
            env,
            verbose=0,
            n_steps=64,
            batch_size=32,
            n_epochs=1,
            device="cpu"
        )
        
        # Train for a very small number of timesteps to confirm execution runs successfully
        model.learn(total_timesteps=64)
        
        # Verify that the model runs predicting actions
        obs, _ = env.reset()
        action, _states = model.predict(obs, deterministic=True)
        self.assertEqual(action.shape, (2,))
        
        env.close()

if __name__ == "__main__":
    unittest.main()
