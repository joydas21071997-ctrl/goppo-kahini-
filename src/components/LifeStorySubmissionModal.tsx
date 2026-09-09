import React, { useState } from 'react';
import { X, Mic, Send, Sparkles, CheckCircle2, Phone, MapPin, Briefcase, Heart, MessageSquare } from 'lucide-react';
import { LifeStorySubmission } from '../types';

interface LifeStorySubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: Omit<LifeStorySubmission, 'id' | 'submittedDate' | 'status'>) => void;
}

export const LifeStorySubmissionModal: React.FC<LifeStorySubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [profession, setProfession] = useState('');
  const [location, setLocation] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [sameAsWhatsapp, setSameAsWhatsapp] = useState(true);
  const [storyTitle, setStoryTitle] = useState('');
  const [storySummary, setStorySummary] = useState('');
  const [preferredRecordingMode, setPreferredRecordingMode] = useState<'in_person' | 'online_call' | 'phone_audio'>('phone_audio');
  
  const [validationError, setValidationError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  // Real phone validation helper
  const isRealPhoneNumber = (num: string): boolean => {
    const clean = num.replace(/\D/g, '');
    if (clean.length < 10 || clean.length > 15) return false;
    // Disallow trivial repetitive or fake sequences
    if (/^(\d)\1+$/.test(clean)) return false;
    if (clean.includes('12345678') || clean.includes('0000000')) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!fullName.trim()) {
      setValidationError('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }

    if (!isRealPhoneNumber(whatsapp)) {
      setValidationError('অনুগ্রহ করে একটি সঠিক ও আসল হোয়াটসঅ্যাপ নম্বর লিখুন (যেমন: +91 98300... বা 017...)। কোনো ভুল বা নকল নম্বর গ্রহণযোগ্য নয়।');
      return;
    }

    const finalPhone = sameAsWhatsapp ? whatsapp : phone;
    if (!isRealPhoneNumber(finalPhone)) {
      setValidationError('অনুগ্রহ করে একটি সঠিক কলিং মোবাইল নম্বর দিন যাতে আমরা আপনার সাথে যোগাযোগ করতে পারি।');
      return;
    }

    if (!storyTitle.trim()) {
      setValidationError('আপনার জীবনের গল্প বা অভিজ্ঞতার একটি সংক্ষিপ্ত শিরোনাম দিন।');
      return;
    }

    if (!storySummary.trim() || storySummary.trim().length < 20) {
      setValidationError('গল্পটির বিবরণ অন্তত ২০ অক্ষরে সংক্ষেপে লিখুন (কী ঘটেছিল বা আপনি কী বলতে চান)।');
      return;
    }

    onSubmit({
      fullName: fullName.trim(),
      age: age.trim() || 'উন্মুক্ত',
      profession: profession.trim() || 'সাধারণ নাগরিক',
      location: location.trim() || 'পশ্চিমবঙ্গ / বাংলাদেশ',
      whatsapp: whatsapp.trim(),
      phone: finalPhone.trim(),
      storyTitle: storyTitle.trim(),
      storySummary: storySummary.trim(),
      preferredRecordingMode,
    });

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-purple-500/30 bg-[#120a1c] shadow-2xl overflow-hidden my-4">
        
        {/* Top Purple & Pink Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#181024] text-zinc-400 hover:text-white transition-colors border border-purple-900/30"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
          
          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/40">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-serif-story text-xl sm:text-2xl font-bold text-white">
                আপনার জীবনের কথা জমা হয়েছে!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                ধন্যবাদ <span className="font-bold text-pink-400">{fullName}</span>! আমাদের টিম আপনার গল্পটি পর্যালোচনা করে শীঘ্রই আপনার হোয়াটসঅ্যাপ নম্বরে (<span className="font-mono text-purple-300">{whatsapp}</span>) সরাসরি যোগাযোগ করে পডকাস্ট বা অডিও রেকর্ড করার সময় চূড়ান্ত করবে।
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 px-6 py-2.5 text-xs font-bold text-white hover:opacity-95 transition-all shadow-md"
                >
                  ঠিক আছে, বন্ধ করুন
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-pink-400 border border-purple-500/40 shrink-0">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif-story text-lg sm:text-xl font-bold text-white">
                    মানুষের জীবন কথা — পডকাস্টে বলুন
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    প্রত্যেক মানুষের নিজস্ব অভিজ্ঞতা আছে। আপনার বাস্তব বা অলৌকিক স্মৃতি লাখো মানুষের কাছে তুলে ধরুন।
                  </p>
                </div>
              </div>

              {/* Informative Banner */}
              <div className="mt-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 text-xs text-zinc-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>কী ধরণের অভিজ্ঞতা বলতে পারেন?</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  জীবনের বড় লড়াই, অচেনা ভৌতিক/অলৌকিক রাত, কোনো বিশেষ ঐতিহ্যবাহী পেশার স্মৃতি, নদী-পাহাড়ের সংগ্রাম, বা এমন কোনো ঘটনা যা আপনি আজীবন মনে রেখেছেন।
                </p>
              </div>

              {validationError && (
                <div className="mt-3 rounded-xl border border-rose-500/40 bg-rose-950/40 p-2.5 text-xs text-rose-300 font-medium">
                  ⚠️ {validationError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                
                {/* 1. Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1 mb-1">
                      <span>আপনার পূর্ণ নাম *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: প্রবীর চক্রবর্তী"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1 mb-1">
                      <Briefcase className="h-3 w-3 text-amber-400" />
                      <span>পেশা ও বয়স</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="পেশা (যেমন: শিক্ষক/কৃষক)"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="বয়স (যেমন: ৪২)"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Location */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3 text-pink-400" />
                    <span>জেলা / শহর / গ্রাম</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: বিষ্ণুপুর, বাঁকুড়া অথবা ময়মনসিংহ"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                  />
                </div>

                {/* 3. Real Contact Information */}
                <div className="rounded-2xl border border-purple-900/30 bg-[#160e22] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-400 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      <span>যোগাযোগের আসল নম্বর (যাচাইযোগ্য) *</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">গোপনীয়তা রক্ষা করা হবে</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-0.5">
                      আসল হোয়াটসঅ্যাপ নম্বর (WhatsApp Number) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 অথবা 017 দিয়ে শুরু আসল নম্বর"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none font-mono"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={sameAsWhatsapp}
                      onChange={(e) => setSameAsWhatsapp(e.target.checked)}
                      className="rounded border-purple-800 text-pink-500 focus:ring-0"
                    />
                    <span className="text-[11px] text-zinc-300">
                      এই হোয়াটসঅ্যাপ নম্বরটিই আমার সাধারণ কলিং মোবাইল নম্বর
                    </span>
                  </label>

                  {!sameAsWhatsapp && (
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-0.5">
                        সরাসরি কল করার মোবাইল নম্বর *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="আপনার আসল কলিং মোবাইল নম্বর"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Story Idea */}
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                      আপনার জীবনের অভিজ্ঞতার বিষয় / শিরোনাম *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: পাহাড়ে একা রাত কাটানোর রহস্যময় অভিজ্ঞতা"
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      className="w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between mb-1">
                      <span>গল্পটির মূল বিবরণ ও ঘটনা সংক্ষেপ *</span>
                      <span className="text-[10px] text-zinc-500 font-normal">সংক্ষেপে তুলে ধরুন</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="কী ঘটেছিল, কোথায় ঘটেছিল এবং আপনার জীবনের এই অভিজ্ঞতার কী অনুভূতি ছিল তা লিখুন..."
                      value={storySummary}
                      onChange={(e) => setStorySummary(e.target.value)}
                      className="w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none leading-relaxed resize-none"
                    />
                  </div>
                </div>

                {/* 5. Preferred Recording Format */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                    কীভাবে কথা বলতে বা রেকর্ড করতে স্বাচ্ছন্দ্যবোধ করেন?
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPreferredRecordingMode('phone_audio')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        preferredRecordingMode === 'phone_audio'
                          ? 'border-pink-500 bg-pink-500/15 text-white font-bold'
                          : 'border-purple-900/30 bg-[#160e22] text-zinc-400 hover:text-white'
                      }`}
                    >
                      📞 ফোন কল
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferredRecordingMode('online_call')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        preferredRecordingMode === 'online_call'
                          ? 'border-purple-500 bg-purple-500/20 text-white font-bold'
                          : 'border-purple-900/30 bg-[#160e22] text-zinc-400 hover:text-white'
                      }`}
                    >
                      💻 গুগল মিট
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferredRecordingMode('in_person')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        preferredRecordingMode === 'in_person'
                          ? 'border-pink-500 bg-pink-500/20 text-white font-bold'
                          : 'border-purple-900/30 bg-[#160e22] text-zinc-400 hover:text-white'
                      }`}
                    >
                      🎙️ সরাসরি দেখা
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-950/40 hover:opacity-95 active:scale-[0.99] transition-all"
                >
                  <Send className="h-4 w-4" />
                  <span>আমার জীবনের গল্প জমা দিন (পডকাস্টের জন্য)</span>
                </button>

              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
