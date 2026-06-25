import React, { useState, useEffect } from 'react';

export default function CareersPanel({ 
  applications, 
  setApplications, 
  loading, 
  fetchDashboardData, 
  showFlashMessage, 
  searchQuery 
}) {
  const [subTab, setSubTab] = useState('applications'); // 'applications' | 'openings'
  const [openings, setOpenings] = useState([]);
  const [loadingOpenings, setLoadingOpenings] = useState(false);

  // Filters for Applications
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPosition, setFilterPosition] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  // Job Opening Form State
  const [isEditingOpening, setIsEditingOpening] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openingForm, setOpeningForm] = useState({
    title: '',
    department: '',
    location: '',
    experience: '',
    description: '',
    is_active: 1
  });

  const statusOptions = ['Pending', 'Reviewed', 'Interview Scheduled', 'Accepted', 'Rejected'];

  // Fetch job openings
  const fetchOpenings = async () => {
    setLoadingOpenings(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}/api/careers/openings/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (response.ok) {
        setOpenings(await response.json());
      }
    } catch (err) {
      console.error('Error fetching job openings:', err);
    } finally {
      setLoadingOpenings(false);
    }
  };

  // Fetch openings when sub-tab switches to openings
  useEffect(() => {
    if (subTab === 'openings') {
      fetchOpenings();
    }
  }, [subTab]);

  // Handle Application Status Change
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}/api/careers/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      showFlashMessage(`Application status updated to "${newStatus}"`);
    } catch (err) {
      console.error(err);
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Application
  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}/api/careers/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete application');

      setApplications(prev => prev.filter(app => app.id !== id));
      showFlashMessage('Application deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

  // Submit Job Opening Form (Add or Edit)
  const handleOpeningSubmit = async (e) => {
    e.preventDefault();
    if (!openingForm.title || !openingForm.department || !openingForm.location || !openingForm.experience || !openingForm.description) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      const method = isEditingOpening ? 'PUT' : 'POST';
      const endpoint = isEditingOpening 
        ? `${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}/api/careers/openings/${editingId}`
        : `${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}/api/careers/openings`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(openingForm)
      });

      if (!response.ok) throw new Error('Failed to save job opening');

      showFlashMessage(isEditingOpening ? 'Job opening updated' : 'New job opening created');
      resetOpeningForm();
      fetchOpenings();
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

  // Delete Job Opening
  const handleDeleteOpening = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job opening? Candidates won\'t be able to apply to it.')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}/api/careers/openings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete opening');

      setOpenings(prev => prev.filter(op => op.id !== id));
      showFlashMessage('Job opening deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

  // Toggle Active Status directly
  const handleToggleActive = async (opening) => {
    const updatedStatus = opening.is_active === 1 ? 0 : 1;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}/api/careers/openings/${opening.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...opening,
          is_active: updatedStatus
        })
      });

      if (!response.ok) throw new Error('Failed to toggle status');

      setOpenings(prev => prev.map(op => op.id === opening.id ? { ...op, is_active: updatedStatus } : op));
      showFlashMessage(`Job opening set to ${updatedStatus === 1 ? 'Active' : 'Inactive'}`);
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

  // Set Opening into edit mode
  const handleEditOpeningClick = (opening) => {
    setIsEditingOpening(true);
    setEditingId(opening.id);
    setOpeningForm({
      title: opening.title,
      department: opening.department,
      location: opening.location,
      experience: opening.experience,
      description: opening.description,
      is_active: opening.is_active
    });
    // Scroll to form
    const formEl = document.getElementById('opening-form-box');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const resetOpeningForm = () => {
    setIsEditingOpening(false);
    setEditingId(null);
    setOpeningForm({
      title: '',
      department: '',
      location: '',
      experience: '',
      description: '',
      is_active: 1
    });
  };

  // Resume file link/download handler
  const handleResumeView = (resumeUrl, name) => {
    console.log("handleResumeView called with:", { resumeUrl, name });
    
    if (!resumeUrl) {
      console.warn("No resumeUrl provided.");
      alert('No resume uploaded.');
      return;
    }

    if (resumeUrl.startsWith('data:')) {
      try {
        console.log("Processing base64 Data URL resume...");
        const parts = resumeUrl.split(';base64,');
        if (parts.length !== 2) {
          throw new Error('Invalid data format');
        }

        const contentType = parts[0].split(':')[1];
        const rawBase64 = parts[1];

        // Decode base64 to binary bytes
        const binaryString = window.atob(rawBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Create Blob
        const blob = new Blob([bytes], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);

        // Determine extension
        let extension = '.pdf';
        if (contentType.includes('word') || contentType.includes('officedocument') || contentType.includes('msword')) {
          extension = '.docx';
        } else if (contentType.includes('png')) {
          extension = '.png';
        } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
          extension = '.jpg';
        }

        console.log(`Downloading base64 resume as blob with extension: ${extension}`);

        // Create download link and trigger click
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${name.replace(/\s+/g, '_')}_Resume${extension}`;
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error('Error decoding/downloading base64 resume:', err);
        alert('Failed to download base64 resume. File might be corrupted.');
      }
    } else {
      console.log("Opening relative/server URL path for resume...");
      // Relative file path on backend server
      const fullUrl = resumeUrl.startsWith('http') 
        ? resumeUrl 
        : `${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}${resumeUrl}`;
      
      console.log("Final full URL:", fullUrl);
      
      // Use dynamic link element click which is much less likely to be blocked by popup blockers than window.open
      try {
        const link = document.createElement('a');
        link.href = fullUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Link navigation failed, falling back to window.open", err);
        window.open(fullUrl, '_blank');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-950/40 text-amber-400 border border-amber-500/20';
      case 'Reviewed': return 'bg-sky-950/40 text-sky-400 border border-sky-500/20';
      case 'Interview Scheduled': return 'bg-purple-950/40 text-purple-400 border border-purple-500/20';
      case 'Accepted': return 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20';
      case 'Rejected': return 'bg-rose-950/40 text-rose-400 border border-rose-500/20';
      default: return 'bg-neutral-800 text-neutral-400 border border-neutral-700';
    }
  };

  // Applications Filter
  const uniquePositions = ['All', ...new Set(applications.map(app => app.position))];
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery
      ? app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.position.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesStatus = filterStatus === 'All' ? true : app.status === filterStatus;
    const matchesPosition = filterPosition === 'All' ? true : app.position === filterPosition;
    return matchesSearch && matchesStatus && matchesPosition;
  });

  // Openings Filter
  const filteredOpenings = openings.filter(op => {
    if (!searchQuery) return true;
    return op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           op.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
           op.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#333333] pb-6">
        <div>
          <h1 className="font-headline-lg text-on-surface uppercase tracking-tight">Careers Portal</h1>
          <p className="font-body-md text-on-surface-variant">Manage candidate applications and add/edit open job vacancies on the website.</p>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex border-b border-[#333333] gap-2">
        <button
          onClick={() => setSubTab('applications')}
          className={`px-6 py-3 font-title-md text-[14px] uppercase tracking-wider transition-all border-b-2 ${
            subTab === 'applications'
              ? 'border-primary-container text-primary-container bg-surface-container-high/30 font-bold'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Candidate Applications ({applications.length})
        </button>
        <button
          onClick={() => setSubTab('openings')}
          className={`px-6 py-3 font-title-md text-[14px] uppercase tracking-wider transition-all border-b-2 ${
            subTab === 'openings'
              ? 'border-primary-container text-primary-container bg-surface-container-high/30 font-bold'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Job Openings ({openings.length})
        </button>
      </div>

      {/* RENDER SUB-TAB: APPLICATIONS */}
      {subTab === 'applications' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-surface-container-lowest p-4 border border-[#333333] shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold mb-2">Filter by Status</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-surface border border-[#333333] text-on-surface p-2 text-sm outline-none focus:border-primary-container"
              >
                <option value="All">All Statuses</option>
                {statusOptions.map((st, i) => (
                  <option key={i} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold mb-2">Filter by Position</label>
              <select 
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="w-full bg-surface border border-[#333333] text-on-surface p-2 text-sm outline-none focus:border-primary-container"
              >
                {uniquePositions.map((pos, i) => (
                  <option key={i} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end justify-start md:justify-end gap-2 text-sm text-on-surface-variant p-2 font-semibold">
              Showing {filteredApplications.length} of {applications.length} applications
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-on-surface-variant">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-lowest border border-[#333333] shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">work_off</span>
              <h3 className="font-title-lg text-on-surface uppercase mb-1">No Applications</h3>
              <p className="text-on-surface-variant text-sm">No applications matching your current filter selections.</p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-[#333333] shadow-[4px_4px_0px_rgba(0,0,0,0.2)] overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#333333] bg-surface">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Candidate Info</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Position & Exp</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Resume</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-surface/50 transition-colors">
                      <td className="p-4">
                        <div className="font-title-md text-on-surface font-bold text-[14px]">{app.full_name}</div>
                        <div className="text-xs text-on-surface-variant mt-1 flex flex-col gap-0.5">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">mail</span> {app.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">call</span> {app.phone}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-on-surface text-[13px]">{app.position}</div>
                        <div className="text-xs text-primary-container font-mono mt-1">{app.experience} Exp</div>
                      </td>
                      <td className="p-4">
                        {app.resume_url ? (
                          <button 
                            onClick={() => handleResumeView(app.resume_url, app.full_name)}
                            className="bg-transparent border border-[#333333] hover:border-primary-container text-on-surface-variant hover:text-primary-container px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[1px_1px_0px_rgba(0,0,0,0.2)]"
                          >
                            <span className="material-symbols-outlined text-sm">download_file</span> View CV
                          </button>
                        ) : (
                          <span className="text-xs text-on-surface-variant italic">No file</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs uppercase font-mono tracking-wider font-semibold ${getStatusBadgeClass(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <select
                            disabled={updatingId === app.id}
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="bg-surface border border-[#333333] text-on-surface p-1.5 text-xs outline-none focus:border-primary-container disabled:opacity-50"
                          >
                            {statusOptions.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDeleteApplication(app.id)}
                            className="text-on-surface-variant hover:text-error p-1.5 hover:bg-red-950/20 border border-transparent hover:border-red-500/20 transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Cover letters */}
          {!loading && filteredApplications.some(app => app.message) && (
            <div className="space-y-4">
              <h3 className="font-title-lg text-on-surface uppercase border-b border-[#333333] pb-2">Cover Letters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredApplications
                  .filter(app => app.message && app.message.trim().length > 0)
                  .map((app) => (
                    <div key={app.id} className="bg-surface p-5 border border-[#333333] shadow-[3px_3px_0px_rgba(0,0,0,0.15)] flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-[#333333] pb-2">
                        <div>
                          <span className="font-bold text-on-surface text-[14px]">{app.full_name}</span>
                          <span className="text-xs text-on-surface-variant ml-2">({app.position})</span>
                        </div>
                        <span className="text-xs text-on-surface-variant font-mono">
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed italic bg-background p-3 border border-[#333333]/50">
                        "{app.message}"
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER SUB-TAB: JOB OPENINGS MANAGER */}
      {subTab === 'openings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
          
          {/* LEFT: JOB FORM */}
          <div id="opening-form-box" className="lg:col-span-1 bg-surface-container-lowest p-6 border border-[#333333] shadow-[4px_4px_0px_rgba(0,0,0,0.25)] flex flex-col gap-4">
            <div className="border-b border-[#333333] pb-3">
              <h3 className="font-title-lg text-on-surface uppercase tracking-wide">
                {isEditingOpening ? 'Edit Job Opening' : 'Add New Job Opening'}
              </h3>
              <p className="text-xs text-on-surface-variant">Configure job details to publish it live on the site.</p>
            </div>

            <form onSubmit={handleOpeningSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-on-surface-variant mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Civil Surveyor"
                  value={openingForm.title}
                  onChange={(e) => setOpeningForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-surface border border-[#333333] text-on-surface p-2 text-sm outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-on-surface-variant mb-1">Department *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering & Auditing"
                  value={openingForm.department}
                  onChange={(e) => setOpeningForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full bg-surface border border-[#333333] text-on-surface p-2 text-sm outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-on-surface-variant mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, MH (On-site)"
                  value={openingForm.location}
                  onChange={(e) => setOpeningForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-surface border border-[#333333] text-on-surface p-2 text-sm outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-on-surface-variant mb-1">Experience Required *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3-5 Years"
                  value={openingForm.experience}
                  onChange={(e) => setOpeningForm(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full bg-surface border border-[#333333] text-on-surface p-2 text-sm outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-on-surface-variant mb-1">Job Description *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Provide responsibilities, requirements, and project scope..."
                  value={openingForm.description}
                  onChange={(e) => setOpeningForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-surface border border-[#333333] text-on-surface p-2 text-sm outline-none focus:border-primary-container resize-y"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-on-surface-variant mb-1">Status</label>
                <select
                  value={openingForm.is_active}
                  onChange={(e) => setOpeningForm(prev => ({ ...prev, is_active: parseInt(e.target.value) }))}
                  className="w-full bg-surface border border-[#333333] text-on-surface p-2 text-sm outline-none focus:border-primary-container"
                >
                  <option value={1}>Active / Published</option>
                  <option value={0}>Draft / Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-grow bg-primary-container text-black font-semibold text-xs uppercase tracking-wider py-2.5 hover:bg-opacity-90 transition-all border border-primary shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                >
                  {isEditingOpening ? 'Save Changes' : 'Publish Job'}
                </button>
                {isEditingOpening && (
                  <button
                    type="button"
                    onClick={resetOpeningForm}
                    className="bg-transparent border border-[#333333] text-on-surface font-semibold text-xs uppercase tracking-wider px-4 py-2.5 hover:bg-surface transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT: JOB OPENINGS LIST */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-title-lg text-on-surface uppercase border-b border-[#333333] pb-2">
              Published Vacancies
            </h3>

            {loadingOpenings ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-on-surface-variant">Loading vacancies...</p>
              </div>
            ) : filteredOpenings.length === 0 ? (
              <div className="text-center py-16 bg-surface-container-lowest border border-[#333333] shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">work_off</span>
                <h4 className="font-title-lg text-on-surface uppercase mb-1">No Vacancies Found</h4>
                <p className="text-on-surface-variant text-sm">Add a new position using the form on the left to start receiving candidate applications.</p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-[#333333] shadow-[4px_4px_0px_rgba(0,0,0,0.2)] overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#333333] bg-surface">
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Position Info</th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Details</th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333333]">
                    {filteredOpenings.map((op) => (
                      <tr key={op.id} className="hover:bg-surface/50 transition-colors">
                        <td className="p-4">
                          <div className="font-title-md text-on-surface font-bold text-[14px]">{op.title}</div>
                          <div className="text-[11px] text-primary-container font-mono tracking-widest uppercase mt-0.5">{op.department}</div>
                        </td>
                        <td className="p-4 text-xs">
                          <div className="flex flex-col gap-0.5 text-on-surface-variant">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">location_on</span> {op.location}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-on-surface">
                              <span className="material-symbols-outlined text-[14px]">work</span> {op.experience} Exp
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleActive(op)}
                            className={`px-2.5 py-1 text-xs uppercase font-mono tracking-wider font-semibold border ${
                              op.is_active === 1
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/25 hover:bg-emerald-950/60'
                                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
                            }`}
                            title="Click to toggle status"
                          >
                            {op.is_active === 1 ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEditOpeningClick(op)}
                              className="text-on-surface-variant hover:text-primary-container p-1.5 hover:bg-primary-container/10 border border-transparent hover:border-primary-container/20 transition-all"
                              title="Edit vacancy details"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteOpening(op.id)}
                              className="text-on-surface-variant hover:text-error p-1.5 hover:bg-red-950/20 border border-transparent hover:border-red-500/20 transition-all"
                              title="Delete vacancy"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
