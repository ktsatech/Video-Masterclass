import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function KingElidexLogo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: { icon: 'h-8 w-8', text: 'text-sm', sub: 'text-[7px]' },
    md: { icon: 'h-12 w-12', text: 'text-xl', sub: 'text-[9px]' },
    lg: { icon: 'h-20 w-20', text: 'text-3xl', sub: 'text-xs' },
    xl: { icon: 'h-32 w-32', text: 'text-5xl', sub: 'text-sm' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon portion: Monogram with the Crown */}
      <div className={`relative flex items-center justify-center shrink-0 ${currentSize.icon}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_2px_8px_rgba(29,78,216,0.3)]"
        >
          {/* Royal Crown hovering over the "K" */}
          <path
            d="M20 35 L26 43 L37 31 L48 43 L54 35 L48 47 L26 47 Z"
            fill="#3B82F6"
            className="animate-pulse"
            style={{ animationDuration: '3s' }}
          />
          {/* Crown Base beads */}
          <circle cx="20" cy="35" r="2" fill="#60A5FA" />
          <circle cx="37" cy="31" r="2" fill="#60A5FA" />
          <circle cx="54" cy="35" r="2" fill="#60A5FA" />
          
          {/* Main Stylized Monogram KE */}
          {/* Letter K & E combined with modern high-tech cutouts */}
          <path
            d="M26 48 H58 V56 H42 L58 78 H42 L26 56 V48 Z"
            fill="#2563EB"
          />
          <path
            d="M48 48 H76 V54 H58 V60 H72 V66 H58 V72 H76 V78 H48 V48 Z"
            fill="#1E293B"
          />
          {/* Intersecting glow lines */}
          <path
            d="M26 48 L48 68"
            stroke="#93C5FD"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Text Branding portion */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center">
            <span className={`font-sans font-black tracking-wider text-slate-900 ${currentSize.text}`}>
              KING <span className="text-blue-600">ELIDEX</span>
            </span>
          </div>
          <span className={`font-mono font-medium tracking-[0.25em] text-slate-500 mt-1 uppercase ${currentSize.sub}`}>
            AI Video Editor
          </span>
        </div>
      )}
    </div>
  );
}
