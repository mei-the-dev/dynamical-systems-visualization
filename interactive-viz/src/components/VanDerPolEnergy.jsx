import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Heart, Zap, Info } from 'lucide-react';

const VanDerPolEnergy = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mu, setMu] = useState(1.5);
  const [showHeartbeat, setShowHeartbeat] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const timeRef = useRef(0);
  
  const trajectoriesRef = useRef([
    { x: 0.1, v: 0, points: [], color: 'rgb(255, 100, 100)', label: 'x₀=0.1 (inside)' },
    { x: 0.5, v: 0, points: [], color: 'rgb(100, 255, 100)', label: 'x₀=0.5 (inside)' },
    { x: 2.5, v: 0, points: [], color: 'rgb(100, 200, 255)', label: 'x₀=2.5 (outside)' },
    { x: 3.5, v: 0, points: [], color: 'rgb(255, 200, 100)', label: 'x₀=3.5 (outside)' }
  ]);
  
  const maxPoints = 800;
  
  const vanDerPol = (x, v, muVal) => {
    const dxdt = v;
    const dvdt = muVal * (1 - x * x) * v - x;
    return { dxdt, dvdt };
  };
  
  const rk4Step = (x, v, dt, muVal) => {
    const k1 = vanDerPol(x, v, muVal);
    const k2 = vanDerPol(x + 0.5 * dt * k1.dxdt, v + 0.5 * dt * k1.dvdt, muVal);
    const k3 = vanDerPol(x + 0.5 * dt * k2.dxdt, v + 0.5 * dt * k2.dvdt, muVal);
    const k4 = vanDerPol(x + dt * k3.dxdt, v + dt * k3.dvdt, muVal);
    
    return {
      x: x + (dt / 6) * (k1.dxdt + 2 * k2.dxdt + 2 * k3.dxdt + k4.dxdt),
      v: v + (dt / 6) * (k1.dvdt + 2 * k2.dvdt + 2 * k3.dvdt + k4.dvdt)
    };
  };
  
  const reset = () => {
    timeRef.current = 0;
    trajectoriesRef.current = [
      { x: 0.1, v: 0, points: [], color: 'rgb(255, 100, 100)', label: 'x₀=0.1 (inside)' },
      { x: 0.5, v: 0, points: [], color: 'rgb(100, 255, 100)', label: 'x₀=0.5 (inside)' },
      { x: 2.5, v: 0, points: [], color: 'rgb(100, 200, 255)', label: 'x₀=2.5 (outside)' },
      { x: 3.5, v: 0, points: [], color: 'rgb(255, 200, 100)', label: 'x₀=3.5 (outside)' }
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
      
      if (isPlaying) {
        for (let s = 0; s < speed; s++) {
          timeRef.current += 0.02;
          trajectoriesRef.current = trajectoriesRef.current.map(traj => {
            const dt = 0.02;
            const newState = rk4Step(traj.x, traj.v, dt, mu);
            
            const newPoints = [...traj.points, { x: newState.x, v: newState.v }];
            if (newPoints.length > maxPoints) {
              newPoints.shift();
            }
            
            return {
              ...traj,
              x: newState.x,
              v: newState.v,
              points: newPoints
            };
          });
        }
      }
      
      // Background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);
      
      const cols = 2;
      const rows = 2;
      const panelWidth = width / cols;
      const panelHeight = height / rows;
      const padding = 25;
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 1: Phase Portrait (Top Left)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      
      // Panel border
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      // Title
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Phase Portrait: x vs ẋ', padding + 10, padding + 22);
      
      const scaleX = Math.min(panelWidth, panelHeight) / 10;
      const scaleV = scaleX * 0.7;
      const centerX = panelWidth / 2;
      const centerY = panelHeight / 2 + 15;
      
      // Anti-damping region (|x| < 1)
      ctx.fillStyle = 'rgba(0, 255, 100, 0.08)';
      ctx.fillRect(centerX - scaleX, padding + 35, 2 * scaleX, panelHeight - 2*padding - 35);
      
      // Damping region markers
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(centerX - scaleX, padding + 35);
      ctx.lineTo(centerX - scaleX, panelHeight - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + scaleX, padding + 35);
      ctx.lineTo(centerX + scaleX, panelHeight - padding);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Labels for regions
      ctx.fillStyle = 'rgba(100, 255, 150, 0.7)';
      ctx.font = '12px monospace';
      ctx.fillText('Energy IN', centerX - 35, centerY - 70);
      ctx.fillStyle = 'rgba(255, 100, 100, 0.7)';
      ctx.fillText('Energy OUT', padding + 15, centerY);
      ctx.fillText('Energy OUT', panelWidth - padding - 80, centerY);
      
      // Axis labels
      ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
      ctx.font = '11px monospace';
      ctx.fillText('x = -1', centerX - scaleX - 25, panelHeight - padding + 15);
      ctx.fillText('x = +1', centerX + scaleX - 15, panelHeight - padding + 15);
      
      // Coordinate axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, centerY);
      ctx.lineTo(panelWidth - padding, centerY);
      ctx.moveTo(centerX, padding + 35);
      ctx.lineTo(centerX, panelHeight - padding);
      ctx.stroke();
      
      // Draw trajectories
      trajectoriesRef.current.forEach((traj, idx) => {
        if (traj.points.length < 2) return;
        
        // Trajectory trail with gradient
        for (let i = 1; i < traj.points.length; i++) {
          const alpha = 0.3 + 0.7 * (i / traj.points.length);
          ctx.strokeStyle = traj.color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const px1 = centerX + traj.points[i-1].x * scaleX;
          const py1 = centerY - traj.points[i-1].v * scaleV;
          const px2 = centerX + traj.points[i].x * scaleX;
          const py2 = centerY - traj.points[i].v * scaleV;
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.stroke();
        }
        
        // Current position
        const px = centerX + traj.x * scaleX;
        const py = centerY - traj.v * scaleV;
        ctx.fillStyle = traj.color;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Glow effect
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, 2 * Math.PI);
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, 10);
        gradient.addColorStop(0, traj.color.replace('rgb', 'rgba').replace(')', ', 0.5)'));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      // Unstable origin marker
      ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 50, 50, 0.5)';
      ctx.font = '10px monospace';
      ctx.fillText('unstable', centerX + 12, centerY + 4);
      
      ctx.restore();
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 2: Damping Function (Top Right)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(panelWidth, 0);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Damping: γ(x) = μ(1 - x²)', padding + 10, padding + 22);
      
      const dampCenterX = panelWidth / 2;
      const dampCenterY = panelHeight / 2 + 20;
      const dampScaleX = scaleX;
      const dampScaleY = 50;
      
      // Zero line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, dampCenterY);
      ctx.lineTo(panelWidth - padding, dampCenterY);
      ctx.stroke();
      
      // Region fills
      ctx.fillStyle = 'rgba(0, 255, 100, 0.1)';
      ctx.fillRect(dampCenterX - dampScaleX, padding + 35, 2 * dampScaleX, dampCenterY - padding - 35);
      ctx.fillStyle = 'rgba(255, 50, 50, 0.1)';
      ctx.fillRect(padding, dampCenterY, dampCenterX - dampScaleX - padding, panelHeight - padding - dampCenterY);
      ctx.fillRect(dampCenterX + dampScaleX, dampCenterY, panelWidth - padding - dampCenterX - dampScaleX, panelHeight - padding - dampCenterY);
      
      // Draw parabola: y = μ(1 - x²)
      ctx.strokeStyle = 'rgba(150, 200, 255, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let px = padding; px < panelWidth - padding; px++) {
        const x = (px - dampCenterX) / dampScaleX;
        const y = mu * (1 - x * x);
        const py = dampCenterY - y * dampScaleY / mu;
        if (px === padding) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      
      // Current positions on curve
      trajectoriesRef.current.forEach(traj => {
        const px = dampCenterX + traj.x * dampScaleX;
        const dampValue = mu * (1 - traj.x * traj.x);
        const py = dampCenterY - dampValue * dampScaleY / mu;
        
        // Vertical line to zero
        ctx.strokeStyle = traj.color.replace('rgb', 'rgba').replace(')', ', 0.5)');
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, dampCenterY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Point on curve
        ctx.fillStyle = traj.color;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      // Labels
      ctx.fillStyle = 'rgba(100, 255, 150, 0.9)';
      ctx.font = '13px monospace';
      ctx.fillText('γ > 0: ANTI-DAMPING', dampCenterX - 70, padding + 50);
      ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
      ctx.fillText('γ < 0: DAMPING', padding + 10, dampCenterY + 40);
      
      // Axis labels
      ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
      ctx.font = '11px monospace';
      ctx.fillText('γ = 0', panelWidth - padding - 40, dampCenterY - 5);
      ctx.fillText(`γ = μ = ${mu.toFixed(1)}`, dampCenterX + 5, dampCenterY - dampScaleY - 5);
      
      ctx.restore();
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 3: Energy vs Time (Bottom Left)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(0, panelHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Energy: E = ½(x² + ẋ²)', padding + 10, padding + 22);
      
      const energyGraphX = padding * 2;
      const energyGraphY = padding + 40;
      const energyGraphW = panelWidth - 4 * padding;
      const energyGraphH = panelHeight - 3 * padding - 50;
      
      // Compute energies
      const allEnergies = trajectoriesRef.current.map(traj => 
        traj.points.map(p => 0.5 * (p.x * p.x + p.v * p.v))
      );
      
      const maxEnergy = Math.max(...allEnergies.flat(), 1);
      
      // Draw limit cycle energy reference
      const limitCycleEnergy = 2.0; // Approximate
      const lcY = energyGraphY + energyGraphH - (limitCycleEnergy / maxEnergy) * energyGraphH;
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(energyGraphX, lcY);
      ctx.lineTo(energyGraphX + energyGraphW, lcY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
      ctx.font = '11px monospace';
      ctx.fillText('Limit Cycle Energy', energyGraphX + energyGraphW - 130, lcY - 5);
      
      // Draw energy curves
      trajectoriesRef.current.forEach((traj, idx) => {
        if (traj.points.length < 2) return;
        
        const energies = allEnergies[idx];
        
        ctx.strokeStyle = traj.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < energies.length; i++) {
          const px = energyGraphX + (i / maxPoints) * energyGraphW;
          const py = energyGraphY + energyGraphH - (energies[i] / maxEnergy) * energyGraphH;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });
      
      // Legend
      ctx.font = '11px monospace';
      trajectoriesRef.current.forEach((traj, idx) => {
        const legendY = energyGraphY + energyGraphH + 20 + idx * 14;
        if (legendY < panelHeight - 5) {
          ctx.fillStyle = traj.color;
          ctx.fillRect(energyGraphX + idx * 140, legendY, 10, 10);
          ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
          ctx.fillText(traj.label, energyGraphX + 15 + idx * 140, legendY + 9);
        }
      });
      
      ctx.restore();
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 4: Time Series / Heartbeat (Bottom Right)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(panelWidth, panelHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      const title = showHeartbeat ? 'Cardiac Rhythm Model' : 'Time Series: x(t)';
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(title, padding + 10, padding + 22);
      
      if (showHeartbeat) {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        ctx.font = '12px monospace';
        ctx.fillText('♥ Sinoatrial Node Oscillation', padding + 10, padding + 42);
      }
      
      const timeCenterY = panelHeight / 2 + 20;
      const timeScaleY = 50;
      const timeGraphX = padding * 2;
      const timeGraphW = panelWidth - 4 * padding;
      
      // Zero line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(timeGraphX, timeCenterY);
      ctx.lineTo(timeGraphX + timeGraphW, timeCenterY);
      ctx.stroke();
      
      // Amplitude markers
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(timeGraphX, timeCenterY - 2 * timeScaleY);
      ctx.lineTo(timeGraphX + timeGraphW, timeCenterY - 2 * timeScaleY);
      ctx.moveTo(timeGraphX, timeCenterY + 2 * timeScaleY);
      ctx.lineTo(timeGraphX + timeGraphW, timeCenterY + 2 * timeScaleY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw time series
      trajectoriesRef.current.forEach(traj => {
        if (traj.points.length < 2) return;
        
        ctx.strokeStyle = traj.color;
        ctx.lineWidth = showHeartbeat ? 2.5 : 1.5;
        ctx.beginPath();
        for (let i = 0; i < traj.points.length; i++) {
          const px = timeGraphX + (i / maxPoints) * timeGraphW;
          const py = timeCenterY - traj.points[i].x * timeScaleY;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });
      
      // Time label
      ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
      ctx.font = '11px monospace';
      ctx.fillText(`t = ${timeRef.current.toFixed(1)}s`, timeGraphX + timeGraphW - 60, timeCenterY + 80);
      
      if (showHeartbeat) {
        // Heartbeat annotation
        ctx.fillStyle = 'rgba(255, 150, 150, 0.7)';
        ctx.font = '11px monospace';
        ctx.fillText('Relaxation oscillations → sharp "beats"', timeGraphX, panelHeight - padding - 30);
        ctx.fillText('Larger μ = sharper waveform', timeGraphX, panelHeight - padding - 15);
      }
      
      ctx.restore();
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isPlaying, mu, speed, showHeartbeat]);
  
  return (
    <div className="w-full h-[calc(100vh-3.5rem)] bg-gray-950 flex flex-col">
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
        
        {/* Equation Card */}
        <div className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur p-4 rounded-xl border border-gray-700 text-white max-w-xs">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            Van der Pol Oscillator
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="text-gray-400 hover:text-white"
            >
              <Info size={16} />
            </button>
          </h3>
          <div className="font-mono text-sm bg-gray-800 p-2 rounded mb-3">
            ẍ - μ(1-x²)ẋ + x = 0
          </div>
          
          {showInfo && (
            <div className="text-xs text-gray-300 mb-3 space-y-1">
              <p>• When |x| &lt; 1: negative damping → energy pumped IN</p>
              <p>• When |x| &gt; 1: positive damping → energy dissipated</p>
              <p>• Result: stable limit cycle regardless of initial conditions</p>
            </div>
          )}
          
          <div className="space-y-3">
            <div>
              <label className="text-xs block mb-1 flex justify-between">
                <span>μ (nonlinearity)</span>
                <span className="text-blue-400">{mu.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="8"
                step="0.1"
                value={mu}
                onChange={(e) => setMu(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Near-sinusoidal</span>
                <span>Relaxation</span>
              </div>
            </div>
            
            <div>
              <label className="text-xs block mb-1 flex justify-between">
                <span>Speed</span>
                <span className="text-blue-400">{speed}x</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all shadow-lg"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button
            onClick={reset}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl transition-all shadow-lg"
            title="Reset"
          >
            <RotateCcw size={22} />
          </button>
          <button
            onClick={() => setShowHeartbeat(!showHeartbeat)}
            className={`p-3 rounded-xl transition-all shadow-lg ${
              showHeartbeat 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title="Heartbeat Mode"
          >
            <Heart size={22} />
          </button>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur p-3 rounded-xl border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Initial Conditions</div>
          <div className="space-y-1">
            {trajectoriesRef.current.map((traj, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: traj.color }}
                />
                <span className="text-gray-300">{traj.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VanDerPolEnergy;
