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

const Section6CERN = () => {
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
    
    // Hénon map (simplified beam dynamics)
    const henonStep = (x, p, controlEnabled, target, strength) => {
      let newX = p;
      let newP = -x + 2 * p * p - 0.3;  // Simplified nonlinear kick
      
      // OGY-style control: small perturbation when near unstable fixed point
      if (controlEnabled) {
        const dist = Math.sqrt((x - target.x)**2 + (p - target.p)**2);
        if (dist < 0.15) {
          // Apply stabilizing kick proportional to deviation
          newP -= strength * (p - target.p) * 10;
        }
      }
      
      return { x: newX, p: newP };
    };
    
    const targetOrbit = { x: 0.0, p: 0.0 };  // Target: origin
    let particles = [];
    
    // Initialize particles in a beam distribution
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
      
      if (frame % 3 === 0) {  // Slow down iteration rate
        particles = particles.map(p => {
          const next = henonStep(p.x, p.p, controlEnabled, targetOrbit, kickStrength);
          // Wrap or reset if diverged
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
      
      // Draw particles
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
      
      // Draw target orbit
      ctx.beginPath();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.arc(W/2 + targetOrbit.x * scale, H/2 - targetOrbit.p * scale, 10, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw aperture limits
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(W/2 - 1.5*scale, H/2 - 1.5*scale, 3*scale, 3*scale);
      
      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText('x (position)', W - 80, H - 10);
      ctx.fillText('p (momentum)', 10, 15);
      ctx.fillStyle = controlEnabled ? '#22c55e' : '#ef4444';
      ctx.fillText(controlEnabled ? 'CONTROL: ON' : 'CONTROL: OFF', W/2 - 40, 20);
      
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
    
    // Logistic map with OGY control to stabilize period-1
    const r = 3.8;  // Chaotic regime
    const xTarget = 1 - 1/r;  // Unstable fixed point
    
    let x = 0.4;
    let history = [];
    let controlHistory = [];
    const maxHistory = 200;
    let frame = 0;
    let animId;
    
    const animate = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      
      // OGY control: perturb r when near fixed point
      let rEffective = r;
      let controlled = false;
      
      if (controlEnabled && Math.abs(x - xTarget) < 0.1) {
        // Linearized control law
        const deviation = x - xTarget;
        rEffective = r - deviation * 2;  // Simple proportional control
        controlled = true;
      }
      
      // Iterate
      if (frame % 2 === 0) {
        x = rEffective * x * (1 - x);
        history.push(x);
        controlHistory.push(controlled);
        if (history.length > maxHistory) {
          history.shift();
          controlHistory.shift();
        }
      }
      
      // Draw history
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
      
      // Target line
      ctx.strokeStyle = '#fbbf24';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, H - xTarget * scaleY - H * 0.1);
      ctx.lineTo(W, H - xTarget * scaleY - H * 0.1);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText('Time →', W - 60, H - 5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`Target: x* = ${xTarget.toFixed(3)}`, 10, 20);
      ctx.fillStyle = '#3b82f6';
      ctx.fillText(`Current: x = ${x.toFixed(3)}`, 10, 40);
      
      frame++;
      animId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animId);
  }, [controlEnabled]);
  
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">§6 Chaos Control at CERN</h2>
      
      {/* Introduction */}
      <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-6 border border-blue-500/30">
        <p className="text-lg text-slate-200">
          At CERN, protons travel at 99.9999991% the speed of light around a 27 km ring. 
          Even tiny perturbations can lead to <span className="text-yellow-400">chaotic beam loss</span>. 
          Engineers use chaos theory to <em>control</em> this chaos, maintaining stable beams 
          for hours of collision experiments.
        </p>
      </div>
      
      {/* The Beam Dynamics ODE */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">6.1 Transverse Beam Dynamics</h3>
        
        <p className="text-slate-300 mb-4">
          Particle motion transverse to the beam direction is governed by Hill's equation:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-6 my-6">
          <Eq display>
            {'\\frac{d^2 x}{ds^2} + K(s) \\cdot x = 0'}
          </Eq>
          <p className="text-center text-slate-400 text-sm mt-2">
            where s is position along the ring and K(s) is the focusing strength (periodic)
          </p>
        </div>
        
        <p className="text-slate-300 mb-4">
          This is a <span className="text-cyan-400">parametric oscillator</span>—the focusing 
          strength K(s) varies periodically around the ring, creating complex dynamics.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-blue-400 font-semibold mb-2">Quadrupole Magnets</p>
            <p className="text-slate-400 text-sm">Focus the beam like lenses, with K(s) &gt; 0</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-purple-400 font-semibold mb-2">Dipole Magnets</p>
            <p className="text-slate-400 text-sm">Bend the beam around the ring</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-green-400 font-semibold mb-2">Sextupole Magnets</p>
            <p className="text-slate-400 text-sm">Correct chromaticity (energy-dependent focusing)</p>
          </div>
        </div>
      </div>
      
      {/* Symplectic Map */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-green-400 mb-4">6.2 The Symplectic Map</h3>
        
        <p className="text-slate-300 mb-4">
          One-turn particle motion is described by a <span className="text-yellow-400">symplectic map</span>:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-6 my-6">
          <Eq display>
            {'\\begin{pmatrix} x_{n+1} \\\\ p_{n+1} \\end{pmatrix} = \\mathbf{M} \\begin{pmatrix} x_n \\\\ p_n \\end{pmatrix} + \\text{nonlinear terms}'}
          </Eq>
          <p className="text-center text-slate-400 text-sm mt-2">
            where M is the one-turn transfer matrix with det(M) = 1 (Liouville's theorem)
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-yellow-400 font-semibold mb-2">Linear Stability</p>
            <Eq display>
              {'\\mathbf{M} = \\begin{pmatrix} \\cos\\mu + \\alpha\\sin\\mu & \\beta\\sin\\mu \\\\ -\\gamma\\sin\\mu & \\cos\\mu - \\alpha\\sin\\mu \\end{pmatrix}'}
            </Eq>
            <p className="text-slate-400 text-sm mt-2">
              μ = betatron tune (oscillations per turn)
            </p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-red-400 font-semibold mb-2">Nonlinear Effects</p>
            <Eq display>
              {'x_{n+1} = \\cos\\mu \\cdot x_n + \\sin\\mu \\cdot p_n + \\epsilon x_n^2'}
            </Eq>
            <p className="text-slate-400 text-sm mt-2">
              Sextupoles add x² terms → chaos at large amplitudes
            </p>
          </div>
        </div>
      </div>
      
      {/* Interactive Beam Dynamics */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">6.3 Dynamic Aperture & Control</h3>
        
        <p className="text-slate-300 mb-4">
          The <span className="text-cyan-400">dynamic aperture</span> is the region of stable motion. 
          Beyond this, particles are lost chaotically. Watch how control stabilizes the beam:
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
              {controlEnabled ? '✓ Control ON' : '✗ Control OFF'}
            </button>
            
            <div>
              <label className="text-slate-300 text-sm block mb-1">
                Kick Strength: {kickStrength.toFixed(3)}
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
              <p className="text-yellow-400">Target orbit</p>
              <p className="text-red-400">Aperture limit</p>
              <p className="text-cyan-400">Particles: 50 protons</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* OGY Control */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-yellow-400 mb-4">6.4 OGY Control Method</h3>
        
        <p className="text-slate-300 mb-4">
          The OGY (Ott-Grebogi-Yorke) method stabilizes unstable periodic orbits using 
          <span className="text-yellow-400"> tiny parameter perturbations</span>:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-6 my-4">
          <Eq display>
            {'\\delta r_n = -\\frac{g \\cdot \\partial f / \\partial x}{g \\cdot \\partial f / \\partial r} \\cdot (x_n - x^*)'}
          </Eq>
          <p className="text-center text-slate-400 text-sm mt-2">
            Only applied when trajectory passes near target orbit
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
              Blue: uncontrolled chaos | Green: controlled | Yellow: target x*
            </p>
          </div>
          
          <div className="lg:w-48">
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-green-400 font-semibold mb-2">Key Insight</p>
              <p className="text-slate-400 text-sm">
                OGY exploits the fractal structure of chaos—the unstable manifold brings 
                trajectories close to any point, so we just wait and nudge!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* LHC Numbers */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">6.5 LHC by the Numbers</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-blue-400">27</p>
            <p className="text-slate-400 text-sm">km circumference</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-cyan-900/50 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-green-400">10¹¹</p>
            <p className="text-slate-400 text-sm">protons/bunch</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-yellow-400">11,245</p>
            <p className="text-slate-400 text-sm">revolutions/sec</p>
          </div>
          <div className="bg-gradient-to-br from-red-900/50 to-pink-900/50 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-red-400">6.5</p>
            <p className="text-slate-400 text-sm">TeV per beam</p>
          </div>
        </div>
        
        <p className="text-slate-300 mt-6">
          At these energies, beam loss creates <span className="text-red-400">significant radiation</span>. 
          A single uncontrolled proton bunch could damage superconducting magnets. Chaos control 
          keeps billions of protons stable for <span className="text-cyan-400">10+ hours</span> of 
          continuous collisions.
        </p>
      </div>
      
      {/* Summary Box */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30">
        <p className="text-slate-200">
          CERN transforms chaos from an obstacle into a tool. By understanding the fractal geometry 
          of phase space, physicists can:
        </p>
        <ul className="text-slate-300 mt-3 space-y-2 list-disc list-inside">
          <li>Predict which particles will be lost (escape channels)</li>
          <li>Design optimal collimation systems</li>
          <li>Apply tiny correcting kicks at exactly the right moments</li>
          <li>Achieve stable, high-luminosity collisions for precision physics</li>
        </ul>
      </div>
    </div>
  );
};

export default Section6CERN;
