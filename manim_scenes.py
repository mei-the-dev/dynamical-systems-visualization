"""
manim_scenes.py
---------------
Manim Community Edition scenes for visualizing:
  • Van der Pol oscillator trajectories (2D phase plane in 3D space)
  • Limit cycles
  • Strange attractors (Lorenz system)

Run examples:
    manim -pql manim_scenes.py VanDerPolScene
    manim -pqh manim_scenes.py LorenzAttractorScene
"""

from manim import *
import numpy as np
from scipy.integrate import solve_ivp

# ---------------------------------------------------------------------------
# Van der Pol helpers
# ---------------------------------------------------------------------------

def van_der_pol(t, state, mu: float = 1.0):
    """Van der Pol ODE: dx/dt = y,  dy/dt = mu*(1-x^2)*y - x"""
    x, y = state
    return [y, mu * (1 - x**2) * y - x]


def integrate_van_der_pol(mu: float = 1.0, x0: float = 0.5, y0: float = 0.0,
                          t_span=(0, 30), n_points: int = 2000):
    """Integrate Van der Pol and return (x, y) arrays."""
    sol = solve_ivp(van_der_pol, t_span, [x0, y0],
                    args=(mu,), dense_output=True,
                    max_step=0.01)
    t_eval = np.linspace(*t_span, n_points)
    xy = sol.sol(t_eval)
    return xy[0], xy[1]


def compute_vdp_poincare_map(mu: float = 2.0, x0: float = 0.1, y0: float = 0.0,
                              t_span=(0, 200), n_points: int = 20000):
    """
    Compute Poincaré section crossings for Van der Pol oscillator.
    Section: y = 0, x > 0, crossing from below (dy/dt > 0 → x > 0 for VdP)
    Returns list of (x_n, x_{n+1}) pairs for the return map.
    """
    xs, ys = integrate_van_der_pol(mu=mu, x0=x0, y0=y0, t_span=t_span, n_points=n_points)
    
    # Find crossings where y goes from negative to positive (or zero)
    crossings = []
    for i in range(1, len(ys)):
        if ys[i-1] < 0 and ys[i] >= 0 and xs[i] > 0:  # Crossing y=0 upward, x>0
            # Linear interpolation
            if abs(ys[i] - ys[i-1]) > 1e-10:
                t_frac = -ys[i-1] / (ys[i] - ys[i-1])
                x_cross = xs[i-1] + t_frac * (xs[i] - xs[i-1])
            else:
                x_cross = xs[i]
            crossings.append(x_cross)
    
    # Create return map pairs (x_n, x_{n+1})
    return_map = [(crossings[i], crossings[i+1]) for i in range(len(crossings)-1)]
    return crossings, return_map


# ---------------------------------------------------------------------------
# Lorenz helpers
# ---------------------------------------------------------------------------

def lorenz(t, state, sigma=10.0, rho=28.0, beta=8/3):
    x, y, z = state
    return [sigma * (y - x),
            x * (rho - z) - y,
            x * y - beta * z]


def integrate_lorenz(sigma=10.0, rho=28.0, beta=8/3,
                     x0=1.0, y0=1.0, z0=1.0,
                     t_span=(0, 50), n_points: int = 10000):
    sol = solve_ivp(lorenz, t_span, [x0, y0, z0],
                    args=(sigma, rho, beta), dense_output=True,
                    max_step=0.01)
    t_eval = np.linspace(*t_span, n_points)
    xyz = sol.sol(t_eval)
    return xyz[0], xyz[1], xyz[2]


# ---------------------------------------------------------------------------
# Scene: Van der Pol oscillator in 2D (embedded in 3D for nicer camera)
# ---------------------------------------------------------------------------

def compute_limit_cycle_boundary(mu: float = 2.0, n_points: int = 500):
    """
    Compute the stable limit cycle boundary by integrating for a long time
    and extracting the final periodic orbit.
    """
    # Integrate long enough to reach limit cycle
    sol = solve_ivp(van_der_pol, (0, 100), [0.1, 0.0],
                    args=(mu,), dense_output=True, max_step=0.01)
    # Extract last period (roughly)
    t_final = np.linspace(90, 100, n_points)
    xy = sol.sol(t_final)
    return xy[0], xy[1]


class VanDerPolScene(ThreeDScene):
    """Animate Van der Pol limit cycle with boundary and Poincaré map visualization."""

    def construct(self):
        # Scene setup
        self.set_camera_orientation(phi=70 * DEGREES, theta=-45 * DEGREES)

        # Axes (phase plane: x vs y, z=0)
        axes = ThreeDAxes(
            x_range=[-4, 4, 1],
            y_range=[-6, 6, 2],
            z_range=[-1, 1, 1],
            x_length=6,
            y_length=6,
            z_length=2,
        )
        labels = axes.get_axis_labels(x_label="x", y_label="\\dot{x}", z_label="")
        self.add(axes, labels)

        mu = 2.0

        # --- LIMIT CYCLE BOUNDARY ---
        lc_x, lc_y = compute_limit_cycle_boundary(mu=mu)
        lc_points = [axes.c2p(x, y, 0) for x, y in zip(lc_x, lc_y)]
        
        limit_cycle = VMobject()
        limit_cycle.set_points_smoothly(lc_points + [lc_points[0]])
        limit_cycle.set_stroke(color=GOLD, width=4, opacity=0.9)
        limit_cycle_glow = limit_cycle.copy().set_stroke(color=YELLOW, width=8, opacity=0.3)
        
        lc_label = Text("Limit Cycle Boundary", font_size=20, color=GOLD)
        lc_label.to_corner(UR)
        
        self.play(Create(limit_cycle_glow), Create(limit_cycle), Write(lc_label), run_time=2)
        self.wait(0.5)

        # --- POINCARÉ SECTION LINE (y = 0, x > 0) ---
        poincare_line = Line3D(
            start=axes.c2p(0, 0, 0),
            end=axes.c2p(3.5, 0, 0),
            color=TEAL,
            thickness=0.04
        )
        poincare_label = Text("Poincaré Section (ẋ=0, x>0)", font_size=16, color=TEAL)
        poincare_label.to_corner(UL)
        
        self.play(Create(poincare_line), Write(poincare_label), run_time=1)

        # --- TRAJECTORY WITH POINCARÉ CROSSINGS ---
        x_traj, y_traj = integrate_van_der_pol(mu=mu, x0=0.1, y0=0.0, t_span=(0, 40), n_points=4000)
        points_traj = [axes.c2p(x, y, 0) for x, y in zip(x_traj, y_traj)]
        
        curve = VMobject().set_points_smoothly(points_traj)
        curve.set_stroke(color=BLUE, width=2)
        
        # Find and mark Poincaré crossings
        crossings, _ = compute_vdp_poincare_map(mu=mu, x0=0.1, y0=0.0, t_span=(0, 40))
        crossing_dots = VGroup()
        for x_cross in crossings[:15]:  # First 15 crossings
            dot = Dot3D(point=axes.c2p(x_cross, 0, 0), color=YELLOW, radius=0.08)
            crossing_dots.add(dot)
        
        self.play(Create(curve), run_time=6, rate_func=linear)
        self.play(FadeIn(crossing_dots, lag_ratio=0.1), run_time=1.5)
        
        # --- SHOW CONVERGENCE ---
        convergence_text = Text("Crossings converge to fixed point", font_size=18, color=YELLOW)
        convergence_text.next_to(poincare_label, DOWN, aligned_edge=LEFT)
        self.play(Write(convergence_text))
        
        # Highlight the limit cycle crossing point
        lc_crossing = max(lc_x)  # Maximum x on limit cycle ≈ 2
        fixed_pt = Dot3D(point=axes.c2p(lc_crossing, 0, 0), color=GREEN, radius=0.12)
        fixed_label = Text(f"x* ≈ {lc_crossing:.2f}", font_size=14, color=GREEN)
        fixed_label.next_to(fixed_pt, UP + RIGHT, buff=0.1)
        
        self.play(FadeIn(fixed_pt, scale=2), Write(fixed_label), run_time=1)
        
        self.wait(2)
        
        # --- TRANSITION TO 2D POINCARÉ RETURN MAP ---
        self.play(
            FadeOut(axes), FadeOut(labels), FadeOut(limit_cycle), FadeOut(limit_cycle_glow),
            FadeOut(curve), FadeOut(poincare_line), FadeOut(lc_label),
            FadeOut(convergence_text), FadeOut(fixed_pt), FadeOut(fixed_label),
            FadeOut(crossing_dots), FadeOut(poincare_label),
            run_time=1
        )
        
        # Switch to 2D view for return map
        self.move_camera(phi=0, theta=-90 * DEGREES, run_time=1)
        
        # Create 2D axes for return map
        map_axes = Axes(
            x_range=[0, 2.5, 0.5],
            y_range=[0, 2.5, 0.5],
            x_length=5,
            y_length=5,
            axis_config={"include_tip": True},
        )
        map_labels = map_axes.get_axis_labels(x_label="x_n", y_label="x_{n+1}")
        
        # Diagonal line (identity)
        diagonal = map_axes.plot(lambda x: x, x_range=[0, 2.5], color=WHITE, stroke_width=1)
        diag_label = Text("y = x", font_size=14, color=WHITE)
        diag_label.next_to(diagonal.get_end(), RIGHT, buff=0.1)
        
        self.play(Create(map_axes), Write(map_labels), run_time=1)
        self.play(Create(diagonal), Write(diag_label), run_time=0.5)
        
        # Plot return map points - use multiple initial conditions for variety
        map_dots = VGroup()
        all_crossings = []
        all_return_map = []
        
        # Gather crossings from multiple starting points
        for x0_start in [0.1, 0.5, 1.0, 2.0, 3.0]:
            crossings_temp, return_map_temp = compute_vdp_poincare_map(
                mu=mu, x0=x0_start, y0=0.0, t_span=(0, 100), n_points=10000
            )
            all_crossings.extend(crossings_temp)
            all_return_map.extend(return_map_temp)
        
        # Create dots from return map
        for x_n, x_np1 in all_return_map[:80]:
            if 0 < x_n < 2.5 and 0 < x_np1 < 2.5:  # Keep in bounds
                dot = Dot(point=map_axes.c2p(x_n, x_np1), color=BLUE, radius=0.04)
                map_dots.add(dot)
        
        # Fixed point on diagonal (limit cycle crossing)
        fp_x = all_crossings[-1] if all_crossings else 2.0
        fp_dot = Dot(point=map_axes.c2p(fp_x, fp_x), color=GREEN, radius=0.08)
        fp_label = Text(f"Fixed Point: x* ≈ {fp_x:.2f}", font_size=16, color=GREEN)
        fp_label.to_corner(UR)
        
        map_title = Text("Poincaré Return Map", font_size=24, color=GOLD)
        map_title.to_edge(UP)
        
        self.play(Write(map_title), run_time=0.5)
        
        # Handle case where map_dots might be empty
        if len(map_dots) > 0:
            self.play(LaggedStartMap(FadeIn, map_dots, lag_ratio=0.05), run_time=3)
        
        self.play(FadeIn(fp_dot, scale=2), Write(fp_label), run_time=1)
        
        # Show cobweb diagram
        cobweb = VGroup()
        if len(all_return_map) > 0:
            for i in range(min(20, len(all_return_map))):
                x_n, x_np1 = all_return_map[i]
                if 0 < x_n < 2.5 and 0 < x_np1 < 2.5:
                    # Vertical line to curve
                    v_line = Line(map_axes.c2p(x_n, x_n), map_axes.c2p(x_n, x_np1), color=RED, stroke_width=1)
                    # Horizontal line to diagonal
                    h_line = Line(map_axes.c2p(x_n, x_np1), map_axes.c2p(x_np1, x_np1), color=RED, stroke_width=1)
                    cobweb.add(v_line, h_line)
        
        cobweb_label = Text("Cobweb: convergence to limit cycle", font_size=16, color=RED)
        cobweb_label.to_edge(DOWN)
        
        if len(cobweb) > 0:
            self.play(Create(cobweb), Write(cobweb_label), run_time=3)
        else:
            self.play(Write(cobweb_label), run_time=1)
        
        self.wait(2)


