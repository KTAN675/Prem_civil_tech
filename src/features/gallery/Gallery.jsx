import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const defaultGalleryPhotos = [
  {
    id: 1,
    title: 'Foundation Pour',
    category: 'Site Work',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClIUFl0zzKmRqmzIhmklpqXa-Wgg0PsUfDmxDiO04P7gVnyP9387AEWZomqrZJu5SDxjPAeQXGKDwx1hOft27M-F-Vskt_N3ckINIoUqCSJlCa2GyK4Od9Z3GaXDjxNTOKZu0BI6o6UvoDbZDlBO2nV0I8n6GDMrOlf-m7-4Ru85HHhHpyxdB2B1nYroPQOPXxm5odCnfXbKCRtwsW0Ps79BOEj6HiFEOihyFstWHN6QOAEQxzAamBKYqXZgIuamZrAbpJoeTqh-w',
    description: 'Reinforced concrete foundation installation with complex geometric rebar grid and precision alignment.',
    size: 'md:col-span-2 md:row-span-2'
  },
  {
    id: 2,
    title: 'Structural Welds',
    category: 'Repairs',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzSlw6F_6ByFn3ECSSjhVC3SpGERltRFpCW0wBDiNZqW9dB9O5i5Xa97LnA0UTNW7MX4aRIcJmYBU5cJP8MZiYyZtRuxx2XR7FtB_R_q5fnnteQgt71YM36j5tEKuCePCLrbVv2hYC-GYVch5bhGcToc5xdvWUqZ_gQD1ODkwIpxVOIE2kZSQgHrH8dwsiAsHPZ1ZeG--wGPq1bhXsPGbZ91rtbIxW73k-Juk965R-H-WmJmnqnxNd6JZ8vkg7RTAc60Z6DDp7rao',
    description: 'Precision structural steel welding on industrial truss and bridge frame section.',
    size: 'md:col-span-1 md:row-span-1'
  },
  {
    id: 3,
    title: 'Membrane Application',
    category: 'Waterproofing',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpnL3mfQ0c7FmFd_-eaijdBcPnArP6L_OiGcZ-iQE49bK1UBYHAVWZFcS03GVAbKhKD77EHrFnz_0164qalZpAbZ4vTeItXMUZt8CjBnybQR_pi-jwSJ7CWTtHSgLLk9GbP-y4vaGGZVeCV0rCc4a4LnAlZT7VRKtFrnzwsDQXMAVNmVj64Ww85vdM1QqWqLB7WgOuc9J1yUXCcTp5-iUcikSHqTYeIOg1oyBntJNFq-tomWZMp-3lBCGoLEeRjqWak4_KeCGMnCg',
    description: 'Multi-layer torch-on bituminous membrane waterproofing applied to reinforced concrete roof slabs.',
    size: 'md:col-span-1 md:row-span-2'
  },
  {
    id: 4,
    title: 'Heavy Machinery Prep',
    category: 'Site Work',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNNu6LnRBAiTljAi9PGuHXUhpgK2Z7Yv_x8qterrdXZSO-dS0KcUNvOcyIe6D3MXOVPM14fKq0R0JjmaYK1OLx46mru-k932PiGOGMC_RVKTCFIbDUlHyQxAUSVCcra3rOYtVblUrwwaYXa8wGL0XnsJWYfcbZ3hqM31PmF1DhCYzP1eZDtZT2gzvB8rRUPEU8Fo86xTjcjWkA30Z1B4prdcZ96uGgsEegpqVFseDOiLkO-EPWPDiVNqmh-Qm1335arQeWqKwycgo',
    description: 'Sub-base excavation and earthworks preparation using heavy industrial machinery.',
    size: 'md:col-span-1 md:row-span-1'
  },
  {
    id: 5,
    title: 'Engineering Review',
    category: 'Team at Work',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIm5sGZsmH9X-kSZn9fasrHJV-laXMlDYp6z3y6bxSzjHjGHmhBeDrq2P8FK0_2Lacc6yzUr5-ZJVWwTUos8Kbbyl9qh2ITedqgVaZkCnV3D6cnOpFLcE8NaoY2GlOeMB09CxgkFnjstrSsN5QFPkKdTtTYsBKpOI-BeecEvCST793FfVLvAJkPOOLC8gSYPegGBrdf3pzi03MOFn0dTK2cm1-fdabqrY3cVJ733pLBQ0NDA01G5i6a2NIaWtKeJ88yMk4fD0asLw',
    description: 'Project engineering team checking alignment and discussing structural blueprints on-site.',
    size: 'md:col-span-2 md:row-span-1'
  },
  {
    id: 6,
    title: 'Bolted Connection Detail',
    category: 'Repairs',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBemHuNwMW-dQ9l8pyT12vj2o5Isi1KhRjPrON9qjeH73pTA9jA1wgHEfiOeQfrUBmNFqa1EmND5Ecfm14ybcLchRwaegmBicwBqrAbWh7OJW4lddcgZRvcsz3sRpHrpJJvha4XH6j4f60ApVIllhD0Fq3awj7Q_zkyEyh_uusYArBnH8HO1VKM71pfyaBWjmQ6t2CHSh7ARr0jwVELLk0X9FzCecXqHgfBAluwiUb4otExh1UI8Un1J35xVCD9Qlkqel5-54i4r4o',
    description: 'High-strength structural bolted steel beam connection for industrial frame load transfer.',
    size: 'md:col-span-1 md:row-span-1'
  }
];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [photos, setPhotos] = useState(defaultGalleryPhotos);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/gallery')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch gallery items');
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          const mapped = data.map((item) => {
            return {
              id: item.id,
              title: item.title || 'Untitled Project Photo',
              category: item.category || 'Site Work',
              image: item.image_url,
              description: item.title || 'Civil engineering visual documentation.'
            };
          });
          setPhotos(mapped);
        }
      })
      .catch(err => console.error('Error fetching gallery database items:', err));
  }, []);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    return `${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}${url}`;
  };

  // Compile list of unique categories dynamically
  const dbCategories = Array.from(new Set(photos.map(p => p.category).filter(Boolean)));
  const filters = Array.from(new Set(['All', 'Site Work', 'Repairs', 'Waterproofing', 'Team at Work', ...dbCategories]));

  let filteredPhotos = activeFilter === 'All'
    ? photos
    : photos.filter(photo => photo.category.toLowerCase() === activeFilter.toLowerCase());

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredPhotos = filteredPhotos.filter(photo =>
      (photo.title && photo.title.toLowerCase().includes(q)) ||
      (photo.category && photo.category.toLowerCase().includes(q)) ||
      (photo.description && photo.description.toLowerCase().includes(q))
    );
  }

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prevIndex) => 
      prevIndex === 0 ? filteredPhotos.length - 1 : prevIndex - 1
    );
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prevIndex) => 
      prevIndex === filteredPhotos.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md antialiased overflow-x-hidden">
      <Header activePage="gallery" />

      <main className="flex-grow pt-[89px]">
        {/* Hero Header */}
        <section className="relative w-full h-[358px] min-h-[300px] border-b border-outline-variant overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDuS78VAc8BOzyvoYFxyhOYzECwS_tQyoDRl4SYGdwraF1rttV5yWk60JKGqUlGSf1poxWe0gDZUGu4_VydTTYqdBpj3x62eNk0e5JX8qwGt2EWH0ZTqKCWGQT9zxyx7r9NC--IDSOVor6w1b8cnKwucVIoRl2ACDC-0Ql83rpPkILV4owq51WoE-1XLJTmTsgnArZanEKsSGvmq_O7LnIIeUUqJorpFDRs6ZsO0omrbCOjUlCs4KokOq0ZHJzfttiW_7dL3IKxx6g')`
            }}
          />
          <div className="absolute inset-0 bg-surface-dim/85" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-gutter">
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tighter uppercase border-b-4 border-primary-container pb-2 mb-4">
              Gallery
            </h1>
            <p className="font-title-md text-title-md text-on-surface-variant max-w-2xl">
              Visual documentation of structural integrity and precision execution.
            </p>
          </div>
        </section>

        {/* Gallery Grid Section */}
        <section className="max-w-max-width mx-auto px-gutter py-margin-desktop w-full">
          {/* Filter Bar and Search Box */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 border-b border-surface-container-highest pb-6">
            <div className="flex flex-wrap items-center gap-4 md:gap-8">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`font-label-sm text-label-sm uppercase tracking-widest pb-1 transition-all duration-300 ${
                    activeFilter === filter
                      ? 'text-primary-container border-b-2 border-primary-container font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {filter === 'All' ? 'All Photos' : filter}
                </button>
              ))}
            </div>

            <div className="relative flex items-center min-w-[280px]">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="Search gallery..."
                className="w-full bg-surface-container border border-outline-variant text-on-surface pl-10 pr-4 py-2 focus:border-primary-container focus:ring-0 rounded-none transition-colors font-body-md text-sm placeholder:text-surface-variant"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Uniform Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setLightboxIndex(index)}
                className="group relative aspect-[4/3] border border-outline-variant overflow-hidden cursor-pointer bg-surface-container-low rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${getImageUrl(photo.image)}')` }}
                />
                <div className="absolute inset-0 bg-surface-dim/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center backdrop-blur-[2px]">
                  <span className="material-symbols-outlined text-primary-container text-5xl mb-2">zoom_in</span>
                  <span className="font-title-md text-title-md text-on-surface uppercase tracking-wider text-center px-4">{photo.title}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">{photo.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 md:p-8 animate-fadeIn"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Bar */}
          <div className="flex justify-between items-center w-full max-w-7xl mx-auto z-10">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
              {filteredPhotos[lightboxIndex].category} ({lightboxIndex + 1} / {filteredPhotos.length})
            </span>
            <button 
              className="text-on-surface hover:text-primary transition-colors p-2"
              onClick={() => setLightboxIndex(null)}
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>

          {/* Image & Controls Container */}
          <div className="flex-grow flex items-center justify-between max-w-7xl w-full mx-auto relative my-4">
            {/* Prev Arrow */}
            <button 
              className="text-on-surface hover:text-primary transition-colors p-3 bg-surface/40 hover:bg-surface/85 backdrop-blur-sm rounded-full z-10 border border-outline-variant/30 absolute left-2 md:left-4"
              onClick={handlePrev}
            >
              <span className="material-symbols-outlined text-2xl md:text-3xl">arrow_back_ios_new</span>
            </button>

            {/* Displayed Image */}
            <div 
              className="w-full h-full flex justify-center items-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={getImageUrl(filteredPhotos[lightboxIndex].image)} 
                alt={filteredPhotos[lightboxIndex].title}
                className="max-w-full max-h-[70vh] object-contain border border-outline-variant shadow-2xl select-none"
              />
            </div>

            {/* Next Arrow */}
            <button 
              className="text-on-surface hover:text-primary transition-colors p-3 bg-surface/40 hover:bg-surface/85 backdrop-blur-sm rounded-full z-10 border border-outline-variant/30 absolute right-2 md:right-4"
              onClick={handleNext}
            >
              <span className="material-symbols-outlined text-2xl md:text-3xl">arrow_forward_ios</span>
            </button>
          </div>

          {/* Details Bar */}
          <div className="text-center w-full max-w-3xl mx-auto bg-surface-container-low/90 backdrop-blur-md p-6 border border-outline-variant/50 shadow-xl z-10 mb-2" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-title-md text-title-md text-primary uppercase tracking-wider mb-2">
              {filteredPhotos[lightboxIndex].title}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              {filteredPhotos[lightboxIndex].description}
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
