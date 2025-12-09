# Mathematical Compendium: Strange Attractors and Dynamical Systems

**Equations, Derivations, and Key Results**

---

## 1. Fundamental Concepts

### 1.1 Exponential Divergence (Butterfly Effect)

Two trajectories starting infinitesimally close diverge exponentially:

$$|\delta \mathbf{x}(t)| \sim |\delta \mathbf{x}_0| \cdot e^{\lambda t}$$

where $\lambda > 0$ is the **Lyapunov exponent**.

### 1.2 Attractor Classification

| Type | Dimension | Behavior | Example |
|------|-----------|----------|---------|
| Fixed point | 0D | Rest state | Ball in bowl |
| Limit cycle | 1D | Periodic | Heartbeat |
| Torus | 2D | Quasi-periodic | Coupled oscillators |
| Strange attractor | Fractal | Chaotic | Lorenz, weather |

---

## 2. The Van der Pol Oscillator

### 2.1 The Governing Equation

$$\boxed{\frac{d^2x}{dt^2} - \mu(1-x^2)\frac{dx}{dt} + x = 0}$$

where $\mu > 0$ is the nonlinearity parameter.

### 2.2 First-Order System Formulation

Introducing $y = \dot{x}$:

$$\begin{cases}
\dot{x} = y \\
\dot{y} = \mu(1-x^2)y - x
\end{cases}$$

### 2.3 Damping Mechanism

| Condition | Sign of Damping | System Behavior |
|-----------|-----------------|-----------------|
| $|x| < 1$ | Negative | Energy pumped IN |
| $|x| > 1$ | Positive | Energy dissipated OUT |

### 2.4 Jacobian Matrix

$$J(x, y) = \begin{pmatrix}
0 & 1 \\
-2\mu xy - 1 & \mu(1-x^2)
\end{pmatrix}$$

At the origin $(0, 0)$:

$$J(0, 0) = \begin{pmatrix}
0 & 1 \\
-1 & \mu
\end{pmatrix}$$

### 2.5 Eigenvalue Analysis

The characteristic equation:

$$\lambda^2 - \mu\lambda + 1 = 0$$

Solutions:

$$\lambda_{1,2} = \frac{\mu \pm \sqrt{\mu^2 - 4}}{2}$$

### 2.6 Stability Classification

| $\mu$ Range | Eigenvalues | Classification |
|-------------|-------------|----------------|
| $\mu = 0$ | $\lambda = \pm i$ | Center (SHO) |
| $0 < \mu < 2$ | Complex, Re > 0 | Unstable spiral |
| $\mu \geq 2$ | Real, both positive | Unstable node |

**Result:** For any $\mu > 0$, the origin is unstable → limit cycle exists by Poincaré-Bendixson theorem.

### 2.7 FitzHugh-Nagumo Model (Cardiac Application)

$$\begin{aligned}
\dot{v} &= v - \frac{v^3}{3} - w + I_{\text{ext}} \\
\dot{w} &= \epsilon(v + a - bw)
\end{aligned}$$

### 2.8 Relaxation Oscillation Period (Large $\mu$)

$$T \approx (3 - 2\ln 2)\mu \approx 1.614\mu$$

---

## 3. The Lorenz System

### 3.1 The Governing Equations

$$\boxed{\begin{aligned}
\dot{x} &= \sigma(y - x) \\
\dot{y} &= x(\rho - z) - y \\
\dot{z} &= xy - \beta z
\end{aligned}}$$

### 3.2 Standard Parameters

| Parameter | Name | Physical Meaning | Standard Value |
|-----------|------|------------------|----------------|
| $\sigma$ | Prandtl number | Momentum/thermal diffusivity | 10 |
| $\rho$ | Rayleigh number | Temperature gradient | 28 |
| $\beta$ | Geometric factor | Aspect ratio | 8/3 |

### 3.3 Physical Interpretation

- $x$: Intensity of convective circulation
- $y$: Temperature difference (rising/falling currents)
- $z$: Deviation from linear temperature profile

---

## 4. Lorenz Equilibrium Analysis

### 4.1 Finding Fixed Points

Setting $\dot{x} = \dot{y} = \dot{z} = 0$:

$$\begin{aligned}
\sigma(y - x) &= 0 \quad \Rightarrow \quad y = x \\
x(\rho - z) - y &= 0 \\
xy - \beta z &= 0
\end{aligned}$$

**Case 1: $x = 0$**

$$\boxed{O = (0, 0, 0)} \quad \text{(no convection)}$$

**Case 2: $x \neq 0$**

From $y = x$ and $x(\rho - z - 1) = 0$:

$$z = \rho - 1$$

From $x^2 = \beta(\rho - 1)$:

$$\boxed{C^{\pm} = \left(\pm\sqrt{\beta(\rho-1)}, \pm\sqrt{\beta(\rho-1)}, \rho-1\right)} \quad \text{(for } \rho > 1\text{)}$$

### 4.2 The Jacobian Matrix

$$\mathbf{J} = \begin{pmatrix}
-\sigma & \sigma & 0 \\
\rho - z & -1 & -x \\
y & x & -\beta
\end{pmatrix}$$

### 4.3 Stability of Origin $O = (0, 0, 0)$

$$\mathbf{J}_O = \begin{pmatrix}
-\sigma & \sigma & 0 \\
\rho & -1 & 0 \\
0 & 0 & -\beta
\end{pmatrix}$$

**Eigenvalue 1:** $\lambda_1 = -\beta = -\frac{8}{3} < 0$

**Characteristic equation for 2×2 block:**

$$\lambda^2 + (\sigma + 1)\lambda + \sigma(1 - \rho) = 0$$

