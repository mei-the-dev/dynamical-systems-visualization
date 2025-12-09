import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Eye, Sparkles } from 'lucide-react';

const LorenzDetailed = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sigma, setSigma] = useState(10);
  const [rho, setRho] = useState(28);
  const [beta, setBeta] = useState(8/3);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState('xz'); // 'xz', 'xy', 'yz', '3d'
  const [trailLength, setTrailLength] = useState(1000);
  const [showSecondTrajectory, setShowSecondTrajectory] = useState(true);
  
  const trajectoriesRef = useRef([
    { x: 0.0, y: 1.0, z: 1.05, points: [], color: 'rgb(255, 100, 100)' },
    { x: 0.0, y: 1.0, z: 1.0500001, points: [], color: 'rgb(100, 200, 255)' }
  ]);
  
  const timeRef = useRef(0);
  const rotationRef = useRef(0);
  
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
    timeRef.current = 0;
    trajectoriesRef.current = [
      { x: 0.0, y: 1.0, z: 1.05, points: [], color: 'rgb(255, 100, 100)' },
      { x: 0.0, y: 1.0, z: 1.0500001, points: [], color: 'rgb(100, 200, 255)' }
    ];
  };
  
  // 3D projection helper
  const project3D = (x, y, z, width, height, rotation) => {
    const scale = Math.min(width, height) / 80;
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    
    // Rotate around z-axis
    const xr = x * cosR - y * sinR;
    const yr = x * sinR + y * cosR;
    
    // Simple perspective
    const perspective = 1 + z / 100;
    
    return {
      px: width / 2 + xr * scale * perspective,
      py: height / 2 - (z - 25) * scale * 0.8 + yr * scale * 0.3,
      depth: yr
    };
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
        timeRef.current += 0.005;
        rotationRef.current += 0.002;
        
        trajectoriesRef.current = trajectoriesRef.current.map(traj => {
          const dt = 0.005;
          const newState = rk4Step(traj.x, traj.y, traj.z, dt, sigma, rho, beta);
          
          const newPoints = [...traj.points, { x: newState.x, y: newState.y, z: newState.z }];
          if (newPoints.length > trailLength) {
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
      
      // Background with gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#0a0a12');
      bgGradient.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
      
      const cols = 2;
      const rows = 2;
      const panelWidth = width / cols;
      const panelHeight = height / rows;
      const padding = 25;
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 1: Main Attractor View (Top Left)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      const viewLabels = {
        'xz': 'XZ Projection (Butterfly)',
        'xy': 'XY Projection (Top View)',
        'yz': 'YZ Projection (Side View)',
        '3d': '3D Rotating View'
      };
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(viewLabels[viewMode], padding + 10, padding + 22);
      
      const centerX = panelWidth / 2;
      const centerY = panelHeight / 2 + 15;
      const scale = Math.min(panelWidth, panelHeight) / 70;
      
      // Fixed points markers (only for 2D views)
      if (rho > 1 && viewMode !== '3d') {
        const sqrtTerm = Math.sqrt(beta * (rho - 1));
        const zFixed = rho - 1;
        
        let cp1, cp2;
        if (viewMode === 'xz') {
          cp1 = { x: centerX + sqrtTerm * scale, y: centerY - zFixed * scale * 0.7 };
          cp2 = { x: centerX - sqrtTerm * scale, y: centerY - zFixed * scale * 0.7 };
        } else if (viewMode === 'xy') {
          cp1 = { x: centerX + sqrtTerm * scale, y: centerY - sqrtTerm * scale };
          cp2 = { x: centerX - sqrtTerm * scale, y: centerY + sqrtTerm * scale };
        } else {
          cp1 = { x: centerX + sqrtTerm * scale, y: centerY - zFixed * scale * 0.7 };
          cp2 = { x: centerX - sqrtTerm * scale, y: centerY - zFixed * scale * 0.7 };
        }
        
        // Fixed point C+
        ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(cp1.x, cp1.y, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
        ctx.font = '12px monospace';
        ctx.fillText('C+', cp1.x + 18, cp1.y + 5);
        
        // Fixed point C-
        ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(cp2.x, cp2.y, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
        ctx.fillText('C-', cp2.x - 30, cp2.y + 5);
      }
      
      // Draw trajectories
      const trajsToDraw = showSecondTrajectory ? trajectoriesRef.current : [trajectoriesRef.current[0]];
      
      trajsToDraw.forEach((traj, trajIdx) => {
        if (traj.points.length < 2) return;
        
        // Draw with depth-based coloring for 3D
        for (let i = 1; i < traj.points.length; i++) {
          const alpha = 0.2 + 0.8 * (i / traj.points.length);
          
          let p1, p2;
          if (viewMode === '3d') {
            const proj1 = project3D(traj.points[i-1].x, traj.points[i-1].y, traj.points[i-1].z, panelWidth, panelHeight, rotationRef.current);
            const proj2 = project3D(traj.points[i].x, traj.points[i].y, traj.points[i].z, panelWidth, panelHeight, rotationRef.current);
            p1 = { x: proj1.px, y: proj1.py };
            p2 = { x: proj2.px, y: proj2.py };
          } else {
            const pt1 = traj.points[i-1];
            const pt2 = traj.points[i];
            
            if (viewMode === 'xz') {
              p1 = { x: centerX + pt1.x * scale, y: centerY - pt1.z * scale * 0.7 };
              p2 = { x: centerX + pt2.x * scale, y: centerY - pt2.z * scale * 0.7 };
            } else if (viewMode === 'xy') {
              p1 = { x: centerX + pt1.x * scale, y: centerY - pt1.y * scale };
              p2 = { x: centerX + pt2.x * scale, y: centerY - pt2.y * scale };
            } else {
              p1 = { x: centerX + pt1.y * scale, y: centerY - pt1.z * scale * 0.7 };
              p2 = { x: centerX + pt2.y * scale, y: centerY - pt2.z * scale * 0.7 };
            }
          }
          
          ctx.strokeStyle = traj.color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        
        // Current position
        let currentPos;
        if (viewMode === '3d') {
          const proj = project3D(traj.x, traj.y, traj.z, panelWidth, panelHeight, rotationRef.current);
          currentPos = { x: proj.px, y: proj.py };
        } else if (viewMode === 'xz') {
          currentPos = { x: centerX + traj.x * scale, y: centerY - traj.z * scale * 0.7 };
        } else if (viewMode === 'xy') {
          currentPos = { x: centerX + traj.x * scale, y: centerY - traj.y * scale };
        } else {
          currentPos = { x: centerX + traj.y * scale, y: centerY - traj.z * scale * 0.7 };
        }
        
        // Glowing particle
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, 8, 0, 2 * Math.PI);
        const glow = ctx.createRadialGradient(currentPos.x, currentPos.y, 0, currentPos.x, currentPos.y, 12);
        glow.addColorStop(0, traj.color);
        glow.addColorStop(0.5, traj.color.replace('rgb', 'rgba').replace(')', ', 0.5)'));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fill();
        
        ctx.fillStyle = traj.color;
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      ctx.restore();
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 2: Trajectory Divergence (Top Right)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(panelWidth, 0);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Sensitive Dependence (Butterfly Effect)', padding + 10, padding + 22);
      
      const graphX = padding * 2;
      const graphY = padding + 50;
      const graphW = panelWidth - 4 * padding;
      const graphH = panelHeight - 2 * padding - 80;
      
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
        
        // Log scale plot
        const logDistances = distances.map(d => Math.log10(d + 1e-10));
        const minLog = -10;
        const maxLog = 2;
        
        // Grid lines
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
        ctx.lineWidth = 1;
        for (let logVal = -8; logVal <= 2; logVal += 2) {
          const py = graphY + graphH - ((logVal - minLog) / (maxLog - minLog)) * graphH;
          ctx.beginPath();
          ctx.moveTo(graphX, py);
          ctx.lineTo(graphX + graphW, py);
          ctx.stroke();
          
          ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
          ctx.font = '10px monospace';
          ctx.fillText(`10^${logVal}`, graphX - 35, py + 4);
        }
        
        // Distance curve
        ctx.strokeStyle = 'rgba(255, 100, 255, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < logDistances.length; i++) {
          const px = graphX + (i / trailLength) * graphW;
          const py = graphY + graphH - ((logDistances[i] - minLog) / (maxLog - minLog)) * graphH;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        // Lyapunov exponent indicator
        if (distances.length > 100) {
          const recentGrowth = (logDistances[logDistances.length - 1] - logDistances[Math.max(0, logDistances.length - 100)]) / 100;
          const lyapunov = recentGrowth / 0.005 * Math.log(10); // Convert to natural log rate
          
          ctx.fillStyle = lyapunov > 0 ? 'rgba(255, 100, 100, 0.9)' : 'rgba(100, 255, 100, 0.9)';
          ctx.font = '12px monospace';
          ctx.fillText(`λ ≈ ${lyapunov.toFixed(2)} (Lyapunov estimate)`, graphX, graphY + graphH + 25);
        }
        
        // Current distance
        const currentDist = distances[distances.length - 1];
        ctx.fillStyle = 'rgba(255, 100, 255, 0.9)';
        ctx.font = '13px monospace';
        ctx.fillText(`Δ = ${currentDist.toExponential(2)}`, graphX, padding + 45);
        ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
        ctx.font = '11px monospace';
        ctx.fillText(`Initial Δz₀ = 10⁻⁷`, graphX + 150, padding + 45);
      }
      
      ctx.restore();
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 3: State Variables (Bottom Left)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(0, panelHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('State Variables: x(t), y(t), z(t)', padding + 10, padding + 22);
      
      const stateGraphX = padding * 2;
      const stateGraphY = padding + 45;
      const stateGraphW = panelWidth - 4 * padding;
      const stateGraphH = (panelHeight - 3 * padding - 60) / 3;
      
      const colors = ['rgba(255, 100, 100, 0.9)', 'rgba(100, 255, 100, 0.9)', 'rgba(100, 200, 255, 0.9)'];
      const labels = ['x(t)', 'y(t)', 'z(t)'];
      const maxVals = [30, 30, 55];
      
      const traj = trajectoriesRef.current[0];
      
      if (traj.points.length > 1) {
        ['x', 'y', 'z'].forEach((coord, idx) => {
          const graphTop = stateGraphY + idx * (stateGraphH + 10);
          const graphCenterY = graphTop + stateGraphH / 2;
          
          // Zero line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(stateGraphX, graphCenterY);
          ctx.lineTo(stateGraphX + stateGraphW, graphCenterY);
          ctx.stroke();
          
          // Variable curve
          ctx.strokeStyle = colors[idx];
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let i = 0; i < traj.points.length; i++) {
            const px = stateGraphX + (i / trailLength) * stateGraphW;
            const val = traj.points[i][coord];
            const py = graphCenterY - (val / maxVals[idx]) * (stateGraphH / 2);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          
          // Label
          ctx.fillStyle = colors[idx];
          ctx.font = '12px monospace';
          ctx.fillText(`${labels[idx]} = ${traj[coord].toFixed(2)}`, stateGraphX, graphTop - 5);
        });
      }
      
      ctx.restore();
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 4: Energy / Nonlinear Terms (Bottom Right)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(panelWidth, panelHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Energy & Wing Switching', padding + 10, padding + 22);
      
      const energyGraphX = padding * 2;
      const energyGraphY = padding + 50;
      const energyGraphW = panelWidth - 4 * padding;
      const energyGraphH = panelHeight - 3 * padding - 80;
      
      if (traj.points.length > 1) {
        // Energy: E = x² + y² + (z - σ - ρ)²
        const energies = traj.points.map(p => 
          p.x*p.x + p.y*p.y + p.z*p.z
        );
        const maxE = Math.max(...energies, 1);
        
        // Wing indicator (sign of x)
        const wingIndicator = traj.points.map(p => p.x > 0 ? 1 : -1);
        
        // Draw wing switching as background
        let lastSign = wingIndicator[0];
        let startIdx = 0;
        for (let i = 1; i <= wingIndicator.length; i++) {
          if (i === wingIndicator.length || wingIndicator[i] !== lastSign) {
            const startPx = energyGraphX + (startIdx / trailLength) * energyGraphW;
            const endPx = energyGraphX + (i / trailLength) * energyGraphW;
            
            ctx.fillStyle = lastSign > 0 ? 'rgba(255, 100, 100, 0.1)' : 'rgba(100, 200, 255, 0.1)';
            ctx.fillRect(startPx, energyGraphY, endPx - startPx, energyGraphH);
            
            if (i < wingIndicator.length) {
              lastSign = wingIndicator[i];
              startIdx = i;
            }
          }
        }
        
        // Energy curve
        ctx.strokeStyle = 'rgba(255, 200, 100, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < energies.length; i++) {
          const px = energyGraphX + (i / trailLength) * energyGraphW;
          const py = energyGraphY + energyGraphH - (energies[i] / maxE) * energyGraphH;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
        ctx.font = '12px monospace';
        ctx.fillText(`E = ${energies[energies.length - 1].toFixed(1)}`, energyGraphX, padding + 45);
        
        ctx.fillStyle = 'rgba(255, 100, 100, 0.7)';
        ctx.font = '11px monospace';
        ctx.fillText('Right wing (x > 0)', energyGraphX + energyGraphW - 130, energyGraphY - 5);
        ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
        ctx.fillText('Left wing (x < 0)', energyGraphX, energyGraphY - 5);
        
        ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.fillText('Aperiodic switching between wings', energyGraphX, energyGraphY + energyGraphH + 25);
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
  }, [isPlaying, sigma, rho, beta, viewMode, trailLength, showSecondTrajectory]);
  
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
            <Sparkles size={18} className="text-yellow-400" />
            Lorenz System
          </h3>
          <div className="font-mono text-xs bg-gray-800 p-2 rounded mb-3 space-y-1">
            <div>ẋ = σ(y - x)</div>
            <div>ẏ = x(ρ - z) - y</div>
            <div>ż = xy - βz</div>
          </div>
          
          <div className="text-xs text-gray-400 mb-2">
            σ={sigma.toFixed(1)} | ρ={rho.toFixed(1)} | β={beta.toFixed(2)}
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
          <div className="absolute top-36 left-4 bg-gray-900/95 backdrop-blur p-4 rounded-xl border border-gray-700 text-white w-72">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm">Parameters</h4>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs flex justify-between mb-1">
                  <span>σ (Prandtl)</span>
                  <span className="text-blue-400">{sigma.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={sigma}
                  onChange={(e) => setSigma(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              
              <div>
                <label className="text-xs flex justify-between mb-1">
                  <span>ρ (Rayleigh)</span>
                  <span className="text-blue-400">{rho.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={rho}
                  onChange={(e) => setRho(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Chaos onset: ρ ≈ 24.74
                </div>
              </div>
              
              <div>
                <label className="text-xs flex justify-between mb-1">
                  <span>β (Geometry)</span>
                  <span className="text-blue-400">{beta.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={beta}
                  onChange={(e) => setBeta(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              
              <div>
                <label className="text-xs flex justify-between mb-1">
                  <span>Trail Length</span>
                  <span className="text-blue-400">{trailLength}</span>
                </label>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="100"
                  value={trailLength}
                  onChange={(e) => setTrailLength(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showSecond"
                  checked={showSecondTrajectory}
                  onChange={(e) => setShowSecondTrajectory(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showSecond" className="text-xs">
                  Show second trajectory (divergence)
                </label>
              </div>
            </div>
          </div>
        )}
        
        {/* View Mode Selector */}
        <div className="absolute top-4 right-4 bg-gray-900/95 backdrop-blur p-2 rounded-xl border border-gray-700">
          <div className="flex gap-1">
            {['xz', 'xy', 'yz', '3d'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {mode.toUpperCase()}
              </button>
            ))}
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
        </div>
        
        {/* Status */}
        <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur px-4 py-2 rounded-xl border border-gray-700 text-xs font-mono text-gray-400">
          t = {timeRef.current?.toFixed(2) || '0.00'}s
        </div>
      </div>
    </div>
  );
};

export default LorenzDetailed;
