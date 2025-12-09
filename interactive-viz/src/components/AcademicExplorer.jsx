import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, ChevronRight, Menu, X, Globe } from 'lucide-react';
import Section1Intro from './academic/Section1Intro';
import Section1IntroPT from './academic/Section1IntroPT';
import Section2VanDerPol from './academic/Section2VanDerPol';
import Section2VanDerPolPT from './academic/Section2VanDerPolPT';
import Section3Equilibrium from './academic/Section3Equilibrium';
import Section3EquilibriumPT from './academic/Section3EquilibriumPT';
import Section4Lorenz from './academic/Section4Lorenz';
import Section4LorenzPT from './academic/Section4LorenzPT';
import Section5Bifurcation from './academic/Section5Bifurcation';
import Section5BifurcationPT from './academic/Section5BifurcationPT';
import Section6CERN from './academic/Section6CERN';
import Section6CERNPT from './academic/Section6CERNPT';
import Section7Conclusion from './academic/Section7Conclusion';
import Section7ConclusionPT from './academic/Section7ConclusionPT';

const sectionsEN = [
  { id: 'intro', title: '1. Introduction', subtitle: 'Attractors & Dynamical Systems' },
  { id: 'vanderpol', title: '2. Van der Pol', subtitle: 'Self-Sustained Oscillations' },
  { id: 'equilibrium', title: '3. Equilibrium', subtitle: 'Stability Analysis' },
  { id: 'lorenz', title: '4. Lorenz System', subtitle: 'Strange Attractors' },
  { id: 'bifurcation', title: '5. Bifurcations', subtitle: 'Route to Chaos' },
  { id: 'cern', title: '6. CERN Control', subtitle: 'Taming Chaos' },
  { id: 'conclusion', title: '7. Conclusion', subtitle: 'Summary & References' },
];

const sectionsPT = [
  { id: 'intro', title: '1. Introdução', subtitle: 'Atratores & Sistemas Dinâmicos' },
  { id: 'vanderpol', title: '2. Van der Pol', subtitle: 'Oscilações Autossustentadas' },
  { id: 'equilibrium', title: '3. Equilíbrio', subtitle: 'Análise de Estabilidade' },
  { id: 'lorenz', title: '4. Sistema de Lorenz', subtitle: 'Atratores Estranhos' },
  { id: 'bifurcation', title: '5. Bifurcações', subtitle: 'Caminho para o Caos' },
  { id: 'cern', title: '6. Controle CERN', subtitle: 'Domando o Caos' },
  { id: 'conclusion', title: '7. Conclusão', subtitle: 'Resumo & Referências' },
];

const AcademicExplorer = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [language, setLanguage] = useState('en');
  const sectionRefs = useRef({});

  const sections = language === 'pt' ? sectionsPT : sectionsEN;

  // Track scroll position to highlight active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = sectionRefs.current[id];
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Language Toggle */}
      <button
        onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
        className="fixed top-20 right-4 z-40 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
        title={language === 'en' ? 'Switch to Portuguese' : 'Mudar para Inglês'}
      >
        <Globe size={16} />
        <span className="font-medium">{language === 'en' ? 'PT-BR' : 'EN'}</span>
      </button>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-20 left-4 z-40 lg:hidden bg-gray-800 p-2 rounded-lg"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-72 bg-gray-900 border-r border-gray-800 overflow-y-auto transition-transform z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6 text-blue-400">
            <BookOpen size={24} />
            <h2 className="font-bold text-lg">{language === 'en' ? 'Academic Notes' : 'Notas Acadêmicas'}</h2>
          </div>
          
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-all flex items-center gap-2 ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <ChevronRight
                  size={16}
                  className={`transition-transform ${
                    activeSection === section.id ? 'rotate-90' : ''
                  }`}
                />
                <div>
                  <div className="font-medium text-sm">{section.title}</div>
                  <div className="text-xs opacity-70">{section.subtitle}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all ${sidebarOpen ? 'lg:ml-72' : ''} pt-4 pb-20`}>
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          {/* Title */}
          <header className="text-center py-12 border-b border-gray-800 mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {language === 'en' 
                ? 'Strange Attractors & Dynamical Systems'
                : 'Atratores Estranhos & Sistemas Dinâmicos'}
            </h1>
            <p className="text-xl text-gray-400">
              {language === 'en'
                ? 'From Van der Pol Oscillators to Deterministic Chaos'
                : 'Dos Osciladores de Van der Pol ao Caos Determinístico'}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              {language === 'en' 
                ? 'Interactive Academic Exploration • Mathematical Physics'
                : 'Exploração Acadêmica Interativa • Física Matemática'}
            </p>
          </header>

          {/* Sections */}
          <div ref={el => sectionRefs.current['intro'] = el}>
            {language === 'en' ? <Section1Intro /> : <Section1IntroPT />}
          </div>
          
          <div ref={el => sectionRefs.current['vanderpol'] = el}>
            {language === 'en' ? <Section2VanDerPol /> : <Section2VanDerPolPT />}
          </div>
          
          <div ref={el => sectionRefs.current['equilibrium'] = el}>
            {language === 'en' ? <Section3Equilibrium /> : <Section3EquilibriumPT />}
          </div>
          
          <div ref={el => sectionRefs.current['lorenz'] = el}>
            {language === 'en' ? <Section4Lorenz /> : <Section4LorenzPT />}
          </div>
          
          <div ref={el => sectionRefs.current['bifurcation'] = el}>
            {language === 'en' ? <Section5Bifurcation /> : <Section5BifurcationPT />}
          </div>
          
          <div ref={el => sectionRefs.current['cern'] = el}>
            {language === 'en' ? <Section6CERN /> : <Section6CERNPT />}
          </div>
          
          <div ref={el => sectionRefs.current['conclusion'] = el}>
            {language === 'en' ? <Section7Conclusion /> : <Section7ConclusionPT />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AcademicExplorer;
