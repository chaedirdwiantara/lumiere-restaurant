import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

interface GalleryImage {
  id: string
  title: string
  imageUrl: string
  category: string
  description?: string
}

interface ElegantGalleryProps {
  images?: GalleryImage[]
  onImageSelect?: (image: GalleryImage) => void
}

const ElegantGallery: React.FC<ElegantGalleryProps> = ({ 
  images = defaultImages, 
  onImageSelect 
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)
  const [scrollDirection, setScrollDirection] = useState(1) // 1 for right, -1 for left

  // Add missing refs
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const scrollDirectionRef = useRef(1) // 1 for right, -1 for left

  // Simple auto-scroll using setInterval
  const startAutoScroll = () => {
    if (autoScrollIntervalRef.current || isDragging || isHovering) return;
    
    console.log('Starting auto-scroll...');
    console.log('Container dimensions:', {
      scrollWidth: scrollContainerRef.current?.scrollWidth,
      clientWidth: scrollContainerRef.current?.clientWidth,
      scrollLeft: scrollContainerRef.current?.scrollLeft
    });
    
    setIsAutoScrolling(true);
    
    autoScrollIntervalRef.current = setInterval(() => {
      if (!scrollContainerRef.current || isDragging || isHovering) return;
      
      const container = scrollContainerRef.current;
      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const scrollSpeed = 1.25; // 50% of current speed (2.5px -> 1.25px) for very subtle luxury effect
      
      console.log('Auto-scroll update:', {
        currentScroll,
        maxScroll,
        direction: scrollDirectionRef.current,
        scrollSpeed
      });
      
      let newScrollPosition;
      
      if (scrollDirectionRef.current === 1) {
        // Scrolling right
        newScrollPosition = currentScroll + scrollSpeed;
        if (newScrollPosition >= maxScroll) {
          newScrollPosition = maxScroll;
          scrollDirectionRef.current = -1; // Change direction to left
          console.log('Reached right end, changing direction to left');
        }
      } else {
        // Scrolling left
        newScrollPosition = currentScroll - scrollSpeed;
        if (newScrollPosition <= 0) {
          newScrollPosition = 0;
          scrollDirectionRef.current = 1; // Change direction to right
          console.log('Reached left end, changing direction to right');
        }
      }
      
      container.scrollLeft = newScrollPosition;
      console.log('Scrolled to:', newScrollPosition);
    }, 30); // Back to 30ms interval for smooth movement
  }

  const stopAutoScroll = () => {
    console.log('Stopping auto-scroll')
    setIsAutoScrolling(false)
    
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
      autoScrollIntervalRef.current = null
    }
  }

  useEffect(() => {
    const container = containerRef.current
    const scrollContainer = scrollContainerRef.current
    
    console.log('Component mounted, refs:', {
      container: !!container,
      scrollContainer: !!scrollContainer
    })
    
    if (!container || !scrollContainer) {
      console.log('Missing refs, cannot initialize')
      return
    }

    // Entrance animation
    const tl = gsap.timeline()
    
    // Fade in container
    tl.fromTo(container, 
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: "power2.out" }
    )

    // Animate images with stagger
    tl.fromTo('.gallery-image', 
      { 
        opacity: 0, 
        y: 60,
        scale: 0.9
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: 1.4,
        stagger: 0.08,
        ease: "power3.out"
      }, 
      0.3
    )

    // Animate title
    tl.fromTo('.gallery-title',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
      0.6
    )

    // Start auto-scroll after entrance animation completes
    tl.call(() => {
      console.log('Entrance animation complete, starting auto-scroll in 3 seconds')
      setTimeout(() => {
        startAutoScroll()
      }, 3000) // Start after 3 seconds to make it very visible
    })

    return () => {
      console.log('Component unmounting, cleaning up')
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      stopAutoScroll()
    }
  }, [])

  // Restart auto-scroll when interaction states change
  useEffect(() => {
    console.log('Interaction state changed:', { isDragging, isHovering })
    
    if (!isDragging && !isHovering) {
      // Delay restart to avoid jarring transitions
      const timer = setTimeout(() => {
        console.log('Restarting auto-scroll after interaction')
        startAutoScroll()
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      stopAutoScroll()
    }
  }, [isDragging, isHovering])

  const handleMouseEnter = () => {
    console.log('Mouse entered gallery')
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    console.log('Mouse left gallery')
    setIsHovering(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    
    console.log('Mouse down - starting drag')
    setIsDragging(true)
    setDragStart({
      x: e.pageX,
      scrollLeft: scrollContainerRef.current.scrollLeft
    })
    
    // Add dragging cursor
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    
    e.preventDefault()
    const x = e.pageX
    const walk = (x - dragStart.x) * 2 // Scroll speed multiplier
    
    gsap.to(scrollContainerRef.current, {
      scrollLeft: dragStart.scrollLeft - walk,
      duration: 0.1,
      ease: "power2.out"
    })
  }

  const handleMouseUp = () => {
    console.log('Mouse up - ending drag')
    setIsDragging(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  const handleImageHover = (index: number, isEntering: boolean) => {
    const image = document.querySelector(`.gallery-image-${index}`)
    const overlay = document.querySelector(`.gallery-overlay-${index}`)
    const info = document.querySelector(`.gallery-info-${index}`)
    
    if (!image || !overlay || !info) return

    if (isEntering) {
      gsap.to(image, {
        scale: 1.05,
        duration: 0.8,
        ease: "power2.out"
      })
      gsap.to(overlay, {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      })
      gsap.to(info, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      })
    } else {
      gsap.to(image, {
        scale: 1,
        duration: 0.8,
        ease: "power2.out"
      })
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out"
      })
      gsap.to(info, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out"
      })
    }
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.03)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(251,191,36,0.02)_49%,rgba(251,191,36,0.02)_51%,transparent_52%)]" />
      
      {/* Title */}
      <div className="gallery-title absolute top-12 left-12 z-10">
        <h1 className="text-6xl font-light text-white tracking-wider">
          Culinary
          <span className="block text-amber-400 font-extralight italic">Excellence</span>
        </h1>
        <div className="w-24 h-px bg-gradient-to-r from-amber-400 to-transparent mt-6" />
      </div>

      {/* Gallery Container */}
      <div className="absolute inset-0 flex items-center">
        <div 
          ref={scrollContainerRef}
          className="flex gap-8 px-12 py-20 overflow-x-auto scrollbar-hide cursor-grab"
          style={{ 
            scrollBehavior: isDragging ? 'auto' : 'smooth',
            paddingLeft: '20vw',
            width: '100%',
            minWidth: '100vw',
            // Ensure enough total width for scrolling
            minHeight: '480px'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`gallery-image gallery-image-${index} relative flex-shrink-0 group`}
              style={{
                width: '320px',
                height: '480px',
                // Ensure images don't shrink and maintain proper width
                minWidth: '320px',
                flexShrink: 0
              }}
              onMouseEnter={() => handleImageHover(index, true)}
              onMouseLeave={() => handleImageHover(index, false)}
            >
              {/* Image */}
              <div className="relative w-full h-full overflow-hidden rounded-lg shadow-2xl">
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-full object-cover transition-all duration-700"
                  draggable={false}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Hover Overlay */}
                <div 
                  className={`gallery-overlay gallery-overlay-${index} absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0`}
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 text-xs font-light tracking-widest uppercase bg-amber-400/90 text-black rounded-full backdrop-blur-sm">
                    {image.category}
                  </span>
                </div>
                
                {/* Image Info */}
                <div 
                  className={`gallery-info gallery-info-${index} absolute bottom-0 left-0 right-0 p-6 opacity-0 transform translate-y-5`}
                >
                  <h3 className="text-xl font-light text-white mb-2 tracking-wide">
                    {image.title}
                  </h3>
                  {image.description && (
                    <p className="text-sm text-gray-300 font-light leading-relaxed">
                      {image.description}
                    </p>
                  )}
                  <div className="w-12 h-px bg-amber-400 mt-4" />
                </div>
              </div>
              
              {/* Elegant Border */}
              <div className="absolute inset-0 rounded-lg border border-white/10 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-12 text-white/60 text-sm font-light tracking-wider">
        {isDragging ? 'Dragging...' : isHovering ? 'Hover to pause' : isAutoScrolling ? 'Auto-scrolling...' : 'Ready to scroll'}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-12 right-12 flex gap-2">
        {Array.from({ length: Math.ceil(images.length / 3) }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              Math.floor(currentIndex / 3) === index 
                ? 'bg-amber-400' 
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Premium restaurant/culinary images
const defaultImages: GalleryImage[] = [
  {
    id: '1',
    title: 'Michelin Star Cuisine',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1200&fit=crop&auto=format',
    category: 'Fine Dining',
    description: 'Exquisite culinary artistry that defines modern gastronomy'
  },
  {
    id: '2',
    title: 'Master Chef Portrait',
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=1200&fit=crop&auto=format',
    category: 'Chef',
    description: 'The artisan behind extraordinary culinary experiences'
  },
  {
    id: '3',
    title: 'Elegant Dining Room',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=1200&fit=crop&auto=format',
    category: 'Interior',
    description: 'Sophisticated ambiance that complements exceptional cuisine'
  },
  {
    id: '4',
    title: 'Gourmet Presentation',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=1200&fit=crop&auto=format',
    category: 'Cuisine',
    description: 'Where culinary art meets visual perfection'
  },
  {
    id: '5',
    title: 'Premium Wine Collection',
    imageUrl: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&h=1200&fit=crop&auto=format',
    category: 'Wine',
    description: 'Curated selections from the world\'s finest vineyards'
  },
  {
    id: '6',
    title: 'Luxury Bar Setup',
    imageUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&h=1200&fit=crop&auto=format',
    category: 'Bar',
    description: 'Crafted cocktails in an atmosphere of refined elegance'
  },
  {
    id: '7',
    title: 'Artisan Ingredients',
    imageUrl: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=1200&fit=crop&auto=format',
    category: 'Ingredients',
    description: 'The finest ingredients sourced from around the world'
  },
  {
    id: '8',
    title: 'Premium Steakhouse',
    imageUrl: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&h=1200&fit=crop&auto=format',
    category: 'Steakhouse',
    description: 'Prime cuts prepared to absolute perfection'
  },
  {
    id: '9',
    title: 'Culinary Artistry',
    imageUrl: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&h=1200&fit=crop&auto=format',
    category: 'Art',
    description: 'Where technique meets creativity in perfect harmony'
  },
  {
    id: '10',
    title: 'Wine Cellar Collection',
    imageUrl: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=1200&fit=crop&auto=format',
    category: 'Cellar',
    description: 'Vintage treasures aged to perfection'
  },
  {
    id: '11',
    title: 'Executive Chef',
    imageUrl: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&h=1200&fit=crop&auto=format',
    category: 'Professional',
    description: 'Leadership and passion in every culinary creation'
  },
  {
    id: '12',
    title: 'Modern Restaurant Design',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=1200&fit=crop&auto=format',
    category: 'Design',
    description: 'Contemporary elegance meets timeless sophistication'
  }
]

export default ElegantGallery