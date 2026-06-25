import React, { useState } from 'react';

export default function CareersPanel({ 
  applications, 
  setApplications, 
  loading, 
  fetchDashboardData, 
  showFlashMessage, 
  searchQuery 
}) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPosition, setFilterPosition] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  // Status options
  const statusOptions = ['Pending', 'Reviewed', 'Interview Scheduled', 'Accepted', 'Rejected'];

  // Change Application Status
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

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      // Update locally
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
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}/api/careers/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      setApplications(prev => prev.filter(app => app.id !== id));
      showFlashMessage('Application deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Error deleting application: ' + err.message);
    }
  };

  // Download/View Resume Helper
  const handleResumeView = (resumeUrl, name) => {
    if (!resumeUrl) {
      alert('No resume uploaded for this candidate.');
      return;
    }

    if (resumeUrl.startsWith('data:')) {
      // It's base64, open in a new tab
      try {
        const newTab = window.open();
        newTab.document.write(`<iframe src="${resumeUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      } catch (err) {
        // Fallback: download
        const link = document.createElement('a');
        link.href = resumeUrl;
        link.download = `${name.replace(/\s+/g, '_')}_Resume`;
        link.click();
      }
    } else {
      // It's a relative path on the server
      const fullUrl = resumeUrl.startsWith('http') 
        ? resumeUrl 
        : `${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}${resumeUrl}`;
      window.open(fullUrl, '_blank');
    }
  };

  // Status Badge classes helper
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-950/40 text-amber-400 border border-amber-500/20';
      case 'Reviewed':
        return 'bg-sky-950/40 text-sky-400 border border-sky-500/20';
      case 'Interview Scheduled':
        return 'bg-purple-950/40 text-purple-400 border border-purple-500/20';
      case 'Accepted':
        return 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-950/40 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-neutral-800 text-neutral-400 border border-neutral-700';
    }
  };

  // Extract unique positions for filter dropdown
  const uniquePositions = ['All', ...new Set(applications.map(app => app.position))];

  // Filtering Logic
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

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#333333] pb-6">
        <div>
          <h1 className="font-headline-lg text-on-surface uppercase tracking-tight">Job Applications</h1>
          <p className="font-body-md text-on-surface-variant">Review and manage candidates who applied on the website career page.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="bg-transparent border border-[#333333] text-on-surface hover:text-primary-container hover:border-primary-container px-4 py-2 font-label-md text-label-md uppercase tracking-wider transition-colors self-start md:self-auto"
        >
          Refresh Data
        </button>
      </div>

      {/* Filters Section */}
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

      {/* List and Table Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Loading job applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest border border-[#333333] shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">work_off</span>
          <h3 className="font-title-lg text-on-surface uppercase mb-1">No Applications Found</h3>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto">
            {applications.length === 0 
              ? 'No candidates have applied yet. Open positions are listed on the main site Careers page.' 
              : 'Adjust your search queries or filter selections to view matches.'}
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-[#333333] shadow-[4px_4px_0px_rgba(0,0,0,0.25)] overflow-x-auto">
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
                        <span className="material-symbols-outlined text-[12px]">mail</span>
                        {app.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">call</span>
                        {app.phone}
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
                        <span className="material-symbols-outlined text-sm">download_file</span>
                        View CV
                      </button>
                    ) : (
                      <span className="text-xs text-on-surface-variant italic">No attachment</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs uppercase font-mono tracking-wider font-semibold ${getStatusBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {/* Status select dropdown */}
                      <div className="relative inline-block text-left">
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
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-on-surface-variant hover:text-error p-1.5 hover:bg-red-950/20 border border-transparent hover:border-red-500/20 transition-all flex items-center justify-center"
                        title="Delete Application"
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

      {/* Candidate Message/Cover Letter Card Drawer */}
      {!loading && filteredApplications.some(app => app.message) && (
        <div className="space-y-4">
          <h3 className="font-title-lg text-on-surface uppercase border-b border-[#333333] pb-2">Cover Letters / Candidate Notes</h3>
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
  );
}
