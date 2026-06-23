import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ServicesHero from './components/ServicesHero';
import ServicesList from './components/ServicesList';
import CustomSolutionCta from './components/CustomSolutionCta';

export default function Services() {
  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md">
      <Header activePage="services" />
      <main className="flex-grow">
        <ServicesHero />
        <ServicesList />
        <CustomSolutionCta />
      </main>
      <Footer />
    </div>
  );
}
