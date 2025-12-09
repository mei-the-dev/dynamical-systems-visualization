import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Heart, Zap, TrendingUp } from 'lucide-react';

const VanDerPolEnergy = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mu, setMu] = useState(1.5);
  const [showHeartbeat, setShowHeartbeat] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showEnergy, setShowEnergy] = useState(true);
  const timeRef = useRef(0);
  
  const trajectoriesRef = useRef([
    { x: 0.1, v: 0, points: [], energies: [], color: 'rgb(255, 100, 100)', label: 'x₀=0.1' },
    { x: 0.5, v: 0, points: [], energies: [], color: 'rgb(100, 255, 100)', label: 'x₀=0.5' },
    { x: 2.0, v: 0, points: [], energies: [], color: 'rgb(100, 200, 255)', label: 'x₀=2.0' },
    { x: 3.0, v: 0, points: [], energies: [], color: 'rgb(255, 200, 100)', label: 'x₀=3.0' }
  ]);
  
  const maxPoints = 600;
  
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
    trajectoriesRef.current = [
      { x: 0.1, v: 0, points: [], color: 'rgb(255, 100, 100)' },
      { x: 0.5, v: 0, points: [], color: 'rgb(100, 255, 100)' },
      { x: 2.0, v: 0, points: [], color: 'rgb(100, 200, 255)' },
      { x: 3.0, v: 0, points: [], color: 'rgb(255, 200, 100)' }
    ];
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const animate = () => {
      if (isPlaying) {
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
      
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);
      
      const sectionHeight = height / 3;
      
      // SECTION 1: Phase Portrait
      ctx.save();
      ctx.translate(0, 0);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, width, sectionHeight);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('Phase Space (x vs v = dx/dt)', 10, 20);
      
      const scaleX = 50;
      const scaleV = 30;
      const centerX = width / 2;
      const centerY = sectionHeight / 2;
      
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX - scaleX, centerY - sectionHeight / 2);
      ctx.lineTo(centerX - scaleX, centerY + sectionHeight / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + scaleX, centerY - sectionHeight / 2);
      ctx.lineTo(centerX + scaleX, centerY + sectionHeight / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
      ctx.font = '11px monospace';
      ctx.fillText('x=-1', centerX - scaleX - 30, centerY);
      ctx.fillText('x=+1', centerX + scaleX + 5, centerY);
      ctx.fillText('Anti-damping', centerX - 40, centerY - 60);
      ctx.fillText('region', centerX - 30, centerY - 45);
      
      trajectoriesRef.current.forEach(traj => {
        if (traj.points.length < 2) return;
        
        ctx.strokeStyle = traj.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < traj.points.length; i++) {
          const px = centerX + traj.points[i].x * scaleX;
          const py = centerY - traj.points[i].v * scaleV;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        const px = centerX + traj.x * scaleX;
        const py = centerY - traj.v * scaleV;
        ctx.fillStyle = traj.color;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      ctx.restore();
      
      // SECTION 2: Damping Function
      ctx.save();
      ctx.translate(0, sectionHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, width, sectionHeight);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('Damping Coefficient: (1 - x²)', 10, 20);
      
      const dampCenterY = sectionHeight / 2;
      const dampScale = 40;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, dampCenterY);
      ctx.lineTo(width, dampCenterY);
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(150, 150, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px < width; px++) {
        const x = (px - width / 2) / scaleX;
        const y = 1 - x * x;
        const py = dampCenterY - y * dampScale;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
      ctx.fillRect(width / 2 - scaleX, 0, 2 * scaleX, dampCenterY);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      ctx.fillRect(0, dampCenterY, width / 2 - scaleX, sectionHeight / 2);
      ctx.fillRect(width / 2 + scaleX, dampCenterY, width / 2 - scaleX, sectionHeight / 2);
      
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.font = '12px monospace';
      ctx.fillText('Energy IN', width / 2 - 40, dampCenterY - 50);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.fillText('Energy OUT', 50, dampCenterY + 50);
      
      trajectoriesRef.current.forEach(traj => {
        const px = width / 2 + traj.x * scaleX;
        const dampValue = 1 - traj.x * traj.x;
        const py = dampCenterY - dampValue * dampScale;
        
        ctx.fillStyle = traj.color;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = traj.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, dampCenterY);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      
      ctx.restore();
      
      // SECTION 3: Time series
      ctx.save();
      ctx.translate(0, 2 * sectionHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, width, sectionHeight);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('Position vs Time: x(t)', 10, 20);
      
      const timeCenterY = sectionHeight / 2;
      const timeScale = 40;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, timeCenterY);
      ctx.lineTo(width, timeCenterY);
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, timeCenterY - timeScale);
      ctx.lineTo(width, timeCenterY - timeScale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, timeCenterY + timeScale);
      ctx.lineTo(width, timeCenterY + timeScale);
      ctx.stroke();
      ctx.setLineDash([]);
      
      trajectoriesRef.current.forEach(traj => {
        if (traj.points.length < 2) return;
        
        ctx.strokeStyle = traj.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < traj.points.length; i++) {
          const px = (i / maxPoints) * width;
          const py = timeCenterY - traj.points[i].x * timeScale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });
      
      ctx.restore();
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, mu]);
  
  return (
    <div className="w-full h-screen bg-gray-950 flex flex-col">
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={900}
          height={750}
          className="w-full h-full"
        />
        
        <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-95 p-4 rounded-lg text-white w-64">
          <h3 className="font-bold mb-3">Van der Pol Equation</h3>
          <div className="font-mono text-sm mb-3">
            x'' - μ(1-x²)x' + x = 0
          </div>
          
          <div className="mb-4">
            <label className="text-sm block mb-1">μ (nonlinearity): {mu.toFixed(2)}</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={mu}
              onChange={(e) => setMu(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="text-xs space-y-1 text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span>Small amplitude</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span>Medium amplitude</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-300 rounded"></div>
              <span>Large amplitude</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-300 rounded"></div>
              <span>Very large amplitude</span>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={reset}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 text-white text-sm">
        <div className="max-w-4xl mx-auto space-y-2">
          <p>
            <strong>Top:</strong> Phase space shows all trajectories spiraling toward the same limit cycle.
          </p>
          <p>
            <strong>Middle:</strong> When |x| &lt; 1, damping coefficient (1-x²) is positive → anti-damping → energy flows IN.
            When |x| &gt; 1, it's negative → normal damping → energy flows OUT.
          </p>
          <p>
            <strong>Bottom:</strong> All oscillations converge to the same amplitude regardless of initial conditions!
          </p>
        </div>
      </div>
    </div>
  );
};

export default VanDerPolEnergy;