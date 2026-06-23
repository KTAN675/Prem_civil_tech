import React, { useState } from 'react';

export default function LeadsPanel({
  leads,
  setLeads,
  selectedLead,
  setSelectedLead,
  loading,
  fetchDashboardData,
  showFlashMessage,
  searchQuery
}) {
  const [leadFilterTab, setLeadFilterTab] = useState('all'); // 'all' | 'new' | 'in_progress' | 'closed'
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | '30' | '7'
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  
  const [leadForm, setLeadForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    project_type: 'Structural Audit',
    budget_range: '',
    description: ''
  });

  // --- Lead Management Actions ---
  const handleLeadStatusChange = async (leadId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update lead status');
      
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(prev => ({ ...prev, status: newStatus }));
      }

      // Log status change activity in localStorage
      const savedLogs = localStorage.getItem(`lead_logs_${leadId}`);
      const logs = savedLogs ? JSON.parse(savedLogs) : [];
      const newLog = {
        text: `Status changed to ${newStatus.toUpperCase().replace('_', ' ')}`,
        date: new Date().toLocaleString(),
        by: 'Admin'
      };
      localStorage.setItem(`lead_logs_${leadId}`, JSON.stringify([...logs, newLog]));

      showFlashMessage('Lead status updated successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeadDelete = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/leads/${leadId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete lead');
      setLeads(leads.filter(l => l.id !== leadId));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(null);
      }
      showFlashMessage('Lead deleted successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm)
      });
      if (!response.ok) throw new Error('Failed to create quote request');
      
      showFlashMessage('New quote request created successfully.');
      setLeadModalOpen(false);
      setLeadForm({
        full_name: '',
        email: '',
        phone: '',
        project_type: 'Structural Audit',
        budget_range: '',
        description: ''
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      alert('No data to export.');
      return;
    }
    const headers = ['ID', 'Client Name', 'Email', 'Phone', 'Project Type', 'Budget Range', 'Description', 'Status', 'Date Submitted'];
    const csvRows = [
      headers.join(','),
      ...leads.map(l => [
        l.id,
        `"${(l.full_name || '').replace(/"/g, '""')}"`,
        l.email,
        l.phone || '',
        l.project_type,
        l.budget_range || '',
        `"${(l.description || '').replace(/"/g, '""')}"`,
        l.status,
        new Date(l.created_at).toLocaleString()
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending' || s === 'new') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 border border-primary-container text-primary-container bg-primary-container/10 font-label-sm text-[10px] uppercase tracking-wider font-semibold">
          NEW
        </span>
      );
    } else if (s === 'in_progress' || s === 'contacted') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 border border-tertiary-container text-tertiary-container bg-tertiary-container/10 font-label-sm text-[10px] uppercase tracking-wider relative overflow-hidden font-semibold">
          <div className="absolute inset-0 opacity-10 hazard-stripe"></div>
          <span className="relative z-10">IN PROGRESS</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 border border-[#444444] text-on-surface-variant bg-surface-container-high font-label-sm text-[10px] uppercase tracking-wider font-semibold">
          CLOSED
        </span>
      );
    }
  };

  // Advanced Filtering for Leads
  const getFilteredLeads = () => {
    let list = leads;

    // Filter by Tab
    if (leadFilterTab === 'new') {
      list = list.filter(l => l.status === 'pending' || l.status === 'new');
    } else if (leadFilterTab === 'in_progress') {
      list = list.filter(l => l.status === 'in_progress' || l.status === 'contacted');
    } else if (leadFilterTab === 'closed') {
      list = list.filter(l => l.status === 'closed' || l.status === 'resolved' || l.status === 'archived');
    }

    // Filter by Date
    if (dateFilter === '30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      list = list.filter(l => new Date(l.created_at) >= thirtyDaysAgo);
    } else if (dateFilter === '7') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      list = list.filter(l => new Date(l.created_at) >= sevenDaysAgo);
    }

    // Filter by Search Query
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      list = list.filter(l => 
        (l.full_name && l.full_name.toLowerCase().includes(lower)) ||
        (l.email && l.email.toLowerCase().includes(lower)) ||
        (l.phone && l.phone.toLowerCase().includes(lower)) ||
        (l.project_type && l.project_type.toLowerCase().includes(lower)) ||
        (l.description && l.description.toLowerCase().includes(lower))
      );
    }

    return list;
  };

  // Get Timeline data for Lead
  const getLeadTimeline = (lead) => {
    if (!lead) return [];
    
    let notes = [];
    try {
      const savedNotes = localStorage.getItem(`lead_notes_${lead.id}`);
      if (savedNotes) notes = JSON.parse(savedNotes);
    } catch (e) {
      console.error(e);
    }
    
    let logs = [];
    try {
      const savedLogs = localStorage.getItem(`lead_logs_${lead.id}`);
      if (savedLogs) logs = JSON.parse(savedLogs);
    } catch (e) {
      console.error(e);
    }
    
    const timeline = [
      ...notes.map(n => ({ type: 'note', text: n.text, date: n.date, by: n.by || 'Admin' })),
      ...logs.map(l => ({ type: 'log', text: l.text, date: l.date, by: l.by || 'System' })),
      {
        type: 'system',
        text: 'Quote Request Received',
        date: new Date(lead.created_at).toLocaleString(),
        by: 'System Generated'
      }
    ];
    
    return timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <>
      {selectedLead ? (
        /* --- LEAD DETAIL VIEW --- */
        <div className="space-y-gutter">
          {/* Detail Header */}
          <div className="bg-surface-container border border-[#333333] p-4 md:px-6 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedLead(null)} 
                className="flex items-center justify-center w-10 h-10 border border-[#333333] text-on-surface hover:border-primary-container hover:text-primary-container transition-colors bg-surface-container-low"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-title-md text-[18px] text-on-surface tracking-tight leading-tight">
                    Quote Request #{1000 + selectedLead.id}
                  </h2>
                  {getStatusBadge(selectedLead.status)}
                </div>
                <p className="font-body-md text-xs text-on-surface-variant mt-1">
                  Submitted: {new Date(selectedLead.created_at).toLocaleString()} • Ref: QR-{1000 + selectedLead.id}-{selectedLead.full_name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.print()} 
                className="px-4 py-2 border border-[#333333] text-on-surface font-label-sm text-xs uppercase hover:bg-surface-container-highest transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">print</span> Print
              </button>
            </div>
          </div>

          {/* Print Only Letterhead Header */}
          <div className="hidden print:block border-b border-black pb-4 mb-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-black uppercase" style={{ color: '#000000' }}>PREM CIVIL TECH SOLUTION</h1>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5" style={{ color: '#666666' }}>Structural Auditing & Civil Engineering Consultants</p>
              </div>
              <div className="text-right">
                <h2 className="text-sm font-bold text-black uppercase" style={{ color: '#000000' }}>Quote Request Report</h2>
                <p className="text-[10px] text-gray-600" style={{ color: '#666666' }}>Ref: QR-{1000 + selectedLead.id} • Date Printed: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Detail Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Left Column (Wider) */}
            <div className="lg:col-span-2 space-y-gutter">
              {/* Client Info Card */}
              <section className="bg-surface-container border border-[#333333] p-6">
                <h3 className="font-title-md text-sm text-primary-container mb-6 flex items-center gap-2 border-b border-[#333333] pb-4 uppercase">
                  <span className="material-symbols-outlined">corporate_fare</span> Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Company / Name</p>
                    <p className="font-body-lg text-sm text-on-surface">{selectedLead.full_name}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Budget / Range</p>
                    <p className="font-body-lg text-sm text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-primary-container font-semibold">monetization_on</span> 
                      {selectedLead.budget_range || 'Not Specified'}
                    </p>
                  </div>
                  <div>
                    <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Phone</p>
                    {selectedLead.phone ? (
                      <a className="font-body-lg text-sm text-on-surface hover:text-primary-container transition-colors flex items-center gap-1" href={`tel:${selectedLead.phone}`}>
                        <span className="material-symbols-outlined text-xs">call</span> {selectedLead.phone}
                      </a>
                    ) : (
                      <p className="text-sm text-on-surface-variant italic">No phone number provided</p>
                    )}
                  </div>
                  <div>
                    <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Email Address</p>
                    <a className="font-body-lg text-sm text-on-surface hover:text-primary-container transition-colors flex items-center gap-1" href={`mailto:${selectedLead.email}`}>
                      <span className="material-symbols-outlined text-xs">mail</span> {selectedLead.email}
                    </a>
                  </div>
                </div>
              </section>

              {/* Project Specifications */}
              <section className="bg-surface-container border border-[#333333] p-6">
                <div className="flex justify-between items-center border-b border-[#333333] pb-4 mb-6">
                  <h3 className="font-title-md text-sm text-primary-container flex items-center gap-2 uppercase">
                    <span className="material-symbols-outlined">architecture</span> Project Specifications
                  </h3>
                  <span className="bg-surface-container-lowest border border-[#333333] px-3 py-1 font-label-sm text-xs text-on-surface uppercase font-semibold">
                    {selectedLead.project_type}
                  </span>
                </div>
                <div className="mb-6">
                  <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">Scope / Description</p>
                  <p className="font-body-md text-sm text-on-surface leading-relaxed p-4 bg-surface-container-lowest border border-[#333333] whitespace-pre-wrap">
                    {selectedLead.description}
                  </p>
                </div>
                <div>
                  <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-3">Attached Media Reference</p>
                  {(() => {
                    let urls = [];
                    if (selectedLead.attachment_url && selectedLead.attachment_url !== 'null' && selectedLead.attachment_url !== '[]') {
                      try {
                        const parsed = JSON.parse(selectedLead.attachment_url);
                        if (Array.isArray(parsed)) {
                          urls = parsed.filter(u => u && u !== 'null');
                        } else if (typeof parsed === 'string' && parsed !== 'null') {
                          urls = [parsed];
                        } else {
                          urls = [selectedLead.attachment_url];
                        }
                      } catch (e) {
                        urls = [selectedLead.attachment_url];
                      }
                    }

                    if (urls.length === 0) {
                      return (
                        <p className="text-sm text-on-surface-variant italic p-4 bg-surface-container-lowest border border-[#333333] text-center">
                          No attached files or media references provided.
                        </p>
                      );
                    }

                    const getFullAttachmentUrl = (urlStr) => {
                      if (!urlStr) return '';
                      if (urlStr.startsWith('http') || urlStr.startsWith('data:')) {
                        return urlStr;
                      }
                      const cleanUrl = urlStr.startsWith('/') ? urlStr : `/${urlStr}`;
                      return `http://localhost:5000${cleanUrl}`;
                    };

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {urls.map((url, idx) => {
                          const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
                          const fullUrl = getFullAttachmentUrl(url);
                          return (
                            <div key={idx} className="relative group cursor-pointer border border-[#333333] aspect-square overflow-hidden bg-surface-container-lowest">
                              {isImage ? (
                                <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                  <img 
                                    className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300" 
                                    src={fullUrl} 
                                    alt="Client Attachment" 
                                    onError={(e) => {
                                      // If the image fails to load, fallback to doc icon
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span className="material-symbols-outlined text-white">zoom_in</span>
                                  </div>
                                </a>
                              ) : (
                                <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center w-full h-full text-on-surface hover:text-primary-container p-2 text-center transition-colors">
                                  <span className="material-symbols-outlined text-[32px] mb-1">description</span>
                                  <span className="text-[10px] break-all font-mono line-clamp-2 px-1">{url.split('/').pop()}</span>
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </section>
            </div>

            {/* Right Column (Narrower Control Panel) */}
            <div className="space-y-gutter">
              {/* Control Panel Card */}
              <section className="bg-surface-container border border-[#333333] p-6 border-t-4 border-t-primary-container print:hidden">
                <h3 className="font-title-md text-sm text-on-surface mb-4 flex items-center gap-2 uppercase">
                  <span className="material-symbols-outlined">admin_panel_settings</span> Control Panel
                </h3>
                <div className="space-y-6">
                  {/* Status Update */}
                  <div>
                    <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block mb-2">Current Status</label>
                    <div className="flex gap-2">
                      <select 
                        value={selectedLead.status}
                        onChange={(e) => handleLeadStatusChange(selectedLead.id, e.target.value)}
                        className="flex-1 bg-surface-container-lowest border border-[#333333] text-on-surface focus:border-primary-container focus:ring-0 p-2 font-body-md text-sm uppercase"
                      >
                        <option value="pending">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="closed">Closed / Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div>
                    <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block mb-2">Internal Engineering Notes</label>
                    <textarea 
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-[#333333] text-on-surface focus:border-primary-container focus:ring-0 p-3 font-body-md text-sm placeholder-on-surface-variant/50" 
                      placeholder="Add private admin notes here..." 
                      rows="4"
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <button 
                        type="button"
                        onClick={() => {
                          if (!newNoteText.trim()) return;
                          try {
                            const savedNotes = localStorage.getItem(`lead_notes_${selectedLead.id}`);
                            const notesList = savedNotes ? JSON.parse(savedNotes) : [];
                            const newNote = {
                              text: newNoteText,
                              date: new Date().toLocaleString(),
                              by: 'Admin'
                            };
                            localStorage.setItem(`lead_notes_${selectedLead.id}`, JSON.stringify([newNote, ...notesList]));
                            setNewNoteText('');
                            showFlashMessage('Engineering note recorded.');
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="bg-primary-container text-black font-semibold text-xs px-4 py-2 border border-primary-container hover:bg-opacity-90 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.4)]"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>

                  {/* Immediate Action Row */}
                  <div className="pt-4 border-t border-[#333333] flex flex-col gap-2">
                    <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block">Customer Outreach</label>
                    <a 
                      href={`https://wa.me/${(selectedLead.phone || '').replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-2 border border-green-500/30 text-green-400 hover:bg-green-950/20 transition-all font-label-sm text-xs uppercase"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span> WhatsApp Customer
                    </a>
                    {selectedLead.phone && (
                      <a 
                        href={`tel:${selectedLead.phone}`}
                        className="flex items-center justify-center gap-2 p-2 border border-[#333333] text-on-surface hover:bg-surface-container-high transition-all font-label-sm text-xs uppercase"
                      >
                        <span className="material-symbols-outlined text-[16px]">call</span> Place Voice Call
                      </a>
                    )}
                  </div>
                </div>
              </section>

              {/* Timeline Activity Log */}
              <section className="bg-surface-container border border-[#333333] p-6">
                <h3 className="font-title-md text-sm text-on-surface mb-6 flex items-center gap-2 uppercase">
                  <span className="material-symbols-outlined text-primary-container">history</span> Audit Timeline
                </h3>
                <div className="relative">
                  <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-[#333333]"></div>
                  <ul className="space-y-6 relative">
                    {getLeadTimeline(selectedLead).map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className={`w-5 h-5 rounded-full border z-10 flex items-center justify-center mt-1 mr-3 flex-shrink-0 ${
                          item.type === 'note' 
                            ? 'bg-[#121414] border-blue-500 text-blue-400' 
                            : item.type === 'log'
                            ? 'bg-[#121414] border-primary-container text-primary-container'
                            : 'bg-[#121414] border-[#444444] text-on-surface-variant'
                        }`}>
                          <span className="material-symbols-outlined text-[11px]">
                            {item.type === 'note' ? 'sticky_note_2' : item.type === 'log' ? 'edit' : 'mail'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-4">
                            <p className="font-body-md text-xs text-on-surface font-semibold leading-snug">{item.text}</p>
                            <span className="text-[10px] text-on-surface-variant font-mono whitespace-nowrap">{item.date}</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">By: {item.by}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : (
        /* --- LEADS MAIN TABLE PANEL --- */
        <div className="bg-surface-container border border-[#333333] flex flex-col p-5">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-title-md text-on-surface uppercase tracking-tight text-[18px]">Customer Enquiries</h2>
              <p className="text-xs text-on-surface-variant">Review structural audit quote requests and leads</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExportCSV}
                className="bg-transparent border border-[#333333] text-on-surface font-semibold text-xs px-4 py-2 hover:border-on-surface hover:bg-surface-container-high transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Export CSV
              </button>
              <button 
                onClick={() => setLeadModalOpen(true)}
                className="bg-primary-container text-black font-semibold text-xs px-4 py-2 border border-primary-container hover:bg-opacity-90 transition-all flex items-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Request
              </button>
            </div>
          </div>

          {/* Filtering Bar */}
          <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-6 border-b border-[#333333] pb-4">
            <div className="flex flex-wrap gap-2 w-full xl:w-auto">
              {[
                { id: 'all', label: 'All Requests' },
                { id: 'new', label: 'New / Pending' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'closed', label: 'Closed' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setLeadFilterTab(t.id)}
                  className={`px-3 py-1.5 font-label-sm text-xs uppercase border transition-colors ${
                    leadFilterTab === t.id 
                      ? 'border-primary-container bg-primary-container/10 text-primary-container' 
                      : 'border-[#333333] hover:border-on-surface text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Date & Tools */}
            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto items-center">
              {/* Date Dropdown */}
              <div className="relative w-full sm:w-auto">
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full sm:w-auto bg-surface-container-lowest border border-[#333333] text-on-surface py-2 px-4 pr-10 rounded text-xs focus:outline-none focus:border-primary-container appearance-none"
                >
                  <option value="all">All Dates</option>
                  <option value="30">Last 30 Days</option>
                  <option value="7">Last 7 Days</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">arrow_drop_down</span>
              </div>

              {/* Refresh Button */}
              <button 
                onClick={() => {
                  fetchDashboardData();
                  showFlashMessage('Leads and requests refreshed.');
                }}
                disabled={loading}
                className="flex items-center justify-center p-2 border border-[#333333] text-on-surface hover:border-primary-container hover:text-primary-container bg-surface-container-low transition-colors rounded h-9 w-9"
                title="Refresh List"
              >
                <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>sync</span>
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-surface-container border border-[#333333] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-[#333333] text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 whitespace-nowrap">Name</th>
                    <th className="px-6 py-4 whitespace-nowrap">Contact</th>
                    <th className="px-6 py-4 whitespace-nowrap">Service Requested</th>
                    <th className="px-6 py-4 whitespace-nowrap">Budget</th>
                    <th className="px-6 py-4 whitespace-nowrap">Date Submitted</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredLeads().map(lead => (
                    <tr key={lead.id} className="border-b border-[#333333] hover:bg-surface-container-high transition-colors text-[14px]">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-on-surface">{lead.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-on-surface-variant leading-tight">
                        <div className="flex items-center gap-1 font-body-md text-sm text-on-surface"><span className="material-symbols-outlined text-xs">mail</span> {lead.email}</div>
                        {lead.phone && <div className="flex items-center gap-1 mt-1 text-[11px]"><span className="material-symbols-outlined text-xs">call</span> {lead.phone}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-surface-container-lowest border border-[#333333] text-on-surface font-semibold text-xs">
                          {lead.project_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-body-md text-sm text-on-surface-variant">
                        {lead.budget_range || <span className="italic text-xs">Not Specified</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-on-surface-variant">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                        <button 
                          onClick={() => setSelectedLead(lead)} 
                          className="text-primary-container hover:bg-primary-container/10 p-2"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button 
                          onClick={() => handleLeadDelete(lead.id)} 
                          className="text-error hover:bg-error/10 p-2"
                          title="Delete Request"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {getFilteredLeads().length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-on-surface-variant italic">
                        No requests found matching parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Stats Footer */}
            <div className="bg-surface-container-lowest px-6 py-4 border-t border-[#333333] flex items-center justify-between">
              <p className="font-body-md text-xs text-on-surface-variant">
                Showing <span className="font-medium text-on-surface">{getFilteredLeads().length}</span> of <span className="font-medium text-on-surface">{leads.length}</span> total entries
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* MODAL: LEAD ADD */}
      {/* =============================================================== */}
      {leadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-surface-container border border-[#333333] w-full max-w-lg p-6 shadow-2xl relative">
            <h4 className="font-title-md text-[18px] text-primary-container uppercase tracking-tight mb-6">
              Create Quote Request
            </h4>
            
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant uppercase mb-1">Client Full Name *</label>
                <input 
                  type="text" 
                  required 
                  value={leadForm.full_name} 
                  onChange={e => setLeadForm({...leadForm, full_name: e.target.value})}
                  className="w-full bg-surface-dim border border-[#333333] text-on-surface py-2 px-3 focus:outline-none" 
                  placeholder="e.g. Ketan Patel"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-xs text-on-surface-variant uppercase mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    required 
                    value={leadForm.email} 
                    onChange={e => setLeadForm({...leadForm, email: e.target.value})}
                    className="w-full bg-surface-dim border border-[#333333] text-on-surface py-2 px-3 focus:outline-none" 
                    placeholder="name@company.com"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-xs text-on-surface-variant uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={leadForm.phone} 
                    onChange={e => setLeadForm({...leadForm, phone: e.target.value})}
                    className="w-full bg-surface-dim border border-[#333333] text-on-surface py-2 px-3 focus:outline-none" 
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-xs text-on-surface-variant uppercase mb-1">Project Type *</label>
                  <select 
                    value={leadForm.project_type} 
                    onChange={e => setLeadForm({...leadForm, project_type: e.target.value})}
                    className="w-full bg-surface-dim border border-[#333333] text-on-surface py-2 px-3"
                  >
                    <option value="Structural Audit">Structural Audit</option>
                    <option value="Building Repair">Building Repair</option>
                    <option value="Waterproofing">Waterproofing</option>
                    <option value="RCC Repair">RCC Repair</option>
                    <option value="Consultancy">Consultancy</option>
                    <option value="Renovation">Renovation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-xs text-on-surface-variant uppercase mb-1">Budget / Range</label>
                  <input 
                    type="text" 
                    value={leadForm.budget_range} 
                    onChange={e => setLeadForm({...leadForm, budget_range: e.target.value})}
                    className="w-full bg-surface-dim border border-[#333333] text-on-surface py-2 px-3 focus:outline-none" 
                    placeholder="e.g. ₹5,00,000"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant uppercase mb-1">Project Scope / Description *</label>
                <textarea 
                  rows="4"
                  required
                  value={leadForm.description} 
                  onChange={e => setLeadForm({...leadForm, description: e.target.value})}
                  className="w-full bg-surface-dim border border-[#333333] text-on-surface py-2 px-3 focus:outline-none" 
                  placeholder="Describe the structural work required..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#333333]">
                <button 
                  type="button" 
                  onClick={() => setLeadModalOpen(false)}
                  className="bg-transparent border border-[#333333] text-on-surface px-4 py-2 hover:border-on-surface transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-primary-container text-black font-semibold px-6 py-2 hover:bg-opacity-90 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.4)] font-bold"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
