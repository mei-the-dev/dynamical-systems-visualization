"""
static_plots.py
---------------
Quick matplotlib helpers for Van der Pol, limit cycles, and strange attractors.
Import these in the Jupyter notebook for inline static figures.
"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401
from scipy.integrate import solve_ivp

# ---------------------------------------------------------------------------
# ODEs
# ---------------------------------------------------------------------------

def van_der_pol(t, state, mu=1.0):
    x, y = state
    return [y, mu * (1 - x**2) * y - x]


def lorenz(t, state, sigma=10.0, rho=28.0, beta=8/3):
    x, y, z = state
    return [sigma * (y - x), x * (rho - z) - y, x * y - beta * z]


def rossler(t, state, a=0.2, b=0.2, c=5.7):
    x, y, z = state
    return [-y - z, x + a * y, b + z * (x - c)]


# ---------------------------------------------------------------------------
# Plotting utilities
# ---------------------------------------------------------------------------

def plot_van_der_pol_phase(mu=2.0, t_span=(0, 40), n_points=2000, ax=None):
    """Plot Van der Pol phase portrait (x vs dx/dt)."""
    sol = solve_ivp(van_der_pol, t_span, [0.1, 0.0], args=(mu,),
                    dense_output=True, max_step=0.01)
    t_eval = np.linspace(*t_span, n_points)
    xy = sol.sol(t_eval)

    if ax is None:
        fig, ax = plt.subplots(figsize=(6, 5))
    ax.plot(xy[0], xy[1], lw=0.8)
    ax.set_xlabel("$x$")
    ax.set_ylabel("$\\dot{x}$")
    ax.set_title(f"Van der Pol limit cycle (μ = {mu})")
    ax.set_aspect("equal", "datalim")
    ax.grid(True, alpha=0.3)
    return ax


def plot_lorenz_3d(t_span=(0, 50), n_points=10000, ax=None):
    """Plot Lorenz attractor in 3D."""
    sol = solve_ivp(lorenz, t_span, [1.0, 1.0, 1.0],
                    dense_output=True, max_step=0.01)
    t_eval = np.linspace(*t_span, n_points)
    xyz = sol.sol(t_eval)

    if ax is None:
        fig = plt.figure(figsize=(8, 6))
        ax = fig.add_subplot(111, projection="3d")
    ax.plot(xyz[0], xyz[1], xyz[2], lw=0.4)
    ax.set_xlabel("X")
    ax.set_ylabel("Y")
    ax.set_zlabel("Z")
    ax.set_title("Lorenz Strange Attractor")
    return ax


def plot_rossler_3d(t_span=(0, 200), n_points=20000, ax=None):
    """Plot Rössler attractor in 3D."""
    sol = solve_ivp(rossler, t_span, [1.0, 1.0, 1.0],
                    dense_output=True, max_step=0.01)
    t_eval = np.linspace(*t_span, n_points)
    xyz = sol.sol(t_eval)

    if ax is None:
        fig = plt.figure(figsize=(8, 6))
        ax = fig.add_subplot(111, projection="3d")
    ax.plot(xyz[0], xyz[1], xyz[2], lw=0.4, color="purple")
    ax.set_xlabel("X")
    ax.set_ylabel("Y")
    ax.set_zlabel("Z")
    ax.set_title("Rössler Attractor")
    return ax


# ---------------------------------------------------------------------------
# Quick demo when run directly
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    plot_van_der_pol_phase(mu=2.0, ax=axes[0])

    # 3D Lorenz in second panel
    axes[1].remove()
    ax3d = fig.add_subplot(1, 2, 2, projection="3d")
    plot_lorenz_3d(ax=ax3d)

    plt.tight_layout()
    plt.show()
