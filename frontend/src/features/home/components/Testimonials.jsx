import React, { useEffect, useState } from 'react';

const FALLBACK_TESTIMONIALS = [
  {
    id: 1,
    client_name: 'Rajesh Mehta',
    company: 'Apex Manufacturing / Sector 3',
    rating: 5,
    quote: 'Prem Civil Tech Solutions delivered structural rehabilitation on our RCC plant. Their compliance and precision saved us weeks of downtime. Exceptional engineering standard.',
    avatar_url: null
  },
  {
    id: 2,
    client_name: 'Anjali Sharma',
    company: 'Metro Viaduct Extension',
    rating: 5,
    quote: 'Superb waterproofing and crystalline injection work on our basement tunnels. They resolved massive hydrostatic pressure issues that other contractors couldn\'t touch.',
    avatar_url: null
  },
  {
    id: 3,
    client_name: 'Amit Patel',
    company: 'Skyline Heights Residential',
    rating: 5,
    quote: 'We hired them for a complete structural audit and retrofitting. Their report was exhaustive, and the subsequent repairs were executed with absolute professionalism.',
    avatar_url: null
  }
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5000/api/testimonials')
      .then(res => {
        if (!res.ok) throw new Error('API status not OK');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        }
      })
      .catch(err => {
        console.warn('Could not fetch testimonials from backend, using fallback testimonials:', err.message);
      });
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className="material-symbols-outlined text-lg" 
          style={{ fontVariationSettings: `'FILL' ${i <= rating ? 1 : 0}` }}
        >
          star
        </span>
      );
    }
    return <div className="flex text-primary-container gap-0.5">{stars}</div>;
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (testimonials.length === 0) return null;

  const current = testimonials[activeIndex];

  return (
    <section className="bg-background py-margin-desktop border-b border-outline-variant relative overflow-hidden">
      {/* Decorative Blueprint Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      <div className="max-w-max-width mx-auto px-gutter relative z-10">
        <div className="mb-12 border-b border-outline-variant pb-6">
          <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tighter">Client Endorsements</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-xl">Proven reliability and quality across public and industrial projects.</p>
        </div>

        <div className="relative min-h-[300px] flex items-center justify-center">
          {/* Testimonial Card */}
          <div className="w-full max-w-4xl bg-surface-container border border-outline p-8 md:p-12 shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] flex flex-col justify-between relative group">
            {/* Quote Icon */}
            <span className="material-symbols-outlined absolute top-6 right-6 text-7xl text-surface-container-highest opacity-40 select-none pointer-events-none">
              format_quote
            </span>

            <div className="space-y-6">
              {/* Stars */}
              {renderStars(current.rating || 5)}

              {/* Text */}
              <blockquote className="text-xl md:text-2xl font-medium text-on-surface italic leading-relaxed font-body-lg">
                "{current.quote}"
              </blockquote>

              {/* Client Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-outline-variant">
                {current.avatar_url ? (
                  <img 
                    src={`http://localhost:5000${current.avatar_url}`} 
                    alt={current.client_name} 
                    className="h-12 w-12 object-cover border border-outline-variant rounded-none shrink-0" 
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="h-12 w-12 bg-surface-container-high border border-outline-variant flex items-center justify-center font-label-md text-label-md text-on-surface font-bold shrink-0">
                    {getInitials(current.client_name)}
                  </div>
                )}
                <div>
                  <cite className="font-headline-sm text-headline-sm text-on-surface uppercase not-italic block font-bold">
                    {current.client_name}
                  </cite>
                  <span className="text-sm text-on-surface-variant">
                    {current.company || 'Partner'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {/* Slider Indicators */}
          <div className="flex gap-2">
            {testimonials.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 transition-all duration-300 ${
                  activeIndex === idx ? 'w-8 bg-primary-container' : 'w-2 bg-surface-container-highest hover:bg-outline'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev/Next Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={handlePrev}
              className="w-12 h-12 flex items-center justify-center border border-outline bg-surface-container text-on-surface hover:bg-surface-container-high hover:border-primary-container transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
              aria-label="Previous Testimonial"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button 
              onClick={handleNext}
              className="w-12 h-12 flex items-center justify-center border border-outline bg-surface-container text-on-surface hover:bg-surface-container-high hover:border-primary-container transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
              aria-label="Next Testimonial"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