# ---------------------------------------------------------------------------
# Scene: Multiple initial conditions converging to the limit cycle
# ---------------------------------------------------------------------------

class LimitCycleConvergenceScene(ThreeDScene):
    """Show trajectories from different starting points converging."""

    def construct(self):
        self.set_camera_orientation(phi=65 * DEGREES, theta=-50 * DEGREES)

        axes = ThreeDAxes(
            x_range=[-4, 4, 1],
            y_range=[-6, 6, 2],
            z_range=[-1, 1, 1],
            x_length=7,
            y_length=7,
            z_length=2,
        )
        self.add(axes)

        mu = 2.0
        colors = [RED, GREEN, ORANGE, PURPLE, TEAL]
        starts = [(0.1, 0), (3, 0), (-2, 4), (1, -3), (-3, -2)]

        curves = VGroup()
        for (x0, y0), col in zip(starts, colors):
            xs, ys = integrate_van_der_pol(mu=mu, x0=x0, y0=y0, t_span=(0, 30), n_points=1500)
            pts = [axes.c2p(x, y, 0) for x, y in zip(xs, ys)]
            curve = VMobject().set_points_smoothly(pts).set_stroke(col, width=2)
            curves.add(curve)

        self.play(LaggedStartMap(Create, curves, lag_ratio=0.3), run_time=8)
        self.wait()


# ---------------------------------------------------------------------------
# Scene: Lorenz strange attractor in 3D with Poincaré section & equilibria
# ---------------------------------------------------------------------------

def compute_poincare_crossings(xs, ys, zs, z_section=27.0):
    """
    Find points where trajectory crosses the Poincaré section plane z = z_section
    from below (dz > 0).
    """
    crossings = []
    for i in range(1, len(zs)):
        if zs[i-1] < z_section <= zs[i]:  # Crossing from below
            # Linear interpolation for more accurate crossing point
            t_frac = (z_section - zs[i-1]) / (zs[i] - zs[i-1])
            x_cross = xs[i-1] + t_frac * (xs[i] - xs[i-1])
            y_cross = ys[i-1] + t_frac * (ys[i] - ys[i-1])
            crossings.append((x_cross, y_cross, z_section))
    return crossings


class LorenzAttractorScene(ThreeDScene):
    """
    3D visualization of the Lorenz strange attractor with:
    - Equilibrium points C+, C-, and origin
    - Poincaré section plane at z = ρ - 1 = 27
    - Trajectory crossings marked on the plane
    - Smooth camera movement
    """

    def construct(self):
        # Camera setup with initial orientation
        self.set_camera_orientation(phi=75 * DEGREES, theta=-60 * DEGREES, zoom=0.8)
        
        # Lorenz parameters
        sigma, rho, beta = 10.0, 28.0, 8/3
        z_section = rho - 1  # = 27, the Poincaré section plane

        # Axes scaled to fit attractor
        axes = ThreeDAxes(
            x_range=[-30, 30, 10],
            y_range=[-30, 30, 10],
            z_range=[0, 50, 10],
            x_length=8,
            y_length=8,
            z_length=5,
        )
        
        # Axis labels
        x_label = axes.get_x_axis_label("x")
        y_label = axes.get_y_axis_label("y")
        z_label = axes.get_z_axis_label("z")
        
        self.add(axes, x_label, y_label, z_label)

        # --- EQUILIBRIUM POINTS ---
        # C+ = (√(β(ρ-1)), √(β(ρ-1)), ρ-1) and C- = (-√(β(ρ-1)), -√(β(ρ-1)), ρ-1)
        eq_coord = np.sqrt(beta * (rho - 1))  # ≈ 8.485
        
        # Origin (unstable)
        origin_pt = Dot3D(point=axes.c2p(0, 0, 0), color=RED, radius=0.12)
        origin_label = Text("O (unstable)", font_size=14, color=RED)
        origin_label.next_to(origin_pt, DOWN + RIGHT, buff=0.1)
        
        # C+ equilibrium
        c_plus_pt = Dot3D(point=axes.c2p(eq_coord, eq_coord, z_section), 
                         color=GREEN, radius=0.12)
        c_plus_label = Text("C⁺", font_size=16, color=GREEN)
        c_plus_label.next_to(c_plus_pt, UP, buff=0.1)
        
        # C- equilibrium  
        c_minus_pt = Dot3D(point=axes.c2p(-eq_coord, -eq_coord, z_section),
                          color=BLUE, radius=0.12)
        c_minus_label = Text("C⁻", font_size=16, color=BLUE)
        c_minus_label.next_to(c_minus_pt, UP, buff=0.1)

        equilibria = VGroup(origin_pt, c_plus_pt, c_minus_pt)
        eq_labels = VGroup(origin_label, c_plus_label, c_minus_label)
        
        # --- POINCARÉ SECTION PLANE ---
        # Create semi-transparent plane at z = 27
        poincare_plane = Surface(
            lambda u, v: axes.c2p(u, v, z_section),
            u_range=[-25, 25],
            v_range=[-25, 25],
            resolution=(20, 20),
            fill_opacity=0.15,
            stroke_width=0.5,
            stroke_opacity=0.3,
            checkerboard_colors=[TEAL_E, TEAL_D],
        )
        
        plane_label = Text(f"Poincaré Section (z = {z_section:.0f})", font_size=18, color=TEAL)
        plane_label.to_corner(UL)

        # --- INTEGRATE LORENZ TRAJECTORY ---
        xs, ys, zs = integrate_lorenz(sigma=sigma, rho=rho, beta=beta,
                                       t_span=(0, 50), n_points=12000)

        def scale_pt(x, y, z):
            return axes.c2p(x, y, z)

        points = [scale_pt(x, y, z) for x, y, z in zip(xs, ys, zs)]

        # Gradient color along the path
        curve = VMobject()
        curve.set_points_smoothly(points)
        curve.set_stroke(width=1.5)
        curve.set_color_by_gradient(BLUE, PURPLE, RED, ORANGE)

        # --- POINCARÉ CROSSINGS ---
        crossings = compute_poincare_crossings(xs, ys, zs, z_section=z_section)
        crossing_dots = VGroup()
        for x, y, z in crossings[:100]:  # Limit to first 100 crossings
            dot = Dot3D(point=axes.c2p(x, y, z), color=YELLOW, radius=0.06)
            crossing_dots.add(dot)

        # --- ANIMATION SEQUENCE ---
        
        # 1. Show equilibrium points
        self.play(
            FadeIn(equilibria, scale=0.5),
            Write(eq_labels),
            run_time=1.5
        )
        self.wait(0.5)
        
        # 2. Show Poincaré section plane
        self.play(
            FadeIn(poincare_plane),
            Write(plane_label),
            run_time=1.5
        )
        self.wait(0.5)

        # 3. Start ambient rotation and draw trajectory
        self.begin_ambient_camera_rotation(rate=0.12)
        
        # Draw the trajectory
        self.play(
            Create(curve),
            run_time=12,
            rate_func=linear
        )
        
        # 4. Show Poincaré crossings
        self.play(
            FadeIn(crossing_dots, lag_ratio=0.05),
            run_time=2
        )
        
        # 5. Move camera to highlight Poincaré section from above
        self.stop_ambient_camera_rotation()
        
        self.move_camera(
            phi=30 * DEGREES,  # More top-down view
            theta=-45 * DEGREES,
            run_time=2
        )
        
        # Highlight the Poincaré plane crossings
        poincare_highlight = Text("Crossings form the Lorenz Map", font_size=20, color=YELLOW)
        poincare_highlight.to_edge(DOWN)
        self.play(Write(poincare_highlight))
        
        self.wait(2)
        
        # 6. Final rotation around the attractor
        self.begin_ambient_camera_rotation(rate=0.2)
        self.move_camera(
            phi=70 * DEGREES,
            theta=-90 * DEGREES,
            run_time=4
        )
        
        self.wait(2)
        self.stop_ambient_camera_rotation()


# ---------------------------------------------------------------------------
# Scene: Title / intro card
# ---------------------------------------------------------------------------

class IntroScene(Scene):
    """Simple title card."""

    def construct(self):
        title = Text("Van der Pol Oscillator\n& Strange Attractors", font_size=48)
        subtitle = Text("Limit cycles • Chaos • 3D Visualization", font_size=28, color=GRAY)
        subtitle.next_to(title, DOWN, buff=0.5)
        self.play(Write(title), run_time=2)
        self.play(FadeIn(subtitle, shift=UP * 0.3))
        self.wait(2)
        self.play(FadeOut(title), FadeOut(subtitle))


# ---------------------------------------------------------------------------
# Scene: Hopf Bifurcation - transition from stable focus to limit cycle
# ---------------------------------------------------------------------------

def hopf_system(t, state, mu: float):
    """
    Normal form of supercritical Hopf bifurcation:
    dr/dt = μr - r³
    dθ/dt = 1
    
    In Cartesian: dx/dt = μx - y - x(x² + y²)
                  dy/dt = x + μy - y(x² + y²)
    
    For μ < 0: stable focus at origin
    For μ > 0: unstable origin, stable limit cycle at r = √μ
    """
    x, y = state
    r_sq = x**2 + y**2
    dxdt = mu * x - y - x * r_sq
    dydt = x + mu * y - y * r_sq
    return [dxdt, dydt]


def integrate_hopf(mu: float, x0: float, y0: float, t_span=(0, 30), n_points: int = 2000):
    """Integrate Hopf normal form system."""
    sol = solve_ivp(hopf_system, t_span, [x0, y0],
                    args=(mu,), dense_output=True, max_step=0.01)
    t_eval = np.linspace(*t_span, n_points)
    xy = sol.sol(t_eval)
    return xy[0], xy[1]


