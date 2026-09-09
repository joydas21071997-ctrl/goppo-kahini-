import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Moon,
  Sparkles,
  ChevronUp,
  X
} from 'lucide-react';
import { Story } from '../types';

interface PlayerBarProps {
  currentStory: Story | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  sleepTimerRemaining: number | null; // seconds remaining
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onChangeRate: (rate: number) => void;
  onChangeVolume: (vol: number) => void;
  onOpenFullPlayer: () => void;
  onSetSleepTimer: (minutes: number | null) => void;
  onDismissPlayer?: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentStory,
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  volume,
  sleepTimerRemaining,
  onTogglePlay,
  onSeek,
  onSkipBack,
  onSkipForward,
  onChangeRate,
  onChangeVolume,
  onOpenFullPlayer,
  onSetSleepTimer,
  onDismissPlayer,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);

  if (!currentStory) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek(val);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      onChangeVolume(0);
    } else {
      onChangeVolume(prevVolume || 0.8);
    }
  };

  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
  const sleepPresets = [
    { label: 'বন্ধ', val: null },
    { label: '১৫ মিনিট', val: 15 },
    { label: '৩০ মিনিট', val: 30 },
    { label: '৪৫ মিনিট', val: 45 },
    { label: '৬০ মিনিট', val: 60 },
  ];

  return (
    <div className="fixed bottom-[52px] sm:bottom-0 left-0 right-0 z-30 border-t border-purple-900/30 bg-[#120a1c]/95 backdrop-blur-xl shadow-2xl">
      {/* Top progress scrubber line */}
      <div className="group relative w-full h-1 bg-zinc-900 cursor-pointer">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 transition-all duration-100"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={1}
          value={currentTime}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2 sm:py-3 gap-2">
        
        {/* Left: Story Info (Tap to expand full player) */}
        <div
          onClick={onOpenFullPlayer}
          className="flex items-center gap-2.5 min-w-0 flex-1 sm:max-w-xs cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-xl bg-black border border-purple-500/30">
            <img
              src={currentStory.coverImage}
              alt={currentStory.title}
              className="h-full w-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex items-end gap-0.5">
                  <div className="w-1 h-3 bg-purple-300 animate-pulse" />
                  <div className="w-1 h-4 bg-pink-400 animate-pulse delay-75" />
                  <div className="w-1 h-2 bg-purple-300 animate-pulse delay-150" />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-serif-story text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1">
              <span>{currentStory.title}</span>
              {currentStory.isLittlePassOnly && (
                <Sparkles className="h-3 w-3 text-pink-300 shrink-0" />
              )}
            </h4>
            <p className="text-[10px] sm:text-xs text-zinc-400 truncate">
              {currentStory.narrator}
            </p>
          </div>
        </div>

        {/* Center / Action: Playback Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Skip Back 15s */}
          <button
            onClick={onSkipBack}
            title="১৫ সেকেন্ড পেছনে"
            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Main Play / Pause Button */}
          <button
            id="player-toggle-btn"
            onClick={onTogglePlay}
            className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold shadow-md shadow-pink-950/60 transition-transform active:scale-95 shrink-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
            ) : (
              <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Desktop Only: Skip Forward 15s */}
          <button
            onClick={onSkipForward}
            title="১৫ সেকেন্ড সামনে"
            className="hidden sm:inline-flex p-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* Mobile Tap to Expand Chevron */}
          <button
            onClick={onOpenFullPlayer}
            className="sm:hidden p-1.5 text-zinc-400 hover:text-white"
            title="সম্পূর্ণ প্লেয়ার খুলুন"
          >
            <ChevronUp className="h-4 w-4" />
          </button>

          {/* Mobile Dismiss Player Button */}
          {onDismissPlayer && (
            <button
              onClick={onDismissPlayer}
              className="sm:hidden flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 border border-zinc-750 text-zinc-400 hover:text-rose-400 hover:border-rose-800/60 transition-all"
              title="প্লেয়ার বন্ধ করুন ও ইন্টারফেস পরিষ্কার করুন"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right (Desktop Only): Time, Speed, Sleep, Volume, Fullscreen */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Time indicator */}
          <div className="flex items-center gap-1 text-xs font-mono text-zinc-400">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Sleep Timer Button */}
          <div className="relative">
            <button
              onClick={() => setShowSleepMenu(!showSleepMenu)}
              title="স্লিপ টাইমার"
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${
                sleepTimerRemaining !== null
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              {sleepTimerRemaining !== null && (
                <span className="text-[10px] font-mono">
                  {Math.ceil(sleepTimerRemaining / 60)}m
                </span>
              )}
            </button>

            {showSleepMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-36 rounded-xl border border-purple-900/40 bg-[#160e22] p-1 shadow-xl z-50">
                <div className="px-2 py-1 text-[10px] uppercase font-bold text-zinc-400 border-b border-purple-900/30">
                  স্লিপ টাইমার
                </div>
                {sleepPresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      onSetSleepTimer(preset.val);
                      setShowSleepMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                      (preset.val === null && sleepTimerRemaining === null) ||
                      (preset.val !== null && Math.ceil((sleepTimerRemaining || 0) / 60) === preset.val)
                        ? 'bg-pink-500 text-white font-bold'
                        : 'text-zinc-300 hover:bg-[#221634]'
                    }`}
                  >
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Speed Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="rounded-lg border border-purple-900/30 px-2 py-1 text-xs font-mono font-semibold text-zinc-300 hover:bg-[#221634] hover:text-white"
            >
              {playbackRate}x
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-28 rounded-xl border border-purple-900/40 bg-[#160e22] p-1 shadow-xl z-50">
                {speeds.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      onChangeRate(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1 text-xs rounded-lg ${
                      playbackRate === rate
                        ? 'bg-pink-500 text-white font-bold'
                        : 'text-zinc-300 hover:bg-[#221634]'
                    }`}
                  >
                    {rate}x Speed
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-zinc-750 accent-pink-400 rounded cursor-pointer"
            />
          </div>

          {/* Full Screen Player Expand Button */}
          <button
            onClick={onOpenFullPlayer}
            title="ফুল স্ক্রিন প্লেয়ার"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Desktop Dismiss Player Button */}
          {onDismissPlayer && (
            <button
              onClick={onDismissPlayer}
              title="প্লেয়ার বন্ধ করুন ও ইন্টারফেস সম্পূর্ণ পরিষ্কার রাখুন"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-750 hover:border-rose-900/50 text-xs font-medium transition-all shrink-0 ml-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>বন্ধ করুন</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
