import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 2500,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Begin fade-out 500ms before completion
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(durationMs - 500, 1500));

    // Finish and unmount splash screen
    const finishTimer = setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#120a1c] px-6 select-none transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, #1f1133 0%, #160c24 55%, #10081a 100%)',
      }}
    >
      {/* Centered App Logo & Tagline Container with subtle zoom/fade entrance */}
      <div className="flex flex-col items-center text-center animate-fadeIn">
        
        {/* Existing App Logo in crisp, proportionate frame with gentle aura */}
        <div className="relative group mb-5">
          {/* Subtle Ambient Radial Aura Glow */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-purple-500/30 via-pink-500/25 to-purple-600/30 opacity-80 blur-lg" />

          {/* Precision Emblem Frame */}
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl sm:rounded-3xl p-[1.5px] bg-gradient-to-br from-purple-400 via-pink-500 to-purple-700 shadow-2xl shadow-purple-950/80">
            <div className="h-full w-full rounded-[14px] sm:rounded-[22px] overflow-hidden bg-black/90 flex items-center justify-center relative p-1">
              <img
                src="/logo.png"
                alt="গপ্পো কাহিনী লোগো"
                className="h-full w-full object-contain object-center"
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `
                      <div class="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#1a1226] to-black text-pink-400 font-serif-story font-bold text-sm">
                        গপ্পো কাহিনী
                      </div>
                    `;
                  }
                }}
              />
              {/* Subtle inner rim */}
              <div className="absolute inset-0 rounded-[14px] sm:rounded-[22px] ring-1 ring-inset ring-white/15 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* App Title (গপ্পো কাহিনী) */}
        <div className="mb-2">
          <h1 className="font-serif-story text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
            গপ্পো <span className="bg-gradient-to-r from-purple-300 via-pink-400 to-pink-300 bg-clip-text text-transparent">কাহিনী</span>
          </h1>
        </div>

        {/* Clean, Elegant Tagline as requested: "রোমাঞ্চ, শান্তি, জীবনের মানুষের কথা" */}
        <p className="font-serif-story text-sm sm:text-base text-purple-200/90 font-medium tracking-wide drop-shadow-sm max-w-xs sm:max-w-md">
          "রোমাঞ্চ, শান্তি, জীবনের মানুষের কথা"
        </p>

        {/* Subtle breathing indicator bar for visual elegance */}
        <div className="mt-6 w-16 h-0.5 rounded-full bg-gradient-to-r from-transparent via-pink-400/60 to-transparent animate-pulse" />

      </div>
    </div>
  );
};
