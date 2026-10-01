import React, { useState } from 'react';
import {
  Mic,
  Play,
  Pause,
  MapPin,
  Briefcase,
  Clock,
  Sparkles,
  Share2,
  Users,
  Quote,
  Radio,
  Check,
  Headphones,
  Lock,
  Star,
  MessageSquare
} from 'lucide-react';
import { LifeStoryEpisode } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface LifeStoriesSectionProps {
  episodes: LifeStoryEpisode[];
  onPlayEpisode: (episode: LifeStoryEpisode) => void;
  activeEpisodeId?: string;
  isPlaying?: boolean;
  onOpenSubmissionModal: () => void;
  isSubscribed?: boolean;
  onOpenSubscriptionModal: () => void;
  onOpenReviews?: (itemId: string, itemTitle: string, itemType: 'story' | 'life_story') => void;
}

export const LifeStoriesSection: React.FC<LifeStoriesSectionProps> = ({
  episodes,
  onPlayEpisode,
  activeEpisodeId,
  isPlaying = false,
  onOpenSubmissionModal,
  isSubscribed = false,
  onOpenSubscriptionModal,
  onOpenReviews,
}) => {
  const { t, language } = useLanguage();
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tags = [
    { id: 'all', label: t('tag_all', 'সব') },
    { id: 'experience', label: language === 'bn' ? 'বাস্তব অভিজ্ঞতা' : language === 'hi' ? 'वास्तविक अनुभव' : 'Real Experience' },
    { id: 'struggle', label: language === 'bn' ? 'সংগ্রাম ও জয়' : language === 'hi' ? 'संघर्ष और विजय' : 'Struggle & Triumph' },
    { id: 'memories', label: language === 'bn' ? 'অলৌকিক স্মৃতি' : language === 'hi' ? 'अलौकिक यादें' : 'Mystical Memories' },
    { id: 'folklore', label: language === 'bn' ? 'লোকসংস্কৃতি' : language === 'hi' ? 'लोक संस्कृति' : 'Folk Culture' },
    { id: 'kolkata', label: language === 'bn' ? 'কলকাতা' : language === 'hi' ? 'कोलकाता' : 'Kolkata' },
  ];

  const filteredEpisodes = episodes.filter((ep) => {
    if (selectedTag === 'all') return true;
    const matchTag = tags.find(tItem => tItem.id === selectedTag);
    if (!matchTag) return true;
    return ep.tags.some((tagStr) => tagStr.includes(matchTag.label) || matchTag.label.includes(tagStr) || selectedTag === 'all');
  });

  const handleShare = (ep: LifeStoryEpisode) => {
    if (navigator.share) {
      navigator.share({
        title: ep.title,
        text: `${language === 'bn' ? 'গপ্পো কাহিনীতে শুনুন মানুষের জীবন কথা' : 'Listen to Life Stories on Goppo Kahini'}: ${ep.speakerName}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin} - ${ep.title}`);
      setCopiedId(ep.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} ${t('minute_abbrev', 'মিনিট')}`;
  };

  const handleEpisodePlayClick = (episode: LifeStoryEpisode) => {
    if (!isSubscribed) {
      onOpenSubscriptionModal();
      return;
    }
    onPlayEpisode(episode);
  };

  return (
    <section className="space-y-6 sm:space-y-8 animate-fadeIn text-white">
      
      {/* Hero Banner: মানুষের জীবন কথা / আমাদের কথা */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-zinc-950 to-black p-5 sm:p-8 shadow-2xl shadow-purple-950/30">
        
        {/* Ambient Glows: Light Purple & Pink on Soft Black */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-1 text-xs font-bold text-purple-300">
              <Radio className="h-3.5 w-3.5 animate-pulse text-pink-400" />
              <span>{t('life_stories_badge', 'আমাদের কথা • বিশেষ পডকাস্ট সিরিজ')}</span>
            </div>

            <h1 className="font-serif-story text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              {t('life_stories_title', 'মানুষের জীবন কথা')}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              {t('life_stories_hero_desc', 'প্রত্যেক সাধারণ মানুষের ভেতরেই লুকিয়ে থাকে এক অসাধারণ লড়াই ও জীবনের গল্প। বাংলার বিভিন্ন প্রান্তের সাধারণ মানুষের সত্য জীবনের না-বলা প্রামাণ্য অডিও পডকাস্ট।')}
            </p>

            {/* Access Status Badge */}
            <div className="inline-flex items-center gap-2 pt-1">
              {isSubscribed ? (
                <span className="flex items-center gap-1.5 rounded-xl bg-pink-500/20 border border-pink-500/40 px-3 py-1 text-xs font-bold text-pink-300">
                  <Check className="h-3.5 w-3.5 text-pink-400" />
                  <span>{t('life_stories_active_pass', 'আপনার অল-অ্যাক্সেস পাস সক্রিয় (সব পর্ব আনলকড)')}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenSubscriptionModal}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 px-3 py-1 text-xs font-bold text-purple-200 transition-colors"
                >
                  <Lock className="h-3.5 w-3.5 text-pink-400" />
                  <span>{t('life_stories_pass_req', 'জীবন কথা পডকাস্ট শুনতে পাস প্রয়োজন • আনলক করুন')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Call to Action Button to Share Life Story */}
          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenSubmissionModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-purple-950/40 hover:scale-105 active:scale-95 transition-all"
            >
              <Mic className="h-4 w-4" />
              <span>{t('tell_your_story', 'আপনার জীবনের গল্প বলুন (পডকাস্ট)')}</span>
            </button>
            <p className="text-[10px] text-zinc-400 text-center sm:text-right mt-1.5">
              {t('be_our_guest', '💡 আপনিও হতে পারেন আমাদের পরবর্তী পডকাস্টের অতিথি')}
            </p>
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="relative z-10 mt-6 grid grid-cols-3 gap-2 pt-4 border-t border-purple-900/30 text-center">
          <div>
            <div className="text-sm sm:text-base font-bold text-purple-300 font-mono">6+ {language === 'bn' ? 'পর্ব' : language === 'hi' ? 'एपिसोड' : 'Episodes'}</div>
            <div className="text-[10px] text-zinc-400">{language === 'bn' ? 'সত্য জীবনের পডকাস্ট' : language === 'hi' ? 'सच्ची कहानियों का पॉडकास्ट' : 'True Life Podcasts'}</div>
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-pink-300 font-mono">100% {language === 'bn' ? 'বাস্তব' : language === 'hi' ? 'वास्तविक' : 'Real'}</div>
            <div className="text-[10px] text-zinc-400">{language === 'bn' ? 'সাধারণ মানুষের কণ্ঠস্বর' : language === 'hi' ? 'आम लोगों की आवाज़' : 'Real Voices'}</div>
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-purple-200 font-mono">{t('pass_badge', '₹২০ পাস')}</div>
            <div className="text-[10px] text-zinc-400">{language === 'bn' ? 'আনলিমিটেড অ্যাক্সেস' : language === 'hi' ? 'असीमित एक्सेस' : 'Unlimited Access'}</div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {tags.map((tagItem) => (
          <button
            key={tagItem.id}
            onClick={() => setSelectedTag(tagItem.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              selectedTag === tagItem.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md font-bold'
                : 'bg-[#181124] text-zinc-400 border border-purple-900/30 hover:text-white hover:border-pink-500/40'
            }`}
          >
            {tagItem.label}
          </button>
        ))}
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredEpisodes.map((episode) => {
          const isCurrentActive = activeEpisodeId === episode.id;

          return (
            <div
              key={episode.id}
              className={`group relative rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                isCurrentActive
                  ? 'border-pink-400/80 bg-[#171022] shadow-xl shadow-pink-950/30 ring-1 ring-pink-400/40'
                  : 'border-purple-900/40 bg-[#120a1c]/90 hover:border-pink-400/40 hover:bg-[#191024]'
              }`}
            >
              <div className="p-4 sm:p-5 space-y-3.5">
                
                {/* Speaker & Location Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-2xl overflow-hidden border border-purple-500/30 shadow-md">
                      <img
                        src={episode.coverImage}
                        alt={episode.speakerName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {episode.featured && (
                        <span className="absolute top-1 left-1 rounded-md bg-pink-500 px-1 py-0.2 text-[8px] font-bold text-white">
                          {t('featured_badge', 'জনপ্রিয়')}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm sm:text-base truncate group-hover:text-pink-300 transition-colors">
                        {episode.speakerName} ({episode.speakerAge})
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-pink-300 mt-0.5 truncate">
                        <Briefcase className="h-3 w-3 shrink-0" />
                        <span className="truncate">{episode.speakerProfession}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5 truncate">
                        <MapPin className="h-3 w-3 shrink-0 text-purple-400" />
                        <span className="truncate">{episode.speakerLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Action & Share */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleShare(episode)}
                      className="p-2 rounded-xl bg-[#1d132b] border border-purple-900/30 text-zinc-400 hover:text-white transition-colors"
                      title={t('share_label', 'শেয়ার করুন')}
                    >
                      {copiedId === episode.id ? (
                        <Check className="h-3.5 w-3.5 text-pink-400" />
                      ) : (
                        <Share2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Episode Title & Summary */}
                <div>
                  <h4 className="font-serif-story text-base sm:text-lg font-bold text-zinc-100 leading-snug">
                    {episode.title}
                  </h4>
                  <p className="text-xs text-zinc-300/90 leading-relaxed mt-1.5 line-clamp-3 font-sans">
                    {episode.summary}
                  </p>
                </div>

                {/* Quote Box */}
                <div className="relative rounded-2xl bg-black/60 border border-purple-500/20 p-3 pl-8 text-xs text-purple-200/90 italic font-serif-story">
                  <Quote className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-purple-400" />
                  {episode.keyQuote}
                </div>

                {/* Tag pills and Rating Button */}
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <div className="flex flex-wrap gap-1.5">
                    {episode.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* 5-Star Rating & Comments Button */}
                  <button
                    type="button"
                    onClick={() => onOpenReviews?.(episode.id, episode.title, 'life_story')}
                    className="flex items-center gap-1.5 bg-black/60 hover:bg-purple-950/40 border border-purple-500/30 hover:border-pink-400 px-2.5 py-1 rounded-xl text-xs transition-colors"
                    title={t('rating_reviews_title', 'রেটিং ও মন্তব্য দেখুন বা লিখুন')}
                  >
                    <Star className="h-3 w-3 fill-pink-400 text-pink-400" />
                    <span className="text-[11px] font-bold text-pink-300 font-mono">{language === 'bn' ? '৫.০' : '5.0'}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-[10px] text-pink-300 flex items-center gap-1">
                      <MessageSquare className="h-2.5 w-2.5" />
                      {t('reviews_tab', 'মন্তব্য')}
                    </span>
                  </button>
                </div>

              </div>

              {/* Bottom Play Action Bar with ₹20 Pass Lock Enforcement */}
              <div className="border-t border-purple-900/30 bg-[#160e22]/70 px-4 py-3 sm:px-5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3.5 w-3.5 text-purple-400" />
                    {formatDuration(episode.duration)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Headphones className="h-3.5 w-3.5 text-pink-400" />
                    {episode.listenCount.toLocaleString(language === 'bn' ? 'bn-BD' : language === 'hi' ? 'hi-IN' : 'en-US')} {t('listened_times_count', 'বার')}
                  </span>
                </div>

                {isSubscribed ? (
                  <button
                    onClick={() => handleEpisodePlayClick(episode)}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
                      isCurrentActive && isPlaying
                        ? 'bg-purple-500 text-white hover:bg-purple-400'
                        : 'bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 text-white hover:opacity-95 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isCurrentActive && isPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5 fill-white" />
                        <span>{t('btn_pause', 'পজ করুন')}</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-white" />
                        <span>{t('btn_listen_podcast', 'পডকাস্ট শুনুন')}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={onOpenSubscriptionModal}
                    className="flex items-center gap-1.5 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 px-4 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
                    title={t('life_story_pass_required', 'জীবন কথা শুনতে ২০ টাকার পাস প্রয়োজন')}
                  >
                    <Lock className="h-3.5 w-3.5 text-pink-400" />
                    <span>{t('pass_listen_btn', '₹২০ পাস নিয়ে শুনুন')}</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Community Invite Footer */}
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-[#130b1e] to-black p-5 sm:p-6 text-center space-y-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-pink-300 border border-purple-500/30">
          <Users className="h-5 w-5 text-pink-400" />
        </div>
        <h3 className="font-serif-story text-lg font-bold text-white">
          {t('community_invite_title', 'আপনার চেনা কোনো সাধারণ মানুষের কি কোনো অসাধারণ স্মৃতি আছে?')}
        </h3>
        <p className="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
          {t('community_invite_desc', 'আপনার প্রতিবেশী, কোনো প্রবীণ মানুষ বা আপনার নিজের জীবনের সত্য গল্প আমাদের সাথে শেয়ার করুন। আমরা সরাসরি ফোনে বা অনলাইনে রেকর্ডিংয়ের ব্যবস্থা করব।')}
        </p>
        <button
          onClick={onOpenSubmissionModal}
          className="rounded-2xl border border-purple-500/40 bg-purple-500/15 px-5 py-2 text-xs font-bold text-purple-200 hover:bg-purple-500/25 transition-all"
        >
          {t('community_invite_btn', '🎙️ গল্প জানাতে এখানে ক্লিক করুন')}
        </button>
      </div>

    </section>
  );
};
