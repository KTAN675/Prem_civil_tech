import React, { useEffect, useState } from 'react';

const FALLBACK_SERVICES = [
  {
    id: 1,
    title: 'Structural Audit',
    description: 'Comprehensive evaluation of building stability, identifying structural weaknesses and recommending precise engineering interventions.',
    icon: 'plumbing'
  },
  {
    id: 2,
    title: 'Building Repairs',
    description: 'High-grade concrete and masonry rehabilitation restoring structural integrity and extending the lifespan of critical assets.',
    icon: 'foundation'
  },
  {
    id: 3,
    title: 'Waterproofing',
    description: 'Advanced elastomeric and crystalline waterproofing systems designed to withstand extreme hydrostatic pressure in industrial facilities.',
    icon: 'water_drop'
  },
  {
    id: 4,
    title: 'RCC Repairs',
    description: 'Specialized reinforced cement concrete repairs addressing corrosion and spalling with high-strength polymer-modified mortars.',
    icon: 'construction'
  },
  {
    id: 5,
    title: 'Consultancy',
    description: 'Expert advisory services for project management, risk mitigation, and compliance with stringent civil engineering standards.',
    icon: 'precision_manufacturing'
  },
  {
    id: 6,
    title: 'Renovation',
    description: 'Strategic structural upgrades and retrofitting to modernize aging infrastructure while minimizing operational downtime.',
    icon: 'format_paint'
  }
];

export default function Services() {
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/services')
      .then(res => {
        if (!res.ok) throw new Error('API status not OK');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn('Could not fetch services from backend, using default static data:', err.message);
        setLoading(false);
      });
  }, []);

  return (
    <section className="bg-surface py-margin-desktop border-b border-outline-variant">
      <div className="max-w-max-width mx-auto px-gutter">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant pb-6">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tighter">Core Competencies</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-xl">Engineered solutions for complex structural challenges.</p>
          </div>
          <button className="text-primary-container hover:text-primary transition-colors flex items-center gap-2 font-title-md text-title-md border border-primary-container px-6 py-2 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
            All Services <span className="material-symbols-outlined">arrow_outward</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const numStr = String(index + 1).padStart(2, '0');
            return (
              <div 
                key={service.id || index}
                className="bg-surface-container border border-outline hover:border-primary-container transition-colors group relative overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-0 right-0 font-display-lg text-display-lg text-surface-container-highest font-bold leading-none -mt-4 -mr-4 select-none opacity-50">
                  {numStr}
                </div>
                <div className="p-8 flex-grow flex flex-col relative z-10">
                  <span className="material-symbols-outlined text-primary-container text-4xl mb-6">
                    {service.icon || 'engineering'}
                  </span>
                  <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface uppercase mb-4 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-auto">
                    {service.description}
                  </p>
                </div>
                <div className="h-1 w-full bg-surface-container-highest group-hover:bg-primary-container transition-colors mt-auto"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
