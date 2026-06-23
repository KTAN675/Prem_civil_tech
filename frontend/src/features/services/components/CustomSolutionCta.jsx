import React from 'react';
import { Link } from 'react-router-dom';

export default function CustomSolutionCta() {
  return (
    <section className="border-y border-primary-container hazard-stripes py-margin-desktop px-gutter relative">
      <div className="absolute inset-0 bg-surface/90 backdrop-blur-sm"></div>
      <div className="relative z-10 max-w-max-width mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase mb-2">Need a custom solution?</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Our engineering team is ready to analyze your specific requirements.</p>
        </div>
        <Link 
          to="/get-quote" 
          className="bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase px-8 py-4 border border-[#333333] hard-shadow hover:bg-surface-tint hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.4)] transition-all duration-200"
        >
          Get a Quote Now
        </Link>
      </div>
    </section>
  );
}
