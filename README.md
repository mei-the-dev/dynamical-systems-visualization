# Van der Pol Equation, Limit Cycles & Strange Attractors – Visualization Project

Interactive **Jupyter Notebook** + **Manim Community** animations exploring:

| Topic | Description |
|-------|-------------|
| **Van der Pol Oscillator** | Non-linear relaxation oscillator with damping parameter μ |
| **Limit Cycles** | Stable periodic orbits in phase space |
| **Strange Attractors** | Chaotic trajectories (Lorenz, Rössler) for comparison |

---

## 🚀 Quick Start

### 1. Create a virtual environment (recommended)
```bash
python -m venv .venv
source .venv/bin/activate   # Linux / macOS
# .venv\Scripts\activate    # Windows
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Jupyter Notebook
```bash
jupyter lab van_der_pol_manim.ipynb
```

### 4. Render Manim animations
```bash
# Low-quality preview (fast)
manim -pql manim_scenes.py VanDerPolScene

# High-quality render
manim -pqh manim_scenes.py VanDerPolScene

# All scenes
manim -pql manim_scenes.py
```

---

## 📂 Project Structure

```
.
├── README.md
├── requirements.txt
├── van_der_pol_manim.ipynb   # Main notebook (explanation + plots)
├── manim_scenes.py           # Manim 3D scenes
└── static_plots.py           # Helper for quick matplotlib figures
```

---

## 🔬 Mathematics Overview

### Van der Pol Equation
$$\frac{d^2 x}{dt^2} - \mu (1 - x^2) \frac{dx}{dt} + x = 0$$

Rewritten as a first-order system:
$$\dot{x} = y, \quad \dot{y} = \mu (1 - x^2) y - x$$

### Lorenz System (strange attractor demo)
$$\dot{x} = \sigma (y - x), \quad \dot{y} = x(\rho - z) - y, \quad \dot{z} = xy - \beta z$$

---

## 🎥 Sample Outputs

After rendering, videos are saved to `media/videos/`.

---

## License

MIT – feel free to adapt and share.
