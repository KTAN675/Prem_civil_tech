import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [settings, setSettings] = useState({
    companyName: 'PREM CIVIL TECH SOLUTION',
    tagline: 'Industrial Integrity. Engineering structural reliability and precision safety for high-stakes environments.',
    email: 'info@premciviltech.com',
    phone: '+91 98765 43210',
    address: 'Sector 5 Industrial Corridor, Mumbai, IN',
    socialLinks: []
  });

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({
          companyName: data.companyName || prev.companyName,
          tagline: data.tagline || prev.tagline,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          address: data.address || prev.address,
          socialLinks: data.socialLinks || []
        }));
      })
      .catch(err => console.error('Error loading settings in Footer:', err));
  }, []);

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-gutter py-12 max-w-max-width mx-auto">
        <div className="col-span-1 md:col-span-2 pr-8">
          <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface uppercase tracking-tighter mb-4">
            {settings.companyName}
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-md">
            {settings.tagline}
          </p>
          {settings.socialLinks && settings.socialLinks.length > 0 && (
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {settings.socialLinks.map((link, index) => (
                <a 
                  key={index}
                  className="text-on-surface-variant hover:text-primary transition-colors p-1.5 bg-surface border border-outline-variant hover:border-primary-container flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,0.3)]"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.platform}
                >
                  {getPlatformIcon(link.platform)}
                </a>
              ))}
            </div>
          )}
          <div className="text-primary font-body-md text-body-md">
            © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-3">
          <h4 className="font-title-md text-title-md text-on-surface uppercase tracking-wide border-b border-outline-variant pb-2 mb-2">Company</h4>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary dark:hover:text-primary-container transition-all duration-300 ease-in-out" to="/">Home</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary dark:hover:text-primary-container transition-all duration-300 ease-in-out" to="/about">About Us</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary dark:hover:text-primary-container transition-all duration-300 ease-in-out" to="/services">Services</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary dark:hover:text-primary-container transition-all duration-300 ease-in-out" to="/projects">Projects</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary dark:hover:text-primary-container transition-all duration-300 ease-in-out" to="/gallery">Gallery</Link>
        </div>
        <div className="col-span-1 flex flex-col gap-3">
          <h4 className="font-title-md text-title-md text-on-surface uppercase tracking-wide border-b border-outline-variant pb-2 mb-2">Contact</h4>
          <span className="font-body-md text-body-md text-on-surface-variant flex items-start gap-2">
            <span className="material-symbols-outlined text-sm mt-1">location_on</span>
            <span className="break-words">{settings.address}</span>
          </span>
          <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">mail</span>
            <span>{settings.email}</span>
          </span>
          <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">call</span>
            <span>{settings.phone}</span>
          </span>
          <Link to="/get-quote" className="mt-4 bg-transparent border border-outline text-on-surface hover:text-primary-container hover:border-primary-container font-label-sm text-label-sm uppercase tracking-widest px-4 py-2 transition-colors self-start shadow-[2px_2px_0px_rgba(0,0,0,0.3)] text-center">
            Get a Quote
          </Link>
        </div>
      </div>
    </footer>
  );
}

const getPlatformIcon = (platform) => {
  const name = platform.toLowerCase();
  if (name.includes('linkedin')) {
    return (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7H9.33V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
      </svg>
    );
  }
  if (name.includes('facebook')) {
    return (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }
  if (name.includes('instagram')) {
    return (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    );
  }
  if (name.includes('youtube')) {
    return (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  if (name.includes('twitter') || name.includes('x.com')) {
    return (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (name.includes('whatsapp')) {
    return (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.25 8.477 3.517 2.266 2.268 3.512 5.279 3.512 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.681-1.448L0 24zm5.87-11.117c.149.25.249.43.399.68.15.25.22.42.07.72-.15.3-.67 1.5-1.04 2.05-.17.25-.35.28-.65.13-.3-.15-1.26-.46-2.39-1.47-1.13-1.01-1.48-1.98-1.65-2.28-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51-.18-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"/>
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  );
};
