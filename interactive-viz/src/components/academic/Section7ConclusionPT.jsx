import React, { useEffect, useRef } from 'react';
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

const Section7ConclusionPT = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">§7 Conclusão e Referências</h2>
      
      {/* Summary Table */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">7.1 Resumo dos Sistemas Dinâmicos</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 text-blue-400">Sistema</th>
                <th className="text-left py-3 px-4 text-blue-400">Dimensão</th>
                <th className="text-left py-3 px-4 text-blue-400">Comportamento Principal</th>
                <th className="text-left py-3 px-4 text-blue-400">Tipo de Atrator</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-700">
                <td className="py-3 px-4 font-semibold text-yellow-400">Van der Pol</td>
                <td className="py-3 px-4">2D (contínuo)</td>
                <td className="py-3 px-4">Oscilação auto-sustentada</td>
                <td className="py-3 px-4">Ciclo limite</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="py-3 px-4 font-semibold text-red-400">Lorenz</td>
                <td className="py-3 px-4">3D (contínuo)</td>
                <td className="py-3 px-4">Efeito borboleta, caos</td>
                <td className="py-3 px-4">Atrator estranho</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="py-3 px-4 font-semibold text-green-400">Mapa Logístico</td>
                <td className="py-3 px-4">1D (discreto)</td>
                <td className="py-3 px-4">Cascata de duplicação de período</td>
                <td className="py-3 px-4">Caótico (r &gt; 3.57)</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="py-3 px-4 font-semibold text-purple-400">Duffing</td>
                <td className="py-3 px-4">2D + forçamento</td>
                <td className="py-3 px-4">Biestabilidade, histerese</td>
                <td className="py-3 px-4">Atrator estranho</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-cyan-400">Mapa de Hénon</td>
                <td className="py-3 px-4">2D (discreto)</td>
                <td className="py-3 px-4">Modelo de dinâmica de feixe CERN</td>
                <td className="py-3 px-4">Atrator estranho</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Key Equations Cheat Sheet */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-green-400 mb-4">7.2 Resumo de Equações Principais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Van der Pol */}
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-yellow-400 font-semibold mb-2">Oscilador de Van der Pol</p>
            <Eq display>{'\\ddot{x} - \\mu(1-x^2)\\dot{x} + x = 0'}</Eq>
            <p className="text-slate-400 text-sm mt-2">
              μ &gt; 0: ciclo limite | μ = 0: oscilador harmônico
            </p>
          </div>
          
          {/* Lorenz */}
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-red-400 font-semibold mb-2">Sistema de Lorenz</p>
            <Eq display>{'\\dot{x} = \\sigma(y-x), \\; \\dot{y} = x(\\rho-z)-y, \\; \\dot{z} = xy-\\beta z'}</Eq>
            <p className="text-slate-400 text-sm mt-2">
              Clássico: σ=10, ρ=28, β=8/3
            </p>
          </div>
          
          {/* Logistic */}
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-green-400 font-semibold mb-2">Mapa Logístico</p>
            <Eq display>{'x_{n+1} = r \\cdot x_n(1-x_n)'}</Eq>
            <p className="text-slate-400 text-sm mt-2">
              Início do caos: r∞ ≈ 3.5699...
            </p>
          </div>
          
          {/* Jacobian */}
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-purple-400 font-semibold mb-2">Estabilidade (Jacobiano)</p>
            <Eq display>{'J = \\begin{pmatrix} \\partial f/\\partial x & \\partial f/\\partial y \\\\ \\partial g/\\partial x & \\partial g/\\partial y \\end{pmatrix}'}</Eq>
            <p className="text-slate-400 text-sm mt-2">
              Estável se Re(λ) &lt; 0 para todos os autovalores
            </p>
          </div>
          
          {/* Lyapunov */}
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-cyan-400 font-semibold mb-2">Expoente de Lyapunov</p>
            <Eq display>{'\\lambda = \\lim_{t \\to \\infty} \\frac{1}{t} \\ln\\frac{|\\delta(t)|}{|\\delta(0)|}'}</Eq>
            <p className="text-slate-400 text-sm mt-2">
              λ &gt; 0 ⟹ caos (dependência sensível)
            </p>
          </div>
          
          {/* Feigenbaum */}
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-orange-400 font-semibold mb-2">Constante de Feigenbaum</p>
            <Eq display>{'\\delta = \\lim_{n \\to \\infty} \\frac{r_n - r_{n-1}}{r_{n+1} - r_n} \\approx 4.669...'}</Eq>
            <p className="text-slate-400 text-sm mt-2">
              Universal para duplicação de período
            </p>
          </div>
        </div>
      </div>
      
      {/* Classification Flowchart */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">7.3 Classificação de Equilíbrios</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
            <p className="text-green-400 font-bold mb-2">Nó Estável</p>
            <p className="text-slate-300 text-sm">Tr(J) &lt; 0, Det(J) &gt; 0</p>
            <p className="text-slate-400 text-xs">Δ &gt; 0, λ real</p>
          </div>
          <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
            <p className="text-green-400 font-bold mb-2">Espiral Estável</p>
            <p className="text-slate-300 text-sm">Tr(J) &lt; 0, Det(J) &gt; 0</p>
            <p className="text-slate-400 text-xs">Δ &lt; 0, λ complexo</p>
          </div>
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
            <p className="text-blue-400 font-bold mb-2">Centro</p>
            <p className="text-slate-300 text-sm">Tr(J) = 0, Det(J) &gt; 0</p>
            <p className="text-slate-400 text-xs">λ imaginário puro</p>
          </div>
          <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
            <p className="text-red-400 font-bold mb-2">Nó Instável</p>
            <p className="text-slate-300 text-sm">Tr(J) &gt; 0, Det(J) &gt; 0</p>
            <p className="text-slate-400 text-xs">Δ &gt; 0, λ real</p>
          </div>
          <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
            <p className="text-red-400 font-bold mb-2">Espiral Instável</p>
            <p className="text-slate-300 text-sm">Tr(J) &gt; 0, Det(J) &gt; 0</p>
            <p className="text-slate-400 text-xs">Δ &lt; 0, λ complexo</p>
          </div>
          <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-400 font-bold mb-2">Ponto de Sela</p>
            <p className="text-slate-300 text-sm">Det(J) &lt; 0</p>
            <p className="text-slate-400 text-xs">λ real, sinais opostos</p>
          </div>
        </div>
      </div>
      
      {/* Key Theorems */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-yellow-400 mb-4">7.4 Teoremas Fundamentais</h3>
        
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-blue-400 font-semibold mb-1">Teorema de Poincaré-Bendixson</p>
            <p className="text-slate-300 text-sm">
              Em sistemas autônomos 2D, trajetórias limitadas devem convergir para um ponto fixo, 
              ciclo limite, ou órbita heteroclínica/homoclínica. <em>Caos é impossível em 2D!</em>
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-green-500">
            <p className="text-green-400 font-semibold mb-1">Teorema de Liouville</p>
            <p className="text-slate-300 text-sm">
              Sistemas Hamiltonianos preservam volume no espaço de fase. É por isso que o CERN usa 
              integradores simpléticos e mapas simpléticos.
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-red-500">
            <p className="text-red-400 font-semibold mb-1">Teorema de Li-Yorke</p>
            <p className="text-slate-300 text-sm">
              "Período 3 implica caos" — se um mapa 1D tem uma órbita de período-3, ele tem órbitas de 
              todos os períodos e incontáveis órbitas caóticas.
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-purple-500">
            <p className="text-purple-400 font-semibold mb-1">Teorema de Embedding de Takens</p>
            <p className="text-slate-300 text-sm">
              Um atrator estranho pode ser reconstruído a partir de uma única série temporal usando 
              coordenadas de atraso. Isso permite análise experimental de caos.
            </p>
          </div>
        </div>
      </div>
      
      {/* References */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">7.5 Referências e Leitura Adicional</h3>
        
        <div className="space-y-3 text-slate-300">
          <div className="flex gap-4">
            <span className="text-blue-400 font-mono">[1]</span>
            <p>
              Strogatz, S. H. (2015). <em>Nonlinear Dynamics and Chaos</em>. 
              Westview Press. — O livro-texto clássico para este campo.
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="text-blue-400 font-mono">[2]</span>
            <p>
              Lorenz, E. N. (1963). "Deterministic Nonperiodic Flow." 
              <em>Journal of the Atmospheric Sciences</em>, 20(2), 130-141.
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="text-blue-400 font-mono">[3]</span>
            <p>
              Ott, E., Grebogi, C., & Yorke, J. A. (1990). "Controlling Chaos." 
              <em>Physical Review Letters</em>, 64(11), 1196.
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="text-blue-400 font-mono">[4]</span>
            <p>
              Feigenbaum, M. J. (1978). "Quantitative Universality for a Class of 
              Nonlinear Transformations." <em>Journal of Statistical Physics</em>, 19(1), 25-52.
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="text-blue-400 font-mono">[5]</span>
            <p>
              Wiedemann, H. (2015). <em>Particle Accelerator Physics</em>. 
              Springer. — Para dinâmica de feixe e controle de caos no CERN.
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="text-blue-400 font-mono">[6]</span>
            <p>
              Li, T. Y., & Yorke, J. A. (1975). "Period Three Implies Chaos." 
              <em>The American Mathematical Monthly</em>, 82(10), 985-992.
            </p>
          </div>
        </div>
      </div>
      
      {/* Final Quote */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-8 border border-purple-500/30 text-center">
        <p className="text-2xl text-slate-200 italic mb-4">
          "Caos: Quando o presente determina o futuro, mas o presente aproximado 
          não determina aproximadamente o futuro."
        </p>
        <p className="text-slate-400">— Edward Lorenz</p>
      </div>
      
      {/* Footer */}
      <div className="text-center text-slate-500 text-sm py-8">
        <p>Criado com React, Canvas API e KaTeX</p>
        <p className="mt-1">
          Projeto de Visualização de Sistemas Dinâmicos • 2024
        </p>
      </div>
    </div>
  );
};

export default Section7ConclusionPT;
