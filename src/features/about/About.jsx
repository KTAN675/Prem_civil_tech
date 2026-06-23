import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AboutHero from './components/AboutHero';
import Journey from './components/Journey';
import AboutStats from './components/AboutStats';

export default function About() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
      <Header activePage="about" />
      <main className="flex-grow">
        <AboutHero />
        <Journey />
        <AboutStats />
      </main>
      <Footer />
    </div>
  );
}
