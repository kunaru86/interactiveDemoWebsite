import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const PROJECTS = [
  { id: '01', title: 'Industrial Twin', year: '2024', tag: 'Meta Quest 3', video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
  { id: '02', title: 'Nazrana', year: '2023', tag: 'VFX / Narrative', video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
  { id: '03', title: 'Deconstruct', year: '2024', tag: '3D Simulation', video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
  { id: '04', title: 'AR Flipbook', year: '2023', tag: 'Projection', video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4' },
  { id: '05', title: 'Godda Park', year: '2022', tag: 'Unreal Engine 5', video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
  { id: '06', title: 'Villa Visualizer', year: '2026', tag: 'WebGL / Three.js', video: 'viewer/VideoFiles/villa%20render0001-0472.mp4', link: '/viewer/index.html' },
];

interface WorksProps {
  onLaunchViewer: () => void;
}

export default function Works({ onLaunchViewer }: WorksProps) {
  const targetRef = useRef<HTMLElement>(null);
  const [activeProject, setActiveProject] = useState<typeof PROJECTS[0] | null>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);

  return (
    <>
      <section ref={targetRef} id="work" className="relative h-[300vh] bg-transparent">
        {/* Sticky container that stays on screen while we scroll 300vh */}
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          
          {/* Intro Text for Works */}
          <div className="absolute top-24 left-6 md:left-12 mix-blend-difference text-white z-20 pointer-events-none">
              <h2 className="font-mono text-sm uppercase tracking-[0.3em]">Selected Archive</h2>
          </div>

          {/* The horizontally moving container */}
          <motion.div style={{ x }} className="flex gap-12 md:gap-32 px-6 md:px-32 w-max items-center h-full">
            
            <div className="w-[80vw] md:w-[40vw] shrink-0 mix-blend-difference text-white pointer-events-none">
              <h3 className="font-display text-7xl md:text-[12rem] uppercase tracking-tighter font-black leading-[0.85]">
                Archive <br/> 01—05
              </h3>
            </div>

            {PROJECTS.map((project) => (
              <div 
                key={project.id} 
                onClick={() => {
                  if ('link' in project && project.link) {
                    onLaunchViewer();
                  } else {
                    setActiveProject(project);
                  }
                }}
                className="w-[85vw] md:w-[45vw] h-[60vh] shrink-0 relative group"
                data-cursor="hover"
                data-cursor-text={'link' in project && project.link ? "OPEN" : "PLAY"}
              >
                  <div className="absolute inset-0 border border-white/20 bg-black overflow-hidden transition-all duration-500">
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                     
                     {/* Video Thumbnail / Preview */}
                     <video 
                        src={project.video}
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                        className="w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity duration-700 grayscale group-hover:grayscale-0"
                     />
                     
                     {/* Abstract representation of project visual overlay */}
                     <div className="absolute inset-0 z-10 flex items-center justify-center mix-blend-overlay pointer-events-none">
                        <div className="text-white/20 font-display text-[15vw] md:text-[8vw] font-black uppercase tracking-tighter whitespace-nowrap group-hover:scale-110 transition-transform duration-1000">
                          {project.title}
                        </div>
                     </div>

                     <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end text-white pointer-events-none">
                        <div>
                          <span className="font-mono text-sm tracking-widest block mb-2">{project.id}</span>
                          <h4 className="font-display text-4xl md:text-6xl uppercase tracking-tighter font-bold">{project.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs uppercase tracking-widest block mb-2">{project.year}</span>
                          <span className="font-mono text-xs uppercase tracking-widest text-white/50 block">{project.tag}</span>
                        </div>
                     </div>

                     {/* Floating Play Button effect on hover */}
                     <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="w-24 h-24 rounded-full border border-white/30 backdrop-blur-md bg-white/10 flex items-center justify-center text-white font-mono text-xs uppercase tracking-widest">
                          {'link' in project && project.link ? 'Open' : 'Play'}
                        </div>
                     </div>
                  </div>
              </div>
            ))}

          </motion.div>
        </div>
      </section>

      {/* Fullscreen Video Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-black bg-opacity-95 backdrop-blur-xl flex items-center justify-center"
          >
            <button 
              onClick={() => setActiveProject(null)}
              className="absolute top-8 right-8 z-50 text-white/50 hover:text-white transition-colors flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
            >
              Close <X size={20} />
            </button>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-7xl aspect-video bg-black/50 border border-white/10 shadow-2xl relative"
            >
              <video 
                src={activeProject.video}
                autoPlay 
                controls 
                className="w-full h-full object-contain"
              />
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute bottom-12 left-12 right-12 flex justify-between items-end text-white pointer-events-none"
            >
               <div>
                  <span className="font-mono text-sm tracking-widest block mb-2 text-[#ff3300]">{activeProject.id}</span>
                  <h4 className="font-display text-4xl md:text-5xl uppercase tracking-tighter font-bold">{activeProject.title}</h4>
               </div>
               <div className="text-right">
                  <span className="font-mono text-xs uppercase tracking-widest text-white/50 block">{activeProject.tag}</span>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
