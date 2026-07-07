import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const [hovered, setHovered] = useState(false);

  return (
    <footer id="contact" className="relative min-h-screen flex flex-col justify-between px-6 md:px-12 pt-32 pb-6 mix-blend-difference text-white">
      
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-[#ff3300] mb-8 bg-[#ff3300]/10 px-6 py-2 rounded-full border border-[#ff3300]/30 animate-pulse">
          /// 2026 Commissions Open
        </p>

        <motion.a 
          href="mailto:hello@rushxr.in"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative inline-block mt-4"
          data-cursor="hover"
          data-cursor-text="START"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-[#ff3300]/20 to-purple-600/20 blur-2xl rounded-full opacity-0 hover:opacity-100 transition-opacity duration-700" />
          <h2 className="font-display text-5xl md:text-[8rem] font-black uppercase tracking-tighter px-8 hover:text-transparent transition-all duration-500 hover:scale-105" style={{ WebkitTextStroke: hovered ? '2px white' : 'none' }}>
            Initiate<br/>Sequence
          </h2>
          {hovered && (
             <motion.div 
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-[#ff3300] to-purple-600 rounded-full mix-blend-screen flex items-center justify-center -z-10 pointer-events-none blur-sm"
             >
               <ArrowUpRight size={64} className="text-white drop-shadow-2xl" />
             </motion.div>
          )}
        </motion.a>
        <p className="font-sans text-lg text-gray-400 mt-12 max-w-md mx-auto">
          Ready to build something monumental? Reach out and let's engineer the impossible.
        </p>
      </div>
      
      <div className="border-t border-white/20 pt-10 pb-4 flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-xs uppercase tracking-widest pointer-events-auto">
         <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 hover:border-[#ff3300] hover:bg-[#ff3300]/10 hover:text-[#ff3300] transition-all duration-300">
              Instagram <ArrowUpRight size={14} />
            </a>
            <a href="#" className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 hover:border-[#ff3300] hover:bg-[#ff3300]/10 hover:text-[#ff3300] transition-all duration-300">
              LinkedIn <ArrowUpRight size={14} />
            </a>
         </div>
         <p className="text-gray-500">© {new Date().getFullYear()} RUSH XR. All protocol reserved.</p>
         <div className="flex gap-8 text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
         </div>
      </div>
    </footer>
  );
}
