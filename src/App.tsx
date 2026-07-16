import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Curriculum from './components/Curriculum';
import RegistrationForm from './components/RegistrationForm';
import StudentStatus from './components/StudentStatus';
import StudentPortal from './components/StudentPortal';
import AdminDashboard from './components/AdminDashboard';
import KingElidexLogo from './components/KingElidexLogo';
import { Sparkles, X, User, Shield, Info, ArrowRight } from 'lucide-react';

function AppContent() {
  const { currentAdmin } = useApp();
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');
  const [initialSearchEmail, setInitialSearchEmail] = useState('');

  // Sync hash state with router changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  const handleRegistrationSuccess = (email: string, phone: string) => {
    setInitialSearchEmail(email);
    navigate('#/status');
  };

  // Render correct view based on path
  const renderView = () => {
    const cleanPath = currentPath === '' || currentPath === '#' ? '#/' : currentPath;

    switch (cleanPath) {
      case '#/':
        return (
          <div className="animate-fadeIn">
            <Hero onRegisterClick={() => {
              const element = document.getElementById('registration-portal');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('#/'); // fallback
              }
            }} />
            
            {/* KING ELIDEX PERSONAL MISSION STATEMENT SECTION */}
            <section className="bg-slate-900 border-y border-slate-800 py-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_60%)]" />
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full mb-6 shadow-xl">
                  <span className="text-white font-black text-xl tracking-tighter">KE</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-6">
                  A Personal Word from King Elidex
                </h3>
                <blockquote className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed italic max-w-3xl mx-auto mb-8">
                  "Hundreds have tried to create videos and many have tried editing, the biggest mistake is that people sometimes start with wrong tools and others use the right tools the wrong way , we are now offering all the master class foundation to full equipment in the video production field at the lowest possible price according to the global demands. Having this knowledge at hand , don't fail to invite more of your friends to be in the first phase as we all become generals in the field that the world respects"
                </blockquote>
                <div className="font-extrabold text-blue-400 text-xs uppercase tracking-widest">
                  — KING ELIDEX, FOUNDER & LEAD INSTRUCTOR
                </div>
              </div>
            </section>

            <Curriculum />
            <div className="bg-slate-50 py-12 border-t border-slate-150">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <h3 className="text-2xl font-black text-slate-900">Secure Registration Desk</h3>
                  <p className="text-slate-500 text-xs mt-1 font-semibold">
                    Submit your application details and transaction receipts to initiate WhatsApp evaluation contact.
                  </p>
                </div>
                <RegistrationForm onSuccess={handleRegistrationSuccess} />
              </div>
            </div>
          </div>
        );
      case '#/status':
        return (
          <StudentStatus 
            initialSearchEmail={initialSearchEmail} 
            onNavigateToPortal={() => {
              setInitialSearchEmail('');
              navigate('#/portal');
            }} 
          />
        );
      case '#/portal':
        return <StudentPortal />;
      case '#/admin':
        return <AdminDashboard />;
      default:
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-black text-slate-800">Page Not Found</h2>
            <button 
              onClick={() => navigate('#/')}
              className="mt-4 bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              Back to Home
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navbar currentPath={currentPath} navigate={navigate} />

      {/* Main Page Area */}
      <main className="flex-1">
        {renderView()}
      </main>

      {/* Global Brand Footer */}
      <footer className="bg-slate-950 text-white border-t border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-12">
            
            {/* Column 1: Brand Info */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <KingElidexLogo size="md" className="filter invert brightness-200" />
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-semibold">
                An elite, results-focused training system by King Elidex. Empowering young creators globally with professional AI editing workflows, story blueprints, and client-closing tools.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:col-span-3 flex flex-col gap-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Navigation Matrix</h4>
              <div className="flex flex-col gap-2 text-xs font-bold text-slate-400">
                <button onClick={() => navigate('#/')} className="hover:text-white text-left transition-colors">Home Landing</button>
                <button onClick={() => navigate('#/status')} className="hover:text-white text-left transition-colors">Queue Status Checker</button>
                <button onClick={() => navigate('#/portal')} className="hover:text-white text-left transition-colors">Classroom Portal</button>
                {currentAdmin && (
                  <button onClick={() => navigate('#/admin')} className="hover:text-white text-left transition-colors">Admin Terminal</button>
                )}
              </div>
            </div>

            {/* Column 3: Contact details */}
            <div className="md:col-span-4 flex flex-col gap-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Office coordinates</h4>
              <div className="flex flex-col gap-2 text-xs font-semibold text-slate-400 leading-normal">
                <p>📞 WhatsApp Support: +234 916 315 2202</p>
                <p>✉️ Registrar Email: elijahadeyinka75@gmail.com</p>
                <p>🏛️ PalmPay Secure Vault Services Enabled.</p>
              </div>
            </div>

          </div>

          {/* Sub Footer copyright */}
          <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-[11px] font-bold">
            <p>© 2026 King Elidex AI Masterclass Series. All rights reserved.</p>
            <p>Verification partner: Ktesatech Reception Services.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
