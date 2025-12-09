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

const Section4Lorenz = () => {
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
      // Rotate around Y axis for viewing angle
      const cosA = Math.cos(rotY);
      const sinA = Math.sin(rotY);
      const xr = x * cosA - z * sinA;
      const zr = x * sinA + z * cosA;
      
      // Simple perspective projection
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
      
      // Integrate
      for (let i = 0; i < 5; i++) {
        state = rk4Step(state.x, state.y, state.z, dt, sigma, rho, beta);
        trajectory.push({ ...state });
        if (trajectory.length > maxPoints) trajectory.shift();
      }
      
      angle += 0.002;
      
      // Clear
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      
      // Draw trajectory with depth coloring
      if (trajectory.length > 1) {
        for (let i = 1; i < trajectory.length; i++) {
          const p1 = project3D(trajectory[i-1].x, trajectory[i-1].y, trajectory[i-1].z, angle);
          const p2 = project3D(trajectory[i].x, trajectory[i].y, trajectory[i].z, angle);
          
          // Color based on position (wing colors)
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
        
        // Draw current point
        const current = trajectory[trajectory.length - 1];
        const cp = project3D(current.x, current.y, current.z, angle);
        ctx.beginPath();
        ctx.fillStyle = '#fbbf24';
        ctx.arc(cp.px, cp.py, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Labels
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
    
    // Two trajectories with tiny initial difference
    let traj1 = [{ x: 1, y: 1, z: 1 }];
    let traj2 = [{ x: 1.0001, y: 1, z: 1 }];  // 0.0001 difference!
    const dt = 0.01;
    const steps = 3000;
    
    // Pre-compute trajectories
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
      
      // Draw both trajectories (X vs time)
      const scaleX = W / steps;
      const scaleY = 4;
      const midY = H / 2;
      
      // Trajectory 1 (red)
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
      
      // Trajectory 2 (blue)
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
      
      // Calculate divergence
      if (showUpTo > 0) {
        const p1 = traj1[showUpTo - 1];
        const p2 = traj2[showUpTo - 1];
        const dist = Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2 + (p1.z-p2.z)**2);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.fillText(`Initial difference: 0.0001`, 10, 20);
        ctx.fillText(`Current distance: ${dist.toFixed(4)}`, 10, 40);
        ctx.fillText(`Amplification: ${(dist / 0.0001).toFixed(0)}×`, 10, 60);
        
        const time = (showUpTo * dt).toFixed(2);
        ctx.fillText(`Time: ${time}`, W - 80, 20);
      }
      
      // Labels
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
      <h2 className="text-3xl font-bold text-white mb-6">§4 The Lorenz System</h2>
      
      {/* The Equations */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">4.1 The Lorenz Equations</h3>
        
        <p className="text-slate-300 mb-4">
          In 1963, Edward Lorenz discovered chaos while studying atmospheric convection. 
          His simplified 3D model became the foundation of chaos theory:
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
            <p className="text-blue-400 font-semibold mb-2">σ (Prandtl number)</p>
            <p className="text-slate-400 text-sm">Ratio of momentum diffusivity to thermal diffusivity</p>
            <p className="text-yellow-400 mt-2">σ = 10 (classic value)</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-blue-400 font-semibold mb-2">ρ (Rayleigh number)</p>
            <p className="text-slate-400 text-sm">Temperature difference driving convection</p>
            <p className="text-yellow-400 mt-2">ρ = 28 (chaotic regime)</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-blue-400 font-semibold mb-2">β (geometry factor)</p>
            <p className="text-slate-400 text-sm">Aspect ratio of convection cell</p>
            <p className="text-yellow-400 mt-2">β = 8/3 (classic value)</p>
          </div>
        </div>
      </div>
      
      {/* Interactive 3D Attractor */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-green-400 mb-4">4.2 The Strange Attractor</h3>
        
        <p className="text-slate-300 mb-4">
          The Lorenz attractor is a <span className="text-yellow-400">strange attractor</span> with 
          fractal dimension ≈ 2.06. It has <span className="text-cyan-400">zero volume</span> but 
          infinite length—trajectories never repeat exactly.
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
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            
            <div className="text-xs text-slate-400 mt-4">
              <p className="text-red-400">Right wing (x &gt; 0)</p>
              <p className="text-blue-400">Left wing (x &lt; 0)</p>
              <p className="text-yellow-400">Current position</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Equilibrium Points */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">4.3 Equilibrium Points</h3>
        
        <p className="text-slate-300 mb-4">
          Setting <Eq>{'\\dot{x} = \\dot{y} = \\dot{z} = 0'}</Eq>, we find three fixed points:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-4 rounded-lg">
            <p className="text-yellow-400 font-semibold mb-2">Origin</p>
            <Eq display>{'(0, 0, 0)'}</Eq>
            <p className="text-slate-400 text-sm mt-2">Unstable for ρ &gt; 1</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg">
            <p className="text-red-400 font-semibold mb-2">C⁺ (right wing center)</p>
            <Eq display>{'(\\sqrt{\\beta(\\rho-1)}, \\sqrt{\\beta(\\rho-1)}, \\rho-1)'}</Eq>
            <p className="text-slate-400 text-sm mt-2">Unstable spiral for ρ = 28</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg">
            <p className="text-blue-400 font-semibold mb-2">C⁻ (left wing center)</p>
            <Eq display>{'(-\\sqrt{\\beta(\\rho-1)}, -\\sqrt{\\beta(\\rho-1)}, \\rho-1)'}</Eq>
            <p className="text-slate-400 text-sm mt-2">Unstable spiral for ρ = 28</p>
          </div>
        </div>
        
        <p className="text-slate-300 mt-4">
          With σ = 10, β = 8/3, ρ = 28:
        </p>
        <Eq display>
          {'C^\\pm = (\\pm\\sqrt{8 \\cdot 27/3}, \\pm\\sqrt{72}, 27) \\approx (\\pm 8.49, \\pm 8.49, 27)'}
        </Eq>
      </div>
      
      {/* Butterfly Effect */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-red-400 mb-4">4.4 The Butterfly Effect</h3>
        
        <p className="text-slate-300 mb-4">
          Lorenz's famous "butterfly effect" demonstrates <span className="text-yellow-400">sensitive 
          dependence on initial conditions</span>. Two trajectories starting just 0.0001 apart 
          diverge exponentially:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-4 mb-4">
          <Eq display>
            {'\\|\\delta(t)\\| \\approx \\|\\delta(0)\\| \\cdot e^{\\lambda t}'}
          </Eq>
          <p className="text-center text-slate-400 text-sm mt-2">
            where λ ≈ 0.9056 is the largest Lyapunov exponent
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
          Watch how two trajectories with initial conditions differing by just 0.0001 
          eventually become completely uncorrelated. This is why weather prediction 
          beyond ~10 days is fundamentally impossible.
        </p>
      </div>
      
      {/* Lyapunov Exponents */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">4.5 Lyapunov Exponents</h3>
        
        <p className="text-slate-300 mb-4">
          The Lyapunov exponents quantify the rate of separation of infinitesimally close trajectories:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-6 my-4">
          <Eq display>
            {'\\lambda = \\lim_{t \\to \\infty} \\frac{1}{t} \\ln\\frac{\\|\\delta(t)\\|}{\\|\\delta(0)\\|}'}
          </Eq>
        </div>
        
        <p className="text-slate-300 mb-4">
          For the Lorenz system with standard parameters, the three Lyapunov exponents are:
        </p>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-900/30 p-4 rounded-lg text-center">
            <p className="text-green-400 font-bold text-2xl">+0.9056</p>
            <p className="text-slate-400 text-sm mt-2">λ₁ (expansion)</p>
            <p className="text-xs text-slate-500">Chaos indicator</p>
          </div>
          <div className="bg-yellow-900/30 p-4 rounded-lg text-center">
            <p className="text-yellow-400 font-bold text-2xl">0</p>
            <p className="text-slate-400 text-sm mt-2">λ₂ (neutral)</p>
            <p className="text-xs text-slate-500">Flow direction</p>
          </div>
          <div className="bg-red-900/30 p-4 rounded-lg text-center">
            <p className="text-red-400 font-bold text-2xl">−14.57</p>
            <p className="text-slate-400 text-sm mt-2">λ₃ (contraction)</p>
            <p className="text-xs text-slate-500">Attractor formation</p>
          </div>
        </div>
        
        <p className="text-slate-300 mt-4">
          The sum <Eq>{'\\lambda_1 + \\lambda_2 + \\lambda_3 \\approx -13.67 < 0'}</Eq> confirms the 
          system is <span className="text-cyan-400">dissipative</span>—phase space volume contracts.
        </p>
      </div>
      
      {/* Key Insight Box */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30">
        <p className="text-slate-200">
          The Lorenz system is <span className="text-yellow-400">deterministic but unpredictable</span>. 
          Given perfect initial conditions and infinite computational precision, we could predict 
          the future exactly. But any measurement uncertainty grows exponentially, making long-term 
          prediction impossible—this is <span className="text-cyan-400">deterministic chaos</span>.
        </p>
      </div>
    </div>
  );
};

export default Section4Lorenz;
