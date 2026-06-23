import React from 'react';

export default function AboutHero() {
  return (
    <section className="relative w-full h-[614px] min-h-[400px] flex items-center justify-center overflow-hidden border-b border-outline-variant">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-luminosity" 
        style={{ 
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCNn5aaqBzxt-c7qugleBOcjV-ueGjtH5roBlRLCyiaQ4zGtOED1tykaAl_j2KHGNba5JDR6IcZo2Vnq2ILWYAjla5swycGg9ClVJaFfXDwphDIl7vAEzs8H96jgbnVsZq6GRyOj7iRRD-G6OFneR56jG5wr-_VB2sbyW0lUxxBp6hGn4tMAHJtYdiWHN-svWnHmXwASN3TeLx-vAsTVGmOihCSmgKpZKK5I0HyQx1Xm_q1jmvXrHby5gN6PMUHtDY1BZ2acTdfx5w')" 
        }}
      ></div>
      <div className="absolute inset-0 bg-background/85 z-10"></div>
      <div className="relative z-20 text-center px-gutter max-w-max-width mx-auto">
        <h1 className="font-display-lg text-display-lg text-white mb-base tracking-tight uppercase">About Us</h1>
        <div className="h-1 w-24 bg-primary-container mx-auto"></div>
      </div>
    </section>
  );
}
