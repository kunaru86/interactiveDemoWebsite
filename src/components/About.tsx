import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export default function About() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-40%", "0%"]);

  return (
    <section id="studio" ref={ref} className="relative min-h-[120vh] flex flex-col justify-center items-center overflow-hidden mix-blend-difference text-white">
      
      <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none overflow-hidden opacity-5 z-0 pb-32">
          <motion.div style={{ x: x1 }} className="whitespace-nowrap font-display text-[15vw] font-black uppercase tracking-tighter leading-none">
             DIGITAL ALCHEMY /// HIGH-END EXPERIENCES ///
          </motion.div>
          <motion.div style={{ x: x2, WebkitTextStroke: '2px white' }} className="whitespace-nowrap font-display text-[15vw] font-black uppercase tracking-tighter leading-none text-transparent mt-4">
             XR & SPATIAL /// AUDITORIUMS & THEATRES ///
          </motion.div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center mt-32 pointer-events-none">
        <motion.p 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-sans font-light tracking-tight leading-[1.2] text-gray-300 max-w-[95%] mx-auto"
        >
          We deliver <span className="font-serif italic text-white font-normal text-4xl md:text-6xl lg:text-7xl">end-to-end</span> software design and <span className="font-display font-bold uppercase text-white tracking-tighter">hardware integration</span> for large-scale immersive installations, engineering experiences that <span className="font-mono text-[#ff3300] uppercase tracking-widest text-2xl md:text-4xl mx-2 border border-[#ff3300]/30 px-3 py-1 rounded-full bg-[#ff3300]/5 inline-block -translate-y-2">captivate</span> on a <span className="font-serif italic text-white font-normal text-4xl md:text-6xl lg:text-7xl">monumental scale.</span>
        </motion.p>

        <motion.div 
           className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-0 border-y border-white/20 py-12 px-8 text-left"
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           transition={{ duration: 1, delay: 0.5 }}
        >
          <div>
             <span className="font-mono text-xs uppercase tracking-widest text-[#ff3300] block mb-2">Location</span>
             <span className="font-mono text-sm uppercase">Pune & Bangalore, IN</span>
          </div>
          <div>
             <span className="font-mono text-xs uppercase tracking-widest text-[#ff3300] block mb-2">Focus</span>
             <span className="font-mono text-sm uppercase">XR & Spatial</span>
          </div>
          <div>
             <span className="font-mono text-xs uppercase tracking-widest text-[#ff3300] block mb-2">Founded</span>
             <span className="font-mono text-sm uppercase">2024</span>
          </div>
          <div>
             <span className="font-mono text-xs uppercase tracking-widest text-[#ff3300] block mb-2">Team</span>
             <span className="font-mono text-sm uppercase">Alchemists</span>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
