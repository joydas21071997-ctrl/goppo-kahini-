import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const GoppoKahiniLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 sm:h-9 sm:w-9',
    md: 'h-8 w-8 sm:h-11 sm:w-11',
    lg: 'h-16 w-16 sm:h-20 sm:w-20',
    xl: 'h-24 w-24 sm:h-28 sm:w-28',
  };

  const titleSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-[15px] sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-2 sm:gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Enhanced Crystal Clear Goppo Kahini Logo Emblem with High-Definition Glow & Dual Border */}
      <div className="relative group shrink-0">
        {/* Ambient Radial Aura Glow: Light Purple & Pink */}
        <div className="absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500/40 via-pink-500/30 to-purple-600/40 opacity-70 blur-md group-hover:opacity-100 transition duration-500" />

        {/* Outer Dual-Tone Precision Frame */}
        <div className={`relative rounded-xl sm:rounded-2xl p-[1px] sm:p-[1.5px] bg-gradient-to-br from-purple-400 via-pink-500 to-purple-700 shadow-xl shadow-purple-950/50 transition-all duration-300 group-hover:scale-105 ${sizeClasses[size]}`}>
          <div className="h-full w-full rounded-[10px] sm:rounded-[14px] overflow-hidden bg-black/90 flex items-center justify-center relative p-0.5">
            <img
              src="/logo.png"
              alt="গপ্পো কাহিনী লোগো"
              className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                // Graceful fallback to rich stylized emblem if image path fails
                const target = e.target as HTMLElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML = `
                    <div class="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#1a1226] to-black text-pink-400 font-serif-story font-bold text-xs">
                      গপ্পো
                    </div>
                  `;
                }
              }}
            />
            {/* Subtle inner purple rim */}
            <div className="absolute inset-0 rounded-[10px] sm:rounded-[14px] ring-1 ring-inset ring-white/15 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Brand Typography */}
      {showSubtitle && (
        <div className="flex flex-col leading-tight shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className={`font-serif-story font-extrabold tracking-tight text-white drop-shadow-sm ${titleSizes[size]}`}>
              গপ্পো <span className="bg-gradient-to-r from-purple-300 via-pink-400 to-pink-300 bg-clip-text text-transparent">কাহিনী</span>
            </span>
            <span className="hidden sm:inline-flex items-center rounded-full bg-purple-500/20 border border-purple-500/40 px-1.5 py-0.2 text-[9px] font-bold text-pink-300 tracking-wide">
              অরিজিনাল
            </span>
          </div>
          <span className="hidden sm:block text-[10px] sm:text-[11px] font-medium text-purple-200/90 tracking-wide mt-0.5">
            রোমাঞ্চ, শান্তি ও মানুষের জীবন কথা
          </span>
        </div>
      )}
    </div>
  );
};
