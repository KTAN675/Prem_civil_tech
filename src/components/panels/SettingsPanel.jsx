import React, { useState, useEffect, useRef } from 'react';

export default function SettingsPanel({ showFlashMessage }) {
  const [activeTab, setActiveTab] = useState('General');
  const logoInputRef = useRef(null);

  // Settings State
  const [settings, setSettings] = useState({
    companyName: '',
    tagline: '',
    logoUrl: '',
    signalColor: '',
    email: '',
    phone: '',
    address: '',
    seoTitle: '',
    seoDesc: '',
    gaId: '',
    facebook: '',
    linkedin: '',
    instagram: '',
    socialLinks: [],
    systemAlerts: true,
    emailAlerts: true,
    maintenanceMode: false
  });

  // New Social Link State
  const [newSocial, setNewSocial] = useState({ platform: 'LinkedIn', url: '' });

  // Password Change State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const getLogoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    return `http://localhost:5000${url}`;
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings(prev => ({ ...prev, logoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const addSocialLink = () => {
    if (!newSocial.url.trim()) return;
    const updated = [...(settings.socialLinks || [])];
    updated.push({ ...newSocial });
    setSettings(prev => ({ ...prev, socialLinks: updated }));
    setNewSocial({ platform: 'LinkedIn', url: '' });
  };

  const removeSocialLink = (index) => {
    const updated = (settings.socialLinks || []).filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, socialLinks: updated }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Failed to save settings');
      showFlashMessage('Configuration updates committed successfully.');
      fetchSettings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      alert('Please fill out all password fields.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      showFlashMessage('Password updated successfully.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const tabs = [
    { id: 'General', icon: 'display_settings', label: 'General' },
    { id: 'Contact Info', icon: 'contact_mail', label: 'Contact Info' },
    { id: 'SEO', icon: 'travel_explore', label: 'SEO' },
    { id: 'Social Links', icon: 'share', label: 'Social Links' },
    { id: 'Notifications', icon: 'notifications_active', label: 'Notifications' },
    { id: 'Security', icon: 'security', label: 'Security' }
  ];

  return (
    <div className="flex-1 min-h-screen bg-surface text-on-surface">
      {/* Top Header */}
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight uppercase">System Settings</h2>
        <p className="text-on-surface-variant font-body-md mt-1">Configure global platform parameters and identity.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-gutter">
        {/* Settings Navigation (Bento Column) */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
          <div className="bg-surface-container border border-outline-variant rounded p-2 flex flex-col gap-1 shadow-[4px_4px_0_0_rgba(0,0,0,0.4)]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded font-label-sm text-label-sm text-left transition-colors ${
                    isActive 
                      ? 'bg-surface-variant text-primary border-l-2 border-primary' 
                      : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Active Tab Content */}
        <div className="flex-1 flex flex-col gap-gutter">
          {activeTab !== 'Security' ? (
            <form onSubmit={handleSave} className="space-y-6">
              {activeTab === 'General' && (
                <section className="bg-surface-container border border-outline-variant rounded shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundColor: 'transparent', backgroundSize: '24px 24px' }}></div>
                  
                  <div className="p-6 border-b border-outline-variant relative z-10 flex items-center justify-between">
                    <div>
                      <h3 className="font-title-md text-title-md text-on-surface">Identity & Branding</h3>
                      <p className="text-on-surface-variant text-sm mt-1">Manage the core visual identity of the terminal.</p>
                    </div>
                    <span className="text-on-surface-variant text-opacity-30 font-display-lg text-display-lg leading-none select-none">01</span>
                  </div>

                  <div className="p-6 space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Company Name</label>
                        <input 
                          type="text"
                          value={settings.companyName}
                          onChange={e => setSettings({ ...settings, companyName: e.target.value })}
                          className="w-full bg-surface border-0 border-b-2 border-outline-variant px-4 py-3 text-on-surface font-body-md focus:ring-0 focus:border-primary transition-colors" 
                          placeholder="Enter company name" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Tagline</label>
                        <input 
                          type="text"
                          value={settings.tagline}
                          onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                          className="w-full bg-surface border-0 border-b-2 border-outline-variant px-4 py-3 text-on-surface font-body-md focus:ring-0 focus:border-primary transition-colors" 
                          placeholder="Enter tagline" 
                        />
                      </div>
                    </div>

                    {/* Brand Logo Upload */}
                    <div className="space-y-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Brand Logo</label>
                      <input 
                        type="file" 
                        ref={logoInputRef} 
                        onChange={handleLogoUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <div 
                        onClick={() => logoInputRef.current?.click()}
                        className="border-2 border-dashed border-outline-variant hover:border-primary bg-surface/50 rounded flex flex-col items-center justify-center p-8 transition-colors cursor-pointer group"
                      >
                        {settings.logoUrl ? (
                          <div className="w-24 h-24 mb-4 flex items-center justify-center bg-surface-variant border border-outline-variant overflow-hidden">
                            <img src={getLogoUrl(settings.logoUrl)} className="w-full h-full object-contain" alt="Brand Logo" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
                            <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-on-primary-container transition-colors">cloud_upload</span>
                          </div>
                        )}
                        <p className="text-on-surface font-body-md mb-1"><span className="text-primary font-bold">Click to upload</span> or drag and drop</p>
                        <p className="text-on-surface-variant text-sm">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                      </div>
                    </div>

                    {/* Signal Color */}
                    <div className="space-y-4">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Signal Color</label>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded border border-outline shadow-inner" style={{ backgroundColor: settings.signalColor || '#FF8C00' }}></div>
                        <input 
                          type="text" 
                          value={settings.signalColor}
                          onChange={e => setSettings({ ...settings, signalColor: e.target.value })}
                          className="w-32 bg-surface border-0 border-b-2 border-outline-variant px-4 py-2 text-on-surface font-body-md focus:ring-0 focus:border-primary transition-colors text-center uppercase" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setSettings({ ...settings, signalColor: '#FF8C00' })}
                          className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-variant rounded transition-colors font-label-sm text-label-sm uppercase"
                        >
                          Reset to Default
                        </button>
                      </div>
                    </div>

                    {/* Maintenance Mode */}
                    <div className="flex items-center justify-between p-4 bg-surface-container-high border border-outline-variant mt-6">
                      <div>
                        <p className="font-bold text-sm text-on-surface">Maintenance Mode</p>
                        <p className="text-xs text-on-surface-variant mt-1">Temporarily disable customer-facing website editing capabilities</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.maintenanceMode} 
                        onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })} 
                        className="h-5 w-5 rounded bg-surface border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" 
                      />
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'Contact Info' && (
                <section className="bg-surface-container border border-outline-variant rounded shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] p-6 space-y-6">
                  <div className="border-b border-outline-variant pb-4">
                    <h3 className="font-title-md text-title-md text-on-surface">Contact Information</h3>
                    <p className="text-on-surface-variant text-sm mt-1">Update contact details shown on the website footer and contact page.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Corporate Email Address</label>
                      <input 
                        type="email"
                        value={settings.email}
                        onChange={e => setSettings({ ...settings, email: e.target.value })}
                        className="bg-surface border-0 border-b-2 border-outline-variant text-on-surface font-body-md p-3 focus:border-primary focus:ring-0" 
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Phone Number</label>
                      <input 
                        type="text"
                        value={settings.phone}
                        onChange={e => setSettings({ ...settings, phone: e.target.value })}
                        className="bg-surface border-0 border-b-2 border-outline-variant text-on-surface font-body-md p-3 focus:border-primary focus:ring-0" 
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Headquarters Address</label>
                      <textarea 
                        value={settings.address}
                        onChange={e => setSettings({ ...settings, address: e.target.value })}
                        className="bg-surface border-0 border-b-2 border-outline-variant text-on-surface font-body-md p-3 focus:border-primary focus:ring-0 resize-none"
                        rows="3"
                      />
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'SEO' && (
                <section className="bg-surface-container border border-outline-variant rounded shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] p-6 space-y-6">
                  <div className="border-b border-outline-variant pb-4">
                    <h3 className="font-title-md text-title-md text-on-surface">Search Engine Optimization</h3>
                    <p className="text-on-surface-variant text-sm mt-1">Configure meta metadata for crawlers and Google Analytics tracking.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Default Meta Title</label>
                      <input 
                        type="text"
                        value={settings.seoTitle}
                        onChange={e => setSettings({ ...settings, seoTitle: e.target.value })}
                        className="bg-surface border-0 border-b-2 border-outline-variant text-on-surface font-body-md p-3 focus:border-primary focus:ring-0" 
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Default Meta Description</label>
                      <textarea 
                        value={settings.seoDesc}
                        onChange={e => setSettings({ ...settings, seoDesc: e.target.value })}
                        className="bg-surface border-0 border-b-2 border-outline-variant text-on-surface font-body-md p-3 focus:border-primary focus:ring-0 resize-none" 
                        rows="3"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Google Analytics Tracking ID</label>
                      <input 
                        type="text"
                        value={settings.gaId}
                        onChange={e => setSettings({ ...settings, gaId: e.target.value })}
                        className="bg-surface border-0 border-b-2 border-outline-variant text-on-surface font-body-md p-3 focus:border-primary focus:ring-0" 
                        placeholder="UA-XXXXXXX-X"
                      />
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'Social Links' && (
                <section className="bg-surface-container border border-outline-variant rounded shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] p-6 space-y-6">
                  <div className="border-b border-outline-variant pb-4">
                    <h3 className="font-title-md text-title-md text-on-surface">Social Network Accounts</h3>
                    <p className="text-on-surface-variant text-sm mt-1">Configure profile links shown on header, footer and team components.</p>
                  </div>

                  {/* Dynamic Social Accounts List */}
                  <div className="space-y-3">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Configured Social Links</label>
                    
                    {(!settings.socialLinks || settings.socialLinks.length === 0) ? (
                      <p className="text-sm text-on-surface-variant italic p-4 bg-surface/50 border border-outline-variant/50 text-center">No social accounts configured yet.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {settings.socialLinks.map((link, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-surface border border-outline-variant">
                            <div className="flex flex-col min-w-0 pr-4">
                              <span className="font-bold text-xs uppercase tracking-wider text-primary">{link.platform}</span>
                              <span className="text-sm text-on-surface-variant truncate font-mono mt-0.5">{link.url}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSocialLink(idx)}
                              className="p-1 hover:text-error hover:bg-surface-variant/50 transition-colors flex items-center justify-center"
                              title="Delete Link"
                            >
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Social Account Builder */}
                  <div className="border-t border-outline-variant pt-6 mt-6">
                    <h4 className="font-bold text-sm text-on-surface mb-4 uppercase tracking-wider">Add New Social Account</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="flex flex-col">
                        <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Platform</label>
                        <select
                          value={newSocial.platform}
                          onChange={e => setNewSocial({ ...newSocial, platform: e.target.value })}
                          className="bg-surface border-0 border-b-2 border-outline-variant text-on-surface font-body-md p-3 focus:border-primary focus:ring-0 cursor-pointer"
                        >
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Instagram">Instagram</option>
                          <option value="YouTube">YouTube</option>
                          <option value="Twitter / X">Twitter / X</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Website">Website / Custom</option>
                        </select>
                      </div>

                      <div className="flex flex-col md:col-span-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Account or Page URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={newSocial.url}
                            onChange={e => setNewSocial({ ...newSocial, url: e.target.value })}
                            placeholder="https://..."
                            className="bg-surface border-0 border-b-2 border-outline-variant text-on-surface font-body-md p-3 focus:border-primary focus:ring-0 flex-1"
                          />
                          <button
                            type="button"
                            onClick={addSocialLink}
                            className="px-6 bg-surface-variant border border-outline-variant hover:border-primary text-on-surface hover:text-primary transition-colors flex items-center gap-1 font-label-sm text-label-sm uppercase tracking-wider font-bold"
                          >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'Notifications' && (
                <section className="bg-surface-container border border-outline-variant rounded shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] p-6 space-y-6">
                  <div className="border-b border-outline-variant pb-4">
                    <h3 className="font-title-md text-title-md text-on-surface">Global System Notifications</h3>
                    <p className="text-on-surface-variant text-sm mt-1">Manage email and telemetry alerting configurations.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface-container-high border border-outline-variant">
                      <div>
                        <p className="font-bold text-sm text-on-surface">Push Alert Status Updates</p>
                        <p className="text-xs text-on-surface-variant mt-1">Receive sound alerts on incoming leads inside Dashboard</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={settings.systemAlerts}
                        onChange={e => setSettings({ ...settings, systemAlerts: e.target.checked })}
                        className="h-5 w-5 rounded bg-surface border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface-container-high border border-outline-variant">
                      <div>
                        <p className="font-bold text-sm text-on-surface">Instant Email Lead Notifications</p>
                        <p className="text-xs text-on-surface-variant mt-1">Send a copy of lead messages to the system email address</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={settings.emailAlerts}
                        onChange={e => setSettings({ ...settings, emailAlerts: e.target.checked })}
                        className="h-5 w-5 rounded bg-surface border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Commit Changes Buttons */}
              <div className="flex justify-end pt-6 mb-12">
                <button 
                  type="submit"
                  className="bg-primary-container text-on-primary-container hover:bg-primary font-label-sm text-label-sm uppercase tracking-wider px-8 py-4 rounded font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all active:translate-y-[4px] active:translate-x-[4px] active:shadow-none border border-black flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">save</span>
                  Commit Changes
                </button>
              </div>
            </form>
          ) : (
            /* Security Tab Form */
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <section className="bg-surface-container border border-outline-variant rounded shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] p-6 space-y-6">
                <div className="border-b border-outline-variant pb-4">
                  <h3 className="font-title-md text-title-md text-on-surface">Portal Access & Security</h3>
                  <p className="text-on-surface-variant text-sm mt-1">Configure credentials, tokens, and passcode updates.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Current Security Passcode</label>
                    <input 
                      type="password"
                      required
                      value={passwords.currentPassword}
                      onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="bg-surface border-0 border-b-2 border-outline-variant text-on-surface font-body-md p-3 focus:border-primary focus:ring-0" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">New Security Passcode</label>
                      <input 
                        type="password"
                        required
                        value={passwords.newPassword}
                        onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="bg-surface border-0 border-b-2 border-outline-variant text-on-surface font-body-md p-3 focus:border-primary focus:ring-0" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Confirm Passcode</label>
                      <input 
                        type="password"
                        required
                        value={passwords.confirmPassword}
                        onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        className="bg-surface border-0 border-b-2 border-outline-variant text-on-surface font-body-md p-3 focus:border-primary focus:ring-0" 
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-surface-container-high border border-outline-variant">
                    <p className="font-bold text-sm text-on-surface">Two-Factor Authentication (2FA)</p>
                    <p className="text-xs text-on-surface-variant mt-1 mb-4">Mandate one-time passwords for administrative sessions.</p>
                    <button 
                      type="button"
                      onClick={() => showFlashMessage('Two-Factor authentication flow initiated.')}
                      className="px-4 py-2 bg-surface-variant border border-outline-variant hover:border-primary text-on-surface rounded transition-colors font-label-sm text-label-sm uppercase"
                    >
                      Setup 2FA Credentials
                    </button>
                  </div>
                </div>
              </section>

              <div className="flex justify-end pt-6 mb-12">
                <button 
                  type="submit"
                  className="bg-primary-container text-on-primary-container hover:bg-primary font-label-sm text-label-sm uppercase tracking-wider px-8 py-4 rounded font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all active:translate-y-[4px] active:translate-x-[4px] active:shadow-none border border-black flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">vpn_key</span>
                  Update Passcode
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
