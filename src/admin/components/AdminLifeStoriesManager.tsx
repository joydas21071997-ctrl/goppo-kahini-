import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Trash2,
  Calendar,
  MapPin,
  User,
  Radio
} from 'lucide-react';
import { LifeStorySubmission } from '../../types';

interface AdminLifeStoriesManagerProps {
  submissions: LifeStorySubmission[];
  onUpdateStatus: (id: string, status: 'new' | 'contacted' | 'recorded' | 'archived') => void;
  onDeleteSubmission: (id: string) => void;
}

export const AdminLifeStoriesManager: React.FC<AdminLifeStoriesManagerProps> = ({
  submissions,
  onUpdateStatus,
  onDeleteSubmission,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'recorded' | 'archived'>('all');

  const filtered = submissions.filter((item) => {
    const matchSearch =
      item.userName.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.userPhone.includes(search) ||
      (item.city && item.city.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            ইউজারদের জমা দেওয়া বাস্তব জীবনের গল্প (মানুষের জীবন কথা)
          </h2>
          <p className="text-xs text-purple-300/80 mt-0.5">
            শ্রোতাদের বাস্তব অভিজ্ঞতার কাহিনি পর্যালোচনা ও পডকাস্ট রেকর্ডিং সমন্বয়
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'new', 'contacted', 'recorded', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
                statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/40'
              }`}
            >
              {s === 'all' ? 'সব' : s === 'new' ? 'নতুন' : s === 'contacted' ? 'যোগাযোগ হয়েছে' : s === 'recorded' ? 'রেকর্ড সম্পন্ন' : 'আর্কাইভ'}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="গল্পের বিষয়বস্তু, ব্যক্তির নাম বা শহর খুঁজুন..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const cleanPhone = item.userPhone.replace(/[^0-9]/g, '');
          const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `নমস্কার ${item.userName}, গপ্পো কাহিনী 'মানুষের জীবন কথা' বিভাগে আপনার পাঠানো সত্য গল্পটি আমরা অত্যন্ত গুরুত্বের সাথে পেয়েছি। আমরা আপনার সাথে কথা বলতে আগ্রহী।`
          )}`;

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#201037]/80 border border-purple-800/40 space-y-4 hover:border-indigo-500/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                      {item.category || 'বাস্তব সংগ্রাম'}
                    </span>
                    {item.status === 'new' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold animate-pulse">
                        নতুন বার্তা
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-purple-300 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <strong>{item.userName}</strong> ({item.age || 35} বছর)
                    </span>
                    {item.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        {item.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-purple-400 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('bn-BD') : 'সম্প্রতি'}
                    </span>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={item.status}
                    onChange={(e) => onUpdateStatus(item.id, e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-700 text-xs text-white focus:outline-none"
                  >
                    <option value="new">নতুন (New)</option>
                    <option value="contacted">যোগাযোগ হয়েছে (Contacted)</option>
                    <option value="recorded">রেকর্ড সম্পন্ন (Recorded)</option>
                    <option value="archived">আর্কাইভ (Archived)</option>
                  </select>

                  <button
                    onClick={() => {
                      if (confirm(`আপনি কি এই গল্পটি মুছে ফেলতে চান?`)) {
                        onDeleteSubmission(item.id);
                      }
                    }}
                    className="p-2 rounded-xl text-purple-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                    title="ডিলিট করুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Story Narrative Box */}
              <div className="p-4 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs sm:text-sm text-purple-200/90 leading-relaxed">
                {item.storyNarrative}
              </div>

              {/* Contact Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                <div className="flex items-center gap-4 text-purple-300">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-purple-400" />
                    {item.userPhone}
                  </span>
                  {item.userEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-purple-400" />
                      {item.userEmail}
                    </span>
                  )}
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp এ কথা বলুন</span>
                </a>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-xs text-purple-400">
            কোনো জমা দেওয়া জীবনের গল্প পাওয়া যায়নি
          </div>
        )}
      </div>
    </div>
  );
};
