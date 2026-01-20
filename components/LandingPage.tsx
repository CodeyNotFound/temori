import React, { useState, useEffect } from 'react';
import { 
  Shield, Zap, WifiOff, Calendar, CheckSquare, FileText, 
  ChevronDown, ChevronUp, Github, Twitter, Mail, ArrowRight, 
  Download, Smartphone, Menu, X, CheckCircle 
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setInstallPrompt(null);
      });
    } else {
      // Scroll to install guide
      document.getElementById('install-guide')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const BearLogo = ({ size = "normal" }: { size?: "normal" | "small" }) => (
    <div className={`${size === "small" ? "w-10 h-10 rounded-lg p-1" : "w-20 h-20 rounded-2xl p-2"} bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shadow-lg`}>
      <div className="w-full h-full bg-[#5D3F6A]/80 rounded-lg flex items-center justify-center overflow-hidden relative">
         <div className={`relative ${size === "small" ? "w-6 h-6" : "w-12 h-12"} bg-[#4A3055] rounded-full flex items-center justify-center shadow-inner`}>
            <div className={`absolute -top-1 -left-1 ${size === "small" ? "w-2 h-2" : "w-4 h-4"} bg-[#4A3055] rounded-full`}></div>
            <div className={`absolute -top-1 -right-1 ${size === "small" ? "w-2 h-2" : "w-4 h-4"} bg-[#4A3055] rounded-full`}></div>
            <div className="absolute top-0 left-0 w-2 h-2 bg-[#D98BA8] rounded-full opacity-60"></div>
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#D98BA8] rounded-full opacity-60"></div>
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-1">
               <div className="flex space-x-1 mb-0.5">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
               </div>
               <div className={`${size === "small" ? "w-3 h-2" : "w-5 h-3"} bg-[#D98BA8] rounded-full flex items-center justify-center mt-0.5`}>
                  <div className="w-1 h-0.5 bg-[#4A3055] rounded-full"></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen text-white overflow-y-auto pb-20 scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#5D3F6A]/90 backdrop-blur-md border-b border-white/10 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BearLogo size="small" />
            <span className="font-cursive text-2xl tracking-wide">Temori</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="#install-guide" className="hover:text-white transition-colors">Install</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <button 
              onClick={onGetStarted}
              className="bg-brand-primary hover:bg-[#3d8c8c] text-white px-5 py-2 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Get Started
            </button>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#5D3F6A] border-b border-white/10 py-4 px-6 flex flex-col gap-4 shadow-2xl">
             <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-white py-2">Features</a>
             <a href="#privacy" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-white py-2">Privacy</a>
             <a href="#install-guide" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-white py-2">Install</a>
             <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  onGetStarted();
                }}
                className="bg-brand-primary text-white py-3 rounded-xl w-full text-center font-bold"
             >
                Get Started
             </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
        <div className="animate-zoom-in">
           <BearLogo />
        </div>
        <h1 className="font-cursive text-5xl md:text-7xl mt-8 mb-4 tracking-wide drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
          Temori: Your Life, Organized
        </h1>
        <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-2xl font-light">
          Privacy-first calendar. No cloud, no tracking, no servers.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
           <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Shield size={16} className="text-green-400" />
              <span className="text-sm font-medium">100% Private</span>
           </div>
           <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-sm font-medium">Lightning Fast</span>
           </div>
           <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <WifiOff size={16} className="text-blue-400" />
              <span className="text-sm font-medium">Works Offline</span>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={onGetStarted}
            className="bg-brand-primary hover:bg-[#3d8c8c] text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl shadow-teal-900/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            Get Started Free <ArrowRight size={20} />
          </button>
          <button 
            onClick={handleInstall}
            className="bg-white/10 hover:bg-white/20 text-white text-lg font-semibold px-8 py-4 rounded-2xl border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            Install App <Download size={20} />
          </button>
        </div>

        {/* Hero Visual Preview */}
        <div className="mt-16 relative w-full max-w-md mx-auto aspect-[9/16] bg-[#F9F5F9] rounded-[2.5rem] border-8 border-white/10 shadow-2xl overflow-hidden flex flex-col transform hover:rotate-1 transition-transform duration-500">
           {/* Mock Header */}
           <div className="bg-[#5D3F6A] h-24 rounded-t-[2rem] w-full p-6 flex flex-col justify-end">
              <div className="h-4 w-32 bg-white/20 rounded-full mb-3"></div>
              <div className="h-8 w-48 bg-white/90 rounded-full"></div>
           </div>
           {/* Mock Calendar Grid */}
           <div className="p-4 grid grid-cols-7 gap-2">
              {[...Array(28)].map((_, i) => (
                 <div key={i} className={`h-8 w-8 rounded-full flex items-center justify-center text-xs text-gray-400 ${i === 14 ? 'bg-brand-primary text-white shadow-lg' : ''}`}>
                    {i + 1}
                 </div>
              ))}
           </div>
           {/* Mock Event Cards */}
           <div className="px-4 space-y-3 mt-2">
              <div className="h-16 bg-white rounded-xl shadow-sm border border-purple-100 flex items-center px-4 gap-3">
                 <div className="w-8 h-8 rounded-full bg-purple-100"></div>
                 <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                 </div>
              </div>
              <div className="h-16 bg-white rounded-xl shadow-sm border border-purple-100 flex items-center px-4 gap-3">
                 <div className="w-8 h-8 rounded-full bg-teal-100"></div>
                 <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                    <div className="h-2 w-1/3 bg-gray-100 rounded"></div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-black/10 backdrop-blur-sm">
         <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-10">
               {[
                  { icon: Download, title: "1. Get the App", desc: "No account needed. Works right in your browser or install it." },
                  { icon: CheckCircle, title: "2. Create Profile", desc: "Just your name and an optional passcode. Takes 10 seconds." },
                  { icon: Calendar, title: "3. Start Organizing", desc: "Add events, tasks, and habits. All stored safely on your device." }
               ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                     <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mb-6 text-brand-primary">
                        <step.icon size={32} />
                     </div>
                     <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                     <p className="text-white/60 leading-relaxed">{step.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
         <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Everything You Need</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                  { icon: Calendar, title: "Beautiful Calendar", desc: "Month, week, and day views. Drag-and-drop events." },
                  { icon: CheckSquare, title: "Track What Matters", desc: "To-dos with due dates. Daily habits with streak tracking." },
                  { icon: FileText, title: "Capture Ideas", desc: "Quick notes with markdown support and organization." },
                  { icon: Shield, title: "Your Data, Your Device", desc: "Zero cloud storage. Export anytime. Delete whenever." }
               ].map((feature, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] hover:transform hover:-translate-y-2 transition-transform duration-300">
                     <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-brand-primary">
                        <feature.icon size={24} />
                     </div>
                     <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                     <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Why Local */}
      <section id="privacy" className="py-20 px-6 bg-brand-primary/10">
         <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block p-3 rounded-full bg-brand-primary/20 text-brand-primary mb-6">
               <Shield size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why No Login?</h2>
            <p className="text-xl text-white/80 leading-relaxed mb-10">
               Most calendar apps force you to create accounts, upload your private schedule to their servers, and trust them with your data.
               <br/><br/>
               <span className="text-brand-primary font-bold">Temori is different.</span> Everything stays on your device.
               No servers means no data breaches, no tracking, and instant speed.
            </p>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                  <thead className="bg-white/10">
                     <tr>
                        <th className="p-4 text-sm uppercase tracking-wider text-white/60">Feature</th>
                        <th className="p-4 text-brand-primary font-bold">Temori</th>
                        <th className="p-4 text-white/40">Traditional Apps</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     <tr>
                        <td className="p-4 font-medium">Account Required</td>
                        <td className="p-4 text-green-400 font-bold">❌ No</td>
                        <td className="p-4 text-red-300">✅ Yes</td>
                     </tr>
                     <tr>
                        <td className="p-4 font-medium">Data on Servers</td>
                        <td className="p-4 text-green-400 font-bold">❌ No</td>
                        <td className="p-4 text-red-300">✅ Yes</td>
                     </tr>
                     <tr>
                        <td className="p-4 font-medium">Works Offline</td>
                        <td className="p-4 text-green-400 font-bold">✅ Yes</td>
                        <td className="p-4 text-red-300">❌ No</td>
                     </tr>
                     <tr>
                        <td className="p-4 font-medium">Privacy</td>
                        <td className="p-4 text-green-400 font-bold">✅ 100%</td>
                        <td className="p-4 text-yellow-300">⚠️ Limited</td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>
      </section>

      {/* Installation Guide */}
      <section id="install-guide" className="py-20 px-6">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How to Install</h2>
            <div className="space-y-4">
               <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-start gap-4">
                  <div className="bg-blue-500/20 p-2 rounded-lg"><Smartphone className="text-blue-300" /></div>
                  <div>
                     <h3 className="text-lg font-bold mb-1">iOS (Safari)</h3>
                     <p className="text-white/60 text-sm">Tap the <span className="text-white font-bold">Share</span> button in the menu bar, then scroll down and tap <span className="text-white font-bold">Add to Home Screen</span>.</p>
                  </div>
               </div>
               <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-start gap-4">
                  <div className="bg-green-500/20 p-2 rounded-lg"><Smartphone className="text-green-300" /></div>
                  <div>
                     <h3 className="text-lg font-bold mb-1">Android (Chrome)</h3>
                     <p className="text-white/60 text-sm">Tap the <span className="text-white font-bold">Menu</span> (3 dots) button, then tap <span className="text-white font-bold">Install App</span> or <span className="text-white font-bold">Add to Home screen</span>.</p>
                  </div>
               </div>
               <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-start gap-4">
                  <div className="bg-purple-500/20 p-2 rounded-lg"><Download className="text-purple-300" /></div>
                  <div>
                     <h3 className="text-lg font-bold mb-1">Desktop (Chrome/Edge)</h3>
                     <p className="text-white/60 text-sm">Click the <span className="text-white font-bold">Install Icon</span> in the right side of the address bar.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-black/10">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
               {[
                  { q: "Is my data safe?", a: "Yes! Your data is stored in your browser's secure storage (IndexedDB/LocalStorage). It never leaves your device." },
                  { q: "What if I lose my data?", a: "We recommend exporting your data regularly from the Settings menu. You can save the backup file to your Google Drive or computer." },
                  { q: "Can I use it on multiple devices?", a: "Currently, each device has its own local data. Cloud sync is planned as a future optional feature." },
                  { q: "Do I need an account?", a: "No! Just create a local profile with your name. No email or phone number required." }
               ].map((item, i) => (
                  <details key={i} className="group bg-white/5 rounded-2xl border border-white/10 open:bg-white/10 transition-colors">
                     <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-lg">
                        {item.q}
                        <ChevronDown className="group-open:rotate-180 transition-transform text-white/60" />
                     </summary>
                     <div className="px-6 pb-6 text-white/70 leading-relaxed">
                        {item.a}
                     </div>
                  </details>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 bg-[#4A3055]">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
               <BearLogo size="small" />
               <div>
                  <h3 className="font-cursive text-xl">Temori</h3>
                  <p className="text-white/40 text-xs">© 2026 Temori. v1.0.0</p>
               </div>
            </div>
            
            <div className="flex gap-6 text-sm text-white/60">
               <a href="#" className="hover:text-white">Privacy Policy</a>
               <a href="#" className="hover:text-white">Terms of Use</a>
               <a href="#" className="hover:text-white">Support</a>
            </div>

            <div className="flex gap-4">
               <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors"><Twitter size={20} /></a>
               <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors"><Github size={20} /></a>
               <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors"><Mail size={20} /></a>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;