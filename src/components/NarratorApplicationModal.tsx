import React, { useState } from 'react';
import {
  X,
  Mic,
  Sparkles,
  Upload,
  CheckCircle2,
  FileAudio,
  Radio,
  Headphones,
  Send,
  AlertCircle
} from 'lucide-react';
import { NarratorApplication, StoryGenre } from '../types';

interface NarratorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplication: (app: Omit<NarratorApplication, 'id' | 'appliedDate' | 'status'>) => void;
}

const AVAILABLE_GENRES: StoryGenre[] = [
  'ভৌতিক ও অলৌকিক',
  'রহস্য ও গোয়েন্দা',
  'রোমাঞ্চ ও থ্রিলার',
  'ঘুমের গল্প ও প্রশান্তি',
  'কাল্পনিক ও মায়াবী',
  'ঐতিহাসিক ও লোকগাথা',
  'বাস্তব ও রূপকথা'
];

export const NarratorApplicationModal: React.FC<NarratorApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmitApplication,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['ভৌতিক ও অলৌকিক']);
  const [recordingEquipment, setRecordingEquipment] = useState('কন্ডেনসার মাইক ও শান্ত পরিবেশ');
  const [sampleAudioNameOrUrl, setSampleAudioNameOrUrl] = useState('');
  const [experienceBio, setExperienceBio] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('অনুগ্রহ করে নাম, ইমেইল ও ফোন নম্বর পূরণ করুন।');
      return;
    }

    if (!sampleAudioNameOrUrl.trim()) {
      setError('অনুগ্রহ করে একটি অডিও স্যাম্পল ফাইল আপলোড করুন অথবা ড্রাইভ লিংক দিন।');
      return;
    }

    setError('');
    onSubmitApplication({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim() || 'কলকাতা / ঢাকা',
      preferredGenres: selectedGenres,
      sampleAudioNameOrUrl: sampleAudioNameOrUrl.trim(),
      recordingEquipment: recordingEquipment.trim(),
      experienceBio: experienceBio.trim() || 'গল্প বলার প্রতি গভীর আগ্রহ রয়েছে।',
    });

    setSubmitted(true);
  };

  const handleAudioUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSampleAudioNameOrUrl(file.name);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl border border-purple-500/30 bg-[#120a1c] shadow-2xl overflow-hidden my-4">
        
        {/* Top Accent Strip */}
        <div className="h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-purple-900/30"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-7">
          {submitted ? (
            <div className="py-8 text-center space-y-4 animate-fadeIn">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/40">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h3 className="font-serif-story text-xl sm:text-2xl font-bold text-white">
                আবেদন সফলভাবে গৃহীত হয়েছে!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                ধন্যবাদ <span className="text-pink-300 font-bold">{fullName}</span>! আপনার ভয়েস স্যাম্পল ও অডিশন আমাদের প্রতিষ্ঠাতা ও সাউন্ড ডিরেক্টর <span className="text-purple-300 font-bold">জয় (Joy)</span>-এর পর্যালোচনার জন্য জমা পড়েছে।
              </p>
              <div className="rounded-2xl border border-purple-900/40 bg-purple-950/30 p-4 text-left text-xs text-zinc-400 space-y-2 max-w-md mx-auto">
                <p className="font-semibold text-pink-300 flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-pink-400" />
                  <span>পরবর্তী ধাপ:</span>
                </p>
                <p>
                  ১. জয় আপনার অডিও স্যাম্পলটি শুনে ভয়েস কোয়ালিটি ও উচ্চারণ মূল্যায়ন করবেন।
                </p>
                <p>
                  ২. জয় অনুমোদন (Approve) করলে আপনার ইমেইল (<span className="text-white">{email}</span>)-এ একটি <span className="text-pink-300 font-semibold">সিক্রেট স্টুডিও অ্যাক্সেস কোড</span> পাঠানো হবে।
                </p>
                <p>
                  ৩. সেই কোড দিয়ে লগইন করে আপনি সরাসরি গপ্পো কাহিনীতে গল্প আপলোড করার অ্যাক্সেস পাবেন।
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:scale-105 transition-all"
              >
                ঠিক আছে, বুঝেছি
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start gap-3 border-b border-purple-900/30 pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/15 text-pink-400 border border-purple-500/30 shrink-0">
                  <Mic className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>ভয়েস আর্টিস্ট ও কথক রিক্রুটমেন্ট</span>
                  </span>
                  <h2 className="font-serif-story text-lg sm:text-xl font-bold text-white mt-0.5">
                    গপ্পো কাহিনীতে কথক হিসেবে যোগ দিন
                  </h2>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    আপনার কণ্ঠে গল্প জীবন্ত করে তুলুন। আবেদনের পর জয় (প্রতিষ্ঠাতা) অনুমোদন করলেই আপনি গল্প আপলোডের সুযোগ পাবেন।
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-3 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Application Form */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300">
                      আপনার পুরো নাম <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: অনিন্দিতা চক্রবর্তী"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300">
                      ফোন / হোয়াটসঅ্যাপ নম্বর <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98300 XXXXX / +880 1711 XXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300">
                      ইমেইল ঠিকানা <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300">
                      শহর / জেলা
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: কলকাতা, হাওড়া, ঢাকা, ইত্যাদি"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Preferred Genres */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300">
                    কোন ধারার গল্প বলতে আপনি পারদর্শী? (একাধিক নির্বাচন করতে পারেন)
                  </label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {AVAILABLE_GENRES.map((g) => {
                      const isSelected = selectedGenres.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleGenre(g)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                            isSelected
                              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
                              : 'bg-zinc-900 text-zinc-400 border border-purple-900/30 hover:text-white'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Voice Sample Audio Upload or Link */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
                    <span>আপনার কণ্ঠের নমুনা / অডিও স্যাম্পল <span className="text-rose-400">*</span></span>
                    <span className="text-[10px] text-zinc-400 font-normal">MP3, WAV বা ড্রাইভ লিংক</span>
                  </label>

                  <div className="mt-1.5 flex flex-col sm:flex-row items-center gap-2">
                    <label className="w-full sm:w-auto flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-dashed border-pink-500/50 bg-pink-950/20 px-4 py-2.5 text-xs text-pink-300 hover:bg-pink-950/40 transition-colors">
                      <FileAudio className="h-4 w-4" />
                      <span>{sampleAudioNameOrUrl ? sampleAudioNameOrUrl : 'অডিও ফাইল আপলোড করুন'}</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUploadSim}
                        className="hidden"
                      />
                    </label>

                    <span className="text-[10px] text-zinc-500">অথবা</span>

                    <input
                      type="text"
                      placeholder="Google Drive / YouTube লিঙ্ক পেস্ট করুন"
                      value={sampleAudioNameOrUrl}
                      onChange={(e) => setSampleAudioNameOrUrl(e.target.value)}
                      className="w-full sm:flex-1 rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Recording Gear */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300">
                    রেকর্ডিং সেটআপ ও মাইক্রোফোন
                  </label>
                  <select
                    value={recordingEquipment}
                    onChange={(e) => setRecordingEquipment(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-purple-900/30 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-pink-400 focus:outline-none"
                  >
                    <option value="কন্ডেনসার মাইক ও শান্ত পরিবেশ">কন্ডেনসার স্টুডিও মাইক (Condenser Mic) ও অ্যাকোস্টিক রুম</option>
                    <option value="USB পডকাস্ট মাইক">USB পডকাস্ট মাইক (Rode / Blue Yeti / Fifine)</option>
                    <option value="ল্যাপটপ / মোবাইল ইয়ারফোন">স্মার্টফোন বা হেডফোন মাইক (নয়েজলেস পরিবেশে)</option>
                    <option value="অন্যান্য পেশাদার সেটআপ">অন্যান্য পেশাদার সাউন্ড স্টুডিও সেটআপ</option>
                  </select>
                </div>

                {/* Bio / Experience */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300">
                    সংক্ষিপ্ত অভিজ্ঞতা বা নিজের সম্পর্কে দুই লাইন
                  </label>
                  <textarea
                    rows={2}
                    placeholder="পূর্বে রেডিও, নাটক বা ইউটিউবে অডিও স্টোরির অভিজ্ঞতা থাকলে লিখুন..."
                    value={experienceBio}
                    onChange={(e) => setExperienceBio(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none resize-none"
                  />
                </div>

                {/* Notice Box */}
                <div className="rounded-xl border border-purple-900/30 bg-[#160e22] p-3 text-[11px] text-zinc-400">
                  🔒 <strong className="text-zinc-200">নিরাপত্তা নিশ্চয়তা:</strong> আপলোড স্টুডিও সম্পূর্ণভাবে অ্যাডমিন-নিয়ন্ত্রিত। জয় আপনার অডিওটি শুনে অনুমোদন করার পরেই আপনাকে স্টুডিও অ্যাক্সেস কোড দেওয়া হবে।
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-900/30">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:scale-105 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>আবেদন জমা দিন</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
