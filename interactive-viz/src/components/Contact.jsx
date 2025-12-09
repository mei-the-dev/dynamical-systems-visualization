import React from 'react';
import { Github, Mail, ExternalLink, Heart } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pt-8 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <header className="text-center py-12 border-b border-gray-800 mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Contact
          </h1>
          <p className="text-xl text-gray-400">
            Get in touch
          </p>
        </header>

        {/* Contact Cards */}
        <div className="space-y-6">
          {/* GitHub */}
          <a
            href="https://github.com/mei-the-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 hover:bg-gray-800/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gray-800 rounded-xl group-hover:bg-gray-700 transition-colors">
                <Github size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">GitHub</h3>
                <p className="text-gray-400">@mei-the-dev</p>
              </div>
              <ExternalLink size={20} className="text-gray-500 group-hover:text-white transition-colors" />
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:mei@example.com"
            className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 hover:bg-gray-800/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Mail size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Email</h3>
                <p className="text-gray-400">mei@example.com</p>
              </div>
              <ExternalLink size={20} className="text-gray-500 group-hover:text-white transition-colors" />
            </div>
          </a>

          {/* Project Repository */}
          <a
            href="https://github.com/mei-the-dev/dynamical-systems-visualization"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 hover:bg-gray-800/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl">
                <Github size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Project Repository</h3>
                <p className="text-gray-400">dynamical-systems-visualization</p>
              </div>
              <ExternalLink size={20} className="text-gray-500 group-hover:text-white transition-colors" />
            </div>
          </a>
        </div>

        {/* About Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-8 border border-blue-700/30">
          <h2 className="text-2xl font-bold text-white mb-4">About This Project</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            This interactive visualization explores the fascinating world of dynamical systems, 
            strange attractors, and deterministic chaos. From the Van der Pol oscillator's 
            self-sustained oscillations to the Lorenz system's butterfly effect, these tools 
            bring mathematical physics to life.
          </p>
          <p className="text-gray-400 text-sm">
            Built with React, Vite, and canvas-based visualizations.
          </p>
        </div>

        {/* GitHub Education Thank You */}
        <div className="mt-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-3">
            <Github size={24} className="text-white" />
            <h3 className="text-lg font-semibold text-white">Acknowledgments</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Special thanks to the <a 
              href="https://education.github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >GitHub Education Program</a> for providing students with access to powerful development tools 
            and resources that made this project possible.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p className="flex items-center justify-center gap-2">
            Made with <Heart size={16} className="text-red-500" /> for mathematical exploration
          </p>
          <p className="mt-2">December 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
