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

// Interactive Van der Pol Phase Portrait
const VanDerPolPlot = () => {
  const canvasRef = useRef(null);
  const [mu, setMu] = useState(2.0);
  const [isPlaying, setIsPlaying] = useState(true);
  const trajRef = useRef({ x: 0.1, y: 0.1, points: [] });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 400;
    const height = canvas.height = 400;
    
    const scale = 60;
    const cx = width / 2;
    const cy = height / 2;

    const toScreen = (x, y) => [cx + x * scale, cy - y * scale];

    const vanDerPol = (x, y, mu) => ({
      dx: y,
      dy: mu * (1 - x * x) * y - x
    });

    const rk4Step = (x, y, dt) => {
      const k1 = vanDerPol(x, y, mu);
      const k2 = vanDerPol(x + 0.5 * dt * k1.dx, y + 0.5 * dt * k1.dy, mu);
      const k3 = vanDerPol(x + 0.5 * dt * k2.dx, y + 0.5 * dt * k2.dy, mu);
      const k4 = vanDerPol(x + dt * k3.dx, y + dt * k3.dy, mu);
      return {
        x: x + (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx),
        y: y + (dt / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy)
      };
    };

    const animate = () => {
      // Clear
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 0.5;
      for (let i = -3; i <= 3; i++) {
        const [x1, y1] = toScreen(i, -4);
        const [x2, y2] = toScreen(i, 4);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        const [x3, y3] = toScreen(-4, i);
        const [x4, y4] = toScreen(4, i);
        ctx.beginPath();
        ctx.moveTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px sans-serif';
      ctx.fillText('x', width - 15, cy - 5);
      ctx.fillText('y', cx + 5, 15);

      // Energy zones
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.fillRect(cx - scale, 0, 2 * scale, height);
      
      // |x| = 1 lines
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cx - scale, 0);
      ctx.lineTo(cx - scale, height);
      ctx.moveTo(cx + scale, 0);
      ctx.lineTo(cx + scale, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Update trajectory
      if (isPlaying) {
        for (let i = 0; i < 5; i++) {
          const { x, y } = rk4Step(trajRef.current.x, trajRef.current.y, 0.02);
          trajRef.current.x = x;
          trajRef.current.y = y;
          trajRef.current.points.push({ x, y });
          if (trajRef.current.points.length > 1500) {
            trajRef.current.points.shift();
          }
        }
      }

      // Draw trajectory
      const points = trajRef.current.points;
      if (points.length > 1) {
        ctx.beginPath();
        const [sx, sy] = toScreen(points[0].x, points[0].y);
        ctx.moveTo(sx, sy);
        for (let i = 1; i < points.length; i++) {
          const alpha = i / points.length;
          const [px, py] = toScreen(points[i].x, points[i].y);
          ctx.lineTo(px, py);
        }
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Current point
      const [px, py] = toScreen(trajRef.current.x, trajRef.current.y);
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Origin (unstable)
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [mu, isPlaying]);

  const reset = () => {
    trajRef.current = { x: 0.1, y: 0.1, points: [] };
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">μ =</label>
          <input
            type="range" min="0.1" max="5" step="0.1"
            value={mu}
            onChange={(e) => { setMu(parseFloat(e.target.value)); reset(); }}
            className="w-32"
          />
          <span className="text-blue-400 font-mono w-12">{mu.toFixed(1)}</span>
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={reset}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        >
          Reset
        </button>
      </div>
      <canvas ref={canvasRef} className="w-full max-w-md mx-auto rounded-lg" />
      <p className="text-xs text-gray-500 mt-2 text-center">
        Green zone: |x| &lt; 1 (energy pumped in) • Yellow dot: unstable origin
      </p>
    </div>
  );
};

const Section2VanDerPol = () => {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold mb-6 text-green-400 border-b border-gray-800 pb-4">
        2. The Van der Pol Oscillator
      </h2>

      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-gray-300 mb-6">
          Discovered by Balthasar van der Pol in 1927 while studying vacuum tube circuits, 
          this oscillator was the first example of a <strong>limit cycle</strong> — a 
          self-sustained periodic oscillation that emerges from nonlinear dynamics.
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-white">Governing Equation</h3>
          <Eq>{"\\frac{d^2x}{dt^2} - \\mu(1-x^2)\\frac{dx}{dt} + x = 0"}</Eq>
          <p className="text-gray-400 text-sm mt-2">
            where <M>{"\\mu > 0"}</M> is the nonlinear damping parameter
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">2.1 First-Order System Form</h3>
        <p className="text-gray-300 mb-4">
          To analyze the phase plane, we convert to a first-order system by introducing <M>{"y = \\dot{x}"}</M>:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
          <Eq>{"\\begin{cases} \\dot{x} = y \\\\ \\dot{y} = \\mu(1-x^2)y - x \\end{cases}"}</Eq>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">2.2 Energy Pumping Mechanism</h3>
        <p className="text-gray-300 mb-4">
          The genius of the Van der Pol oscillator lies in its <strong>amplitude-dependent damping</strong>:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <Eq>{"\\gamma_{\\text{eff}}(x) = -\\mu(1 - x^2)"}</Eq>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-gray-300">Condition</th>
                <th className="py-3 px-4 text-gray-300">Effective Damping</th>
                <th className="py-3 px-4 text-gray-300">Effect</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr className="border-b border-gray-800 bg-green-900/20">
                <td className="py-3 px-4"><M>{"|x| < 1"}</M></td>
                <td className="py-3 px-4">Negative (anti-damping)</td>
                <td className="py-3 px-4 text-green-400">Energy pumped IN</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4"><M>{"|x| = 1"}</M></td>
                <td className="py-3 px-4">Zero</td>
                <td className="py-3 px-4 text-yellow-400">Balance point</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><M>{"|x| > 1"}</M></td>
                <td className="py-3 px-4">Positive (normal damping)</td>
                <td className="py-3 px-4 text-red-400">Energy dissipated OUT</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-700/50 mb-8">
          <h4 className="font-bold text-green-300 mb-2">🔄 Self-Regulation</h4>
          <p className="text-gray-300">
            When amplitude is small, energy is pumped in, causing growth. When amplitude 
            is large, energy is dissipated, causing decay. This creates a <strong>
            stable limit cycle</strong> at an intermediate amplitude.
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">2.3 Interactive Phase Portrait</h3>
        <p className="text-gray-300 mb-4">
          Watch how the trajectory spirals outward from the unstable origin and settles onto 
          the limit cycle. Adjust <M>{"\\mu"}</M> to see how it affects the dynamics:
        </p>

        <VanDerPolPlot />

        <h3 className="text-2xl font-semibold mt-8 mb-4 text-white">2.4 Relaxation Oscillations</h3>
        <p className="text-gray-300 mb-4">
          When <M>{"\\mu \\gg 1"}</M>, the oscillator exhibits <strong>relaxation oscillations</strong>: 
          slow creep along the cubic nullcline followed by rapid jumps between branches.
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h4 className="text-lg font-semibold mb-2 text-white">Period Scaling</h4>
          <Eq>{"T \\approx (3 - 2\\ln 2)\\mu \\approx 1.614\\mu"}</Eq>
          <p className="text-gray-400 text-sm mt-2">
            The period grows linearly with μ for large values
          </p>
        </div>

        <div className="bg-gradient-to-r from-pink-900/30 to-rose-900/30 rounded-xl p-6 border border-pink-700/50">
          <h4 className="font-bold text-pink-300 mb-2">Biological Applications</h4>
          <p className="text-gray-300">
            The Van der Pol oscillator models many biological rhythms:
          </p>
          <ul className="list-disc list-inside text-gray-400 mt-2">
            <li><strong>Heartbeat</strong> — Sinoatrial node as relaxation oscillator</li>
            <li><strong>Neural spikes</strong> — FitzHugh-Nagumo model</li>
            <li><strong>Circadian rhythms</strong> — Daily biological cycles</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Section2VanDerPol;
