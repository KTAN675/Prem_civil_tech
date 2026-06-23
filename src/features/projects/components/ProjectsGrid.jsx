import React, { useEffect, useState } from 'react';

const FALLBACK_PROJECTS = [
  {
    id: 1,
    title: 'City Center Mall',
    category: 'Commercial',
    client: 'Apex Retail Group',
    location: 'Sector 45, Tech City',
    year: 2024,
    description: 'Full structural audit, deep foundation laying, and primary RCC superstructure construction.',
    thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVUfG99DkJw8P0VBdAQ-R0b36zRQSe5qLrJupQxBq57RaEfzN_6r_O6S0VDTcoc2S0HZ6NMFsbXqCdXLKD_NAjnBVP_E0uaLXgW2vo8Asn424OYfA96w_JUZARokhB-O_BPoJaB2OjIdzOXxQ9Rwffr3yHoMiyEj7fQXxMHWHQf6u9irmvwyd_8RMFtCuGtq7FUK-bsyoDjK_QooF2gVislCVMv0zX-iBUyfsPHabFW3dPv5dY0nu5DXw8hSipjh4vS0SJmeLs1jM',
    status: 'Completed'
  },
  {
    id: 2,
    title: 'Industrial Warehouse Block B',
    category: 'Industrial',
    client: 'Logix Logistics',
    location: 'Industrial Estate, Phase 2',
    year: 2024,
    description: 'Erection of pre-engineered steel frames, heavy-duty industrial flooring, and roofing installation.',
    thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMWGiMra6an6R1IBckSYOemZwkV54z6FKl-puBR5J8CHYVWoVO1MJ_QRN6LwqTPXtixkTT1QoSanW-xZ3sdLvqmacUzKzLSRE8ChJVCF_fg0ir2KKVzQFbkjEje_TPT0bvrSyUOanMbs_xVt3hIgyYIaB60o5jPvxy_PX8dQEyD-J7u3Oj1Nksit-CL4AnIkeKTVHeWEIiWR-rBokGsP7MioCjDKS-j3nYp3b6C9QOCdYYPIWG4sOu7aMXZ3BSquxjNumL8rX79Rk',
    status: 'Ongoing'
  },
  {
    id: 3,
    title: 'Luxury Residential Villa',
    category: 'Residential',
    client: 'Private Owner',
    location: 'Hillview Orchards',
    year: 2023,
    description: 'Turnkey construction encompassing specialized retaining walls, intricate formwork, and premium finishing.',
    thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAY9EHZCP1z4pPbwV7T1YM22oQQeWWqU5wce8IQ70xYjc2zNFB1MNhFOA3Y0_WXD2h9jiaoYdt7vP_TrVMZ4UD5xtqirbruQVjY2YJqm0ASa30OkpijUAWFTK6BmxA4jgc5RRS40-IIL9LpOt8OOe3JHzR6LaTM1iVG3WcSOAIxhI8k5altgj8co5E6bn0uAOZSorx1pUEFYHvKJ2v57U1xTVviCP3yPOt6Y3sVVBbycW3WQoSWLtnCSelw7KmY77w8W4Sk7XqQSEw',
    status: 'Completed'
  },
  {
    id: 4,
    title: 'Municipal Water Facility',
    category: 'Infrastructure',
    client: 'City Corporation',
    location: 'North District',
    year: 2023,
    description: 'Specialized concrete pouring for water containment structures, heavy equipment anchoring, and site grading.',
    thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBo6jb1gcQ3yQhYZAZXDbTHSu4nMCTxTExlb9u-BXuDtZvei3GemD7jdVIFViFUlyLhj6GRBlOfVSZ_3-4O1t0DT8W-9qF3tIDZTeSgy4rAYXc7Nkl0aOFgeGHjb1Gj9mV7glByz8iNV-UsoTRnJK16EAJ57g_9offZ3k7c-_0q9eOHIavzao6pqAT96MmJOKniMYmPT_KeL5ouk1SmV5I3W1Gmi1qh7H6GbDln9csXxXhD1P1etOKudyLs502gXgPyfltYsrYXMk',
    status: 'Completed'
  },
  {
    id: 5,
    title: 'Tech Park Tower C',
    category: 'Commercial',
    client: 'DevTech Infrastructures',
    location: 'Cyber Hub',
    year: 2024,
    description: 'High-rise structural framework, continuous concrete core pouring, and multi-level slab construction.',
    thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKEZ2uaJJOO1Cy4IKaU4uvAtRnykl3-KjvrmxBs835y7qQpe3CuIr-oOwbCfzpiwfImxrURHa7xy2xGwdmBiRYgF0r1-5K-ZpFI3Goyz0AUYP42xALGusK0nzPn8lcoR4NlhnlTDvr8AUmG4MByYltCro8PQkME1nZyAb1kT30t8wVF2l7_GF_T0VLsNobN9u3w5ZBGCNSl6k-RcnoFKW1ma9AJfdYKMs1G9XRzTmt1Ob6Xi4rP-C1KvnJp4Wp8V0bWqXbR5iIy1A',
    status: 'Ongoing'
  },
  {
    id: 6,
    title: 'Highway Overpass 42',
    category: 'Infrastructure',
    client: 'National Highway Board',
    location: 'Interstate Junction',
    year: 2022,
    description: 'Civil engineering infrastructure including deep pile foundations, precast girder installation, and road surfacing.',
    thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoWSghDkJAYb2U8gzm8y5GAm86fP_bvP34W-wHkYZ9kZcdvVA7IQLRJjq2NkA28uNAFnpyE9-lAbLWvmMypZzpaanVkImqbiyDEGZvS-K-9-9_k8e410yPAkAW6LAZU7uUug-9kQhENwHiKLjIrwk5WZWKfxSeB8wS_wIGvauWZp2PMVO9F2KBW-hLQnR1G-saYuaxZWTG0WTRwT4whB0_li9ypr0nyz_X9resE-Ya50Ykuqm_8ti_CHlLorQ390fRdl87Z2GPyec',
    status: 'Completed'
  }
];