class HopfBifurcationScene(Scene):
    """
    Animate the supercritical Hopf bifurcation:
    - μ < 0: trajectories spiral into stable focus
    - μ = 0: bifurcation point
    - μ > 0: stable limit cycle emerges
    """

    def construct(self):
        # Title
        title = Text("Supercritical Hopf Bifurcation", font_size=36, color=GOLD)
        title.to_edge(UP)
        self.play(Write(title))
        
        # Create phase plane axes
        axes = Axes(
            x_range=[-2, 2, 0.5],
            y_range=[-2, 2, 0.5],
            x_length=5,
            y_length=5,
            axis_config={"include_tip": True},
        )
        axes_labels = axes.get_axis_labels(x_label="x", y_label="y")
        axes.shift(LEFT * 3)
        axes_labels.shift(LEFT * 3)
        
        # Bifurcation diagram axes (right side)
        bif_axes = Axes(
            x_range=[-0.5, 1, 0.25],
            y_range=[0, 1.5, 0.5],
            x_length=4,
            y_length=3,
            axis_config={"include_tip": True},
        )
        bif_labels = bif_axes.get_axis_labels(x_label="\\mu", y_label="r")
        bif_axes.shift(RIGHT * 3.5 + DOWN * 0.5)
        bif_labels.shift(RIGHT * 3.5 + DOWN * 0.5)
        
        self.play(Create(axes), Write(axes_labels), Create(bif_axes), Write(bif_labels))
        
        # Bifurcation curves
        # Stable branch for μ < 0: r = 0
        stable_origin = bif_axes.plot(lambda mu: 0, x_range=[-0.5, 0], color=GREEN, stroke_width=3)
        # Unstable origin for μ > 0: r = 0
        unstable_origin = bif_axes.plot(lambda mu: 0, x_range=[0, 1], color=RED, stroke_width=3)
        unstable_origin.set_stroke(opacity=0.5)
        # Stable limit cycle: r = √μ for μ > 0
        limit_cycle_branch = bif_axes.plot(lambda mu: np.sqrt(mu), x_range=[0.01, 1], color=GREEN, stroke_width=3)
        
        bif_label = Text("Bifurcation Diagram", font_size=18, color=WHITE)
        bif_label.next_to(bif_axes, UP)
        
        self.play(Create(stable_origin), Create(unstable_origin), 
                  Create(limit_cycle_branch), Write(bif_label), run_time=2)
        
        # Parameter tracker
        mu_tracker = ValueTracker(-0.4)
        
        # μ value display
        mu_display = always_redraw(
            lambda: Text(f"μ = {mu_tracker.get_value():.2f}", font_size=24, color=YELLOW)
            .next_to(axes, DOWN)
        )
        
        # Marker on bifurcation diagram
        bif_marker = always_redraw(
            lambda: Dot(
                bif_axes.c2p(mu_tracker.get_value(), 
                            np.sqrt(max(0, mu_tracker.get_value()))),
                color=YELLOW, radius=0.1
            )
        )
        
        self.play(FadeIn(mu_display), FadeIn(bif_marker))
        
        # --- PHASE 1: μ < 0 (stable focus) ---
        phase_label = Text("Stable Focus", font_size=20, color=GREEN)
        phase_label.next_to(axes, UP)
        self.play(Write(phase_label))
        
        # Draw trajectories for μ < 0
        mu_val = -0.3
        colors = [BLUE, RED, PURPLE, ORANGE]
        starts = [(1.5, 0), (0, 1.5), (-1, 1), (1, -1)]
        
        trajectories_neg = VGroup()
        for (x0, y0), col in zip(starts, colors):
            xs, ys = integrate_hopf(mu_val, x0, y0, t_span=(0, 15))
            pts = [axes.c2p(x, y) + LEFT * 3 for x, y in zip(xs, ys)]
            curve = VMobject().set_points_smoothly(pts).set_stroke(col, width=2)
            trajectories_neg.add(curve)
        
        origin_dot = Dot(axes.c2p(0, 0) + LEFT * 3, color=GREEN, radius=0.1)
        
        self.play(FadeIn(origin_dot))
        self.play(LaggedStartMap(Create, trajectories_neg, lag_ratio=0.2), run_time=4)
        self.wait(1)
        
        # --- PHASE 2: Transition through μ = 0 ---
        transition_label = Text("Bifurcation Point (μ = 0)", font_size=20, color=YELLOW)
        transition_label.next_to(axes, UP)
        
        self.play(
            mu_tracker.animate.set_value(0),
            FadeOut(trajectories_neg),
            Transform(phase_label, transition_label),
            origin_dot.animate.set_color(YELLOW),
            run_time=2
        )
        self.wait(1)
        
        # --- PHASE 3: μ > 0 (limit cycle) ---
        lc_label = Text("Stable Limit Cycle", font_size=20, color=GREEN)
        lc_label.next_to(axes, UP)
        
        self.play(
            mu_tracker.animate.set_value(0.5),
            Transform(phase_label, lc_label),
            origin_dot.animate.set_color(RED),
            run_time=2
        )
        
        # Draw limit cycle
        mu_val = 0.5
        r_lc = np.sqrt(mu_val)
        theta = np.linspace(0, 2 * np.pi, 100)
        lc_xs, lc_ys = r_lc * np.cos(theta), r_lc * np.sin(theta)
        lc_pts = [axes.c2p(x, y) + LEFT * 3 for x, y in zip(lc_xs, lc_ys)]
        limit_cycle = VMobject().set_points_smoothly(lc_pts + [lc_pts[0]])
        limit_cycle.set_stroke(color=GOLD, width=4)
        
        self.play(Create(limit_cycle), run_time=2)
        
        # Trajectories converging to limit cycle
        trajectories_pos = VGroup()
        starts_pos = [(0.1, 0), (1.5, 0), (0, 0.1), (-1.2, 0.5)]
        
        for (x0, y0), col in zip(starts_pos, colors):
            xs, ys = integrate_hopf(mu_val, x0, y0, t_span=(0, 20))
            pts = [axes.c2p(x, y) + LEFT * 3 for x, y in zip(xs, ys)]
            curve = VMobject().set_points_smoothly(pts).set_stroke(col, width=2)
            trajectories_pos.add(curve)
        
        self.play(LaggedStartMap(Create, trajectories_pos, lag_ratio=0.2), run_time=4)
        
        # Final explanation
        explanation = Text("Limit cycle radius r = √μ", font_size=18, color=GOLD)
        explanation.to_edge(DOWN)
        self.play(Write(explanation))
        
        self.wait(2)


# ---------------------------------------------------------------------------
# Scene: Hénon Attractor - the classic "banana/cat" strange attractor
# ---------------------------------------------------------------------------

def henon_map(x, y, a=1.4, b=0.3):
    """
    Hénon map: x_{n+1} = 1 - a*x_n² + y_n
               y_{n+1} = b*x_n
    
    Classic parameters: a=1.4, b=0.3 produce the strange attractor.
    """
    x_new = 1 - a * x**2 + y
    y_new = b * x
    return x_new, y_new


def henon_fixed_points(a=1.4, b=0.3):
    """
    Compute fixed points of Hénon map.
    Fixed point satisfies: x* = 1 - a*x*² + b*x*, y* = b*x*
    Rearranging: a*x*² + (1-b)*x* - 1 = 0
    x* = (-(1-b) ± √((1-b)² + 4a)) / (2a)
    """
    discriminant = (1 - b)**2 + 4 * a
    if discriminant < 0:
        return []
    
    sqrt_disc = np.sqrt(discriminant)
    x1 = (-(1 - b) + sqrt_disc) / (2 * a)
    x2 = (-(1 - b) - sqrt_disc) / (2 * a)
    
    y1 = b * x1
    y2 = b * x2
    
    return [(x1, y1), (x2, y2)]


def henon_jacobian_eigenvalues(x, a=1.4, b=0.3):
    """
    Compute eigenvalues of Jacobian at point (x, y).
    J = [[-2ax, 1], [b, 0]]
    Eigenvalues: λ = (-2ax ± √(4a²x² + 4b)) / 2 = -ax ± √(a²x² + b)
    """
    trace = -2 * a * x
    det = -b
    disc = trace**2 - 4 * det
    
    if disc >= 0:
        lambda1 = (trace + np.sqrt(disc)) / 2
        lambda2 = (trace - np.sqrt(disc)) / 2
    else:
        real = trace / 2
        imag = np.sqrt(-disc) / 2
        lambda1 = complex(real, imag)
        lambda2 = complex(real, -imag)
    
    return lambda1, lambda2


def iterate_henon(a=1.4, b=0.3, x0=0.0, y0=0.0, n_iter=10000, n_transient=1000):
    """Iterate Hénon map, discarding transient."""
    x, y = x0, y0
    
    # Transient
    for _ in range(n_transient):
        x, y = henon_map(x, y, a, b)
    
    # Collect points on attractor
    xs, ys = [x], [y]
    for _ in range(n_iter):
        x, y = henon_map(x, y, a, b)
        xs.append(x)
        ys.append(y)
    
    return np.array(xs), np.array(ys)


