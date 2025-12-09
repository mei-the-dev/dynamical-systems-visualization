import React from 'react';
import { M, Eq, BoxedEq } from './MathComponents';

const Section1IntroPT = () => {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold mb-6 text-blue-400 border-b border-gray-800 pb-4">
        1. Introdução: O Que São Sistemas Dinâmicos?
      </h2>

      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-gray-300 leading-relaxed mb-6">
          Um <strong>sistema dinâmico</strong> é uma estrutura matemática para descrever como um ponto
          em um espaço geométrico evolui ao longo do tempo. O estado do sistema em qualquer momento é um ponto
          no <strong>espaço de fase</strong>, e as regras que governam sua evolução são dadas por
          equações diferenciais (tempo contínuo) ou mapas iterados (tempo discreto).
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-purple-400">Pergunta Fundamental</h3>
          <p className="text-gray-300 text-lg italic">
            O que acontece com um sistema ao longo de períodos prolongados de tempo?
          </p>
          <p className="text-gray-400 mt-2">
            A resposta nos leva aos <strong>atratores</strong> — as estruturas geométricas para as quais
            os sistemas dinâmicos evoluem.
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">1.1 Tipos de Atratores</h3>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Ponto Fixo */}
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-5 border border-blue-700/50">
            <div className="text-4xl mb-3">⚫</div>
            <h4 className="font-bold text-blue-300 mb-2">Ponto Fixo</h4>
            <p className="text-sm text-gray-400 mb-3">
              Um único ponto onde o sistema chega ao repouso. Todas as trajetórias próximas convergem para ele.
            </p>
            <Eq small>{String.raw`\dot{\mathbf{x}} = 0 \text{ em } \mathbf{x}^*`}</Eq>
            <p className="text-xs text-gray-500">Exemplo: pêndulo amortecido</p>
          </div>

          {/* Ciclo Limite */}
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-5 border border-green-700/50">
            <div className="text-4xl mb-3">⭕</div>
            <h4 className="font-bold text-green-300 mb-2">Ciclo Limite</h4>
            <p className="text-sm text-gray-400 mb-3">
              Uma órbita periódica fechada. O sistema oscila para sempre com amplitude e frequência fixas.
            </p>
            <Eq small>{String.raw`\mathbf{x}(t + T) = \mathbf{x}(t)`}</Eq>
            <p className="text-xs text-gray-500">Exemplo: batimento cardíaco</p>
          </div>

          {/* Atrator Estranho */}
          <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 rounded-xl p-5 border border-red-700/50">
            <div className="text-4xl mb-3">🦋</div>
            <h4 className="font-bold text-red-300 mb-2">Atrator Estranho</h4>
            <p className="text-sm text-gray-400 mb-3">
              Um conjunto fractal com dinâmica caótica. Trajetórias próximas divergem exponencialmente.
            </p>
            <Eq small>{String.raw`|\delta\mathbf{x}(t)| \sim e^{\lambda t}`}</Eq>
            <p className="text-xs text-gray-500">Exemplo: sistema de Lorenz</p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-white">1.2 Conceitos-Chave</h3>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h4 className="text-lg font-semibold text-yellow-400 mb-4">Espaço de Fase</h4>
          <p className="text-gray-300 mb-3">
            O espaço de todas as configurações possíveis do sistema. Para um sistema com <M>n</M> variáveis,
            é um espaço <M>n</M>-dimensional onde cada ponto representa um estado único.
          </p>
          <Eq>{String.raw`\mathbf{x} = (x_1, x_2, \ldots, x_n) \in \mathbb{R}^n`}</Eq>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h4 className="text-lg font-semibold text-yellow-400 mb-4">Fluxo</h4>
          <p className="text-gray-300 mb-3">
            A evolução temporal do sistema é descrita pelo fluxo <M>{String.raw`\phi_t`}</M>, que mapeia
            condições iniciais para estados futuros:
          </p>
          <Eq>{String.raw`\phi_t : \mathbb{R}^n \to \mathbb{R}^n, \quad \mathbf{x}(t) = \phi_t(\mathbf{x}_0)`}</Eq>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h4 className="text-lg font-semibold text-yellow-400 mb-4">Expoente de Lyapunov</h4>
          <p className="text-gray-300 mb-3">
            Mede a taxa de separação de trajetórias infinitesimalmente próximas:
          </p>
          <BoxedEq label="Definição do Expoente de Lyapunov">
            {String.raw`\lambda = \lim_{t \to \infty} \frac{1}{t} \ln \frac{|\delta\mathbf{x}(t)|}{|\delta\mathbf{x}_0|}`}
          </BoxedEq>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="bg-blue-900/30 rounded-lg p-3">
              <div className="text-blue-300 font-bold"><M>{String.raw`\lambda < 0`}</M></div>
              <div className="text-sm text-gray-400">Estável</div>
            </div>
            <div className="bg-yellow-900/30 rounded-lg p-3">
              <div className="text-yellow-300 font-bold"><M>{String.raw`\lambda = 0`}</M></div>
              <div className="text-sm text-gray-400">Marginalmente estável</div>
            </div>
            <div className="bg-red-900/30 rounded-lg p-3">
              <div className="text-red-300 font-bold"><M>{String.raw`\lambda > 0`}</M></div>
              <div className="text-sm text-gray-400">Caótico</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-700/50">
          <h4 className="text-lg font-semibold text-purple-300 mb-2">💡 Insight Central</h4>
          <p className="text-gray-300">
            <strong>Determinístico ≠ Previsível.</strong> Sistemas regidos por equações determinísticas simples
            podem exibir comportamento imprevisível quando <M>{String.raw`\lambda > 0`}</M>. Esta é a essência
            do <em>caos determinístico</em>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Section1IntroPT;
