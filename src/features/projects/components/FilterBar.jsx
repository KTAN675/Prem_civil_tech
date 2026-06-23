import React from 'react';

const FILTER_OPTIONS = ['All', 'Completed', 'Ongoing', 'Civil Engineering', 'Commercial', 'Industrial', 'Infrastructure', 'Residential'];

export default function FilterBar({ activeFilter, onFilterChange, searchQuery, onSearchChange }) {
  return (
    <section className="border-b border-outline-variant bg-surface-container-low py-4">
      <div className="max-w-max-width mx-auto px-gutter flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Category Scrollable Area */}
        <div className="overflow-x-auto whitespace-nowrap hide-scrollbar flex-grow">
          <div className="flex space-x-6 items-center">
            {FILTER_OPTIONS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => onFilterChange(filter)}
                  className={`font-title-md text-title-md pb-2 uppercase tracking-wide transition-colors duration-200 ${
                    isActive 
                      ? 'text-primary-container border-b-2 border-primary-container' 
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Field */}
        <div className="relative flex items-center min-w-[280px]">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full bg-surface-container border border-outline-variant text-on-surface pl-10 pr-4 py-2 focus:border-primary-container focus:ring-0 rounded-none transition-colors font-body-md text-sm placeholder:text-surface-variant"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
