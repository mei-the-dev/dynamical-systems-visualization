import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Helper component for inline math
const M = ({ children }) => (
  <span
    dangerouslySetInnerHTML={{
      __html: katex.renderToString(children, { throwOnError: false }),
    }}
  />
);

// Helper component for display math
const Eq = ({ children }) => (
  <div className="my-4 overflow-x-auto">
    <div
      className="text-center text-lg"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(children, { throwOnError: false, displayMode: true }),
      }}
    />
  </div>
);

const Section1Intro = () => {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold mb-6 text-blue-400 border-b border-gray-800 pb-4">
        1. Introduction: What Are Dynamical Systems?
      </h2>

      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-gray-300 leading-relaxed mb-6">
          A <strong>dynamical system</strong> is a mathematical framework for describing how a point 
          in a geometric space evolves over time. The state of the system at any moment is a point 
          in <strong>phase space</strong>, and the rules governing its evolution are given by 
          differential equations (continuous time) or iterated maps (discrete time).
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-purple-400">Key Question</h3>
          <p className="text-gray-300 text-lg italic">
            What happens to a system over long periods of time?
          </p>
          <p className="text-gray-400 mt-2">
            The answer leads us to <strong>attractors</strong> — the geometric structures toward 
            which dynamical systems evolve.
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">1.1 Types of Attractors</h3>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Fixed Point */}
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-5 border border-blue-700/50">
            <div className="text-4xl mb-3">⚫</div>
            <h4 className="font-bold text-blue-300 mb-2">Fixed Point</h4>
            <p className="text-sm text-gray-400 mb-3">
              A single point where the system comes to rest. All nearby trajectories converge to it.
            </p>
            <div className="bg-black/30 rounded-lg p-3">
              <Eq>{"\\dot{\\mathbf{x}} = 0"}</Eq>
            </div>
            <p className="text-xs text-gray-500 mt-2">Example: Damped pendulum at rest</p>
          </div>

          {/* Limit Cycle */}
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-5 border border-green-700/50">
            <div className="text-4xl mb-3">🔄</div>
            <h4 className="font-bold text-green-300 mb-2">Limit Cycle</h4>
            <p className="text-sm text-gray-400 mb-3">
              A closed periodic orbit. The system oscillates indefinitely with fixed amplitude.
            </p>
            <div className="bg-black/30 rounded-lg p-3">
              <Eq>{"\\mathbf{x}(t + T) = \\mathbf{x}(t)"}</Eq>
            </div>
            <p className="text-xs text-gray-500 mt-2">Example: Heartbeat, Van der Pol</p>
          </div>

          {/* Strange Attractor */}
          <div className="bg-gradient-to-br from-red-900/50 to-orange-800/30 rounded-xl p-5 border border-red-700/50">
            <div className="text-4xl mb-3">🦋</div>
            <h4 className="font-bold text-red-300 mb-2">Strange Attractor</h4>
            <p className="text-sm text-gray-400 mb-3">
              Fractal structure with chaotic, aperiodic trajectories. Sensitive to initial conditions.
            </p>
            <div className="bg-black/30 rounded-lg p-3">
              <Eq>{"\\lambda_{\\max} > 0"}</Eq>
            </div>
            <p className="text-xs text-gray-500 mt-2">Example: Lorenz attractor</p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">1.2 The Lyapunov Exponent</h3>

        <p className="text-gray-300 mb-4">
          The <strong>Lyapunov exponent</strong> quantifies the rate at which nearby trajectories 
          diverge or converge. For a small initial separation <M>{"\\delta \\mathbf{x}_0"}</M>:
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <Eq>{"| \\delta \\mathbf{x}(t) | \\sim | \\delta \\mathbf{x}_0 | \\, e^{\\lambda t}"}</Eq>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-gray-300">Lyapunov Exponent</th>
                <th className="py-3 px-4 text-gray-300">Behavior</th>
                <th className="py-3 px-4 text-gray-300">Implication</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4"><M>{"\\lambda < 0"}</M></td>
                <td className="py-3 px-4">Trajectories converge</td>
                <td className="py-3 px-4 text-green-400">Stable (predictable)</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4"><M>{"\\lambda = 0"}</M></td>
                <td className="py-3 px-4">Trajectories parallel</td>
                <td className="py-3 px-4 text-yellow-400">Marginally stable</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><M>{"\\lambda > 0"}</M></td>
                <td className="py-3 px-4">Trajectories diverge</td>
                <td className="py-3 px-4 text-red-400">Chaotic (unpredictable)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-700/50">
          <h4 className="font-bold text-purple-300 mb-2">💡 Key Insight: Deterministic Chaos</h4>
          <p className="text-gray-300">
            Chaos does not mean randomness. Chaotic systems are <em>deterministic</em> — their 
            future is completely determined by their initial conditions. However, <strong>
            sensitive dependence on initial conditions</strong> means that tiny measurement 
            errors grow exponentially, making long-term prediction impossible in practice.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Section1Intro;
