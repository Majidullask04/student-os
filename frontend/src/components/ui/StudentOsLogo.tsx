import React from 'react';

interface StudentOsLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  theme?: 'dark' | 'light';
}

/**
 * Authentic, Human-Crafted Brand Logo for Student OS.
 * Features an interlocking geometric "S • OS" vector mark symbolizing
 * layered knowledge pathways (Student) converging into an operating system core (OS).
 */
export const StudentOsLogo: React.FC<StudentOsLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
  theme = 'dark',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Precision Geometric Vector Mark */}
      <div 
        className="relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-md shadow-indigo-950/20"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="s-os-grad-primary" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="s-os-grad-accent" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
            <linearGradient id="s-os-surface" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="100%" stopColor="#0B0F19" />
            </linearGradient>
          </defs>

          {/* Background Slate/Indigo Vessel */}
          <rect width="48" height="48" rx="12" fill="url(#s-os-surface)" />
          <rect width="46" height="46" x="1" y="1" rx="11" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />

          {/* Upper Pathway: Flowing from Top-Right through Center (Student Path) */}
          <path
            d="M 34 14 C 34 10.686 30.314 8 26 8 L 19 8 C 14.582 8 11 11.582 11 16 C 11 20.418 14.582 24 19 24 L 29 24 C 33.418 24 37 27.582 37 32 C 37 36.418 33.418 40 29 40 L 21 40 C 16.582 40 13 37 13 33.5"
            stroke="url(#s-os-grad-primary)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Operating System Core Anchor: Precision Diamond Accent */}
          <circle cx="24" cy="24" r="2.5" fill="#38BDF8" />
          
          {/* Subtle OS Corner Orbit Spark */}
          <circle cx="34" cy="14" r="1.75" fill="#A5B4FC" />
          <circle cx="14" cy="34" r="1.75" fill="#C084FC" />
        </svg>
      </div>

      {/* Typography Label */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight text-base ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Student
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
              OS
            </span>
          </div>
          <span className={`text-[10px] font-medium tracking-wide mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Personal AI Platform
          </span>
        </div>
      )}
    </div>
  );
};
