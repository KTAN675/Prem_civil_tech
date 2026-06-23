import React, { useState, useEffect } from 'react';

export default function ProjectsPanel({
  projects,
  setProjects,
  fetchDashboardData,
  showFlashMessage,
  searchQuery
}) {
  // Views: 'list' or 'form'
  const [formView, setFormView] = useState('list');
  const [editingProject, setEditingProject] = useState(null);
  const [editorMode, setEditorMode] = useState('edit'); // 'edit' | 'preview'
  
  // Table filtering, sorting, pagination states
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Ongoing' | 'Completed'
  const [sortBy, setSortBy] = useState('Date Added (Newest)'); // 'Date Added (Newest)' | 'Status' | 'Name (A-Z)'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [projectForm, setProjectForm] = useState({
    title: '', 
    category: 'Civil Engineering', 
    client: '', 
    location: '', 
    year: new Date().getFullYear(),
    commencement_date: '',
    executive_summary: '',
    description: '', 
    thumbnail_url: '',
    images: [], // Array of URLs or base64 strings
    is_featured: false, 
    status: 'Ongoing'
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, sortBy]);

  const handleCommencementChange = (dateVal) => {
    const year = dateVal ? new Date(dateVal).getFullYear() : new Date().getFullYear();
    setProjectForm({
      ...projectForm,
      commencement_date: dateVal,
      year: year
    });
  };

  const openAddView = () => {
    setEditingProject(null);
    setProjectForm({
      title: '', 
      category: 'Civil Engineering', 
      client: '', 
      location: '', 
      year: new Date().getFullYear(),
      commencement_date: '',
      executive_summary: '',
      description: '', 
      thumbnail_url: '',
      images: [],
      is_featured: false, 
      status: 'Ongoing'
    });
    setFormView('form');
  };

  const openEditView = (proj) => {
    setEditingProject(proj);
    
    // Parse images array
    let projImages = [];
    if (proj.images) {
      try {
        projImages = JSON.parse(proj.images);
        if (!Array.isArray(projImages)) projImages = [proj.images];
      } catch (e) {
        projImages = [proj.images];
      }
    }

    // Format date string for input (YYYY-MM-DD)
    let formattedDate = '';
    if (proj.commencement_date) {
      const d = new Date(proj.commencement_date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().split('T')[0];
      }
    }

    setProjectForm({
      title: proj.title || '',
      category: proj.category || 'Civil Engineering',
      client: proj.client || '',
      location: proj.location || '',
      year: proj.year || new Date().getFullYear(),
      commencement_date: formattedDate,
      executive_summary: proj.executive_summary || '',
      description: proj.description || '',
      thumbnail_url: proj.thumbnail_url || '',
      images: projImages,
      is_featured: !!proj.is_featured,
      status: proj.status || 'Ongoing'
    });
    setFormView('form');
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.category) {
      alert('Project Name and Category are required.');
      return;
    }

    // Set fallback thumbnail if none selected
    let finalForm = { ...projectForm };
    if (!finalForm.thumbnail_url && finalForm.images.length > 0) {
      finalForm.thumbnail_url = finalForm.images[0];
    }
    // Final fallback placeholder
    if (!finalForm.thumbnail_url) {
      finalForm.thumbnail_url = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMWGiMra6an6R1IBckSYOemZwkV54z6FKl-puBR5J8CHYVWoVO1MJ_QRN6LwqTPXtixkTT1QoSanW-xZ3sdLvqmacUzKzLSRE8ChJVCF_fg0ir2KKVzQFbkjEje_TPT0bvrSyUOanMbs_xVt3hIgyYIaB60o5jPvxy_PX8dQEyD-J7u3Oj1Nksit-CL4AnIkeKTVHeWEIiWR-rBokGsP7MioCjDKS-j3nYp3b6C9QOCdYYPIWG4sOu7aMXZ3BSquxjNumL8rX79Rk';
    }

    try {
      const url = editingProject 
        ? `http://localhost:5000/api/projects/${editingProject.id}`
        : 'http://localhost:5000/api/projects';
      
      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalForm)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save project');
      }

      showFlashMessage(editingProject ? 'Project updated successfully.' : 'Project created successfully.');
      setFormView('list');
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleProjectDelete = async (projId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete project');
      setProjects(projects.filter(p => p.id !== projId));
      showFlashMessage('Project deleted successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Drag & Drop / File uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setProjectForm(prev => {
          const newImages = [...prev.images, base64Data];
          return {
            ...prev,
            images: newImages,
            thumbnail_url: prev.thumbnail_url ? prev.thumbnail_url : base64Data // Auto-set first image as cover
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setProjectForm(prev => {
      const imageToRemove = prev.images[indexToRemove];
      const newImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      let newThumbnail = prev.thumbnail_url;
      
      // If the removed image was the cover, pick a new cover
      if (prev.thumbnail_url === imageToRemove) {
        newThumbnail = newImages.length > 0 ? newImages[0] : '';
      }

      return {
        ...prev,
        images: newImages,
        thumbnail_url: newThumbnail
      };
    });
  };

  const setAsCover = (imgUrl) => {
    setProjectForm(prev => ({
      ...prev,
      thumbnail_url: imgUrl
    }));
    showFlashMessage('Cover image updated.');
  };

  // Markdown RTF helper
  const applyFormatting = (format) => {
    const textarea = document.getElementById('techDoc');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = projectForm.description || '';
    const selectedText = text.substring(start, end);
    
    let prefix = '';
    let suffix = '';
    let placeholder = '';
    
    switch (format) {
      case 'bold':
        prefix = '**';
        suffix = '**';
        placeholder = 'bold text';
        break;
      case 'italic':
        prefix = '*';
        suffix = '*';
        placeholder = 'italic text';
        break;
      case 'underlined':
        prefix = '<u>';
        suffix = '</u>';
        placeholder = 'underlined text';
        break;
      case 'bullet':
        prefix = '\n- ';
        suffix = '';
        placeholder = 'List item';
        break;
      case 'number':
        prefix = '\n1. ';
        suffix = '';
        placeholder = 'List item';
        break;
      case 'link':
        prefix = '[';
        suffix = '](url)';
        placeholder = 'link text';
        break;
      default:
        break;
    }
    
    const content = selectedText || placeholder;
    const formattedText = `${prefix}${content}${suffix}`;
    const newValue = text.substring(0, start) + formattedText + text.substring(end);
    
    setProjectForm({ ...projectForm, description: newValue });
    
    setTimeout(() => {
      textarea.focus();
      const newStart = start + prefix.length;
      const newEnd = newStart + content.length;
      textarea.setSelectionRange(newStart, newEnd);
    }, 50);
  };

  // Handle auto list items on enter & double enter to exit list
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const textarea = e.target;
      const start = textarea.selectionStart;
      const text = textarea.value;
      
      // Find the start of the current line
      const lastNewline = text.lastIndexOf('\n', start - 1);
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const currentLine = text.substring(lineStart, start);
      
      // Check if current line is a numbered list: e.g. "1. " or "  2. something"
      const numMatch = currentLine.match(/^(\s*)(\d+)\.\s*(.*)$/);
      if (numMatch) {
        e.preventDefault();
        const indent = numMatch[1];
        const num = parseInt(numMatch[2], 10);
        const content = numMatch[3].trim();
        
        if (content === '') {
          // Empty list item - exit the list (remove the list prefix)
          const newValue = text.substring(0, lineStart) + text.substring(start);
          setProjectForm(prev => ({ ...prev, description: newValue }));
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(lineStart, lineStart);
          }, 0);
        } else {
          // Insert next list item
          const nextNum = num + 1;
          const insertText = `\n${indent}${nextNum}. `;
          const newValue = text.substring(0, start) + insertText + text.substring(start);
          setProjectForm(prev => ({ ...prev, description: newValue }));
          setTimeout(() => {
            textarea.focus();
            const newCursor = start + insertText.length;
            textarea.setSelectionRange(newCursor, newCursor);
          }, 0);
        }
        return;
      }
      
      // Check if current line is a bullet list: e.g. "- " or "  - something"
      const bulletMatch = currentLine.match(/^(\s*)-\s*(.*)$/);
      if (bulletMatch) {
        e.preventDefault();
        const indent = bulletMatch[1];
        const content = bulletMatch[2].trim();
        
        if (content === '') {
          // Empty bullet item - exit list
          const newValue = text.substring(0, lineStart) + text.substring(start);
          setProjectForm(prev => ({ ...prev, description: newValue }));
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(lineStart, lineStart);
          }, 0);
        } else {
          // Insert next bullet item
          const insertText = `\n${indent}- `;
          const newValue = text.substring(0, start) + insertText + text.substring(start);
          setProjectForm(prev => ({ ...prev, description: newValue }));
          setTimeout(() => {
            textarea.focus();
            const newCursor = start + insertText.length;
            textarea.setSelectionRange(newCursor, newCursor);
          }, 0);
        }
        return;
      }
    }
  };

  // Filter projects by Status tab & Search Query
  let filtered = [...projects];
  
  if (statusFilter !== 'All') {
    filtered = filtered.filter(p => p.status?.toLowerCase() === statusFilter.toLowerCase());
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      (p.title && p.title.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query)) ||
      (p.client && p.client.toLowerCase().includes(query)) ||
      (p.location && p.location.toLowerCase().includes(query))
    );
  }

  // Sort projects
  if (sortBy === 'Name (A-Z)') {
    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (sortBy === 'Status') {
    filtered.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
  } else {
    // Newest / default
    filtered.sort((a, b) => b.id - a.id);
  }

  // Pagination calculations
  const totalResults = filtered.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  const currentProjects = filtered.slice(startIndex, startIndex + pageSize);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="w-full">
      {formView === 'list' ? (
        /* =============================================================== */
        /* VIEW 1: PROJECTS LIST VIEW                                       */
        /* =============================================================== */
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Projects</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage all civil engineering and construction deployments.</p>
            </div>
            <button 
              onClick={openAddView}
              className="bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase px-6 py-3 border border-primary-container hover:bg-[#e67e00] transition-colors flex items-center gap-2 whitespace-nowrap shadow-[0_4px_0_0_rgba(255,140,0,0.4)] active:translate-y-1 active:shadow-none"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add New Project
            </button>
          </div>

          {/* Toolbar: Filters */}
          <div className="bg-surface-container border border-outline-variant p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex space-x-1 border border-outline-variant bg-surface p-1">
              {['All', 'Ongoing', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-2 font-label-sm text-label-sm uppercase transition-colors ${
                    statusFilter === tab 
                      ? 'bg-surface-container-high text-on-surface border border-outline-variant' 
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Sort By:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface border border-outline-variant text-on-surface font-body-md text-body-md py-1.5 pl-3 pr-8 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-none"
              >
                <option>Date Added (Newest)</option>
                <option>Status</option>
                <option>Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-surface-container border border-outline-variant overflow-x-auto relative">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-highest border-b-2 border-outline-variant">
                <tr>
                  <th className="py-4 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase w-16">Img</th>
                  <th className="py-4 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase min-w-[200px]">Project Name</th>
                  <th className="py-4 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Location</th>
                  <th className="py-4 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Category</th>
                  <th className="py-4 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Status</th>
                  <th className="py-4 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Date Added</th>
                  <th className="py-4 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {currentProjects.map((proj) => {
                  const isOngoing = proj.status?.toLowerCase() === 'ongoing';
                  const cleanThumbnail = getImageUrl(proj.thumbnail_url);

                  return (
                    <tr key={proj.id} className="hover:bg-surface-container-high transition-colors group">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 bg-surface border border-outline-variant overflow-hidden shrink-0">
                          <img 
                            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" 
                            src={cleanThumbnail} 
                            alt={proj.title} 
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-title-md text-title-md text-on-surface">{proj.title}</div>
                        <div className="font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">ID: PRJ-{proj.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-on-surface font-body-md text-body-md">
                          <span className="material-symbols-outlined text-[16px] mr-2 text-on-surface-variant">location_on</span>
                          {proj.location || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-body-md text-body-md text-on-surface">{proj.category}</td>
                      <td className="py-3 px-4">
                        {isOngoing ? (
                          <span className="inline-flex items-center px-2.5 py-1 border border-tertiary-fixed bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(199,231,255,0.1)_4px,rgba(199,231,255,0.1)_8px)] font-label-sm text-label-sm text-tertiary-fixed uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed mr-2"></span>
                            Ongoing
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 border border-secondary bg-surface font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[14px] mr-1">check</span>
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-body-md text-body-md text-on-surface-variant">
                        {formatDate(proj.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => openEditView(proj)}
                            className="p-1.5 text-on-surface-variant hover:text-primary transition-colors border border-transparent hover:border-outline-variant bg-surface-container hover:bg-surface"
                            title="Edit Project"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleProjectDelete(proj.id)}
                            className="p-1.5 text-on-surface-variant hover:text-error transition-colors border border-transparent hover:border-error-container bg-surface-container hover:bg-surface"
                            title="Delete Project"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {totalResults === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-on-surface-variant italic">
                      No project deployments found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Footer */}
            {totalResults > 0 && (
              <div className="bg-surface-container-high border-t border-outline-variant px-4 py-3 flex items-center justify-between">
                <div className="font-body-md text-body-md text-on-surface-variant">
                  Showing <span className="font-bold text-on-surface">{startIndex + 1}</span> to <span className="font-bold text-on-surface">{endIndex}</span> of <span className="font-bold text-on-surface">{totalResults}</span> results
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center border border-outline-variant bg-surface text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-8 h-8 flex items-center justify-center font-label-sm text-label-sm border transition-colors ${
                        currentPage === idx + 1
                          ? 'border-primary bg-primary text-on-primary font-bold'
                          : 'border-outline-variant bg-surface text-on-surface hover:border-primary hover:text-primary'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center border border-outline-variant bg-surface text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* =============================================================== */
        /* VIEW 2: ADD/EDIT PROJECT VIEW                                    */
        /* =============================================================== */
        <form onSubmit={handleProjectSubmit} className="space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
            <div className="flex items-center space-x-4">
              <button 
                type="button"
                onClick={() => setFormView('list')}
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-none border border-outline-variant bg-surface-container hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-extrabold text-on-surface tracking-tight uppercase">
                  {editingProject ? 'Edit Project Specifications' : 'Add New Project'}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Enter technical specifications and documentation for structural developments.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex space-x-4">
              <button 
                type="button"
                onClick={() => setFormView('list')}
                className="px-6 py-2 border border-outline-variant text-on-surface font-label-sm text-label-sm uppercase tracking-wide hover:bg-surface-container transition-colors rounded-none"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase font-bold tracking-wide hover:bg-opacity-90 transition-colors rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,0.6)]"
              >
                Save Project
              </button>
            </div>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Specs */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-surface-container border border-outline-variant p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-surface-variant opacity-50 m-2"></div>
                <h3 className="font-title-md text-title-md font-bold uppercase text-primary mb-6 border-b border-outline-variant pb-2 flex items-center">
                  <span className="material-symbols-outlined mr-2">analytics</span> Project Specs
                </h3>

                <div className="space-y-5">
                  <div>
                    <label className="block font-label-sm text-label-sm uppercase text-on-surface-variant mb-2">Project Name *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Delta Steel Frameworks"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      className="w-full bg-surface-dim border-b-2 border-t-0 border-l-0 border-r-0 border-outline-variant focus:border-primary focus:ring-0 text-on-surface font-body-md text-body-md py-3 px-4 rounded-none transition-colors outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block font-label-sm text-label-sm uppercase text-on-surface-variant mb-2">Location</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">location_on</span>
                      <input 
                        type="text"
                        placeholder="e.g. Sector 7G, Industrial Zone"
                        value={projectForm.location}
                        onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                        className="w-full bg-surface-dim border-b-2 border-t-0 border-l-0 border-r-0 border-outline-variant focus:border-primary focus:ring-0 text-on-surface font-body-md text-body-md py-3 pl-10 pr-4 rounded-none transition-colors outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-sm text-label-sm uppercase text-on-surface-variant mb-2">Category *</label>
                      <select 
                        value={projectForm.category}
                        onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                        className="w-full bg-surface-dim border-b-2 border-t-0 border-l-0 border-r-0 border-outline-variant focus:border-primary focus:ring-0 text-on-surface font-body-md text-body-md py-3 px-4 rounded-none transition-colors appearance-none"
                      >
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Residential">Residential</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm uppercase text-on-surface-variant mb-2">Commencement</label>
                      <input 
                        type="date"
                        value={projectForm.commencement_date}
                        onChange={(e) => handleCommencementChange(e.target.value)}
                        className="w-full bg-surface-dim border-b-2 border-t-0 border-l-0 border-r-0 border-outline-variant focus:border-primary focus:ring-0 text-on-surface font-body-md text-body-md py-3 px-4 rounded-none transition-colors [color-scheme:dark] outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-sm text-label-sm uppercase text-on-surface-variant mb-2">Client</label>
                      <input 
                        type="text"
                        placeholder="e.g. Logix Corp"
                        value={projectForm.client}
                        onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                        className="w-full bg-surface-dim border-b-2 border-t-0 border-l-0 border-r-0 border-outline-variant focus:border-primary focus:ring-0 text-on-surface font-body-md text-body-md py-3 px-4 rounded-none transition-colors outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm uppercase text-on-surface-variant mb-2">Target Year</label>
                      <input 
                        type="number"
                        placeholder="2026"
                        value={projectForm.year}
                        onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value ? parseInt(e.target.value, 10) : '' })}
                        className="w-full bg-surface-dim border-b-2 border-t-0 border-l-0 border-r-0 border-outline-variant focus:border-primary focus:ring-0 text-on-surface font-body-md text-body-md py-3 px-4 rounded-none transition-colors outline-none" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-sm text-label-sm uppercase text-on-surface-variant mb-3">Operational Status</label>
                    <div className="flex space-x-4">
                      <label className={`flex-1 flex items-center justify-center p-3 border cursor-pointer font-label-sm text-label-sm uppercase tracking-wide transition-colors ${
                        projectForm.status === 'Ongoing'
                          ? 'bg-primary-container text-on-primary-container border-primary-container font-semibold'
                          : 'border-outline-variant bg-surface-dim hover:border-primary text-on-surface-variant'
                      }`}>
                        <input 
                          type="radio" 
                          name="status"
                          value="Ongoing"
                          checked={projectForm.status === 'Ongoing'}
                          onChange={() => setProjectForm({ ...projectForm, status: 'Ongoing' })}
                          className="sr-only"
                        />
                        <span className="material-symbols-outlined mr-2 text-sm">autorenew</span> Ongoing
                      </label>
                      <label className={`flex-1 flex items-center justify-center p-3 border cursor-pointer font-label-sm text-label-sm uppercase tracking-wide transition-colors ${
                        projectForm.status === 'Completed'
                          ? 'bg-primary-container text-on-primary-container border-primary-container font-semibold'
                          : 'border-outline-variant bg-surface-dim hover:border-primary text-on-surface-variant'
                      }`}>
                        <input 
                          type="radio" 
                          name="status"
                          value="Completed"
                          checked={projectForm.status === 'Completed'}
                          onChange={() => setProjectForm({ ...projectForm, status: 'Completed' })}
                          className="sr-only"
                        />
                        <span className="material-symbols-outlined mr-2 text-sm">check_circle</span> Completed
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="is_featured_project"
                      checked={projectForm.is_featured} 
                      onChange={e => setProjectForm({...projectForm, is_featured: e.target.checked})}
                      className="h-5 w-5 bg-surface-dim border border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 transition-colors"
                    />
                    <label htmlFor="is_featured_project" className="font-body-md text-sm text-on-surface cursor-pointer select-none">
                      Feature project on website homepage
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Documentation */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-surface-container border border-outline-variant p-6 h-full flex flex-col">
                <h3 className="font-title-md text-title-md font-bold uppercase text-primary mb-6 border-b border-outline-variant pb-2 flex items-center">
                  <span className="material-symbols-outlined mr-2">description</span> Documentation
                </h3>

                <div className="space-y-6 flex-1 flex flex-col">
                  <div>
                    <label className="block font-label-sm text-label-sm uppercase text-on-surface-variant mb-2">Executive Summary (Short)</label>
                    <textarea 
                      placeholder="Brief overview of the project scope and objectives..." 
                      rows="2"
                      value={projectForm.executive_summary}
                      onChange={(e) => setProjectForm({ ...projectForm, executive_summary: e.target.value })}
                      className="w-full bg-surface-dim border-b-2 border-t-0 border-l-0 border-r-0 border-outline-variant focus:border-primary focus:ring-0 text-on-surface font-body-md text-body-md py-3 px-4 rounded-none transition-colors resize-none outline-none" 
                    />
                  </div>

                  <div className="flex-1 flex flex-col min-h-[300px]">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-label-sm text-label-sm uppercase text-on-surface-variant">Technical Documentation</label>
                      <div className="flex border border-outline-variant bg-surface p-0.5">
                        <button
                          type="button"
                          onClick={() => setEditorMode('edit')}
                          className={`px-3 py-1 font-label-sm text-[11px] uppercase transition-colors ${
                            editorMode === 'edit'
                              ? 'bg-surface-container-high text-on-surface border border-outline-variant'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          Edit spec
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorMode('preview')}
                          className={`px-3 py-1 font-label-sm text-[11px] uppercase transition-colors ${
                            editorMode === 'preview'
                              ? 'bg-surface-container-high text-on-surface border border-outline-variant'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          Live Preview
                        </button>
                      </div>
                    </div>
                    
                    <div className="border border-outline-variant bg-surface-dim flex flex-col flex-grow min-h-[250px]">
                      {editorMode === 'edit' ? (
                        <>
                          {/* simulated RTF Toolbar */}
                          <div className="border-b border-outline-variant bg-surface-container-high p-2 flex items-center space-x-1 flex-wrap">
                            <button 
                              type="button" 
                              onClick={() => applyFormatting('bold')}
                              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
                              title="Bold Text"
                            >
                              <span className="material-symbols-outlined text-sm">format_bold</span>
                            </button>
                            <button 
                              type="button" 
                              onClick={() => applyFormatting('italic')}
                              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
                              title="Italic Text"
                            >
                              <span className="material-symbols-outlined text-sm">format_italic</span>
                            </button>
                            <button 
                              type="button" 
                              onClick={() => applyFormatting('underlined')}
                              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
                              title="Underline Text"
                            >
                              <span className="material-symbols-outlined text-sm">format_underlined</span>
                            </button>
                            <div className="w-px h-6 bg-outline-variant mx-2"></div>
                            <button 
                              type="button" 
                              onClick={() => applyFormatting('bullet')}
                              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
                              title="Bullet List"
                            >
                              <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                            </button>
                            <button 
                              type="button" 
                              onClick={() => applyFormatting('number')}
                              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
                              title="Numbered List"
                            >
                              <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                            </button>
                            <div className="w-px h-6 bg-outline-variant mx-2"></div>
                            <button 
                              type="button" 
                              onClick={() => applyFormatting('link')}
                              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
                              title="Insert Link"
                            >
                              <span className="material-symbols-outlined text-sm">link</span>
                            </button>
                          </div>
                          <textarea 
                            id="techDoc"
                            placeholder="Enter detailed structural specifications, materials used, challenges overcome, and final outcomes..."
                            value={projectForm.description}
                            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                            onKeyDown={handleKeyDown}
                            className="w-full flex-grow bg-transparent border-none focus:ring-0 text-on-surface font-body-md text-body-md p-4 resize-none outline-none min-h-[220px]" 
                          />
                        </>
                      ) : (
                        <div className="w-full flex-grow p-4 overflow-y-auto max-h-[350px] font-body-md text-sm text-on-surface leading-relaxed whitespace-pre-wrap bg-surface-container-lowest">
                          {(() => {
                            const text = projectForm.description;
                            if (!text) return <p className="text-on-surface-variant italic">No documentation entered yet.</p>;
                            return text.split('\n').map((line, idx) => {
                              let formatted = line;
                              formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                              formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
                              formatted = formatted.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
                              formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #ff8c00" class="hover:underline">$1</a>');

                              if (line.trim().startsWith('- ')) {
                                return <li key={idx} className="ml-4 list-disc text-on-surface mb-1 font-body-md" dangerouslySetInnerHTML={{ __html: formatted.replace(/^- /, '') }} />;
                              }
                              if (line.trim().match(/^\d+\.\s/)) {
                                return <li key={idx} className="ml-4 list-decimal text-on-surface mb-1 font-body-md" dangerouslySetInnerHTML={{ __html: formatted.replace(/^\d+\.\s/, '') }} />;
                              }
                              return <p key={idx} className="mb-3 text-on-surface leading-relaxed font-body-md" dangerouslySetInnerHTML={{ __html: formatted }} />;
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Media Upload Section */}
          <div className="bg-surface-container border border-outline-variant p-6">
            <h3 className="font-title-md text-title-md font-bold uppercase text-primary mb-6 border-b border-outline-variant pb-2 flex items-center">
              <span className="material-symbols-outlined mr-2">photo_library</span> Media Assets
            </h3>
            
            <label className="border-2 border-dashed border-outline-variant bg-surface-dim p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors group relative overflow-hidden block">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileUpload}
                className="sr-only" 
              />
              {/* Hazard Stripes subtle background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 20px)' }}></div>
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors z-10">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-on-primary-container">cloud_upload</span>
              </div>
              <h4 className="font-title-md text-title-md font-bold text-on-surface uppercase z-10">Drag & Drop Blueprints/Photos</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md z-10">Upload high-resolution images of the project. Supported formats: JPG, PNG, PDF (Max 20MB per file).</p>
              <span className="mt-6 px-6 py-2 border border-outline-variant bg-surface-container text-on-surface font-label-sm text-label-sm uppercase hover:border-primary transition-colors z-10 inline-block">Browse Files</span>
            </label>

            {/* Uploaded Thumbnails */}
            {projectForm.images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {projectForm.images.map((img, idx) => {
                  const cleanImg = getImageUrl(img);
                  
                  const isCover = projectForm.thumbnail_url === img;

                  return (
                    <div key={idx} className={`relative group border aspect-square bg-surface-dim flex items-center justify-center overflow-hidden transition-all ${
                      isCover ? 'border-primary shadow-[0_0_8px_rgba(255,140,0,0.5)]' : 'border-outline-variant'
                    }`}>
                      <img 
                        className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" 
                        src={cleanImg} 
                        alt="Project Media" 
                      />
                      
                      {/* Cover Badge */}
                      {isCover && (
                        <div className="absolute top-2 left-2 bg-primary text-black font-label-sm text-[10px] uppercase font-bold px-1.5 py-0.5 tracking-wider">
                          Cover
                        </div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-background/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        {!isCover && (
                          <button 
                            type="button"
                            onClick={() => setAsCover(img)}
                            className="w-full py-1 text-[11px] font-label-sm uppercase tracking-wide bg-surface-container-high text-on-surface hover:bg-primary hover:text-black transition-colors"
                          >
                            Set Cover
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-2 bg-error text-on-error hover:bg-error-container transition-colors rounded-none"
                          title="Delete image"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                {/* Plus placeholder for next upload */}
                <label className="border border-outline-variant border-dashed aspect-square bg-surface-dim flex flex-col items-center justify-center text-on-surface-variant opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only" 
                  />
                  <span className="material-symbols-outlined mb-2">add_photo_alternate</span>
                  <span className="font-label-sm text-label-sm uppercase">Upload</span>
                </label>
              </div>
            )}
          </div>

          {/* Bottom Sticky Action Bar (For Mobile & General Desktop Form Submission) */}
          <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-surface-container border-t border-outline-variant p-4 flex justify-end space-x-4 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.5)] print:hidden">
            <button 
              type="button"
              onClick={() => setFormView('list')}
              className="px-6 py-2.5 border border-outline-variant text-on-surface font-label-sm text-label-sm uppercase tracking-wide bg-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-2.5 bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase font-bold tracking-wide hover:bg-opacity-90 transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,0.6)]"
            >
              Publish Project
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
