import React, { useState, useRef } from 'react';

export default function TeamPanel({
  team,
  setTeam,
  fetchDashboardData,
  showFlashMessage,
  searchQuery
}) {
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const fileInputRef = useRef(null);

  const [teamForm, setTeamForm] = useState({
    name: '',
    role: '',
    image_url: '',
    bio: ''
  });

  const getImageUrl = (url) => {
    if (!url) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDviDCeVtQZcHEv_lkVl6T6MX-EL39lC0-qEMvyYoFclFX-TwFRjv7nftzhDC6BLaA9LFVR-qDqW251QJZp7WR4PMcVDiVMw5BeHhjpHGwzrpMJXMDqlVbtMMiLpxz2gDuuFAvF1xclEKeKdc-iRHhtArkqo4BK8G4gOr7BNAtNS65xbbZWceUBhHtFuX-8UJclKUdakoAvo4kSwDcGa1IPPc5zM-wY5VtamLn3OYprOLAhuXU3xziuV9Q8KtvnAgB6jPCsM7tblyA';
    }
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    return `http://localhost:5000${url}`;
  };

  const openTeamModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setTeamForm({
        name: member.name || '',
        role: member.role || '',
        image_url: member.image_url || '',
        bio: member.bio || ''
      });
    } else {
      setEditingMember(null);
      setTeamForm({
        name: '',
        role: '',
        image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDviDCeVtQZcHEv_lkVl6T6MX-EL39lC0-qEMvyYoFclFX-TwFRjv7nftzhDC6BLaA9LFVR-qDqW251QJZp7WR4PMcVDiVMw5BeHhjpHGwzrpMJXMDqlVbtMMiLpxz2gDuuFAvF1xclEKeKdc-iRHhtArkqo4BK8G4gOr7BNAtNS65xbbZWceUBhHtFuX-8UJclKUdakoAvo4kSwDcGa1IPPc5zM-wY5VtamLn3OYprOLAhuXU3xziuV9Q8KtvnAgB6jPCsM7tblyA',
        bio: ''
      });
    }
    setTeamModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTeamForm(prev => ({ ...prev, image_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingMember
        ? `http://localhost:5000/api/team/${editingMember.id}`
        : 'http://localhost:5000/api/team';
      
      const method = editingMember ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm)
      });

      if (!response.ok) throw new Error('Failed to save team member');

      showFlashMessage(editingMember ? 'Team member updated successfully.' : 'Team member added successfully.');
      setTeamModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTeamDelete = async (memberId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/team/${memberId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to remove team member');
      setTeam(team.filter(t => t.id !== memberId));
      showFlashMessage('Team member removed successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredTeam = searchQuery
    ? team.filter(member => 
        (member.name && member.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.role && member.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.bio && member.bio.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : team;

  return (
    <div className="flex-1 min-h-screen bg-surface text-on-surface">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface uppercase tracking-tight">Team Members</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Manage technical staff and field engineers.</p>
        </div>
        <button 
          onClick={() => openTeamModal()}
          className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-6 py-3 rounded-none font-bold uppercase tracking-wider hover:bg-surface-tint transition-colors flex items-center gap-2 border border-primary-container hover:border-surface-tint shadow-[4px_4px_0px_0px_rgba(255,140,0,0.2)]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Member
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
        {filteredTeam.map(member => (
          <div key={member.id} className="group bg-surface-container border border-surface-variant relative overflow-hidden flex flex-col transition-all hover:border-outline-variant">
            <div className="relative h-72 w-full overflow-hidden bg-surface-container-high">
              <img 
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                src={getImageUrl(member.image_url)} 
                alt={member.name} 
              />
              {/* Overlay Actions */}
              <div className="absolute top-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-bl from-surface to-transparent w-full justify-end">
                <button 
                  onClick={() => openTeamModal(member)}
                  className="w-8 h-8 bg-surface-variant text-on-surface border border-outline-variant flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container hover:border-primary-container transition-colors"
                  title="Edit member"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button 
                  onClick={() => handleTeamDelete(member.id)}
                  className="w-8 h-8 bg-surface-variant text-error border border-outline-variant flex items-center justify-center hover:bg-error hover:text-on-error hover:border-error transition-colors"
                  title="Remove member"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
            <div className="p-5 border-t border-surface-variant">
              <h3 className="font-title-md text-title-md font-bold text-on-surface">{member.name}</h3>
              <p className="font-label-sm text-label-sm text-primary uppercase mt-1">{member.role}</p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-3 line-clamp-2">
                {member.bio || 'No biography details provided.'}
              </p>
            </div>
          </div>
        ))}

        {/* Add Recruit position card */}
        <div className="group bg-surface-container border border-surface-variant relative overflow-hidden flex flex-col transition-all hover:border-outline-variant">
          <div 
            onClick={() => openTeamModal()}
            className="relative h-72 w-full overflow-hidden bg-surface-container-high flex items-center justify-center border-b border-surface-variant border-dashed cursor-pointer hover:bg-surface-variant/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[48px] text-surface-variant group-hover:text-primary transition-colors">person_add</span>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center items-center text-center bg-surface-container-low">
            <h3 className="font-title-md text-title-md font-bold text-on-surface-variant">Open Position</h3>
            <p className="font-label-sm text-label-sm text-outline uppercase mt-1 mb-4">Site Supervisor</p>
            <button 
              onClick={() => openTeamModal()}
              className="font-label-sm text-label-sm text-primary border-b border-primary pb-1 hover:text-surface-tint transition-colors uppercase tracking-wide"
            >
              Recruit Now
            </button>
          </div>
        </div>
      </div>

      {/* =============================================================== */}
      {/* MODAL Overlay: Add/Edit Member */}
      {/* =============================================================== */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/90 backdrop-blur-sm" 
            onClick={() => setTeamModalOpen(false)}
          />
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-surface border border-outline-variant shadow-2xl flex flex-col max-h-[90vh] z-10">
            <div className="flex justify-between items-center p-6 border-b border-surface-variant">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface uppercase tracking-tight">
                {editingMember ? 'Edit Profile' : 'Add Team Member'}
              </h2>
              <button 
                className="text-on-surface-variant hover:text-primary transition-colors" 
                onClick={() => setTeamModalOpen(false)}
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleTeamSubmit} className="space-y-6">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                {/* Photo Upload Zone */}
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Profile Photography</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-surface-variant bg-surface-container-low hover:bg-surface-container hover:border-primary-container transition-colors flex flex-col items-center justify-center py-8 cursor-pointer group"
                  >
                    {teamForm.image_url ? (
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border border-outline-variant mb-2">
                        <img 
                          src={getImageUrl(teamForm.image_url)} 
                          className="w-full h-full object-cover" 
                          alt="Preview" 
                        />
                      </div>
                    ) : (
                      <span className="material-symbols-outlined text-[32px] text-on-surface-variant group-hover:text-primary mb-3 transition-colors">add_a_photo</span>
                    )}
                    <p className="font-body-md text-body-md text-on-surface">Click or drag & drop image here</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="flex flex-col">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Full Name</label>
                    <input 
                      type="text"
                      required
                      value={teamForm.name}
                      onChange={e => setTeamForm({ ...teamForm, name: e.target.value })}
                      className="bg-surface-container border-0 border-b-2 border-surface-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md p-3 transition-colors" 
                      placeholder="e.g. Marcus Vance" 
                    />
                  </div>
                  {/* Role Field */}
                  <div className="flex flex-col">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Technical Role</label>
                    <input 
                      type="text"
                      required
                      value={teamForm.role}
                      onChange={e => setTeamForm({ ...teamForm, role: e.target.value })}
                      className="bg-surface-container border-0 border-b-2 border-surface-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md p-3 transition-colors" 
                      placeholder="e.g. Lead Structural Eng." 
                    />
                  </div>
                </div>

                {/* Manual Photo URL input if needed */}
                <div className="flex flex-col">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Or Image URL</label>
                  <input 
                    type="text"
                    value={teamForm.image_url && !teamForm.image_url.startsWith('data:') ? teamForm.image_url : ''}
                    onChange={e => setTeamForm({ ...teamForm, image_url: e.target.value })}
                    className="bg-surface-container border-0 border-b-2 border-surface-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md p-3 transition-colors" 
                    placeholder="https://..." 
                  />
                </div>

                {/* Bio Field */}
                <div className="flex flex-col">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Professional Bio</label>
                  <textarea 
                    value={teamForm.bio}
                    onChange={e => setTeamForm({ ...teamForm, bio: e.target.value })}
                    className="bg-surface-container border-0 border-b-2 border-surface-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md p-3 transition-colors resize-none" 
                    placeholder="Brief description of expertise and background..." 
                    rows="4"
                  />
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-surface-variant bg-surface-container flex justify-end gap-4 -mx-6 -mb-6">
                  <button 
                    type="button"
                    className="px-6 py-3 font-label-sm text-label-sm font-bold uppercase text-on-surface hover:text-primary transition-colors" 
                    onClick={() => setTeamModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-8 py-3 font-bold uppercase tracking-wider hover:bg-surface-tint transition-colors flex items-center gap-2 border border-primary-container hover:border-surface-tint shadow-[4px_4px_0px_0px_rgba(255,140,0,0.2)]"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