class HenonAttractorScene(Scene):
    """
    The Hénon strange attractor - often called the "banana" or resembles
    the fractal structure that inspired comparisons to cats/abstract shapes.
    Shows the iterative construction and self-similar fractal structure.
    """

    def construct(self):
        # Title
        title = Text("Hénon Strange Attractor", font_size=40, color=GOLD)
        subtitle = Text("The 'Fractal Cat' — Discrete Chaos", font_size=24, color=GRAY)
        title.to_edge(UP)
        subtitle.next_to(title, DOWN, buff=0.2)
        
        self.play(Write(title), FadeIn(subtitle, shift=UP * 0.2))
        
        # Axes
        axes = Axes(
            x_range=[-1.5, 1.5, 0.5],
            y_range=[-0.5, 0.5, 0.25],
            x_length=10,
            y_length=5,
            axis_config={"include_tip": True, "include_numbers": True},
        )
        axes_labels = axes.get_axis_labels(x_label="x_n", y_label="y_n")
        
        self.play(Create(axes), Write(axes_labels), run_time=1.5)
        
        # Parameters
        a, b = 1.4, 0.3
        param_text = MathTex(r"a = 1.4, \quad b = 0.3", font_size=28)
        param_text.to_corner(UL)
        
        map_eq = MathTex(
            r"x_{n+1} &= 1 - ax_n^2 + y_n \\",
            r"y_{n+1} &= bx_n",
            font_size=24
        )
        map_eq.next_to(param_text, DOWN, aligned_edge=LEFT)
        
        self.play(Write(param_text), Write(map_eq))
        
        # --- SHOW FIXED POINTS (EQUILIBRIA) ---
        fixed_pts = henon_fixed_points(a, b)
        fp_dots = VGroup()
        fp_labels = VGroup()
        
        fp_title = Text("Fixed Points (Unstable)", font_size=18, color=RED)
        fp_title.next_to(map_eq, DOWN, aligned_edge=LEFT, buff=0.3)
        self.play(Write(fp_title))
        
        for i, (fx, fy) in enumerate(fixed_pts):
            # Check stability via eigenvalues
            eig1, eig2 = henon_jacobian_eigenvalues(fx, a, b)
            
            # Create fixed point marker
            fp_dot = Dot(axes.c2p(fx, fy), color=RED, radius=0.12)
            fp_dot.set_stroke(color=WHITE, width=2)
            
            # Stability info
            if isinstance(eig1, complex):
                stab_str = f"spiral"
            elif abs(eig1) > 1 or abs(eig2) > 1:
                stab_str = f"saddle"
            else:
                stab_str = f"stable"
            
            label_text = f"P{i+1}: ({fx:.2f}, {fy:.2f})"
            fp_label = Text(label_text, font_size=14, color=RED)
            fp_label.next_to(fp_dot, UP + RIGHT, buff=0.1)
            
            fp_dots.add(fp_dot)
            fp_labels.add(fp_label)
        
        self.play(
            LaggedStartMap(GrowFromCenter, fp_dots, lag_ratio=0.3),
            run_time=1.5
        )
        self.play(
            *[Write(lbl) for lbl in fp_labels],
            run_time=1
        )
        self.wait(1)
        
        # --- PHASE 1: Show first few iterations ---
        phase1_label = Text("First Iterations", font_size=20, color=BLUE)
        phase1_label.to_corner(UR)
        self.play(Write(phase1_label))
        
        x, y = 0.0, 0.0
        initial_dot = Dot(axes.c2p(x, y), color=RED, radius=0.1)
        self.play(FadeIn(initial_dot, scale=2))
        
        iteration_dots = VGroup()
        arrows = VGroup()
        
        for i in range(15):
            x_new, y_new = henon_map(x, y, a, b)
            new_dot = Dot(axes.c2p(x_new, y_new), color=BLUE, radius=0.06)
            arrow = Arrow(axes.c2p(x, y), axes.c2p(x_new, y_new), 
                         buff=0.1, stroke_width=1, color=GRAY)
            
            iteration_dots.add(new_dot)
            arrows.add(arrow)
            
            self.play(Create(arrow), FadeIn(new_dot), run_time=0.3)
            x, y = x_new, y_new
        
        self.wait(1)
        
        # --- PHASE 2: Build the full attractor ---
        self.play(
            FadeOut(initial_dot), FadeOut(iteration_dots), FadeOut(arrows),
            FadeOut(phase1_label), FadeOut(fp_title)
        )
        
        # Keep fixed points visible but dimmed
        self.play(
            fp_dots.animate.set_opacity(0.5),
            fp_labels.animate.set_opacity(0.5),
            run_time=0.5
        )
        
        phase2_label = Text("Building the Strange Attractor...", font_size=20, color=GOLD)
        phase2_label.to_corner(UR)
        self.play(Write(phase2_label))
        
        # Generate attractor points
        xs, ys = iterate_henon(a=a, b=b, n_iter=20000, n_transient=500)
        
        # Create dots in batches for animation
        attractor_dots = VGroup()
        n_show = 8000  # Points to display
        indices = np.random.choice(len(xs), size=min(n_show, len(xs)), replace=False)
        
        for idx in indices:
            dot = Dot(axes.c2p(xs[idx], ys[idx]), radius=0.01, color=WHITE)
            dot.set_fill(opacity=0.7)
            attractor_dots.add(dot)
        
        # Animate appearance in waves
        self.play(
            LaggedStartMap(FadeIn, attractor_dots, lag_ratio=0.001),
            run_time=6
        )
        
        # Update label
        final_label = Text("Hénon Strange Attractor", font_size=20, color=GOLD)
        final_label.to_corner(UR)
        self.play(Transform(phase2_label, final_label))
        
        self.wait(1)
        
        # --- PHASE 3: Zoom to show fractal structure ---
        zoom_label = Text("Fractal Self-Similarity", font_size=20, color=TEAL)
        zoom_label.to_corner(UR)
        
        # Create zoom box
        zoom_box = Rectangle(
            width=1.5, height=0.6,
            stroke_color=YELLOW, stroke_width=2
        )
        zoom_box.move_to(axes.c2p(0.6, 0.18))
        
        self.play(Transform(phase2_label, zoom_label), Create(zoom_box), run_time=1)
        self.wait(0.5)
        
        # Zoom in
        self.play(
            axes.animate.scale(3).move_to(axes.c2p(0.6, 0.18) * 3),
            attractor_dots.animate.scale(3).move_to(axes.c2p(0.6, 0.18) * 3),
            fp_dots.animate.scale(3).move_to(axes.c2p(0.6, 0.18) * 3),
            FadeOut(zoom_box),
            FadeOut(param_text), FadeOut(map_eq), FadeOut(axes_labels),
            FadeOut(fp_labels),
            run_time=2
        )
        
        # Explanation
        fractal_text = Text("Each 'line' is actually many parallel strands", font_size=18, color=YELLOW)
        fractal_text.to_edge(DOWN)
        self.play(Write(fractal_text))
        
        self.wait(1)
        
        # Highlight the layered structure
        highlight_text = Text("Infinite layers → Fractal Dimension ≈ 1.26", font_size=18, color=GREEN)
        highlight_text.next_to(fractal_text, UP)
        self.play(Write(highlight_text))
        
        self.wait(2)
        
        # Zoom back out
        self.play(
            axes.animate.scale(1/3).move_to(ORIGIN),
            attractor_dots.animate.scale(1/3).move_to(ORIGIN),
            fp_dots.animate.scale(1/3).move_to(ORIGIN),
            FadeOut(fractal_text), FadeOut(highlight_text),
            run_time=2
        )
        
        # Final title
        final_title = Text("The Hénon Map: Simplest 2D Strange Attractor", font_size=24, color=GOLD)
        final_title.to_edge(DOWN)
        self.play(Write(final_title))
        
        self.wait(2)


# ---------------------------------------------------------------------------
# Scene: Explicit Poincaré Section of Rössler Strange Attractor
# ---------------------------------------------------------------------------

def rossler_system(t, state, a=0.2, b=0.2, c=5.7):
    """
    Rössler system: 
    dx/dt = -y - z
    dy/dt = x + a*y
    dz/dt = b + z*(x - c)
    """
    x, y, z = state
    return [-y - z, x + a * y, b + z * (x - c)]


def integrate_rossler(a=0.2, b=0.2, c=5.7, x0=1.0, y0=1.0, z0=1.0,
                      t_span=(0, 500), n_points=50000):
    """Integrate Rössler system."""
    sol = solve_ivp(rossler_system, t_span, [x0, y0, z0],
                    args=(a, b, c), dense_output=True, max_step=0.05)
    t_eval = np.linspace(*t_span, n_points)
    xyz = sol.sol(t_eval)
    return xyz[0], xyz[1], xyz[2], t_eval


def compute_rossler_poincare(xs, ys, zs, section_axis='y', section_value=0.0, direction='positive'):
    """
    Compute Poincaré section crossings for Rössler attractor.
    Returns crossing points on the specified plane.
    """
    crossings = []
    
    if section_axis == 'y':
        values = ys
    elif section_axis == 'x':
        values = xs
    else:
        values = zs
    
    for i in range(1, len(values)):
        if direction == 'positive':
            crossing = values[i-1] < section_value <= values[i]
        else:
            crossing = values[i-1] > section_value >= values[i]
        
        if crossing:
            # Linear interpolation
            if abs(values[i] - values[i-1]) > 1e-10:
                t_frac = (section_value - values[i-1]) / (values[i] - values[i-1])
            else:
                t_frac = 0.5
            
            x_cross = xs[i-1] + t_frac * (xs[i] - xs[i-1])
            y_cross = ys[i-1] + t_frac * (ys[i] - ys[i-1])
            z_cross = zs[i-1] + t_frac * (zs[i] - zs[i-1])
            crossings.append((x_cross, y_cross, z_cross))
    
    return crossings


class PoincareStrangeAttractorScene(ThreeDScene):
    """
    Explicit visualization of Poincaré section for Rössler strange attractor.
    Shows 3D attractor with cutting plane and the resulting 2D section.
    """

    def construct(self):
        # Title
        title = Text("Poincaré Section of Rössler Attractor", font_size=32, color=GOLD)
        title.to_edge(UP)
        self.add_fixed_in_frame_mobjects(title)
        self.play(Write(title))
        
        # Camera setup
        self.set_camera_orientation(phi=70 * DEGREES, theta=-45 * DEGREES, zoom=0.7)
        
        # 3D Axes
        axes = ThreeDAxes(
            x_range=[-15, 20, 5],
            y_range=[-15, 15, 5],
            z_range=[0, 30, 10],
            x_length=7,
            y_length=6,
            z_length=5,
        )
        self.add(axes)
        
        # Rössler parameters and integration
        a, b, c = 0.2, 0.2, 5.7
        xs, ys, zs, ts = integrate_rossler(a=a, b=b, c=c, t_span=(0, 300), n_points=30000)
        
        # Discard transient
        skip = 5000
        xs, ys, zs = xs[skip:], ys[skip:], zs[skip:]
        
        # Create 3D trajectory
        points = [axes.c2p(x, y, z) for x, y, z in zip(xs[::3], ys[::3], zs[::3])]
        attractor = VMobject()
        attractor.set_points_smoothly(points)
        attractor.set_stroke(width=1)
        attractor.set_color_by_gradient(BLUE, PURPLE, RED)
        
        # --- POINCARÉ SECTION PLANE (y = 0) ---
        section_value = 0.0
        poincare_plane = Surface(
            lambda u, v: axes.c2p(u, section_value, v),
            u_range=[-12, 18],
            v_range=[0, 25],
            resolution=(15, 15),
            fill_opacity=0.2,
            stroke_width=0.5,
            stroke_opacity=0.4,
            checkerboard_colors=[TEAL_E, TEAL_D],
        )
        
        plane_label = Text("Poincaré Section: y = 0", font_size=20, color=TEAL)
        plane_label.to_corner(UL)
        self.add_fixed_in_frame_mobjects(plane_label)
        
        # Show plane first
        self.play(FadeIn(poincare_plane), Write(plane_label), run_time=1.5)
        
        # Draw attractor with ambient rotation
        self.begin_ambient_camera_rotation(rate=0.1)
        self.play(Create(attractor), run_time=8, rate_func=linear)
        self.stop_ambient_camera_rotation()
        
        # --- COMPUTE AND SHOW CROSSINGS ---
        crossings = compute_rossler_poincare(xs, ys, zs, 'y', section_value, 'positive')
        
        crossing_dots = VGroup()
        for x, y, z in crossings[:200]:
            dot = Dot3D(point=axes.c2p(x, y, z), color=YELLOW, radius=0.08)
            crossing_dots.add(dot)
        
        crossing_label = Text(f"Crossings: {len(crossings[:200])} points", font_size=18, color=YELLOW)
        crossing_label.next_to(plane_label, DOWN, aligned_edge=LEFT)
        self.add_fixed_in_frame_mobjects(crossing_label)
        
        self.play(
            FadeIn(crossing_dots, lag_ratio=0.01),
            Write(crossing_label),
            run_time=3
        )
        
        # Move camera to view section from the side
        self.move_camera(
            phi=85 * DEGREES,
            theta=0 * DEGREES,
            run_time=3
        )
        
        explanation = Text("Trajectory pierces plane → 2D pattern", font_size=18, color=WHITE)
        explanation.to_edge(DOWN)
        self.add_fixed_in_frame_mobjects(explanation)
        self.play(Write(explanation))
        
        self.wait(2)
        
        # --- TRANSITION TO 2D POINCARÉ MAP ---
        self.play(
            FadeOut(attractor), FadeOut(poincare_plane), FadeOut(axes),
            FadeOut(title), FadeOut(plane_label), FadeOut(crossing_label),
            FadeOut(explanation), FadeOut(crossing_dots),
            run_time=1
        )
        
        # Switch to 2D view
        self.move_camera(phi=0, theta=-90 * DEGREES, run_time=1)
        
        # 2D axes for Poincaré map
        map_axes = Axes(
            x_range=[-10, 15, 5],
            y_range=[0, 25, 5],
            x_length=7,
            y_length=5,
            axis_config={"include_tip": True},
        )
        map_labels = map_axes.get_axis_labels(x_label="x", y_label="z")
        
        map_title = Text("Poincaré Map (x, z) at y = 0", font_size=28, color=GOLD)
        map_title.to_edge(UP)
        self.add_fixed_in_frame_mobjects(map_title)
        
        self.play(Create(map_axes), Write(map_labels), Write(map_title), run_time=1.5)
        
        # Plot Poincaré section points
        section_dots = VGroup()
        for x, y, z in crossings[:300]:
            dot = Dot(point=map_axes.c2p(x, z), radius=0.03, color=BLUE)
            section_dots.add(dot)
        
        self.play(LaggedStartMap(FadeIn, section_dots, lag_ratio=0.005), run_time=4)
        
        # Show the characteristic curved structure
        structure_text = Text("Strange attractor → Fractal Poincaré section", font_size=20, color=YELLOW)
        structure_text.to_edge(DOWN)
        self.add_fixed_in_frame_mobjects(structure_text)
        self.play(Write(structure_text))
        
        self.wait(2)
        
        # Show return map concept
        return_text = Text("Each point maps to the next crossing", font_size=18, color=GREEN)
        return_text.next_to(structure_text, UP)
        self.add_fixed_in_frame_mobjects(return_text)
        
        # Draw arrows between consecutive crossings
        arrows = VGroup()
        for i in range(min(20, len(crossings)-1)):
            x1, _, z1 = crossings[i]
            x2, _, z2 = crossings[i+1]
            arrow = Arrow(
                map_axes.c2p(x1, z1), map_axes.c2p(x2, z2),
                buff=0.08, stroke_width=1, color=RED, max_tip_length_to_length_ratio=0.15
            )
            arrows.add(arrow)
        
        self.play(Write(return_text), run_time=0.5)
        self.play(LaggedStartMap(Create, arrows, lag_ratio=0.1), run_time=3)
        
        self.wait(2)


