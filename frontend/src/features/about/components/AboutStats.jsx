import React from 'react';

export default function AboutStats() {
  return (
    <section className="bg-surface-container-high py-12 border-b border-outline-variant">
      <div className="max-w-max-width mx-auto px-gutter grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-outline-variant">
        <div className="p-4">
          <div className="font-display-lg text-display-lg text-primary-container mb-2">15+</div>
          <div className="font-title-md text-title-md text-on-surface uppercase tracking-widest text-sm">Years Active</div>
        </div>
        <div className="p-4">
          <div className="font-display-lg text-display-lg text-primary-container mb-2">500+</div>
          <div className="font-title-md text-title-md text-on-surface uppercase tracking-widest text-sm">Projects Done</div>
        </div>
        <div className="p-4">
          <div className="font-display-lg text-display-lg text-primary-container mb-2">450+</div>
          <div className="font-title-md text-title-md text-on-surface uppercase tracking-widest text-sm">Happy Clients</div>
        </div>
      </div>
    </section>
  );
}
