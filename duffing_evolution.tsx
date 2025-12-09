import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const DuffingEvolution = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [gamma, setGamma] = useState(0);
  const [mode, setMode] = useState('unforced');
  
  // Parameters
  const delta = 0.3;  // damping
  const alpha = -1;   // linear (negative for double-well)
  const beta = 1;     // cubic (positive)
  const omega = 1.2;  // forcing frequency
  
  const trajectoriesRef = useRef([
    { x: 0.5, y: 0, phi: 0, points: [], color: 'rgb(255, 100, 100)' },
    { x: -0.5, y: 0, phi: 0, points: [], color: 'rgb(100, 255, 100)' },
    { x: 1.0, y: 0, phi: 0, points: [], color: 'rgb(100, 200, 255)' }
  ]);
  
  const poincareRef = useRef([]);
  const maxPoints = 1000;
  const maxPoincare = 500;
  
  const duffing = (x, y, phi, g) => {
    return {
      dxdt: y,
      dydt: -delta * y - alpha * x - beta * x * x * x + g * Math.cos(phi),
      dphidt: omega
    };
  };
  
  const rk4Step = (x, y, phi, dt, g) => {
    const k1 = duffing(x, y, phi, g);
    const k2 = duffing(
      x + 0.5*dt*k1.dxdt, 
      y + 0.5*dt*k1.dydt, 
      phi + 0.5*dt*k1.dphidt, 
      g
    );
    const k3 = duffing(
      x + 0.5*dt*k2.dxdt, 
      y + 0.5*dt*k2.dydt, 
      phi + 0.5*dt*k2.dphidt, 
      g
    );
    const k4 = duffing(
      x + dt*k3.dxdt, 
      y + dt*k3.dydt, 
      phi + dt*k3.dphidt, 
      g
    );
    
    return {
      x: x + (dt/6) * (k1.dxdt + 2*k2.dxdt + 2*k3.dxdt + k4.dxdt),
      y: y + (dt/6) * (k1.dydt + 2*k2.dydt + 2*k3.dydt + k4.dydt),
      phi: (phi + (dt/6) * (k1.dphidt + 2*k2.dphidt + 2*k3.dphidt + k4.dphidt)) % (2 * Math.PI)
    };
  };
  
  const reset = () => {
    trajectoriesRef.current = [
      { x: 0.5, y: 0, phi: 0, points: [], color: 'rgb(255, 100, 100)' },
      { x: -0.5, y: 0, phi: 0, points: [], color: 'rgb(100, 255, 100)' },
      { x: 1.0, y: 0, phi: 0, points: [], color: 'rgb(100, 200, 255)' }
    ];
    poincareRef.current = [];
  };
  
  useEffect(() => {
    reset();
  }, [mode]);
  
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
      
      let currentGamma = 0;
      if (mode === 'weak') currentGamma = 0.3;
      else if (mode === 'moderate') currentGamma = 0.37;
      else if (mode === 'chaos') currentGamma = 0.5;
      else if (mode === 'custom') currentGamma = gamma;
      
      if (isPlaying) {
        trajectoriesRef.current = trajectoriesRef.current.map(traj => {
          const dt = 0.01;
          const oldPhi = traj.phi;
          const newState = rk4Step(traj.x, traj.y, traj.phi, dt, currentGamma);
          
          // Check for Poincaré section crossing (phi crosses 0)
          if (currentGamma > 0 && oldPhi > Math.PI && newState.phi < Math.PI) {
            poincareRef.current.push({ 
              x: newState.x, 
              y: newState.y,
              color: traj.color 
            });
            if (poincareRef.current.length > maxPoincare) {
              poincareRef.current.shift();
            }
          }
          
          const newPoints = [...traj.points, { x: newState.x, y: newState.y, phi: newState.phi }];
          if (newPoints.length > maxPoints) {
            newPoints.shift();
          }
          
          return {
            ...traj,
            x: newState.x,
            y: newState.y,
            phi: newState.phi,
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
      const padding = 15;
      
      // PANEL 1: Phase Portrait (Top Left)
      ctx.save();
      ctx.translate(0, 0);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('Phase Portrait (x vs y=dx/dt)', padding + 10, padding + 20);
      
      const scale1 = Math.min(panelWidth, panelHeight) / 5;
      const centerX1 = panelWidth / 2;
      const centerY1 = panelHeight / 2;
      
      // Draw potential wells (fixed points)
      const xPlus = Math.sqrt(Math.abs(alpha) / beta);
      const xMinus = -xPlus;
      
      ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(centerX1 + xPlus * scale1, centerY1, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX1 + xMinus * scale1, centerY1, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
      ctx.beginPath();
      ctx.arc(centerX1, centerY1, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
      ctx.font = '11px monospace';
      ctx.fillText('x₊', centerX1 + xPlus * scale1 + 12, centerY1 + 5);
      ctx.fillText('x₋', centerX1 + xMinus * scale1 - 25, centerY1 + 5);
      
      ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
      ctx.fillText('x₀', centerX1 + 10, centerY1 - 10);
      
      // Draw trajectories
      trajectoriesRef.current.forEach(traj => {
        if (traj.points.length < 2) return;
        
        ctx.strokeStyle = traj.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < traj.points.length; i++) {
          const px = centerX1 + traj.points[i].x * scale1;
          const py = centerY1 - traj.points[i].y * scale1;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        const px = centerX1 + traj.x * scale1;
        const py = centerY1 - traj.y * scale1;
        ctx.fillStyle = traj.color;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      ctx.restore();
      
      // PANEL 2: Potential Energy (Top Right)
      ctx.save();
      ctx.translate(panelWidth, 0);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('Potential: U(x) = αx²/2 + βx⁴/4', padding + 10, padding + 20);
      
      const graphWidth = panelWidth - 4*padding;
      const graphHeight = panelHeight - 5*padding;
      const graphX = padding * 2;
      const graphY = padding * 2.5;
      
      const scaleX = graphWidth / 4;
      const scaleU = graphHeight / 2;
      
      // Draw potential curve
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px < graphWidth; px++) {
        const x = (px - graphWidth/2) / scaleX;
        const U = (alpha * x * x / 2) + (beta * x * x * x * x / 4);
        const py = graphY + scaleU - U * scaleU * 2;
        if (px === 0) ctx.moveTo(graphX + px, py);
        else ctx.lineTo(graphX + px, py);
      }
      ctx.stroke();
      
      // Mark minima
      ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
      const xPlusU = xPlus * scaleX;
      const UMin = (alpha * xPlus * xPlus / 2) + (beta * xPlus * xPlus * xPlus * xPlus / 4);
      const pyMin = graphY + scaleU - UMin * scaleU * 2;
      ctx.beginPath();
      ctx.arc(graphX + graphWidth/2 + xPlusU, pyMin, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(graphX + graphWidth/2 - xPlusU, pyMin, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Mark current positions
      trajectoriesRef.current.forEach(traj => {
        const px = graphX + graphWidth/2 + traj.x * scaleX;
        const U = (alpha * traj.x * traj.x / 2) + (beta * traj.x * traj.x * traj.x * traj.x / 4);
        const py = graphY + scaleU - U * scaleU * 2;
        
        ctx.fillStyle = traj.color;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
      ctx.font = '11px monospace';
      ctx.fillText('Double-well: two stable', graphX, graphY + graphHeight + 20);
      ctx.fillText('states separated by barrier', graphX, graphY + graphHeight + 33);
      
      ctx.restore();
      
      // PANEL 3: Time Series (Bottom Left)
      ctx.save();
      ctx.translate(0, panelHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('Time Series: x(t)', padding + 10, padding + 20);
      
      const graphWidth3 = panelWidth - 4*padding;
      const graphHeight3 = panelHeight - 5*padding;
      const graphX3 = padding * 2;
      const graphY3 = padding * 2.5;
      const centerY3 = graphY3 + graphHeight3 / 2;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(graphX3, centerY3);
      ctx.lineTo(graphX3 + graphWidth3, centerY3);
      ctx.stroke();
      
      trajectoriesRef.current.forEach(traj => {
        if (traj.points.length < 2) return;
        
        ctx.strokeStyle = traj.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < traj.points.length; i++) {
          const px = graphX3 + (i / maxPoints) * graphWidth3;
          const py = centerY3 - traj.points[i].x * (graphHeight3 / 5);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });
      
      let behaviorText = '';
      if (mode === 'unforced') behaviorText = 'No forcing: Settles to stable well';
      else if (mode === 'weak') behaviorText = 'Weak forcing: Periodic motion';
      else if (mode === 'moderate') behaviorText = 'Moderate: Complex periodic';
      else if (mode === 'chaos') behaviorText = 'Strong forcing: Chaotic!';
      
      ctx.fillStyle = 'rgba(200, 200, 200, 0.9)';
      ctx.font = '12px monospace';
      ctx.fillText(behaviorText, graphX3, graphY3 + graphHeight3 + 20);
      
      ctx.restore();
      
      // PANEL 4: Poincaré Section (Bottom Right)
      ctx.save();
      ctx.translate(panelWidth, panelHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('Poincaré Section (stroboscopic)', padding + 10, padding + 20);
      
      const scale4 = Math.min(panelWidth, panelHeight) / 5;
      const centerX4 = panelWidth / 2;
      const centerY4 = panelHeight / 2;
      
      // Draw axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX4, padding);
      ctx.lineTo(centerX4, panelHeight - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, centerY4);
      ctx.lineTo(panelWidth - padding, centerY4);
      ctx.stroke();
      
      // Plot Poincaré points
      poincareRef.current.forEach(point => {
        const px = centerX4 + point.x * scale4;
        const py = centerY4 - point.y * scale4;
        
        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      let poincareText = '';
      if (mode === 'unforced') poincareText = 'No forcing → no section';
      else if (mode === 'weak') poincareText = 'Fixed point → periodic orbit';
      else if (mode === 'moderate') poincareText = 'Few points → complex periodic';
      else if (mode === 'chaos') poincareText = 'Fractal structure → CHAOS!';
      
      ctx.fillStyle = 'rgba(200, 200, 200, 0.9)';
      ctx.font = '11px monospace';
      ctx.fillText(poincareText, padding * 2, panelHeight - padding - 10);
      ctx.fillText(`Points: ${poincareRef.current.length}`, padding * 2, panelHeight - padding + 5);
      
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
  }, [isPlaying, mode, gamma]);
  
  return (
    <div className="w-full h-screen bg-gray-950 flex flex-col overflow-hidden">
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" />
        
        <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-90 p-3 rounded-lg text-white max-w-xs">
          <h2 className="text-base font-bold mb-1">Duffing Oscillator</h2>
          <div className="space-y-0 text-xs font-mono">
            <div>ẍ + δẋ + αx + βx³ = γcos(ωt)</div>
          </div>
          <div className="mt-2 space-y-0 text-xs">
            <div>δ={delta} α={alpha} β={beta} ω={omega}</div>
            <div>γ = {mode === 'custom' ? gamma.toFixed(2) : mode === 'unforced' ? '0.00' : mode === 'weak' ? '0.30' : mode === 'moderate' ? '0.37' : '0.50'}</div>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-90 p-3 rounded-lg text-white">
          <h3 className="text-sm font-bold mb-2">Forcing Strength</h3>
          <div className="space-y-1">
            <button
              onClick={() => setMode('unforced')}
              className={`w-full text-left px-2 py-1 text-xs rounded ${mode === 'unforced' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              None (γ=0) - Limit Cycle
            </button>
            <button
              onClick={() => setMode('weak')}
              className={`w-full text-left px-2 py-1 text-xs rounded ${mode === 'weak' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Weak (γ=0.3) - Periodic
            </button>
            <button
              onClick={() => setMode('moderate')}
              className={`w-full text-left px-2 py-1 text-xs rounded ${mode === 'moderate' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Moderate (γ=0.37) - Complex
            </button>
            <button
              onClick={() => setMode('chaos')}
              className={`w-full text-left px-2 py-1 text-xs rounded ${mode === 'chaos' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Strong (γ=0.5) - CHAOS
            </button>
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
        </div>
      </div>
    </div>
  );
};

export default DuffingEvolution;