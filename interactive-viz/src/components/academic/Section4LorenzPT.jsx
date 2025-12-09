import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';

// Inline KaTeX component
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

const Section4LorenzPT = () => {
  const canvasRef = useRef(null);
  const butterflyRef = useRef(null);
  const [sigma, setSigma] = useState(10);
  const [rho, setRho] = useState(28);
  const [beta, setBeta] = useState(8/3);
  const [isRunning, setIsRunning] = useState(true);
  
  // Lorenz system derivatives
  const lorenzDerivatives = (x, y, z, s, r, b) => {
    return {
      dx: s * (y - x),
      dy: x * (r - z) - y,
      dz: x * y - b * z
    };
  };
  
  // RK4 step for Lorenz
  const rk4Step = (x, y, z, dt, s, r, b) => {
    const k1 = lorenzDerivatives(x, y, z, s, r, b);
    const k2 = lorenzDerivatives(x + k1.dx*dt/2, y + k1.dy*dt/2, z + k1.dz*dt/2, s, r, b);
    const k3 = lorenzDerivatives(x + k2.dx*dt/2, y + k2.dy*dt/2, z + k2.dz*dt/2, s, r, b);
    const k4 = lorenzDerivatives(x + k3.dx*dt, y + k3.dy*dt, z + k3.dz*dt, s, r, b);
    
    return {
      x: x + (dt/6) * (k1.dx + 2*k2.dx + 2*k3.dx + k4.dx),
      y: y + (dt/6) * (k1.dy + 2*k2.dy + 2*k3.dy + k4.dy),
      z: z + (dt/6) * (k1.dz + 2*k2.dz + 2*k3.dz + k4.dz)
    };
  };
  
  // Main Lorenz attractor visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    let trajectory = [];
    let state = { x: 1, y: 1, z: 1 };
    const dt = 0.005;
    const maxPoints = 8000;
    let angle = 0;
    let animId;
    
    const project3D = (x, y, z, rotY) => {
      const cosA = Math.cos(rotY);
      const sinA = Math.sin(rotY);
      const xr = x * cosA - z * sinA;
      const zr = x * sinA + z * cosA;
      
      const scale = 6;
      const perspective = 100 / (100 + zr * 0.3);
      return {
        px: W/2 + xr * scale * perspective,
        py: H/2 - (y - 25) * scale * perspective * 0.8,
        depth: zr
      };
    };
    
    const animate = () => {
      if (!isRunning) {
        animId = requestAnimationFrame(animate);
        return;
      }
      
      for (let i = 0; i < 5; i++) {
        state = rk4Step(state.x, state.y, state.z, dt, sigma, rho, beta);
        trajectory.push({ ...state });
        if (trajectory.length > maxPoints) trajectory.shift();
      }
      
      angle += 0.002;
      
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      
      if (trajectory.length > 1) {
        for (let i = 1; i < trajectory.length; i++) {
          const p1 = project3D(trajectory[i-1].x, trajectory[i-1].y, trajectory[i-1].z, angle);
          const p2 = project3D(trajectory[i].x, trajectory[i].y, trajectory[i].z, angle);
          
          const t = i / trajectory.length;
          const wingColor = trajectory[i].x > 0 ? 
            `rgba(239, 68, 68, ${0.3 + t * 0.7})` : 
            `rgba(59, 130, 246, ${0.3 + t * 0.7})`;
          
          ctx.beginPath();
          ctx.strokeStyle = wingColor;
          ctx.lineWidth = 0.5 + t * 1.5;
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
        }
        
        const current = trajectory[trajectory.length - 1];
        const cp = project3D(current.x, current.y, current.z, angle);
        ctx.beginPath();
        ctx.fillStyle = '#fbbf24';
        ctx.arc(cp.px, cp.py, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText(`σ = ${sigma.toFixed(1)}  ρ = ${rho.toFixed(1)}  β = ${beta.toFixed(2)}`, 10, 20);
      ctx.fillText(`(x, y, z) = (${state.x.toFixed(2)}, ${state.y.toFixed(2)}, ${state.z.toFixed(2)})`, 10, 40);
      
      animId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animId);
  }, [sigma, rho, beta, isRunning]);
  
  // Butterfly effect visualization
  useEffect(() => {
    const canvas = butterflyRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    let traj1 = [{ x: 1, y: 1, z: 1 }];
    let traj2 = [{ x: 1.0001, y: 1, z: 1 }];
    const dt = 0.01;
    const steps = 3000;
    
    for (let i = 0; i < steps; i++) {
      const s1 = traj1[traj1.length - 1];
      const s2 = traj2[traj2.length - 1];
      traj1.push(rk4Step(s1.x, s1.y, s1.z, dt, 10, 28, 8/3));
      traj2.push(rk4Step(s2.x, s2.y, s2.z, dt, 10, 28, 8/3));
    }
    
    let frame = 0;
    let animId;
    
    const animate = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      
      const showUpTo = Math.min(frame * 3, steps);
      
      const scaleX = W / steps;
      const scaleY = 4;
      const midY = H / 2;
      
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < showUpTo; i++) {
        const px = i * scaleX;
        const py = midY - traj1[i].x * scaleY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < showUpTo; i++) {
        const px = i * scaleX;
        const py = midY - traj2[i].x * scaleY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      
      if (showUpTo > 0) {
        const p1 = traj1[showUpTo - 1];
        const p2 = traj2[showUpTo - 1];
        const dist = Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2 + (p1.z-p2.z)**2);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.fillText(`Diferença inicial: 0.0001`, 10, 20);
        ctx.fillText(`Distância atual: ${dist.toFixed(4)}`, 10, 40);
        ctx.fillText(`Amplificação: ${(dist / 0.0001).toFixed(0)}×`, 10, 60);
        
        const time = (showUpTo * dt).toFixed(2);
        ctx.fillText(`Tempo: ${time}`, W - 80, 20);
      }
      
      ctx.fillStyle = '#ef4444';
      ctx.fillText('x₀ = 1.0000', W - 100, H - 30);
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('x₀ = 1.0001', W - 100, H - 10);
      
      frame++;
      if (frame * 3 < steps) {
        animId = requestAnimationFrame(animate);
      }
    };
    
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);
  
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">§4 O Sistema de Lorenz</h2>
      
      {/* The Equations */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">4.1 As Equações de Lorenz</h3>
        
        <p className="text-slate-300 mb-4">
          Em 1963, Edward Lorenz descobriu o caos enquanto estudava convecção atmosférica. 
          Seu modelo 3D simplificado tornou-se a base da teoria do caos:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-6 my-6">
          <Eq display>
            {`\\begin{aligned}
              \\dot{x} &= \\sigma(y - x) \\\\[0.5em]
              \\dot{y} &= x(\\rho - z) - y \\\\[0.5em]
              \\dot{z} &= xy - \\beta z
            \\end{aligned}`}
          </Eq>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-blue-400 font-semibold mb-2">σ (número de Prandtl)</p>
            <p className="text-slate-400 text-sm">Razão entre difusividade de momento e térmica</p>
            <p className="text-yellow-400 mt-2">σ = 10 (valor clássico)</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-blue-400 font-semibold mb-2">ρ (número de Rayleigh)</p>
            <p className="text-slate-400 text-sm">Diferença de temperatura que impulsiona a convecção</p>
            <p className="text-yellow-400 mt-2">ρ = 28 (regime caótico)</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-blue-400 font-semibold mb-2">β (fator geométrico)</p>
            <p className="text-slate-400 text-sm">Razão de aspecto da célula de convecção</p>
            <p className="text-yellow-400 mt-2">β = 8/3 (valor clássico)</p>
          </div>
        </div>
      </div>
      
      {/* Interactive 3D Attractor */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-green-400 mb-4">4.2 O Atrator Estranho</h3>
        
        <p className="text-slate-300 mb-4">
          O atrator de Lorenz é um <span className="text-yellow-400">atrator estranho</span> com 
          dimensão fractal ≈ 2.06. Ele tem <span className="text-cyan-400">volume zero</span> mas 
          comprimento infinito—as trajetórias nunca se repetem exatamente.
        </p>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <canvas 
              ref={canvasRef} 
              width={500} 
              height={400}
              className="w-full rounded-lg border border-slate-600"
            />
          </div>
          
          <div className="lg:w-48 space-y-4">
            <div>
              <label className="text-slate-300 text-sm block mb-1">σ = {sigma.toFixed(1)}</label>
              <input 
                type="range" 
                min="1" 
                max="20" 
                step="0.5"
                value={sigma}
                onChange={(e) => setSigma(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm block mb-1">ρ = {rho.toFixed(1)}</label>
              <input 
                type="range" 
                min="1" 
                max="50" 
                step="0.5"
                value={rho}
                onChange={(e) => setRho(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm block mb-1">β = {beta.toFixed(2)}</label>
              <input 
                type="range" 
                min="0.5" 
                max="5" 
                step="0.1"
                value={beta}
                onChange={(e) => setBeta(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full py-2 rounded-lg font-semibold ${
                isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              } text-white transition-colors`}
            >
              {isRunning ? 'Pausar' : 'Continuar'}
            </button>
            
            <div className="text-xs text-slate-400 mt-4">
              <p className="text-red-400">Asa direita (x &gt; 0)</p>
              <p className="text-blue-400">Asa esquerda (x &lt; 0)</p>
              <p className="text-yellow-400">Posição atual</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Equilibrium Points */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">4.3 Pontos de Equilíbrio</h3>
        
        <p className="text-slate-300 mb-4">
          Fazendo <Eq>{'\\dot{x} = \\dot{y} = \\dot{z} = 0'}</Eq>, encontramos três pontos fixos:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-4 rounded-lg">
            <p className="text-yellow-400 font-semibold mb-2">Origem</p>
            <Eq display>{'(0, 0, 0)'}</Eq>
            <p className="text-slate-400 text-sm mt-2">Instável para ρ &gt; 1</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg">
            <p className="text-red-400 font-semibold mb-2">C⁺ (centro da asa direita)</p>
            <Eq display>{'(\\sqrt{\\beta(\\rho-1)}, \\sqrt{\\beta(\\rho-1)}, \\rho-1)'}</Eq>
            <p className="text-slate-400 text-sm mt-2">Espiral instável para ρ = 28</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg">
            <p className="text-blue-400 font-semibold mb-2">C⁻ (centro da asa esquerda)</p>
            <Eq display>{'(-\\sqrt{\\beta(\\rho-1)}, -\\sqrt{\\beta(\\rho-1)}, \\rho-1)'}</Eq>
            <p className="text-slate-400 text-sm mt-2">Espiral instável para ρ = 28</p>
          </div>
        </div>
        
        <p className="text-slate-300 mt-4">
          Com σ = 10, β = 8/3, ρ = 28:
        </p>
        <Eq display>
          {'C^\\pm = (\\pm\\sqrt{8 \\cdot 27/3}, \\pm\\sqrt{72}, 27) \\approx (\\pm 8.49, \\pm 8.49, 27)'}
        </Eq>
      </div>
      
      {/* Butterfly Effect */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-red-400 mb-4">4.4 O Efeito Borboleta</h3>
        
        <p className="text-slate-300 mb-4">
          O famoso "efeito borboleta" de Lorenz demonstra a <span className="text-yellow-400">sensibilidade 
          às condições iniciais</span>. Duas trajetórias começando a apenas 0.0001 de distância 
          divergem exponencialmente:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-4 mb-4">
          <Eq display>
            {'\\|\\delta(t)\\| \\approx \\|\\delta(0)\\| \\cdot e^{\\lambda t}'}
          </Eq>
          <p className="text-center text-slate-400 text-sm mt-2">
            onde λ ≈ 0.9056 é o maior expoente de Lyapunov
          </p>
        </div>
        
        <div className="mb-4">
          <canvas 
            ref={butterflyRef} 
            width={600} 
            height={200}
            className="w-full rounded-lg border border-slate-600"
          />
        </div>
        
        <p className="text-slate-400 text-sm italic">
          Observe como duas trajetórias com condições iniciais diferindo por apenas 0.0001 
          eventualmente se tornam completamente descorrelacionadas. É por isso que a previsão 
          do tempo além de ~10 dias é fundamentalmente impossível.
        </p>
      </div>
      
      {/* Lyapunov Exponents */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">4.5 Expoentes de Lyapunov</h3>
        
        <p className="text-slate-300 mb-4">
          Os expoentes de Lyapunov quantificam a taxa de separação de trajetórias infinitesimalmente próximas:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-6 my-4">
          <Eq display>
            {'\\lambda = \\lim_{t \\to \\infty} \\frac{1}{t} \\ln\\frac{\\|\\delta(t)\\|}{\\|\\delta(0)\\|}'}
          </Eq>
        </div>
        
        <p className="text-slate-300 mb-4">
          Para o sistema de Lorenz com parâmetros padrão, os três expoentes de Lyapunov são:
        </p>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-900/30 p-4 rounded-lg text-center">
            <p className="text-green-400 font-bold text-2xl">+0.9056</p>
            <p className="text-slate-400 text-sm mt-2">λ₁ (expansão)</p>
            <p className="text-xs text-slate-500">Indicador de caos</p>
          </div>
          <div className="bg-yellow-900/30 p-4 rounded-lg text-center">
            <p className="text-yellow-400 font-bold text-2xl">0</p>
            <p className="text-slate-400 text-sm mt-2">λ₂ (neutro)</p>
            <p className="text-xs text-slate-500">Direção do fluxo</p>
          </div>
          <div className="bg-red-900/30 p-4 rounded-lg text-center">
            <p className="text-red-400 font-bold text-2xl">−14.57</p>
            <p className="text-slate-400 text-sm mt-2">λ₃ (contração)</p>
            <p className="text-xs text-slate-500">Formação do atrator</p>
          </div>
        </div>
        
        <p className="text-slate-300 mt-4">
          A soma <Eq>{'\\lambda_1 + \\lambda_2 + \\lambda_3 \\approx -13.67 < 0'}</Eq> confirma que o 
          sistema é <span className="text-cyan-400">dissipativo</span>—o volume do espaço de fase contrai.
        </p>
      </div>
      
      {/* Key Insight Box */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30">
        <p className="text-slate-200">
          O sistema de Lorenz é <span className="text-yellow-400">determinístico mas imprevisível</span>. 
          Com condições iniciais perfeitas e precisão computacional infinita, poderíamos prever 
          o futuro exatamente. Mas qualquer incerteza de medição cresce exponencialmente, tornando 
          a previsão de longo prazo impossível—isto é o <span className="text-cyan-400">caos determinístico</span>.
        </p>
      </div>
    </div>
  );
};

export default Section4LorenzPT;
