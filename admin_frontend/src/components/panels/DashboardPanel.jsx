import React from 'react';

export default function DashboardPanel({ stats, leads, setActiveTab, setSelectedLead }) {
  return (
    <div className="space-y-gutter">
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="font-headline-lg text-on-surface tracking-tighter">System Overview</h1>
          <p className="font-body-md text-on-surface-variant">Live metrics for Prem Civil Tech</p>
        </div>
        <div className="font-label-sm text-on-surface-variant border border-[#333333] px-3 py-1 bg-surface-container">
          LAST UPDATED: JUST NOW
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Total Leads */}
        <div className="bg-surface-container border border-[#333333] p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[64px] text-primary-container">contact_mail</span>
          </div>
          <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Total Leads</p>
          <div className="font-display-lg text-primary-container leading-none tracking-tighter">{stats.totalLeads}</div>
          <div className="mt-4 flex items-center text-[12px] text-tertiary">
            <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
            <span>All submitted queries</span>
          </div>
        </div>

        {/* New Quote Requests */}
        <div className="bg-surface-container border border-[#333333] p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[64px] text-primary-container">request_quote</span>
          </div>
          <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">New Quote Requests</p>
          <div className="font-display-lg text-primary-container leading-none tracking-tighter">{stats.newLeads}</div>
          <div className="mt-4 flex items-center text-[12px] text-on-surface-variant">
            <span className="w-2 h-2 bg-primary-container rounded-full mr-2 animate-pulse"></span>
            <span>Requires attention</span>
          </div>
        </div>

        {/* Active Projects (Hazard Stripe style) */}
        <div className="bg-surface-container border border-[#333333] p-5 relative overflow-hidden group hazard-stripe">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[64px] text-primary-container">engineering</span>
          </div>
          <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Active Projects</p>
          <div className="font-display-lg text-on-surface leading-none tracking-tighter">{stats.activeProjects}</div>
          <div className="mt-4 flex items-center text-[12px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] mr-1">sync</span>
            <span>Currently in progress</span>
          </div>
        </div>

        {/* Total Page Views */}
        <div className="bg-surface-container border border-[#333333] p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[64px] text-primary-container">visibility</span>
          </div>
          <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Total Page Views</p>
          <div className="font-display-lg text-on-surface leading-none tracking-tighter">8.5k</div>
          <div className="mt-4 flex items-center text-[12px] text-tertiary">
            <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
            <span>+5.2% from last week</span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Left Side: Recent Quotes Table & SVG Visitor Chart */}
        <div className="lg:col-span-2 space-y-gutter">
          {/* Table Card */}
          <div className="bg-surface-container border border-[#333333] flex flex-col">
            <div className="px-5 py-4 border-b border-[#333333] flex justify-between items-center bg-surface-container-high">
              <h2 className="font-title-md text-on-surface uppercase tracking-tight text-[16px]">Recent Quote Requests</h2>
              <button onClick={() => setActiveTab('leads')} className="text-primary-container font-label-sm hover:underline uppercase">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#333333] bg-surface-container-lowest">
                    <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Client Name</th>
                    <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Service Requested</th>
                    <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-[14px]">
                  {leads.slice(0, 5).map(lead => (
                    <tr key={lead.id} className="border-b border-[#333333] hover:bg-surface-container-high transition-colors">
                      <td className="px-5 py-4 font-title-md text-on-surface">{lead.full_name}</td>
                      <td className="px-5 py-4 text-on-surface-variant">{lead.project_type}</td>
                      <td className="px-5 py-4 text-on-surface-variant">{new Date(lead.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2 py-1 border font-label-sm uppercase ${
                          lead.status === 'pending' 
                            ? 'border-primary-container text-primary-container bg-primary-container/10' 
                            : 'border-outline-variant text-on-surface-variant'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          onClick={() => { setSelectedLead(lead); setActiveTab('leads'); }} 
                          className="text-on-surface-variant hover:text-primary-container transition-colors"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-on-surface-variant">No leads available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Card */}
          <div className="bg-surface-container border border-[#333333] flex flex-col h-64 relative overflow-hidden">
            <div className="px-5 py-4 border-b border-[#333333] flex justify-between items-center bg-surface-container-high absolute top-0 w-full z-10">
              <h2 className="font-title-md text-on-surface uppercase tracking-tight text-[16px]">Website Visitors (30 Days)</h2>
            </div>
            {/* Visitor SVG Graph */}
            <div className="flex-1 mt-14 p-4 relative">
              <div className="absolute inset-0 flex flex-col justify-between px-4 py-8 pointer-events-none opacity-20">
                <div className="border-b border-[#333333] w-full"></div>
                <div className="border-b border-[#333333] w-full"></div>
                <div className="border-b border-[#333333] w-full"></div>
                <div className="border-b border-[#333333] w-full"></div>
              </div>
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ff8c00" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#ff8c00" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M0,80 L10,75 L20,60 L30,65 L40,40 L50,45 L60,30 L70,35 L80,15 L90,20 L100,5" fill="none" stroke="#ff8c00" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                <path d="M0,100 L0,80 L10,75 L20,60 L30,65 L40,40 L50,45 L60,30 L70,35 L80,15 L90,20 L100,5 L100,100 Z" fill="url(#chartGradient)"></path>
                
                <circle cx="40" cy="40" fill="#121414" r="1.5" stroke="#ff8c00" strokeWidth="1" vectorEffect="non-scaling-stroke"></circle>
                <circle cx="60" cy="30" fill="#121414" r="1.5" stroke="#ff8c00" strokeWidth="1" vectorEffect="non-scaling-stroke"></circle>
                <circle cx="80" cy="15" fill="#121414" r="1.5" stroke="#ff8c00" strokeWidth="1" vectorEffect="non-scaling-stroke"></circle>
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="space-y-gutter">
          <div className="bg-surface-container border border-[#333333] flex flex-col h-full">
            <div className="px-5 py-4 border-b border-[#333333] bg-surface-container-high">
              <h2 className="font-title-md text-on-surface uppercase tracking-tight text-[16px]">Recent Activity</h2>
            </div>
            <div className="p-5 flex-1 relative">
              <div className="absolute left-[31px] top-5 bottom-5 w-px bg-[#333333]"></div>
              <ul className="space-y-6 relative">
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-surface-container border-2 border-primary-container z-10 flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                    <div className="w-2 h-2 bg-primary-container rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-body-md text-on-surface text-[14px]">New testimonial submitted by <span className="font-title-md text-primary-container">Rajesh Mehta</span></p>
                    <p className="font-label-sm text-on-surface-variant mt-1">2 hours ago</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-surface-container border-2 border-[#333333] z-10 flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">check</span>
                  </div>
                  <div>
                    <p className="font-body-md text-on-surface text-[14px]">Project '<span className="font-title-md">City Center Mall</span>' marked completed</p>
                    <p className="font-label-sm text-on-surface-variant mt-1">5 hours ago</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-surface-container border-2 border-[#333333] z-10 flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">person_add</span>
                  </div>
                  <div>
                    <p className="font-body-md text-on-surface text-[14px]">New admin/editor user registered</p>
                    <p className="font-label-sm text-on-surface-variant mt-1">Yesterday</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
