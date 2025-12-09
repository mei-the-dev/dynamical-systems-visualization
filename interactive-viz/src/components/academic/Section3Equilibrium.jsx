import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const M = ({ children }) => (
  <span dangerouslySetInnerHTML={{ __html: katex.renderToString(children, { throwOnError: false }) }} />
);

const Eq = ({ children }) => (
  <div className="my-4 overflow-x-auto">
    <div className="text-center text-lg" dangerouslySetInnerHTML={{
      __html: katex.renderToString(children, { throwOnError: false, displayMode: true }),
    }} />
  </div>
);

// Interactive eigenvalue visualization
const EigenvaluePlot = () => {
  const canvasRef = useRef(null);
  const [mu, setMu] = useState(1.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 400;
    const height = canvas.height = 300;
    
    const cx = width / 2;
    const cy = height / 2;
    const scale = 50;

    // Clear
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * scale, 0);
      ctx.lineTo(cx + i * scale, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, cy + i * scale);
      ctx.lineTo(width, cy + i * scale);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Unit circle (stability boundary for discrete systems)
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, scale, 0, Math.PI * 2);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.fillText('Re(λ)', width - 35, cy - 5);
    ctx.fillText('Im(λ)', cx + 5, 15);

    // Compute eigenvalues
    // λ = (μ ± √(μ² - 4)) / 2
    const discriminant = mu * mu - 4;
    let lambda1, lambda2;
    
    if (discriminant >= 0) {
      // Real eigenvalues
      lambda1 = { re: (mu + Math.sqrt(discriminant)) / 2, im: 0 };
      lambda2 = { re: (mu - Math.sqrt(discriminant)) / 2, im: 0 };
    } else {
      // Complex eigenvalues
      const realPart = mu / 2;
      const imagPart = Math.sqrt(-discriminant) / 2;
      lambda1 = { re: realPart, im: imagPart };
      lambda2 = { re: realPart, im: -imagPart };
    }

    // Draw eigenvalues
    const drawEigenvalue = (lambda, color, label) => {
      const x = cx + lambda.re * scale;
      const y = cy - lambda.im * scale;
      
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(label, x + 10, y + 4);
    };

    drawEigenvalue(lambda1, '#ef4444', 'λ₁');
    drawEigenvalue(lambda2, '#3b82f6', 'λ₂');

    // Stability region (Re < 0)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
    ctx.fillRect(0, 0, cx, height);

    // Draw Re = 0 line (stability boundary)
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Info text
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px sans-serif';
    const type = discriminant < 0 
      ? (mu > 0 ? 'Unstable Spiral' : 'Stable Spiral')
      : (lambda1.re > 0 ? 'Unstable Node' : 'Stable Node');
    ctx.fillText(`Type: ${type}`, 10, 20);
    ctx.fillText(`Δ = μ² - 4 = ${discriminant.toFixed(2)}`, 10, 35);
    
  }, [mu]);

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm text-gray-400">μ =</label>
        <input
          type="range" min="0" max="4" step="0.1"
          value={mu}
          onChange={(e) => setMu(parseFloat(e.target.value))}
          className="w-40"
        />
        <span className="text-blue-400 font-mono w-12">{mu.toFixed(1)}</span>
      </div>
      <canvas ref={canvasRef} className="w-full max-w-md mx-auto rounded-lg" />
      <p className="text-xs text-gray-500 mt-2 text-center">
        Green region: Re(λ) &lt; 0 (stable) • Eigenvalues shown as circles
      </p>
    </div>
  );
};

