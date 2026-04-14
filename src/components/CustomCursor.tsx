'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const isHovering = useRef(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 20);
      cursorY.set(e.clientY - 20);
      dotX.set(e.clientX - 4);
      dotY.set(e.clientY - 4);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('a, button, [data-cursor="hover"], input, textarea')) {
        isHovering.current = true;
        document.documentElement.setAttribute('data-cursor-hover', 'true');
      }
    };

    const handleMouseOut = () => {
      isHovering.current = false;
      document.documentElement.removeAttribute('data-cursor-hover');
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [cursorX, cursorY, dotX, dotY]);

  return (
    <>
      {/* Ring */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-red-500 pointer-events-none z-[99999] mix-blend-difference"
        style={{ x: cursorXSpring, y: cursorYSpring }}
        whileHover={{ scale: 1.5 }}
      />
      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-red-500 pointer-events-none z-[99999]"
        style={{ x: dotX, y: dotY }}
      />
    </>
  );
}
