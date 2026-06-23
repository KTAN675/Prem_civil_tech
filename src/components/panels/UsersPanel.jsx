import React, { useState } from 'react';

export default function UsersPanel({
  users,
  setUsers,
  fetchDashboardData,
  showFlashMessage,
  searchQuery
}) {
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '', password: '', role: 'editor'
  });

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com') + '/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create user account');

      showFlashMessage('System access account created successfully.');
      setUserModalOpen(false);
      setUserForm({
        username: '', password: '', role: 'editor'
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUserDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this system user account?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://prem-civil-tech.onrender.com'}/api/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete user');

      setUsers(users.filter(u => u.id !== userId));
      showFlashMessage('User account deleted successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = searchQuery
    ? users.filter(u => 
        (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : users;

  return (
    <div className="bg-surface-container border border-[#333333] flex flex-col p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-title-md text-on-surface uppercase tracking-tight text-[18px]">User Access Control</h2>
        <button 
          onClick={() => setUserModalOpen(true)}
          className="bg-primary-container text-black font-semibold text-xs px-4 py-2 border border-primary-container hover:bg-opacity-90 transition-all flex items-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Create User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#333333] bg-surface-container-lowest">
              <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase">Username</th>
              <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase">Access Level (Role)</th>
              <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase">Created Date</th>
              <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} className="border-b border-[#333333] hover:bg-surface-container-high transition-colors text-[14px]">
                <td className="px-5 py-4 font-bold text-on-surface">{u.username}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 border text-xs font-semibold uppercase ${
                    u.role === 'admin' ? 'border-primary-container text-primary-container' : 'border-outline-variant text-on-surface-variant'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-on-surface-variant">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-right">
                  <button 
                    onClick={() => handleUserDelete(u.id)} 
                    disabled={u.username === 'admin'}
                    className={`p-2 ${u.username === 'admin' ? 'opacity-30 cursor-not-allowed text-on-surface-variant' : 'text-error hover:bg-error/10'}`}
                    title={u.username === 'admin' ? 'Primary admin cannot be deleted' : 'Delete Account'}
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-on-surface-variant">No registered system users.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =============================================================== */}
      {/* MODAL: USER ADD */}
      {/* =============================================================== */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-surface-container border border-[#333333] w-full max-w-md p-6 shadow-2xl relative">
            <h4 className="font-title-md text-[18px] text-primary-container uppercase tracking-tight mb-6">
              Create Admin/Editor User
            </h4>
            
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant uppercase mb-1">Username / Email Address *</label>
                <input 
                  type="text" 
                  required 
                  value={userForm.username} 
                  onChange={e => setUserForm({...userForm, username: e.target.value})}
                  className="w-full bg-surface-dim border border-[#333333] text-on-surface py-2 px-3 focus:outline-none" 
                  placeholder="e.g. editor"
                />
              </div>

              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant uppercase mb-1">Password *</label>
                <input 
                  type="password" 
                  required 
                  value={userForm.password} 
                  onChange={e => setUserForm({...userForm, password: e.target.value})}
                  className="w-full bg-surface-dim border border-[#333333] text-on-surface py-2 px-3 focus:outline-none" 
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant uppercase mb-1">Security Role</label>
                <select 
                  value={userForm.role} 
                  onChange={e => setUserForm({...userForm, role: e.target.value})}
                  className="w-full bg-surface-dim border border-[#333333] text-on-surface py-2 px-3"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#333333]">
                <button 
                  type="button" 
                  onClick={() => setUserModalOpen(false)}
                  className="bg-transparent border border-[#333333] text-on-surface px-4 py-2 hover:border-on-surface transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-primary-container text-black font-semibold px-6 py-2 hover:bg-opacity-90 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.4)]"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
