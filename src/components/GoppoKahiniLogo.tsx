import React from 'react';
import { ThemeMode } from '../types';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
  theme?: ThemeMode;
  isLight?: boolean;
}

export const GoppoKahiniLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
  theme,
  isLight: isLightProp,
}) => {
  const isLight = isLightProp ?? (theme ? theme === 'purple-light' || theme === 'calm-green' : false);

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
        <div className={`absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500/40 via-pink-500/30 to-purple-600/40 transition duration-500 ${
          isLight ? 'opacity-50 group-hover:opacity-80 blur-sm' : 'opacity-70 group-hover:opacity-100 blur-md'
        }`} />

        {/* Outer Dual-Tone Precision Frame */}
        <div className={`relative rounded-xl sm:rounded-2xl p-[1px] sm:p-[1.5px] bg-gradient-to-br from-purple-500 via-pink-500 to-purple-700 shadow-md transition-all duration-300 group-hover:scale-105 ${sizeClasses[size]}`}>
          <div className={`h-full w-full rounded-[10px] sm:rounded-[14px] overflow-hidden flex items-center justify-center relative p-0.5 ${
            isLight ? 'bg-[#180e28]' : 'bg-black/90'
          }`}>
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
            {/* Subtle inner rim */}
            <div className="absolute inset-0 rounded-[10px] sm:rounded-[14px] ring-1 ring-inset ring-white/20 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Brand Typography with High-Contrast Adaptive Outlining */}
      {showSubtitle && (
        <div className="flex flex-col leading-tight shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5">
            {isLight ? (
              /* Light Mode: Crisp dark outline and intense contrasting tones so 'গপ্পো' never fades */
              <span className={`font-serif-story font-black tracking-tight text-zinc-950 ${titleSizes[size]}`}
                style={{
                  textShadow: '0 0 1px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(255, 255, 255, 0.8)',
                  WebkitTextStroke: '0.4px rgba(15, 8, 29, 0.85)',
                }}
              >
                গপ্পো <span className="bg-gradient-to-r from-purple-800 via-pink-600 to-purple-900 bg-clip-text text-transparent font-black"
                  style={{
                    WebkitTextStroke: '0.2px rgba(120, 20, 100, 0.5)',
                  }}
                > কাহিনী</span>
              </span>
            ) : (
              /* Dark Mode: Luminescent text with white drop-shadow/outline */
              <span className={`font-serif-story font-extrabold tracking-tight text-white ${titleSizes[size]}`}
                style={{
                  textShadow: '0 0 8px rgba(255, 255, 255, 0.35), 0 1px 3px rgba(0, 0, 0, 0.9)',
                }}
              >
                গপ্পো <span className="bg-gradient-to-r from-purple-300 via-pink-400 to-pink-300 bg-clip-text text-transparent font-bold">কাহিনী</span>
              </span>
            )}

            <span className={`hidden sm:inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-bold tracking-wide ${
              isLight
                ? 'bg-purple-100 border border-purple-300 text-purple-900 shadow-xs'
                : 'bg-purple-500/20 border border-purple-500/40 text-pink-300'
            }`}>
              অরিজিনাল
            </span>
          </div>

          <span className={`hidden sm:block text-[10px] sm:text-[11px] font-semibold tracking-wide mt-0.5 ${
            isLight ? 'text-purple-900' : 'text-purple-200/90'
          }`}>
            রোমাঞ্চ, শান্তি ও মানুষের জীবন কথা
          </span>
        </div>
      )}
    </div>
  );
};
