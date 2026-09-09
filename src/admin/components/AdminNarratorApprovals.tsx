import React, { useState } from 'react';
import {
  Mic,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Pause,
  KeyRound,
  Copy,
  Check,
  Trash2,
  Mail,
  Phone,
  Radio,
  Sparkles
} from 'lucide-react';
import { NarratorApplication } from '../../types';

interface AdminNarratorApprovalsProps {
  narratorApplications: NarratorApplication[];
  onApproveNarrator: (appId: string, approvalCode: string) => void;
  onRejectNarrator: (appId: string) => void;
  onDeleteNarratorApp: (appId: string) => void;
}

export const AdminNarratorApprovals: React.FC<AdminNarratorApprovalsProps> = ({
  narratorApplications,
  onApproveNarrator,
  onRejectNarrator,
  onDeleteNarratorApp,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  const filteredApps = narratorApplications.filter((app) => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const generateApprovalCode = (name: string) => {
    const prefix = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'NRT');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `GOPPO-${prefix}-${randomDigits}`;
  };

  const handleApprove = (app: NarratorApplication) => {
    const code = app.approvalCode || generateApprovalCode(app.fullName);
    onApproveNarrator(app.id, code);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const toggleAudio = (id: string, url?: string) => {
    if (!url) return;

    if (playingAudioId === id) {
      audioElements[id]?.pause();
      setPlayingAudioId(null);
    } else {
      // Pause any currently playing
      if (playingAudioId && audioElements[playingAudioId]) {
        audioElements[playingAudioId].pause();
      }

      let audio = audioElements[id];
      if (!audio) {
        audio = new Audio(url);
        audio.onended = () => setPlayingAudioId(null);
        setAudioElements((prev) => ({ ...prev, [id]: audio }));
      }
      audio.play();
      setPlayingAudioId(id);
    }
  };

  return (
    <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-pink-400" />
            কথক ও কণ্ঠশিল্পী অডিশন পর্যালোচনা
          </h2>
          <p className="text-xs text-purple-300/80 mt-0.5">
            নতুন ভয়েস আর্টিস্টদের অডিও স্যাম্পল যাচাই করে গপ্পো কাহিনীতে নিয়োগ দিন
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
              filter === 'pending' ? 'bg-amber-600 text-white' : 'bg-purple-950/60 text-purple-300'
            }`}
          >
            অপেক্ষমাণ ({narratorApplications.filter((a) => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
              filter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-purple-950/60 text-purple-300'
            }`}
          >
            অনুমোদিত ({narratorApplications.filter((a) => a.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
              filter === 'all' ? 'bg-purple-600 text-white' : 'bg-purple-950/60 text-purple-300'
            }`}
          >
            সব ({narratorApplications.length})
          </button>
        </div>
      </div>

      {/* Applications Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="p-4 rounded-2xl bg-[#201037]/80 border border-purple-800/40 space-y-3.5 flex flex-col justify-between"
          >
            <div>
              {/* Header inside card */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{app.name}</h3>
                  <div className="text-[11px] text-purple-300 flex items-center gap-2 mt-0.5">
                    <span>{app.city || 'কলকাতা'}</span>
                    <span>•</span>
                    <span>অভিজ্ঞতা: {app.experienceYears || 0} বছর</span>
                  </div>
                </div>

                {app.status === 'approved' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    অনুমোদিত
                  </span>
                ) : app.status === 'rejected' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                    বাতিল
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    অপেক্ষমাণ
                  </span>
                )}
              </div>

              {/* Bio & Genres */}
              <p className="text-xs text-purple-200/90 line-clamp-2 mt-2 leading-relaxed">
                {app.bio || 'গল্প বলার প্রতি দারুণ ভালোবাসা ও স্পষ্ট উচ্চারণ রয়েছে...'}
              </p>

              {app.preferredGenres && app.preferredGenres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {app.preferredGenres.map((g) => (
                    <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Contact Info */}
              <div className="mt-3 pt-3 border-t border-purple-900/40 grid grid-cols-2 gap-2 text-[11px] text-purple-300">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">{app.email}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{app.phone}</span>
                </div>
              </div>

              {/* Sample Audio */}
              {app.sampleAudioUrl && (
                <div className="mt-3 p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-between">
                  <span className="text-xs text-purple-200 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-pink-400" /> অডিও স্যাম্পল
                  </span>
                  <button
                    onClick={() => toggleAudio(app.id, app.sampleAudioUrl)}
                    className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {playingAudioId === app.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{playingAudioId === app.id ? 'থামুন' : 'শুনুন'}</span>
                  </button>
                </div>
              )}

              {/* Approval Code Display */}
              {app.approvalCode && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-emerald-400 font-semibold">কথক সিক্রেট লগইন কোড</div>
                    <div className="text-xs font-mono font-bold text-white">{app.approvalCode}</div>
                  </div>
                  <button
                    onClick={() => copyCode(app.approvalCode!, app.id)}
                    className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer"
                    title="কোড কপি করুন"
                  >
                    {copiedCodeId === app.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-purple-900/40 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  if (confirm(`আপনি কি এই আবেদনটি ডিলিট করতে চান?`)) {
                    onDeleteNarratorApp(app.id);
                  }
                }}
                className="p-1.5 rounded-lg text-purple-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                title="আবেদন ডিলিট করুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {app.status !== 'rejected' && (
                  <button
                    onClick={() => onRejectNarrator(app.id)}
                    className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-semibold cursor-pointer"
                  >
                    প্রত্যাখ্যান
                  </button>
                )}
                {app.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(app)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>অনুমোদন করুন</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredApps.length === 0 && (
          <div className="col-span-full text-center py-10 text-xs text-purple-400">
            কোনো কথক আবেদন পাওয়া যায়নি
          </div>
        )}
      </div>
    </div>
  );
};
