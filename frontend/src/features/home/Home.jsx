import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import Cta from './components/Cta';

export default function Home() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
      <Header activePage="home" />
      <main className="flex-grow">
        <Hero />
        <Stats />
        <Services />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
