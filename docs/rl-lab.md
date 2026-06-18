# Reinforcement Learning Lab

RoboVerse features an integrated Reinforcement Learning (RL) training lab that allows users to optimize autonomous navigation policies in real-time.

## The Robot Navigation Environment (`RobotEnv`)
The RL core uses a custom environment inheriting from `gymnasium.Env`.

### 1. State Space (Observation)
The observation space is a 21-dimensional vector:
- `[0:2]`: Robot pose $(x, y, \theta)$
- `[3:4]`: Goal pose $(x_{goal}, y_{goal})$
- `[5:20]`: 16 LIDAR distance values measuring spacing to nearest obstacles in a 360-degree sweep

### 2. Action Space (Continuous)
The action space is a 2-dimensional continuous vector representing target movement:
- `Action[0]`: Linear velocity target, range $[-1.0, 1.5]$
- `Action[1]`: Angular velocity target, range $[-1.5, 1.5]$

### 3. Reward Function Formula
The agent updates its weight parameters based on feedback loops at each simulation tick:
- **Distance Reward**: $-d_{goal} \times 0.1$ (encourages moving closer to goal)
- **Time Penalty**: $-0.02$ per tick (encourages fast paths)
- **Collision Penalty**: $-2.0$ if robot bounds overlap obstacles
- **Success Bonus**: $+50.0$ if $d_{goal} < 0.7$

---

## Proximal Policy Optimization (PPO)
Under the hood, we run **Stable-Baselines3's PPO** model:
- Uses an **MLP Policy** structure (`MlpPolicy`).
- Hyperparameters are tuned for speed: `n_steps=128`, `batch_size=32`, `n_epochs=3`, and a light network architecture `[32, 32]`.
- Broadcaster Callback feeds updates to front-end WebSockets at 20Hz, populating the interactive Plotly graphs.
