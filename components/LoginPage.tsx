import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onSignUpClick: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSignUpClick }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Validation States
  const [error, setError] = useState('');
  
  // Status
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Load local profile on mount
  useEffect(() => {
    const storedProfile = localStorage.getItem('temori_profile');
    if (storedProfile) {
      try {
        const { name } = JSON.parse(storedProfile);
        setProfileName(name || '');
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
  }, []);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setToast(null);

    setStatus('loading');

    // Simulate Processing Delay for UX
    setTimeout(() => {
        try {
            const storedProfileStr = localStorage.getItem('temori_profile');
            
            if (!storedProfileStr) {
                throw new Error('No profile found on this device.');
            }

            const storedProfile = JSON.parse(storedProfileStr);
            
            // Check Profile Name
            if (storedProfile.name.toLowerCase() !== profileName.trim().toLowerCase()) {
                throw new Error('Profile name does not match.');
            }

            // Check Passcode (if one was set)
            if (storedProfile.passcode && storedProfile.passcode !== passcode) {
                throw new Error('Incorrect passcode.');
            }

            setStatus('success');
            setToast({ message: 'Welcome back!', type: 'success' });
            
            setTimeout(() => {
                onLoginSuccess();
            }, 800);

        } catch (err: any) {
            setStatus('idle');
            setError(err.message || 'Unlock failed');
            setToast({ message: err.message || 'Unlock failed', type: 'error' });
        }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative animate-zoom-in overflow-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border animate-bounce-in transition-all duration-300 ${
            toast.type === 'error' 
                ? 'bg-red-500/90 text-white border-red-400' 
                : 'bg-green-500/90 text-white border-green-400'
        }`}>
            {toast.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
            <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Logo Section */}
      <div className="relative mb-8 flex flex-col items-center z-10">
        <div className="relative group cursor-default">
          {/* Glassmorphic Icon Container */}
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col items-center justify-center shadow-xl relative p-2 transition-transform duration-300 transform group-hover:scale-110">
            {/* Bear Icon Content */}
            <div className="w-full h-full bg-[#5D3F6A]/80 rounded-xl flex items-center justify-center overflow-hidden relative">
               <div className="relative w-14 h-14 bg-[#4A3055] rounded-full flex items-center justify-center shadow-inner">
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-[#4A3055] rounded-full"></div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#4A3055] rounded-full"></div>
                  <div className="absolute top-0 left-0 w-3 h-3 bg-[#D98BA8] rounded-full opacity-60"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#D98BA8] rounded-full opacity-60"></div>
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-2">
                     <div className="flex space-x-3 mb-1">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                     </div>
                     <div className="w-6 h-4 bg-[#D98BA8] rounded-full flex items-center justify-center mt-1">
                        <div className="w-2 h-1.5 bg-[#4A3055] rounded-full"></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
        <h1 className="font-cursive text-4xl text-white mt-4 tracking-wide drop-shadow-md">Temori</h1>
        <p className="text-white/60 text-sm mt-1">Your Life, Organized. Privacy First.</p>
      </div>

      {/* Glassmorphic Login Card */}
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2rem] p-8 shadow-2xl z-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Profile Name Input */}
          <div className="flex flex-col gap-2 group">
            <label className="text-white/80 text-sm font-semibold ml-1">Profile Name</label>
            <input 
              type="text" 
              placeholder="Enter your name"
              value={profileName}
              disabled={status === 'loading' || status === 'success'}
              onChange={(e) => {
                  setProfileName(e.target.value);
                  setError('');
              }}
              className={`
                w-full bg-white/5 border text-white p-4 rounded-xl outline-none transition-all duration-300 placeholder-white/30
                hover:scale-105 focus:bg-white/10 focus:scale-105 focus:border-white/40
                ${error && error.includes('name') ? 'border-red-400 bg-red-400/10' : 'border-white/10'}
              `}
            />
          </div>

          {/* Passcode Input */}
          <div className="flex flex-col gap-2 group">
            <label className="text-white/80 text-sm font-semibold ml-1">Passcode (optional)</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={passcode}
                disabled={status === 'loading' || status === 'success'}
                onChange={(e) => {
                    setPasscode(e.target.value);
                    setError('');
                }}
                className={`
                  w-full bg-white/5 border text-white p-4 rounded-xl outline-none transition-all duration-300 placeholder-white/30 tracking-widest
                  hover:scale-105 focus:bg-white/10 focus:scale-105 focus:border-white/40
                  ${error && error.includes('passcode') ? 'border-red-400 bg-red-400/10' : 'border-white/10'}
                `}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                disabled={status === 'loading'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
             {error && (
                <p className="text-red-300 text-xs ml-1 flex items-center gap-1 animate-fade-in">
                    <AlertCircle size={12} /> {error}
                </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white transition-colors">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-white/10 text-brand-primary focus:ring-brand-primary"
              />
              Keep unlocked
            </label>
            {/* Removed Forgot Password */}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-2">
            <button 
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className={`
                w-full text-white font-bold text-lg py-4 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center
                ${status === 'loading' ? 'bg-brand-primary/80 cursor-wait' : 'bg-brand-primary hover:bg-[#3d8c8c] hover:scale-105 active:scale-95'}
                ${status === 'success' ? 'bg-green-500 hover:bg-green-600' : ''}
              `}
            >
              {status === 'loading' ? (
                <Loader2 className="animate-spin" />
              ) : status === 'success' ? (
                <CheckCircle className="animate-bounce" />
              ) : (
                'Open Temori'
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center mt-4 flex-col gap-1">
             <p className="text-white/40 text-xs text-center">This profile exists only on this device.</p>
             
             <div className="flex items-center mt-2">
                <button 
                  type="button" 
                  onClick={onSignUpClick}
                  className="text-white/80 text-sm hover:underline hover:text-brand-primary transition-all duration-300"
                >
                  Create new profile
                </button>
             </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;