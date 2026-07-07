import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
         if (p >= 100) {
           clearInterval(timer);
           setTimeout(() => setIsLoading(false), 800);
           return 100;
         }
         return p + Math.floor(Math.random() * 20) + 1;
      });
    }, 80);
     return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 } }}
          className="fixed inset-0 z-[100000] bg-[#020202] text-white flex flex-col items-center justify-center overflow-hidden"
        >
           <motion.div 
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-8 w-full max-w-sm px-6 relative z-10"
           >
             <div className="overflow-hidden w-full flex justify-center">
                <motion.h1 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display font-black text-6xl tracking-tighter uppercase"
                >
                  RUSH<span className="text-[#ff3300]">XR</span>
                </motion.h1>
             </div>
             
             <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-[#ff3300]"
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ ease: "circOut", duration: 0.2 }}
                />
             </div>
             
             <div className="w-full flex justify-between font-mono text-xs tracking-widest text-[#ff3300]">
               <span>SYS.INIT</span>
               <span>{Math.min(progress, 100)}%</span>
             </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 0.15 }}
             className="absolute inset-0 pointer-events-none mix-blend-overlay"
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
           />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
