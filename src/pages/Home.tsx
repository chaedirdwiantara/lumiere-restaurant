import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Star, Clock, Users } from 'lucide-react';
import { CircularScrollIndicator } from '../components/ui/CircularScrollIndicator';
import { HorizontalCarousel } from '../components/ui/HorizontalCarousel';
import { InteractiveCard } from '../components/ui/InteractiveCard';
import useScrollAnimations from '../hooks/useScrollAnimations';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  
  const {
    animateOnScroll,
    parallaxEffect,
    staggerAnimation,
    cinematicReveal,
    morphingText,
    elasticScale
  } = useScrollAnimations();

  // Mock data for carousel
  const featuredDishes = [
    {
      id: 1,
      title: "TRUFFLE RISOTTO",
      subtitle: "SIGNATURE DISH",
      year: "2024",
      category: "MAIN COURSE",
      festival: "MICHELIN GUIDE",
      image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=luxurious%20truffle%20risotto%20fine%20dining%20cinematic%20dark%20moody%20lighting%20professional%20food%20photography&image_size=portrait_4_3"
    },
    {
      id: 2,
      title: "WAGYU TENDERLOIN",
      subtitle: "CHEF'S SPECIAL",
      year: "2024",
      category: "PREMIUM",
      festival: "JAMES BEARD",
      image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=wagyu%20beef%20tenderloin%20fine%20dining%20elegant%20plating%20dark%20cinematic%20lighting%20luxury%20restaurant&image_size=portrait_4_3"
    },
    {
      id: 3,
      title: "LOBSTER THERMIDOR",
      subtitle: "OCEAN'S FINEST",
      year: "2024",
      category: "SEAFOOD",
      festival: "CULINARY ARTS",
      image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=lobster%20thermidor%20fine%20dining%20elegant%20presentation%20dark%20moody%20cinematic%20lighting%20luxury%20seafood&image_size=portrait_4_3"
    }
  ];

  // Features data
  const features = [
    {
      icon: Clock,
      title: "Timed Perfection",
      description: "Every dish is prepared with precise timing to ensure optimal flavor and temperature."
    },
    {
      icon: Users,
      title: "Intimate Service",
      description: "Personalized attention with a dedicated server for every table throughout your experience."
    },
    {
      icon: Star,
      title: "Award Winning",
      description: "Recognized by Michelin Guide and James Beard Foundation for culinary excellence."
    },
    {
      icon: ArrowRight,
      title: "Seasonal Menu",
      description: "Our menu evolves with the seasons, featuring the finest ingredients at their peak."
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "James Mitchell",
      role: "Food & Wine Magazine",
      content: "An extraordinary culinary journey that redefines fine dining. Every dish is a masterpiece.",
      rating: 5
    },
    {
      name: "Sarah Chen",
      role: "Michelin Guide Inspector",
      content: "Lumière sets the gold standard for innovative cuisine and impeccable service.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Culinary Institute",
      content: "A restaurant that perfectly balances tradition with modern culinary techniques.",
      rating: 5
    }
  ];

  useEffect(() => {
    const heroElement = heroRef.current;
    const heroImage = heroImageRef.current;
    const heroContent = heroContentRef.current;

    if (!heroElement || !heroImage || !heroContent) return;

    const ctx = gsap.context(() => {
      // Hero entrance animation
      const tl = gsap.timeline();
      
      tl.from(heroImage, {
        scale: 1.2,
        duration: 2,
        ease: "power2.out"
      })
      .from(heroContent, {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out"
      }, "-=1");

      // Parallax effect for hero image
      gsap.to(heroImage, {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: heroElement,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

    }, heroElement);

    // Initialize scroll animations
    setTimeout(() => {
      cinematicReveal('.cinematic-reveal', 'up');
      staggerAnimation('.stagger-item', {}, 0.1);
      morphingText('.morphing-text');
      elasticScale('.elastic-scale');
      parallaxEffect('.parallax-element', 0.5);
    }, 100);

    return () => ctx.revert();
  }, [cinematicReveal, staggerAnimation, morphingText, elasticScale, parallaxEffect]);

  return (
    <div className="min-h-screen bg-cinema-black text-white overflow-hidden">
      <CircularScrollIndicator />
      
      {/* Hero Section - Asymmetrical Layout */}
      <section ref={heroRef} className="relative min-h-screen flex items-center">
        {/* Background Image with Parallax */}
        <div 
          ref={heroImageRef}
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
        >
          <img
            src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20dark%20atmospheric%20fine%20dining%20restaurant%20interior%20moody%20lighting%20sophisticated%20ambiance%20film%20noir%20style&image_size=landscape_16_9"
            alt="Cinematic restaurant interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-black via-cinema-black/80 to-transparent" />
        </div>

        {/* Asymmetrical Content Layout */}
        <div ref={heroContentRef} className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-12 gap-8 items-center min-h-screen">
            
            {/* Left Column - Main Content */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-6">
              {/* Year Badge */}
              <div className="mb-8 cinematic-reveal">
                <span className="text-cinema-gold text-sm font-light tracking-[0.3em] uppercase">
                  2024
                </span>
              </div>

              {/* Award Badge */}
              <div className="mb-12 cinematic-reveal">
                <div className="inline-flex items-center justify-center w-16 h-16 border border-white/20 rounded-full mb-4">
                  <span className="text-xs font-light tracking-wider">JFF</span>
                </div>
                <div className="text-xs font-light tracking-[0.2em] uppercase text-white/60">
                  BEST CULINARY &<br />
                  DINING EXPERIENCE<br />
                  AWARD
                </div>
              </div>

              {/* Main Title */}
              <h1 
                className="font-display text-hero font-extralight mb-8 text-shadow-cinematic morphing-text"
              >
                LUMIÈRE
              </h1>

              {/* Subtitle */}
              <p 
                className="text-lg font-light tracking-wide mb-12 max-w-md leading-relaxed text-white/80 cinematic-reveal"
              >
                CULINARY ARTISTRY MEETS<br />
                CINEMATIC ELEGANCE
              </p>

              {/* Action Button */}
              <button 
                data-cursor="hover"
                className="group flex items-center space-x-4 text-sm font-light tracking-[0.2em] uppercase hover:text-cinema-gold transition-colors duration-500 stagger-item"
              >
                <span>EXPLORE</span>
                <div className="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center group-hover:border-cinema-gold transition-colors duration-500">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Right Column - Reviews */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-6 lg:pl-16">
              <div className="space-y-8">
                {[
                  { source: "MICHELIN GUIDE", text: "EXCEPTIONAL CULINARY JOURNEY", stars: 5 },
                  { source: "JAMES BEARD FOUNDATION", text: "ARTISTRY THROUGH CUISINE", stars: 5 },
                  { source: "WORLD'S 50 BEST", text: "REDEFINING FINE DINING", stars: 5 }
                ].map((review, index) => (
                  <div key={index} className="border-l border-white/10 pl-6 stagger-item">
                    <div className="flex mb-2">
                      {[...Array(review.stars)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-cinema-gold fill-current" />
                      ))}
                    </div>
                    <p className="text-xs font-light tracking-[0.15em] uppercase text-white/60 mb-2">
                      {review.source}
                    </p>
                    <p className="text-sm font-light tracking-wide text-white/80">
                      "{review.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with Interactive Cards */}
      <section className="py-32 bg-gradient-to-b from-cinema-charcoal/30 to-cinema-black">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          {/* Section Header */}
          <div className="text-center mb-20 cinematic-reveal">
            <p className="text-xs font-light tracking-[0.3em] uppercase text-cinema-gold mb-6">
              OUR PHILOSOPHY
            </p>
            <h2 className="font-display text-display font-extralight mb-8 text-shadow-cinematic morphing-text">
              CULINARY
              <br />
              <span className="text-cinema-gold">EXCELLENCE</span>
            </h2>
            <p className="text-lg font-light text-white/80 max-w-2xl mx-auto leading-relaxed">
              At Lumière, we believe that dining is an art form. Each dish is meticulously crafted 
              to tell a story, evoke emotions, and create lasting memories.
            </p>
          </div>

          {/* Interactive Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <InteractiveCard
              title="Master Chef"
              subtitle="CULINARY ARTISTRY"
              description="Our head chef brings 15+ years of Michelin-starred experience, crafting each dish with precision and passion that defines our culinary philosophy."
              image="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=master%20chef%20in%20luxury%20kitchen%20cinematic%20lighting%20professional%20culinary%20artistry%20fine%20dining%20restaurant&image_size=portrait_4_3"
              category="EXPERTISE"
              className="stagger-item"
            />
            
            <InteractiveCard
              title="Premium Ingredients"
              subtitle="SOURCED GLOBALLY"
              description="We source only the finest ingredients from around the world, ensuring each component meets our exacting standards for quality and flavor."
              image="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20ingredients%20luxury%20food%20sourcing%20fine%20dining%20quality%20artisanal%20products%20cinematic%20lighting&image_size=portrait_4_3"
              category="QUALITY"
              className="stagger-item"
            />
            
            <InteractiveCard
              title="Elegant Atmosphere"
              subtitle="REFINED AMBIANCE"
              description="Our carefully curated environment combines sophisticated design with intimate lighting to create the perfect backdrop for your dining experience."
              image="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20fine%20dining%20restaurant%20interior%20sophisticated%20ambiance%20luxury%20atmosphere%20cinematic%20lighting&image_size=portrait_4_3"
              category="AMBIANCE"
              className="stagger-item"
            />
          </div>

          {/* Statistics */}
          <div className="flex flex-wrap justify-center items-center space-x-8 space-y-4 lg:space-y-0">
            <div className="text-center elastic-scale">
              <div className="text-4xl font-display font-light text-cinema-gold mb-2">15+</div>
              <div className="text-xs font-light tracking-[0.2em] uppercase text-white/60">Years Experience</div>
            </div>
            <div className="w-px h-16 bg-white/20 hidden lg:block" />
            <div className="text-center elastic-scale">
              <div className="text-4xl font-display font-light text-cinema-gold mb-2">3</div>
              <div className="text-xs font-light tracking-[0.2em] uppercase text-white/60">Michelin Stars</div>
            </div>
            <div className="w-px h-16 bg-white/20 hidden lg:block" />
            <div className="text-center elastic-scale">
              <div className="text-4xl font-display font-light text-cinema-gold mb-2">50+</div>
              <div className="text-xs font-light tracking-[0.2em] uppercase text-white/60">Awards Won</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-cinema-charcoal/20 to-cinema-black">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="text-center mb-20 cinematic-reveal">
            <p className="text-xs font-light tracking-[0.3em] uppercase text-cinema-gold mb-6">
              THE EXPERIENCE
            </p>
            <h2 className="font-display text-display font-extralight mb-8 text-shadow-cinematic morphing-text">
              LUMIÈRE
              <br />
              <span className="text-cinema-gold">EXPERIENCE</span>
            </h2>
            <p className="text-lg font-light text-white/80 max-w-2xl mx-auto leading-relaxed">
              Every detail is carefully curated to provide an exceptional dining experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group stagger-item"
                data-cursor="hover"
              >
                <div className="w-16 h-16 bg-cinema-gold/10 border border-cinema-gold/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-cinema-gold/20 group-hover:border-cinema-gold transition-all duration-500">
                  <feature.icon className="w-8 h-8 text-cinema-gold" />
                </div>
                <h3 className="font-display text-xl font-light mb-4 text-shadow-cinematic">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes Horizontal Carousel */}
      <section className="py-32 bg-gradient-to-b from-cinema-black to-cinema-charcoal/50">
        <HorizontalCarousel dishes={featuredDishes} className="cinematic-reveal" />
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-b from-cinema-black to-cinema-charcoal/30">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="text-center mb-20 cinematic-reveal">
            <p className="text-xs font-light tracking-[0.3em] uppercase text-cinema-gold mb-6">
              CRITICAL ACCLAIM
            </p>
            <h2 className="font-display text-display font-extralight mb-8 text-shadow-cinematic morphing-text">
              WHAT CRITICS
              <br />
              <span className="text-cinema-gold">SAY</span>
            </h2>
            <p className="text-lg font-light text-white/80 max-w-2xl mx-auto leading-relaxed">
              Recognition from culinary experts and food critics worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-cinema-charcoal/20 backdrop-blur-sm p-8 rounded-lg cinematic-border stagger-item"
                data-cursor="hover"
              >
                <div className="flex mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-cinema-gold fill-current" />
                  ))}
                </div>
                <p className="text-white/80 mb-6 leading-relaxed font-light italic text-lg">
                  "{testimonial.content}"
                </p>
                <div className="border-t border-white/10 pt-4">
                  <p className="font-display font-light text-white text-lg">{testimonial.name}</p>
                  <p className="text-cinema-gold text-xs font-light tracking-[0.2em] uppercase">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-b from-cinema-charcoal/50 to-cinema-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-gold/5 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center relative z-10">
          <div className="cinematic-reveal">
            <p className="text-xs font-light tracking-[0.3em] uppercase text-cinema-gold mb-6">
              CULINARY EXCELLENCE
            </p>
            <h2 className="font-display text-display font-extralight mb-8 text-shadow-cinematic morphing-text">
              EXPERIENCE
              <br />
              <span className="text-cinema-gold">PERFECTION</span>
            </h2>
            <p className="text-lg font-light text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Reserve your table today and embark on an unforgettable gastronomic journey
            </p>
            <button
              className="group relative bg-cinema-gold text-cinema-black px-12 py-4 rounded-sm font-light text-lg tracking-[0.1em] uppercase transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-cinema-gold/20"
              data-cursor="hover"
            >
              <span className="relative z-10">Make a Reservation</span>
              <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;