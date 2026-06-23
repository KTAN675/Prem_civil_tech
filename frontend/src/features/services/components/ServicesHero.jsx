import React from 'react';

export default function ServicesHero() {
  return (
    <section className="relative w-full h-[400px] flex items-center justify-center border-b border-[#333333] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity" 
        style={{ 
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBt7T6J694HAFiBXBgkm4DC82E6QZWydVKk9QbkwXzJvWW0W_YkpyOdCToUrB24s1r1TesGgpcvukGOAK1HeBq1i-xtb7SGRxzrCtTOR0EpaVpNgFuY6YxUnrup8wNC465kcOn0qNVGhtrVyimniaUifoMysWe6RDpsG2Qh05e1VA0P9QBh1zHKQsSMjHnEi9V9Rk-k-HWxacDl5lVZfXsuKkh4QPD-zpfsgTKrgUBMdRuvjtPuzxdS044gWsXveK7ZNxodBROc0WQ')" 
        }}
      ></div>
      <div className="absolute inset-0 bg-surface/80"></div>
      <div className="relative z-10 text-center px-gutter">
        <h1 className="font-display-lg text-display-lg md:text-[72px] md:leading-[80px] text-primary-container uppercase tracking-tight">OUR SERVICES</h1>
        <div className="w-24 h-2 bg-primary-container mx-auto mt-6"></div>
      </div>
    </section>
  );
}
