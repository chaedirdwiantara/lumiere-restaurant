import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface CursorFollowerProps {
  className?: string;
}

export const CursorFollower = ({ className = '' }: CursorFollowerProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    
    if (!cursor || !cursorDot) return;

    // Set initial position
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(cursorDot, { xPercent: -50, yPercent: -50 });

    let xTo = gsap.quickTo(cursor, "x", { duration: 0.6, ease: "power3" });
    let yTo = gsap.quickTo(cursor, "y", { duration: 0.6, ease: "power3" });
    
    let xDotTo = gsap.quickTo(cursorDot, "x", { duration: 0.3, ease: "power2" });
    let yDotTo = gsap.quickTo(cursorDot, "y", { duration: 0.3, ease: "power2" });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      xDotTo(e.clientX);
      yDotTo(e.clientY);
    };

    const handleMouseEnter = () => {
      gsap.to(cursor, {
        scale: 1.5,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
      gsap.to(cursorDot, {
        scale: 0.8,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
      gsap.to(cursorDot, {
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    
    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [data-cursor="hover"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] mix-blend-difference ${className}`}
        style={{ willChange: 'transform' }}
      >
        <div className="w-full h-full border border-white/30 rounded-full backdrop-blur-sm" />
      </div>
      
      {/* Cursor dot */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 pointer-events-none z-[9999] mix-blend-difference"
        style={{ willChange: 'transform' }}
      >
        <div className="w-full h-full bg-white rounded-full" />
      </div>
    </>
  );
};