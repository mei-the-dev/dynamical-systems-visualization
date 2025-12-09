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
      ? (mu > 0 ? 'Espiral Instável' : 'Espiral Estável')
      : (lambda1.re > 0 ? 'Nó Instável' : 'Nó Estável');
    ctx.fillText(`Tipo: ${type}`, 10, 20);
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
        Região verde: Re(λ) &lt; 0 (estável) • Autovalores mostrados como círculos
      </p>
    </div>
  );
};

const Section3EquilibriumPT = () => {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold mb-6 text-yellow-400 border-b border-gray-800 pb-4">
        3. Análise de Equilíbrio
      </h2>

      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-gray-300 mb-6">
          Para compreender o comportamento de longo prazo de um sistema dinâmico, primeiro encontramos seus 
          <strong> pontos de equilíbrio</strong> (pontos fixos) e analisamos sua <strong>estabilidade</strong>.
        </p>

        <h3 className="text-2xl font-semibold mb-4 text-white">3.1 Encontrando Equilíbrios</h3>
        <p className="text-gray-300 mb-4">
          Os pontos de equilíbrio ocorrem onde a velocidade é zero:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <Eq>{"\\dot{x} = 0 \\quad \\text{e} \\quad \\dot{y} = 0"}</Eq>
        </div>

        <p className="text-gray-300 mb-4">
          Para o sistema de Van der Pol:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <Eq>{"y = 0 \\quad \\text{e} \\quad \\mu(1-x^2)y - x = 0"}</Eq>
          <p className="text-gray-400 text-center mt-2">
            Substituindo <M>{"y = 0"}</M> obtemos <M>{"-x = 0"}</M>, portanto <M>{"x = 0"}</M>
          </p>
        </div>

        <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-xl p-6 border border-yellow-700/50 mb-8">
          <p className="text-gray-300">
            O oscilador de Van der Pol possui exatamente <strong>um equilíbrio</strong> na origem: <M>{"(x^*, y^*) = (0, 0)"}</M>
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">3.2 A Matriz Jacobiana</h3>
        <p className="text-gray-300 mb-4">
          Para determinar a estabilidade, linearizamos o sistema próximo ao equilíbrio usando a <strong>matriz Jacobiana</strong>:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h4 className="text-lg font-semibold mb-2 text-white">Jacobiano Geral</h4>
          <Eq>{"J(x,y) = \\begin{pmatrix} \\frac{\\partial f}{\\partial x} & \\frac{\\partial f}{\\partial y} \\\\[0.5em] \\frac{\\partial g}{\\partial x} & \\frac{\\partial g}{\\partial y} \\end{pmatrix}"}</Eq>
        </div>

        <p className="text-gray-300 mb-4">
          Para nosso sistema com <M>{"f(x,y) = y"}</M> e <M>{"g(x,y) = \\mu(1-x^2)y - x"}</M>:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h4 className="text-lg font-semibold mb-2 text-white">Calculando as Derivadas Parciais</h4>
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
          <h4 className="text-lg font-semibold mb-2 text-white">Jacobiano na Origem (0, 0)</h4>
          <Eq>{"J(0,0) = \\begin{pmatrix} 0 & 1 \\\\ -1 & \\mu \\end{pmatrix}"}</Eq>
          <div className="grid md:grid-cols-2 gap-4 mt-4 text-gray-400">
            <div>Traço: <M>{"\\text{tr}(J) = 0 + \\mu = \\mu"}</M></div>
            <div>Determinante: <M>{"\\det(J) = 0 \\cdot \\mu - (-1) \\cdot 1 = 1"}</M></div>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">3.3 Análise de Autovalores</h3>
        <p className="text-gray-300 mb-4">
          Os autovalores do Jacobiano determinam a estabilidade local:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h4 className="text-lg font-semibold mb-2 text-white">Equação Característica</h4>
          <Eq>{"\\det(J - \\lambda I) = 0"}</Eq>
          <Eq>{"\\det \\begin{pmatrix} -\\lambda & 1 \\\\ -1 & \\mu - \\lambda \\end{pmatrix} = 0"}</Eq>
          <Eq>{"\\lambda^2 - \\mu\\lambda + 1 = 0"}</Eq>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
          <h4 className="text-lg font-semibold mb-2 text-white">Autovalores (Fórmula de Bhaskara)</h4>
          <Eq>{"\\lambda_{1,2} = \\frac{\\mu \\pm \\sqrt{\\mu^2 - 4}}{2}"}</Eq>
          <p className="text-gray-400 text-sm mt-2 text-center">
            Discriminante: <M>{"\\Delta = \\mu^2 - 4"}</M>
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">3.4 Classificação de Estabilidade</h3>
        
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800">
                <th className="py-3 px-4 text-gray-300">Intervalo de μ</th>
                <th className="py-3 px-4 text-gray-300">Discriminante</th>
                <th className="py-3 px-4 text-gray-300">Autovalores</th>
                <th className="py-3 px-4 text-gray-300">Tipo</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4"><M>{"\\mu = 0"}</M></td>
                <td className="py-3 px-4"><M>{"\\Delta = -4"}</M></td>
                <td className="py-3 px-4"><M>{"\\pm i"}</M></td>
                <td className="py-3 px-4 text-yellow-400">Centro (neutro)</td>
              </tr>
              <tr className="border-b border-gray-800 bg-red-900/20">
                <td className="py-3 px-4"><M>{"0 < \\mu < 2"}</M></td>
                <td className="py-3 px-4"><M>{"\\Delta < 0"}</M></td>
                <td className="py-3 px-4">Complexos, Re &gt; 0</td>
                <td className="py-3 px-4 text-red-400">Espiral Instável</td>
              </tr>
              <tr className="border-b border-gray-800 bg-red-900/20">
                <td className="py-3 px-4"><M>{"\\mu = 2"}</M></td>
                <td className="py-3 px-4"><M>{"\\Delta = 0"}</M></td>
                <td className="py-3 px-4"><M>{"\\lambda = 1"}</M> (repetido)</td>
                <td className="py-3 px-4 text-red-400">Nó Degenerado</td>
              </tr>
              <tr className="bg-red-900/20">
                <td className="py-3 px-4"><M>{"\\mu > 2"}</M></td>
                <td className="py-3 px-4"><M>{"\\Delta > 0"}</M></td>
                <td className="py-3 px-4">Reais, ambos &gt; 0</td>
                <td className="py-3 px-4 text-red-400">Nó Instável</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-xl p-6 border border-red-700/50 mb-8">
          <p className="text-gray-300">
            Para <strong>qualquer</strong> <M>{"\\mu > 0"}</M>, a origem é <strong>instável</strong> 
            porque o traço <M>{"\\text{tr}(J) = \\mu > 0"}</M>, o que significa que as partes reais 
            dos autovalores são positivas. As trajetórias espiralam <em>para fora</em> da origem.
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">3.5 Visualização Interativa de Autovalores</h3>
        <p className="text-gray-300 mb-4">
          Ajuste <M>{"\\mu"}</M> para ver como os autovalores se movem no plano complexo:
        </p>

        <EigenvaluePlot />

        <h3 className="text-2xl font-semibold mt-8 mb-4 text-white">3.6 Teorema de Poincaré-Bendixson</h3>
        <p className="text-gray-300 mb-4">
          Se a origem é instável, para onde vão as trajetórias? O <strong>teorema de Poincaré-Bendixson</strong> 
          fornece a resposta:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h4 className="text-lg font-semibold mb-2 text-purple-400">Teorema (Poincaré-Bendixson)</h4>
          <p className="text-gray-300 italic">
            Se uma trajetória em <M>{"\\mathbb{R}^2"}</M> entra em uma região fechada e limitada 
            que <strong>não contém equilíbrios</strong> e nunca sai, então ela deve 
            se aproximar de uma <strong>órbita periódica</strong> (ciclo limite).
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-700/50">
          <h4 className="font-bold text-green-300 mb-2">Aplicação ao Van der Pol</h4>
          <ol className="list-decimal list-inside text-gray-300 space-y-2">
            <li>A origem é instável → trajetórias espiralam <em>para fora</em></li>
            <li>Dissipação de energia quando |x| &gt; 1 → trajetórias são <em>limitadas</em></li>
            <li>Trajetórias entram em uma região anular sem equilíbrios</li>
            <li>Portanto, um <strong>ciclo limite</strong> deve existir</li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Section3EquilibriumPT;
