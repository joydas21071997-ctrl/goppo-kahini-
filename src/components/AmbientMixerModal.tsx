import React from 'react';
import { X, CloudRain, Flame, Waves, Trees, Music, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { AmbientTrack } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AmbientMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: AmbientTrack[];
  onToggleTrack: (id: string) => void;
  onChangeVolume: (id: string, volume: number) => void;
  onApplyPreset: (presetName: string) => void;
  onStopAll: () => void;
}

export const AmbientMixerModal: React.FC<AmbientMixerModalProps> = ({
  isOpen,
  onClose,
  tracks,
  onToggleTrack,
  onChangeVolume,
  onApplyPreset,
  onStopAll,
}) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain':
        return <CloudRain className="h-5 w-5" />;
      case 'Flame':
        return <Flame className="h-5 w-5" />;
      case 'Waves':
        return <Waves className="h-5 w-5" />;
      case 'Trees':
        return <Trees className="h-5 w-5" />;
      case 'Music':
        return <Music className="h-5 w-5" />;
      default:
        return <Volume2 className="h-5 w-5" />;
    }
  };

  const getTrackName = (id: string, defName: string) => {
    switch (id) {
      case 'rain': return t('soundscape_rain', 'ঝুম বৃষ্টি');
      case 'campfire': return t('soundscape_campfire', 'অগ্নিকুণ্ডের শব্দ');
      case 'ocean': return t('soundscape_ocean', 'সমুদ্রের ঢেউ');
      case 'wind': return t('soundscape_wind', 'রাতের বাতাস ও ঝিঁঝিঁ');
      case 'drone': return t('soundscape_drone', 'শান্ত সুর');
      default: return defName;
    }
  };

  const presets = [
    {
      name: t('preset_rain_hearth', 'বৃষ্টি ও আগুন'),
      desc: t('preset_rain_hearth_desc', 'ঝুম বৃষ্টি + কাঠের অগ্নিকুণ্ড'),
      applyName: 'Rainy Hearth',
    },
    {
      name: t('preset_deep_slumber', 'গভীর ঘুম'),
      desc: t('preset_deep_slumber_desc', 'মৃদু বৃষ্টি + লো-ফাই মিষ্টি সুর'),
      applyName: 'Deep Slumber',
    },
    {
      name: t('preset_midnight_coast', 'নিঝুম রাত'),
      desc: t('preset_midnight_coast_desc', 'রাতের বাতাস + সমুদ্রের ঢেউ'),
      applyName: 'Midnight Coast',
    },
    {
      name: t('preset_cabin_retreat', 'পাহাড়ি কুটির'),
      desc: t('preset_cabin_retreat_desc', 'কাঠের আগুন + বনের শব্দ'),
      applyName: 'Cabin Retreat',
    },
  ];

  const anyPlaying = tracks.some((t) => t.isPlaying);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden my-4">
        
        {/* Top Accent Ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-rose-600 via-amber-500 to-sky-500" />

        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t('soundscape_badge', 'আবহ সঙ্গীত ও সাউন্ডস্কেপ')}</span>
              </div>
              <h2 className="font-serif-story text-xl font-bold text-white mt-0.5">
                {t('ambient_mixer_heading', 'ব্যাকগ্রাউন্ড সাউন্ড মিক্সার')}
              </h2>
              <p className="text-xs text-zinc-400">
                {t('ambient_mixer_desc', 'গল্প শোনার সময় ব্যাকগ্রাউন্ডে নিজের পছন্দমতো পরিবেশ তৈরি করুন।')}
              </p>
            </div>

            {anyPlaying && (
              <button
                onClick={onStopAll}
                className="flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-850 px-2.5 py-1 text-xs text-zinc-300 hover:text-rose-400 transition-colors"
              >
                <VolumeX className="h-3.5 w-3.5" />
                <span>{t('stop_all', 'সব বন্ধ')}</span>
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.applyName}
                onClick={() => onApplyPreset(preset.applyName)}
                className="text-left rounded-xl border border-zinc-800 bg-black/60 p-2.5 hover:border-amber-500/50 hover:bg-zinc-900 transition-all group"
              >
                <div className="text-xs font-semibold text-zinc-200 group-hover:text-amber-300">
                  {preset.name}
                </div>
                <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                  {preset.desc}
                </div>
              </button>
            ))}
          </div>

          {/* Individual Ambient Track Sliders */}
          <div className="space-y-2.5">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  track.isPlaying
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-zinc-850 bg-zinc-900/40 hover:border-zinc-800'
                }`}
              >
                {/* Toggle Button */}
                <button
                  onClick={() => onToggleTrack(track.id)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                    track.isPlaying
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {getIcon(track.iconName)}
                </button>

                {/* Track Info & Slider */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-semibold truncate ${track.isPlaying ? 'text-white' : 'text-zinc-400'}`}>
                      {getTrackName(track.id, track.name)}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {track.isPlaying ? `${Math.round(track.volume * 100)}%` : t('ambient_off', 'বন্ধ')}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={track.isPlaying ? track.volume : 0}
                    disabled={!track.isPlaying}
                    onChange={(e) => onChangeVolume(track.id, parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 accent-amber-400 rounded cursor-pointer disabled:opacity-30"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={onClose}
              className="rounded-xl bg-zinc-800 px-6 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
            >
              {t('done_btn', 'ঠিক আছে')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
