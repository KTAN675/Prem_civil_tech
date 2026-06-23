import React, { useState, useRef } from 'react';

export default function GalleryPanel({
  gallery,
  setGallery,
  fetchDashboardData,
  showFlashMessage,
  searchQuery
}) {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Category management & dynamic categories list
  const [customCategories, setCustomCategories] = useState(['Site Work', 'Repairs', 'Waterproofing', 'Team at Work']);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', category: '' });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fileInputRef = useRef(null);

  // Helper to resolve images from local backend or external
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    return `${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}${url}`;
  };

  // Compile list of all categories dynamically (default list + database items)
  const dbCategories = Array.from(new Set(gallery.map(item => item.category).filter(Boolean)));
  const allTabs = Array.from(new Set(['All', ...customCategories, ...dbCategories]));
  const allFormCategories = Array.from(new Set([...customCategories, ...dbCategories]));

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadMultipleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadMultipleFiles(Array.from(e.target.files));
    }
  };

  // Upload logic converting files to base64 and saving to DB
  const uploadMultipleFiles = async (files) => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Data = reader.result;
              const title = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              const category = activeTab === 'All' ? 'Site Work' : activeTab;
              
              const res = await fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/gallery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: title,
                  image_url: base64Data,
                  category: category
                })
              });
              if (!res.ok) throw new Error('Upload failed');
              resolve(await res.json());
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(new Error('File reading failed'));
          reader.readAsDataURL(file);
        });
      });

      await Promise.all(uploadPromises);
      showFlashMessage(`${files.length} image(s) uploaded successfully.`);
      fetchDashboardData();
    } catch (err) {
      alert(`Error uploading images: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Individual Delete
  const handleGalleryDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}/api/gallery/${itemId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete gallery item');
      setGallery(gallery.filter(g => g.id !== itemId));
      setSelectedIds(prev => prev.filter(id => id !== itemId));
      showFlashMessage('Gallery item deleted successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected item(s)?`)) return;
    
    setUploading(true);
    try {
      let successCount = 0;
      for (const id of selectedIds) {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}/api/gallery/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          successCount++;
        }
      }
      showFlashMessage(`Successfully deleted ${successCount} gallery items.`);
      setSelectedIds([]);
      fetchDashboardData();
    } catch (err) {
      alert(`Error during bulk deletion: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Toggle Selection
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(visibleItems.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Edit Handlers
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      title: item.title || '',
      category: item.category || 'Site Work'
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}/api/gallery/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!response.ok) throw new Error('Failed to update gallery item');
      showFlashMessage('Gallery item updated successfully.');
      setEditingItem(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Category management logic
  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (trimmed && !customCategories.includes(trimmed)) {
      setCustomCategories([...customCategories, trimmed]);
      setNewCategoryName('');
      showFlashMessage(`Category "${trimmed}" added.`);
    }
  };

  const handleRemoveCategory = (cat) => {
    if (confirm(`Remove custom category "${cat}" from filter list?`)) {
      setCustomCategories(customCategories.filter(c => c !== cat));
      showFlashMessage(`Category "${cat}" removed.`);
    }
  };

  // Filtering items by Active Tab & Search Query
  let filtered = [...gallery];
  if (activeTab !== 'All') {
    filtered = filtered.filter(item => item.category?.toLowerCase() === activeTab.toLowerCase());
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(item => 
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query))
    );
  }

  const visibleItems = filtered;

  // Pagination logic
  const totalResults = visibleItems.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  const currentItems = visibleItems.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedIds([]); // Clear selection when changing page
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for header action */}
      <input 
        type="file" 
        multiple 
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="sr-only" 
      />

      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display-lg text-display-lg font-black text-on-surface tracking-tight mb-2 uppercase">Gallery</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Manage and organize project imagery for the public portfolio.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCategoryModalOpen(true)}
            className="bg-surface-container border border-outline-variant text-on-surface px-6 py-3 rounded-sm font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-highest transition-colors flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
          >
            <span className="material-symbols-outlined text-[18px]">folder_open</span>
            Manage Categories
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-primary-container text-black px-6 py-3 rounded-sm font-label-sm text-label-sm uppercase tracking-wider font-bold hover:bg-[#e67e00] transition-colors flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.4)] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>
      </header>

      {/* Toolbar / Filters */}
      <div className="bg-surface-container border border-outline-variant rounded-sm p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto w-full md:w-auto pb-2 md:pb-0 gap-2 hide-scrollbar">
          {allTabs.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); setSelectedIds([]); }}
              className={`px-4 py-2 border font-label-sm text-label-sm uppercase tracking-wide rounded-sm whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-surface-container-highest border-outline-variant text-on-surface font-bold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Bulk Actions */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-outline-variant pt-4 md:pt-0">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5 border-2 border-outline-variant bg-surface-dim group-hover:border-primary-container transition-colors rounded-sm">
              <input 
                type="checkbox" 
                checked={visibleItems.length > 0 && selectedIds.length === visibleItems.length}
                onChange={handleSelectAll}
                className="absolute w-full h-full opacity-0 cursor-pointer peer" 
              />
              <span className={`material-symbols-outlined text-[16px] text-primary-container transition-opacity pointer-events-none ${
                selectedIds.length > 0 && selectedIds.length === visibleItems.length ? 'opacity-100' : 'opacity-0'
              }`}>check</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider group-hover:text-on-surface transition-colors">Select All</span>
          </label>
          
          <div className="w-[1px] h-6 bg-outline-variant hidden md:block"></div>
          
          <button 
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0 || uploading}
            className={`flex items-center gap-2 transition-colors font-label-sm text-label-sm uppercase tracking-wider ${
              selectedIds.length > 0 
                ? 'text-error hover:text-red-400 cursor-pointer' 
                : 'text-on-surface-variant opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete Selected {selectedIds.length > 0 && `(${selectedIds.length})`}
          </button>
        </div>
      </div>

      {/* Grid: Dropzone & Gallery Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Dropzone Card */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 mb-2">
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed transition-colors rounded-sm h-32 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden ${
              dragActive 
                ? 'border-primary bg-surface-container-highest' 
                : 'border-outline-variant bg-surface-container/50 hover:bg-surface-container'
            }`}
          >
            {/* Hazard Stripes bg subtle */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 20px)' }}></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:border-primary transition-all">
                <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
              </div>
              <div className="text-left">
                <p className="font-body-md text-body-md font-bold text-on-surface mb-1">
                  {uploading ? 'Processing files...' : 'Drag and drop images here'}
                </p>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">or click to browse files (JPG, PNG, WebP)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Items */}
        {currentItems.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div key={item.id} className="group relative aspect-[4/3] bg-surface-container border border-outline-variant rounded-sm overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
              <img 
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" 
                src={getImageUrl(item.image_url)} 
                alt={item.title || 'Gallery Asset'} 
              />
              
              {/* Top Gradient Overlay for readability */}
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none"></div>
              
              {/* Category Tag */}
              <div className="absolute top-3 right-3 pointer-events-none">
                <span className="inline-block bg-background/80 backdrop-blur-sm border border-outline-variant text-on-surface font-label-sm text-label-sm uppercase tracking-wider px-2 py-1 rounded-sm">
                  {item.category || 'Site Work'}
                </span>
              </div>

              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-20">
                <label className="flex items-center justify-center w-6 h-6 border-2 border-outline-variant bg-background/80 backdrop-blur-sm cursor-pointer hover:border-primary-container transition-colors rounded-sm">
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => toggleSelect(item.id)}
                    className="absolute w-full h-full opacity-0 cursor-pointer peer" 
                  />
                  <span className={`material-symbols-outlined text-[18px] text-primary-container transition-opacity pointer-events-none ${
                    isSelected ? 'opacity-100' : 'opacity-0'
                  }`}>check</span>
                </label>
              </div>

              {/* Title display on bottom overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8 transition-opacity duration-300">
                <p className="font-bold text-xs truncate text-on-surface">{item.title || 'Untitled'}</p>
              </div>

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-10 backdrop-blur-[2px]">
                <button 
                  onClick={() => openEditModal(item)}
                  className="w-10 h-10 bg-surface-container border border-outline-variant rounded-sm flex items-center justify-center text-on-surface hover:text-primary-container hover:border-primary-container transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                  title="Edit Info"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button 
                  onClick={() => handleGalleryDelete(item.id)}
                  className="w-10 h-10 bg-surface-container border border-outline-variant rounded-sm flex items-center justify-center text-on-surface hover:text-error hover:border-error transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                  title="Delete"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 text-on-surface-variant italic bg-surface-container/30 border border-outline-variant">
            No gallery assets matching the criteria found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button 
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 border border-outline-variant bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-highest transition-colors rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.2)] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-10 h-10 border flex items-center justify-center rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.2)] font-body-md font-bold transition-all ${
                  currentPage === pageNum
                    ? 'border-primary text-primary bg-surface-container-high'
                    : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button 
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 border border-outline-variant bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-highest transition-colors rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.2)] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      )}

      {/* =============================================================== */}
      {/* MODAL: MANAGE CATEGORIES */}
      {/* =============================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setCategoryModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <h4 className="font-title-md text-[18px] text-primary uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">folder</span>
              Manage Categories
            </h4>
            
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant uppercase mb-2">Create New Category</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    value={newCategoryName} 
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-surface-dim border border-outline-variant text-on-surface py-2 px-3 focus:outline-none focus:border-primary" 
                    placeholder="e.g. Concrete Pouring"
                  />
                  <button 
                    type="submit"
                    className="bg-primary-container text-black px-4 font-bold uppercase text-xs hover:bg-[#e67e00] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 border-t border-outline-variant pt-4">
              <h5 className="font-label-sm text-xs text-on-surface-variant uppercase mb-3">Active Categories</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {allFormCategories.map(cat => (
                  <div key={cat} className="flex justify-between items-center bg-surface-container-high border border-outline-variant p-2 rounded-sm">
                    <span className="text-sm text-on-surface font-body-md">{cat}</span>
                    {customCategories.includes(cat) && (
                      <button 
                        onClick={() => handleRemoveCategory(cat)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
                        title="Remove category"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant mt-6">
              <button 
                onClick={() => setCategoryModalOpen(false)}
                className="bg-transparent border border-outline-variant text-on-surface px-6 py-2 hover:border-on-surface transition-colors uppercase font-label-sm text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* MODAL: EDIT IMAGE DETAILS */}
      {/* =============================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <h4 className="font-title-md text-[18px] text-primary uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">edit_square</span>
              Edit Asset Details
            </h4>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant uppercase mb-1">Asset Title</label>
                <input 
                  type="text" 
                  value={editForm.title} 
                  onChange={e => setEditForm({...editForm, title: e.target.value})}
                  className="w-full bg-surface-dim border border-outline-variant text-on-surface py-2.5 px-3 focus:outline-none focus:border-primary" 
                  placeholder="e.g. Excavator foundation work"
                />
              </div>

              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant uppercase mb-1">Category</label>
                <select 
                  value={editForm.category} 
                  onChange={e => setEditForm({...editForm, category: e.target.value})}
                  className="w-full bg-surface-dim border border-outline-variant text-on-surface py-2.5 px-3 focus:outline-none"
                >
                  {allFormCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant mt-6">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)}
                  className="bg-transparent border border-outline-variant text-on-surface px-6 py-2 hover:border-on-surface transition-colors uppercase font-label-sm text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-primary-container text-black font-bold px-6 py-2 hover:bg-opacity-90 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.4)] uppercase font-label-sm text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
