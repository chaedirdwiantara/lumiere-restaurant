import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  markers?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

export const useScrollAnimations = () => {
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    contextRef.current = gsap.context(() => {});
    
    return () => {
      contextRef.current?.revert();
    };
  }, []);

  const animateOnScroll = (
    selector: string,
    animation: gsap.TweenVars,
    options: ScrollAnimationOptions = {}
  ) => {
    if (!contextRef.current) return;

    contextRef.current.add(() => {
      gsap.fromTo(selector, 
        {
          y: 100,
          opacity: 0,
          scale: 0.9,
          ...animation.from
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.1,
          ...animation,
          scrollTrigger: {
            trigger: options.trigger || selector,
            start: options.start || "top 80%",
            end: options.end || "bottom 20%",
            scrub: options.scrub || false,
            pin: options.pin || false,
            markers: options.markers || false,
            toggleActions: "play none none reverse",
            onEnter: options.onEnter,
            onLeave: options.onLeave,
            onEnterBack: options.onEnterBack,
            onLeaveBack: options.onLeaveBack,
          }
        }
      );
    });
  };

  const parallaxEffect = (
    selector: string,
    speed: number = 0.5,
    options: ScrollAnimationOptions = {}
  ) => {
    if (!contextRef.current) return;

    contextRef.current.add(() => {
      gsap.to(selector, {
        yPercent: -50 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: options.trigger || selector,
          start: options.start || "top bottom",
          end: options.end || "bottom top",
          scrub: true,
          markers: options.markers || false,
        }
      });
    });
  };

  const staggerAnimation = (
    selector: string,
    animation: gsap.TweenVars,
    staggerAmount: number = 0.1,
    options: ScrollAnimationOptions = {}
  ) => {
    if (!contextRef.current) return;

    contextRef.current.add(() => {
      gsap.fromTo(selector,
        {
          y: 60,
          opacity: 0,
          rotationX: 45,
          ...animation.from
        },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 1,
          ease: "power3.out",
          stagger: staggerAmount,
          ...animation,
          scrollTrigger: {
            trigger: options.trigger || selector,
            start: options.start || "top 85%",
            toggleActions: "play none none reverse",
            markers: options.markers || false,
            onEnter: options.onEnter,
            onLeave: options.onLeave,
          }
        }
      );
    });
  };

  const cinematicReveal = (
    selector: string,
    direction: 'left' | 'right' | 'up' | 'down' = 'up',
    options: ScrollAnimationOptions = {}
  ) => {
    if (!contextRef.current) return;

    const directions = {
      left: { x: -100, y: 0 },
      right: { x: 100, y: 0 },
      up: { x: 0, y: 100 },
      down: { x: 0, y: -100 }
    };

    const { x, y } = directions[direction];

    contextRef.current.add(() => {
      gsap.fromTo(selector,
        {
          x,
          y,
          opacity: 0,
          scale: 0.8,
          rotationY: direction === 'left' ? -15 : direction === 'right' ? 15 : 0,
          rotationX: direction === 'up' ? 15 : direction === 'down' ? -15 : 0,
        },
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          rotationY: 0,
          rotationX: 0,
          duration: 1.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: options.trigger || selector,
            start: options.start || "top 75%",
            toggleActions: "play none none reverse",
            markers: options.markers || false,
            onEnter: options.onEnter,
          }
        }
      );
    });
  };

  const morphingText = (
    selector: string,
    options: ScrollAnimationOptions = {}
  ) => {
    if (!contextRef.current) return;

    contextRef.current.add(() => {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach((element) => {
        const text = element.textContent || '';
        element.innerHTML = text
          .split('')
          .map((char, i) => `<span style="display: inline-block; opacity: 0; transform: translateY(50px) rotateX(90deg);">${char === ' ' ? '&nbsp;' : char}</span>`)
          .join('');

        gsap.to(`${selector} span`, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          stagger: 0.02,
          scrollTrigger: {
            trigger: options.trigger || element,
            start: options.start || "top 80%",
            toggleActions: "play none none reverse",
            markers: options.markers || false,
          }
        });
      });
    });
  };

  const elasticScale = (
    selector: string,
    options: ScrollAnimationOptions = {}
  ) => {
    if (!contextRef.current) return;

    contextRef.current.add(() => {
      gsap.fromTo(selector,
        {
          scale: 0,
          rotation: -180,
          opacity: 0,
        },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 1.2,
          ease: "elastic.out(1, 0.5)",
          scrollTrigger: {
            trigger: options.trigger || selector,
            start: options.start || "top 80%",
            toggleActions: "play none none reverse",
            markers: options.markers || false,
            onEnter: options.onEnter,
          }
        }
      );
    });
  };

  return {
    animateOnScroll,
    parallaxEffect,
    staggerAnimation,
    cinematicReveal,
    morphingText,
    elasticScale,
  };
};

export default useScrollAnimations;