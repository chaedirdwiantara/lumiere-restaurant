import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Star } from 'lucide-react';

interface InteractiveCardProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  rating?: number;
  price?: string;
  category?: string;
  className?: string;
  onClick?: () => void;
}

export const InteractiveCard = ({
  title,
  subtitle,
  description,
  image,
  rating,
  price,
  category,
  className = '',
  onClick
}: InteractiveCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const imageEl = imageRef.current;
    const overlay = overlayRef.current;
    const content = contentRef.current;

    if (!card || !imageEl || !overlay || !content) return;

    const ctx = gsap.context(() => {
      // Initial state
      gsap.set(content, { y: 20, opacity: 0 });

      // Hover animations
      const handleMouseEnter = () => {
        const tl = gsap.timeline();
        
        tl.to(imageEl, {
          scale: 1.15,
          duration: 0.8,
          ease: "power2.out"
        })
        .to(overlay, {
          opacity: 0.7,
          duration: 0.4,
          ease: "power2.out"
        }, 0)
        .to(content, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out"
        }, 0.2)
        .to(card, {
          y: -8,
          duration: 0.6,
          ease: "power2.out"
        }, 0);
      };

      const handleMouseLeave = () => {
        const tl = gsap.timeline();
        
        tl.to(imageEl, {
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        })
        .to(overlay, {
          opacity: 0.3,
          duration: 0.4,
          ease: "power2.out"
        }, 0)
        .to(content, {
          y: 20,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in"
        }, 0)
        .to(card, {
          y: 0,
          duration: 0.6,
          ease: "power2.out"
        }, 0);
      };

      // Mouse move parallax effect
      const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * 0.02;
        const deltaY = (e.clientY - centerY) * 0.02;

        gsap.to(imageEl, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: "power2.out"
        });
      };

      // Click animation
      const handleClick = () => {
        gsap.to(card, {
          scale: 0.98,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
          onComplete: () => onClick?.()
        });
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
      card.addEventListener('mousemove', handleMouseMove);
      if (onClick) card.addEventListener('click', handleClick);

      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
        card.removeEventListener('mousemove', handleMouseMove);
        if (onClick) card.removeEventListener('click', handleClick);
      };
    }, card);

    return () => ctx.revert();
  }, [onClick]);

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden cinematic-border rounded-lg bg-cinema-charcoal/10 backdrop-blur-sm cursor-none ${className}`}
      data-cursor="hover"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          ref={imageRef}
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/50 to-transparent opacity-30"
        />

        {/* Category Badge */}
        {category && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-light tracking-[0.2em] uppercase bg-cinema-gold/90 text-cinema-black rounded-full backdrop-blur-sm">
              {category}
            </span>
          </div>
        )}

        {/* Rating */}
        {rating && (
          <div className="absolute top-4 right-4 flex items-center space-x-1 bg-cinema-black/60 px-2 py-1 rounded-full backdrop-blur-sm">
            <Star className="w-3 h-3 fill-cinema-gold text-cinema-gold" />
            <span className="text-xs font-light text-white">{rating}</span>
          </div>
        )}

        {/* Hover Content */}
        <div
          ref={contentRef}
          className="absolute inset-0 flex flex-col justify-end p-6"
        >
          <div className="space-y-3">
            <div>
              <p className="text-xs font-light tracking-[0.2em] uppercase text-cinema-gold mb-1">
                {subtitle}
              </p>
              <h3 className="font-display text-lg font-light text-shadow-cinematic">
                {title}
              </h3>
            </div>
            
            <p className="text-sm font-light text-white/80 leading-relaxed line-clamp-3">
              {description}
            </p>

            <div className="flex items-center justify-between pt-2">
              {price && (
                <span className="font-display text-lg font-light text-cinema-gold">
                  {price}
                </span>
              )}
              
              <button 
                data-cursor="hover"
                className="flex items-center space-x-2 text-xs font-light tracking-[0.2em] uppercase hover:text-cinema-gold transition-colors duration-300"
              >
                <span>EXPLORE</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Content (Always Visible) */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display text-sm font-light mb-1">{title}</h4>
            <p className="text-xs text-white/60 tracking-wide">{subtitle}</p>
          </div>
          
          {price && (
            <span className="text-sm font-light text-cinema-gold">
              {price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};