import React, { useState, useEffect, useRef } from 'react';
import { M, Eq, BoxedEq } from './MathComponents';

// Interactive Van der Pol Phase Portrait (same logic, PT labels)
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

      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px sans-serif';
      ctx.fillText('x', width - 15, cy - 5);
      ctx.fillText('y', cx + 5, 15);

      // Energy zones
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.fillRect(cx - scale, 0, 2 * scale, height);
      
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cx - scale, 0);
      ctx.lineTo(cx - scale, height);
      ctx.moveTo(cx + scale, 0);
      ctx.lineTo(cx + scale, height);
      ctx.stroke();
      ctx.setLineDash([]);

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

      const points = trajRef.current.points;
      if (points.length > 1) {
        ctx.beginPath();
        const [sx, sy] = toScreen(points[0].x, points[0].y);
        ctx.moveTo(sx, sy);
        for (let i = 1; i < points.length; i++) {
          const [px, py] = toScreen(points[i].x, points[i].y);
          ctx.lineTo(px, py);
        }
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const [px, py] = toScreen(trajRef.current.x, trajRef.current.y);
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

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
          {isPlaying ? 'Pausar' : 'Iniciar'}
        </button>
        <button
          onClick={reset}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        >
          Reiniciar
        </button>
      </div>
      <canvas ref={canvasRef} className="w-full max-w-md mx-auto rounded-lg" />
      <p className="text-xs text-gray-500 mt-2 text-center">
        Zona verde: |x| &lt; 1 (energia entra) • Ponto amarelo: origem instável
      </p>
    </div>
  );
};

const Section2VanDerPolPT = () => {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold mb-6 text-green-400 border-b border-gray-800 pb-4">
        2. O Oscilador de Van der Pol
      </h2>

      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-gray-300 mb-6">
          Descoberto por Balthasar van der Pol em 1927 ao estudar circuitos com válvulas de vácuo, 
          este oscilador foi o primeiro exemplo de um <strong>ciclo limite</strong> — uma 
          oscilação periódica auto-sustentada que emerge da dinâmica não-linear.
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-white">Equação Governante</h3>
          <Eq>{String.raw`\frac{d^2x}{dt^2} - \mu(1-x^2)\frac{dx}{dt} + x = 0`}</Eq>
          <p className="text-gray-400 text-sm mt-2">
            onde <M>{String.raw`\mu > 0`}</M> é o parâmetro de amortecimento não-linear
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">2.1 Forma de Sistema de Primeira Ordem</h3>
        <p className="text-gray-300 mb-4">
          Para analisar o plano de fase, convertemos para um sistema de primeira ordem introduzindo <M>{String.raw`y = \dot{x}`}</M>:
        </p>

        <BoxedEq label="Sistema de Van der Pol">
          {String.raw`\begin{cases} \dot{x} = y \\ \dot{y} = \mu(1-x^2)y - x \end{cases}`}
        </BoxedEq>

        <h3 className="text-2xl font-semibold mb-4 text-white">2.2 Mecanismo de Bombeamento de Energia</h3>
        <p className="text-gray-300 mb-4">
          O gênio do oscilador de Van der Pol está no seu <strong>amortecimento dependente da amplitude</strong>:
        </p>

        <BoxedEq label="Coeficiente de Amortecimento Efetivo">
          {String.raw`\gamma_{\text{ef}}(x) = -\mu(1 - x^2)`}
        </BoxedEq>

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-gray-300">Condição</th>
                <th className="py-3 px-4 text-gray-300">Amortecimento Efetivo</th>
                <th className="py-3 px-4 text-gray-300">Efeito</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr className="border-b border-gray-800 bg-green-900/20">
                <td className="py-3 px-4"><M>{String.raw`|x| < 1`}</M></td>
                <td className="py-3 px-4">Negativo (anti-amortecimento)</td>
                <td className="py-3 px-4 text-green-400">Energia ENTRA</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4"><M>{String.raw`|x| = 1`}</M></td>
                <td className="py-3 px-4">Zero</td>
                <td className="py-3 px-4 text-yellow-400">Ponto de equilíbrio</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><M>{String.raw`|x| > 1`}</M></td>
                <td className="py-3 px-4">Positivo (amortecimento normal)</td>
                <td className="py-3 px-4 text-red-400">Energia SAI</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-700/50 mb-8">
          <h4 className="font-bold text-green-300 mb-2">🔄 Auto-Regulação</h4>
          <p className="text-gray-300">
            Quando a amplitude é pequena, energia é injetada, causando crescimento. Quando a amplitude 
            é grande, energia é dissipada, causando decaimento. Isso cria um <strong>
            ciclo limite estável</strong> em uma amplitude intermediária.
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">2.3 Retrato de Fase Interativo</h3>
        <p className="text-gray-300 mb-4">
          Observe como a trajetória espirala para fora da origem instável e se estabiliza no 
          ciclo limite. Ajuste <M>{String.raw`\mu`}</M> para ver como afeta a dinâmica:
        </p>

        <VanDerPolPlot />

        <h3 className="text-2xl font-semibold mt-8 mb-4 text-white">2.4 Oscilações de Relaxação</h3>
        <p className="text-gray-300 mb-4">
          Quando <M>{String.raw`\mu \gg 1`}</M>, o oscilador exibe <strong>oscilações de relaxação</strong>: 
          movimento lento ao longo da nulclina cúbica seguido de saltos rápidos entre os ramos.
        </p>

        <BoxedEq label="Escala do Período">
          {String.raw`T \approx (3 - 2\ln 2)\mu \approx 1{,}614\mu`}
        </BoxedEq>

        <div className="bg-gradient-to-r from-pink-900/30 to-rose-900/30 rounded-xl p-6 border border-pink-700/50">
          <h4 className="font-bold text-pink-300 mb-2">Aplicações Biológicas</h4>
          <p className="text-gray-300">
            O oscilador de Van der Pol modela muitos ritmos biológicos:
          </p>
          <ul className="list-disc list-inside text-gray-400 mt-2">
            <li><strong>Batimento cardíaco</strong> — Nodo sinoatrial como oscilador de relaxação</li>
            <li><strong>Impulsos neurais</strong> — Modelo de FitzHugh-Nagumo</li>
            <li><strong>Ritmos circadianos</strong> — Ciclos biológicos diários</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Section2VanDerPolPT;
