import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const TEAM = [
  {
    name: 'Kunal',
    role: 'Immersive Artist & Technical Designer',
    socials: [
      { name: 'Instagram', url: '#' },
      { name: 'LinkedIn', url: '#' }
    ]
  },
  {
    name: 'Shivangi',
    role: 'Lead Visual Designer',
    socials: [
      { name: 'Instagram', url: '#' },
      { name: 'LinkedIn', url: '#' }
    ]
  },
  {
    name: 'Shravya',
    role: 'Lead Film Maker & Producer',
    socials: [
      { name: 'Instagram', url: '#' },
      { name: 'LinkedIn', url: '#' }
    ]
  }
];

export default function Team() {
  return (
    <section className="py-24 px-6 md:px-12 relative mix-blend-difference text-white pointer-events-auto">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="font-mono text-sm uppercase tracking-[0.3em] text-[#ff3300] mb-16 text-center">
          /// Protocol Operatives
        </h2>
        
        <div className="flex flex-col border-t border-white/20">
          {TEAM.map((member, i) => (
            <motion.div 
              key={member.name}
              className="group relative flex flex-col md:flex-row md:items-center justify-between py-12 border-b border-white/20 hover:bg-white/[0.02] transition-colors"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="flex items-center gap-8 mb-6 md:mb-0">
                <h3 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}>
                  <span className="group-hover:text-white transition-colors duration-500 block">
                    {member.name}
                  </span>
                </h3>
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-16 w-full md:w-auto">
                <p className="font-sans text-lg md:text-xl font-light text-gray-400 group-hover:text-white transition-colors">
                  {member.role}
                </p>
                <div className="flex gap-4">
                  {member.socials.map((social) => (
                    <a 
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 rounded-full border border-white/20 font-mono text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2"
                      data-cursor="hover"
                    >
                      {social.name}
                      <ArrowUpRight size={14} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
