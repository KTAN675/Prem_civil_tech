import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const defaultBlogs = [
  {
    id: 1,
    title: 'The Future of Concrete: Admixtures and Durability',
    category: 'Engineering Tips',
    author: 'David K.',
    content: `Reinforced cement concrete (RCC) remains the backbone of modern civil infrastructure. However, as structures grow taller and environmental conditions become more severe, traditional concrete formulations fall short. The future of concrete lies in advanced chemical and mineral admixtures.

### Key Types of Modern Admixtures:
1. **Superplasticizers (High Range Water Reducers):** Reduce water content by up to 30% without sacrificing workability, resulting in exceptionally high compressive strengths.
2. **Self-Healing Admixtures:** Utilize bacterial spores or crystalline catalysts that react with incoming moisture to seal micro-cracks before they propagate.
3. **Corrosion Inhibitors:** Form a protective chemical film around steel rebar, preventing chloride ions from initiating rust.

### Why Durability Matters
By incorporating fly ash, silica fume, and metakaolin, we not only improve chemical resistance against sulfate attacks but also reduce the carbon footprint of concrete production by replacing resource-intensive Portland cement. Continuous structural auditing and repairs should also be combined with advanced waterproofing membranes to extend lifespans past 100 years.`,
    status: 'Published',
    image_url: null,
    meta_description: 'An in-depth look at chemical and mineral admixtures shaping modern high-durability reinforced concrete structure designs.',
    created_at: '2024-10-24T09:00:00.000Z'
  },
  {
    id: 2,
    title: 'Integrating Drone Surveying in Topographical Analysis',
    category: 'Construction News',
    author: 'Sarah J.',
    content: `Traditional surveying methods are time-consuming and often expose field teams to hazardous terrain. The integration of Unmanned Aerial Vehicles (UAVs)—or drones—has revolutionized topographical analysis.

### Major Advantages:
* **Speed:** Cover hundreds of acres in hours instead of days.
* **Accuracy:** High-resolution photogrammetry and LiDAR payloads capture point clouds with sub-centimeter precision.
* **Volumetric Computations:** Instantly calculate cut-and-fill volumes for earthworks and excavation planning.

By export-mapping drone data directly into CAD and BIM software, project managers can identify layout conflicts and verify grading plans before heavy machinery breaks ground. This speeds up structural foundation pour timelines and reduces design errors to nearly zero.`,
    status: 'Published',
    image_url: null,
    meta_description: 'Discover how modern UAV drone photogrammetry and LiDAR surveying optimize land excavation and foundation layout accuracy.',
    created_at: '2024-10-21T10:30:00.000Z'
  },
  {
    id: 3,
    title: 'Q3 Safety Protocol Updates & Compliance Checks',
    category: 'Company Updates',
    author: 'Admin',
    content: `At Prem Civil Tech, safety is our ultimate core competency. As we launch multiple high-rise and industrial waterproofing projects this quarter, we are rolling out updated compliance checks.

### Essential Focus Areas:
1. **Fall Protection:** 100% tie-off compliance for all scaffolding and suspended platforms over 1.8 meters.
2. **PPE Refresher:** Mandatory class-E hard hats and steel-toed boots in active zones.
3. **Chemical Handling:** Proper ventilation and respirator usage during elastomeric waterproofing membrane applications.

We require daily tool-box talks and weekly supervisor audits. By adhering to these rigorous guidelines, we continue to maintain our zero-incident safety record.`,
    status: 'Published',
    image_url: null,
    meta_description: 'Reviewing Prem Civil Tech\'s updated Q3 safety guidelines, scaffolding fall protection, and personal safety requirements.',
    created_at: '2024-10-15T08:15:00.000Z'
  }
];

