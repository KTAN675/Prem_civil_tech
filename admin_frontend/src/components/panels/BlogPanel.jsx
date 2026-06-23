import React, { useState } from 'react';

export default function BlogPanel({
  blogs,
  setBlogs,
  showFlashMessage,
  searchQuery
}) {
  // Panel View State: 'list' | 'add' | 'edit' | 'preview'
  const [view, setView] = useState('list');
  const [currentPost, setCurrentPost] = useState(null);
  const [editorMode, setEditorMode] = useState('edit'); // 'edit' | 'preview'
  
  // Category filter state (local)
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Tag input state (local)
  const [tagInput, setTagInput] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Structural Engineering',
    tags: [],
    author: 'Admin',
    image_url: null,
    meta_description: '',
    status: 'Draft'
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper to insert formatting in simulated editor
  const applyFormatting = (format) => {
    const textarea = document.getElementById('editor-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content || '';
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
      case 'image':
        prefix = '![';
        suffix = '](image_url)';
        placeholder = 'image description';
        break;
      case 'h2':
        prefix = '\n## ';
        suffix = '\n';
        placeholder = 'Heading 2';
        break;
      case 'h3':
        prefix = '\n### ';
        suffix = '\n';
        placeholder = 'Heading 3';
        break;
      default:
        break;
    }
    
    const content = selectedText || placeholder;
    const formattedText = `${prefix}${content}${suffix}`;
    const newValue = text.substring(0, start) + formattedText + text.substring(end);
    
    setFormData(prev => ({ ...prev, content: newValue }));
    
    setTimeout(() => {
      textarea.focus();
      const newStart = start + prefix.length;
      const newEnd = newStart + content.length;
      textarea.setSelectionRange(newStart, newEnd);
    }, 50);
  };

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
          // Empty list item - exit the list
          const newValue = text.substring(0, lineStart) + text.substring(start);
          setFormData(prev => ({ ...prev, content: newValue }));
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(lineStart, lineStart);
          }, 0);
        } else {
          // Insert next list item
          const nextNum = num + 1;
          const insertText = `\n${indent}${nextNum}. `;
          const newValue = text.substring(0, start) + insertText + text.substring(start);
          setFormData(prev => ({ ...prev, content: newValue }));
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
          setFormData(prev => ({ ...prev, content: newValue }));
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(lineStart, lineStart);
          }, 0);
        } else {
          // Insert next bullet item
          const insertText = `\n${indent}- `;
          const newValue = text.substring(0, start) + insertText + text.substring(start);
          setFormData(prev => ({ ...prev, content: newValue }));
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

  // Filter and Search logic
  const filteredBlogs = blogs.filter(post => {
    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = post.title && post.title.toLowerCase().includes(q);
      const contentMatch = post.content && post.content.toLowerCase().includes(q);
      if (!titleMatch && !contentMatch) return false;
    }
    
    // 2. Category Filter
    if (categoryFilter) {
      if (post.category !== categoryFilter) return false;
    }

    return true;
  });

  // Pagination bounds
  const totalItems = filteredBlogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + itemsPerPage);

  // File drop/upload handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should not exceed 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result }));
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
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should not exceed 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Tag helper functions
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/,/g, '');
      if (cleanTag && !formData.tags.includes(cleanTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, cleanTag]
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // CRUD actions
  const handleAddClick = () => {
    setFormData({
      title: '',
      content: '',
      category: 'Structural Engineering',
      tags: [],
      author: 'Admin',
      image_url: null,
      meta_description: '',
      status: 'Draft'
    });
    setView('add');
  };

  const handleEditClick = (post) => {
    setCurrentPost(post);
    // Parse tags (tags is stored as comma separated list in database)
    const tagList = post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category || 'Structural Engineering',
      tags: tagList,
      author: post.author || 'Admin',
      image_url: post.image_url,
      meta_description: post.meta_description || '',
      status: post.status || 'Draft'
    });
    setView('edit');
  };

  const handlePreviewClick = (post) => {
    setCurrentPost(post);
    setView('preview');
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/blog/${postId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete blog post');
      setBlogs(blogs.filter(p => p.id !== postId));
      showFlashMessage('Blog post deleted successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFormSubmit = async (statusValue) => {
    if (!formData.title || !formData.content) {
      alert("Post title and content are required.");
      return;
    }

    const payload = {
      ...formData,
      status: statusValue,
      tags: formData.tags.join(',')
    };

    try {
      if (view === 'add') {
        const res = await fetch('http://localhost:5000/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create blog post');
        const result = await res.json();
        
        setBlogs(prev => [
          {
            id: result.postId,
            title: payload.title,
            content: payload.content,
            category: payload.category,
            tags: payload.tags,
            author: payload.author,
            status: payload.status,
            image_url: result.image_url,
            meta_description: payload.meta_description,
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
        showFlashMessage('Blog post created successfully.');
      } else {
        // Edit mode
        const res = await fetch(`http://localhost:5000/api/blog/${currentPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update blog post');
        const result = await res.json();

        setBlogs(prev => prev.map(p => p.id === currentPost.id ? {
          ...p,
          title: payload.title,
          content: payload.content,
          category: payload.category,
          tags: payload.tags,
          author: payload.author,
          status: payload.status,
          image_url: result.image_url,
          meta_description: payload.meta_description
        } : p));
        showFlashMessage('Blog post updated successfully.');
      }
      setView('list');
    } catch (err) {
      alert(err.message);
    }
  };

  // View: Preview Modal/Panel
  if (view === 'preview' && currentPost) {
    return (
      <div className="w-full">
        <div className="mb-8 flex items-center shrink-0">
          <button 
            onClick={() => setView('list')}
            className="mr-4 text-on-surface hover:text-primary-container transition-colors focus:outline-none flex items-center"
          >
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
          </button>
          <div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight uppercase">Preview Post</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-1">Author: {currentPost.author} | {formatDate(currentPost.created_at)}</p>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant p-8 shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] max-w-4xl space-y-6">
          {currentPost.image_url && (
            <img 
              src={`http://localhost:5000${currentPost.image_url}`} 
              alt={currentPost.title} 
              className="w-full max-h-[350px] object-cover border border-outline-variant"
            />
          )}

          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-surface-variant border border-outline text-on-surface-variant text-xs font-semibold uppercase tracking-wide">
              {currentPost.category}
            </span>
            <h1 className="text-3xl font-extrabold text-on-surface uppercase tracking-tight">{currentPost.title}</h1>
            
            {currentPost.tags && (
              <div className="flex flex-wrap gap-2">
                {currentPost.tags.split(',').map((tag, idx) => (
                  <span key={idx} className="text-xs text-primary-container border border-primary-container/30 px-2 py-0.5">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}

            <div 
              className="prose prose-invert max-w-none text-on-surface-variant font-body-md text-body-md pt-4 border-t border-outline-variant space-y-4 whitespace-pre-wrap"
            >
              {currentPost.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View: Add or Edit Form
  if (view === 'add' || view === 'edit') {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header App Bar */}
        <header className="pb-6 border-b border-outline-variant flex items-center justify-between shrink-0 mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setView('list')}
              className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-3xl">arrow_back</span>
            </button>
            <div>
              <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight uppercase">
                {view === 'add' ? 'New Blog Post' : 'Edit Blog Post'}
              </h1>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-1">Content Management / Blog</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleFormSubmit('Draft')}
              className="px-6 py-2 border border-outline text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm rounded transition-colors duration-200 uppercase tracking-wider"
            >
              Save Draft
            </button>
            <button 
              onClick={() => handleFormSubmit('Published')}
              className="px-6 py-2 bg-primary-container text-black hover:bg-inverse-primary font-label-sm text-label-sm rounded transition-colors duration-200 font-bold uppercase tracking-wider shadow-[0_4px_0_0_#904d00] active:shadow-none active:translate-y-1 flex items-center"
            >
              <span className="material-symbols-outlined mr-2 text-[18px]">publish</span>
              Publish
            </button>
          </div>
        </header>

        {/* Scrollable Bento Grid Area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl">
            {/* Left Column: Post Title & Editor */}
            <div className="lg:col-span-8 space-y-6">
              {/* Title Card */}
              <div className="bg-surface-container border border-outline-variant p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-8 h-8 bg-outline-variant transform translate-x-4 -translate-y-4 rotate-45 group-hover:bg-primary-container transition-colors duration-500"></div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Post Title <span className="text-primary-container">*</span></label>
                  <input 
                    className="w-full bg-background border-0 border-b-2 border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface font-title-md text-title-md py-3 px-4 transition-colors placeholder:text-surface-variant" 
                    placeholder="e.g., Advanced Concrete Curing Techniques in High-Rise Construction" 
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* simulated Rich Text Editor */}
              <div className="flex items-center justify-between mb-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Post Content <span className="text-primary-container">*</span></label>
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
                    Edit content
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

              <div className="bg-surface-container border border-outline-variant flex flex-col h-[550px] mb-6">
                {editorMode === 'edit' ? (
                  <>
                    {/* Editor Toolbar */}
                    <div className="border-b border-outline-variant p-2 flex flex-wrap gap-2 bg-surface-container-low">
                      <div className="flex space-x-1 border-r border-outline-variant pr-2">
                        <button 
                          type="button" 
                          onClick={() => applyFormatting('bold')}
                          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded transition-colors" 
                          title="Bold"
                        >
                          <span className="material-symbols-outlined text-[20px]">format_bold</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => applyFormatting('italic')}
                          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded transition-colors" 
                          title="Italic"
                        >
                          <span className="material-symbols-outlined text-[20px]">format_italic</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => applyFormatting('underlined')}
                          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded transition-colors" 
                          title="Underline"
                        >
                          <span className="material-symbols-outlined text-[20px]">format_underlined</span>
                        </button>
                      </div>
                      <div className="flex space-x-1 border-r border-outline-variant pr-2">
                        <select 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'h2') applyFormatting('h2');
                            if (val === 'h3') applyFormatting('h3');
                            e.target.value = 'default';
                          }}
                          className="bg-background border border-outline-variant text-on-surface font-label-sm text-label-sm rounded py-1 pl-2 pr-8 focus:ring-0 focus:border-primary-container h-9"
                        >
                          <option value="default">Header Format</option>
                          <option value="h2">Heading 2 (##)</option>
                          <option value="h3">Heading 3 (###)</option>
                        </select>
                      </div>
                      <div className="flex space-x-1 border-r border-outline-variant pr-2">
                        <button 
                          type="button" 
                          onClick={() => applyFormatting('bullet')}
                          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded transition-colors" 
                          title="Bullet List"
                        >
                          <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => applyFormatting('number')}
                          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded transition-colors" 
                          title="Numbered List"
                        >
                          <span className="material-symbols-outlined text-[20px]">format_list_numbered</span>
                        </button>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          type="button" 
                          onClick={() => applyFormatting('link') }
                          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded transition-colors" 
                          title="Link"
                        >
                          <span className="material-symbols-outlined text-[20px]">link</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => applyFormatting('image') }
                          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded transition-colors" 
                          title="Image Link"
                        >
                          <span className="material-symbols-outlined text-[20px]">image</span>
                        </button>
                      </div>
                    </div>
                    {/* Editor Content Area */}
                    <div className="flex-1 p-0">
                      <textarea 
                        id="editor-textarea"
                        className="w-full h-full bg-background border-none focus:ring-0 text-on-surface font-body-md text-body-md p-6 resize-none placeholder:text-surface-variant" 
                        placeholder="Start writing engineering insights..."
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        onKeyDown={handleKeyDown}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="w-full flex-grow p-6 overflow-y-auto max-h-[540px] font-body-md text-sm text-on-surface leading-relaxed whitespace-pre-wrap bg-surface-container-lowest">
                    {(() => {
                      const text = formData.content;
                      if (!text) return <p className="text-on-surface-variant italic">No content entered yet.</p>;
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

            {/* Right Column: Settings & SEO */}
            <div className="lg:col-span-4 space-y-6">
              {/* Category & Tags Card */}
              <div className="bg-surface-container border border-outline-variant p-6">
                <h3 className="font-title-md text-title-md font-bold text-on-surface border-b border-outline-variant pb-3 mb-4 uppercase tracking-tight flex items-center">
                  <span className="material-symbols-outlined mr-2 text-primary-container text-[20px]">category</span>
                  Classification
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-background border-2 border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md text-body-md py-2 px-3 rounded transition-colors cursor-pointer"
                    >
                      <option>Structural Engineering</option>
                      <option>Project Management</option>
                      <option>Safety Protocols</option>
                      <option>Material Science</option>
                      <option>Company News</option>
                      <option>Engineering Tips</option>
                      <option>Construction News</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Tags</label>
                    <div className="relative flex items-center mb-3">
                      <span className="material-symbols-outlined absolute left-3 text-surface-variant">tag</span>
                      <input 
                        className="w-full bg-background border-2 border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md text-body-md py-2 pl-10 pr-10 rounded transition-colors" 
                        placeholder="Add tag and press Enter" 
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                      <button 
                        type="button"
                        onClick={handleAddTag}
                        className="absolute right-2 text-primary-container hover:text-primary transition-colors flex items-center"
                      >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 border border-outline-variant rounded font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low flex items-center group cursor-pointer hover:border-primary-container hover:text-on-surface transition-colors"
                        >
                          {tag}
                          <span 
                            onClick={() => handleRemoveTag(tag)}
                            className="material-symbols-outlined ml-1 text-[14px] group-hover:text-error cursor-pointer"
                          >
                            close
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Image Media Card */}
              <div className="bg-surface-container border border-outline-variant p-6">
                <h3 className="font-title-md text-title-md font-bold text-on-surface border-b border-outline-variant pb-3 mb-4 uppercase tracking-tight flex items-center">
                  <span className="material-symbols-outlined mr-2 text-primary-container text-[20px]">wallpaper</span>
                  Featured Media
                </h3>
                
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('featured-image-input').click()}
                  className="border-2 border-dashed border-outline-variant rounded bg-background hover:border-primary-container hover:bg-surface-container-low transition-colors duration-300 flex flex-col items-center justify-center p-8 text-center cursor-pointer group relative overflow-hidden min-h-[160px]"
                >
                  <input 
                    type="file" 
                    id="featured-image-input" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {formData.image_url ? (
                    <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-2">
                      <img 
                        src={formData.image_url.startsWith('data:') ? formData.image_url : `http://localhost:5000${formData.image_url}`} 
                        alt="Featured Preview" 
                        className="h-[100px] object-cover border border-outline-variant mb-2"
                      />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, image_url: null }));
                        }}
                        className="text-error font-label-sm text-xs hover:underline uppercase"
                      >
                        Remove Media
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl text-surface-variant mb-2 group-hover:text-primary-container transition-colors">cloud_upload</span>
                      <p className="font-body-md text-body-md text-on-surface mb-1">Drag &amp; drop image here</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">or click to browse</p>
                      <p className="font-label-sm text-[10px] text-surface-variant mt-4">WebP/JPG recommended</p>
                    </>
                  )}
                </div>
              </div>

              {/* SEO Search Engine Specs Card */}
              <div className="bg-surface-container border border-outline-variant p-6">
                <h3 className="font-title-md text-title-md font-bold text-on-surface border-b border-outline-variant pb-3 mb-4 uppercase tracking-tight flex items-center">
                  <span className="material-symbols-outlined mr-2 text-primary-container text-[20px]">search_insights</span>
                  Search Engine Specs
                </h3>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 flex justify-between">
                    Meta Description
                    <span className="text-surface-variant">{formData.meta_description.length}/160</span>
                  </label>
                  <textarea 
                    maxLength={160}
                    className="w-full bg-background border-2 border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md text-body-md py-2 px-3 rounded transition-colors resize-none placeholder:text-surface-variant" 
                    placeholder="Brief technical summary for search results..." 
                    rows="3"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View: Table List
  return (
    <div className="flex flex-col flex-grow">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant shrink-0">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight uppercase">Blog Posts</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage corporate blog entries and technical engineering insights.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase tracking-wider px-6 py-3 border border-transparent hover:bg-[#d67600] active:scale-95 transition-all flex items-center gap-2 rounded-none"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Post
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-surface-container p-4 border border-outline-variant items-center justify-between shrink-0">
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
          <div className="relative w-full max-w-sm flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">search</span>
            <input 
              className="w-full bg-surface-variant border border-outline-variant text-on-surface pl-10 pr-4 py-2 focus:border-primary focus:ring-0 rounded-none transition-colors" 
              placeholder="Search posts..." 
              type="text"
              // Local search query utilizes the parent-level searchQuery passed down from admin layout
              // (but let's make sure users can input locally or use search queries)
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="bg-surface-variant border border-outline-variant text-on-surface px-4 py-2 focus:border-primary focus:ring-0 rounded-none appearance-none min-w-[200px] cursor-pointer"
          >
            <option value="">All Categories</option>
            <option>Structural Engineering</option>
            <option>Project Management</option>
            <option>Safety Protocols</option>
            <option>Material Science</option>
            <option>Company News</option>
            <option>Engineering Tips</option>
            <option>Construction News</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          <span className="uppercase tracking-wider">Advanced Filters</span>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-surface-container border border-outline-variant overflow-x-auto flex-grow mb-6 relative">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-variant font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold w-24">Media</th>
              <th className="px-6 py-4 font-semibold w-1/3">Title</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Author</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
            {paginatedBlogs.map(post => (
              <tr key={post.id} className="hover:bg-surface-container-highest transition-colors group">
                <td className="px-6 py-3">
                  <div className="w-16 h-12 bg-surface-variant border border-outline-variant overflow-hidden flex items-center justify-center">
                    {post.image_url ? (
                      <img 
                        src={`http://localhost:5000${post.image_url}`} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-outline-variant text-xl">image_not_supported</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-on-surface max-w-[300px] truncate" title={post.title}>
                  {post.title}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-sm bg-surface-variant border border-outline text-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                    {post.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-on-surface-variant">
                  {post.author || 'Admin'}
                </td>
                <td className="px-6 py-4">
                  {post.status === 'Published' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#004c6c] border border-tertiary-container text-[#c7e7ff] text-xs font-semibold uppercase tracking-wide rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-variant border border-outline-variant text-on-surface-variant text-xs font-semibold uppercase tracking-wide rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                      Draft
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-on-surface-variant">
                  {formatDate(post.created_at)}
                </td>
                <td className="px-6 py-4 text-right pr-6">
                  <div className="flex items-center justify-end gap-3 text-on-surface-variant opacity-60 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handlePreviewClick(post)}
                      className="hover:text-primary transition-colors" 
                      title="View"
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    <button 
                      onClick={() => handleEditClick(post)}
                      className="hover:text-primary transition-colors" 
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="hover:text-error transition-colors" 
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedBlogs.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-on-surface-variant">
                  No blog articles found. Click "New Post" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm border-t border-outline-variant pt-4 shrink-0">
          <div>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries</div>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-outline-variant bg-surface-variant hover:bg-surface-container-highest disabled:opacity-50 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border ${
                  currentPage === page 
                    ? 'border-primary bg-primary-container text-on-primary-container font-bold'
                    : 'border-outline-variant bg-surface-variant hover:bg-surface-container-highest'
                } transition-colors`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-outline-variant bg-surface-variant hover:bg-surface-container-highest flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
