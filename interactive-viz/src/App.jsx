import React, { useState } from 'react';
import VanDerPolEnergy from './components/VanDerPolEnergy';
import LorenzDetailed from './components/LorenzDetailed';
import DuffingEvolution from './components/DuffingEvolution';
import CERNChaosControl from './components/CERNChaosControl';
import { Waves, Orbit, TrendingUp, Zap } from 'lucide-react';

function App() {
  const [activeViz, setActiveViz] = useState('vanderpol');

  const navItems = [
    { id: 'vanderpol', label: 'Van der Pol', icon: Waves, bg: '#2563eb' },
    { id: 'lorenz', label: 'Lorenz', icon: Orbit, bg: '#7c3aed' },
    { id: 'duffing', label: 'Duffing', icon: TrendingUp, bg: '#16a34a' },
    { id: 'cern', label: 'CERN Control', icon: Zap, bg: '#ca8a04' }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="text-2xl">🦋</span>
              <span className="hidden sm:inline">Dynamical Systems Explorer</span>
              <span className="sm:hidden">Chaos Lab</span>
            </h1>
            <div className="flex gap-1 sm:gap-2">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveViz(item.id)}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all text-sm"
                    style={{
                      backgroundColor: activeViz === item.id ? item.bg : '#1f2937',
                      color: activeViz === item.id ? 'white' : '#d1d5db'
                    }}
                  >
                    <Icon size={18} />
                    <span className="hidden md:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-14">
        {activeViz === 'vanderpol' && <VanDerPolEnergy />}
        {activeViz === 'lorenz' && <LorenzDetailed />}
        {activeViz === 'duffing' && <DuffingEvolution />}
        {activeViz === 'cern' && <CERNChaosControl />}
      </main>
    </div>
  );
}

export default App;
