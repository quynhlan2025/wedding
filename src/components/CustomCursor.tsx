'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const [isTouch, setIsTouch] = useState(true);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    setIsTouch(isTouchDevice);
    if (isTouchDevice) return;

    const moveCursor = (e: MouseEvent) => {
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }
    };

    window.addEventListener('mousemove', moveCursor, { passive: true });
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  if (isTouch) return null;

  return (
    <>
      <div ref={ringRef} className="fixed top-0 left-0 w-10 h-10 rounded-full border border-red-500 pointer-events-none z-[99999]" style={{ willChange: 'transform', touchAction: 'none' }} />
      <div ref={dotRef} className="fixed top-0 left-0 w-2 h-2 rounded-full bg-red-500 pointer-events-none z-[99999]" style={{ willChange: 'transform', touchAction: 'none' }} />
    </>
  );
}