# ---------------------------------------------------------------------------
# Scene: Simple Pendulum - Classical ODE with Critical Points & Uniqueness
# ---------------------------------------------------------------------------

def pendulum_system(t, state, g_over_L=1.0, damping=0.0):
    """
    Simple pendulum ODE:
    dθ/dt = ω
    dω/dt = -(g/L)*sin(θ) - damping*ω
    
    State: [θ, ω] where θ = angle, ω = angular velocity
    """
    theta, omega = state
    return [omega, -g_over_L * np.sin(theta) - damping * omega]


def integrate_pendulum(g_over_L=1.0, damping=0.0, theta0=0.5, omega0=0.0,
                       t_span=(0, 30), n_points=2000):
    """Integrate pendulum and return (theta, omega) arrays."""
    sol = solve_ivp(pendulum_system, t_span, [theta0, omega0],
                    args=(g_over_L, damping), dense_output=True, max_step=0.02)
    t_eval = np.linspace(*t_span, n_points)
    state = sol.sol(t_eval)
    return state[0], state[1], t_eval


def pendulum_energy(theta, omega, g_over_L=1.0):
    """Total energy: E = ω²/2 - (g/L)*cos(θ)"""
    return 0.5 * omega**2 - g_over_L * np.cos(theta)


class PendulumDynamicsScene(Scene):
    """
    Classical simple pendulum demonstrating:
    - Phase portrait with critical points (centers and saddles)
    - Uniqueness of solutions (non-crossing trajectories)
    - Poincaré section for periodic orbits
    - Energy conservation (Hamiltonian structure)
    
    NOT a strange attractor - demonstrates regular, predictable dynamics.
    """

    def construct(self):
        # Title
        title = Text("Simple Pendulum: Regular Dynamics", font_size=36, color=GOLD)
        subtitle = Text("Critical Points • Uniqueness • Poincaré Map", font_size=22, color=GRAY)
        title.to_edge(UP)
        subtitle.next_to(title, DOWN, buff=0.15)
        
        self.play(Write(title), FadeIn(subtitle, shift=UP * 0.2))
        
        # Pendulum equation
        eq = MathTex(
            r"\ddot{\theta} = -\frac{g}{L}\sin\theta",
            font_size=28
        )
        eq.next_to(subtitle, DOWN, buff=0.3)
        self.play(Write(eq))
        
        self.wait(1)
        self.play(FadeOut(eq))
        
        # Phase plane axes
        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[-3, 3, 1],
            x_length=9,
            y_length=5,
            axis_config={"include_tip": True},
        )
        axes_labels = axes.get_axis_labels(x_label="\\theta", y_label="\\dot{\\theta}")
        axes.shift(DOWN * 0.3)
        axes_labels.shift(DOWN * 0.3)
        
        self.play(Create(axes), Write(axes_labels), run_time=1.5)
        
        # --- CRITICAL POINTS ---
        critical_title = Text("Critical Points", font_size=22, color=TEAL)
        critical_title.to_corner(UL)
        self.play(Write(critical_title))
        
        g_over_L = 1.0
        
        # Centers at θ = 0, ±2π, ... (stable equilibria - pendulum at bottom)
        centers = VGroup()
        center_labels = VGroup()
        for theta in [-2*np.pi, 0, 2*np.pi]:
            if -4 < theta < 4:  # Only if in range
                center = Dot(axes.c2p(theta, 0), color=GREEN, radius=0.12)
                label = Text("center", font_size=12, color=GREEN)
                label.next_to(center, DOWN, buff=0.15)
                centers.add(center)
                center_labels.add(label)
        
        # Saddles at θ = ±π, ±3π, ... (unstable - pendulum at top)
        saddles = VGroup()
        saddle_labels = VGroup()
        for theta in [-np.pi, np.pi]:
            saddle = Dot(axes.c2p(theta, 0), color=RED, radius=0.12)
            label = Text("saddle", font_size=12, color=RED)
            label.next_to(saddle, DOWN, buff=0.15)
            saddles.add(saddle)
            saddle_labels.add(label)
        
        self.play(
            LaggedStartMap(GrowFromCenter, centers, lag_ratio=0.2),
            LaggedStartMap(Write, center_labels, lag_ratio=0.2),
            run_time=1.5
        )
        
        self.play(
            LaggedStartMap(GrowFromCenter, saddles, lag_ratio=0.2),
            LaggedStartMap(Write, saddle_labels, lag_ratio=0.2),
            run_time=1.5
        )
        
        # Explain
        center_exp = Text("Center: stable (oscillations)", font_size=16, color=GREEN)
        saddle_exp = Text("Saddle: unstable (pendulum inverted)", font_size=16, color=RED)
        center_exp.to_corner(UR)
        saddle_exp.next_to(center_exp, DOWN, aligned_edge=RIGHT)
        
        self.play(Write(center_exp), Write(saddle_exp))
        self.wait(1)
        
        # --- PHASE PORTRAIT: Multiple trajectories ---
        phase_title = Text("Phase Portrait", font_size=22, color=BLUE)
        phase_title.to_corner(UL)
        self.play(Transform(critical_title, phase_title))
        
        trajectories = VGroup()
        
        # Closed orbits around center (libration - oscillating)
        libration_colors = [BLUE, BLUE_B, BLUE_C]
        for i, E in enumerate([0.3, 0.6, 0.9]):
            # Initial condition with given energy at θ=0
            omega0 = np.sqrt(2 * (E + g_over_L))  # E = ω²/2 - cos(θ)
            theta_arr, omega_arr, _ = integrate_pendulum(
                g_over_L=g_over_L, theta0=0.01, omega0=omega0,
                t_span=(0, 15), n_points=1000
            )
            pts = [axes.c2p(t, o) for t, o in zip(theta_arr, omega_arr)]
            curve = VMobject().set_points_smoothly(pts).set_stroke(libration_colors[i], width=2)
            trajectories.add(curve)
        
        # Separatrix (E = 1, the boundary between oscillation and rotation)
        sep_theta = np.linspace(-np.pi + 0.1, np.pi - 0.1, 200)
        sep_omega_pos = np.sqrt(2 * g_over_L * (1 + np.cos(sep_theta)))
        sep_omega_neg = -sep_omega_pos
        
        sep_pts_pos = [axes.c2p(t, o) for t, o in zip(sep_theta, sep_omega_pos)]
        sep_pts_neg = [axes.c2p(t, o) for t, o in zip(sep_theta, sep_omega_neg)]
        
        separatrix_pos = VMobject().set_points_smoothly(sep_pts_pos).set_stroke(YELLOW, width=3)
        separatrix_neg = VMobject().set_points_smoothly(sep_pts_neg).set_stroke(YELLOW, width=3)
        
        # Rotation orbits (E > 1, pendulum goes over the top)
        rotation_colors = [PURPLE, PURPLE_B]
        for i, E in enumerate([1.5, 2.5]):
            omega0 = np.sqrt(2 * (E + g_over_L))
            theta_arr, omega_arr, _ = integrate_pendulum(
                g_over_L=g_over_L, theta0=0.01, omega0=omega0,
                t_span=(0, 10), n_points=500
            )
            pts = [axes.c2p(t, o) for t, o in zip(theta_arr, omega_arr)]
            curve = VMobject().set_points_smoothly(pts).set_stroke(rotation_colors[i], width=2)
            trajectories.add(curve)
        
        self.play(LaggedStartMap(Create, trajectories, lag_ratio=0.2), run_time=5)
        self.play(Create(separatrix_pos), Create(separatrix_neg), run_time=2)
        
        sep_label = Text("Separatrix (E = critical)", font_size=14, color=YELLOW)
        sep_label.next_to(saddle_exp, DOWN, aligned_edge=RIGHT)
        self.play(Write(sep_label))
        
        self.wait(1)
        
        # --- UNIQUENESS OF SOLUTIONS ---
        unique_title = Text("Uniqueness of Solutions", font_size=22, color=GOLD)
        unique_title.to_corner(UL)
        self.play(Transform(critical_title, unique_title))
        
        unique_text = Text("Trajectories NEVER cross!", font_size=20, color=GOLD)
        unique_text.to_edge(DOWN)
        self.play(Write(unique_text))
        
        # Highlight a region to show non-crossing
        highlight_circle = Circle(radius=0.5, color=WHITE, stroke_width=2)
        highlight_circle.move_to(axes.c2p(0.5, 0.8))
        
        self.play(Create(highlight_circle))
        self.play(
            highlight_circle.animate.scale(1.5),
            run_time=1
        )
        
        picard_text = Text("Picard-Lindelöf: Lipschitz → unique solution", font_size=16, color=WHITE)
        picard_text.next_to(unique_text, UP)
        self.play(Write(picard_text), FadeOut(highlight_circle))
        
        self.wait(2)
        
        # --- POINCARÉ SECTION ---
        self.play(
            FadeOut(unique_text), FadeOut(picard_text),
            FadeOut(center_exp), FadeOut(saddle_exp), FadeOut(sep_label)
        )
        
        poincare_title = Text("Poincaré Section", font_size=22, color=TEAL)
        poincare_title.to_corner(UL)
        self.play(Transform(critical_title, poincare_title))
        
        # Poincaré section line at θ = 0
        poincare_line = DashedLine(
            axes.c2p(0, -3), axes.c2p(0, 3),
            color=TEAL, stroke_width=3
        )
        poincare_label = Text("Section: θ = 0", font_size=16, color=TEAL)
        poincare_label.next_to(poincare_line, RIGHT, buff=0.2)
        
        self.play(Create(poincare_line), Write(poincare_label))
        
        # Mark crossings on the section (these are on ω axis)
        crossing_dots = VGroup()
        crossing_labels = VGroup()
        
        # For oscillating orbits, crossings at θ=0 occur at ω = ±√(2(E + g/L))
        energies = [0.3, 0.6, 0.9]
        for E in energies:
            omega_cross = np.sqrt(2 * (E + g_over_L))
            dot_pos = Dot(axes.c2p(0, omega_cross), color=BLUE, radius=0.08)
            dot_neg = Dot(axes.c2p(0, -omega_cross), color=BLUE, radius=0.08)
            crossing_dots.add(dot_pos, dot_neg)
        
        self.play(FadeIn(crossing_dots, scale=2), run_time=1.5)
        
        poincare_exp = Text("Periodic orbit → Fixed points on section", font_size=18, color=YELLOW)
        poincare_exp.to_edge(DOWN)
        self.play(Write(poincare_exp))
        
        self.wait(1)
        
        # --- COMPARISON: Regular vs Chaotic ---
        comparison = Text("NOT Chaotic: Closed orbits, predictable, integrable", font_size=18, color=GREEN)
        comparison.next_to(poincare_exp, UP)
        self.play(Write(comparison))
        
        # Final summary
        self.wait(2)
        
        summary = VGroup(
            Text("✓ Critical points classified", font_size=16, color=GREEN),
            Text("✓ Trajectories never cross (uniqueness)", font_size=16, color=GREEN),
            Text("✓ Poincaré section: fixed points", font_size=16, color=GREEN),
            Text("✓ Regular (non-chaotic) dynamics", font_size=16, color=GREEN),
        )
        summary.arrange(DOWN, aligned_edge=LEFT, buff=0.15)
        summary.to_corner(UR)
        
        self.play(LaggedStartMap(FadeIn, summary, lag_ratio=0.2, shift=LEFT*0.3), run_time=2)
        
        self.wait(2)


