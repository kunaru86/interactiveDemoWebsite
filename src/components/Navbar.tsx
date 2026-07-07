import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Menu, Glasses } from 'lucide-react';
import { toggleSession } from '@react-three/xr';

interface NavbarProps {
  onLaunchViewer: () => void;
}

export default function Navbar({ onLaunchViewer }: NavbarProps) {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex items-center justify-between pointer-events-none mix-blend-difference"
    >
      <div className="pointer-events-auto">
        <a href="#" className="font-display font-bold text-2xl tracking-tighter text-white uppercase">
          Rush<span className="text-[#ff3300]">XR</span>
        </a>
      </div>

      <div className="flex gap-4 items-center pointer-events-auto">
        <button 
          onClick={async () => {
            try {
              if ('xr' in navigator && navigator.xr) {
                const supported = await navigator.xr.isSessionSupported('immersive-vr');
                if (!supported) {
                  alert('VR is not supported on this device or browser.');
                  return;
                }
                await toggleSession('immersive-vr');
              } else {
                alert('WebXR is not available in your browser.');
              }
            } catch (e) {
              console.error('Failed to enter VR', e);
              alert('Failed to enter VR: ' + (e instanceof Error ? e.message : 'No VR hardware found or permission denied.'));
            }
          }}
          data-cursor="hover" 
          className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold text-black bg-white hover:bg-[#ff3300] hover:text-white transition-colors px-6 py-3 rounded-full cursor-pointer"
        >
          <Glasses size={14} /> Enter VR
        </button>
        <button 
          onClick={onLaunchViewer}
          data-cursor="hover" 
          className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold text-white bg-[#ff3300]/10 border border-[#ff3300]/30 hover:bg-[#ff3300] hover:border-[#ff3300] transition-all px-6 py-3 rounded-full cursor-pointer"
        >
          3D Visualizer <ArrowUpRight size={14} />
        </button>
        <a href="#contact" data-cursor="hover" className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold text-white bg-transparent border border-white/20 hover:border-white transition-colors px-6 py-3 rounded-full">
          Initiate <ArrowUpRight size={14} />
        </a>
        <button className="md:hidden border border-white/20 p-3 rounded-full text-white">
          <Menu size={20} />
        </button>
      </div>
    </motion.nav>
  );
}
