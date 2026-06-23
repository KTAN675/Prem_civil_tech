import React from 'react';

export default function ProjectsHero() {
  return (
    <section className="relative w-full h-[400px] flex items-center justify-center border-b border-outline-variant overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div 
          className="bg-cover bg-center w-full h-full opacity-40 mix-blend-luminosity" 
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCKTiljbm6qzaTNg1R__w6y-zg0sk49UgGvZiVQGT0Pkc8a0v-5rLEKOHwYb8-2_2AvIk3jrn7t7Gxz4JzxERpHQYMrVm8YAkBy01SQRNHGht1WZ-0HkhUQyKxrh9-edBNAEZ-AYPrdouIiAs71BSvc7tIBVu17P_in_RFyKghnpWu4693IM0bty-0Y_keCWZFRO3aZ8Q5rbiWG9dp_AeAY-iP5Rd7mHfLUD_F1q5XBHk2rnn-L-bDb9xKHYuiXse5WyQmuN1piSg8')" 
          }}
        ></div>
        <div className="absolute inset-0 bg-surface/60"></div>
      </div>
      <div className="relative z-10 text-center px-gutter max-w-max-width mx-auto">
        <h1 className="font-display-lg text-display-lg uppercase text-on-surface tracking-tighter hidden md:block">OUR PROJECTS</h1>
        <h1 class="font-headline-lg-mobile text-headline-lg-mobile uppercase text-on-surface tracking-tighter md:hidden">OUR PROJECTS</h1>
        <div className="h-1 w-24 bg-primary-container mx-auto mt-6"></div>
      </div>
    </section>
  );
}