# ---------------------------------------------------------------------------
# Scene: μ Growth Animation - Watch limit cycle evolve with parameter
# ---------------------------------------------------------------------------

class MuGrowthScene(Scene):
    """
    Animate the Van der Pol phase portrait as μ grows from 0 to 5.
    Shows how the limit cycle shape changes:
    - μ ≈ 0: Nearly circular (harmonic oscillator)
    - μ ≈ 1: Smooth oval
    - μ > 2: Relaxation oscillations (sharp corners)
    """

    def construct(self):
        # Title
        title = Text("Van der Pol: Evolution with μ", font_size=36, color=GOLD)
        title.to_edge(UP)
        self.play(Write(title))

        # Create axes
        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[-8, 8, 2],
            x_length=8,
            y_length=6,
            axis_config={"include_tip": True},
        )
        x_label = axes.get_x_axis_label("x")
        y_label = axes.get_y_axis_label("\\dot{x}")
        
        self.play(Create(axes), Write(x_label), Write(y_label))

        # μ tracker
        mu_tracker = ValueTracker(0.1)

        # μ display
        mu_display = always_redraw(
            lambda: VGroup(
                Text("μ = ", font_size=28),
                DecimalNumber(mu_tracker.get_value(), num_decimal_places=2, font_size=28, color=YELLOW)
            ).arrange(RIGHT, buff=0.1).to_corner(UL).shift(DOWN * 0.5)
        )
        self.add(mu_display)

        # Function to compute limit cycle for given μ
        def get_limit_cycle_curve(mu_val):
            if mu_val < 0.05:
                mu_val = 0.05  # Avoid μ=0 (no limit cycle)
            
            # Integrate to reach limit cycle
            sol = solve_ivp(van_der_pol, (0, 100), [0.1, 0.0],
                           args=(mu_val,), dense_output=True, max_step=0.01)
            # Extract last cycle
            t_final = np.linspace(90, 100, 500)
            xy = sol.sol(t_final)
            
            points = [axes.c2p(x, y) for x, y in zip(xy[0], xy[1])]
            curve = VMobject()
            curve.set_points_smoothly(points)
            curve.set_stroke(color=BLUE, width=3)
            return curve

        # Initial curve
        limit_cycle = get_limit_cycle_curve(0.1)
        self.play(Create(limit_cycle), run_time=2)

        # Equilibrium point (origin)
        origin_dot = Dot(axes.c2p(0, 0), color=RED, radius=0.1)
        origin_label = Text("Unstable", font_size=14, color=RED)
        origin_label.next_to(origin_dot, DOWN, buff=0.1)
        self.play(FadeIn(origin_dot), Write(origin_label))

        # Animate μ growth
        def update_curve(curve):
            new_curve = get_limit_cycle_curve(mu_tracker.get_value())
            curve.become(new_curve)

        limit_cycle.add_updater(update_curve)

        # Phase labels
        phase_label = Text("Nearly harmonic", font_size=20, color=GREEN)
        phase_label.to_corner(UR)
        self.play(Write(phase_label))

        # Phase 1: μ from 0.1 to 0.5
        self.play(mu_tracker.animate.set_value(0.5), run_time=3, rate_func=linear)
        
        # Phase 2: μ from 0.5 to 2.0
        new_label = Text("Transition region", font_size=20, color=YELLOW)
        new_label.to_corner(UR)
        self.play(Transform(phase_label, new_label))
        self.play(mu_tracker.animate.set_value(2.0), run_time=4, rate_func=linear)
        
        # Phase 3: μ from 2.0 to 5.0 (relaxation oscillations)
        relax_label = Text("Relaxation oscillations", font_size=20, color=ORANGE)
        relax_label.to_corner(UR)
        self.play(Transform(phase_label, relax_label))
        self.play(mu_tracker.animate.set_value(5.0), run_time=5, rate_func=linear)

        limit_cycle.remove_updater(update_curve)

        # Explanation
        explanation = VGroup(
            Text("μ small: smooth oscillations", font_size=16, color=GREEN),
            Text("μ large: sharp 'relaxation' behavior", font_size=16, color=ORANGE),
            Text("Fast jumps + slow recovery", font_size=16, color=ORANGE),
        )
        explanation.arrange(DOWN, aligned_edge=LEFT, buff=0.1)
        explanation.to_edge(DOWN)
        self.play(Write(explanation))

        self.wait(2)


# ---------------------------------------------------------------------------
# Scene: Particle Animation with Data Tooltips
# ---------------------------------------------------------------------------

