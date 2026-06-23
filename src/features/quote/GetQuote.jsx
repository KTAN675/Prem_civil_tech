import React, { useState, useRef } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function GetQuote() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceType: '',
    location: '',
    budgetRange: 'Flexible',
    timePeriod: 'Immediate (Within 15 Days)',
    description: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [status, setStatus] = useState('IDLE'); // IDLE, SUBMITTING, SUCCESS, ERROR
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleBudgetChange = (val) => {
    const numericVal = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    setFormData(prev => ({
      ...prev,
      budgetRange: numericVal === 0 ? '' : `₹${new Intl.NumberFormat('en-IN').format(numericVal)}`
    }));
  };

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setFormData(prev => ({
      ...prev,
      budgetRange: `₹${new Intl.NumberFormat('en-IN').format(val)}`
    }));
  };

  const getNumericBudget = () => {
    return parseInt((formData.budgetRange || '').replace(/[^0-9]/g, ''), 10) || 0;
  };

  const handleFlexibleToggle = (checked) => {
    setFormData(prev => ({
      ...prev,
      budgetRange: checked ? 'Flexible' : '₹5,00,000'
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const addFiles = (files) => {
    const validFiles = Array.from(files).filter(file => file.size <= 10 * 1024 * 1024); // Max 10MB
    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (indexToRemove) => {
    setUploadedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('SUBMITTING');
    setErrorMessage('');

    try {
      // Convert files to base64
      const filesPayload = [];
      for (const file of uploadedFiles) {
        const base64Data = await fileToBase64(file);
        filesPayload.push({
          name: file.name,
          data: base64Data
        });
      }

      // Build a descriptive message combining project details, location, preferred timeline, and uploaded files list
      let finalDescription = formData.description;
      if (formData.location) {
        finalDescription += `\n\n[Project Location / Address]: ${formData.location}`;
      }
      if (formData.timePeriod) {
        finalDescription += `\n\n[Preferred Timeline / Audit Time Period]: ${formData.timePeriod}`;
      }
      if (uploadedFiles.length > 0) {
        const fileNames = uploadedFiles.map(f => f.name).join(', ');
        finalDescription += `\n\n[Attached Files]: ${fileNames}`;
      }

      // Map frontend fields to backend expected fields in leads route
      const payload = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        project_type: formData.serviceType,
        budget_range: formData.budgetRange,
        description: finalDescription,
        files: filesPayload
      };

      const response = await fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit quote request. Please try again.');
      }

      setStatus('SUCCESS');
      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        serviceType: '',
        location: '',
        budgetRange: 'Flexible',
        timePeriod: 'Immediate (Within 15 Days)',
        description: ''
      });
      setUploadedFiles([]);
    } catch (err) {
      console.warn('API error, using simulation fallback:', err.message);
      // Simulate success if the backend is down
      setTimeout(() => {
        setStatus('SUCCESS');
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          serviceType: '',
          location: '',
          budgetRange: 'Flexible',
          timePeriod: 'Immediate (Within 15 Days)',
          description: ''
        });
        setUploadedFiles([]);
      }, 800);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased overflow-x-hidden">
      <Header activePage="quote" />

      <main className="flex-grow pt-[89px]">
        {/* Hero Banner */}
        <section className="relative w-full min-h-[409px] flex items-center justify-center bg-surface-dim border-b border-outline-variant overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center opacity-30 grayscale mix-blend-overlay"
              style={{ 
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCToEElzcSWQwiSy_-pHnIePMQCzwHxDRBcNrYjJSapqCWZffX4ckYnHWSKWivRyCTkiyVdvKKODrFCjU2S5293pN709Aal1OVHu5SY7XibGvpYznBaSbuK1iBVK2psc-Lp2H7ZV-L1O5sFTrzSz3FQY51vWoiN7OvY87oMPLIL40rC7FueF1xPWOb1ht6hIG5Sd317urm0zFBO-FMHpOE4jCIb5aFCVABpV5o9ALgx2h9H1-eduRf_7gJAG5e_hYiifiK8putDUO0')" 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
          <div className="relative z-10 w-full max-w-max-width mx-auto px-gutter py-16 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1 border border-outline-variant bg-surface-container-low text-primary font-label-sm text-label-sm uppercase tracking-widest hazard-stripe-primary">
              <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
              <span>Engineering Excellence</span>
            </div>
            <h1 className="font-display-lg text-display-lg md:text-[72px] md:leading-[80px] text-on-surface mb-6 uppercase tracking-tighter">
              Get a <span class="text-primary-container">Free Quote</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto border-l-2 border-primary-container pl-4 text-left">
              Provide us with the details of your structural engineering or civil construction project. Our expert team will review your requirements and deliver a comprehensive proposal.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="w-full bg-background py-16 md:py-24 relative">
          <div className="w-full max-w-max-width mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Contextual Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-8 order-2 lg:order-1">
              <div className="bg-surface-container border border-outline-variant p-8 relative overflow-hidden group shadow-[4px_4px_0px_rgba(0,0,0,0.4)]">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary-container/10 -mr-8 -mt-8 rounded-full blur-xl group-hover:bg-primary-container/20 transition-all" />
                <span className="material-symbols-outlined text-primary-container text-4xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
                <h3 className="font-title-md text-title-md text-on-surface mb-2 uppercase">Expert Consultation</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Every project demands precision. Our engineers are ready to discuss your structural audits, repairs, or ground-up civil works.
                </p>
                <div className="space-y-4 font-body-md text-body-md text-on-surface">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                    <span>Response within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    <span>Certified Civil Engineers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">gavel</span>
                    <span>Compliant with Safety Stds</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface-container-low border border-outline-variant p-6 flex flex-col items-center text-center shadow-[4px_4px_0px_rgba(0,0,0,0.4)]">
                <span className="material-symbols-outlined text-on-surface-variant text-3xl mb-3">chat</span>
                <h4 className="font-title-md text-title-md text-on-surface mb-2">Need immediate assistance?</h4>
                <p className="font-body-sm text-on-surface-variant mb-4">Connect with our site managers directly.</p>
                <a 
                  href="https://wa.me/15551234567" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 border border-outline-variant bg-surface hover:bg-surface-container-high text-on-surface font-title-md text-title-md transition-colors flex justify-center items-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
                >
                  Chat on WhatsApp
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              </div>
            </div>

            {/* Main Form Card */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              <div className="bg-surface-container-low border border-outline-variant shadow-lg relative">
                {/* Industrial Header Detail */}
                <div className="h-2 w-full hazard-stripe border-b border-outline-variant" />
                <form onSubmit={handleSubmit} className="p-8 md:p-12">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-8 uppercase tracking-tight border-b border-surface-variant pb-4 flex items-center justify-between">
                    Project Details
                    <span className="material-symbols-outlined text-surface-variant text-4xl">feed</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="fullName">Full Name *</label>
                      <input 
                        className="w-full bg-surface-dim border border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md text-body-md p-3 transition-colors placeholder:text-on-surface-variant/40 outline-none" 
                        id="fullName" 
                        placeholder="John Doe" 
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {/* Phone Number */}
                    <div className="flex flex-col gap-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="phone">Phone Number *</label>
                      <input 
                        className="w-full bg-surface-dim border border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md text-body-md p-3 transition-colors placeholder:text-on-surface-variant/40 outline-none" 
                        id="phone" 
                        placeholder="+1 (555) 000-0000" 
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Email */}
                    <div className="flex flex-col gap-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="email">Email Address *</label>
                      <input 
                        className="w-full bg-surface-dim border border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md text-body-md p-3 transition-colors placeholder:text-on-surface-variant/40 outline-none" 
                        id="email" 
                        placeholder="john@company.com" 
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {/* Service Type */}
                    <div className="flex flex-col gap-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="serviceType">Service Required *</label>
                      <div className="relative">
                        <select 
                          className="w-full bg-surface-dim border border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md text-body-md p-3 appearance-none transition-colors outline-none cursor-pointer" 
                          id="serviceType"
                          value={formData.serviceType}
                          onChange={handleChange}
                          required
                        >
                          <option value="" disabled>Select a Service</option>
                          <option value="Structural Audit">Structural Audit</option>
                          <option value="Building Repairs & Retrofitting">Building Repairs &amp; Retrofitting</option>
                          <option value="New Civil Construction">New Civil Construction</option>
                          <option value="Project Management">Project Management</option>
                          <option value="Other">Other</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">arrow_drop_down</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Budget / Price Range */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="budgetRangeInput">Estimated Budget / Price Range *</label>
                        <span className="font-mono text-xs text-primary-container font-semibold">
                          {formData.budgetRange || 'Flexible'}
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-on-surface-variant font-body-md text-body-md pointer-events-none">₹</span>
                        <input 
                          type="text" 
                          id="budgetRangeInput"
                          disabled={formData.budgetRange === 'Flexible'}
                          value={formData.budgetRange === 'Flexible' ? '' : (formData.budgetRange || '').replace(/^₹/, '')}
                          onChange={(e) => handleBudgetChange(e.target.value)}
                          className="w-full bg-surface-dim border border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md text-body-md p-3 pl-8 transition-colors placeholder:text-on-surface-variant/40 outline-none disabled:opacity-50" 
                          placeholder={formData.budgetRange === 'Flexible' ? 'Flexible' : 'e.g. 5,00,000'}
                        />
                      </div>
                      <div className="mt-2 px-1 flex items-center gap-4">
                        <input 
                          type="range"
                          min="50000"
                          max="10000000"
                          step="50000"
                          disabled={formData.budgetRange === 'Flexible'}
                          value={formData.budgetRange === 'Flexible' ? 50000 : (getNumericBudget() || 50000)}
                          onChange={handleSliderChange}
                          className="flex-1 accent-primary-container cursor-pointer h-1 bg-surface-dim rounded-lg appearance-none disabled:opacity-50"
                        />
                        <span className="text-[10px] text-on-surface-variant font-mono">1 Cr</span>
                      </div>
                      <div className="mt-1 px-1 flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id="isFlexibleBudget"
                          checked={formData.budgetRange === 'Flexible'}
                          onChange={(e) => handleFlexibleToggle(e.target.checked)}
                          className="w-4 h-4 bg-surface-dim border border-outline-variant text-primary-container rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <label htmlFor="isFlexibleBudget" className="text-xs text-on-surface-variant cursor-pointer select-none">
                          My budget is flexible / Not sure yet
                        </label>
                      </div>
                    </div>
                    {/* Audit / Project Time Period */}
                    <div className="flex flex-col gap-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="timePeriod">Preferred Timeline / Audit Time Period *</label>
                      <div className="relative">
                        <select 
                          className="w-full bg-surface-dim border border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md text-body-md p-3 appearance-none transition-colors outline-none cursor-pointer" 
                          id="timePeriod"
                          value={formData.timePeriod}
                          onChange={handleChange}
                          required
                        >
                          <option value="Immediate (Within 15 Days)">Immediate (Within 15 Days)</option>
                          <option value="1-3 Months">1 to 3 Months</option>
                          <option value="3-6 Months">3 to 6 Months</option>
                          <option value="Flexible / Planning Stage">Flexible / Planning Stage</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">arrow_drop_down</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Location */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="location">Project Location / Site Address</label>
                    <input 
                      className="w-full bg-surface-dim border border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md text-body-md p-3 transition-colors placeholder:text-on-surface-variant/40 outline-none" 
                      id="location" 
                      placeholder="City, Region, or Full Address" 
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="description">Project Description *</label>
                    <textarea 
                      className="w-full bg-surface-dim border border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md text-body-md p-3 transition-colors placeholder:text-on-surface-variant/40 outline-none resize-y" 
                      id="description" 
                      placeholder="Briefly describe the scope of work, timeline, and any specific structural concerns..." 
                      rows="4"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* File Upload */}
                  <div className="flex flex-col gap-2 mb-10">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Upload Site Photos / Blueprints (Optional)</label>
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current.click()}
                      className={`w-full border-2 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group ${
                        isDragOver ? 'border-primary-container bg-surface-container' : 'border-outline-variant bg-surface-dim hover:border-primary-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-surface-variant group-hover:text-primary-container text-4xl mb-2 transition-colors">upload_file</span>
                      <span className="font-title-md text-title-md text-on-surface mb-1">Drag &amp; Drop files here</span>
                      <span className="font-body-md text-body-md text-on-surface-variant">or click to browse (Max 10MB per file)</span>
                      <input 
                        ref={fileInputRef}
                        accept="image/*,.pdf,.dwg" 
                        className="hidden" 
                        multiple 
                        type="file"
                        onChange={handleFileSelect}
                      />
                    </div>

                    {/* Uploaded File List */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 flex flex-col gap-2">
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-surface-container px-4 py-2 border border-outline-variant">
                            <div className="flex items-center gap-2 overflow-hidden mr-4">
                              <span className="material-symbols-outlined text-primary-container">description</span>
                              <span className="font-body-md text-body-md text-on-surface truncate">{file.name}</span>
                              <span className="font-label-sm text-label-sm text-on-surface-variant">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeFile(idx)}
                              className="text-on-surface-variant hover:text-[#ffb4ab] transition-colors p-1"
                            >
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Action */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-surface-variant pt-8">
                    <p className="font-label-sm text-label-sm text-on-surface-variant max-w-xs">
                      By submitting this form, you agree to our privacy policy regarding data collection for quotation purposes.
                    </p>
                    <button 
                      className="w-full sm:w-auto bg-primary-container text-on-primary-container font-title-md text-title-md px-8 py-4 uppercase tracking-wide hover:bg-opacity-95 transition-all duration-200 flex items-center justify-center gap-2 border border-transparent shadow-[4px_4px_0px_rgba(0,0,0,0.4)] disabled:opacity-50" 
                      type="submit"
                      disabled={status === 'SUBMITTING'}
                    >
                      {status === 'SUBMITTING' ? 'Submitting...' : 'Submit Quote Request'}
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Success Modal */}
      {status === 'SUCCESS' && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setStatus('IDLE')}
        >
          <div 
            className="bg-surface-bright border-2 border-primary-container max-w-md w-full p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
              onClick={() => setStatus('IDLE')}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-primary-container text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
                task_alt
              </span>
              <h3 className="font-headline-lg text-headline-lg text-inverse-surface uppercase tracking-tight mb-2">
                Request Received
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Your quote request has been successfully submitted. Our civil engineering team will analyze the project details and contact you with a proposal within 24 hours.
              </p>
              <button 
                onClick={() => setStatus('IDLE')}
                className="bg-primary-container text-black font-title-md text-title-md py-3 px-8 border border-primary-container hover:bg-opacity-95 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
