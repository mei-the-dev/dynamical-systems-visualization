import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Eye, Sparkles, Plus, Trash2 } from 'lucide-react';

const LorenzDetailed = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sigma, setSigma] = useState(10);
  const [rho, setRho] = useState(28);
  const [beta, setBeta] = useState(8/3);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState('xz'); // 'xz', 'xy', 'yz', '3d'
  const [trailLength, setTrailLength] = useState(2000); // Longer trail for bigger time window
  const [showSecondTrajectory, setShowSecondTrajectory] = useState(false);
  const [perturbation, setPerturbation] = useState(1e-4); // Larger default perturbation for visible divergence
  const [simSpeed, setSimSpeed] = useState(3); // Simulation speed multiplier
  
  const trajectoriesRef = useRef([
    { x: 0.0, y: 1.0, z: 1.05, points: [], color: 'rgb(255, 80, 80)', label: 'Trajectory 1' }
  ]);
  
  const diffTrailRef = useRef([]); // Trail for the difference vector particle
  
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
    diffTrailRef.current = []; // Clear difference trail
    if (showSecondTrajectory) {
      trajectoriesRef.current = [
        { x: 0.0, y: 1.0, z: 1.05, points: [], color: 'rgb(255, 80, 80)', label: 'Trajectory 1' },
        { x: 0.0, y: 1.0, z: 1.05 + perturbation, points: [], color: 'rgb(80, 150, 255)', label: 'Trajectory 2' }
      ];
    } else {
      trajectoriesRef.current = [
        { x: 0.0, y: 1.0, z: 1.05, points: [], color: 'rgb(255, 80, 80)', label: 'Trajectory 1' }
      ];
    }
  };
  
  // Add or remove second trajectory
  const addSecondTrajectory = () => {
    const traj1 = trajectoriesRef.current[0];
    trajectoriesRef.current = [
      traj1,
      { 
        x: traj1.x, 
        y: traj1.y, 
        z: traj1.z + perturbation, 
        points: [{ x: traj1.x, y: traj1.y, z: traj1.z + perturbation }], 
        color: 'rgb(80, 150, 255)', 
        label: 'Trajectory 2 (perturbed)' 
      }
    ];
    setShowSecondTrajectory(true);
  };
  
  const removeSecondTrajectory = () => {
    trajectoriesRef.current = [trajectoriesRef.current[0]];
    setShowSecondTrajectory(false);
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
        // Run multiple integration steps per frame for faster simulation
        for (let step = 0; step < simSpeed; step++) {
          timeRef.current += 0.01;
          rotationRef.current += 0.003;
          
          trajectoriesRef.current = trajectoriesRef.current.map(traj => {
            const dt = 0.01; // Larger time step
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
          // Lower opacity for both trajectories so they're both visible when overlapping
          const baseAlpha = trajIdx === 0 ? 0.5 : 0.6; // Slightly different for visual distinction
          const alpha = 0.15 + baseAlpha * (i / traj.points.length);
          
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
          ctx.lineWidth = trajIdx === 0 ? 2 : 2.5; // Second trajectory slightly thicker
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
        
        // Glowing particle - larger for second trajectory
        const particleSize = trajIdx === 0 ? 8 : 10;
        const glowSize = trajIdx === 0 ? 14 : 18;
        const coreSize = trajIdx === 0 ? 4 : 6;
        const glowAlpha = trajIdx === 0 ? 0.4 : 0.5; // Lower opacity for visibility
        
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, particleSize, 0, 2 * Math.PI);
        const glow = ctx.createRadialGradient(currentPos.x, currentPos.y, 0, currentPos.x, currentPos.y, glowSize);
        glow.addColorStop(0, traj.color.replace('rgb', 'rgba').replace(')', `, ${glowAlpha + 0.3})`));
        glow.addColorStop(0.5, traj.color.replace('rgb', 'rgba').replace(')', `, ${glowAlpha})`));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fill();
        
        ctx.fillStyle = traj.color.replace('rgb', 'rgba').replace(')', ', 0.8)');
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, coreSize, 0, 2 * Math.PI);
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
      
      // Check if we have two trajectories to compare
      const hasTwoTrajectories = trajectoriesRef.current.length > 1 && 
                                  trajectoriesRef.current[1] && 
                                  trajectoriesRef.current[1].points;
      
      if (hasTwoTrajectories && trajectoriesRef.current[0].points.length > 1 && trajectoriesRef.current[1].points.length > 1) {
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
        ctx.fillText(`Initial Δz₀ = ${perturbation.toExponential(0)}`, graphX + 150, padding + 45);
      } else {
        // No second trajectory - show instruction
        ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Add a perturbed trajectory to see', panelWidth / 2, graphY + graphH / 2 - 20);
        ctx.fillText('the Butterfly Effect in action!', panelWidth / 2, graphY + graphH / 2 + 5);
        ctx.font = '12px monospace';
        ctx.fillStyle = 'rgba(100, 200, 100, 0.7)';
        ctx.fillText('Click "Show Parameters" → "Add Perturbed Trajectory"', panelWidth / 2, graphY + graphH / 2 + 40);
        ctx.textAlign = 'left';
      }
      
      ctx.restore();
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 3: Coordinate Timeline x(t), y(t), z(t) (Bottom Left)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(0, panelHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Coordinate Timeline x(t), y(t), z(t)', padding + 10, padding + 22);
      
      const traj1 = trajectoriesRef.current[0];
      const traj2 = showSecondTrajectory && trajectoriesRef.current.length > 1 ? trajectoriesRef.current[1] : null;
      
      const timelineX = padding * 2;
      const timelineY = padding + 45;
      const timelineW = panelWidth - 4 * padding;
      const timelineH = (panelHeight - 3 * padding - 70) / 3;
      
      // Colors for each coordinate
      const coordColors = {
        x: { traj1: 'rgba(255, 80, 80, 1)', traj2: 'rgba(255, 180, 180, 0.9)' },
        y: { traj1: 'rgba(80, 255, 80, 1)', traj2: 'rgba(180, 255, 180, 0.9)' },
        z: { traj1: 'rgba(80, 180, 255, 1)', traj2: 'rgba(180, 220, 255, 0.9)' }
      };
      const labels = ['x(t)', 'y(t)', 'z(t)'];
      const maxVals = [25, 30, 50]; // Approximate max values for each coordinate
      
      if (traj1.points.length > 1) {
        ['x', 'y', 'z'].forEach((coord, idx) => {
          const graphTop = timelineY + idx * (timelineH + 8);
          const graphCenterY = graphTop + timelineH / 2;
          
          // Background for this subplot
          ctx.fillStyle = 'rgba(30, 30, 40, 0.5)';
          ctx.fillRect(timelineX, graphTop, timelineW, timelineH);
          
          // Zero line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(timelineX, graphCenterY);
          ctx.lineTo(timelineX + timelineW, graphCenterY);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Trajectory 1 (solid, thick)
          ctx.strokeStyle = coordColors[coord].traj1;
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < traj1.points.length; i++) {
            const px = timelineX + (i / trailLength) * timelineW;
            const val = traj1.points[i][coord];
            const py = graphCenterY - (val / maxVals[idx]) * (timelineH / 2) * 0.85;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          
          // Trajectory 2 (if enabled) - different style
          if (traj2 && traj2.points.length > 1) {
            ctx.strokeStyle = coordColors[coord].traj2;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let i = 0; i < traj2.points.length; i++) {
              const px = timelineX + (i / trailLength) * timelineW;
              const val = traj2.points[i][coord];
              const py = graphCenterY - (val / maxVals[idx]) * (timelineH / 2) * 0.85;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
          
          // Label with current values
          ctx.font = '11px monospace';
          ctx.fillStyle = coordColors[coord].traj1;
          const val1 = traj1[coord].toFixed(1);
          if (traj2) {
            const val2 = traj2[coord].toFixed(1);
            const diff = Math.abs(traj1[coord] - traj2[coord]);
            ctx.fillText(`${labels[idx]}: ${val1}`, timelineX, graphTop - 3);
            ctx.fillStyle = coordColors[coord].traj2;
            ctx.fillText(`| ${val2}`, timelineX + 70, graphTop - 3);
            // Show difference with color intensity based on magnitude
            const diffColor = diff > 10 ? 'rgba(255, 100, 100, 1)' : diff > 1 ? 'rgba(255, 200, 100, 1)' : 'rgba(100, 255, 100, 0.8)';
            ctx.fillStyle = diffColor;
            ctx.fillText(`Δ=${diff.toFixed(1)}`, timelineX + 130, graphTop - 3);
          } else {
            ctx.fillText(`${labels[idx]} = ${val1}`, timelineX, graphTop - 3);
          }
          
          // Y-axis scale markers
          ctx.fillStyle = 'rgba(150, 150, 150, 0.4)';
          ctx.font = '8px monospace';
          ctx.fillText(`+${maxVals[idx]}`, timelineX - 22, graphTop + 8);
          ctx.fillText(`-${maxVals[idx]}`, timelineX - 22, graphTop + timelineH - 2);
        });
        
        // Legend
        if (traj2) {
          ctx.font = '10px monospace';
          ctx.fillStyle = 'rgba(255, 80, 80, 1)';
          ctx.fillText('━ Traj 1', timelineX + timelineW - 100, timelineY - 12);
          ctx.fillStyle = 'rgba(255, 180, 180, 0.9)';
          ctx.fillText('━ Traj 2', timelineX + timelineW - 45, timelineY - 12);
        }
        
        // Time axis label
        ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Time window: ${(trailLength * 0.01).toFixed(0)}s`, panelWidth / 2, panelHeight - padding - 5);
        ctx.textAlign = 'left';
      }
      
      ctx.restore();
      
      // ═══════════════════════════════════════════════════════════════════
      // PANEL 4: 3D Difference Vector Visualization (Bottom Right)
      // ═══════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(panelWidth, panelHeight);
      
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Difference Vector Δ(x,y,z)', padding + 10, padding + 22);
      
      const vecCenterX = panelWidth / 2;
      const vecCenterY = panelHeight / 2 + 20;
      const vecScale = Math.min(panelWidth, panelHeight) / 5;
      
      if (traj2 && traj1.points.length > 0 && traj2.points.length > 0) {
        const dx = traj1.x - traj2.x;
        const dy = traj1.y - traj2.y;
        const dz = traj1.z - traj2.z;
        const magnitude = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // Normalize and scale for display (log scale for visibility)
        const logMag = Math.log10(magnitude + 1e-10);
        const displayScale = Math.max(0.1, Math.min(1, (logMag + 8) / 10)); // -8 to +2 -> 0.1 to 1
        
        // Draw coordinate axes
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.4)';
        ctx.lineWidth = 1;
        // X axis
        ctx.beginPath();
        ctx.moveTo(vecCenterX - vecScale, vecCenterY);
        ctx.lineTo(vecCenterX + vecScale, vecCenterY);
        ctx.stroke();
        // Y axis (vertical in 2D projection)
        ctx.beginPath();
        ctx.moveTo(vecCenterX, vecCenterY - vecScale);
        ctx.lineTo(vecCenterX, vecCenterY + vecScale);
        ctx.stroke();
        // Z axis (diagonal)
        ctx.beginPath();
        ctx.moveTo(vecCenterX - vecScale * 0.5, vecCenterY + vecScale * 0.5);
        ctx.lineTo(vecCenterX + vecScale * 0.5, vecCenterY - vecScale * 0.5);
        ctx.stroke();
        
        // Axis labels
        ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
        ctx.font = '10px monospace';
        ctx.fillText('Δx', vecCenterX + vecScale + 5, vecCenterY + 4);
        ctx.fillText('Δy', vecCenterX + 5, vecCenterY - vecScale - 5);
        ctx.fillText('Δz', vecCenterX + vecScale * 0.5 + 5, vecCenterY - vecScale * 0.5 - 5);
        
        // Color based on magnitude (green -> yellow -> red)
        const hue = Math.max(0, 120 - (logMag + 6) * 20); // 120=green, 0=red
        const vecColor = `hsl(${hue}, 100%, 60%)`;
        
        // Project difference to 2D screen coords
        const projScale = vecScale * 1.2;
        const projX = dx + dz * 0.4;
        const projY = -dy - dz * 0.4;
        
        // Normalize for display (use log scaling for large values)
        const maxCoord = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz), 0.01);
        const normScale = maxCoord > 10 ? 10 / maxCoord : 1;
        const screenX = vecCenterX + projX * normScale * projScale / 10;
        const screenY = vecCenterY + projY * normScale * projScale / 10;
        
        // Add point to difference trail
        diffTrailRef.current.push({ x: screenX, y: screenY, mag: magnitude });
        const maxTrailLen = 500;
        if (diffTrailRef.current.length > maxTrailLen) {
          diffTrailRef.current = diffTrailRef.current.slice(-maxTrailLen);
        }
        
        // Draw trail with fading
        if (diffTrailRef.current.length > 1) {
          for (let i = 1; i < diffTrailRef.current.length; i++) {
            const alpha = i / diffTrailRef.current.length;
            const pt = diffTrailRef.current[i];
            const prevPt = diffTrailRef.current[i - 1];
            
            // Color gradient based on magnitude at each point
            const ptLogMag = Math.log10(pt.mag + 1e-10);
            const ptHue = Math.max(0, 120 - (ptLogMag + 6) * 20);
            
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${ptHue}, 100%, 60%, ${alpha * 0.8})`;
            ctx.lineWidth = 1 + alpha * 2;
            ctx.moveTo(prevPt.x, prevPt.y);
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();
          }
        }
        
        // Draw origin marker
        ctx.beginPath();
        ctx.arc(vecCenterX, vecCenterY, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.fill();
        
        // Draw current particle with glow
        ctx.shadowColor = vecColor;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 8, 0, Math.PI * 2);
        ctx.fillStyle = vecColor;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Inner bright core
        ctx.beginPath();
        ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Component values
        ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
        ctx.font = '11px monospace';
        ctx.fillText(`Δx = ${dx.toFixed(2)}`, padding + 15, panelHeight - padding - 45);
        ctx.fillStyle = 'rgba(100, 255, 100, 0.9)';
        ctx.fillText(`Δy = ${dy.toFixed(2)}`, padding + 15, panelHeight - padding - 30);
        ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
        ctx.fillText(`Δz = ${dz.toFixed(2)}`, padding + 15, panelHeight - padding - 15);
        
        // Magnitude with color
        ctx.fillStyle = vecColor;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`|Δ| = ${magnitude.toFixed(3)}`, panelWidth - padding - 15, panelHeight - padding - 25);
        ctx.textAlign = 'left';
        
        // Direction indicator (which way divergence is happening)
        const dominantAxis = Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > Math.abs(dz) ? 'x' :
                            Math.abs(dy) > Math.abs(dz) ? 'y' : 'z';
        ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.font = '10px monospace';
        ctx.fillText(`Dominant: ${dominantAxis}-direction`, padding + 15, padding + 42);
        
      } else {
        // No comparison
        ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Difference vector appears', panelWidth / 2, vecCenterY - 10);
        ctx.fillText('when comparing trajectories', panelWidth / 2, vecCenterY + 15);
        ctx.textAlign = 'left';
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
  }, [isPlaying, sigma, rho, beta, viewMode, trailLength, showSecondTrajectory, perturbation, simSpeed]);
  
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
                  min="500"
                  max="5000"
                  step="250"
                  value={trailLength}
                  onChange={(e) => setTrailLength(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              
              <div>
                <label className="text-xs flex justify-between mb-1">
                  <span>Simulation Speed</span>
                  <span className="text-green-400">{simSpeed}x</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={simSpeed}
                  onChange={(e) => setSimSpeed(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>
              
              {/* Perturbation Controls */}
              <div className="border-t border-gray-700 pt-3">
                <label className="text-xs font-semibold text-yellow-400 mb-2 block">
                  🦋 Butterfly Effect Demo
                </label>
                
                {!showSecondTrajectory ? (
                  <button
                    onClick={addSecondTrajectory}
                    className="w-full flex items-center justify-center gap-2 text-sm bg-green-600 hover:bg-green-500 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    Add Perturbed Trajectory
                  </button>
                ) : (
                  <button
                    onClick={removeSecondTrajectory}
                    className="w-full flex items-center justify-center gap-2 text-sm bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    Remove Second Trajectory
                  </button>
                )}
                
                <div className="mt-3">
                  <label className="text-xs flex justify-between mb-1">
                    <span>Perturbation Δz₀</span>
                    <span className="text-yellow-400">{perturbation.toExponential(0)}</span>
                  </label>
                  <input
                    type="range"
                    min="-12"
                    max="-1"
                    step="1"
                    value={Math.log10(perturbation)}
                    onChange={(e) => setPerturbation(Math.pow(10, parseInt(e.target.value)))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Smaller = more dramatic chaos demo
                  </div>
                </div>
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
