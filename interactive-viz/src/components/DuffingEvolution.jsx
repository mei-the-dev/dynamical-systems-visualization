import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, TrendingUp, Zap } from 'lucide-react';

const DuffingEvolution = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [gamma, setGamma] = useState(0.15);  // Damping
  const [F, setF] = useState(0.3);           // Forcing amplitude
  const [omega, setOmega] = useState(1.0);   // Forcing frequency
  const [alpha, setAlpha] = useState(-1);    // Linear stiffness
  const [beta, setBeta] = useState(1);       // Nonlinear stiffness
  const [showSettings, setShowSettings] = useState(false);
  const [preset, setPreset] = useState('limit-cycle');
  const [simSpeed, setSimSpeed] = useState(3); // Simulation speed multiplier
  
  const trajectoriesRef = useRef([
    { x: 0.5, v: 0, points: [], poincarePoints: [], color: 'rgb(255, 100, 100)' },
    { x: -0.5, v: 0, points: [], poincarePoints: [], color: 'rgb(100, 200, 255)' }
  ]);
  
  const timeRef = useRef(0);
  const lastPoincarePhase = useRef(0);
  const maxPoints = 2000;
  const maxPoincarePoints = 500;
  
  // Duffing: x'' + γx' + αx + βx³ = F cos(ωt)
  const duffing = (x, v, t, g, a, b, f, w) => {
    const dxdt = v;
    const dvdt = -g * v - a * x - b * x * x * x + f * Math.cos(w * t);
    return { dxdt, dvdt };
  };
  
  const rk4Step = (x, v, t, dt, g, a, b, f, w) => {
    const k1 = duffing(x, v, t, g, a, b, f, w);
    const k2 = duffing(x + 0.5*dt*k1.dxdt, v + 0.5*dt*k1.dvdt, t + 0.5*dt, g, a, b, f, w);
    const k3 = duffing(x + 0.5*dt*k2.dxdt, v + 0.5*dt*k2.dvdt, t + 0.5*dt, g, a, b, f, w);
    const k4 = duffing(x + dt*k3.dxdt, v + dt*k3.dvdt, t + dt, g, a, b, f, w);
    
    return {
      x: x + (dt/6) * (k1.dxdt + 2*k2.dxdt + 2*k3.dxdt + k4.dxdt),
      v: v + (dt/6) * (k1.dvdt + 2*k2.dvdt + 2*k3.dvdt + k4.dvdt)
    };
  };
  
  const applyPreset = (name) => {
    setPreset(name);
    switch(name) {
      case 'limit-cycle':
        setGamma(0.15); setF(0.3); setOmega(1.0); setAlpha(-1); setBeta(1);
        break;
      case 'period-doubling':
        setGamma(0.15); setF(0.35); setOmega(1.0); setAlpha(-1); setBeta(1);
        break;
      case 'chaos':
        setGamma(0.15); setF(0.5); setOmega(1.0); setAlpha(-1); setBeta(1);
        break;
      case 'deep-chaos':
        setGamma(0.25); setF(0.4); setOmega(1.2); setAlpha(-1); setBeta(1);
        break;
    }
    reset();
  };
  
  const reset = () => {
    timeRef.current = 0;
    lastPoincarePhase.current = 0;
    trajectoriesRef.current = [
      { x: 0.5, v: 0, points: [], poincarePoints: [], color: 'rgb(255, 100, 100)' },
      { x: -0.5, v: 0, points: [], poincarePoints: [], color: 'rgb(100, 200, 255)' }
    ];
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    const ctx = canvas.getContext('2d');
    
    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      const dt = 0.01;
      
      if (isPlaying) {
        for (let step = 0; step < simSpeed; step++) {
          const prevPhase = (omega * timeRef.current) % (2 * Math.PI);
          timeRef.current += dt;
          const newPhase = (omega * timeRef.current) % (2 * Math.PI);
          
          // Detect Poincaré section crossing (phase = 0)
          const crossedPoincare = prevPhase > newPhase;
          
          trajectoriesRef.current = trajectoriesRef.current.map(traj => {
            const newState = rk4Step(traj.x, traj.v, timeRef.current, dt, gamma, alpha, beta, F, omega);
            
            const newPoints = [...traj.points, { x: newState.x, v: newState.v, t: timeRef.current }];
            if (newPoints.length > maxPoints) newPoints.shift();
            
            let newPoincarePoints = [...traj.poincarePoints];
            if (crossedPoincare && timeRef.current > 10) { // Skip transient
              newPoincarePoints.push({ x: newState.x, v: newState.v });
              if (newPoincarePoints.length > maxPoincarePoints) newPoincarePoints.shift();
            }
            
            return { ...traj, x: newState.x, v: newState.v, points: newPoints, poincarePoints: newPoincarePoints };
          });
        }
      }
      
      // Background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);
      
      const cols = 2, rows = 2;
      const panelWidth = width / cols;
      const panelHeight = height / rows;
      const padding = 25;
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 1: Phase Portrait (Top Left)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Phase Portrait: x vs ẋ', padding + 10, padding + 22);
      
      const centerX = panelWidth / 2;
      const centerY = panelHeight / 2 + 15;
      const scaleX = Math.min(panelWidth, panelHeight) / 6;
      const scaleV = scaleX * 0.8;
      
      // Draw double-well potential minima markers
      if (alpha < 0 && beta > 0) {
        const xMin = Math.sqrt(-alpha / beta);
        ctx.fillStyle = 'rgba(255, 200, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(centerX + xMin * scaleX, centerY, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX - xMin * scaleX, centerY, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
        ctx.font = '10px monospace';
        ctx.fillText('well', centerX + xMin * scaleX - 12, centerY + 25);
        ctx.fillText('well', centerX - xMin * scaleX - 12, centerY + 25);
      }
      
      // Trajectories
      trajectoriesRef.current.forEach(traj => {
        if (traj.points.length < 2) return;
        
        for (let i = 1; i < traj.points.length; i++) {
          const alpha = 0.1 + 0.9 * (i / traj.points.length);
          ctx.strokeStyle = traj.color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(centerX + traj.points[i-1].x * scaleX, centerY - traj.points[i-1].v * scaleV);
          ctx.lineTo(centerX + traj.points[i].x * scaleX, centerY - traj.points[i].v * scaleV);
          ctx.stroke();
        }
        
        // Current position
        const px = centerX + traj.x * scaleX;
        const py = centerY - traj.v * scaleV;
        ctx.fillStyle = traj.color;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      ctx.restore();
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 2: Poincaré Section (Top Right)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(panelWidth, 0);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Poincaré Section (stroboscopic)', padding + 10, padding + 22);
      
      const pCenterX = panelWidth / 2;
      const pCenterY = panelHeight / 2 + 15;
      
      // Coordinate axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, pCenterY);
      ctx.lineTo(panelWidth - padding, pCenterY);
      ctx.moveTo(pCenterX, padding + 35);
      ctx.lineTo(pCenterX, panelHeight - padding);
      ctx.stroke();
      
      // Poincaré points
      trajectoriesRef.current.forEach(traj => {
        traj.poincarePoints.forEach((pt, idx) => {
          const alpha = 0.3 + 0.7 * (idx / Math.max(traj.poincarePoints.length, 1));
          ctx.fillStyle = traj.color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
          ctx.beginPath();
          ctx.arc(pCenterX + pt.x * scaleX, pCenterY - pt.v * scaleV, 2.5, 0, 2 * Math.PI);
          ctx.fill();
        });
      });
      
      // Interpretation
      ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
      ctx.font = '11px monospace';
      const numPoints = trajectoriesRef.current[0].poincarePoints.length;
      let interpretation = '';
      if (numPoints < 5) interpretation = 'Collecting points...';
      else if (numPoints < 20) interpretation = 'Pattern emerging...';
      else {
        const pts = trajectoriesRef.current[0].poincarePoints;
        const variance = pts.reduce((sum, p) => sum + p.x * p.x + p.v * p.v, 0) / pts.length;
        const spread = Math.sqrt(variance);
        
        if (spread < 0.3) interpretation = '→ LIMIT CYCLE (periodic)';
        else if (spread < 0.8) interpretation = '→ PERIOD DOUBLING';
        else interpretation = '→ STRANGE ATTRACTOR (chaos)';
      }
      ctx.fillText(interpretation, padding + 10, panelHeight - padding - 10);
      
      ctx.restore();
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 3: Time Series (Bottom Left)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(0, panelHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Time Series: x(t)', padding + 10, padding + 22);
      
      const tsGraphX = padding * 2;
      const tsGraphY = padding + 50;
      const tsGraphW = panelWidth - 4 * padding;
      const tsGraphH = panelHeight - 3 * padding - 60;
      const tsCenterY = tsGraphY + tsGraphH / 2;
      
      // Zero line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(tsGraphX, tsCenterY);
      ctx.lineTo(tsGraphX + tsGraphW, tsCenterY);
      ctx.stroke();
      
      // Forcing signal (faint)
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const traj0 = trajectoriesRef.current[0];
      for (let i = 0; i < traj0.points.length; i++) {
        const px = tsGraphX + (i / maxPoints) * tsGraphW;
        const forcing = F * Math.cos(omega * traj0.points[i].t);
        const py = tsCenterY - forcing * (tsGraphH / 4);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      
      // Position curves
      trajectoriesRef.current.forEach(traj => {
        if (traj.points.length < 2) return;
        ctx.strokeStyle = traj.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < traj.points.length; i++) {
          const px = tsGraphX + (i / maxPoints) * tsGraphW;
          const py = tsCenterY - traj.points[i].x * (tsGraphH / 4);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });
      
      ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
      ctx.font = '10px monospace';
      ctx.fillText('forcing F cos(ωt)', tsGraphX, tsGraphY - 5);
      
      ctx.restore();
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 4: Route to Chaos Explanation (Bottom Right)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(panelWidth, panelHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Route: Limit Cycle → Strange Attractor', padding + 10, padding + 22);
      
      // Draw bifurcation diagram schematic
      const bifX = padding * 2;
      const bifY = padding + 50;
      const bifW = panelWidth - 4 * padding;
      const bifH = panelHeight - 4 * padding - 40;
      
      // F axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bifX, bifY + bifH);
      ctx.lineTo(bifX + bifW, bifY + bifH);
      ctx.stroke();
      ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
      ctx.font = '11px monospace';
      ctx.fillText('F (forcing amplitude) →', bifX + bifW / 2 - 70, bifY + bifH + 20);
      
      // Schematic bifurcation
      const stages = [
        { x: 0.1, label: 'Period-1', color: 'rgb(100, 255, 100)', lines: 1 },
        { x: 0.35, label: 'Period-2', color: 'rgb(255, 255, 100)', lines: 2 },
        { x: 0.5, label: 'Period-4', color: 'rgb(255, 200, 100)', lines: 4 },
        { x: 0.65, label: 'Chaos', color: 'rgb(255, 100, 100)', lines: 20 }
      ];
      
      stages.forEach((stage, idx) => {
        const sx = bifX + stage.x * bifW;
        const regionW = (idx < stages.length - 1 ? (stages[idx + 1].x - stage.x) : (1 - stage.x)) * bifW * 0.8;
        
        ctx.fillStyle = stage.color.replace('rgb', 'rgba').replace(')', ', 0.2)');
        ctx.fillRect(sx, bifY, regionW, bifH);
        
        ctx.fillStyle = stage.color;
        ctx.font = '10px monospace';
        ctx.fillText(stage.label, sx + 5, bifY + 15);
        
        // Draw lines representing attractor
        ctx.strokeStyle = stage.color;
        ctx.lineWidth = 2;
        for (let l = 0; l < stage.lines; l++) {
          const y = bifY + (l + 1) * bifH / (stage.lines + 1);
          if (stage.lines <= 4) {
            ctx.beginPath();
            ctx.moveTo(sx + 10, y);
            ctx.lineTo(sx + regionW - 10, y);
            ctx.stroke();
          } else {
            // Chaotic scatter
            for (let i = 0; i < 30; i++) {
              const px = sx + 10 + Math.random() * (regionW - 20);
              const py = bifY + 20 + Math.random() * (bifH - 40);
              ctx.fillStyle = stage.color.replace('rgb', 'rgba').replace(')', ', 0.5)');
              ctx.beginPath();
              ctx.arc(px, py, 1.5, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
      });
      
      // Current position marker
      const currentFNorm = (F - 0.2) / 0.4; // Normalize F to 0-1
      const markerX = bifX + Math.max(0, Math.min(1, currentFNorm)) * bifW;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(markerX, bifY);
      ctx.lineTo(markerX, bifY + bifH);
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.font = '10px monospace';
      ctx.fillText(`F=${F.toFixed(2)}`, markerX - 15, bifY - 5);
      
      ctx.restore();
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isPlaying, gamma, F, omega, alpha, beta, simSpeed]);
  
  return (
    <div className="w-full h-[calc(100vh-3.5rem)] bg-gray-950 flex flex-col">
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" />
        
        {/* Equation Card */}
        <div className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur p-4 rounded-xl border border-gray-700 text-white max-w-sm">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-400" />
            Duffing Oscillator
          </h3>
          <div className="font-mono text-xs bg-gray-800 p-2 rounded mb-3">
            ẍ + γẋ + αx + βx³ = F cos(ωt)
          </div>
          
          <div className="text-xs text-gray-300 mb-3 space-y-1">
            <p>• <span className="text-green-400">Low F</span>: Periodic limit cycle</p>
            <p>• <span className="text-yellow-400">Medium F</span>: Period doubling cascade</p>
            <p>• <span className="text-red-400">High F</span>: Strange attractor (chaos)</p>
          </div>
          
          {/* Presets */}
          <div className="flex flex-wrap gap-1 mb-3">
            {[
              { name: 'limit-cycle', label: 'Limit Cycle', color: 'bg-green-600' },
              { name: 'period-doubling', label: 'Period-2', color: 'bg-yellow-600' },
              { name: 'chaos', label: 'Chaos', color: 'bg-red-600' },
              { name: 'deep-chaos', label: 'Deep Chaos', color: 'bg-purple-600' }
            ].map(p => (
              <button
                key={p.name}
                onClick={() => applyPreset(p.name)}
                className={`px-2 py-1 text-xs rounded ${
                  preset === p.name ? p.color + ' text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors w-full justify-center"
          >
            <Settings size={14} />
            {showSettings ? 'Hide' : 'Show'} Parameters
          </button>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-64 left-4 bg-gray-900/95 backdrop-blur p-4 rounded-xl border border-gray-700 text-white w-72">
            <div className="space-y-3">
              <div>
                <label className="text-xs flex justify-between mb-1">
                  <span>Simulation Speed</span>
                  <span className="text-green-400">{simSpeed}x</span>
                </label>
                <input type="range" min="1" max="10" step="1" value={simSpeed}
                  onChange={(e) => setSimSpeed(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
              </div>
              <div>
                <label className="text-xs flex justify-between mb-1">
                  <span>γ (damping)</span>
                  <span className="text-blue-400">{gamma.toFixed(2)}</span>
                </label>
                <input type="range" min="0.05" max="0.5" step="0.01" value={gamma}
                  onChange={(e) => setGamma(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
              <div>
                <label className="text-xs flex justify-between mb-1">
                  <span>F (forcing)</span>
                  <span className="text-blue-400">{F.toFixed(2)}</span>
                </label>
                <input type="range" min="0.1" max="0.6" step="0.01" value={F}
                  onChange={(e) => setF(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
              <div>
                <label className="text-xs flex justify-between mb-1">
                  <span>ω (frequency)</span>
                  <span className="text-blue-400">{omega.toFixed(2)}</span>
                </label>
                <input type="range" min="0.5" max="1.5" step="0.05" value={omega}
                  onChange={(e) => setOmega(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
            </div>
          </div>
        )}
        
        {/* Controls */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button onClick={() => setIsPlaying(!isPlaying)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all shadow-lg">
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button onClick={reset}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl transition-all shadow-lg">
            <RotateCcw size={22} />
          </button>
        </div>
        
        {/* Status */}
        <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur px-4 py-2 rounded-xl border border-gray-700 text-xs font-mono text-gray-400">
          t = {timeRef.current?.toFixed(1) || '0.0'}s | Poincaré pts: {trajectoriesRef.current[0].poincarePoints.length}
        </div>
      </div>
    </div>
  );
};

export default DuffingEvolution;
