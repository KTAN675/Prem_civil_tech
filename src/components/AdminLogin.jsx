import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect straight to dashboard
    if (localStorage.getItem('adminToken')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // Save token & user info in localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      
      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background font-body-md text-on-background">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center" 
        style={{ 
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDviDCeVtQZcHEv_lkVl6T6MX-EL39lC0-qEMvyYoFclFX-TwFRjv7nftzhDC6BLaA9LFVR-qDqW251QJZp7WR4PMcVDiVMw5BeHhjpHGwzrpMJXMDqlVbtMMiLpxz2gDuuFAvF1xclEKeKdc-iRHhtArkqo4BK8G4gOr7BNAtNS65xbbZWceUBhHtFuX-8UJclKUdakoAvo4kSwDcGa1IPPc5zM-wY5VtamLn3OYprOLAhuXU3xziuV9Q8KtvnAgB6jPCsM7tblyA')",
        }}
      >
        <div className="absolute inset-0 bg-surface-container-lowest opacity-90 backdrop-blur-sm"></div>
      </div>

      {/* Login Card Container */}
      <main className="relative z-10 w-full max-w-md mx-auto px-margin-mobile sm:px-0">
        <div className="bg-surface-container border border-surface-variant p-8 shadow-2xl relative overflow-hidden group">
          {/* Subtle Technical Pattern Background within Card */}
          <div 
            className="absolute inset-0 opacity-5 pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0)', 
              backgroundSize: '24px 24px' 
            }}
          />

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <h1 className="font-headline-lg text-headline-lg uppercase tracking-tighter text-primary mb-2">
              PREM CIVIL TECH
            </h1>
            <h2 className="font-title-md text-title-md text-on-surface">
              Admin Portal Login
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-container/20 border border-error text-error text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Email Field */}
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase mb-2" htmlFor="email">
                Email Address or Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                  mail
                </span>
                <input 
                  className="w-full bg-surface-dim border-x-0 border-t-0 border-b-2 border-surface-variant focus:border-primary text-on-surface font-body-md text-body-md pl-10 pr-4 py-3 placeholder-on-surface-variant/50 transition-colors focus:ring-0 focus:outline-none" 
                  id="email" 
                  name="email" 
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@premcivil.com or admin" 
                  required 
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                  lock
                </span>
                <input 
                  className="w-full bg-surface-dim border-x-0 border-t-0 border-b-2 border-surface-variant focus:border-primary text-on-surface font-body-md text-body-md pl-10 pr-12 py-3 placeholder-on-surface-variant/50 transition-colors focus:ring-0 focus:outline-none" 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none" 
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input 
                  className="h-4 w-4 rounded-none border-surface-variant bg-surface-dim text-primary focus:ring-primary focus:ring-offset-background" 
                  id="remember-me" 
                  name="remember-me" 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="ml-2 block font-body-md text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember-me">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a 
                  className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors" 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please contact the head office system administrator to reset credentials.');
                  }}
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                className="w-full bg-primary-container hover:bg-primary text-on-primary-container font-title-md text-title-md py-4 px-4 uppercase tracking-wide transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 border border-primary-container" 
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Authenticating...' : 'Access Dashboard'}</span>
                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </div>
          </form>

          {/* Decorative Border Accents */}
          <div className="absolute top-0 left-0 w-8 h-1 bg-primary-container"></div>
          <div className="absolute top-0 left-0 w-1 h-8 bg-primary-container"></div>
          <div className="absolute bottom-0 right-0 w-8 h-1 bg-primary-container"></div>
          <div className="absolute bottom-0 right-0 w-1 h-8 bg-primary-container"></div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60">
            Secure Portal © {new Date().getFullYear()} Prem Civil Tech Solution
          </p>
        </div>
      </main>
    </div>
  );
}
