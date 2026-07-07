import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setIsVisible(true);
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest('a, button, [data-cursor]');
      
      if (clickable) {
        setIsHovering(true);
        const text = clickable.getAttribute('data-cursor-text');
        setCursorText(text || '');
      } else {
        setIsHovering(false);
        setCursorText('');
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999] mix-blend-difference flex items-center justify-center transform-gpu"
      animate={{
        x: mousePosition.x - (isHovering && cursorText ? 40 : 8),
        y: mousePosition.y - (isHovering && cursorText ? 40 : 8),
      }}
      transition={{ type: 'tween', ease: 'easeOut', duration: 0.15 }}
    >
      <motion.div 
        className="flex items-center justify-center rounded-full bg-white relative overflow-hidden"
        animate={{
          width: isHovering && cursorText ? 80 : isHovering ? 48 : 16,
          height: isHovering && cursorText ? 80 : isHovering ? 48 : 16,
          backgroundColor: isHovering && !cursorText ? 'transparent' : '#ffffff',
          border: isHovering && !cursorText ? '1px solid #ffffff' : '0px solid transparent'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
         {cursorText && isHovering && (
           <motion.span 
             initial={{ opacity: 0, scale: 0.5 }}
             animate={{ opacity: 1, scale: 1 }}
             className="text-black font-display font-bold text-xs uppercase tracking-widest text-center absolute"
           >
             {cursorText}
           </motion.span>
         )}
      </motion.div>
    </motion.div>
  );
}
