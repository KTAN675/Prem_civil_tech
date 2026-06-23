import React, { useState } from 'react';

export default function TestimonialsPanel({
  testimonials,
  setTestimonials,
  showFlashMessage,
  searchQuery
}) {
  // Panel View State: 'list' | 'add' | 'edit'
  const [view, setView] = useState('list');
  const [currentTestimonial, setCurrentTestimonial] = useState(null);
  
  // Tab Filter state: 'All' | 'Published' | 'Pending'
  const [activeTabFilter, setActiveTabFilter] = useState('All');
  
  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form State
  const [formData, setFormData] = useState({
    client_name: '',
    company: '',
    rating: 5,
    quote: '',
    avatar_url: null,
    is_approved: false
  });

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className="material-symbols-outlined text-lg" 
          style={{ fontVariationSettings: `'FILL' ${i <= rating ? 1 : 0}` }}
        >
          star
        </span>
      );
    }
    return <div className="flex text-primary-container gap-0.5">{stars}</div>;
  };

  // Filter and Search logic
  const filteredTestimonials = testimonials.filter(test => {
    // 1. Tab Filter
    if (activeTabFilter === 'Published' && test.is_approved !== 1) return false;
    if (activeTabFilter === 'Pending' && test.is_approved === 1) return false;
    
    // 2. Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = test.client_name && test.client_name.toLowerCase().includes(query);
      const companyMatch = test.company && test.company.toLowerCase().includes(query);
      const quoteMatch = test.quote && test.quote.toLowerCase().includes(query);
      return nameMatch || companyMatch || quoteMatch;
    }
    
    return true;
  });

  // Pagination bounds
  const totalItems = filteredTestimonials.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTestimonials = filteredTestimonials.slice(startIndex, startIndex + itemsPerPage);

  // Checkbox Selection Helpers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedTestimonials.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // API Call Helpers
  const handleApproveToggle = async (testId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await fetch(`http://localhost:5000/api/testimonials/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update approval status');

      setTestimonials(testimonials.map(t => t.id === testId ? { ...t, is_approved: newStatus ? 1 : 0 } : t));
      showFlashMessage(newStatus ? 'Testimonial approved.' : 'Testimonial marked pending.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTestimonial = async (testId) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/testimonials/${testId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete testimonial');
      setTestimonials(testimonials.filter(t => t.id !== testId));
      setSelectedIds(prev => prev.filter(id => id !== testId));
      showFlashMessage('Testimonial deleted successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected testimonials?`)) return;
    try {
      let succeeded = 0;
      for (const id of selectedIds) {
        const response = await fetch(`http://localhost:5000/api/testimonials/${id}`, { method: 'DELETE' });
        if (response.ok) succeeded++;
      }
      setTestimonials(prev => prev.filter(t => !selectedIds.includes(t.id)));
      setSelectedIds([]);
      showFlashMessage(`Successfully deleted ${succeeded} testimonials.`);
    } catch (err) {
      alert('Error during bulk deletion: ' + err.message);
    }
  };

  const handleBulkApprove = async () => {
    try {
      let succeeded = 0;
      for (const id of selectedIds) {
        const response = await fetch(`http://localhost:5000/api/testimonials/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_approved: true })
        });
        if (response.ok) succeeded++;
      }
      setTestimonials(prev => prev.map(t => selectedIds.includes(t.id) ? { ...t, is_approved: 1 } : t));
      setSelectedIds([]);
      showFlashMessage(`Successfully approved ${succeeded} testimonials.`);
    } catch (err) {
      alert('Error during bulk approval: ' + err.message);
    }
  };

  // Form Mode triggers
  const handleAddClick = () => {
    setFormData({
      client_name: '',
      company: '',
      rating: 5,
      quote: '',
      avatar_url: null,
      is_approved: false
    });
    setView('add');
  };

  const handleEditClick = (testimonial) => {
    setCurrentTestimonial(testimonial);
    setFormData({
      client_name: testimonial.client_name,
      company: testimonial.company || '',
      rating: testimonial.rating || 5,
      quote: testimonial.quote,
      avatar_url: testimonial.avatar_url,
      is_approved: testimonial.is_approved === 1
    });
    setView('edit');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should not exceed 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should not exceed 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_name || !formData.quote) {
      alert("Client name and testimonial quote are required.");
      return;
    }

    try {
      if (view === 'add') {
        const res = await fetch('http://localhost:5000/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Failed to create testimonial');
        const result = await res.json();
        
        // Append to local list
        setTestimonials(prev => [
          {
            id: result.testimonialId,
            client_name: formData.client_name,
            company: formData.company,
            rating: formData.rating,
            quote: formData.quote,
            avatar_url: result.avatar_url,
            is_approved: formData.is_approved ? 1 : 0,
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
        showFlashMessage('Testimonial added successfully.');
      } else {
        // Edit mode
        const res = await fetch(`http://localhost:5000/api/testimonials/${currentTestimonial.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Failed to update testimonial');
        
        // Update local list
        setTestimonials(prev => prev.map(t => t.id === currentTestimonial.id ? {
          ...t,
          client_name: formData.client_name,
          company: formData.company,
          rating: formData.rating,
          quote: formData.quote,
          avatar_url: formData.avatar_url,
          is_approved: formData.is_approved ? 1 : 0
        } : t));
        showFlashMessage('Testimonial updated successfully.');
      }
      setView('list');
    } catch (err) {
      alert(err.message);
    }
  };

  // Render Form View (Add / Edit)
  if (view === 'add' || view === 'edit') {
    return (
      <div className="w-full">
        <div className="mb-8 flex items-center">
          <button 
            onClick={() => setView('list')}
            className="mr-4 text-on-surface hover:text-primary-container transition-colors focus:outline-none flex items-center"
          >
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
          </button>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            {view === 'add' ? 'Add Testimonial' : 'Edit Testimonial'}
          </h2>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-gutter shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] max-w-4xl">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase tracking-wide" htmlFor="clientName">Client Name</label>
                <input 
                  className="w-full bg-surface-container text-on-surface border border-outline-variant px-4 py-3 focus:outline-none focus:border-b-2 focus:border-b-primary-container font-body-md text-body-md" 
                  id="clientName" 
                  value={formData.client_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="Enter client's full name" 
                  type="text" 
                  required
                />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase tracking-wide" htmlFor="projectLocation">Project / Location</label>
                <input 
                  className="w-full bg-surface-container text-on-surface border border-outline-variant px-4 py-3 focus:outline-none focus:border-b-2 focus:border-b-primary-container font-body-md text-body-md" 
                  id="projectLocation" 
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="e.g., Highway Overpass, Sector 4" 
                  type="text" 
                />
              </div>
            </div>

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase tracking-wide">Star Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    className={`transition-colors ${star <= formData.rating ? 'text-primary-container' : 'text-on-surface-variant hover:text-primary-container'}`} 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  >
                    <span 
                      className="material-symbols-outlined text-2xl" 
                      style={{ fontVariationSettings: `'FILL' ${star <= formData.rating ? 1 : 0}` }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase tracking-wide" htmlFor="testimonialText">Testimonial Text</label>
              <textarea 
                className="w-full bg-surface-container text-on-surface border border-outline-variant px-4 py-3 focus:outline-none focus:border-b-2 focus:border-b-primary-container font-body-md text-body-md resize-none" 
                id="testimonialText" 
                value={formData.quote}
                onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value.slice(0, 500) }))}
                placeholder="Enter the testimonial quote..." 
                rows="5"
                required
              />
              <div className="text-right text-on-surface-variant font-label-sm text-label-sm mt-1">
                {formData.quote.length} / 500
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase tracking-wide">Client Photo</label>
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('avatar-input').click()}
                  className="border-2 border-dashed border-outline-variant bg-surface-container p-8 text-center flex flex-col items-center justify-center hover:border-primary-container transition-colors cursor-pointer group relative overflow-hidden h-[180px]"
                >
                  <input 
                    type="file" 
                    id="avatar-input" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {formData.avatar_url ? (
                    <div className="absolute inset-0 bg-surface-container flex flex-col items-center justify-center p-2">
                      <img 
                        src={formData.avatar_url.startsWith('data:') ? formData.avatar_url : `http://localhost:5000${formData.avatar_url}`} 
                        alt="Client Preview" 
                        className="h-[100px] w-[100px] object-cover border border-outline-variant mb-2"
                      />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, avatar_url: null }));
                        }}
                        className="text-error font-label-sm text-xs hover:underline uppercase"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary-container mb-2">cloud_upload</span>
                      <p className="font-body-md text-body-md text-on-surface">Drag &amp; drop or click to upload</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">JPG, PNG, max 2MB</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase tracking-wide">Status</label>
                <div className="flex items-center space-x-6 mt-4">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      className="form-radio text-primary-container bg-surface-container border-outline-variant focus:ring-primary-container w-5 h-5 cursor-pointer accent-primary-container" 
                      name="status" 
                      type="radio" 
                      checked={formData.is_approved === true}
                      onChange={() => setFormData(prev => ({ ...prev, is_approved: true }))}
                    />
                    <span className="ml-2 font-body-md text-body-md text-on-surface">Published</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      className="form-radio text-primary-container bg-surface-container border-outline-variant focus:ring-primary-container w-5 h-5 cursor-pointer accent-primary-container" 
                      name="status" 
                      type="radio" 
                      checked={formData.is_approved === false}
                      onChange={() => setFormData(prev => ({ ...prev, is_approved: false }))}
                    />
                    <span className="ml-2 font-body-md text-body-md text-on-surface">Pending</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant flex justify-end space-x-4">
              <button 
                className="px-6 py-3 border border-on-surface-variant text-on-surface-variant font-title-md text-title-md hover:bg-surface-container transition-colors" 
                type="button"
                onClick={() => setView('list')}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-3 bg-primary-container text-black font-title-md text-title-md hover:bg-[#d97700] transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]" 
                type="submit"
              >
                {view === 'add' ? 'Save Testimonial' : 'Update Testimonial'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render Table List View
  const pendingCount = testimonials.filter(t => t.is_approved !== 1).length;

  return (
    <div className="flex flex-col flex-grow">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-outline-variant pb-6">
        <div>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface font-extrabold uppercase tracking-tight">Testimonials</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Manage client feedback and project endorsements.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-primary-container text-on-primary-container hover:bg-inverse-primary transition-colors duration-200 px-6 py-3 font-label-sm text-label-sm uppercase flex items-center gap-2 border border-primary-container shrink-0"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          Add Testimonial
        </button>
      </div>

      {/* Controls Section: Tabs & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        {/* Filter Tabs */}
        <div className="flex border-b border-outline-variant w-full lg:w-auto">
          <button 
            onClick={() => { setActiveTabFilter('All'); setCurrentPage(1); }}
            className={`px-6 py-3 font-label-sm text-label-sm uppercase tracking-wider transition-colors ${
              activeTabFilter === 'All'
                ? 'text-primary-container border-b-2 border-primary-container bg-surface-container-low font-bold'
                : 'text-on-surface-variant hover:text-on-surface border-b-2 border-transparent hover:border-surface-variant'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => { setActiveTabFilter('Published'); setCurrentPage(1); }}
            className={`px-6 py-3 font-label-sm text-label-sm uppercase tracking-wider transition-colors ${
              activeTabFilter === 'Published'
                ? 'text-primary-container border-b-2 border-primary-container bg-surface-container-low font-bold'
                : 'text-on-surface-variant hover:text-on-surface border-b-2 border-transparent hover:border-surface-variant'
            }`}
          >
            Published
          </button>
          <button 
            onClick={() => { setActiveTabFilter('Pending'); setCurrentPage(1); }}
            className={`px-6 py-3 font-label-sm text-label-sm uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTabFilter === 'Pending'
                ? 'text-primary-container border-b-2 border-primary-container bg-surface-container-low font-bold'
                : 'text-on-surface-variant hover:text-on-surface border-b-2 border-transparent hover:border-surface-variant'
            }`}
          >
            Pending Approval
            {pendingCount > 0 && (
              <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-none text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bulk actions Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 bg-surface-container-low border border-primary-container p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary-container">info</span>
            <span className="font-body-md text-sm">{selectedIds.length} testimonials selected</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleBulkApprove}
              className="bg-surface-container border border-primary-container hover:bg-primary-container hover:text-black text-primary-container px-4 py-2 font-label-sm text-xs uppercase transition-all"
            >
              Approve Selected
            </button>
            <button 
              onClick={handleBulkDelete}
              className="bg-red-950/20 border border-error text-error hover:bg-error hover:text-black px-4 py-2 font-label-sm text-xs uppercase transition-all"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Data Table Canvas */}
      <div className="bg-surface-container border border-outline-variant overflow-x-auto flex-grow relative shadow-[0_4px_0_0_#333535] mb-6">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <th className="p-4 w-12 text-center">
                <input 
                  type="checkbox"
                  checked={paginatedTestimonials.length > 0 && paginatedTestimonials.every(t => selectedIds.includes(t.id))}
                  onChange={handleSelectAll}
                  className="bg-surface border-outline-variant checked:bg-primary-container checked:border-primary-container focus:ring-1 focus:ring-primary-container focus:ring-offset-0 focus:ring-offset-surface h-4 w-4 rounded-none accent-primary-container cursor-pointer"
                />
              </th>
              <th className="p-4 font-semibold">Client Name</th>
              <th className="p-4 font-semibold">Project / Location</th>
              <th className="p-4 font-semibold">Rating</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
            {paginatedTestimonials.map(test => {
              const isSelected = selectedIds.includes(test.id);
              return (
                <tr 
                  key={test.id} 
                  className={`hover:bg-surface-container-high transition-colors group ${
                    test.is_approved !== 1 ? 'bg-surface-container-low/30' : ''
                  }`}
                >
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(test.id, e.target.checked)}
                      className="bg-surface border-outline-variant checked:bg-primary-container checked:border-primary-container focus:ring-1 focus:ring-primary-container focus:ring-offset-0 focus:ring-offset-surface h-4 w-4 rounded-none accent-primary-container cursor-pointer"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {test.avatar_url ? (
                        <img 
                          src={`http://localhost:5000${test.avatar_url}`} 
                          alt={test.client_name} 
                          className="h-8 w-8 object-cover border border-outline-variant shrink-0" 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="h-8 w-8 bg-surface-container-high border border-outline-variant flex items-center justify-center font-label-sm text-label-sm text-on-surface font-bold shrink-0">
                          {getInitials(test.client_name)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold">{test.client_name}</span>
                        {test.designation && <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">{test.designation}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant max-w-[200px] truncate" title={test.company}>
                    {test.company || 'N/A'}
                  </td>
                  <td className="p-4">
                    {renderStars(test.rating)}
                  </td>
                  <td className="p-4">
                    {test.is_approved === 1 ? (
                      <span className="inline-block px-2 py-1 text-[11px] font-bold uppercase tracking-wider border border-[#00b5fc] text-[#00b5fc] bg-[#001e2e]">Published</span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-[11px] font-bold uppercase tracking-wider border border-primary-container text-primary-container bg-surface-container-low hazard-stripe">Pending</span>
                    )}
                  </td>
                  <td className="p-4 text-on-surface-variant text-sm">
                    {formatDate(test.created_at)}
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {test.is_approved !== 1 && (
                        <button 
                          onClick={() => handleApproveToggle(test.id, false)}
                          className="p-1.5 text-[#00b5fc] hover:text-[#c7e7ff] bg-surface border border-outline-variant hover:border-[#00b5fc] transition-colors" 
                          title="Approve"
                        >
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        </button>
                      )}
                      <button 
                        onClick={() => handleEditClick(test)}
                        className="p-1.5 text-on-surface-variant hover:text-on-surface bg-surface border border-outline-variant hover:border-surface-variant transition-colors" 
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteTestimonial(test.id)}
                        className="p-1.5 text-error hover:text-error-container bg-surface border border-outline-variant hover:border-error-container transition-colors" 
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginatedTestimonials.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-on-surface-variant">No testimonials match your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant">
          <span className="font-body-md text-sm text-on-surface-variant">
            Showing <strong className="text-on-surface">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong className="text-on-surface">{totalItems}</strong> results
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center border border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center border font-label-sm ${
                  currentPage === page 
                    ? 'border-primary-container bg-primary-container text-on-primary-container font-bold'
                    : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
