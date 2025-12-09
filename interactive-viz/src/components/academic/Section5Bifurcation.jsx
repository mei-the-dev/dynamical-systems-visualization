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

const Section5Bifurcation = () => {
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
    
    // Pre-compute bifurcation diagram
    for (let i = 0; i < W; i++) {
      const rVal = rMin + (i / W) * (rMax - rMin);
      let x = 0.5;
      
      // Transient
      for (let j = 0; j < transient; j++) {
        x = logisticMap(x, rVal);
      }
      
      // Plot attractor
      for (let j = 0; j < plotPoints; j++) {
        x = logisticMap(x, rVal);
        const py = H - (x * H);
        
        // Color based on period
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.fillRect(i, py, 1, 1);
      }
    }
    
    // Highlight current r value
    const rX = ((r - rMin) / (rMax - rMin)) * W;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rX, 0);
    ctx.lineTo(rX, H);
    ctx.stroke();
    
    // Mark bifurcation points if enabled
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
    
    // Axes labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('r = 2.5', 5, H - 5);
    ctx.fillText('r = 4.0', W - 50, H - 5);
    ctx.fillText('x', 5, 15);
    ctx.fillText(`Current: r = ${r.toFixed(3)}`, W/2 - 60, 20);
    
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
    
    // Draw y = x line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(W, 0);
    ctx.stroke();
    
    // Draw parabola f(x) = rx(1-x)
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
    
    // Cobweb iteration
    let x = 0.2;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scale(x), H);
    
    for (let i = 0; i < 50; i++) {
      const fx = logisticMap(x, r);
      
      // Vertical line to curve
      ctx.lineTo(scale(x), scaleInv(fx));
      
      // Horizontal line to y = x
      ctx.lineTo(scale(fx), scaleInv(fx));
      
      x = fx;
      
      // Stop if settled
      if (x < 0 || x > 1) break;
    }
    ctx.stroke();
    
    // Starting point
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(scale(0.2), H, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText(`r = ${r.toFixed(3)}`, 10, 20);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('f(x) = rx(1-x)', W - 100, 20);
    ctx.fillStyle = '#475569';
    ctx.fillText('y = x', W - 50, H - 30);
    
  }, [r]);
  
  // Determine period for current r
  const getPeriod = (r) => {
    if (r < 3.0) return '1 (stable fixed point)';
    if (r < 3.449) return '2 (period doubling)';
    if (r < 3.5441) return '4';
    if (r < 3.5644) return '8';
    if (r < 3.5688) return '16';
    if (r < 3.8284) return 'chaos';
    if (r < 3.8495) return '3 (period-3 window)';
    return 'chaos';
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">§5 Bifurcation Theory</h2>
      
      {/* The Logistic Map */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">5.1 The Logistic Map</h3>
        
        <p className="text-slate-300 mb-4">
          The logistic map is the simplest model exhibiting <span className="text-yellow-400">period-doubling 
          route to chaos</span>. It models population dynamics with limited resources:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-6 my-6">
          <Eq display>
            {'x_{n+1} = f(x_n) = r \\cdot x_n (1 - x_n)'}
          </Eq>
          <p className="text-center text-slate-400 text-sm mt-2">
            where <Eq>{'x_n \\in [0, 1]'}</Eq> is population and <Eq>{'r \\in [0, 4]'}</Eq> is growth rate
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-yellow-400 font-semibold mb-2">Fixed Points</p>
            <p className="text-slate-300">Setting <Eq>{'x^* = f(x^*)'}</Eq>:</p>
            <Eq display>{'x^* = 0 \\quad \\text{or} \\quad x^* = 1 - \\frac{1}{r}'}</Eq>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-yellow-400 font-semibold mb-2">Stability Condition</p>
            <p className="text-slate-300">Fixed point stable when:</p>
            <Eq display>{'\\left| f\'(x^*) \\right| = |r - 2rx^*| < 1'}</Eq>
          </div>
        </div>
      </div>
      
      {/* Interactive Bifurcation Diagram */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-green-400 mb-4">5.2 Bifurcation Diagram</h3>
        
        <p className="text-slate-300 mb-4">
          As r increases, the system undergoes a cascade of <span className="text-cyan-400">period-doubling 
          bifurcations</span> until it becomes chaotic:
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
                Growth rate r = {r.toFixed(3)} — <span className="text-yellow-400">{getPeriod(r)}</span>
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
              Show bifurcation points (Feigenbaum)
            </label>
          </div>
          
          <div className="lg:w-64">
            <canvas 
              ref={cobwebRef} 
              width={250} 
              height={250}
              className="w-full rounded-lg border border-slate-600"
            />
            <p className="text-slate-400 text-sm mt-2 text-center">Cobweb diagram</p>
          </div>
        </div>
      </div>
      
      {/* Period Doubling Cascade */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">5.3 Period-Doubling Cascade</h3>
        
        <p className="text-slate-300 mb-4">
          The sequence of bifurcation points follows a remarkable pattern:
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-2 px-3 text-blue-400">Period</th>
                <th className="text-left py-2 px-3 text-blue-400">r value</th>
                <th className="text-left py-2 px-3 text-blue-400">Δr (gap)</th>
                <th className="text-left py-2 px-3 text-blue-400">Δr ratio</th>
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
                <td className="py-2 px-3">∞ (chaos)</td>
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
        <h3 className="text-xl font-semibold text-yellow-400 mb-4">5.4 Feigenbaum Constants</h3>
        
        <p className="text-slate-300 mb-4">
          Mitchell Feigenbaum discovered that the ratios of successive bifurcation gaps converge to 
          <span className="text-yellow-400"> universal constants</span>:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-6 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-400 font-bold text-lg mb-2">First Feigenbaum Constant δ</p>
            <Eq display>
              {'\\delta = \\lim_{n \\to \\infty} \\frac{r_n - r_{n-1}}{r_{n+1} - r_n} = 4.669201609...'}
            </Eq>
            <p className="text-slate-400 text-sm mt-2">
              Controls the rate at which bifurcations occur
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-lg border border-purple-500/30">
            <p className="text-purple-400 font-bold text-lg mb-2">Second Feigenbaum Constant α</p>
            <Eq display>
              {'\\alpha = \\lim_{n \\to \\infty} \\frac{d_n}{d_{n+1}} = 2.502907875...'}
            </Eq>
            <p className="text-slate-400 text-sm mt-2">
              Controls the scaling of the attractor width at each doubling
            </p>
          </div>
        </div>
        
        <p className="text-slate-300 mt-6">
          <span className="text-cyan-400 font-semibold">Universal!:</span> These constants appear in 
          <em> any</em> 1D map with a quadratic maximum undergoing period-doubling—they are 
          fundamental constants of nonlinear dynamics, as universal as π or e.
        </p>
      </div>
      
      {/* Period-3 Window */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-red-400 mb-4">5.5 Period-3 Implies Chaos</h3>
        
        <p className="text-slate-300 mb-4">
          Li & Yorke (1975) proved a remarkable theorem:
        </p>
        
        <div className="bg-slate-900 rounded-lg p-6 my-4 border-l-4 border-red-500">
          <p className="text-lg text-slate-200 font-semibold mb-2">Li-Yorke Theorem</p>
          <p className="text-slate-300">
            If a continuous map <Eq>{'f: I \\to I'}</Eq> has a period-3 orbit, then:
          </p>
          <ul className="text-slate-300 mt-2 space-y-1 list-disc list-inside">
            <li>It has periodic orbits of <em>every</em> period</li>
            <li>It has uncountably many chaotic orbits</li>
          </ul>
        </div>
        
        <p className="text-slate-300 mb-4">
          At <Eq>{'r \\approx 3.8284'}</Eq>, a period-3 window emerges from chaos:
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => setR(3.83)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors"
          >
            Jump to Period-3 (r ≈ 3.83)
          </button>
          <button
            onClick={() => setR(3.9)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-colors"
          >
            Jump to Deep Chaos (r = 3.9)
          </button>
        </div>
      </div>
      
      {/* Universality */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-500/30">
        <h4 className="text-lg font-semibold text-yellow-400 mb-3">Physical Realizations</h4>
        <p className="text-slate-200 mb-4">
          Period-doubling cascades with Feigenbaum scaling have been observed in:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-800/50 p-3 rounded-lg text-center">
            <p className="text-slate-300 text-sm">Dripping faucets</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg text-center">
            <p className="text-slate-300 text-sm">Electronic circuits</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg text-center">
            <p className="text-slate-300 text-sm">Fluid convection</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg text-center">
            <p className="text-slate-300 text-sm">Heart rhythms</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section5Bifurcation;
