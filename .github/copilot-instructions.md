# Copilot Instructions – Van der Pol & Strange Attractors Visualization

This project uses:
- **Python 3.10+**
- **Jupyter Notebook** for interactive exploration
- **Manim Community Edition** (`manim`) for 3D animations
- **NumPy / SciPy** for numerical integration
- **Matplotlib** for static plots

## Coding Guidelines
- Follow PEP 8.
- Use type hints where practical.
- Prefer `scipy.integrate.solve_ivp` for ODE solving.
- Keep Manim scenes modular (one class per concept).

## Running Manim
```bash
manim -pql manim_scenes.py VanDerPolScene   # low quality preview
manim -pqh manim_scenes.py VanDerPolScene   # high quality
```

## Running Jupyter
```bash
jupyter lab van_der_pol_manim.ipynb
```