export default function Blog() {
  const [posts, setPosts] = useState(defaultBlogs);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/blog?status=Published')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch blog posts');
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          setPosts(data);
        }
      })
      .catch(err => {
        console.warn('Could not fetch blog posts from backend, using default static blogs:', err.message);
      });
  }, []);

  const getImageUrl = (url, index) => {
    if (url) {
      if (url.startsWith('http') || url.startsWith('data:')) return url;
      return `http://localhost:5000${url}`;
    }
    // High-quality industrial concrete fallback images matching the content
    const fallbacks = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAwmv1BzjQI2NOJ7LaQX5FwvGdR0E6uYEA3T4G6nw_w7im-k2_Oo_qlyur0Xdl_a_s0L5eXUfRNsU381aH7Fyh-CYsGX4Yg1iE54mkgMWQUxklSp6KNtMVLfUtLFRvox2bekR1A4RUJ7-iJhIynkv2NwGx5YQRKOxjM-IINAa6l64_jiTk0Alp5iVcAo7KClqyeK9-UbA6yg_GvV5SmsMynFbgiDij0R41NSc86wJOHNhic6KX5lnk9e7QRGVHyshH3ep67iMGohIY',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCckrm_QZ2n91DCJoNAMvOzkIwOyiHaKxdMIVCI8u1j8zOWquDNtkfpTDQKjVqwXckJsB_toHHpiTrE35EQE12tyDzO7tjENfJL9BdZp0qImMq0uU4xaI-lckPpgJCoJxwic9VXWJAi2spiwxzgjZpnbHRXlLY6EBtxETQKId8IqEV9uJJpf8RwzvbvW5vXJ3ZHr27tS2kh9-nrhbst-04Emrson6hYMPy1minAnPbZmr1-VgDGI5rMNytmViHrA4-T5IP6R127Gls',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'
    ];
    return fallbacks[index % fallbacks.length];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Compile list of unique categories dynamically
  const dbCategories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));
  const categories = ['All', ...dbCategories];

  // Filtering
  const filteredPosts = posts.filter(post => {
    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = post.title && post.title.toLowerCase().includes(q);
      const contentMatch = post.content && post.content.toLowerCase().includes(q);
      if (!titleMatch && !contentMatch) return false;
    }
    // 2. Category Filter
    if (activeFilter !== 'All') {
      if (post.category !== activeFilter) return false;
    }
    return true;
  });

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md relative">
      <Header activePage="blog" />

      {/* Decorative Blueprint Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none"></div>

      <main className="flex-grow pt-24 pb-margin-desktop relative z-10">
        <div className="max-w-max-width mx-auto px-gutter">
          
          {/* Hero Banner */}
          <div className="mb-12 border-b border-outline-variant pb-8">
            <span className="font-label-sm text-label-sm text-primary-container uppercase tracking-widest block mb-2">Technical Bulletin</span>
            <h1 className="font-headline-lg text-display-lg md:text-5xl text-on-surface uppercase tracking-tighter leading-none mb-4">
              Corporate Blog & Insights
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Engineering breakthroughs, concrete material science research, safety regulations, and project milestones straight from our construction site supervisors.
            </p>
          </div>

          {/* Filters and Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-surface-container border border-outline p-4 shadow-[3px_3px_0px_rgba(0,0,0,0.4)]">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 font-label-sm text-label-sm uppercase tracking-wider transition-all rounded-none border ${
                    activeFilter === cat 
                      ? 'bg-primary-container text-black border-primary-container font-bold' 
                      : 'border-outline text-on-surface-variant hover:text-on-surface hover:border-primary-container'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex items-center w-full md:max-w-xs shrink-0">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full bg-background border border-outline text-on-surface pl-10 pr-4 py-2 focus:border-primary-container focus:ring-0 rounded-none transition-colors font-body-md text-sm placeholder:text-surface-variant"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, idx) => (
              <article 
                key={post.id || idx}
                className="bg-surface-container border border-outline hover:border-primary-container transition-all group flex flex-col h-full shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:shadow-[4px_4px_0px_rgba(255,140,0,0.15)] overflow-hidden"
              >
                {/* Featured Thumbnail */}
                <div className="h-56 bg-surface-container-high relative overflow-hidden shrink-0 border-b border-outline-variant">
                  <img 
                    src={getImageUrl(post.image_url, idx)} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-background/90 text-primary-container font-label-sm text-xs font-bold uppercase border border-primary-container/40 backdrop-blur-sm">
                      {post.category || 'General'}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center text-xs text-on-surface-variant gap-3 font-label-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        {formatDate(post.created_at)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person</span>
                        {post.author || 'Admin'}
                      </span>
                    </div>

                    <h3 className="font-headline-lg-mobile text-xl text-on-surface uppercase font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="font-body-md text-sm text-on-surface-variant line-clamp-3">
                      {post.meta_description || post.content.replace(/[#*`_-]/g, '').substring(0, 140) + '...'}
                    </p>
                  </div>

                  <button 
                    onClick={() => setSelectedPost(post)}
                    className="text-primary-container hover:text-primary transition-colors flex items-center gap-2 font-label-sm text-sm uppercase tracking-wider mt-6 pt-4 border-t border-outline-variant w-full text-left"
                  >
                    Read Article <span className="material-symbols-outlined text-lg">arrow_right_alt</span>
                  </button>
                </div>
              </article>
            ))}

            {filteredPosts.length === 0 && (
              <div className="col-span-full text-center py-20 bg-surface-container border border-outline">
                <span className="material-symbols-outlined text-5xl text-surface-variant mb-3 block">article_off</span>
                <h3 className="font-title-md text-lg text-on-surface uppercase font-bold">No articles match criteria</h3>
                <p className="text-on-surface-variant text-sm mt-1">Try clearing filters or adjusting your search term.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reader Modal Overlay */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-4 md:p-8 z-50 overflow-y-auto">
          <div className="bg-surface-container border border-primary-container max-w-4xl w-full my-auto shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-hidden relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 bg-background border border-outline text-on-surface hover:text-error hover:border-error transition-all w-10 h-10 flex items-center justify-center rounded-none z-10"
              aria-label="Close reader"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Header info */}
            <div className="p-6 md:p-8 border-b border-outline-variant bg-surface-container-high shrink-0">
              <div className="flex flex-wrap items-center gap-3 text-xs text-primary-container font-label-sm mb-3">
                <span className="px-2 py-0.5 border border-primary-container/30 bg-primary-container/10 uppercase">
                  {selectedPost.category}
                </span>
                <span>•</span>
                <span>{formatDate(selectedPost.created_at)}</span>
                <span>•</span>
                <span>By {selectedPost.author || 'Admin'}</span>
              </div>
              <h2 className="font-headline-lg text-2xl md:text-3xl text-on-surface uppercase font-extrabold tracking-tight pr-12 leading-tight">
                {selectedPost.title}
              </h2>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {selectedPost.image_url ? (
                <img 
                  src={`http://localhost:5000${selectedPost.image_url}`} 
                  alt={selectedPost.title} 
                  className="w-full max-h-[380px] object-cover border border-outline-variant shadow-md"
                />
              ) : (
                <div className="w-full h-[200px] bg-surface-container-low border border-outline-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-surface-container-highest">engineering</span>
                </div>
              )}

              <div className="prose prose-invert max-w-none text-on-surface-variant font-body-md text-base leading-relaxed whitespace-pre-wrap space-y-4">
                {/* Render basic custom headings/lists formatting */}
                {selectedPost.content}
              </div>
            </div>

            {/* Footer / Status */}
            <div className="p-4 bg-surface-container-low border-t border-outline-variant text-right text-xs text-on-surface-variant font-label-sm shrink-0">
              Prem Civil Tech Solutions Bulletin © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
