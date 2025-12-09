import React, { useEffect, useRef } from 'react';
import katex from 'katex';

const Eq = ({ children, display = false }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(children, ref.current, {
        throwOnError: false,
        displayMode: display,
      });
    }
  }, [children, display]);
  return <span ref={ref} className={display ? 'block my-4 text-center' : 'inline'} />;
};

const Section7Conclusion = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">§7 Conclusion & References</h2>
      
      {/* Summary Table */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">7.1 Summary of Dynamical Systems</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 text-blue-400">System</th>
                <th className="text-left py-3 px-4 text-blue-400">Dimension</th>
                <th className="text-left py-3 px-4 text-blue-400">Key Behavior</th>
                <th className="text-left py-3 px-4 text-blue-400">Attractor Type</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-700">
                <td className="py-3 px-4 font-semibold text-yellow-400">Van der Pol</td>
                <td className="py-3 px-4">2D (continuous)</td>
                <td className="py-3 px-4">Self-sustained oscillation</td>
                <td className="py-3 px-4">Limit cycle</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="py-3 px-4 font-semibold text-red-400">Lorenz</td>
                <td className="py-3 px-4">3D (continuous)</td>
                <td className="py-3 px-4">Butterfly effect, chaos</td>
                <td className="py-3 px-4">Strange attractor</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="py-3 px-4 font-semibold text-green-400">Logistic Map</td>
                <td className="py-3 px-4">1D (discrete)</td>
                <td className="py-3 px-4">Period-doubling cascade</td>
                <td className="py-3 px-4">Chaotic (r &gt; 3.57)</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="py-3 px-4 font-semibold text-purple-400">Duffing</td>
                <td className="py-3 px-4">2D + forcing</td>
                <td className="py-3 px-4">Bistability, hysteresis</td>
                <td className="py-3 px-4">Strange attractor</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-cyan-400">Hénon Map</td>
                <td className="py-3 px-4">2D (discrete)</td>
                <td className="py-3 px-4">CERN beam dynamics model</td>
                <td className="py-3 px-4">Strange attractor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Key Equations Cheat Sheet */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-green-400 mb-4">7.2 Key Equations Cheat Sheet</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Van der Pol */}
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-yellow-400 font-semibold mb-2">Van der Pol Oscillator</p>
            <Eq display>{'\\ddot{x} - \\mu(1-x^2)\\dot{x} + x = 0'}</Eq>
            <p className="text-slate-400 text-sm mt-2">
              μ &gt; 0: limit cycle | μ = 0: harmonic oscillator
            </p>
          </div>
          
          {/* Lorenz */}
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-red-400 font-semibold mb-2">Lorenz System</p>
            <Eq display>{'\\dot{x} = \\sigma(y-x), \\; \\dot{y} = x(\\rho-z)-y, \\; \\dot{z} = xy-\\beta z'}</Eq>
            <p className="text-slate-400 text-sm mt-2">
              Classic: σ=10, ρ=28, β=8/3
            </p>
          </div>
          
          {/* Logistic */}
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-green-400 font-semibold mb-2">Logistic Map</p>
            <Eq display>{'x_{n+1} = r \\cdot x_n(1-x_n)'}</Eq>
            <p className="text-slate-400 text-sm mt-2">
              Chaos onset: r∞ ≈ 3.5699...
            </p>
          </div>
          
          {/* Jacobian */}
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-purple-400 font-semibold mb-2">Stability (Jacobian)</p>
            <Eq display>{'J = \\begin{pmatrix} \\partial f/\\partial x & \\partial f/\\partial y \\\\ \\partial g/\\partial x & \\partial g/\\partial y \\end{pmatrix}'}</Eq>
            <p className="text-slate-400 text-sm mt-2">
              Stable if Re(λ) &lt; 0 for all eigenvalues
            </p>
          </div>
          
          {/* Lyapunov */}
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-cyan-400 font-semibold mb-2">Lyapunov Exponent</p>
            <Eq display>{'\\lambda = \\lim_{t \\to \\infty} \\frac{1}{t} \\ln\\frac{|\\delta(t)|}{|\\delta(0)|}'}</Eq>
            <p className="text-slate-400 text-sm mt-2">
              λ &gt; 0 ⟹ chaos (sensitive dependence)
            </p>
          </div>
          
          {/* Feigenbaum */}
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-orange-400 font-semibold mb-2">Feigenbaum Constant</p>
            <Eq display>{'\\delta = \\lim_{n \\to \\infty} \\frac{r_n - r_{n-1}}{r_{n+1} - r_n} \\approx 4.669...'}</Eq>
            <p className="text-slate-400 text-sm mt-2">
              Universal for period-doubling
            </p>
          </div>
        </div>
      </div>
      
      {/* Classification Flowchart */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">7.3 Equilibrium Classification</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
            <p className="text-green-400 font-bold mb-2">Stable Node</p>
            <p className="text-slate-300 text-sm">Tr(J) &lt; 0, Det(J) &gt; 0</p>
            <p className="text-slate-400 text-xs">Δ &gt; 0, real λ</p>
          </div>
          <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
            <p className="text-green-400 font-bold mb-2">Stable Spiral</p>
            <p className="text-slate-300 text-sm">Tr(J) &lt; 0, Det(J) &gt; 0</p>
            <p className="text-slate-400 text-xs">Δ &lt; 0, complex λ</p>
          </div>
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
            <p className="text-blue-400 font-bold mb-2">Center</p>
            <p className="text-slate-300 text-sm">Tr(J) = 0, Det(J) &gt; 0</p>
            <p className="text-slate-400 text-xs">Pure imaginary λ</p>
          </div>
          <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
            <p className="text-red-400 font-bold mb-2">Unstable Node</p>
            <p className="text-slate-300 text-sm">Tr(J) &gt; 0, Det(J) &gt; 0</p>
            <p className="text-slate-400 text-xs">Δ &gt; 0, real λ</p>
          </div>
          <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
            <p className="text-red-400 font-bold mb-2">Unstable Spiral</p>
            <p className="text-slate-300 text-sm">Tr(J) &gt; 0, Det(J) &gt; 0</p>
            <p className="text-slate-400 text-xs">Δ &lt; 0, complex λ</p>
          </div>
          <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-400 font-bold mb-2">Saddle Point</p>
            <p className="text-slate-300 text-sm">Det(J) &lt; 0</p>
            <p className="text-slate-400 text-xs">Real λ, opposite signs</p>
          </div>
        </div>
      </div>
      
      {/* Key Theorems */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-yellow-400 mb-4">7.4 Fundamental Theorems</h3>
        
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-blue-400 font-semibold mb-1">Poincaré-Bendixson Theorem</p>
            <p className="text-slate-300 text-sm">
              In 2D autonomous systems, bounded trajectories must converge to a fixed point, 
              limit cycle, or heteroclinic/homoclinic orbit. <em>Chaos is impossible in 2D!</em>
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-green-500">
            <p className="text-green-400 font-semibold mb-1">Liouville's Theorem</p>
            <p className="text-slate-300 text-sm">
              Hamiltonian systems preserve phase space volume. This is why CERN uses symplectic 
              integrators and symplectic maps.
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-red-500">
            <p className="text-red-400 font-semibold mb-1">Li-Yorke Theorem</p>
            <p className="text-slate-300 text-sm">
              "Period 3 implies chaos" — if a 1D map has a period-3 orbit, it has orbits of 
              all periods and uncountably many chaotic orbits.
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-purple-500">
            <p className="text-purple-400 font-semibold mb-1">Takens' Embedding Theorem</p>
            <p className="text-slate-300 text-sm">
              A strange attractor can be reconstructed from a single time series using delay 
              coordinates. This enables experimental chaos analysis.
            </p>
          </div>
        </div>
      </div>
      
      {/* References */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">7.5 References & Further Reading</h3>
        
        <div className="space-y-3 text-slate-300">
          <div className="flex gap-4">
            <span className="text-blue-400 font-mono">[1]</span>
            <p>
              Strogatz, S. H. (2015). <em>Nonlinear Dynamics and Chaos</em>. 
              Westview Press. — The classic textbook for this field.
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="text-blue-400 font-mono">[2]</span>
            <p>
              Lorenz, E. N. (1963). "Deterministic Nonperiodic Flow." 
              <em>Journal of the Atmospheric Sciences</em>, 20(2), 130-141.
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="text-blue-400 font-mono">[3]</span>
            <p>
              Ott, E., Grebogi, C., & Yorke, J. A. (1990). "Controlling Chaos." 
              <em>Physical Review Letters</em>, 64(11), 1196.
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="text-blue-400 font-mono">[4]</span>
            <p>
              Feigenbaum, M. J. (1978). "Quantitative Universality for a Class of 
              Nonlinear Transformations." <em>Journal of Statistical Physics</em>, 19(1), 25-52.
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="text-blue-400 font-mono">[5]</span>
            <p>
              Wiedemann, H. (2015). <em>Particle Accelerator Physics</em>. 
              Springer. — For beam dynamics and chaos control at CERN.
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="text-blue-400 font-mono">[6]</span>
            <p>
              Li, T. Y., & Yorke, J. A. (1975). "Period Three Implies Chaos." 
              <em>The American Mathematical Monthly</em>, 82(10), 985-992.
            </p>
          </div>
        </div>
      </div>
      
      {/* Final Quote */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-8 border border-purple-500/30 text-center">
        <p className="text-2xl text-slate-200 italic mb-4">
          "Chaos: When the present determines the future, but the approximate present 
          does not approximately determine the future."
        </p>
        <p className="text-slate-400">— Edward Lorenz</p>
      </div>
      
      {/* Footer */}
      <div className="text-center text-slate-500 text-sm py-8">
        <p>Created with React, Canvas API, and KaTeX</p>
        <p className="mt-1">
          Dynamical Systems Visualization Project • 2024
        </p>
      </div>
    </div>
  );
};

export default Section7Conclusion;