export default function ProjectsGrid({ activeFilter, searchQuery }) {
  const [projects, setProjects] = useState(() => 
    FALLBACK_PROJECTS.map(p => ({ ...p, id: `fallback-${p.id}` }))
  );
  const [filteredProjects, setFilteredProjects] = useState(() => 
    FALLBACK_PROJECTS.map(p => ({ ...p, id: `fallback-${p.id}` }))
  );
  const [visibleCount, setVisibleCount] = useState(6);
  
  // Interactive detail modal states
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/projects')
      .then(res => {
        if (!res.ok) throw new Error('API status not OK');
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          // Normalize DB data keys to map correctly with fallback fields
          const normalizedDb = data.map(item => ({
            id: item.id,
            title: item.title,
            category: item.category,
            client: item.client || 'Prem Civil Tech Solutions',
            location: item.location || 'Site',
            year: item.year || new Date().getFullYear(),
            description: item.description || item.title || '',
            thumbnail_url: item.thumbnail_url,
            images: item.images,
            status: item.status || 'Completed'
          }));
          
          // Combine DB projects and Fallback projects, ensuring uniqueness by title
          const dbTitles = new Set(normalizedDb.map(p => p.title.toLowerCase()));
          const combined = [
            ...normalizedDb,
            ...FALLBACK_PROJECTS.map(p => ({ ...p, id: `fallback-${p.id}` })).filter(p => !dbTitles.has(p.title.toLowerCase()))
          ];
          setProjects(combined);
        }
      })
      .catch(err => {
        console.warn('Could not fetch projects from backend, using default static list:', err.message);
      });
  }, []);

  useEffect(() => {
    let result = [...projects];

    const cleanFilter = (activeFilter || '').trim().toLowerCase();

    if (cleanFilter === 'completed' || cleanFilter === 'ongoing') {
      result = result.filter(p => (p.status || '').trim().toLowerCase() === cleanFilter);
    } else if (cleanFilter !== 'all' && cleanFilter !== '') {
      result = result.filter(p => (p.category || '').trim().toLowerCase() === cleanFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.client && p.client.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q))
      );
    }

    setFilteredProjects(result);
    setVisibleCount(6);
  }, [activeFilter, searchQuery, projects]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 3);
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    return `${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}${url}`;
  };

  const openDetails = (project) => {
    setSelectedProject(project);
    setActiveImageIndex(0);
  };

  const closeDetails = () => {
    setSelectedProject(null);
  };

  // Helper to parse images list
  const getProjectImages = (project) => {
    let list = [];
    if (project.thumbnail_url) {
      list.push(project.thumbnail_url);
    }
    if (project.images) {
      try {
        const parsed = JSON.parse(project.images);
        if (Array.isArray(parsed)) {
          parsed.forEach(img => {
            if (img && !list.includes(img)) list.push(img);
          });
        }
      } catch (e) {
        if (typeof project.images === 'string' && !list.includes(project.images)) {
          list.push(project.images);
        }
      }
    }
    return list;
  };

  // Helper to render markdown styled notes
  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      let formatted = line;
      // Bold
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Underline
      formatted = formatted.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
      // Links
      formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-container hover:underline">$1</a>');

      if (line.trim().startsWith('- ')) {
        return <li key={idx} className="ml-4 list-disc text-on-surface-variant mb-1" dangerouslySetInnerHTML={{ __html: formatted.replace(/^- /, '') }} />;
      }
      if (line.trim().match(/^\d+\.\s/)) {
        return <li key={idx} className="ml-4 list-decimal text-on-surface-variant mb-1" dangerouslySetInnerHTML={{ __html: formatted.replace(/^\d+\.\s/, '') }} />;
      }
      return <p key={idx} className="mb-3 text-on-surface-variant leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <section className="py-16 md:py-24 px-gutter max-w-max-width mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.slice(0, visibleCount).map((project) => {
          const isOngoing = project.status?.toLowerCase() === 'ongoing';
          const thumbnail = getImageUrl(project.thumbnail_url);

          return (
            <article 
              key={project.id}
              onClick={() => openDetails(project)}
              className="group relative bg-surface-container border border-surface-variant hover:border-primary-container transition-colors duration-300 rounded-none overflow-hidden flex flex-col cursor-pointer"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <img 
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" 
                  alt={project.title}
                  src={thumbnail}
                />
                <div className={`absolute top-4 left-4 px-3 py-1 border ${
                  isOngoing 
                    ? 'bg-[#000000] border-[#000]' 
                    : 'bg-surface border-outline-variant'
                }`}>
                  <span className={`font-label-sm text-label-sm uppercase ${
                    isOngoing ? 'text-primary font-bold' : 'text-on-surface'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <span className="font-label-sm text-label-sm uppercase text-primary mb-1">{project.category}</span>
                <h3 className="font-headline-lg text-headline-lg md:text-title-md lg:font-headline-lg mb-2 text-on-surface group-hover:text-primary-container transition-colors duration-200">
                  {project.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-sm">location_on</span> 
                  {project.location || 'Site Location'}
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 mt-auto">
                  {project.executive_summary || project.description}
                </p>
                
                <div className="mt-4 flex items-center text-primary font-label-sm text-label-sm uppercase tracking-wider group-hover:translate-x-1.5 transition-transform duration-200">
                  View Specifications <span className="material-symbols-outlined ml-1.5 text-sm">arrow_forward</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      
      {visibleCount < filteredProjects.length && (
        <div className="mt-16 flex justify-center">
          <button 
            onClick={handleLoadMore}
            className="bg-primary-container text-[#000000] px-10 py-4 font-label-sm text-label-sm uppercase tracking-widest hover:bg-surface-tint hover:-translate-y-1 transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(51,51,51,1)] active:translate-y-0 active:shadow-none border border-[#000]"
          >
            Load More Projects
          </button>
        </div>
      )}

      {/* =============================================================== */}
      {/* PROJECT DETAILS MODAL                                           */}
      {/* =============================================================== */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-5xl bg-surface-container border border-outline-variant rounded-none shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden">
            
            {/* Close Button */}
            <button 
              onClick={closeDetails}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-surface border border-outline-variant text-on-surface hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Left: Gallery Carousel (50% width on md+) */}
            <div className="w-full md:w-1/2 bg-surface-container-low border-r border-outline-variant flex flex-col justify-between p-6">
              <div className="flex-grow flex items-center justify-center min-h-[300px] max-h-[450px] relative overflow-hidden border border-outline-variant">
                {getProjectImages(selectedProject).length > 0 ? (
                  <img 
                    className="w-full h-full object-cover max-h-[450px] transition-transform duration-300"
                    src={getImageUrl(getProjectImages(selectedProject)[activeImageIndex])}
                    alt={selectedProject.title}
                  />
                ) : (
                  <span className="text-on-surface-variant italic">No images available</span>
                )}
              </div>
              
              {/* Carousel Thumbnails */}
              {getProjectImages(selectedProject).length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto py-1">
                  {getProjectImages(selectedProject).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 border overflow-hidden shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-primary scale-105' : 'border-outline-variant opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img className="w-full h-full object-cover" src={getImageUrl(img)} alt="Thumbnail" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Spec Details & Technical Documentation */}
            <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
              <div>
                <span className="font-label-sm text-label-sm uppercase text-primary tracking-widest">{selectedProject.category}</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1 mb-4">{selectedProject.title}</h2>
                
                {/* Tech Specs Block */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-outline-variant mb-6 bg-surface-container-low p-4">
                  <div>
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider block">Location</span>
                    <span className="font-body-md text-on-surface flex items-center mt-1">
                      <span className="material-symbols-outlined text-sm mr-1 text-primary">location_on</span>
                      {selectedProject.location || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider block">Operational Status</span>
                    <span className="font-body-md text-on-surface flex items-center mt-1">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        selectedProject.status?.toLowerCase() === 'ongoing' ? 'bg-tertiary-fixed' : 'bg-secondary'
                      }`}></span>
                      {selectedProject.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider block">Client</span>
                    <span className="font-body-md text-on-surface flex items-center mt-1">
                      <span className="material-symbols-outlined text-sm mr-1 text-primary">business</span>
                      {selectedProject.client || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider block">Year / Commencement</span>
                    <span className="font-body-md text-on-surface flex items-center mt-1">
                      <span className="material-symbols-outlined text-sm mr-1 text-primary">calendar_month</span>
                      {selectedProject.commencement_date ? new Date(selectedProject.commencement_date).getFullYear() : (selectedProject.year || 'N/A')}
                    </span>
                  </div>
                </div>

                {/* Executive Summary */}
                {selectedProject.executive_summary && (
                  <div className="mb-6 border-l-2 border-primary pl-4">
                    <h4 className="font-label-sm text-label-sm uppercase text-primary mb-1">Executive Summary</h4>
                    <p className="font-body-md text-body-md text-on-surface italic leading-relaxed">
                      {selectedProject.executive_summary}
                    </p>
                  </div>
                )}

                {/* Technical Documentation */}
                {selectedProject.description && (
                  <div className="space-y-2">
                    <h4 className="font-label-sm text-label-sm uppercase text-primary border-b border-outline-variant pb-1 mb-2">Technical Documentation</h4>
                    <div className="font-body-md text-body-md">
                      {renderMarkdown(selectedProject.description)}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
