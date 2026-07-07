import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import ParticleCanvas from './components/ParticleCanvas';
import Hero from './components/Hero';
import Expertise from './components/Expertise';
import Works from './components/Works';
import About from './components/About';
import Team from './components/Team';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import NoiseOverlay from './components/NoiseOverlay';
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion } from 'motion/react';

export default function App() {
  const [showViewer, setShowViewer] = useState(false);
  const [loadIframe, setLoadIframe] = useState(false);

  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Control iframe loading state for performance
  useEffect(() => {
    if (showViewer) {
      setLoadIframe(true);
    } else {
      // Keep iframe mounted for a short duration to complete the slide-out animation smoothly
      const timer = setTimeout(() => {
        setLoadIframe(false);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [showViewer]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020202]">
      <motion.div 
        animate={{ x: showViewer ? '-100vw' : '0vw' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="flex w-[200vw] h-full"
      >
        {/* Pane 1: Main React Website */}
        <div className="w-[100vw] h-full overflow-y-auto overflow-x-hidden relative bg-[#020202] text-white selection:bg-[#ff3300] selection:text-white">
          <ErrorBoundary>
            <Preloader />
          </ErrorBoundary>
          <CustomCursor />
          <NoiseOverlay />

          {/* 3D Background */}
          <ErrorBoundary>
            <ParticleCanvas />
          </ErrorBoundary>
          
          {/* Fixed UI */}
          <Navbar onLaunchViewer={() => setShowViewer(true)} />
          
          {/* Scrolling Content overlay */}
          <div className="relative z-10 w-full">
            <Hero onLaunchViewer={() => setShowViewer(true)} />
            <Expertise />
            <Works onLaunchViewer={() => setShowViewer(true)} />
            <About />
            <Team />
            <Footer />
          </div>
        </div>

        {/* Pane 2: 3D Visualizer Iframe Panel */}
        <div className="w-[100vw] h-full relative bg-[#09090b] overflow-hidden">
          {/* Floating Exit Button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowViewer(false)}
            className="absolute top-6 left-6 z-[1000] flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold text-white bg-black/85 hover:bg-[#ff3300] transition-colors px-6 py-3 rounded-full border border-white/10 shadow-2xl cursor-pointer"
          >
            &larr; Exit Visualizer
          </motion.button>
          
          {loadIframe && (
            <iframe 
              src="/viewer/index.html" 
              className="w-full h-full border-none bg-slate-50"
              title="3D Villa Visualizer"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
