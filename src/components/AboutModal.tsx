import React, { useState, useEffect } from 'react';
import {
  X,
  Youtube,
  ShieldCheck,
  Heart,
  CheckCircle2,
  Sparkles,
  Send,
  MessageSquare,
  User,
  Mail,
  Phone,
  HelpCircle,
  Camera,
  Users,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { GoppoKahiniLogo } from './GoppoKahiniLogo';
import { UserContactMessage, AboutMissionData, TeamMember } from '../types';
import { INITIAL_ABOUT_MISSION_DATA } from '../data/aboutMission';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenNarratorApplication?: () => void;
  aboutData?: AboutMissionData;
  isAdmin?: boolean;
  onOpenAdminTeamEdit?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenSubscriptionModal,
  aboutData: propAboutData,
  isAdmin = false,
  onOpenAdminTeamEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'contact'>('about');

  // Load latest about data from props or localStorage
  const [aboutData, setAboutData] = useState<AboutMissionData>(() => {
    if (propAboutData) return propAboutData;
    try {
      const saved = localStorage.getItem('goppo_about_mission_data');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ABOUT_MISSION_DATA;
  });

  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem('goppo_about_mission_data');
        if (saved) setAboutData(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('goppo_about_mission_updated', handleStorageUpdate);
    return () => window.removeEventListener('goppo_about_mission_updated', handleStorageUpdate);
  }, []);

  // Contact form state
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [category, setCategory] = useState<UserContactMessage['category']>('general_feedback');
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !messageText.trim()) return;

    setIsSubmitting(true);

    const newMessage: UserContactMessage = {
      id: `msg-${Date.now()}`,
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim(),
      senderPhone: senderPhone.trim() || undefined,
      category,
      message: messageText.trim(),
      timestamp: `${new Date().toLocaleDateString('bn-BD')} ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'unread',
    };

    try {
      const stored = localStorage.getItem('goppo_contact_messages');
      const messages: UserContactMessage[] = stored ? JSON.parse(stored) : [];
      messages.unshift(newMessage);
      localStorage.setItem('goppo_contact_messages', JSON.stringify(messages));
      window.dispatchEvent(new Event('goppo_contact_messages_updated'));
    } catch (err) {
      console.error('Error saving contact message:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSenderName('');
      setSenderEmail('');
      setSenderPhone('');
      setMessageText('');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl border border-purple-500/30 bg-zinc-950 shadow-2xl shadow-purple-950/40 overflow-hidden my-4 text-white">
        
        {/* Top Palette Accent Bar: Light Purple & Light Green on Black */}
        <div className="h-1.5 bg-gradient-to-r from-purple-400 via-emerald-400 to-green-300" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
          title="বন্ধ করুন"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-7 max-h-[85vh] overflow-y-auto space-y-6">
          
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center">
            <GoppoKahiniLogo size="md" showSubtitle={true} />
            <p className="mt-3 text-xs sm:text-sm text-purple-200/90 max-w-lg leading-relaxed">
              {aboutData.missionTitle} — বাংলার ঐতিহ্যবাহী অডিও কাহিনী, রোমাঞ্চ ও মানুষের সত্য জীবন কথা।
            </p>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex rounded-2xl bg-zinc-900/90 p-1 border border-zinc-850">
            <button
              onClick={() => { setActiveTab('about'); setSubmitSuccess(false); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'about'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5 text-green-300" />
              <span>আমাদের উদ্দেশ্য ও টিম ({aboutData.teamMembers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'contact'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-green-300" />
              <span>সরাসরি যোগাযোগ ও মতামত</span>
            </button>
          </div>

          {activeTab === 'about' ? (
            <div className="space-y-6">
              
              {/* Mission Statement Box */}
              <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/20 via-zinc-900 to-black p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-300 text-[11px] font-bold">
                    <Sparkles className="h-3 w-3" />
                    <span>আমাদের লক্ষ্য ও দৃষ্টিভঙ্গি</span>
                  </div>

                  {isAdmin && onOpenAdminTeamEdit && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAdminTeamEdit();
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-purple-300 hover:text-white bg-purple-500/20 border border-purple-500/30 rounded-lg px-2.5 py-1 transition-all"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>অ্যাডমিন প্যানেলে এডিট করুন</span>
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                  {aboutData.missionStatement}
                </p>
              </div>

              {/* YouTube Audience Appreciation Note */}
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 to-zinc-900 p-4 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 shrink-0 text-purple-300">
                  <Youtube className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>আমাদের ইউটিউব শ্রোতাদের জন্য বিশেষ বার্তা</span>
                    <Heart className="h-3.5 w-3.5 fill-green-400 text-green-400" />
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {aboutData.youtubeAudienceNote}
                  </p>
                </div>
              </div>

              {/* Team Members & Partners Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-400" />
                    <span>আমাদের দল ও প্রতিষ্ঠাতা পরিষদ</span>
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    {aboutData.teamMembers.length} জন সদস্য যুক্ত আছেন
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aboutData.teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-zinc-900 to-zinc-950 p-5 space-y-3.5 flex flex-col justify-between hover:border-green-400/40 transition-all shadow-lg"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden border-2 border-green-400/40 shadow-md bg-zinc-900 flex items-center justify-center">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-purple-900 via-zinc-900 to-black flex flex-col items-center justify-center text-purple-200">
                              <span className="font-serif text-xl font-bold">{member.name.slice(0, 1)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-base font-bold text-white font-serif truncate">
                              {member.name}
                            </h4>
                            {member.isFounder && (
                              <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[9px] font-bold text-purple-300">
                                প্রতিষ্ঠাতা
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-green-300 font-medium mt-0.5">
                            {member.role}
                          </p>
                          {member.joinedDate && (
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              যুক্ত হয়েছেন: {member.joinedDate}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed font-sans line-clamp-4">
                        &quot;{member.bio}&quot;
                      </p>

                      {member.contactEmail && (
                        <div className="pt-2 border-t border-zinc-850 text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                          <Mail className="h-3 w-3 text-purple-400" />
                          <span className="truncate">{member.contactEmail}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Commitments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {aboutData.keyCommitments.map((commit, cIdx) => (
                  <div key={cIdx} className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                    <span className="text-xs text-zinc-300">{commit}</span>
                  </div>
                ))}
              </div>

              {/* Action row to jump to contact */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className="text-xs text-green-300 hover:text-green-200 flex items-center gap-1.5 underline"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>কোনো পরামর্শ বা বক্তব্য আছে? সরাসরি লিখুন</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenSubscriptionModal();
                  }}
                  className="w-full sm:w-auto rounded-full bg-gradient-to-r from-purple-500 via-emerald-400 to-green-400 px-5 py-2 text-xs font-bold text-black hover:opacity-95 transition-all shadow-md"
                >
                  মাত্র ₹২০-তে পাস নিন
                </button>
              </div>
            </div>
          ) : (
            /* Contact Us Form */
            <div className="space-y-4">
              <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-400" />
                  <span>সরাসরি টিম ও জয়-এর সাথে যোগাযোগ</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  আপনার যেকোনো অনুভূতি, পরামর্শ বা কাহিনীর অনুরোধ সরাসরি লিখুন। এটি সরাসরি অ্যাডমিন প্যানেলে জমা হবে।
                </p>
              </div>

              {submitSuccess ? (
                <div className="rounded-3xl border border-green-500/40 bg-green-950/40 p-6 text-center space-y-3 animate-fadeIn">
                  <div className="h-12 w-12 rounded-full bg-green-500/20 text-green-400 border border-green-500/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">আপনার বার্তা সফলভাবে পৌঁছেছে!</h4>
                  <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                    ধন্যবাদ! আপনার বার্তা সরাসরি অ্যাডমিন ইনবক্সে যুক্ত হয়েছে। জয় ও টিম আপনার মেসেজটি পড়ে শীঘ্রই যোগাযোগ করবেন।
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="rounded-full bg-green-500 px-4 py-1.5 text-xs font-bold text-black"
                  >
                    আরেকটি বার্তা পাঠান
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-300">আপনার নাম *</label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="text"
                          required
                          placeholder="আপনার সম্পূর্ণ নাম"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2 pl-9 pr-3 text-xs text-white focus:border-purple-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-300">ইমেইল ঠিকানা *</label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="email"
                          required
                          placeholder="your.email@example.com"
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2 pl-9 pr-3 text-xs text-white focus:border-purple-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300">বার্তা বা মন্তব্য *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="আপনার মনের কথা বিস্তারিতভাবে লিখুন..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-zinc-800 bg-black/60 p-3 text-xs text-white focus:border-purple-400 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-emerald-400 to-green-400 py-2.5 text-xs font-bold text-black shadow-md hover:opacity-95 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmitting ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
