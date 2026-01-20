import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

interface SignUpPageProps {
  onSignUpSuccess: () => void;
  onLoginClick: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUpSuccess, onLoginClick }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [passcode, setPasscode] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    if (!profileName.trim()) {
        setErrorMessage('Profile name is required.');
        return false;
    }
    // Passcode is optional for local profiles, but if provided, maybe min length?
    // Let's keep it completely optional or just standard if typed.
    // For now, allow empty passcode for "Unsecured" profile.
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 500);
        return;
    }

    setStatus('loading');

    // Simulate creation
    setTimeout(() => {
        try {
            const profileData = {
                name: profileName,
                passcode: passcode, // In real app, hash this
                createdAt: new Date().toISOString()
            };
            
            localStorage.setItem('temori_profile', JSON.stringify(profileData));
            
            setStatus('success');
            
            setTimeout(() => {
                onSignUpSuccess();
            }, 1000);
        } catch (err) {
            setErrorMessage('Failed to create profile. Storage might be full.');
            setStatus('error');
        }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative animate-zoom-in">
      
      {/* Background Blobs */}
      <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[10%] left-[10%] w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Back Button */}
      <button 
        onClick={onLoginClick}
        className="absolute top-8 left-6 text-white/80 hover:text-white transition-transform hover:scale-110 z-20 p-2 bg-white/10 rounded-full backdrop-blur-sm"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Header */}
      <div className="relative mb-6 flex flex-col items-center z-10 text-center">
        <h1 className="font-cursive text-4xl text-white tracking-wide drop-shadow-md">Create Profile</h1>
        <p className="text-white/60 text-sm mt-2 max-w-xs">Setup your local profile to start using Temori.</p>
      </div>

      {/* Glassmorphic Sign Up Card */}
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2rem] p-8 shadow-2xl z-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Profile Name Input */}
          <div className="flex flex-col gap-2 group">
            <label className="text-white/80 text-sm font-semibold ml-1">Profile Name</label>
            <input 
              type="text" 
              placeholder="Your Name"
              value={profileName}
              disabled={status === 'loading' || status === 'success'}
              onChange={(e) => setProfileName(e.target.value)}
              className={`
                w-full bg-white/5 border text-white p-4 rounded-xl outline-none transition-all duration-300 placeholder-white/30
                hover:scale-105 focus:bg-white/10 focus:scale-105 focus:border-white/40
                ${status === 'error' && !profileName ? 'border-red-400' : 'border-white/10'}
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
                onChange={(e) => setPasscode(e.target.value)}
                className={`
                  w-full bg-white/5 border text-white p-4 rounded-xl outline-none transition-all duration-300 placeholder-white/30 tracking-widest
                  hover:scale-105 focus:bg-white/10 focus:scale-105 focus:border-white/40
                  ${status === 'error' && errorMessage.includes('Password') ? 'border-red-400' : 'border-white/10'}
                `}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-white/40 text-xs ml-1">Leave empty for no lock.</p>
          </div>

           {/* Error Message */}
           {errorMessage && (
            <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-shake">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

          {/* Create Button */}
          <button 
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className={`
              w-full text-white font-bold text-lg py-4 rounded-2xl shadow-lg transition-all duration-200 mt-2 flex items-center justify-center
              ${status === 'loading' ? 'bg-brand-primary/80 cursor-wait' : 'bg-brand-primary hover:bg-[#3d8c8c] hover:scale-105 active:scale-95'}
              ${status === 'success' ? 'bg-green-500 hover:bg-green-600' : ''}
            `}
          >
             {status === 'loading' ? (
                <Loader2 className="animate-spin" />
              ) : status === 'success' ? (
                <CheckCircle className="animate-bounce" />
              ) : (
                'Create Profile'
              )}
          </button>

          {/* Footer Links */}
          <div className="flex items-center justify-center mt-2">
            <span className="text-white/60 text-sm mr-2">Already have a profile?</span>
            <button 
              type="button" 
              onClick={onLoginClick}
              className="text-white font-bold hover:underline hover:text-brand-primary transition-all duration-300 inline-block hover:scale-105"
            >
              Open it
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SignUpPage;