import React, { useEffect, useState } from 'react';

const FALLBACK_SERVICES = [
  {
    id: 1,
    title: 'Structural Audit',
    description: 'Comprehensive assessment of building integrity. Identifying vulnerabilities and ensuring structural stability through rigorous engineering analysis.',
    icon: 'architecture'
  },
  {
    id: 2,
    title: 'Building Repairs',
    description: 'Expert intervention for damaged structures. We implement robust repair methodologies to restore strength and extend the lifespan of existing infrastructure.',
    icon: 'construction'
  },
  {
    id: 3,
    title: 'Waterproofing',
    description: 'Advanced moisture protection systems. Preventing structural degradation caused by water ingress using industrial-grade sealing compounds and barriers.',
    icon: 'water_drop'
  },
  {
    id: 4,
    title: 'RCC Repairs',
    description: 'Specialized reinforced concrete cement restoration. Addressing spalling, corrosion, and internal structural decay to ensure safety and compliance.',
    icon: 'foundation'
  },
  {
    id: 5,
    title: 'Consultancy',
    description: 'Strategic engineering guidance. Providing technical expertise, project feasibility analysis, and regulatory compliance consulting for complex civil projects.',
    icon: 'engineering'
  },
  {
    id: 6,
    title: 'Renovation',
    description: 'Structural and aesthetic overhauls. Modernizing industrial and commercial facilities while maintaining foundational integrity and operational safety.',
    icon: 'format_paint'
  }
];

export default function ServicesList() {
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
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
    <section className="py-margin-desktop px-gutter max-w-max-width mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => {
          const numStr = String(index + 1).padStart(2, '0');
          // Map database seeded icons to matched layout icons if they differ
          let iconName = service.icon || 'engineering';
          if (iconName === 'plumbing') iconName = 'architecture'; // matching the HTML designs
          if (iconName === 'precision_manufacturing') iconName = 'engineering';

          return (
            <div 
              key={service.id || index}
              className="bg-surface-container-low border border-[#333333] p-8 flex flex-col h-full group hover:bg-surface-container-high transition-colors duration-300 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 font-display-lg text-4xl text-surface-variant opacity-30 select-none font-bold">
                {numStr}
              </div>
              <div className="mb-6">
                <span className="material-symbols-outlined text-[48px] text-primary-container" style={{ fontVariationSettings: "'FILL' 0" }}>
                  {iconName}
                </span>
              </div>
              <h3 className="font-title-md text-title-md text-on-surface mb-4 uppercase">
                {service.title}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8 flex-grow">
                {service.description}
              </p>
              <a className="inline-flex items-center text-primary-container font-label-sm text-label-sm uppercase group-hover:text-surface-tint transition-colors" href="#quote-request">
                Learn More <span className="material-symbols-outlined ml-2 text-[16px]">arrow_forward</span>
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
