import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';

const CERNChaosControl = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  
  const [tuneQx, setTuneQx] = useState(0.31);
  const [tuneQy, setTuneQy] = useState(0.32);
  const [octupoleStrength, setOctupoleStrength] = useState(0.5);
  const [sextupoleError, setSextupoleError] = useState(0.3);
  
  const particlesRef = useRef([]);
  const timeRef = useRef(0);
  const numParticles = 40;
  
  const initParticles = () => {
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const gaussX = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const gaussY = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
      particles.push({
        x: gaussX * 0.8, px: gaussX * 0.15,
        y: gaussY * 0.8, py: gaussY * 0.15,
        trail: [], lost: false
      });
    }
    return particles;
  };
  
  useEffect(() => { particlesRef.current = initParticles(); }, []);
  
  const reset = () => {
    timeRef.current = 0;
    particlesRef.current = initParticles();
  };
  
  const betatronStep = (x, px, y, py, dt) => {
    const omegaX = 2 * Math.PI * tuneQx;
    const omegaY = 2 * Math.PI * tuneQy;
    const phiX = omegaX * dt;
    const phiY = omegaY * dt;
    
    let newX = x * Math.cos(phiX) + px * Math.sin(phiX);
    let newPx = -x * Math.sin(phiX) + px * Math.cos(phiX);
    let newY = y * Math.cos(phiY) + py * Math.sin(phiY);
    let newPy = -y * Math.sin(phiY) + py * Math.cos(phiY);
    
    const sextKick = sextupoleError * 0.08;
    newPx += sextKick * (newX * newX - newY * newY);
    newPy -= sextKick * 2 * newX * newY;
    
    if (octupoleStrength > 0) {
      const r2 = newX * newX + newY * newY;
      const octKick = octupoleStrength * 0.03;
      newPx -= octKick * newX * r2;
      newPy -= octKick * newY * r2;
    }
    
    return { x: newX, px: newPx, y: newY, py: newPy };
  };
  
  const checkLost = (x, y) => Math.sqrt(x*x + y*y) > 5.0;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const updateSize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    
    const ctx = canvas.getContext('2d');
    
    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      if (isPlaying) {
        timeRef.current += 0.01;
        particlesRef.current = particlesRef.current.map(p => {
          if (p.lost) return p;
          const newState = betatronStep(p.x, p.px, p.y, p.py, 0.01);
          const newTrail = [...p.trail, { x: newState.x, y: newState.y }];
          if (newTrail.length > 150) newTrail.shift();
          return { ...p, ...newState, trail: newTrail, lost: checkLost(newState.x, newState.y) };
        });
      }
      
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#050510');
      bgGrad.addColorStop(1, '#0a0a15');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
      
      const panelWidth = width / 2;
      const panelHeight = height / 2;
      const padding = 25;
      
      // Panel 1: Beam Cross-Section
      ctx.save();
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('Beam Cross-Section (x-y plane)', padding + 10, padding + 20);
      ctx.fillStyle = 'rgba(150, 200, 255, 0.7)';
      ctx.font = '11px monospace';
      ctx.fillText('Blue dots = protons, Red circle = beam pipe', padding + 10, padding + 36);
      
      const centerX = panelWidth / 2;
      const centerY = panelHeight / 2 + 15;
      const scale = Math.min(panelWidth, panelHeight) / 14;
      
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5 * scale, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 100, 100, 0.1)';
      ctx.fill();
      
      const alive = particlesRef.current.filter(p => !p.lost).length;
      
      particlesRef.current.forEach(p => {
        if (p.lost) return;
        if (p.trail.length > 1) {
          for (let i = 1; i < p.trail.length; i++) {
            const alpha = 0.1 + 0.4 * (i / p.trail.length);
            ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX + p.trail[i-1].x * scale, centerY - p.trail[i-1].y * scale);
            ctx.lineTo(centerX + p.trail[i].x * scale, centerY - p.trail[i].y * scale);
            ctx.stroke();
          }
        }
        const px = centerX + p.x * scale;
        const py = centerY - p.y * scale;
        ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      const survival = (alive / numParticles) * 100;
      ctx.fillStyle = survival > 90 ? 'rgba(100, 255, 150, 0.9)' : 
                      survival > 50 ? 'rgba(255, 200, 100, 0.9)' : 'rgba(255, 100, 100, 0.9)';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`Beam Survival: ${survival.toFixed(1)}%`, padding + 10, panelHeight - padding - 10);
      ctx.restore();
      
      // Panel 2: Phase Space
      ctx.save();
      ctx.translate(panelWidth, 0);
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('Phase Space (x vs momentum)', padding + 10, padding + 20);
      ctx.fillStyle = 'rgba(150, 200, 255, 0.7)';
      ctx.font = '11px monospace';
      ctx.fillText('Ellipse = stable | Distorted = chaotic', padding + 10, padding + 36);
      
      const psCenterX = panelWidth / 2;
      const psCenterY = panelHeight / 2 + 15;
      
      ctx.strokeStyle = 'rgba(100, 255, 150, 0.3)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.ellipse(psCenterX, psCenterY, 3 * scale, 1.5 * scale, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
      
      particlesRef.current.forEach(p => {
        if (p.lost) return;
        const px = psCenterX + p.x * scale;
        const py = psCenterY - p.px * scale * 5;
        const amp = Math.sqrt(p.x*p.x + p.px*p.px);
        const danger = Math.min(amp / 3, 1);
        ctx.fillStyle = `rgba(${100 + 155*danger}, ${255 - 155*danger}, ${255 - 100*danger}, 0.8)`;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
      ctx.restore();
      
      // Panel 3: The Mathematics
      ctx.save();
      ctx.translate(0, panelHeight);
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px monospace';
      ctx.fillText("The Mathematics: Hill's Equation", padding + 10, padding + 20);
      
      const eduY = padding + 50;
      const lineH = 22;
      
      ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('Core Equation (Linear ODE):', padding + 10, eduY);
      
      ctx.fillStyle = 'rgba(200, 230, 255, 0.9)';
      ctx.font = '13px monospace';
      ctx.fillText('d²x/ds² + K(s)·x = 0', padding + 30, eduY + lineH);
      
      ctx.fillStyle = 'rgba(170, 170, 170, 0.9)';
      ctx.font = '11px monospace';
      ctx.fillText('x = distance from ideal orbit', padding + 30, eduY + 2*lineH);
      ctx.fillText('K(s) = focusing strength from magnets', padding + 30, eduY + 2.7*lineH);
      ctx.fillText('Solution: oscillation with "tune" Q', padding + 30, eduY + 3.4*lineH);
      
      ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('⚠ Problem: Nonlinear terms → CHAOS', padding + 10, eduY + 4.8*lineH);
      
      ctx.fillStyle = 'rgba(170, 170, 170, 0.9)';
      ctx.font = '11px monospace';
      ctx.fillText('Sextupoles add x² terms (needed but dangerous)', padding + 30, eduY + 5.8*lineH);
      
      ctx.fillStyle = 'rgba(100, 255, 150, 0.9)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('✓ Solution: Octupole Correctors', padding + 10, eduY + 7*lineH);
      
      ctx.fillStyle = 'rgba(170, 170, 170, 0.9)';
      ctx.font = '11px monospace';
      ctx.fillText('Add controlled x³ terms that SPREAD the tune', padding + 30, eduY + 8*lineH);
      ctx.fillText('Spread prevents collective resonance!', padding + 30, eduY + 8.7*lineH);
      ctx.restore();
      
      // Panel 4: Tune Diagram
      ctx.save();
      ctx.translate(panelWidth, panelHeight);
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
      ctx.strokeRect(padding, padding, panelWidth - 2*padding, panelHeight - 2*padding);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('Tune Diagram (Resonance Map)', padding + 10, padding + 20);
      ctx.fillStyle = 'rgba(150, 200, 255, 0.7)';
      ctx.font = '11px monospace';
      ctx.fillText('Red lines = resonances = CHAOS', padding + 10, padding + 36);
      
      const tuneX = padding + 30;
      const tuneY = padding + 55;
      const tuneW = panelWidth - 4 * padding - 20;
      const tuneH = panelHeight - 3 * padding - 70;
      
      ctx.fillStyle = 'rgba(20, 30, 50, 0.8)';
      ctx.fillRect(tuneX, tuneY, tuneW, tuneH);
      
      ctx.strokeStyle = 'rgba(255, 80, 80, 0.4)';
      ctx.lineWidth = 1;
      for (let p = 0; p <= 2; p++) {
        for (let m = -3; m <= 3; m++) {
          for (let n = -3; n <= 3; n++) {
            if (m === 0 && n === 0) continue;
            if (Math.abs(m) + Math.abs(n) > 4) continue;
            if (n !== 0) {
              ctx.beginPath();
              for (let qx = 0.2; qx <= 0.5; qx += 0.01) {
                const qy = (p - m * qx) / n;
                if (qy >= 0.2 && qy <= 0.5) {
                  const px = tuneX + (qx - 0.2) / 0.3 * tuneW;
                  const py = tuneY + tuneH - (qy - 0.2) / 0.3 * tuneH;
                  if (qx === 0.2) ctx.moveTo(px, py);
                  else ctx.lineTo(px, py);
                }
              }
              ctx.stroke();
            }
          }
        }
      }
      
      const opX = tuneX + (tuneQx - 0.2) / 0.3 * tuneW;
      const opY = tuneY + tuneH - (tuneQy - 0.2) / 0.3 * tuneH;
      
      if (octupoleStrength > 0) {
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(opX, opY, octupoleStrength * 25, octupoleStrength * 15, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      ctx.beginPath();
      ctx.arc(opX, opY, 12, 0, 2 * Math.PI);
      const glow = ctx.createRadialGradient(opX, opY, 0, opX, opY, 12);
      glow.addColorStop(0, 'rgba(100, 255, 150, 0.8)');
      glow.addColorStop(1, 'rgba(100, 255, 150, 0)');
      ctx.fillStyle = glow;
      ctx.fill();
      
      ctx.fillStyle = 'rgba(100, 255, 150, 0.9)';
      ctx.beginPath();
      ctx.arc(opX, opY, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
      ctx.font = '10px monospace';
      ctx.fillText('Qx', tuneX + tuneW - 15, tuneY + tuneH + 12);
      ctx.fillText('Qy', tuneX - 18, tuneY + 10);
      
      ctx.fillStyle = 'rgba(100, 255, 150, 0.9)';
      ctx.font = '11px monospace';
      ctx.fillText(`Operating Point: Qx=${tuneQx.toFixed(3)}, Qy=${tuneQy.toFixed(3)}`, tuneX, tuneY + tuneH + 28);
      ctx.restore();
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', updateSize);
    };
  }, [isPlaying, tuneQx, tuneQy, octupoleStrength, sextupoleError]);
  
  const tutorialSteps = [
    { title: "Welcome to CERN Beam Dynamics!", 
      content: "At the Large Hadron Collider, billions of protons travel at 99.9999% the speed of light in a 27 km ring. Keeping them on track requires precise mathematical control using differential equations.", 
      icon: <Zap className="text-yellow-400" /> },
    { title: "The Problem: Chaos in Particle Motion", 
      content: "Particles don't travel in perfect circles - they oscillate around the ideal orbit (betatron oscillations). Nonlinear magnetic fields can make these oscillations CHAOTIC, causing particles to hit the beam pipe walls.", 
      icon: <AlertTriangle className="text-red-400" /> },
    { title: "The Math: Hill's Equation", 
      content: "Physicists model particle motion with d²x/ds² + K(s)·x = 0. The 'tune' Q (oscillation frequency) must avoid resonances - simple fractions like 1/3, 1/4, 2/5 where chaos occurs!", 
      icon: <BookOpen className="text-blue-400" /> },
    { title: "The Solution: Octupole Magnets", 
      content: "Paradoxically, adding controlled nonlinearity (octupoles) PREVENTS chaos! They create a 'tune spread' - each particle has a slightly different tune based on its amplitude, so they can't collectively resonate.", 
      icon: <CheckCircle className="text-green-400" /> }
  ];
  
  return (
    <div className="w-full h-[calc(100vh-3.5rem)] bg-gray-950 flex flex-col">
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" />
        
        {showTutorial && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg mx-4">
              <div className="flex items-center gap-3 mb-4">
                {tutorialSteps[tutorialStep].icon}
                <h3 className="text-xl font-bold text-white">{tutorialSteps[tutorialStep].title}</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">{tutorialSteps[tutorialStep].content}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {tutorialSteps.map((_, idx) => (
                    <div key={idx} className={`w-2 h-2 rounded-full ${idx === tutorialStep ? 'bg-blue-500' : 'bg-gray-600'}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  {tutorialStep > 0 && (
                    <button onClick={() => setTutorialStep(tutorialStep - 1)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Back</button>
                  )}
                  {tutorialStep < tutorialSteps.length - 1 ? (
                    <button onClick={() => setTutorialStep(tutorialStep + 1)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Next</button>
                  ) : (
                    <button onClick={() => setShowTutorial(false)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Start Exploring!</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur p-4 rounded-xl border border-gray-700 text-white max-w-xs">
          <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
            <Zap size={18} className="text-yellow-400" />
            CERN Beam Control
          </h3>
          <p className="text-xs text-gray-400 mb-3">Particle Accelerator Physics</p>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs flex justify-between mb-1">
                <span>Horizontal Tune (Qx)</span>
                <span className="text-blue-400">{tuneQx.toFixed(3)}</span>
              </label>
              <input type="range" min="0.2" max="0.45" step="0.005" value={tuneQx}
                onChange={(e) => setTuneQx(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
            
            <div>
              <label className="text-xs flex justify-between mb-1">
                <span>Vertical Tune (Qy)</span>
                <span className="text-blue-400">{tuneQy.toFixed(3)}</span>
              </label>
              <input type="range" min="0.2" max="0.45" step="0.005" value={tuneQy}
                onChange={(e) => setTuneQy(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              <p className="text-xs text-gray-500 mt-1">Move near red lines = resonance!</p>
            </div>
            
            <div>
              <label className="text-xs flex justify-between mb-1">
                <span>Octupole Strength</span>
                <span className="text-green-400">{octupoleStrength.toFixed(2)}</span>
              </label>
              <input type="range" min="0" max="2" step="0.1" value={octupoleStrength}
                onChange={(e) => setOctupoleStrength(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
              <p className="text-xs text-gray-500 mt-1">Higher = more tune spread (protection)</p>
            </div>
            
            <div>
              <label className="text-xs flex justify-between mb-1">
                <span>Sextupole Error</span>
                <span className="text-orange-400">{sextupoleError.toFixed(2)}</span>
              </label>
              <input type="range" min="0" max="1" step="0.05" value={sextupoleError}
                onChange={(e) => setSextupoleError(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
              <p className="text-xs text-gray-500 mt-1">Unavoidable nonlinearity (chaos source)</p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button onClick={() => setIsPlaying(!isPlaying)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all shadow-lg">
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button onClick={reset}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl transition-all shadow-lg">
            <RotateCcw size={22} />
          </button>
          <button onClick={() => { setTutorialStep(0); setShowTutorial(true); }}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-all shadow-lg">
            <BookOpen size={22} />
          </button>
        </div>
        
        <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur px-4 py-2 rounded-xl border border-gray-700">
          <div className="text-xs font-mono text-gray-400">Turns: {Math.floor(timeRef.current * 100)}</div>
        </div>
      </div>
    </div>
  );
};

export default CERNChaosControl;
