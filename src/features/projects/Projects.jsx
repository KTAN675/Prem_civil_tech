import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ProjectsHero from './components/ProjectsHero';
import FilterBar from './components/FilterBar';
import ProjectsGrid from './components/ProjectsGrid';

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col">
      <Header activePage="projects" />
      <main className="flex-grow">
        <ProjectsHero />
        <FilterBar 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <ProjectsGrid activeFilter={activeFilter} searchQuery={searchQuery} />
      </main>
      <Footer />
    </div>
  );
}
