import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Users, Globe, Clock, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onRegisterClick: () => void;
}

export default function Hero({ onRegisterClick }: HeroProps) {
  const { phaseInfo, stats } = useApp();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Countdown timer logic to July 20, 2026
  useEffect(() => {
    const targetDate = new Date(stats.startDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stats.startDate]);

  // Phase details for pricing transparency
  const displayPrice = phaseInfo.currentPhase === 1 ? '₦5,000' : '₦10,000';
  const originalPrice = '₦20,000';
  const displayDiscount = phaseInfo.currentPhase === 1 ? '75% OFF' : '50% OFF';

  return (
    <header className="relative bg-slate-950 text-white pt-16 pb-24 overflow-hidden border-b border-blue-900/40">
      
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,78,216,0.15),transparent_45%)]" />
      <div className="absolute -left-1/4 -bottom-1/4 w-1/2 h-1/2 bg-blue-900/10 rounded-full blur-[120px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Copy (Left 7 Columns on Large Screens) */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
            
            {/* Promo Pill Banner */}
            <div className="mx-auto lg:mx-0 inline-flex items-center gap-2 bg-blue-950/80 border border-blue-500/30 text-blue-300 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              GLOBAL ENROLLMENT NOW OPEN
            </div>

            {/* Premium Display Typography Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              AI Video Editing <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Masterclass 2026
              </span>
            </h1>

            {/* High Impact Pitch Paragraph */}
            <p className="text-slate-300 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Go from complete beginner to creating viral, professional-grade AI videos in just 30 days! Learn the secret workflows of UGC creators, storytelling blueprints, and client acquisition methods to start earning as a premium creator.
            </p>

            {/* Core Selling Points Bullet Deck */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-left max-w-xl mx-auto lg:mx-0">
              {[
                'UGC and Cinematic AI Workflows',
                'Advanced Prompt Engineering secrets',
                'Recorded Lessons with Lifetime Access',
                'Private WhatsApp and Telegram community'
              ].map((point) => (
                <div key={point} className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-6">
              <button
                onClick={onRegisterClick}
                id="hero-register-cta"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-900/50 hover:shadow-blue-500/30 flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 group"
              >
                <span>Secure Your Slot Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => window.location.hash = '#/portal'}
                className="w-full sm:w-auto bg-slate-900/90 border border-slate-800 hover:border-blue-800 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
              >
                <Play className="w-4 h-4 fill-current text-blue-400 shrink-0" />
                <span>Student Classroom Demo</span>
              </button>
            </div>

            {/* Pre-seeded Social Proof Stats Strip */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-8 mt-4 text-center lg:text-left max-w-lg mx-auto lg:mx-0">
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black text-white">47/50</span>
                <span className="text-slate-400 text-xs mt-1 font-semibold uppercase">Phase 1 Slots filled</span>
              </div>
              <div className="flex flex-col border-x border-slate-800/80 px-4">
                <span className="text-2xl sm:text-3xl font-black text-white">6+</span>
                <span className="text-slate-400 text-xs mt-1 font-semibold uppercase">Countries reached</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black text-white">₦1,000</span>
                <span className="text-slate-400 text-xs mt-1 font-semibold uppercase">Registration Fee</span>
              </div>
            </div>

          </div>

          {/* Pricing & Countdown card (Right 5 Columns on Large Screens) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-slate-900/95 border border-blue-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              
              {/* Highlight phase ribbon */}
              <div className="absolute -top-3 left-6 bg-blue-600 text-white font-bold text-xs uppercase px-4 py-1.5 rounded-full tracking-wider shadow-md">
                Phase {phaseInfo.currentPhase} Early Bird Price
              </div>

              {/* Price Display */}
              <div className="flex justify-between items-end mb-6 mt-2 border-b border-slate-800 pb-5">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs uppercase font-extrabold tracking-wider">Tuition Fee</span>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-white">{displayPrice}</span>
                    <span className="text-slate-500 line-through text-lg font-bold">{originalPrice}</span>
                  </div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-xs px-3 py-1.5 rounded-lg">
                  {displayDiscount} SAVE
                </span>
              </div>

              {/* Countdown Clock Header */}
              <div className="flex items-center gap-2 text-slate-300 font-bold text-sm mb-4">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>TRAINING COMMENCES IN:</span>
              </div>

              {/* Dynamic Grid Countdown Panels */}
              <div className="grid grid-cols-4 gap-2 text-center mb-6">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Mins' },
                  { value: timeLeft.seconds, label: 'Secs' }
                ].map((item, index) => (
                  <div key={index} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 shadow-inner">
                    <span className="block text-2xl sm:text-3xl font-black text-blue-400 leading-none">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 mt-1 block">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Countdown to switch phase information alert banner */}
              <div className="bg-blue-950/50 border border-blue-900/30 rounded-xl p-4 text-sm mb-6 text-blue-200">
                <div className="flex justify-between items-center font-bold mb-1">
                  <span>Phase {phaseInfo.currentPhase} Progress</span>
                  <span className="text-blue-400">{phaseInfo.switchCounter} spots left</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.max(5, Math.min(100, ((phaseInfo.slotsLimit - phaseInfo.slotsRemaining) / phaseInfo.slotsLimit) * 100))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium leading-normal">
                  Note: When Phase 1 fills up completely, price increases to <strong>₦10,000</strong> for Phase 2 automatically. Securing your slot requires completing the ₦1,000 application.
                </p>
              </div>

              {/* Urgent CTA inside the pricing card */}
              <button
                onClick={onRegisterClick}
                id="hero-card-cta"
                className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
              >
                <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Register Form (₦1,000)</span>
              </button>

              <div className="text-center mt-3 text-[11px] text-slate-400 font-bold">
                *PalmPay Secure Transfers — Instant Queue Assignment
              </div>

            </div>
          </div>

        </div>
      </div>
      
    </header>
  );
}
