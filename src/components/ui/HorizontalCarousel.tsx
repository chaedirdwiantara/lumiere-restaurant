import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Dish {
  id: number;
  title: string;
  subtitle: string;
  year: string;
  category: string;
  festival: string;
  image: string;
}

interface HorizontalCarouselProps {
  dishes: Dish[];
  className?: string;
}

export const HorizontalCarousel = ({ dishes, className = '' }: HorizontalCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const scrollContainer = scrollContainerRef.current;
    
    if (!container || !scrollContainer) return;

    const ctx = gsap.context(() => {
      // Calculate scroll distance
      const scrollWidth = scrollContainer.scrollWidth - window.innerWidth;
      
      // Horizontal scroll animation
      gsap.to(scrollContainer, {
        x: -scrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${scrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      // Individual card animations
      gsap.from(".dish-card", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });

      // Hover animations for cards
      const cards = container.querySelectorAll('.dish-card');
      cards.forEach((card) => {
        const image = card.querySelector('.dish-image');
        const overlay = card.querySelector('.dish-overlay');
        
        card.addEventListener('mouseenter', () => {
          gsap.to(image, {
            scale: 1.1,
            duration: 0.6,
            ease: "power2.out"
          });
          gsap.to(overlay, {
            opacity: 0.8,
            duration: 0.3,
            ease: "power2.out"
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(image, {
            scale: 1,
            duration: 0.6,
            ease: "power2.out"
          });
          gsap.to(overlay, {
            opacity: 0.4,
            duration: 0.3,
            ease: "power2.out"
          });
        });
      });

    }, container);

    return () => ctx.revert();
  }, [dishes]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-8 lg:px-16 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-light tracking-[0.3em] uppercase text-white/60 mb-4">
              FEATURED COLLECTION
            </p>
            <h2 className="font-display text-display font-extralight text-shadow-cinematic">
              SIGNATURE DISHES
            </h2>
          </div>
          <button 
            data-cursor="hover"
            className="group flex items-center space-x-4 text-sm font-light tracking-[0.2em] uppercase hover:text-cinema-gold transition-colors duration-500"
          >
            <span>VIEW ALL</span>
            <div className="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center group-hover:border-cinema-gold transition-colors duration-500">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Container */}
      <div 
        ref={scrollContainerRef}
        className="flex space-x-8 pl-8 lg:pl-16"
        style={{ width: 'max-content' }}
      >
        {dishes.map((dish, index) => (
          <div
            key={dish.id}
            className="dish-card group cursor-none flex-shrink-0 w-80 lg:w-96"
            data-cursor="hover"
          >
            {/* Card Container */}
            <div className="relative overflow-hidden cinematic-border rounded-lg bg-cinema-charcoal/20 backdrop-blur-sm">
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.title}
                  className="dish-image w-full h-full object-cover"
                />
                <div className="dish-overlay absolute inset-0 bg-gradient-to-t from-cinema-black via-transparent to-transparent opacity-40" />
                
                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-16 h-16 border border-white/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-light tracking-[0.2em] uppercase text-cinema-gold">
                    {dish.subtitle}
                  </span>
                  <span className="text-xs font-light text-white/60">
                    {dish.year}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display text-title font-light mb-3 text-shadow-cinematic">
                  {dish.title}
                </h3>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-light tracking-wide">
                    <span className="text-white/60 uppercase">Category</span>
                    <span className="text-white/80">{dish.category}</span>
                  </div>
                  <div className="flex justify-between text-xs font-light tracking-wide">
                    <span className="text-white/60 uppercase">Festival</span>
                    <span className="text-white/80">{dish.festival}</span>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <button 
                    data-cursor="hover"
                    className="group/btn flex items-center space-x-3 text-xs font-light tracking-[0.2em] uppercase hover:text-cinema-gold transition-colors duration-500"
                  >
                    <span>EXPLORE</span>
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* End Spacer */}
        <div className="w-8 lg:w-16 flex-shrink-0" />
      </div>
    </div>
  );
};