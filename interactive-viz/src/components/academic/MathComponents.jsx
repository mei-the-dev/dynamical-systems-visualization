import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Inline math - for use within paragraphs
export const M = ({ children }) => (
  <span
    className="inline-block align-middle"
    dangerouslySetInnerHTML={{
      __html: katex.renderToString(children, { throwOnError: false }),
    }}
  />
);

// Display math - for standalone equations with better overflow handling
export const Eq = ({ children, small = false }) => (
  <div className="my-4 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">
    <div
      className={`text-center ${small ? 'text-base' : 'text-lg md:text-xl'} w-full px-2`}
      style={{ maxWidth: '100%' }}
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(children, { throwOnError: false, displayMode: true }),
      }}
    />
  </div>
);

// Boxed equation - for important formulas
export const BoxedEq = ({ children, label }) => (
  <div className="my-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700 overflow-x-auto">
    {label && <div className="text-sm text-gray-400 mb-2">{label}</div>}
    <div
      className="text-center text-lg md:text-xl w-full px-2"
      style={{ maxWidth: '100%' }}
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(children, { throwOnError: false, displayMode: true }),
      }}
    />
  </div>
);

// Equation in a colored block
export const HighlightEq = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'from-blue-900/50 to-blue-800/30 border-blue-700/50',
    green: 'from-green-900/50 to-green-800/30 border-green-700/50',
    purple: 'from-purple-900/50 to-purple-800/30 border-purple-700/50',
    orange: 'from-orange-900/50 to-orange-800/30 border-orange-700/50',
    red: 'from-red-900/50 to-red-800/30 border-red-700/50',
  };
  
  return (
    <div className={`my-4 bg-gradient-to-br ${colors[color]} rounded-lg p-4 border overflow-x-auto`}>
      <div
        className="text-center text-lg md:text-xl min-w-max"
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(children, { throwOnError: false, displayMode: true }),
        }}
      />
    </div>
  );
};

export default { M, Eq, BoxedEq, HighlightEq };
