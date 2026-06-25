import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header({ activePage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'PREM CIVIL TECH SOLUTION',
    logoUrl: ''
  });

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.companyName) {
          setSettings({
            companyName: data.companyName,
            logoUrl: data.logoUrl || ''
          });
          setLogoFailed(false);
        }
      })
      .catch(err => console.error('Error loading settings in Header:', err));
  }, []);

  const getLinkClass = (pageName) => {
    const baseClass = "transition-colors duration-200 font-title-md text-title-md pb-1";
    if (activePage === pageName) {
      return `${baseClass} text-primary font-bold border-b-2 border-primary`;
    }
    return `${baseClass} text-on-surface hover:text-primary-container`;
  };

  const getMobileLinkClass = (pageName) => {
    const baseClass = "flex items-center gap-4 py-3 border-b border-outline-variant/30 text-xl transition-all duration-200";
    if (activePage === pageName) {
      return `${baseClass} text-primary font-bold border-l-4 border-l-primary pl-3 bg-surface-container-low`;
    }
    return `${baseClass} text-on-surface hover:text-primary pl-3`;
  };

  const getFullLogoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    return `${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}${url}`;
  };

  return (
    <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center px-gutter py-4 w-full max-w-max-width mx-auto">
        <Link to="/" className="flex items-center gap-2 text-primary font-headline-lg uppercase tracking-tighter truncate mr-4 shrink-0">
          {settings.logoUrl && !logoFailed ? (
            <img 
              src={getFullLogoUrl(settings.logoUrl)} 
              alt={settings.companyName} 
              className="h-8 lg:h-10 object-contain"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="material-symbols-outlined text-2xl lg:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              architecture
            </span>
          )}
          {/* Responsive Brand Logo Text */}
          <span className="inline-block text-xs min-[360px]:text-sm sm:text-base lg:text-lg xl:text-xl font-bold tracking-tight truncate max-w-[120px] min-[360px]:max-w-[180px] sm:max-w-none">
            {settings.companyName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-4 xl:gap-6 items-center">
          <Link className={getLinkClass('home')} to="/">Home</Link>
          <Link className={getLinkClass('about')} to="/about">About</Link>
          <Link className={getLinkClass('services')} to="/services">Services</Link>
          <Link className={getLinkClass('projects')} to="/projects">Projects</Link>
          <Link className={getLinkClass('gallery')} to="/gallery">Gallery</Link>
          <Link className={getLinkClass('blog')} to="/blog">Blog</Link>
          <Link className={getLinkClass('contact')} to="/contact">Contact</Link>
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden lg:block">
          <Link to="/get-quote" className="bg-primary-container text-black font-title-md text-title-md px-6 py-2 border border-primary-container hover:bg-opacity-90 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,0.4)] inline-block">
            Get a Quote
          </Link>
        </div>

        {/* Mobile Menu Hamburger Trigger */}
        <button 
          className="lg:hidden text-on-surface p-2 focus:outline-none transition-all duration-300 relative z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>
      
      {/* Premium Full-Screen Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[69px] z-40 bg-background/98 backdrop-blur-lg lg:hidden flex flex-col justify-between p-6 animate-fadeIn transition-all duration-300">
          <div className="flex flex-col gap-1">
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4 border-b border-outline-variant pb-2">
              Navigation Menu
            </div>
            <nav className="flex flex-col gap-2">
              <Link className={getMobileLinkClass('home')} to="/" onClick={() => setMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-lg">home</span>
                Home
              </Link>
              <Link className={getMobileLinkClass('about')} to="/about" onClick={() => setMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-lg">info</span>
                About Us
              </Link>
              <Link className={getMobileLinkClass('services')} to="/services" onClick={() => setMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-lg">engineering</span>
                Services
              </Link>
              <Link className={getMobileLinkClass('projects')} to="/projects" onClick={() => setMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-lg">domain</span>
                Projects
              </Link>
              <Link className={getMobileLinkClass('gallery')} to="/gallery" onClick={() => setMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-lg">photo_library</span>
                Gallery
              </Link>
              <Link className={getMobileLinkClass('blog')} to="/blog" onClick={() => setMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-lg">article</span>
                Blog
              </Link>
              <Link className={getMobileLinkClass('contact')} to="/contact" onClick={() => setMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-lg">mail</span>
                Contact
              </Link>
            </nav>
          </div>

          {/* Mobile Drawer Bottom Info & CTA */}
          <div className="flex flex-col gap-4 border-t border-outline-variant pt-6 mb-16">
            <Link 
              to="/get-quote" 
              onClick={() => setMobileMenuOpen(false)} 
              className="bg-primary-container text-black font-title-md text-title-md px-6 py-4 border border-primary-container hover:bg-opacity-95 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.4)] w-full text-center flex items-center justify-center gap-2"
            >
              Get a Quote
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <div className="text-center font-label-sm text-label-sm text-on-surface-variant tracking-wider">
              © {new Date().getFullYear()} PREM CIVIL TECH SOLUTION
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