class ParticleTrajectoryScene(Scene):
    """
    Animate a particle moving along the Van der Pol trajectory
    with live data displays showing:
    - Position (x)
    - Velocity (ẋ = y)
    - Acceleration (ÿ)
    - "Energy" (x² + y²)/2
    - Damping coefficient μ(1-x²)
    """

    def construct(self):
        # Title
        title = Text("Van der Pol: Particle Dynamics", font_size=32, color=GOLD)
        title.to_edge(UP)
        self.play(Write(title))

        # Parameters
        mu = 2.0

        # Create axes
        axes = Axes(
            x_range=[-3.5, 3.5, 1],
            y_range=[-5, 5, 1],
            x_length=7,
            y_length=5,
            axis_config={"include_tip": True},
        )
        axes.shift(LEFT * 1.5)
        x_label = axes.get_x_axis_label("x", direction=DOWN)
        y_label = axes.get_y_axis_label("\\dot{x}", direction=LEFT)
        
        self.play(Create(axes), Write(x_label), Write(y_label))

        # Compute trajectory
        t_span = (0, 30)
        n_points = 3000
        sol = solve_ivp(van_der_pol, t_span, [0.1, 0.0], args=(mu,),
                       dense_output=True, max_step=0.01)
        t_vals = np.linspace(*t_span, n_points)
        trajectory = sol.sol(t_vals)
        x_vals, y_vals = trajectory[0], trajectory[1]

        # Draw faded trajectory path
        traj_points = [axes.c2p(x, y) for x, y in zip(x_vals, y_vals)]
        traj_path = VMobject().set_points_smoothly(traj_points)
        traj_path.set_stroke(color=BLUE, width=1, opacity=0.3)
        self.play(Create(traj_path), run_time=2)

        # Time tracker
        time_tracker = ValueTracker(0)
        total_time = t_span[1]

        # Particle dot
        def get_current_state(t):
            idx = int((t / total_time) * (n_points - 1))
            idx = min(max(idx, 0), n_points - 1)
            return x_vals[idx], y_vals[idx]

        particle = always_redraw(
            lambda: Dot(
                axes.c2p(*get_current_state(time_tracker.get_value())),
                color=YELLOW,
                radius=0.12
            )
        )
        
        # Glowing effect
        particle_glow = always_redraw(
            lambda: Dot(
                axes.c2p(*get_current_state(time_tracker.get_value())),
                color=YELLOW,
                radius=0.2
            ).set_fill(opacity=0.3)
        )

        self.play(FadeIn(particle_glow), FadeIn(particle))

        # Trail (recent path)
        trail = TracedPath(
            lambda: axes.c2p(*get_current_state(time_tracker.get_value())),
            stroke_color=YELLOW,
            stroke_width=2,
            stroke_opacity=[1, 0],  # Fading trail
            dissipating_time=0.5,
        )
        self.add(trail)

        # Data panel on the right
        data_panel = VGroup()
        
        def create_data_display():
            t = time_tracker.get_value()
            x, y = get_current_state(t)
            
            # Compute derived quantities
            accel = mu * (1 - x**2) * y - x  # ÿ = μ(1-x²)ẏ - x
            energy = 0.5 * (x**2 + y**2)
            damping_coeff = mu * (1 - x**2)
            damping_type = "Energy IN" if damping_coeff > 0 else "Energy OUT"
            damping_color = RED if damping_coeff > 0 else GREEN
            
            panel = VGroup(
                Text("─── Live Data ───", font_size=18, color=WHITE),
                VGroup(
                    Text("t = ", font_size=16),
                    DecimalNumber(t, num_decimal_places=2, font_size=16, color=TEAL)
                ).arrange(RIGHT, buff=0.1),
                VGroup(
                    Text("x = ", font_size=16),
                    DecimalNumber(x, num_decimal_places=3, font_size=16, color=BLUE)
                ).arrange(RIGHT, buff=0.1),
                VGroup(
                    Text("ẋ = ", font_size=16),
                    DecimalNumber(y, num_decimal_places=3, font_size=16, color=PURPLE)
                ).arrange(RIGHT, buff=0.1),
                VGroup(
                    Text("ẍ = ", font_size=16),
                    DecimalNumber(accel, num_decimal_places=3, font_size=16, color=ORANGE)
                ).arrange(RIGHT, buff=0.1),
                Text("─────────────", font_size=14, color=GRAY),
                VGroup(
                    Text("E = ", font_size=16),
                    DecimalNumber(energy, num_decimal_places=3, font_size=16, color=GOLD)
                ).arrange(RIGHT, buff=0.1),
                VGroup(
                    Text("Damping: ", font_size=14),
                    DecimalNumber(damping_coeff, num_decimal_places=2, font_size=14, color=damping_color)
                ).arrange(RIGHT, buff=0.1),
                Text(damping_type, font_size=14, color=damping_color),
            )
            panel.arrange(DOWN, aligned_edge=LEFT, buff=0.12)
            panel.to_corner(UR).shift(DOWN * 0.5)
            return panel

        data_display = always_redraw(create_data_display)
        self.add(data_display)

        # Velocity vector
        def get_velocity_arrow():
            t = time_tracker.get_value()
            x, y = get_current_state(t)
            
            # Velocity is (ẋ, ẍ) = (y, μ(1-x²)y - x)
            vx = y
            vy = mu * (1 - x**2) * y - x
            
            # Scale for visibility
            scale = 0.15
            start = axes.c2p(x, y)
            end = axes.c2p(x + scale * vx, y + scale * vy)
            
            arrow = Arrow(start, end, buff=0, stroke_width=3, color=RED, max_tip_length_to_length_ratio=0.3)
            return arrow

        velocity_arrow = always_redraw(get_velocity_arrow)
        self.add(velocity_arrow)

        # Legend
        legend = VGroup(
            VGroup(Dot(color=YELLOW, radius=0.08), Text("Particle", font_size=14)).arrange(RIGHT, buff=0.1),
            VGroup(Arrow(ORIGIN, RIGHT * 0.4, color=RED, stroke_width=2), Text("Velocity", font_size=14)).arrange(RIGHT, buff=0.1),
        )
        legend.arrange(DOWN, aligned_edge=LEFT, buff=0.1)
        legend.to_corner(DL)
        self.add(legend)

        # Region indicator (|x| < 1 vs |x| > 1)
        region_indicator = always_redraw(
            lambda: Text(
                f"|x| = {abs(get_current_state(time_tracker.get_value())[0]):.2f}" + 
                (" < 1 (pumping)" if abs(get_current_state(time_tracker.get_value())[0]) < 1 else " > 1 (damping)"),
                font_size=16,
                color=RED if abs(get_current_state(time_tracker.get_value())[0]) < 1 else GREEN
            ).to_edge(DOWN)
        )
        self.add(region_indicator)

        # Animate the particle along trajectory
        self.play(
            time_tracker.animate.set_value(total_time),
            run_time=20,
            rate_func=linear
        )

        self.wait(1)

        # Final message
        final_msg = Text("Limit cycle reached: self-sustained oscillation", font_size=20, color=GOLD)
        final_msg.to_edge(DOWN)
        self.play(Transform(region_indicator, final_msg))

        self.wait(2)


# ---------------------------------------------------------------------------
# Scene: Lorenz Attractor with parameter ρ (rho) evolution over time
# ---------------------------------------------------------------------------

class LorenzRhoGrowthScene(ThreeDScene):
    """
    Animate the Lorenz attractor as the parameter ρ (rho) evolves over time.
    Shows transition from stable fixed point → limit cycle → strange attractor.
    
    Key transitions:
    - ρ < 1: Origin is globally stable
    - 1 < ρ < 24.74: Two stable fixed points (C+ and C-)
    - ρ > 24.74: Strange attractor emerges (chaotic regime)
    """

    def construct(self):
        self.set_camera_orientation(phi=75 * DEGREES, theta=-45 * DEGREES)

        # Fixed parameters
        sigma = 10.0
        beta = 8 / 3

        # Create 3D axes
        axes = ThreeDAxes(
            x_range=[-30, 30, 10],
            y_range=[-30, 30, 10],
            z_range=[0, 50, 10],
            x_length=8,
            y_length=8,
            z_length=5,
        )
        labels = axes.get_axis_labels(x_label="x", y_label="y", z_label="z")
        self.add(axes, labels)

        # Title
        title = Text("Lorenz Attractor: ρ Parameter Evolution", font_size=28, color=GOLD)
        title.to_edge(UP)
        self.add_fixed_in_frame_mobjects(title)
        self.play(Write(title))

        # Parameter tracker for ρ
        rho_tracker = ValueTracker(0.5)

        # ρ value display
        rho_display = always_redraw(
            lambda: VGroup(
                Text("ρ = ", font_size=24),
                DecimalNumber(rho_tracker.get_value(), num_decimal_places=1, font_size=24, color=YELLOW)
            ).arrange(RIGHT, buff=0.1).to_corner(UL).shift(DOWN * 0.5)
        )
        self.add_fixed_in_frame_mobjects(rho_display)

        # Regime indicator
        def get_regime_text():
            rho = rho_tracker.get_value()
            if rho < 1:
                text = "Regime: Origin stable (no oscillation)"
                color = GREEN
            elif rho < 24.74:
                text = "Regime: Two stable fixed points"
                color = BLUE
            else:
                text = "Regime: STRANGE ATTRACTOR (chaos)"
                color = RED
            return Text(text, font_size=18, color=color).to_corner(UR).shift(DOWN * 0.5)

        regime_display = always_redraw(get_regime_text)
        self.add_fixed_in_frame_mobjects(regime_display)

        # Function to compute trajectory for current ρ
        def compute_lorenz_trajectory(rho_val, t_span=(0, 30), n_points=5000):
            """Integrate Lorenz system for given rho."""
            def lorenz_rho(t, state):
                x, y, z = state
                return [
                    sigma * (y - x),
                    x * (rho_val - z) - y,
                    x * y - beta * z
                ]
            
            # Start near origin but not exactly at it
            x0, y0, z0 = 1.0, 1.0, 1.0
            
            sol = solve_ivp(lorenz_rho, t_span, [x0, y0, z0],
                            dense_output=True, max_step=0.01)
            t_eval = np.linspace(*t_span, n_points)
            xyz = sol.sol(t_eval)
            return xyz[0], xyz[1], xyz[2]

        # Initial trajectory
        current_rho = rho_tracker.get_value()
        xs, ys, zs = compute_lorenz_trajectory(current_rho)
        points = [axes.c2p(x, y, z) for x, y, z in zip(xs, ys, zs)]
        
        trajectory = VMobject()
        trajectory.set_points_smoothly(points[:1000])
        trajectory.set_stroke(color=BLUE, width=2)
        self.add(trajectory)

        # Equilibrium points display
        def get_equilibria():
            """Compute and display equilibrium points for current rho."""
            rho = rho_tracker.get_value()
            
            equilibria = VGroup()
            
            # Origin is always an equilibrium
            origin_dot = Dot3D(point=axes.c2p(0, 0, 0), color=RED, radius=0.15)
            equilibria.add(origin_dot)
            
            # For rho > 1, two symmetric fixed points exist: C+ and C-
            if rho > 1:
                # C± = (±√(β(ρ-1)), ±√(β(ρ-1)), ρ-1)
                sqrt_val = np.sqrt(beta * (rho - 1))
                z_eq = rho - 1
                
                c_plus = Dot3D(point=axes.c2p(sqrt_val, sqrt_val, z_eq), color=GREEN, radius=0.12)
                c_minus = Dot3D(point=axes.c2p(-sqrt_val, -sqrt_val, z_eq), color=GREEN, radius=0.12)
                equilibria.add(c_plus, c_minus)
            
            return equilibria

        equilibria_group = always_redraw(get_equilibria)
        self.add(equilibria_group)

        # --- PHASE 1: ρ from 0.5 to 1 (subcritical) ---
        phase1_text = Text("Phase 1: Subcritical (ρ < 1)", font_size=20, color=GREEN)
        phase1_text.to_edge(DOWN)
        self.add_fixed_in_frame_mobjects(phase1_text)
        self.play(Write(phase1_text))
        
        self.play(rho_tracker.animate.set_value(0.99), run_time=3, rate_func=smooth)
        
        # Update trajectory
        xs, ys, zs = compute_lorenz_trajectory(0.99)
        new_points = [axes.c2p(x, y, z) for x, y, z in zip(xs, ys, zs)]
        new_traj = VMobject().set_points_smoothly(new_points[:2000]).set_stroke(color=BLUE, width=2)
        self.play(Transform(trajectory, new_traj), run_time=2)

        self.play(FadeOut(phase1_text))

        # --- PHASE 2: ρ from 1 to 24 (two stable fixed points) ---
        phase2_text = Text("Phase 2: Stable Fixed Points (1 < ρ < 24.74)", font_size=20, color=BLUE)
        phase2_text.to_edge(DOWN)
        self.add_fixed_in_frame_mobjects(phase2_text)
        self.play(Write(phase2_text))

        # Slowly increase rho
        for rho_val in [5, 10, 15, 20, 24]:
            self.play(rho_tracker.animate.set_value(rho_val), run_time=2, rate_func=smooth)
            
            xs, ys, zs = compute_lorenz_trajectory(rho_val)
            new_points = [axes.c2p(x, y, z) for x, y, z in zip(xs, ys, zs)]
            new_traj = VMobject().set_points_smoothly(new_points).set_stroke(color=BLUE, width=2)
            self.play(Transform(trajectory, new_traj), run_time=1.5)
        
        self.play(FadeOut(phase2_text))

        # --- PHASE 3: ρ crosses critical value → chaos ---
        phase3_text = Text("Phase 3: Onset of Chaos (ρ > 24.74)", font_size=20, color=RED)
        phase3_text.to_edge(DOWN)
        self.add_fixed_in_frame_mobjects(phase3_text)
        self.play(Write(phase3_text))

        # Critical transition
        self.play(rho_tracker.animate.set_value(24.74), run_time=2, rate_func=smooth)
        
        critical_msg = Text("Critical point: ρ ≈ 24.74 (Hopf bifurcation)", font_size=16, color=YELLOW)
        critical_msg.next_to(phase3_text, UP)
        self.add_fixed_in_frame_mobjects(critical_msg)
        self.play(Write(critical_msg))
        self.wait(1)
        self.play(FadeOut(critical_msg))

        # Into chaos - show famous butterfly
        for rho_val in [26, 28]:
            self.play(rho_tracker.animate.set_value(rho_val), run_time=2)
            
            xs, ys, zs = compute_lorenz_trajectory(rho_val, t_span=(0, 50), n_points=8000)
            new_points = [axes.c2p(x, y, z) for x, y, z in zip(xs, ys, zs)]
            new_traj = VMobject().set_points_smoothly(new_points)
            
            # Color gradient for chaotic trajectory
            new_traj.set_stroke(width=1.5)
            new_traj.set_color_by_gradient(BLUE, PURPLE, RED)
            
            self.play(Transform(trajectory, new_traj), run_time=3)
        
        self.play(FadeOut(phase3_text))

        # Camera movement to appreciate the butterfly
        self.move_camera(phi=60 * DEGREES, theta=30 * DEGREES, run_time=3)
        self.wait(1)
        self.move_camera(phi=80 * DEGREES, theta=-60 * DEGREES, run_time=3)

        # Final message
        chaos_msg = Text("Strange Attractor: Deterministic Chaos", font_size=22, color=GOLD)
        chaos_msg.to_edge(DOWN)
        self.add_fixed_in_frame_mobjects(chaos_msg)
        self.play(Write(chaos_msg))

        self.wait(3)


