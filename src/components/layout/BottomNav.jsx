import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const getTabClass = (path) => {
    const isActive = location.pathname === path;
    return {
      link: `flex flex-col items-center justify-center flex-1 py-2 relative transition-all duration-200 ${
        isActive ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface'
      }`,
      icon: `material-symbols-outlined text-2xl mb-1 transition-transform duration-200 ${
        isActive ? 'scale-110' : ''
      }`,
      label: `font-label-sm text-[11px] uppercase tracking-wider ${
        isActive ? 'font-bold' : 'font-medium'
      }`
    };
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center w-full max-w-md mx-auto px-4">
        {/* Home Tab */}
        <Link to="/" className={getTabClass('/').link}>
          {location.pathname === '/' && (
            <div className="absolute top-0 w-12 h-[2px] bg-primary-container" />
          )}
          <span className={getTabClass('/').icon}>home</span>
          <span className={getTabClass('/').label}>Home</span>
        </Link>

        {/* Services Tab */}
        <Link to="/services" className={getTabClass('/services').link}>
          {location.pathname === '/services' && (
            <div className="absolute top-0 w-12 h-[2px] bg-primary-container" />
          )}
          <span className={getTabClass('/services').icon}>architecture</span>
          <span className={getTabClass('/services').label}>Services</span>
        </Link>

        {/* Projects Tab */}
        <Link to="/projects" className={getTabClass('/projects').link}>
          {location.pathname === '/projects' && (
            <div className="absolute top-0 w-12 h-[2px] bg-primary-container" />
          )}
          <span className={getTabClass('/projects').icon}>domain</span>
          <span className={getTabClass('/projects').label}>Projects</span>
        </Link>

        {/* Contact Tab */}
        <Link to="/contact" className={getTabClass('/contact').link}>
          {location.pathname === '/contact' && (
            <div className="absolute top-0 w-12 h-[2px] bg-primary-container" />
          )}
          <span className={getTabClass('/contact').icon}>mail</span>
          <span className={getTabClass('/contact').label}>Contact</span>
        </Link>
      </div>
    </div>
  );
}