const Section3Equilibrium = () => {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold mb-6 text-yellow-400 border-b border-gray-800 pb-4">
        3. Equilibrium Analysis
      </h2>

      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-gray-300 mb-6">
          To understand the long-term behavior of a dynamical system, we first find its 
          <strong> equilibrium points</strong> (fixed points) and analyze their <strong>stability</strong>.
        </p>

        <h3 className="text-2xl font-semibold mb-4 text-white">3.1 Finding Equilibria</h3>
        <p className="text-gray-300 mb-4">
          Equilibrium points occur where the velocity is zero:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <Eq>{"\\dot{x} = 0 \\quad \\text{and} \\quad \\dot{y} = 0"}</Eq>
        </div>

        <p className="text-gray-300 mb-4">
          For the Van der Pol system:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <Eq>{"y = 0 \\quad \\text{and} \\quad \\mu(1-x^2)y - x = 0"}</Eq>
          <p className="text-gray-400 text-center mt-2">
            Substituting <M>{"y = 0"}</M> gives <M>{"-x = 0"}</M>, so <M>{"x = 0"}</M>
          </p>
        </div>

        <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-xl p-6 border border-yellow-700/50 mb-8">
          <p className="text-gray-300">
            The Van der Pol oscillator has exactly <strong>one equilibrium</strong> at the origin: <M>{"(x^*, y^*) = (0, 0)"}</M>
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">3.2 The Jacobian Matrix</h3>
        <p className="text-gray-300 mb-4">
          To determine stability, we linearize the system near the equilibrium using the <strong>Jacobian matrix</strong>:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h4 className="text-lg font-semibold mb-2 text-white">General Jacobian</h4>
          <Eq>{"J(x,y) = \\begin{pmatrix} \\frac{\\partial f}{\\partial x} & \\frac{\\partial f}{\\partial y} \\\\[0.5em] \\frac{\\partial g}{\\partial x} & \\frac{\\partial g}{\\partial y} \\end{pmatrix}"}</Eq>
        </div>

        <p className="text-gray-300 mb-4">
          For our system with <M>{"f(x,y) = y"}</M> and <M>{"g(x,y) = \\mu(1-x^2)y - x"}</M>:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h4 className="text-lg font-semibold mb-2 text-white">Computing Partial Derivatives</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Eq>{"\\frac{\\partial f}{\\partial x} = 0"}</Eq>
              <Eq>{"\\frac{\\partial f}{\\partial y} = 1"}</Eq>
            </div>
            <div>
              <Eq>{"\\frac{\\partial g}{\\partial x} = -2\\mu xy - 1"}</Eq>
              <Eq>{"\\frac{\\partial g}{\\partial y} = \\mu(1-x^2)"}</Eq>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
          <h4 className="text-lg font-semibold mb-2 text-white">Jacobian at Origin (0, 0)</h4>
          <Eq>{"J(0,0) = \\begin{pmatrix} 0 & 1 \\\\ -1 & \\mu \\end{pmatrix}"}</Eq>
          <div className="grid md:grid-cols-2 gap-4 mt-4 text-gray-400">
            <div>Trace: <M>{"\\text{tr}(J) = 0 + \\mu = \\mu"}</M></div>
            <div>Determinant: <M>{"\\det(J) = 0 \\cdot \\mu - (-1) \\cdot 1 = 1"}</M></div>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">3.3 Eigenvalue Analysis</h3>
        <p className="text-gray-300 mb-4">
          The eigenvalues of the Jacobian determine the local stability:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h4 className="text-lg font-semibold mb-2 text-white">Characteristic Equation</h4>
          <Eq>{"\\det(J - \\lambda I) = 0"}</Eq>
          <Eq>{"\\det \\begin{pmatrix} -\\lambda & 1 \\\\ -1 & \\mu - \\lambda \\end{pmatrix} = 0"}</Eq>
          <Eq>{"\\lambda^2 - \\mu\\lambda + 1 = 0"}</Eq>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
          <h4 className="text-lg font-semibold mb-2 text-white">Eigenvalues (Quadratic Formula)</h4>
          <Eq>{"\\lambda_{1,2} = \\frac{\\mu \\pm \\sqrt{\\mu^2 - 4}}{2}"}</Eq>
          <p className="text-gray-400 text-sm mt-2 text-center">
            Discriminant: <M>{"\\Delta = \\mu^2 - 4"}</M>
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">3.4 Stability Classification</h3>
        
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800">
                <th className="py-3 px-4 text-gray-300">μ Range</th>
                <th className="py-3 px-4 text-gray-300">Discriminant</th>
                <th className="py-3 px-4 text-gray-300">Eigenvalues</th>
                <th className="py-3 px-4 text-gray-300">Type</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4"><M>{"\\mu = 0"}</M></td>
                <td className="py-3 px-4"><M>{"\\Delta = -4"}</M></td>
                <td className="py-3 px-4"><M>{"\\pm i"}</M></td>
                <td className="py-3 px-4 text-yellow-400">Center (neutral)</td>
              </tr>
              <tr className="border-b border-gray-800 bg-red-900/20">
                <td className="py-3 px-4"><M>{"0 < \\mu < 2"}</M></td>
                <td className="py-3 px-4"><M>{"\\Delta < 0"}</M></td>
                <td className="py-3 px-4">Complex, Re &gt; 0</td>
                <td className="py-3 px-4 text-red-400">Unstable Spiral</td>
              </tr>
              <tr className="border-b border-gray-800 bg-red-900/20">
                <td className="py-3 px-4"><M>{"\\mu = 2"}</M></td>
                <td className="py-3 px-4"><M>{"\\Delta = 0"}</M></td>
                <td className="py-3 px-4"><M>{"\\lambda = 1"}</M> (repeated)</td>
                <td className="py-3 px-4 text-red-400">Degenerate Node</td>
              </tr>
              <tr className="bg-red-900/20">
                <td className="py-3 px-4"><M>{"\\mu > 2"}</M></td>
                <td className="py-3 px-4"><M>{"\\Delta > 0"}</M></td>
                <td className="py-3 px-4">Real, both &gt; 0</td>
                <td className="py-3 px-4 text-red-400">Unstable Node</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-xl p-6 border border-red-700/50 mb-8">
          <p className="text-gray-300">
            For <strong>any</strong> <M>{"\\mu > 0"}</M>, the origin is <strong>unstable</strong> 
            because the trace <M>{"\\text{tr}(J) = \\mu > 0"}</M>, which means the real parts 
            of eigenvalues are positive. Trajectories spiral <em>away</em> from the origin.
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">3.5 Interactive Eigenvalue Visualization</h3>
        <p className="text-gray-300 mb-4">
          Adjust <M>{"\\mu"}</M> to see how the eigenvalues move in the complex plane:
        </p>

        <EigenvaluePlot />

        <h3 className="text-2xl font-semibold mt-8 mb-4 text-white">3.6 Poincaré-Bendixson Theorem</h3>
        <p className="text-gray-300 mb-4">
          If the origin is unstable, where do trajectories go? The <strong>Poincaré-Bendixson theorem</strong> 
          provides the answer:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h4 className="text-lg font-semibold mb-2 text-purple-400">Theorem (Poincaré-Bendixson)</h4>
          <p className="text-gray-300 italic">
            If a trajectory in <M>{"\\mathbb{R}^2"}</M> enters a closed, bounded region 
            containing <strong>no equilibria</strong> and never leaves, then it must 
            approach a <strong>periodic orbit</strong> (limit cycle).
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-700/50">
          <h4 className="font-bold text-green-300 mb-2">Application to Van der Pol</h4>
          <ol className="list-decimal list-inside text-gray-300 space-y-2">
            <li>Origin is unstable → trajectories spiral <em>outward</em></li>
            <li>Energy dissipation when |x| &gt; 1 → trajectories are <em>bounded</em></li>
            <li>Trajectories enter an annular region containing no equilibria</li>
            <li>Therefore, a <strong>limit cycle</strong> must exist</li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Section3Equilibrium;
