import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

function TelemetryDisplay() {
  const [data, setData] = useState({ flow: '000.00', sync: 'OK', nodes: 0 });
  useEffect(() => {
    const id = setInterval(() => {
       setData({
          flow: (Math.random() * 1000).toFixed(2),
          sync: Math.random() > 0.05 ? 'OK' : 'SYNC',
          nodes: Math.floor(Math.random() * 9999)
       });
    }, 150);
    return () => clearInterval(id);
  }, []);
  
  return (
    <div className="flex flex-col gap-1 text-[#ff3300] font-mono text-[10px] tracking-widest uppercase">
      <p>FLW: {data.flow}</p>
      <p>SYS: {data.sync}</p>
      <p>NDS: {data.nodes}</p>
    </div>
  );
}

interface HeroProps {
  onLaunchViewer: () => void;
}

export default function Hero({ onLaunchViewer }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] flex flex-col justify-between p-6 md:p-12 overflow-hidden mix-blend-difference text-white">
      
      {/* Precision Frame Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 2 }}
        className="absolute inset-4 md:inset-8 border border-white/10 pointer-events-none z-0 flex flex-col justify-between p-4"
      >
        <div className="flex justify-between items-start">
           <div className="w-6 h-6 border-t-2 border-l-2 border-[#ff3300]" />
           <div className="w-6 h-6 border-t-2 border-r-2 border-[#ff3300]" />
        </div>
        <div className="flex justify-between items-end">
           <div className="w-6 h-6 border-b-2 border-l-2 border-[#ff3300]" />
           <div className="w-6 h-6 border-b-2 border-r-2 border-[#ff3300]" />
        </div>
      </motion.div>

      {/* Main Kinetic Typography */}
      <motion.div 
        style={{ y: textY, opacity }}
        className="w-full relative z-10 flex flex-col flex-1 justify-center items-center pointer-events-none"
      >
        <h1 className="font-display font-black leading-[0.8] tracking-tighter uppercase text-[20vw] md:text-[16vw] text-white my-0 py-0 flex flex-col w-full h-full justify-center">
           <div className="overflow-hidden mb-2">
              <motion.div 
                 initial={{ y: '100%', rotate: 5 }} 
                 animate={{ y: 0, rotate: 0 }} 
                 transition={{ delay: 2.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} 
                 className="origin-top-left px-4 md:px-12"
              >
                 RUSH
              </motion.div>
           </div>
           
           <div className="overflow-hidden flex w-full justify-between items-center pr-4 md:pr-12">
              <motion.div 
                 initial={{ scaleX: 0 }} 
                 animate={{ scaleX: 1 }} 
                 transition={{ delay: 3.2, duration: 1.5, ease: "circOut" }} 
                 className="w-16 md:w-[25vw] h-[2px] md:h-[4px] bg-[#ff3300] origin-left ml-4 md:ml-12" 
              />
              <motion.div 
                 initial={{ y: '-100%', rotate: -5 }} 
                 animate={{ y: 0, rotate: 0 }} 
                 transition={{ delay: 2.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} 
                 className="text-transparent origin-bottom-right" 
                 style={{ WebkitTextStroke: '2px white' }}
              >
                 XR
              </motion.div>
           </div>
        </h1>
      </motion.div>

      {/* Futuristic Accents / Subtext */}
      <div className="w-full relative z-10 grid grid-cols-2 md:grid-cols-3 gap-8 items-end flex-none pb-4 px-2 md:px-8 pointer-events-none">
        
        {/* Left Telemetry */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }} 
           animate={{ opacity: 1, x: 0 }} 
           transition={{ delay: 3.5, duration: 1 }}
           className="hidden md:block"
        >
           <TelemetryDisplay />
        </motion.div>

        {/* Center Subtext */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 3.6, duration: 1 }}
          className="text-white/60 font-sans font-light text-sm md:text-base leading-relaxed md:col-span-1 col-span-2 md:text-center flex flex-col items-center gap-4"
        >
          <p>
            Engineering bespoke immersive installations, spatial XR,<br className="hidden md:block" /> 
            and monumental auditoriums for the bold.
          </p>
          <div className="pointer-events-auto mt-2">
            <button 
              onClick={onLaunchViewer} 
              data-cursor="hover" 
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold text-black bg-white hover:bg-[#ff3300] hover:text-white transition-all px-8 py-4 rounded-full shadow-lg shadow-[#ff3300]/10 hover:shadow-[#ff3300]/30 cursor-pointer"
            >
              Launch 3D Explorer &rarr;
            </button>
          </div>
        </motion.div>

        {/* Right Scroll Indicator */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }} 
           animate={{ opacity: 1, x: 0 }} 
           transition={{ delay: 3.7, duration: 1 }}
           className="hidden md:flex flex-col items-end gap-2 text-white/50 font-mono text-[10px] tracking-widest uppercase"
        >
           <p className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-[#ff3300] animate-pulse" />
             System Online
           </p>
           <p className="mt-2">Scroll to Traverse</p>
           <motion.div 
             className="w-[1px] h-12 bg-gradient-to-b from-[#ff3300] to-transparent mt-2"
             animate={{ scaleY: [0, 1, 0] }}
             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             style={{ originY: 0 }}
           />
        </motion.div>

      </div>
      
      {/* Decorative Rotating Element */}
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] md:w-[40vw] aspect-square border border-white/[0.03] rounded-full pointer-events-none mix-blend-screen"
      >
        <div className="absolute top-0 left-1/2 w-[1px] h-4 bg-white/20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/2 w-[1px] h-4 bg-white/20 -translate-x-1/2 translate-y-1/2" />
        <div className="absolute left-0 top-1/2 w-4 h-[1px] bg-white/20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute right-0 top-1/2 w-4 h-[1px] bg-white/20 translate-x-1/2 -translate-y-1/2" />
      </motion.div>

    </section>
  );
}
