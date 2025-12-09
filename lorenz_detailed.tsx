import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

const LorenzDetailed = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sigma, setSigma] = useState(10);
  const [rho, setRho] = useState(28);
  const [beta, setBeta] = useState(8/3);
  const [showSettings, setShowSettings] = useState(false);
  
  const trajectoriesRef = useRef([
    { x: 0.0, y: 1.0, z: 1.05, points: [], color: 'rgb(255, 100, 100)' },
    { x: 0.0, y: 1.0, z: 1.06, points: [], color: 'rgb(100, 255, 100)' }
  ]);
  
  const maxPoints = 1000;
  
  const lorenz = (x, y, z, s, r, b) => {
    return {
      dxdt: s * (y - x),
      dydt: x * (r - z) - y,
      dzdt: x * y - b * z
    };
  };
  
  const rk4Step = (x, y, z, dt, s, r, b) => {
    const k1 = lorenz(x, y, z, s, r, b);
    const k2 = lorenz(x + 0.5*dt*k1.dxdt, y + 0.5*dt*k1.dydt, z + 0.5*dt*k1.dzdt, s, r, b);
    const k3 = lorenz(x + 0.5*dt*k2.dxdt, y + 0.5*dt*k2.dydt, z + 0.5*dt*k2.dzdt, s, r, b);
    const k4 = lorenz(x + dt*k3.dxdt, y + dt*k3.dydt, z + dt*k3.dzdt, s, r, b);
    
    return {
      x: x + (dt/6) * (k1.dxdt + 2*k2.dxdt + 2*k3.dxdt + k4.dxdt),
      y: y + (dt/6) * (k1.dydt + 2*k2.dydt + 2*k3.dydt + k4.dydt),
      z: z + (dt/6) * (k1.dzdt + 2*k2.dzdt + 2*k3.dzdt + k4.dzdt)
    };
  };
  
  const reset = () => {
    trajectoriesRef.current = [
      { x: 0.0, y: 1.0, z: 1.05, points: [], color: 'rgb(255, 100, 100)' },
      { x: 0.0, y: 1.0, z: 1.06, points: [], color: 'rgb(100, 255, 100)' }
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
        trajectoriesRef.current = trajectoriesRef.current.map(traj => {
          const dt = 0.005;
          const newState = rk4Step(traj.x, traj.y, traj.z, dt, sigma, rho, beta);
          
          const newPoints = [...traj.points, { x: newState.x, y: newState.y, z: newState.z }];
          if (newPoints.length > maxPoints) {
            newPoints.shift();
          }
          
          return {
            ...traj,
            x: newState.x,
            y: newState.y,
            z: newState.z,
            points: newPoints
          };
        });
      }
      
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);
      
      const cols = 2;
      const rows = 2;
      const panelWidth = width / cols;
      const panelHeight = height / rows;
      const padding = 20;
      
      // PANEL 1: XZ Phase Portrait (Top Left)
      ctx.save();
      ctx.translate(0, 0);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('XZ Phase Space (Butterfly)', padding + 10, padding + 25);
      
      const scaleX1 = Math.min(panelWidth, panelHeight) / 60;
      const scaleZ1 = Math.min(panelWidth, panelHeight) / 100;
      const centerX1 = panelWidth / 2;
      const centerY1 = panelHeight / 2 + 20;
      
      const sqrtTerm = Math.sqrt(beta * (rho - 1));
      const zFixed = rho - 1;
      
      if (rho > 1) {
        const cpX = centerX1 + sqrtTerm * scaleX1;
        const cpZ = centerY1 - zFixed * scaleZ1;
        ctx.fillStyle = 'rgba(255, 200, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(cpX, cpZ, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 200, 0, 0.9)';
        ctx.font = '13px monospace';
        ctx.fillText('C+', cpX + 15, cpZ + 5);
        
        const cmX = centerX1 - sqrtTerm * scaleX1;
        const cmZ = centerY1 - zFixed * scaleZ1;
        ctx.fillStyle = 'rgba(255, 200, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(cmX, cmZ, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 200, 0, 0.9)';
        ctx.fillText('C-', cmX - 30, cmZ + 5);
      }
      
      trajectoriesRef.current.forEach(traj => {
        if (traj.points.length < 2) return;
        
        ctx.strokeStyle = traj.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < traj.points.length; i++) {
          const px = centerX1 + traj.points[i].x * scaleX1;
          const py = centerY1 - traj.points[i].z * scaleZ1;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        const px = centerX1 + traj.x * scaleX1;
        const py = centerY1 - traj.z * scaleZ1;
        ctx.fillStyle = traj.color;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      ctx.restore();
      
      // PANEL 2: Energy Analysis (Top Right)
      ctx.save();
      ctx.translate(panelWidth, 0);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('Energy: E = x² + y² + z²', padding + 10, padding + 25);
      
      if (trajectoriesRef.current[0].points.length > 1) {
        const energies = trajectoriesRef.current[0].points.map(p => 
          p.x*p.x + p.y*p.y + p.z*p.z
        );
        
        const maxE = Math.max(...energies, 1);
        const minE = Math.min(...energies, 0);
        const rangeE = maxE - minE || 1;
        
        const graphWidth = panelWidth - 4*padding;
        const graphHeight = panelHeight - 6*padding;
        const graphX = padding * 2;
        const graphY = padding * 3;
        
        // Draw energy plot
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < energies.length; i++) {
          const px = graphX + (i / maxPoints) * graphWidth;
          const py = graphY + graphHeight - ((energies[i] - minE) / rangeE) * graphHeight;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        // Energy rate of change (derivative)
        const energyRates = [];
        for (let i = 1; i < energies.length; i++) {
          energyRates.push((energies[i] - energies[i-1]) / 0.005);
        }
        
        if (energyRates.length > 0) {
          const maxRate = Math.max(...energyRates.map(Math.abs), 1);
          
          ctx.strokeStyle = 'rgba(255, 100, 255, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let i = 0; i < energyRates.length; i++) {
            const px = graphX + ((i+1) / maxPoints) * graphWidth;
            const py = graphY + graphHeight/2 - (energyRates[i] / maxRate) * (graphHeight/4);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          
          // Zero line for rate
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(graphX, graphY + graphHeight/2);
          ctx.lineTo(graphX + graphWidth, graphY + graphHeight/2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        // Labels
        ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
        ctx.font = '12px monospace';
        ctx.fillText(`E = ${energies[energies.length-1].toFixed(2)}`, graphX, graphY - 10);
        
        ctx.fillStyle = 'rgba(255, 100, 255, 0.7)';
        ctx.fillText('dE/dt (energy flow)', graphX + graphWidth - 150, graphY - 10);
        
        ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
        ctx.font = '11px monospace';
        ctx.fillText('Energy oscillates but stays bounded', graphX, graphY + graphHeight + 25);
        ctx.fillText('(dissipative system)', graphX, graphY + graphHeight + 40);
      }
      
      ctx.restore();
      
      // PANEL 3: Nonlinear Coupling Terms (Bottom Left)
      ctx.save();
      ctx.translate(0, panelHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('Nonlinear Terms', padding + 10, padding + 25);
      
      const graphWidth2 = panelWidth - 4*padding;
      const graphHeight2 = panelHeight - 5*padding;
      const graphX2 = padding * 2;
      const graphY2 = padding * 2.5;
      const graphCenterY2 = graphY2 + graphHeight2 / 2;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(graphX2, graphCenterY2);
      ctx.lineTo(graphX2 + graphWidth2, graphCenterY2);
      ctx.stroke();
      
      if (trajectoriesRef.current[0].points.length > 1) {
        const traj = trajectoriesRef.current[0];
        
        // x(ρ-z)
        const xrzValues = traj.points.map(p => p.x * (rho - p.z));
        const maxXRZ = Math.max(...xrzValues.map(Math.abs), 1);
        
        ctx.strokeStyle = 'rgba(150, 200, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < xrzValues.length; i++) {
          const px = graphX2 + (i / maxPoints) * graphWidth2;
          const py = graphCenterY2 - (xrzValues[i] / maxXRZ) * (graphHeight2 / 3);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        // xy
        const xyValues = traj.points.map(p => p.x * p.y);
        const maxXY = Math.max(...xyValues.map(Math.abs), 1);
        
        ctx.strokeStyle = 'rgba(255, 150, 150, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < xyValues.length; i++) {
          const px = graphX2 + (i / maxPoints) * graphWidth2;
          const py = graphCenterY2 - (xyValues[i] / maxXY) * (graphHeight2 / 3);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(150, 200, 255, 0.9)';
        ctx.font = '13px monospace';
        ctx.fillText('x(ρ-z): drives dy/dt', graphX2, padding + 50);
        
        ctx.fillStyle = 'rgba(255, 150, 150, 0.9)';
        ctx.fillText('xy: drives dz/dt', graphX2, padding + 68);
        
        ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
        ctx.font = '11px monospace';
        ctx.fillText('Bilinear coupling creates', graphX2, graphY2 + graphHeight2 + 25);
        ctx.fillText('stretching & folding → chaos', graphX2, graphY2 + graphHeight2 + 40);
      }
      
      ctx.restore();
      
      // PANEL 4: Trajectory Divergence (Bottom Right)
      ctx.save();
      ctx.translate(panelWidth, panelHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('Sensitive Dependence', padding + 10, padding + 25);
      
      const graphWidth3 = panelWidth - 4*padding;
      const graphHeight3 = panelHeight - 5*padding;
      const graphX3 = padding * 2;
      const graphY3 = padding * 2.5;
      const divCenterY = graphY3 + graphHeight3 / 2;
      
      if (trajectoriesRef.current[0].points.length > 1 && trajectoriesRef.current[1].points.length > 1) {
        const distances = [];
        const minLen = Math.min(trajectoriesRef.current[0].points.length, trajectoriesRef.current[1].points.length);
        
        for (let i = 0; i < minLen; i++) {
          const p1 = trajectoriesRef.current[0].points[i];
          const p2 = trajectoriesRef.current[1].points[i];
          const dist = Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + 
            Math.pow(p1.y - p2.y, 2) + 
            Math.pow(p1.z - p2.z, 2)
          );
          distances.push(dist);
        }
        
        ctx.strokeStyle = 'rgba(255, 100, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < distances.length; i++) {
          const logDist = Math.log10(distances[i] + 1e-10);
          const px = graphX3 + (i / maxPoints) * graphWidth3;
          const py = divCenterY - logDist * (graphHeight3 / 8);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.setLineDash([5, 5]);
        for (let logVal = -2; logVal <= 2; logVal++) {
          const py = divCenterY - logVal * (graphHeight3 / 8);
          ctx.beginPath();
          ctx.moveTo(graphX3, py);
          ctx.lineTo(graphX3 + graphWidth3, py);
          ctx.stroke();
          
          ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
          ctx.font = '11px monospace';
          ctx.fillText(`10^${logVal}`, graphX3 + 5, py - 5);
        }
        ctx.setLineDash([]);
        
        const currentDist = distances[distances.length - 1];
        ctx.fillStyle = 'rgba(255, 100, 255, 0.9)';
        ctx.font = '13px monospace';
        ctx.fillText(`Distance: ${currentDist.toFixed(6)}`, graphX3, padding + 50);
        ctx.fillText(`Initial Δz: 0.01`, graphX3, padding + 68);
        
        ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
        ctx.font = '11px monospace';
        ctx.fillText('Exponential divergence despite', graphX3, graphY3 + graphHeight3 + 25);
        ctx.fillText('tiny initial difference', graphX3, graphY3 + graphHeight3 + 40);
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
  }, [isPlaying, sigma, rho, beta]);
  
  return (
    <div className="w-full h-screen bg-gray-950 flex flex-col overflow-hidden">
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
        
        <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-90 p-3 rounded-lg text-white">
          <h2 className="text-lg font-bold mb-1">Lorenz Attractor</h2>
          <div className="space-y-0 text-xs font-mono">
            <div>dx/dt = σ(y - x)</div>
            <div>dy/dt = x(ρ - z) - y</div>
            <div>dz/dt = xy - βz</div>
          </div>
          <div className="mt-2 space-y-0 text-xs">
            <div>σ={sigma.toFixed(1)} ρ={rho.toFixed(1)} β={beta.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={reset}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
        
        {showSettings && (
          <div className="absolute bottom-16 left-4 bg-gray-900 bg-opacity-95 p-4 rounded-lg text-white w-64">
            <h3 className="font-bold mb-3 text-sm">Parameters</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs block mb-1">σ (Prandtl): {sigma.toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={sigma}
                  onChange={(e) => setSigma(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-xs block mb-1">ρ (Rayleigh): {rho.toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={rho}
                  onChange={(e) => setRho(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Chaos at ρ ≈ 24.74
                </div>
              </div>
              
              <div>
                <label className="text-xs block mb-1">β (Geometry): {beta.toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={beta}
                  onChange={(e) => setBeta(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LorenzDetailed;