# ---------------------------------------------------------------------------
# Scene: Lorenz Attractor with particle trajectory and data tooltips
# ---------------------------------------------------------------------------

class LorenzParticleScene(ThreeDScene):
    """
    Particle tracing the Lorenz attractor with real-time data display:
    - Position (x, y, z)
    - Velocity components (ẋ, ẏ, ż)
    - Speed |v|
    - Distance to equilibrium points
    - Current "wing" (left/right based on sign of x)
    - Local Lyapunov indicator (divergence rate)
    """

    def construct(self):
        self.set_camera_orientation(phi=70 * DEGREES, theta=-45 * DEGREES)

        # Lorenz parameters
        sigma = 10.0
        rho = 28.0
        beta = 8 / 3

        # Compute equilibrium points
        sqrt_val = np.sqrt(beta * (rho - 1))
        z_eq = rho - 1
        C_plus = np.array([sqrt_val, sqrt_val, z_eq])
        C_minus = np.array([-sqrt_val, -sqrt_val, z_eq])

        # Create 3D axes
        axes = ThreeDAxes(
            x_range=[-25, 25, 10],
            y_range=[-30, 30, 10],
            z_range=[0, 50, 10],
            x_length=7,
            y_length=7,
            z_length=5,
        )
        labels = axes.get_axis_labels(x_label="x", y_label="y", z_label="z")
        self.add(axes, labels)

        # Title
        title = Text("Lorenz Attractor: Particle Dynamics", font_size=26, color=GOLD)
        title.to_edge(UP)
        self.add_fixed_in_frame_mobjects(title)

        # Pre-integrate for smooth animation
        total_time = 40
        n_points = 8000
        t_span = (0, total_time)
        
        sol = solve_ivp(
            lambda t, state: lorenz(t, state, sigma, rho, beta),
            t_span, [1.0, 1.0, 1.0],
            dense_output=True, max_step=0.005
        )
        t_dense = np.linspace(0, total_time, n_points)
        trajectory_data = sol.sol(t_dense)

        # Draw faint attractor shape first
        attractor_points = [axes.c2p(x, y, z) for x, y, z in 
                           zip(trajectory_data[0], trajectory_data[1], trajectory_data[2])]
        attractor_curve = VMobject()
        attractor_curve.set_points_smoothly(attractor_points)
        attractor_curve.set_stroke(color=GRAY, width=0.5, opacity=0.3)
        self.play(Create(attractor_curve), run_time=3)

        # Mark equilibrium points
        origin_dot = Dot3D(point=axes.c2p(0, 0, 0), color=RED, radius=0.15)
        c_plus_dot = Dot3D(point=axes.c2p(*C_plus), color=GREEN, radius=0.12)
        c_minus_dot = Dot3D(point=axes.c2p(*C_minus), color=GREEN, radius=0.12)
        
        eq_label = Text("Equilibria: O (red), C± (green)", font_size=14, color=WHITE)
        eq_label.to_corner(DL)
        self.add_fixed_in_frame_mobjects(eq_label)
        self.add(origin_dot, c_plus_dot, c_minus_dot)

        # Time tracker
        time_tracker = ValueTracker(0)

        def get_current_state(t):
            """Get interpolated state at time t."""
            idx = int(t / total_time * (n_points - 1))
            idx = np.clip(idx, 0, n_points - 1)
            return trajectory_data[0][idx], trajectory_data[1][idx], trajectory_data[2][idx]

        def get_velocity(x, y, z):
            """Compute velocity at given point."""
            dx = sigma * (y - x)
            dy = x * (rho - z) - y
            dz = x * y - beta * z
            return dx, dy, dz

        # Particle
        def get_particle():
            t = time_tracker.get_value()
            x, y, z = get_current_state(t)
            
            # Color based on which "wing" (sign of x)
            color = BLUE if x > 0 else ORANGE
            
            pos = axes.c2p(x, y, z)
            return Dot3D(point=pos, color=color, radius=0.15)

        particle = always_redraw(get_particle)
        self.add(particle)

        # Trail
        trail = VMobject()
        trail.set_stroke(width=2)

        def update_trail(mob):
            t = time_tracker.get_value()
            n_trail = int(t / total_time * n_points)
            n_trail = min(n_trail, n_points - 1)
            
            if n_trail > 10:
                trail_points = [axes.c2p(trajectory_data[0][i], trajectory_data[1][i], trajectory_data[2][i])
                               for i in range(max(0, n_trail - 500), n_trail)]
                mob.set_points_smoothly(trail_points)
                mob.set_color_by_gradient(BLUE, PURPLE, RED)

        trail.add_updater(update_trail)
        self.add(trail)

        # Data display panel
        def create_data_display():
            t = time_tracker.get_value()
            x, y, z = get_current_state(t)
            dx, dy, dz = get_velocity(x, y, z)
            
            speed = np.sqrt(dx**2 + dy**2 + dz**2)
            
            # Distance to equilibrium points
            dist_C_plus = np.sqrt((x - C_plus[0])**2 + (y - C_plus[1])**2 + (z - C_plus[2])**2)
            dist_C_minus = np.sqrt((x - C_minus[0])**2 + (y - C_minus[1])**2 + (z - C_minus[2])**2)
            
            # Current wing
            wing = "Right (C+)" if x > 0 else "Left (C-)"
            wing_color = BLUE if x > 0 else ORANGE
            
            # Local divergence indicator (trace of Jacobian)
            # For Lorenz: div(F) = -σ - 1 - β < 0 (always contracting in volume)
            divergence = -sigma - 1 - beta  # ≈ -13.67
            
            panel = VGroup(
                Text("═══ Particle Data ═══", font_size=14, color=GOLD),
                VGroup(
                    Text(f"x = ", font_size=14),
                    DecimalNumber(x, num_decimal_places=2, font_size=14, color=WHITE)
                ).arrange(RIGHT, buff=0.05),
                VGroup(
                    Text(f"y = ", font_size=14),
                    DecimalNumber(y, num_decimal_places=2, font_size=14, color=WHITE)
                ).arrange(RIGHT, buff=0.05),
                VGroup(
                    Text(f"z = ", font_size=14),
                    DecimalNumber(z, num_decimal_places=2, font_size=14, color=WHITE)
                ).arrange(RIGHT, buff=0.05),
                Text("───────────", font_size=12, color=GRAY),
                VGroup(
                    Text("|v| = ", font_size=14),
                    DecimalNumber(speed, num_decimal_places=1, font_size=14, color=YELLOW)
                ).arrange(RIGHT, buff=0.05),
                Text("───────────", font_size=12, color=GRAY),
                VGroup(
                    Text("d(C+) = ", font_size=12),
                    DecimalNumber(dist_C_plus, num_decimal_places=1, font_size=12, color=GREEN)
                ).arrange(RIGHT, buff=0.05),
                VGroup(
                    Text("d(C-) = ", font_size=12),
                    DecimalNumber(dist_C_minus, num_decimal_places=1, font_size=12, color=GREEN)
                ).arrange(RIGHT, buff=0.05),
                Text("───────────", font_size=12, color=GRAY),
                Text(f"Wing: {wing}", font_size=14, color=wing_color),
                Text("───────────", font_size=12, color=GRAY),
                VGroup(
                    Text("div(F) = ", font_size=12),
                    DecimalNumber(divergence, num_decimal_places=2, font_size=12, color=RED)
                ).arrange(RIGHT, buff=0.05),
                Text("(volume contracting)", font_size=10, color=RED),
            )
            panel.arrange(DOWN, aligned_edge=LEFT, buff=0.08)
            panel.to_corner(UR).shift(DOWN * 0.3)
            return panel

        data_display = always_redraw(create_data_display)
        self.add_fixed_in_frame_mobjects(data_display)

        # Wing switching counter
        switch_count = ValueTracker(0)
        last_sign = [1]  # Mutable for closure

        def count_switches(dt):
            t = time_tracker.get_value()
            x, _, _ = get_current_state(t)
            current_sign = 1 if x > 0 else -1
            if current_sign != last_sign[0]:
                switch_count.increment_value(1)
                last_sign[0] = current_sign

        # Switch counter display
        switch_display = always_redraw(
            lambda: VGroup(
                Text("Wing Switches: ", font_size=16),
                Integer(int(switch_count.get_value()), font_size=16, color=YELLOW)
            ).arrange(RIGHT, buff=0.1).to_corner(DL).shift(UP * 0.5)
        )
        self.add_fixed_in_frame_mobjects(switch_display)

        # Animate particle
        self.play(
            time_tracker.animate.set_value(total_time),
            UpdateFromFunc(switch_count, count_switches),
            run_time=30,
            rate_func=linear
        )

        # Camera rotation to appreciate 3D structure
        self.move_camera(phi=60 * DEGREES, theta=45 * DEGREES, run_time=3)

        # Final message
        trail.clear_updaters()
        
        final_msg = VGroup(
            Text("Chaotic dynamics: sensitive dependence on initial conditions", font_size=18, color=GOLD),
            Text("Particle switches between wings unpredictably", font_size=16, color=WHITE),
        ).arrange(DOWN, buff=0.1).to_edge(DOWN)
        self.add_fixed_in_frame_mobjects(final_msg)
        self.play(Write(final_msg))

        self.wait(3)