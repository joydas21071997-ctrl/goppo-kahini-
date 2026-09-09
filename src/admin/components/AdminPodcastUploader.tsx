import React, { useState } from 'react';
import {
  Radio,
  Upload,
  Sparkles,
  CheckCircle2,
  FileAudio,
  ImageIcon,
  Play,
  Pause,
  Clock,
  MapPin,
  Briefcase,
  User,
  Quote,
  Info,
  Lock,
  ShieldCheck,
  Ticket
} from 'lucide-react';
import { LifeStoryEpisode } from '../../types';
import { uploadAudioToFirebaseStorage, uploadCoverToFirebaseStorage } from '../../services/firebaseStorage';

interface AdminPodcastUploaderProps {
  episodes?: LifeStoryEpisode[];
  onAddEpisode?: (newEpisode: LifeStoryEpisode) => void;
}

export const AdminPodcastUploader: React.FC<AdminPodcastUploaderProps> = ({
  episodes = [],
  onAddEpisode,
}) => {
  const [podcastTitle, setPodcastTitle] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerAge, setSpeakerAge] = useState<number>(42);
  const [speakerLocation, setSpeakerLocation] = useState('কলকাতা, পশ্চিমবঙ্গ');
  const [speakerProfession, setSpeakerProfession] = useState('শিক্ষক ও সমাজকর্মী');
  const [keyQuote, setKeyQuote] = useState('');
  const [podcastSummary, setPodcastSummary] = useState('');

  const [podcastAudioFile, setPodcastAudioFile] = useState<File | null>(null);
  const [podcastAudioName, setPodcastAudioName] = useState('');
  const [podcastAudioUrl, setPodcastAudioUrl] = useState('');
  const [podcastDurationSec, setPodcastDurationSec] = useState<number>(0);

  const [podcastCoverImage, setPodcastCoverImage] = useState(
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'
  );
  const [podcastPublishSuccess, setPodcastPublishSuccess] = useState(false);
  const [isPodcastAudioUploading, setIsPodcastAudioUploading] = useState(false);
  const [podcastAudioUploadProgress, setPodcastAudioUploadProgress] = useState(0);
  const [isPodcastFirebaseStored, setIsPodcastFirebaseStored] = useState(false);
  const [podcastUploadStatusMessage, setPodcastUploadStatusMessage] = useState('');

  const handlePodcastAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPodcastAudioFile(file);
    setPodcastAudioName(file.name);
    setPodcastAudioUrl(objectUrl);
    setIsPodcastAudioUploading(true);
    setPodcastAudioUploadProgress(0);
    setPodcastUploadStatusMessage('Firebase Storage-এ আপলোড শুরু হচ্ছে...');
    setIsPodcastFirebaseStored(false);

    const tempAudio = new Audio(objectUrl);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setPodcastDurationSec(Math.round(tempAudio.duration));
      }
    };

    try {
      const result = await uploadAudioToFirebaseStorage(file, (info) => {
        setPodcastAudioUploadProgress(info.progress);
        if (info.status === 'uploading') {
          setPodcastUploadStatusMessage(`Firebase Storage-এ পডকাস্ট আপলোড হচ্ছে (${info.progress}%)...`);
        } else if (info.status === 'completed') {
          setPodcastUploadStatusMessage('Firebase Storage-এ সফলভাবে সংরক্ষিত হয়েছে!');
        }
      });
      if (result.downloadUrl) {
        setPodcastAudioUrl(result.downloadUrl);
      }
      setIsPodcastFirebaseStored(result.isFirebaseStored);
    } catch (err) {
      console.warn('Podcast upload warning:', err);
    } finally {
      setIsPodcastAudioUploading(false);
    }
  };

  const handlePodcastCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPodcastCoverImage(objectUrl);
    try {
      const result = await uploadCoverToFirebaseStorage(file);
      if (result.downloadUrl) {
        setPodcastCoverImage(result.downloadUrl);
      }
    } catch (err) {
      console.warn('Podcast cover upload warning:', err);
    }
  };

  const handlePublishPodcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podcastTitle.trim() || !speakerName.trim()) return;

    const totalSeconds = podcastDurationSec > 0 ? podcastDurationSec : 1200; // 20 mins default

    const newEp: LifeStoryEpisode = {
      id: `life-ep-${Date.now()}`,
      title: podcastTitle.trim(),
      speakerName: speakerName.trim(),
      speakerAge,
      speakerLocation: speakerLocation.trim(),
      speakerProfession: speakerProfession.trim(),
      keyQuote: keyQuote.trim() || 'জীবন হয়তো পথ বদলায়, কিন্তু আশার আলো কখনো নেভে না...',
      summary: podcastSummary.trim() || 'বাস্তব জীবনের ঘাত-প্রতিঘাত ও ঘুরে দাঁড়ানোর সত্য গল্প...',
      duration: totalSeconds,
      audioUrl: podcastAudioUrl || undefined,
      coverImage: podcastCoverImage,
      releaseDate: new Date().toISOString().split('T')[0],
      tags: ['বাস্তব জীবন', 'অনুপ্রেরণা', 'সত্য ঘটনা'],
      listenCount: 1,
      featured: true,
    };

    if (onAddEpisode) {
      onAddEpisode(newEp);
    }

    setPodcastPublishSuccess(true);
    setTimeout(() => setPodcastPublishSuccess(false), 4000);

    // Reset
    setPodcastTitle('');
    setSpeakerName('');
    setKeyQuote('');
    setPodcastSummary('');
    setPodcastAudioFile(null);
    setPodcastAudioName('');
    setPodcastAudioUrl('');
    setPodcastDurationSec(0);
  };

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-7">
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">মানুষের জীবন কথা — নতুন পডকাস্ট পর্ব</h2>
              <p className="text-xs text-purple-300/80">বাস্তব জীবনের মানুষের সাক্ষাৎকার ও অনুপ্রেরণামূলক অডিও প্রকাশ করুন</p>
            </div>
          </div>
          {podcastPublishSuccess && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" /> পডকাস্ট প্রকাশিত হয়েছে!
            </div>
          )}
        </div>

        <form onSubmit={handlePublishPodcast} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Podcast Title */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                পর্বের শিরোনাম <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                required
                value={podcastTitle}
                onChange={(e) => setPodcastTitle(e.target.value)}
                placeholder="যেমন: শূন্য থেকে মহাকাশ — এক সংগ্রামী শিক্ষকের কথা"
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white placeholder-purple-400/50 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Speaker Name */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                বক্তার নাম <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                required
                value={speakerName}
                onChange={(e) => setSpeakerName(e.target.value)}
                placeholder="যেমন: প্রবীর কুমার রায়"
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white placeholder-purple-400/50 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                স্থান / শহর
              </label>
              <input
                type="text"
                value={speakerLocation}
                onChange={(e) => setSpeakerLocation(e.target.value)}
                placeholder="যেমন: বর্ধমান, পশ্চিমবঙ্গ"
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white placeholder-purple-400/50 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Profession */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                পেশা / পরিচিতি
              </label>
              <input
                type="text"
                value={speakerProfession}
                onChange={(e) => setSpeakerProfession(e.target.value)}
                placeholder="যেমন: প্রাক্তন শিক্ষক ও চিত্রশিল্পী"
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white placeholder-purple-400/50 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Key Quote */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              মূল উক্তি (Key Quote)
            </label>
            <input
              type="text"
              value={keyQuote}
              onChange={(e) => setKeyQuote(e.target.value)}
              placeholder="যেমন: জীবন যখন সব কেড়ে নেয়, তখনই মানুষ নতুন করে বাঁচার পথ খুঁজে পায়..."
              className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white placeholder-purple-400/50 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              পডকাস্টের সংক্ষিপ্ত বিবরণ
            </label>
            <textarea
              rows={3}
              value={podcastSummary}
              onChange={(e) => setPodcastSummary(e.target.value)}
              placeholder="এই পর্বে প্রবীরবাবু শেয়ার করেছেন কীভাবে এক চরম সড়ক দুর্ঘটনার পর তিনি নতুন করে বেঁচে থাকার সাহস পান..."
              className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white placeholder-purple-400/50 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* PODCAST ACCESS SETTING SECTION */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1b0d36] to-[#140828] border border-indigo-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-indigo-200 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-indigo-400" />
                <span>পডকাস্ট অ্যাক্সেস</span>
                <span className="text-indigo-400 font-bold">*</span>
              </label>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ডিফল্ট নীতি
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-700/50 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border border-indigo-400 bg-indigo-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>শুধুমাত্র ₹20 Pass সদস্যদের জন্য</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                      নির্বাচিত (Default)
                    </span>
                  </p>
                  <p className="text-[11px] text-indigo-300/80 mt-0.5">
                    মানুষের জীবন কথা পডকাস্টের সমস্ত পর্ব শুনতে শ্রোতাদের সক্রিয় ₹২০ অল অ্যাক্সেস পাস আবশ্যক।
                  </p>
                </div>
              </div>

              {/* Information message */}
              <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-200">
                  <p className="font-semibold text-white">
                    "₹20 Pass না থাকলে Podcast শোনা যাবে না।"
                  </p>
                  <p className="text-[11px] text-indigo-300/80 mt-0.5">
                    পাস বিহীন সাধারণ শ্রোতাদের জন্য পডকাস্ট পর্ব লক থাকবে এবং পাস সক্রিয় করার জন্য প্রম্পট দেখানো হবে (বর্তমানে ফ্রন্টএন্ড সেটিংস প্রযোজ্য)।
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-2.5">
              <label className="block text-xs font-semibold text-purple-200 flex items-center gap-1.5">
                <FileAudio className="w-4 h-4 text-indigo-400" />
                পডকাস্ট অডিও ফাইল
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handlePodcastAudioUpload}
                className="w-full text-xs text-purple-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
              {isPodcastAudioUploading && (
                <div className="text-[11px] text-purple-300">
                  আপলোড হচ্ছে ({podcastAudioUploadProgress}%)...
                </div>
              )}
              {podcastAudioName && (
                <p className="text-[11px] text-emerald-300">ফাইল: {podcastAudioName}</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-2.5">
              <label className="block text-xs font-semibold text-purple-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                কভার আর্ট
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePodcastCoverUpload}
                className="w-full text-xs text-purple-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-700 file:text-white hover:file:bg-purple-600 cursor-pointer"
              />
              {podcastCoverImage && (
                <img
                  src={podcastCoverImage}
                  alt="Podcast cover"
                  className="w-12 h-12 rounded-lg object-cover border border-purple-700/50"
                />
              )}
            </div>
          </div>

          {/* Podcast Episode Admin Preview */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1a0c30] to-[#120722] border border-purple-800/60 space-y-3">
            <div className="flex items-center justify-between border-b border-purple-800/40 pb-2.5">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs sm:text-sm">
                <Radio className="w-4 h-4 text-indigo-400" />
                <span>পডকাস্ট অ্যাডমিন প্রিভিউ</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                Podcast Access: ₹20 Pass Required
              </span>
            </div>

            <div className="flex items-start gap-3.5">
              <img
                src={podcastCoverImage}
                alt="Podcast preview"
                className="w-16 h-16 rounded-xl object-cover border border-purple-700/50 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                    {speakerName || 'বক্তার নাম'} {speakerLocation ? `(${speakerLocation})` : ''}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Podcast Access: ₹20 Pass Required
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {podcastTitle || 'পর্বের শিরোনাম (অপ্রদত্ত)'}
                </h4>
                <p className="text-[11px] text-purple-300/70 italic line-clamp-1">
                  "{keyQuote || 'জীবন হয়তো পথ বদলায়, কিন্তু আশার আলো কখনো নেভে না...'}"
                </p>
                <div className="text-[10px] text-purple-400 flex items-center gap-2 pt-1">
                  <span>অডিও: {podcastAudioName || 'ফাইলের লিংক সংযুক্ত'}</span>
                  <span>•</span>
                  <span>নীতি: শুধুমাত্র ₹20 Pass সদস্যদের জন্য</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!podcastTitle.trim() || !speakerName.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>পডকাস্ট পর্ব প্রকাশ করুন</span>
            </button>
          </div>
        </form>
      </div>

      {/* Episodes List */}
      {episodes.length > 0 && (
        <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-7">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-400" />
            প্রকাশিত জীবন কথা পর্বসমূহ ({episodes.length}টি)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className="p-4 rounded-xl bg-[#201037]/80 border border-purple-800/40 flex items-start gap-3.5"
              >
                <img
                  src={ep.coverImage}
                  alt={ep.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-purple-700/50"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                      {ep.speakerName} ({ep.speakerLocation})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      Podcast Access: ₹20 Pass Required
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-1">{ep.title}</h4>
                  <p className="text-[11px] text-purple-300/70 italic line-clamp-1 mt-0.5">
                    "{ep.keyQuote}"
                  </p>
                  <div className="text-[10px] text-purple-400 mt-2 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {Math.round(ep.durationSec / 60)} মিনিট
                    </span>
                    <span>•</span>
                    <span>{ep.listenCount || 0} বার শোনা হয়েছে</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
