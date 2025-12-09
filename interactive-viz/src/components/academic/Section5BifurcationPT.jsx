import React, { useState, useEffect, useRef } from 'react';
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

const Section5BifurcationPT = () => {
  const bifurcationRef = useRef(null);
  const cobwebRef = useRef(null);
  const [r, setR] = useState(3.5);
  const [showFeigenbaum, setShowFeigenbaum] = useState(false);
  
  // Logistic map function
  const logisticMap = (x, r) => r * x * (1 - x);
  
  // Draw bifurcation diagram
  useEffect(() => {
    const canvas = bifurcationRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);
    
    const rMin = 2.5;
    const rMax = 4.0;
    const transient = 200;
    const plotPoints = 100;
    
    for (let i = 0; i < W; i++) {
      const rVal = rMin + (i / W) * (rMax - rMin);
      let x = 0.5;
      
      for (let j = 0; j < transient; j++) {
        x = logisticMap(x, rVal);
      }
      
      for (let j = 0; j < plotPoints; j++) {
        x = logisticMap(x, rVal);
        const py = H - (x * H);
        
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.fillRect(i, py, 1, 1);
      }
    }
    
    const rX = ((r - rMin) / (rMax - rMin)) * W;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rX, 0);
    ctx.lineTo(rX, H);
    ctx.stroke();
    
    if (showFeigenbaum) {
      const bifurcationPoints = [3.0, 3.449, 3.5441, 3.5644, 3.5688];
      ctx.fillStyle = '#fbbf24';
      ctx.font = '10px monospace';
      
      bifurcationPoints.forEach((rBif, idx) => {
        const bx = ((rBif - rMin) / (rMax - rMin)) * W;
        ctx.beginPath();
        ctx.arc(bx, 20 + idx * 15, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(`r${idx+1}=${rBif}`, bx + 8, 24 + idx * 15);
      });
    }
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('r = 2.5', 5, H - 5);
    ctx.fillText('r = 4.0', W - 50, H - 5);
    ctx.fillText('x', 5, 15);
    ctx.fillText(`Atual: r = ${r.toFixed(3)}`, W/2 - 60, 20);
    
  }, [r, showFeigenbaum]);
  
  // Cobweb diagram
  useEffect(() => {
    const canvas = cobwebRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);
    
    const scale = (x) => x * W;
    const scaleInv = (y) => H - y * H;
    
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(W, 0);
    ctx.stroke();
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= W; i++) {
      const x = i / W;
      const fx = logisticMap(x, r);
      const py = scaleInv(fx);
      if (i === 0) ctx.moveTo(i, py);
      else ctx.lineTo(i, py);
    }
    ctx.stroke();
    
    let x = 0.2;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scale(x), H);
    
    for (let i = 0; i < 50; i++) {
      const fx = logisticMap(x, r);
      ctx.lineTo(scale(x), scaleInv(fx));
      ctx.lineTo(scale(fx), scaleInv(fx));
      x = fx;
      if (x < 0 || x > 1) break;
    }
    ctx.stroke();
    
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(scale(0.2), H, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText(`r = ${r.toFixed(3)}`, 10, 20);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('f(x) = rx(1-x)', W - 100, 20);
    ctx.fillStyle = '#475569';
    ctx.fillText('y = x', W - 50, H - 30);
    
  }, [r]);
  
  const getPeriod = (r) => {
    if (r < 3.0) return '1 (ponto fixo estável)';
    if (r < 3.449) return '2 (duplicação de período)';
    if (r < 3.5441) return '4';
    if (r < 3.5644) return '8';
    if (r < 3.5688) return '16';
    if (r < 3.8284) return 'caos';
    if (r < 3.8495) return '3 (janela período-3)';
    return 'caos';
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">§5 Teoria de Bifurcação</h2>
      
      {/* The Logistic Map */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">5.1 O Mapa Logístico</h3>
        
        <p className="text-slate-300 mb-4">
          O mapa logístico é o modelo mais simples que exibe a <span className="text-yellow-400">rota de 
          duplicação de período para o caos</span>. Ele modela dinâmica populacional com recursos limitados:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-6 my-6">
          <Eq display>
            {'x_{n+1} = f(x_n) = r \\cdot x_n (1 - x_n)'}
          </Eq>
          <p className="text-center text-slate-400 text-sm mt-2">
            onde <Eq>{'x_n \\in [0, 1]'}</Eq> é a população e <Eq>{'r \\in [0, 4]'}</Eq> é a taxa de crescimento
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-yellow-400 font-semibold mb-2">Pontos Fixos</p>
            <p className="text-slate-300">Fazendo <Eq>{'x^* = f(x^*)'}</Eq>:</p>
            <Eq display>{'x^* = 0 \\quad \\text{ou} \\quad x^* = 1 - \\frac{1}{r}'}</Eq>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-yellow-400 font-semibold mb-2">Condição de Estabilidade</p>
            <p className="text-slate-300">Ponto fixo estável quando:</p>
            <Eq display>{'\\left| f\'(x^*) \\right| = |r - 2rx^*| < 1'}</Eq>
          </div>
        </div>
      </div>
      
      {/* Interactive Bifurcation Diagram */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-green-400 mb-4">5.2 Diagrama de Bifurcação</h3>
        
        <p className="text-slate-300 mb-4">
          À medida que r aumenta, o sistema passa por uma cascata de <span className="text-cyan-400">bifurcações 
          de duplicação de período</span> até se tornar caótico:
        </p>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <canvas 
              ref={bifurcationRef} 
              width={600} 
              height={400}
              className="w-full rounded-lg border border-slate-600"
            />
            
            <div className="mt-4">
              <label className="text-slate-300 block mb-2">
                Taxa de crescimento r = {r.toFixed(3)} — <span className="text-yellow-400">{getPeriod(r)}</span>
              </label>
              <input 
                type="range" 
                min="2.5" 
                max="4.0" 
                step="0.001"
                value={r}
                onChange={(e) => setR(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <label className="flex items-center gap-2 mt-3 text-slate-300">
              <input 
                type="checkbox" 
                checked={showFeigenbaum}
                onChange={(e) => setShowFeigenbaum(e.target.checked)}
                className="rounded"
              />
              Mostrar pontos de bifurcação (Feigenbaum)
            </label>
          </div>
          
          <div className="lg:w-64">
            <canvas 
              ref={cobwebRef} 
              width={250} 
              height={250}
              className="w-full rounded-lg border border-slate-600"
            />
            <p className="text-slate-400 text-sm mt-2 text-center">Diagrama de teia de aranha</p>
          </div>
        </div>
      </div>
      
      {/* Period Doubling Cascade */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">5.3 Cascata de Duplicação de Período</h3>
        
        <p className="text-slate-300 mb-4">
          A sequência de pontos de bifurcação segue um padrão notável:
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-2 px-3 text-blue-400">Período</th>
                <th className="text-left py-2 px-3 text-blue-400">Valor de r</th>
                <th className="text-left py-2 px-3 text-blue-400">Δr (intervalo)</th>
                <th className="text-left py-2 px-3 text-blue-400">Razão Δr</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-700">
                <td className="py-2 px-3">1 → 2</td>
                <td className="py-2 px-3">r₁ = 3.0000</td>
                <td className="py-2 px-3">—</td>
                <td className="py-2 px-3">—</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="py-2 px-3">2 → 4</td>
                <td className="py-2 px-3">r₂ = 3.4495</td>
                <td className="py-2 px-3">0.4495</td>
                <td className="py-2 px-3">—</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="py-2 px-3">4 → 8</td>
                <td className="py-2 px-3">r₃ = 3.5441</td>
                <td className="py-2 px-3">0.0946</td>
                <td className="py-2 px-3">4.75</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="py-2 px-3">8 → 16</td>
                <td className="py-2 px-3">r₄ = 3.5644</td>
                <td className="py-2 px-3">0.0203</td>
                <td className="py-2 px-3">4.66</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="py-2 px-3">16 → 32</td>
                <td className="py-2 px-3">r₅ = 3.5688</td>
                <td className="py-2 px-3">0.0044</td>
                <td className="py-2 px-3">4.63</td>
              </tr>
              <tr>
                <td className="py-2 px-3">∞ (caos)</td>
                <td className="py-2 px-3">r∞ = 3.5699...</td>
                <td className="py-2 px-3">→ 0</td>
                <td className="py-2 px-3 text-yellow-400">→ δ ≈ 4.669...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Feigenbaum Constants */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-yellow-400 mb-4">5.4 Constantes de Feigenbaum</h3>
        
        <p className="text-slate-300 mb-4">
          Mitchell Feigenbaum descobriu que as razões de intervalos de bifurcação sucessivos convergem para 
          <span className="text-yellow-400"> constantes universais</span>:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-6 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-400 font-bold text-lg mb-2">Primeira Constante de Feigenbaum δ</p>
            <Eq display>
              {'\\delta = \\lim_{n \\to \\infty} \\frac{r_n - r_{n-1}}{r_{n+1} - r_n} = 4.669201609...'}
            </Eq>
            <p className="text-slate-400 text-sm mt-2">
              Controla a taxa com que as bifurcações ocorrem
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-lg border border-purple-500/30">
            <p className="text-purple-400 font-bold text-lg mb-2">Segunda Constante de Feigenbaum α</p>
            <Eq display>
              {'\\alpha = \\lim_{n \\to \\infty} \\frac{d_n}{d_{n+1}} = 2.502907875...'}
            </Eq>
            <p className="text-slate-400 text-sm mt-2">
              Controla a escala da largura do atrator em cada duplicação
            </p>
          </div>
        </div>
        
        <p className="text-slate-300 mt-6">
          <span className="text-cyan-400 font-semibold">Universal:</span> Estas constantes aparecem em 
          <em> qualquer</em> mapa 1D com um máximo quadrático sofrendo duplicação de período—são 
          constantes fundamentais da dinâmica não-linear, tão universais quanto π ou e.
        </p>
      </div>
      
      {/* Period-3 Window */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-red-400 mb-4">5.5 Período-3 Implica Caos</h3>
        
        <p className="text-slate-300 mb-4">
          Li & Yorke (1975) provaram um teorema notável:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-6 my-4 border-l-4 border-red-500">
          <p className="text-lg text-slate-200 font-semibold mb-2">Teorema de Li-Yorke</p>
          <p className="text-slate-300">
            Se um mapa contínuo <Eq>{'f: I \\to I'}</Eq> tem uma órbita de período-3, então:
          </p>
          <ul className="text-slate-300 mt-2 space-y-1 list-disc list-inside">
            <li>Ele tem órbitas periódicas de <em>todo</em> período</li>
            <li>Ele tem incontáveis órbitas caóticas</li>
          </ul>
        </div>
        
        <p className="text-slate-300 mb-4">
          Em <Eq>{'r \\approx 3.8284'}</Eq>, uma janela de período-3 emerge do caos:
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => setR(3.83)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors"
          >
            Ir para Período-3 (r ≈ 3.83)
          </button>
          <button
            onClick={() => setR(3.9)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-colors"
          >
            Ir para Caos Profundo (r = 3.9)
          </button>
        </div>
      </div>
      
      {/* Universality */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-500/30">
        <h4 className="text-lg font-semibold text-yellow-400 mb-3">Realizações Físicas</h4>
        <p className="text-slate-200 mb-4">
          Cascatas de duplicação de período com escala de Feigenbaum foram observadas em:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-800/50 p-3 rounded-lg text-center">
            <p className="text-slate-300 text-sm">Torneiras gotejantes</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg text-center">
            <p className="text-slate-300 text-sm">Circuitos eletrônicos</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg text-center">
            <p className="text-slate-300 text-sm">Convecção de fluidos</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg text-center">
            <p className="text-slate-300 text-sm">Ritmos cardíacos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section5BifurcationPT;
