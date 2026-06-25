import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import Panel Components
import DashboardPanel from './panels/DashboardPanel';
import LeadsPanel from './panels/LeadsPanel';
import ProjectsPanel from './panels/ProjectsPanel';
import GalleryPanel from './panels/GalleryPanel';
import TestimonialsPanel from './panels/TestimonialsPanel';
import BlogPanel from './panels/BlogPanel';
import TeamPanel from './panels/TeamPanel';
import SettingsPanel from './panels/SettingsPanel';
import CareersPanel from './panels/CareersPanel';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'leads' | 'projects' | 'gallery' | 'testimonials' | 'blog' | 'team' | 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Database States
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Leads state extensions
  const [selectedLead, setSelectedLead] = useState(null);

  const navigate = useNavigate();

  // Check authentication & load initial database values
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch Leads
      const resLeads = await fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/leads');
      if (resLeads.ok) setLeads(await resLeads.json());

      // Fetch Projects
      const resProjects = await fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/projects');
      if (resProjects.ok) setProjects(await resProjects.json());

      // Fetch Team
      const resTeam = await fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/team');
      if (resTeam.ok) setTeam(await resTeam.json());

      // Fetch Testimonials
      const resTestimonials = await fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/testimonials?all=true');
      if (resTestimonials.ok) setTestimonials(await resTestimonials.json());

      // Fetch Gallery
      const resGallery = await fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/gallery');
      if (resGallery.ok) setGallery(await resGallery.json());

      // Fetch Blog
      const resBlogs = await fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/blog');
      if (resBlogs.ok) setBlogs(await resBlogs.json());

      // Fetch Applications
      const resApps = await fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/careers/applications');
      if (resApps.ok) setApplications(await resApps.json());

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to connect to backend server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const showFlashMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Statistics Helper
  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'pending' || l.status === 'new').length,
    activeProjects: projects.filter(p => p.status === 'Ongoing').length,
    totalProjects: projects.length,
    totalTeam: team.length,
    pendingTestimonials: testimonials.filter(t => !t.is_approved).length,
    totalGallery: gallery.length,
    totalApplications: applications.length,
    newApplications: applications.filter(a => a.status === 'Pending').length
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased overflow-hidden flex h-screen w-full relative">
      {/* Flash Message Banner */}
      {message && (
        <div className="fixed top-4 right-4 z-50 bg-primary-container text-black font-semibold border border-primary px-6 py-3 shadow-lg flex items-center gap-2 animate-slideDown print:hidden">
          <span className="material-symbols-outlined">check_circle</span>
          {message}
        </div>
      )}

      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 bg-surface-container-lowest border-r border-[#333333] flex flex-col h-full flex-shrink-0 z-20 shadow-[4px_0_16px_rgba(0,0,0,0.4)] fixed print:hidden">
        <div className="h-16 flex items-center px-6 border-b border-[#333333]">
          <span className="font-headline-lg text-primary-container tracking-tighter uppercase text-[18px]">PREM CIVIL TECH</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center space-x-3 px-3 py-2 transition-colors text-[14px] ${
              activeTab === 'dashboard' 
                ? 'bg-surface-container-high border-l-2 border-primary-container text-on-surface font-title-md' 
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'dashboard' ? 'text-primary-container' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span>Dashboard</span>
          </button>

          <button 
            onClick={() => { setActiveTab('leads'); setSelectedLead(null); }} 
            className={`w-full flex items-center space-x-3 px-3 py-2 transition-colors text-[14px] ${
              activeTab === 'leads' 
                ? 'bg-surface-container-high border-l-2 border-primary-container text-on-surface font-title-md' 
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined">description</span>
            <span>Leads/Quotes</span>
            {stats.newLeads > 0 && (
              <span className="ml-auto bg-primary-container text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.newLeads}</span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('projects')} 
            className={`w-full flex items-center space-x-3 px-3 py-2 transition-colors text-[14px] ${
              activeTab === 'projects' 
                ? 'bg-surface-container-high border-l-2 border-primary-container text-on-surface font-title-md' 
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined">architecture</span>
            <span>Projects</span>
          </button>

          <button 
            onClick={() => setActiveTab('gallery')} 
            className={`w-full flex items-center space-x-3 px-3 py-2 transition-colors text-[14px] ${
              activeTab === 'gallery' 
                ? 'bg-surface-container-high border-l-2 border-primary-container text-on-surface font-title-md' 
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined">photo_library</span>
            <span>Gallery</span>
          </button>

          <button 
            onClick={() => setActiveTab('testimonials')} 
            className={`w-full flex items-center space-x-3 px-3 py-2 transition-colors text-[14px] ${
              activeTab === 'testimonials' 
                ? 'bg-surface-container-high border-l-2 border-primary-container text-on-surface font-title-md' 
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined">reviews</span>
            <span>Testimonials</span>
            {stats.pendingTestimonials > 0 && (
              <span className="ml-auto bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingTestimonials}</span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('blog')} 
            className={`w-full flex items-center space-x-3 px-3 py-2 transition-colors text-[14px] ${
              activeTab === 'blog' 
                ? 'bg-surface-container-high border-l-2 border-primary-container text-on-surface font-title-md' 
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined">article</span>
            <span>Blog</span>
          </button>

          <button 
            onClick={() => setActiveTab('team')} 
            className={`w-full flex items-center space-x-3 px-3 py-2 transition-colors text-[14px] ${
              activeTab === 'team' 
                ? 'bg-surface-container-high border-l-2 border-primary-container text-on-surface font-title-md' 
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined">group</span>
            <span>Team</span>
          </button>

          <button 
            onClick={() => setActiveTab('careers')} 
            className={`w-full flex items-center space-x-3 px-3 py-2 transition-colors text-[14px] ${
              activeTab === 'careers' 
                ? 'bg-surface-container-high border-l-2 border-primary-container text-on-surface font-title-md' 
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined">work</span>
            <span>Careers</span>
            {stats.newApplications > 0 && (
              <span className="ml-auto bg-primary-container text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.newApplications}</span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full flex items-center space-x-3 px-3 py-2 transition-colors text-[14px] ${
              activeTab === 'settings' 
                ? 'bg-surface-container-high border-l-2 border-primary-container text-on-surface font-title-md' 
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-[#333333]">
          <a onClick={handleLogout} className="flex items-center space-x-3 px-3 py-2 text-on-surface-variant hover:text-error transition-colors font-body-md text-[14px] cursor-pointer" href="#">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden ml-64 bg-background print:ml-0 print:overflow-visible">
        {/* Header */}
        <header className="h-16 bg-surface-container-lowest border-b border-[#333333] flex items-center justify-between px-6 z-10 shadow-[0_4px_16px_rgba(0,0,0,0.4)] print:hidden">
          <div className="flex-1 max-w-md relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border border-[#333333] text-on-surface text-[14px] pl-10 pr-4 py-2 focus:outline-none focus:border-primary-container focus:border-b-2 transition-all" 
              placeholder={`Search in active panel...`} 
              type="text" 
            />
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="relative text-on-surface-variant hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary-container rounded-full border border-surface-container-lowest"></span>
            </button>
            
            <div className="flex items-center space-x-3 cursor-pointer group border-l border-[#333333] pl-6">
              <div className="text-right hidden md:block">
                <div className="font-title-md text-[14px] text-on-surface group-hover:text-primary-container transition-colors">Admin User</div>
                <div className="font-label-sm text-on-surface-variant uppercase tracking-widest text-[10px]">System Access</div>
              </div>
              <img 
                className="w-10 h-10 border border-[#333333] object-cover filter grayscale hover:grayscale-0 transition-all duration-300" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSnZjVo5IGAdx_Abus8WtUM97Nxkr2CiQ7Jal-203d38rj_x_vGOcGWoHQX2eJBRaOnZaAy3vF6A5KGOnSJGaBpRJaq7jaFq1vsuyP0qyf9uFm-tnpiKpCCe2hLJQmFCkkLPD5oqEAYYYyO27VwJ7GcoxwqTgDNITEK33o5u__AuypFl8u5GpUh3YvUG6g9Ftn_nSldp2QkKMsZhESa4s15s5v3qeecYHoNsKFBrnMNqx4GngfnVej4J_SXJulyGTeZqIbMOLpCDY" 
                alt="Avatar"
              />
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">expand_more</span>
            </div>
          </div>
        </header>

        {/* 3. DYNAMIC CONTENT CANVAS */}
        <div className="flex-1 overflow-y-auto p-gutter space-y-gutter print:p-0 print:overflow-visible">
          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-4 text-sm font-semibold uppercase print:hidden">
              {error}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardPanel 
              stats={stats}
              leads={leads}
              setActiveTab={setActiveTab}
              setSelectedLead={setSelectedLead}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsPanel 
              leads={leads}
              setLeads={setLeads}
              selectedLead={selectedLead}
              setSelectedLead={setSelectedLead}
              loading={loading}
              fetchDashboardData={fetchDashboardData}
              showFlashMessage={showFlashMessage}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsPanel 
              projects={projects}
              setProjects={setProjects}
              fetchDashboardData={fetchDashboardData}
              showFlashMessage={showFlashMessage}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'gallery' && (
            <GalleryPanel 
              gallery={gallery}
              setGallery={setGallery}
              fetchDashboardData={fetchDashboardData}
              showFlashMessage={showFlashMessage}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'testimonials' && (
            <TestimonialsPanel 
              testimonials={testimonials}
              setTestimonials={setTestimonials}
              showFlashMessage={showFlashMessage}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'blog' && (
            <BlogPanel 
              blogs={blogs}
              setBlogs={setBlogs}
              showFlashMessage={showFlashMessage}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'team' && (
            <TeamPanel 
              team={team}
              setTeam={setTeam}
              fetchDashboardData={fetchDashboardData}
              showFlashMessage={showFlashMessage}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'careers' && (
            <CareersPanel 
              applications={applications}
              setApplications={setApplications}
              loading={loading}
              fetchDashboardData={fetchDashboardData}
              showFlashMessage={showFlashMessage}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel 
              showFlashMessage={showFlashMessage}
            />
          )}
        </div>
      </main>
    </div>
  );
}
