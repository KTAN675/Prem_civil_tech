import React from 'react';

export default function Stats() {
  return (
    <section className="bg-surface-container-lowest border-b border-outline-variant">
      <div className="max-w-max-width mx-auto px-gutter py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
          <div className="flex flex-col items-center justify-center text-center px-4">
            <span className="material-symbols-outlined text-primary-container text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
              calendar_month
            </span>
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tighter">15+</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-2">Years of Experience</div>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4 pt-8 md:pt-0">
            <span className="material-symbols-outlined text-primary-container text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
              architecture
            </span>
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tighter">500+</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-2">Projects Completed</div>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4 pt-8 md:pt-0">
            <span className="material-symbols-outlined text-primary-container text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
              handshake
            </span>
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tighter">450+</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-2">Happy Clients</div>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4 pt-8 md:pt-0">
            <span className="material-symbols-outlined text-primary-container text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
              groups
            </span>
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tighter">50+</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-2">Team Members</div>
          </div>
        </div>
      </div>
    </section>
  );
}
