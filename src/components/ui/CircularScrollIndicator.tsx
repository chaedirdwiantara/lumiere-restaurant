import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface CircularScrollIndicatorProps {
  className?: string;
}

export const CircularScrollIndicator = ({ className = '' }: CircularScrollIndicatorProps) => {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const indicator = indicatorRef.current;
    const circle = circleRef.current;
    const text = textRef.current;
    
    if (!indicator || !circle || !text) return;

    // Set initial position
    gsap.set(indicator, { xPercent: -50, yPercent: -50 });

    // Circle animation
    const circumference = 2 * Math.PI * 20; // radius = 20
    gsap.set(circle, {
      strokeDasharray: circumference,
      strokeDashoffset: circumference,
    });

    let xTo = gsap.quickTo(indicator, "x", { duration: 0.8, ease: "power3" });
    let yTo = gsap.quickTo(indicator, "y", { duration: 0.8, ease: "power3" });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const handleScroll = () => {
      const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      const offset = circumference - (scrollProgress * circumference);
      
      gsap.to(circle, {
        strokeDashoffset: offset,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    // Floating animation for the text
    gsap.to(text, {
      rotation: 360,
      duration: 20,
      ease: "none",
      repeat: -1
    });

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      ref={indicatorRef}
      className={`fixed top-0 left-0 w-16 h-16 pointer-events-none z-50 ${className}`}
      style={{ willChange: 'transform' }}
    >
      {/* SVG Circle Progress */}
      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
        <circle
          ref={circleRef}
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Rotating SCROLL text */}
      <div
        ref={textRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="text-[8px] font-light tracking-[0.2em] text-white/60 uppercase">
          SCROLL
        </div>
      </div>
    </div>
  );
};