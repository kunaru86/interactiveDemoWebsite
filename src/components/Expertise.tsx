import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';

const SERVICES = [
  { 
    id: '01', 
    title: 'Projection Mapping', 
    text: 'Turning static facades into fluid canvases.',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
    details: 'Transforming arbitrary forms into dynamic visual centerpieces. Projection mapping alters the perception of space and geometry in real-time, rewriting visual reality.'
  },
  { 
    id: '02', 
    title: 'Extended Reality', 
    text: 'High-fidelity simulations bridging physical & digital.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    details: 'We deploy next-gen visual solutions across physical and digital realms, recontextualizing environments into experiences that cannot be ignored.'
  },
  { 
    id: '03', 
    title: 'Film & VFX', 
    text: 'Cinematic storytelling amplified by visual effects.',
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop',
    details: 'Merging cutting-edge CGI with live-action direction. Amplifying narratives with photorealistic visual effects and uncompromising cinematic vision.'
  },
  { 
    id: '04', 
    title: 'Auditoriums & Theatres', 
    text: 'Bespoke immersive installations and large-scale immersive spaces.',
    image: 'https://images.unsplash.com/photo-1542841791-1925b02a2bf8?q=80&w=2070&auto=format&fit=crop',
    details: 'End-to-end software design and hardware integration for large-scale physical spaces. Engineering permanent installations and premium viewing environments.'
  },
];

export default function Expertise() {
  const containerRef = useRef(null);
  const [activeId, setActiveId] = useState(SERVICES[1].id); // Default to '02' as it was initially Extended Reality
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  const activeService = SERVICES.find(s => s.id === activeId) || SERVICES[1];

  return (
    <section id="expertise" ref={containerRef} className="py-32 px-6 md:px-12 relative min-h-screen flex items-center mix-blend-difference text-white">
      <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 relative z-10 pointer-events-none">
        
        <motion.div style={{ y: y1 }} className="flex flex-col justify-center min-w-0 md:pr-10 pointer-events-auto">
            <h2 className="font-mono text-lg text-white uppercase tracking-[0.3em] mb-12 flex gap-4">
              <span>[</span>
              <span className="text-[#ff3300]">PROTOCOL: {activeService.id}</span>
              <span>]</span>
            </h2>
            
            <div className="relative w-full aspect-[4/3] mb-8 overflow-hidden rounded-sm border border-white/20 group cursor-crosshair bg-[#0a0a0a]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img 
                  key={activeService.image}
                  src={activeService.image}
                  alt={activeService.title}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 w-full h-full object-cover group-hover:opacity-100 transition-opacity duration-700"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.7 }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none z-10" />
              
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none z-20">
                <AnimatePresence mode="wait">
                  <motion.h3 
                    key={activeService.title}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold uppercase tracking-tighter leading-[0.9] text-white"
                  >
                    {activeService.title.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {word}
                        <br />
                      </React.Fragment>
                    ))}
                  </motion.h3>
                </AnimatePresence>
              </div>
            </div>

            <div className="min-h-[100px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeService.details}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-lg md:text-xl font-sans font-light max-w-xl text-gray-300 leading-relaxed border-l border-[#ff3300] pl-6 py-2"
                >
                  {activeService.details}
                </motion.p>
              </AnimatePresence>
            </div>
        </motion.div>

        <motion.div style={{ y: y2 }} className="flex flex-col gap-8 md:gap-16 mt-24 md:mt-0 pointer-events-auto">
          {SERVICES.map((srv) => (
             <div 
               key={srv.id} 
               onClick={() => setActiveId(srv.id)}
               className={`group cursor-pointer border-t border-white/20 pt-8 transition-opacity duration-500 ${activeId === srv.id ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
             >
                <div className="flex justify-between items-start mb-6">
                   <span className={`font-mono text-xl md:text-2xl transition-colors duration-300 ${activeId === srv.id ? 'text-[#ff3300]' : ''}`}>
                     {srv.id}
                   </span>
                   <span className={`w-12 h-12 rounded-full border border-white/20 flex items-center justify-center transition-all duration-300 -translate-y-4 text-2xl ${activeId === srv.id ? 'opacity-100 translate-y-0 text-[#ff3300] border-[#ff3300]' : 'opacity-0 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                     ↗
                   </span>
                </div>
                <h4 className={`font-display text-4xl md:text-5xl uppercase tracking-tighter font-bold mb-4 transition-all duration-500 ${activeId === srv.id ? 'pl-6 text-white' : 'group-hover:pl-6 text-gray-300'}`}>
                  {srv.title}
                </h4>
                <p className={`font-sans text-lg transition-colors ${activeId === srv.id ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-400'}`}>
                  {srv.text}
                </p>
             </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
