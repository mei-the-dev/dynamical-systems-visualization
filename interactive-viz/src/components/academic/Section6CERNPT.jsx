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

const Section6CERNPT = () => {
  const beamRef = useRef(null);
  const ogyRef = useRef(null);
  const [controlEnabled, setControlEnabled] = useState(false);
  const [kickStrength, setKickStrength] = useState(0.01);
  
  // Beam dynamics simulation
  useEffect(() => {
    const canvas = beamRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    const henonStep = (x, p, controlEnabled, target, strength) => {
      let newX = p;
      let newP = -x + 2 * p * p - 0.3;
      
      if (controlEnabled) {
        const dist = Math.sqrt((x - target.x)**2 + (p - target.p)**2);
        if (dist < 0.15) {
          newP -= strength * (p - target.p) * 10;
        }
      }
      
      return { x: newX, p: newP };
    };
    
    const targetOrbit = { x: 0.0, p: 0.0 };
    let particles = [];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 0.3,
        p: (Math.random() - 0.5) * 0.3,
        hue: 200 + Math.random() * 60
      });
    }
    
    let animId;
    let frame = 0;
    
    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, W, H);
      
      if (frame % 3 === 0) {
        particles = particles.map(p => {
          const next = henonStep(p.x, p.p, controlEnabled, targetOrbit, kickStrength);
          if (Math.abs(next.x) > 2 || Math.abs(next.p) > 2) {
            return {
              x: (Math.random() - 0.5) * 0.3,
              p: (Math.random() - 0.5) * 0.3,
              hue: p.hue
            };
          }
          return { ...p, x: next.x, p: next.p };
        });
      }
      
      const scale = 100;
      particles.forEach(p => {
        const px = W/2 + p.x * scale;
        const py = H/2 - p.p * scale;
        
        ctx.beginPath();
        ctx.fillStyle = controlEnabled ? 
          `hsla(${p.hue}, 80%, 60%, 0.8)` : 
          `hsla(${p.hue + 100}, 80%, 60%, 0.8)`;
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.beginPath();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.arc(W/2 + targetOrbit.x * scale, H/2 - targetOrbit.p * scale, 10, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(W/2 - 1.5*scale, H/2 - 1.5*scale, 3*scale, 3*scale);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText('x (posição)', W - 80, H - 10);
      ctx.fillText('p (momento)', 10, 15);
      ctx.fillStyle = controlEnabled ? '#22c55e' : '#ef4444';
      ctx.fillText(controlEnabled ? 'CONTROLE: ON' : 'CONTROLE: OFF', W/2 - 50, 20);
      
      frame++;
      animId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animId);
  }, [controlEnabled, kickStrength]);
  
  // OGY control demonstration
  useEffect(() => {
    const canvas = ogyRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    const r = 3.8;
    const xTarget = 1 - 1/r;
    
    let x = 0.4;
    let history = [];
    let controlHistory = [];
    const maxHistory = 200;
    let frame = 0;
    let animId;
    
    const animate = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      
      let rEffective = r;
      let controlled = false;
      
      if (controlEnabled && Math.abs(x - xTarget) < 0.1) {
        const deviation = x - xTarget;
        rEffective = r - deviation * 2;
        controlled = true;
      }
      
      if (frame % 2 === 0) {
        x = rEffective * x * (1 - x);
        history.push(x);
        controlHistory.push(controlled);
        if (history.length > maxHistory) {
          history.shift();
          controlHistory.shift();
        }
      }
      
      const scaleX = W / maxHistory;
      const scaleY = H * 0.8;
      
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      history.forEach((val, i) => {
        const px = i * scaleX;
        const py = H - val * scaleY - H * 0.1;
        
        if (controlHistory[i]) {
          ctx.stroke();
          ctx.beginPath();
          ctx.strokeStyle = '#22c55e';
          ctx.moveTo(px, py);
        } else {
          if (i === 0) ctx.moveTo(px, py);
          else {
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = '#3b82f6';
            ctx.moveTo(px, py);
          }
        }
        ctx.lineTo(px, py);
      });
      ctx.stroke();
      
      ctx.strokeStyle = '#fbbf24';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, H - xTarget * scaleY - H * 0.1);
      ctx.lineTo(W, H - xTarget * scaleY - H * 0.1);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText('Tempo →', W - 60, H - 5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`Alvo: x* = ${xTarget.toFixed(3)}`, 10, 20);
      ctx.fillStyle = '#3b82f6';
      ctx.fillText(`Atual: x = ${x.toFixed(3)}`, 10, 40);
      
      frame++;
      animId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animId);
  }, [controlEnabled]);
  
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">§6 Controle de Caos no CERN</h2>
      
      {/* Introduction */}
      <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-6 border border-blue-500/30">
        <p className="text-lg text-slate-200">
          No CERN, prótons viajam a 99.9999991% da velocidade da luz ao redor de um anel de 27 km. 
          Mesmo pequenas perturbações podem levar a <span className="text-yellow-400">perda caótica do feixe</span>. 
          Engenheiros usam teoria do caos para <em>controlar</em> este caos, mantendo feixes estáveis 
          por horas de experimentos de colisão.
        </p>
      </div>
      
      {/* The Beam Dynamics ODE */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">6.1 Dinâmica Transversal do Feixe</h3>
        
        <p className="text-slate-300 mb-4">
          O movimento de partículas transversal à direção do feixe é governado pela equação de Hill:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-6 my-6">
          <Eq display>
            {'\\frac{d^2 x}{ds^2} + K(s) \\cdot x = 0'}
          </Eq>
          <p className="text-center text-slate-400 text-sm mt-2">
            onde s é a posição ao longo do anel e K(s) é a intensidade de focalização (periódica)
          </p>
        </div>
        
        <p className="text-slate-300 mb-4">
          Este é um <span className="text-cyan-400">oscilador paramétrico</span>—a intensidade de 
          focalização K(s) varia periodicamente ao redor do anel, criando dinâmicas complexas.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-blue-400 font-semibold mb-2">Magnetos Quadrupolo</p>
            <p className="text-slate-400 text-sm">Focalizam o feixe como lentes, com K(s) &gt; 0</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-purple-400 font-semibold mb-2">Magnetos Dipolo</p>
            <p className="text-slate-400 text-sm">Curvam o feixe ao redor do anel</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-green-400 font-semibold mb-2">Magnetos Sextupolo</p>
            <p className="text-slate-400 text-sm">Corrigem cromaticidade (focalização dependente de energia)</p>
          </div>
        </div>
      </div>
      
      {/* Symplectic Map */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-green-400 mb-4">6.2 O Mapa Simplético</h3>
        
        <p className="text-slate-300 mb-4">
          O movimento de partícula em uma volta é descrito por um <span className="text-yellow-400">mapa simplético</span>:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-6 my-6">
          <Eq display>
            {'\\begin{pmatrix} x_{n+1} \\\\ p_{n+1} \\end{pmatrix} = \\mathbf{M} \\begin{pmatrix} x_n \\\\ p_n \\end{pmatrix} + \\text{termos não-lineares}'}
          </Eq>
          <p className="text-center text-slate-400 text-sm mt-2">
            onde M é a matriz de transferência de uma volta com det(M) = 1 (teorema de Liouville)
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-yellow-400 font-semibold mb-2">Estabilidade Linear</p>
            <Eq display>
              {'\\mathbf{M} = \\begin{pmatrix} \\cos\\mu + \\alpha\\sin\\mu & \\beta\\sin\\mu \\\\ -\\gamma\\sin\\mu & \\cos\\mu - \\alpha\\sin\\mu \\end{pmatrix}'}
            </Eq>
            <p className="text-slate-400 text-sm mt-2">
              μ = tune betatron (oscilações por volta)
            </p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-red-400 font-semibold mb-2">Efeitos Não-Lineares</p>
            <Eq display>
              {'x_{n+1} = \\cos\\mu \\cdot x_n + \\sin\\mu \\cdot p_n + \\epsilon x_n^2'}
            </Eq>
            <p className="text-slate-400 text-sm mt-2">
              Sextupolos adicionam termos x² → caos em grandes amplitudes
            </p>
          </div>
        </div>
      </div>
      
      {/* Interactive Beam Dynamics */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">6.3 Abertura Dinâmica e Controle</h3>
        
        <p className="text-slate-300 mb-4">
          A <span className="text-cyan-400">abertura dinâmica</span> é a região de movimento estável. 
          Além dela, partículas são perdidas caoticamente. Observe como o controle estabiliza o feixe:
        </p>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <canvas 
              ref={beamRef} 
              width={400} 
              height={350}
              className="w-full rounded-lg border border-slate-600"
            />
          </div>
          
          <div className="lg:w-56 space-y-4">
            <button
              onClick={() => setControlEnabled(!controlEnabled)}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                controlEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {controlEnabled ? 'Controle ON' : 'Controle OFF'}
            </button>
            
            <div>
              <label className="text-slate-300 text-sm block mb-1">
                Intensidade do Kick: {kickStrength.toFixed(3)}
              </label>
              <input 
                type="range" 
                min="0.001" 
                max="0.05" 
                step="0.001"
                value={kickStrength}
                onChange={(e) => setKickStrength(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="text-sm text-slate-400 space-y-2 mt-4">
              <p className="text-yellow-400">Órbita alvo</p>
              <p className="text-red-400">Limite de abertura</p>
              <p className="text-cyan-400">Partículas: 50 prótons</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* OGY Control */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-yellow-400 mb-4">6.4 Método de Controle OGY</h3>
        
        <p className="text-slate-300 mb-4">
          O método OGY (Ott-Grebogi-Yorke) estabiliza órbitas periódicas instáveis usando 
          <span className="text-yellow-400"> pequenas perturbações de parâmetro</span>:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-6 my-4">
          <Eq display>
            {'\\delta r_n = -\\frac{g \\cdot \\partial f / \\partial x}{g \\cdot \\partial f / \\partial r} \\cdot (x_n - x^*)'}
          </Eq>
          <p className="text-center text-slate-400 text-sm mt-2">
            Aplicado apenas quando a trajetória passa perto da órbita alvo
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <canvas 
              ref={ogyRef} 
              width={500} 
              height={200}
              className="w-full rounded-lg border border-slate-600"
            />
            <p className="text-slate-400 text-sm mt-2">
              Azul: caos não controlado | Verde: controlado | Amarelo: alvo x*
            </p>
          </div>
          
          <div className="lg:w-48">
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-green-400 font-semibold mb-2">Insight</p>
              <p className="text-slate-400 text-sm">
                OGY explora a estrutura fractal do caos—a variedade instável traz 
                trajetórias perto de qualquer ponto, então apenas esperamos e aplicamos um nudge.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* LHC Numbers */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">6.5 LHC em Números</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-blue-400">27</p>
            <p className="text-slate-400 text-sm">km de circunferência</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-cyan-900/50 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-green-400">10¹¹</p>
            <p className="text-slate-400 text-sm">prótons/bunch</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-yellow-400">11.245</p>
            <p className="text-slate-400 text-sm">revoluções/seg</p>
          </div>
          <div className="bg-gradient-to-br from-red-900/50 to-pink-900/50 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-red-400">6,5</p>
            <p className="text-slate-400 text-sm">TeV por feixe</p>
          </div>
        </div>
        
        <p className="text-slate-300 mt-6">
          Nestas energias, perda de feixe cria <span className="text-red-400">radiação significativa</span>. 
          Um único bunch de prótons descontrolado poderia danificar magnetos supercondutores. O controle de caos 
          mantém bilhões de prótons estáveis por <span className="text-cyan-400">mais de 10 horas</span> de 
          colisões contínuas.
        </p>
      </div>
      
      {/* Summary Box */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30">
        <p className="text-slate-200">
          O CERN transforma o caos de um obstáculo em uma ferramenta. Ao entender a geometria fractal 
          do espaço de fase, físicos podem:
        </p>
        <ul className="text-slate-300 mt-3 space-y-2 list-disc list-inside">
          <li>Prever quais partículas serão perdidas (canais de escape)</li>
          <li>Projetar sistemas de colimação otimizados</li>
          <li>Aplicar pequenos kicks corretivos nos momentos exatos</li>
          <li>Alcançar colisões estáveis de alta luminosidade para física de precisão</li>
        </ul>
      </div>
    </div>
  );
};

export default Section6CERNPT;
