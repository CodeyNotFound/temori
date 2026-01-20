import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import CalendarPage from './components/CalendarPage';
import OnboardingPage from './components/OnboardingPage';
import LandingPage from './components/LandingPage';

export default function App() {
  // Initialize view based on whether a local profile exists
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'calendar' | 'signup' | 'onboarding'>(() => {
    const profile = localStorage.getItem('temori_profile');
    // If profile exists, go to unlock screen (login). If not, show landing page.
    return profile ? 'login' : 'landing';
  });

  const handleLoginSuccess = () => {
    setCurrentView('calendar');
  };

  const handleSignUpClick = () => {
    setCurrentView('signup');
  };

  const handleSignUpSuccess = () => {
    // New users go to onboarding first
    setCurrentView('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCurrentView('calendar');
  };

  const handleBackToLogin = () => {
    // Determine where "back" goes based on profile existence
    const profile = localStorage.getItem('temori_profile');
    setCurrentView(profile ? 'login' : 'landing');
  };

  const handleGetStarted = () => {
    setCurrentView('signup');
  };

  return (
    <div className="min-h-screen w-full bg-brand-dark flex justify-center overflow-x-hidden font-sans">
      {/* Mobile container constraint to match the aesthetic */}
      <div className="w-full h-full min-h-screen relative shadow-2xl overflow-x-hidden bg-gradient-to-br from-[#5D3F6A] to-[#2E1F35]">
        
        {/* Global Texture Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0 fixed"></div>

        <div className="relative z-10 w-full h-full">
          {currentView === 'landing' && (
             <LandingPage onGetStarted={handleGetStarted} />
          )}
          {currentView === 'login' && (
            <LoginPage onLoginSuccess={handleLoginSuccess} onSignUpClick={handleSignUpClick} />
          )}
          {currentView === 'signup' && (
            <SignUpPage onSignUpSuccess={handleSignUpSuccess} onLoginClick={handleBackToLogin} />
          )}
          {currentView === 'onboarding' && (
            <OnboardingPage onComplete={handleOnboardingComplete} />
          )}
          {currentView === 'calendar' && (
            <CalendarPage onBack={handleBackToLogin} />
          )}
        </div>
      </div>
    </div>
  );
}