$$\lambda_{2,3} = \frac{-(\sigma+1) \pm \sqrt{(\sigma+1)^2 - 4\sigma(1-\rho)}}{2}$$

**Bifurcation Analysis:**

- $\rho < 1$: Origin is stable (no convection)
- $\rho > 1$: Origin becomes unstable (transcritical bifurcation)

With $\sigma = 10$, $\rho = 28$:

$$\lambda_{2,3} = \frac{-11 \pm \sqrt{121 + 1080}}{2} = \frac{-11 \pm 34.66}{2}$$

$$\lambda_2 \approx 11.83 > 0, \quad \lambda_3 \approx -22.83 < 0$$

**Result:** Origin is a saddle point.

### 4.4 Stability of $C^{\pm}$

At $C^+ = (8.485, 8.485, 27)$:

$$\mathbf{J}_{C^+} = \begin{pmatrix}
-10 & 10 & 0 \\
1 & -1 & -8.485 \\
8.485 & 8.485 & -2.667
\end{pmatrix}$$

**Characteristic polynomial:**

$$\lambda^3 + (\sigma + \beta + 1)\lambda^2 + (\sigma + \rho)\beta\lambda + 2\sigma\beta(\rho - 1) = 0$$

**Eigenvalues at standard parameters:**

$$\lambda_1 \approx -13.85 \quad \text{(real, stable)}$$
$$\lambda_{2,3} \approx 0.094 \pm 10.19i \quad \text{(complex, unstable)}$$

---

## 5. The Hopf Bifurcation (Origin of Chaos)

### 5.1 Critical Rayleigh Number

$$\boxed{\rho_H = \frac{\sigma(\sigma + \beta + 3)}{\sigma - \beta - 1} \approx 24.74}$$

### 5.2 Stability Diagram

| Real Part $\alpha$ | Behavior |
|-------------------|----------|
| $\alpha < 0$ | Trajectories spiral into $C^{\pm}$ (stable) |
| $\alpha = 0$ | Hopf bifurcation (limit cycle born) |
| $\alpha > 0$ | Trajectories spiral away (unstable) |

### 5.3 Chaos Mechanism

1. For $\rho < \rho_H$: Trajectories settle onto $C^+$ or $C^-$
2. At $\rho = \rho_H$: Subcritical Hopf bifurcation
3. For $\rho > \rho_H$: Both $C^{\pm}$ become unstable → strange attractor emerges

### 5.4 Lyapunov Exponent (Chaos Signature)

At $\rho = 28$:

$$\lambda_{\max} \approx 0.906 \, \text{bits/time unit}$$

**Prediction horizon:**

$$T_{\text{pred}} \approx \frac{1}{\lambda_{\max}} \ln\left(\frac{\Delta_{\text{tol}}}{\Delta_0}\right)$$

---

## 6. Chaos Control Methods

### 6.1 Parameter Adjustment

$$\rho < \rho_H \approx 24.74 \quad \Rightarrow \quad \text{chaos eliminated}$$

### 6.2 OGY Control (Ott-Grebogi-Yorke)

Small parameter perturbation near unstable periodic orbit:

$$\delta\rho = -\mathbf{K}^T(\mathbf{x} - \mathbf{x}^*)$$

### 6.3 Time-Delay Feedback (Pyragas)

$$\dot{\mathbf{x}} = \mathbf{f}(\mathbf{x}) + K[\mathbf{x}(t-\tau) - \mathbf{x}(t)]$$

When $\tau$ matches the period of an unstable periodic orbit, the control stabilizes it.

---

## 7. The Feigenbaum Cascade

### 7.1 The Logistic Map

$$x_{n+1} = r \cdot x_n \cdot (1 - x_n)$$

### 7.2 Period-Doubling Route to Chaos

| $r$ Value | Behavior |
|-----------|----------|
| $r < 1$ | $x \to 0$ (extinction) |
| $1 < r < 3$ | Stable fixed point |
| $r = 3$ | First bifurcation (period-2) |
| $r = 3.45$ | Period-4 |
| $r = 3.54$ | Period-8, 16, 32... |
| $r > 3.57$ | Chaos |

### 7.3 Feigenbaum's Universal Constant

$$\boxed{\delta = \lim_{n\to\infty} \frac{r_{n} - r_{n-1}}{r_{n+1} - r_n} = 4.669201609...}$$

This constant is **universal** — it appears in ANY system undergoing period-doubling bifurcations.

---

## 8. Summary of Key Equations

| System | Equation |
|--------|----------|
| Van der Pol | $\ddot{x} - \mu(1-x^2)\dot{x} + x = 0$ |
| Lorenz | $\dot{x} = \sigma(y-x), \; \dot{y} = x(\rho-z) - y, \; \dot{z} = xy - \beta z$ |
| Lyapunov divergence | $|\delta \mathbf{x}(t)| \sim |\delta \mathbf{x}_0| e^{\lambda t}$ |
| Hopf bifurcation | $\rho_H = \frac{\sigma(\sigma + \beta + 3)}{\sigma - \beta - 1}$ |
| Feigenbaum constant | $\delta = 4.669201609...$ |

---

## References

1. Van der Pol, B. (1926). "On relaxation oscillations." *Phil. Mag.*
2. Lorenz, E.N. (1963). "Deterministic Nonperiodic Flow." *J. Atmos. Sci.*
3. Feigenbaum, M.J. (1978). "Quantitative universality..." *J. Stat. Phys.*
4. Strogatz, S.H. (2015). *Nonlinear Dynamics and Chaos*, 2nd ed.

---

> *"Determinism ≠ Predictability"*
