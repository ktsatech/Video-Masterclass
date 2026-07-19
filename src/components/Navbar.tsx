import React, { useState } from 'react';
import KingElidexLogo from './KingElidexLogo';
import { useApp } from '../context/AppContext';
import { Menu, X, ShieldAlert, Award, UserCheck, GraduationCap, Video } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export default function Navbar({ currentPath, navigate }: NavbarProps) {
  const { phaseInfo, currentAdmin, currentStudent } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '#/', icon: GraduationCap },
    { name: 'Check Status', path: '#/status', icon: UserCheck },
    { name: 'Student Portal', path: '#/portal', icon: Award },
    { name: '🔴 Watch Live', path: '#/watch', icon: Video },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Brand */}
          <div className="cursor-pointer" onClick={() => handleNavClick('#/')}>
            <KingElidexLogo size="md" />
          </div>

          {/* Desktop Navigation Link Matrix */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || 
                               (item.path === '#/' && (currentPath === '' || currentPath === '#'));
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  id={`nav-item-${item.name.replace(/\s+/g, '-').toLowerCase()}`}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.name}
                  {item.name === 'Admin Panel' && currentAdmin && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                  )}
                  {item.name === 'Student Portal' && currentStudent && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Live Statistics Alert Box */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full px-4 py-1.5 text-xs font-bold shadow-md shadow-blue-200 flex items-center gap-2 animate-bounce">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-100 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>PHASE {phaseInfo.currentPhase} ACTIVE</span>
            </div>
            
            <div className="bg-slate-100 text-slate-800 rounded-full px-4 py-1.5 text-xs font-semibold border border-slate-200">
              Slots left: <span className="text-blue-600 font-extrabold">{phaseInfo.slotsRemaining}</span>
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-50 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 flex flex-col gap-2 shadow-lg animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || 
                             (item.path === '#/' && (currentPath === '' || currentPath === '#'));
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.name}
                {item.name === 'Admin Panel' && currentAdmin && (
                  <span className="ml-auto text-xs px-2 py-0.5 bg-emerald-500 text-white rounded-full">Active</span>
                )}
                {item.name === 'Student Portal' && currentStudent && (
                  <span className="ml-auto text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">Logged In</span>
                )}
              </button>
            );
          })}

          <div className="h-px bg-slate-100 my-2" />

          {/* Mobile Live Statistics */}
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Class Intake</span>
              <span className="text-sm font-extrabold text-slate-800">Phase {phaseInfo.currentPhase} Enrollment</span>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-full">
              {phaseInfo.slotsRemaining} Slots Remaining
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}
