import React, { useState } from 'react';
import { ArrowRight, Calendar, Target, Star, Check } from 'lucide-react';

interface OnboardingPageProps {
  onComplete: () => void;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const renderStepIndicator = () => (
    <div className="flex space-x-2 mb-8">
      {[1, 2, 3].map((i) => (
        <div 
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-brand-primary' : 'w-2 bg-white/30'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-fade-in relative z-20">
      
      {/* Container */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center">
        
        {renderStepIndicator()}

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-20 h-20 bg-brand-primary/20 rounded-full flex items-center justify-center mb-6 text-brand-primary border border-brand-primary/30">
              <Star size={40} className="fill-brand-primary/50" />
            </div>
            <h2 className="text-3xl font-cursive text-white mb-4">Hello there!</h2>
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              We're so happy you're here. Let's make your schedule a little more magical.
            </p>
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div className="flex flex-col items-center animate-fade-in w-full">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 text-purple-300 border border-purple-400/30">
              <Target size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">What's your focus?</h2>
            <p className="text-white/60 mb-6">Choose a primary goal for your calendar.</p>
            
            <div className="flex flex-col gap-3 w-full mb-4">
              {['Productivity', 'Self Care', 'School', 'Social'].map((goal) => (
                <button 
                  key={goal}
                  className="w-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-primary/50 hover:text-brand-primary text-white p-4 rounded-xl transition-all text-left font-semibold flex items-center justify-between group"
                >
                  {goal}
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Ready */}
        {step === 3 && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-300 border border-green-400/30">
              <Calendar size={48} />
            </div>
            <h2 className="text-3xl font-cursive text-white mb-4">You're all set!</h2>
            <p className="text-white/70 text-lg mb-8">
              Your calendar is ready. Let's start planning your beautiful days.
            </p>
          </div>
        )}

        {/* Navigation */}
        <button 
          onClick={handleNext}
          className="w-full bg-brand-primary hover:bg-[#3d8c8c] text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-900/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mt-auto"
        >
          {step === 3 ? (
            <>Get Started <Check size={20} /></>
          ) : (
            <>Continue <ArrowRight size={20} /></>
          )}
        </button>

      </div>
    </div>
  );
};

export default OnboardingPage;