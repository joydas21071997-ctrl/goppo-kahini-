import React, { useState, useRef } from 'react';
import {
  Upload,
  Music,
  ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Play,
  Pause,
  Trash2,
  Clock,
  Crown,
  Search,
  Check,
  ExternalLink,
  BookOpen,
  Link as LinkIcon,
  Zap,
  Ticket,
  IndianRupee,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  Eye,
  FileText,
  Radio,
  Lock,
  Info,
  Layers,
  Loader2
} from 'lucide-react';
import { Story, StoryGenre, StoryPricingTier, StoryLengthCategory } from '../../types';
import { uploadAudioToFirebaseStorage, uploadCoverToFirebaseStorage } from '../../services/firebaseStorage';
import { saveStoryToFirestore, deleteStoryFromFirestore } from '../../services/firestoreStories';

interface AdminStoryUploaderProps {
  stories?: Story[];
  onAddStory: (newStory: Story) => void;
  onDeleteStory?: (storyId: string) => void;
}

export const AdminStoryUploader: React.FC<AdminStoryUploaderProps> = ({
  stories = [],
  onAddStory,
  onDeleteStory,
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('জয় (Joy)');
  const [narrator, setNarrator] = useState('জয় (Joy)');
  const [genre, setGenre] = useState<StoryGenre>('ভৌতিক ও অলৌকিক');
  
  // Story Length (গল্পের দৈর্ঘ্য: ১. ছোট গল্প, ২. মাঝারি গল্প, ৩. বড় গল্প)
  const [lengthCategory, setLengthCategory] = useState<'mini' | 'medium' | 'mega' | ''>('');
  const [durationMins, setDurationMins] = useState(15);

  // Story Type (গল্পের ধরন: ফ্রি গল্প / পেইড গল্প)
  const [storyType, setStoryType] = useState<'free' | 'paid' | ''>('');
  const [storyPrice, setStoryPrice] = useState<number | ''>('');

  // Access Settings (অ্যাক্সেস ও প্রিমিয়াম সেটিংস)
  // 1. সাধারণ ফ্রি গল্প (Free content)
  // 2. পাস প্রয়োজন (Content requires the ₹20 Pass)
  // 3. পেইড গল্প (Content requires separate payment according to the Admin-defined price)
  const [accessSetting, setAccessSetting] = useState<'free_general' | 'pass_required' | 'paid_individual' | ''>('');

  // Podcast Access Setting (পডকাস্ট অ্যাক্সেস)
  // Default selected option: শুধুমাত্র ₹20 Pass সদস্যদের জন্য
  const [podcastAccessSetting, setPodcastAccessSetting] = useState<'pass_only'>('pass_only');

  // Form Validation Errors (in Bengali)
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Audio Upload & Duration Detection
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDurationSec, setAudioDurationSec] = useState<number>(0);
  const [isAudioPreviewPlaying, setIsAudioPreviewPlaying] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Firebase Storage Upload States for Story Audio
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [isAudioFirebaseStored, setIsAudioFirebaseStored] = useState(false);
  const [audioUploadStatusMessage, setAudioUploadStatusMessage] = useState('');
  const [audioUploadError, setAudioUploadError] = useState('');

  // Thumbnail Upload
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80');
  const [coverImageFileName, setCoverImageFileName] = useState('');
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');
  const [storageAudioPath, setStorageAudioPath] = useState('');
  const [storageCoverPath, setStorageCoverPath] = useState('');
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [isCoverFirebaseStored, setIsCoverFirebaseStored] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState('');

  const [fullStoryText, setFullStoryText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const [deleteStatusMessage, setDeleteStatusMessage] = useState('');

  // Stories Catalog Search in Admin
  const [searchCatalog, setSearchCatalog] = useState('');

  const genres: StoryGenre[] = [
    'ভৌতিক ও অলৌকিক',
    'রহস্য ও গোয়েন্দা',
    'রোমাঞ্চ ও থ্রিলার',
    'ঐতিহাসিক ও লোকগাথা',
    'বাস্তব ও রূপকথা',
    'ঘুমের গল্প ও প্রশান্তি',
    'প্রেম ও রোমান্স (রোমান্টিক গল্প)',
  ];

  const handleStoryAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Temporary object URL exclusively for local audio preview playback
    const objectUrl = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioFileName(file.name);
    setAudioPreviewUrl(objectUrl);
    setAudioUrl(''); // Explicitly cleared: only real Firebase Storage download URL will be set
    setAudioUploadError('');
    setIsAudioUploading(true);
    setAudioUploadProgress(0);
    setAudioUploadStatusMessage('Firebase Storage-এ আপলোড শুরু হচ্ছে...');
    setIsAudioFirebaseStored(false);

    // Clear audio validation error if any
    setValidationErrors((prev) => prev.filter((err) => !err.includes('অডিও')));

    // Auto-fetch audio duration from file metadata without overriding pricing
    const tempAudio = new Audio(objectUrl);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        const totalSec = Math.round(tempAudio.duration);
        setAudioDurationSec(totalSec);
        const mins = Math.max(1, Math.round(totalSec / 60));
        setDurationMins(mins);
      }
    };

    try {
      const result = await uploadAudioToFirebaseStorage(file, (info) => {
        setAudioUploadProgress(info.progress);
        if (info.status === 'uploading') {
          setAudioUploadStatusMessage(`Firebase Storage-এ আপলোড হচ্ছে (${info.progress}%)...`);
        } else if (info.status === 'completed') {
          setAudioUploadStatusMessage('Firebase Storage-এ সম্পূর্ণ আপলোড সম্পন্ন!');
        }
      });

      if (result.downloadUrl) {
        setAudioUrl(result.downloadUrl);
        if (result.storagePath) setStorageAudioPath(result.storagePath);
        setIsAudioFirebaseStored(true);
        setAudioUploadStatusMessage('Firebase Storage-এ অডিও সংরক্ষিত হয়েছে');
      } else {
        throw new Error('Firebase Storage থেকে অডিও ডাউনলোড লিংক পাওয়া যায়নি');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Audio upload to Firebase Storage failed:', err);
      setAudioUploadError(`Firebase Storage-এ অডিও আপলোড ব্যর্থ হয়েছে: ${msg}`);
      setAudioUploadStatusMessage('আপলোড ব্যর্থ হয়েছে');
      setAudioUrl('');
    } finally {
      setIsAudioUploading(false);
    }
  };

  const handleStoryCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setCoverPreviewUrl(objectUrl);
    setCoverImageFileName(file.name);
    setCoverUploadError('');
    setIsCoverUploading(true);
    setCoverUploadProgress(0);
    setIsCoverFirebaseStored(false);

    try {
      const result = await uploadCoverToFirebaseStorage(file, (pct) => {
        setCoverUploadProgress(pct);
      });
      if (result.downloadUrl) {
        setCoverImage(result.downloadUrl);
        if (result.storagePath) setStorageCoverPath(result.storagePath);
        setIsCoverFirebaseStored(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Cover upload to Firebase Storage failed:', err);
      setCoverUploadError(`কভার ছবি আপলোড ব্যর্থ: ${msg}`);
    } finally {
      setIsCoverUploading(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError('');

    // Comprehensive Bengali Validation
    const errors: string[] = [];
    if (!title.trim()) {
      errors.push('গল্পের শিরোনাম প্রদান করা আবশ্যক।');
    }

    if (isAudioUploading) {
      errors.push('অডিও ফাইল এখনও Firebase Storage-এ আপলোড হচ্ছে। অনুগ্রহ করে সম্পূর্ণ আপলোড হওয়া পর্যন্ত অপেক্ষা করুন।');
    } else if (!audioUrl || audioUrl.startsWith('blob:')) {
      errors.push('গল্পের অডিও ফাইল আবশ্যক এবং এটি অবশ্যই Firebase Storage-এ সফলভাবে আপলোড হতে হবে।');
    }

    if (isCoverUploading) {
      errors.push('কভার ছবি এখনও আপলোড হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।');
    }

    if (!lengthCategory) {
      errors.push('গল্পের দৈর্ঘ্য (ছোট গল্প / মাঝারি গল্প / বড় গল্প) নির্বাচন করা আবশ্যক।');
    }
    if (!storyType) {
      errors.push('গল্পের ধরন (ফ্রি গল্প বা পেইড গল্প) নির্বাচন করা আবশ্যক।');
    } else if (storyType === 'paid') {
      if (storyPrice === '' || Number(storyPrice) <= 0 || isNaN(Number(storyPrice))) {
        errors.push('পেইড গল্পের জন্য ০ এর বেশি মূল্য (₹) নির্ধারণ করতে হবে।');
      }
    }
    if (!accessSetting) {
      errors.push('অ্যাক্সেস ও প্রিমিয়াম সেটিংস (সাধারণ ফ্রি গল্প / পাস প্রয়োজন / পেইড গল্প) নির্বাচন করা আবশ্যক।');
    }
    if (!podcastAccessSetting) {
      errors.push('পডকাস্ট অ্যাক্সেস সেটিংস নির্ধারিত থাকা আবশ্যক।');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setIsPublishing(true);

    const totalSeconds = audioDurationSec > 0 ? audioDurationSec : durationMins * 60;
    const quarter = Math.max(1, Math.floor(totalSeconds / 4));
    const isPaid = storyType === 'paid' || accessSetting === 'paid_individual';
    const isPass = accessSetting === 'pass_required';
    const parsedPrice = isPaid ? Number(storyPrice) : undefined;

    const newStory: Story = {
      id: `story-custom-${Date.now()}`,
      title: title.trim(),
      tagline: tagline.trim() || 'এক নতুন রোমাঞ্চকর অডিও কাহিনি',
      description: description.trim() || fullStoryText.slice(0, 160) || 'গপ্পো কাহিনী অরিジナাল অডিও উপস্থাপনা...',
      author: author.trim() || 'জয় (Joy)',
      narrator: narrator.trim() || 'জয় (Joy)',
      voiceStyle: genre === 'ঘুমের গল্প ও প্রশান্তি' ? 'whisper' : 'mysterious',
      genre,
      lengthCategory: (lengthCategory || 'medium') as 'mini' | 'medium' | 'mega',
      duration: totalSeconds,
      isLittlePassOnly: isPass || isPaid,
      pricingType: isPaid ? 'single_pay' : isPass ? 'pass_included' : 'free',
      singlePurchasePrice: parsedPrice,
      audioUrl: audioUrl,
      audioFileName: audioFileName || undefined,
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      colorGradient: genre === 'প্রেম ও রোমান্স (রোমান্টিক গল্প)' ? 'from-rose-950 via-zinc-950 to-black' : 'from-emerald-950 via-zinc-950 to-black',
      releaseDate: new Date().toISOString().split('T')[0],
      rating: 0,
      reviewsCount: 0,
      listenCount: 0,
      chapters: [
        { id: 'c1', title: '১. সূচনা পর্ব', timestamp: 0, duration: quarter },
        { id: 'c2', title: '২. রহস্যের উন্মোচন', timestamp: quarter, duration: quarter },
        { id: 'c3', title: '৩. রোমাঞ্চকর মোড়', timestamp: quarter * 2, duration: quarter },
        { id: 'c4', title: '৪. সমাপ্তি ও পরিণতি', timestamp: quarter * 3, duration: totalSeconds - (quarter * 3) },
      ],
      transcript: [
        { id: 't1', time: 0, text: `${title} — গপ্পো কাহিনীতে শুনছেন এক বিশেষ অডিও পরিবেশনা।` },
        { id: 't2', time: 25, text: fullStoryText.slice(0, 150) || 'রাতের নিস্তব্ধতায় ভেসে এল অচেনা এক ধ্বনি...' },
        { id: 't3', time: 60, text: 'কাহিনির সাথে আবহ সঙ্গীত মিশে সৃষ্টি করল এক রোমাঞ্চকর অনুভূতি।' },
      ],
      fullStoryText: fullStoryText.trim() || `${title} এর পূর্ণ কাহিনি...`,
      createdAt: new Date().toISOString(),
      storageAudioPath: storageAudioPath || undefined,
      storageCoverPath: storageCoverPath || undefined,
      accessSetting,
      podcastAccessSetting,
      storyType,
    };

    try {
      // 1. Save directly to Cloud Firestore
      await saveStoryToFirestore(newStory);

      // 2. Notify local parent state
      onAddStory(newStory);

      // 3. Trigger UI success message
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 5000);

      // 4. Reset form fields cleanly
      setTitle('');
      setTagline('');
      setDescription('');
      setFullStoryText('');
      setAudioFile(null);
      setAudioFileName('');
      setAudioUrl('');
      setAudioPreviewUrl('');
      setAudioDurationSec(0);
      setCoverImageFileName('');
      setCoverPreviewUrl('');
      setStorageAudioPath('');
      setStorageCoverPath('');
      setLengthCategory('');
      setStoryType('');
      setStoryPrice('');
      setAccessSetting('');
      setPodcastAccessSetting('pass_only');
      setValidationErrors([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Publish story to Firestore failed:', err);
      setPublishError(`গল্পটি ফায়ারস্টোরে সংরক্ষণ করতে সমস্যা হয়েছে: ${msg}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteStory = async (story: Story) => {
    if (!confirm(`আপনি কি "${story.title}" গল্পটি ডিলিট করতে চান?\n\nসতর্কতা: এটি ফায়ারস্টোর ডেটাবেস এবং ফায়ারবেস স্টোরেজের অডিও ও কভার ফাইল থেকে চিরতরে মুছে যাবে।`)) {
      return;
    }

    setDeletingStoryId(story.id);
    setDeleteStatusMessage(`"${story.title}" ফায়ারবেস থেকে মুছে ফেলা হচ্ছে...`);

    try {
      await deleteStoryFromFirestore(story.id, story.audioUrl, story.coverImage);
      if (onDeleteStory) {
        onDeleteStory(story.id);
      }
      setDeleteStatusMessage(`"${story.title}" সফলভাবে মুছে ফেলা হয়েছে`);
      setTimeout(() => setDeleteStatusMessage(''), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Delete story failed:', err);
      alert(`গল্প মুছে ফেলতে ব্যর্থ হয়েছে: ${msg}`);
    } finally {
      setDeletingStoryId(null);
    }
  };

  const filteredStories = stories.filter((s) =>
    s.title.toLowerCase().includes(searchCatalog.toLowerCase()) ||
    s.author.toLowerCase().includes(searchCatalog.toLowerCase()) ||
    s.narrator.toLowerCase().includes(searchCatalog.toLowerCase()) ||
    s.genre.toLowerCase().includes(searchCatalog.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Story Upload Form */}
      <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-7">
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">নতুন অডিও গল্প আপলোড করুন</h2>
              <p className="text-xs text-purple-300/80">অডিও ফাইল, কভার আর্ট ও দৈর্ঘ্য-মূল্য নির্ধারণ করে লাইব্রেরিতে যুক্ত করুন</p>
            </div>
          </div>
          {publishSuccess && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" /> সফলভাবে প্রকাশিত হয়েছে!
            </div>
          )}
        </div>

        <form onSubmit={handlePublish} noValidate className="space-y-6">
          {/* Basic Story Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                গল্পের শিরোনাম <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) {
                    setValidationErrors((prev) => prev.filter((err) => !err.includes('শিরোনাম')));
                  }
                }}
                placeholder="যেমন: কালভৈরবীর মন্দির"
                className={`w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border text-white placeholder-purple-400/50 text-xs sm:text-sm focus:outline-none transition-colors ${
                  validationErrors.some((err) => err.includes('শিরোনাম'))
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-purple-800/40 focus:border-pink-500'
                }`}
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                ট্যাগলাইন / আকর্ষণীয় সাবটাইটেল
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="যেমন: অমাবস্যার রাতে পাহাড়ি জঙ্গলের বিভীষিকা"
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white placeholder-purple-400/50 text-xs sm:text-sm focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                লেখক / রচয়িতা
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="যেমন: জয় (Joy)"
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white placeholder-purple-400/50 text-xs sm:text-sm focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {/* Narrator */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                কথক / কণ্ঠশিল্পী (Narrator)
              </label>
              <input
                type="text"
                value={narrator}
                onChange={(e) => setNarrator(e.target.value)}
                placeholder="যেমন: জয় (Joy) / অনিন্দিতা সেন"
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white placeholder-purple-400/50 text-xs sm:text-sm focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                জনরা (বিভাগ)
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as StoryGenre)}
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500 transition-colors"
              >
                {genres.map((g) => (
                  <option key={g} value={g} className="bg-[#170a2a] text-white">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Duration Hint */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                আনুমানিক সময় / দৈর্ঘ্য (মিনিট)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={durationMins}
                  onChange={(e) => setDurationMins(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
                <span className="text-xs text-purple-400 shrink-0 font-medium">মিনিট</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              সংক্ষিপ্ত বিবরণ (Synopsis)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="শ্রোতাদের জন্য কাহিনির সংক্ষিপ্ত প্রেক্ষাপট..."
              className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white placeholder-purple-400/50 text-xs sm:text-sm focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          {/* USER ACCESS RULES — ADMIN INFORMATION CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#23123d] via-[#1a0c30] to-[#120722] border border-purple-800/60 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-purple-800/50 pb-2.5">
              <div className="flex items-center gap-2 text-pink-300 font-bold text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-pink-400" />
                <span>ইউজার অ্যাক্সেস নিয়মাবলী (User Access Rules)</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-medium border border-pink-500/30">
                অ্যাডমিন গাইডলাইন
              </span>
            </div>

            <p className="text-[11px] text-purple-300/80">
              প্ল্যাটফর্মে শ্রোতাদের জন্য অডিও কনটেন্ট ও প্রিমিয়াম অ্যাক্সেসের নিয়মসমূহ:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {/* Rule 1 */}
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-bold">1</span>
                  Login করার আগে
                </p>
                <p className="text-[11px] text-purple-300/80">
                  শ্রোতারা শুধুমাত্র ২–৩টি নির্বাচিত ফ্রি গল্প (Free Stories) শুনতে পারবেন।
                </p>
              </div>

              {/* Rule 2 */}
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-bold">2</span>
                  ফ্রি শোনার সীমার পর
                </p>
                <p className="text-[11px] text-purple-300/80">
                  নির্ধারিত ফ্রি শোনার সীমা শেষ হওয়ার পর অ্যাকাউন্টে Login করা আবশ্যক।
                </p>
              </div>

              {/* Rule 3 */}
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-bold">3</span>
                  Login করার পর
                </p>
                <p className="text-[11px] text-purple-300/80">
                  অ্যাডমিনের Free / Paid / Pass সেটিংস অনুযায়ী গল্প অ্যাক্সেস করা যাবে।
                </p>
              </div>

              {/* Rule 4 */}
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold">4</span>
                  ₹20 Pass সদস্য
                </p>
                <p className="text-[11px] text-purple-300/80">
                  পাসধারীরা নির্দিষ্ট প্রিমিয়াম ফিচারসমূহ এবং Podcast সেকশন সম্পূর্ণ শুনতে পারবেন।
                </p>
              </div>

              {/* Rule 5 */}
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-bold">5</span>
                  মাঝারি গল্প (Medium Stories)
                </p>
                <p className="text-[11px] text-purple-300/80">
                  অ্যাডমিন প্রতিটি মাঝারি গল্প ফ্রি নাকি পেইড হবে তা নির্ধারণ করতে পারেন।
                </p>
              </div>

              {/* Rule 6 */}
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">6</span>
                  বড় গল্প (Large Stories)
                </p>
                <p className="text-[11px] text-purple-300/80">
                  বড় গল্প সাধারণত পেইড (Paid) হবে এবং অ্যাডমিন নির্ধারিত মূল্যে বিক্রি হবে।
                </p>
              </div>
            </div>
          </div>

          {/* STORY TYPE / LENGTH SECTION (গল্পের দৈর্ঘ্য) */}
          <div className={`p-4 sm:p-5 rounded-2xl bg-purple-950/40 border transition-colors space-y-3 ${
            validationErrors.some((err) => err.includes('দৈর্ঘ্য'))
              ? 'border-rose-500/80 bg-rose-950/10'
              : 'border-purple-800/40'
          }`}>
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-purple-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-pink-400" />
                <span>গল্পের দৈর্ঘ্য</span>
                <span className="text-pink-400 font-bold">*</span>
              </label>
              <span className="text-[11px] text-purple-400">একটি বিকল্প নির্বাচন করুন</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'mini', label: '১. ছোট গল্প', hint: 'সংক্ষিপ্ত অডিও উপাখ্যান' },
                { id: 'medium', label: '২. মাঝারি গল্প', hint: 'মধ্যম দৈর্ঘ্যের রোমাঞ্চ' },
                { id: 'mega', label: '৩. বড় গল্প', hint: 'পূর্ণাঙ্গ রোমাঞ্চকর মহা-কাহিনি' },
              ].map((item) => {
                const isSelected = lengthCategory === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setLengthCategory(item.id as 'mini' | 'medium' | 'mega');
                      setValidationErrors((prev) => prev.filter((err) => !err.includes('দৈর্ঘ্য')));
                    }}
                    className={`p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-pink-600/20 border-pink-500 text-white shadow-md shadow-pink-500/10'
                        : 'bg-purple-950/60 border-purple-800/40 text-purple-300 hover:bg-purple-900/40 hover:border-purple-700/60'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-pink-400 bg-pink-500' : 'border-purple-600 bg-transparent'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-white">{item.label}</p>
                      <p className="text-[11px] text-purple-300/80 mt-0.5">{item.hint}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {validationErrors.some((err) => err.includes('দৈর্ঘ্য')) && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> গল্পের দৈর্ঘ্য নির্বাচন করা আবশ্যক
              </p>
            )}
          </div>

          {/* FREE / PAID SECTION (গল্পের ধরন) */}
          <div className={`p-4 sm:p-5 rounded-2xl bg-purple-950/40 border transition-colors space-y-4 ${
            validationErrors.some((err) => err.includes('ধরন') || err.includes('মূল্য'))
              ? 'border-rose-500/80 bg-rose-950/10'
              : 'border-purple-800/40'
          }`}>
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-purple-200 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-pink-400" />
                <span>গল্পের ধরন</span>
                <span className="text-pink-400 font-bold">*</span>
              </label>
              <span className="text-[11px] text-purple-400">ফ্রি অথবা পেইড বিকল্প নির্ধারণ করুন</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: ফ্রি গল্প */}
              <button
                type="button"
                onClick={() => {
                  setStoryType('free');
                  setStoryPrice('');
                  if (accessSetting === 'paid_individual') {
                    setAccessSetting('free_general');
                  }
                  setValidationErrors((prev) => prev.filter((err) => !err.includes('ধরন') && !err.includes('মূল্য')));
                }}
                className={`p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 cursor-pointer ${
                  storyType === 'free'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-purple-950/60 border-purple-800/40 text-purple-300 hover:bg-purple-900/40 hover:border-purple-700/60'
                }`}
              >
                <div className="mt-0.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    storyType === 'free' ? 'border-emerald-400 bg-emerald-500' : 'border-purple-600 bg-transparent'
                  }`}>
                    {storyType === 'free' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>১. ফ্রি গল্প</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      বিনামূল্যে
                    </span>
                  </p>
                  <p className="text-[11px] text-purple-300/80 mt-1">সব শ্রোতা কোনো একক চার্জ ছাড়াই বিনামূল্যে শুনতে পারবেন</p>
                </div>
              </button>

              {/* Option 2: পেইড গল্প */}
              <button
                type="button"
                onClick={() => {
                  setStoryType('paid');
                  if (!storyPrice) setStoryPrice(20);
                  if (accessSetting === 'free_general') {
                    setAccessSetting('paid_individual');
                  }
                  setValidationErrors((prev) => prev.filter((err) => !err.includes('ধরন')));
                }}
                className={`p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 cursor-pointer ${
                  storyType === 'paid'
                    ? 'bg-pink-600/20 border-pink-500 text-white shadow-md shadow-pink-500/10'
                    : 'bg-purple-950/60 border-purple-800/40 text-purple-300 hover:bg-purple-900/40 hover:border-purple-700/60'
                }`}
              >
                <div className="mt-0.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    storyType === 'paid' ? 'border-pink-400 bg-pink-500' : 'border-purple-600 bg-transparent'
                  }`}>
                    {storyType === 'paid' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>২. পেইড গল্প</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
                      প্রিমিয়াম
                    </span>
                  </p>
                  <p className="text-[11px] text-purple-300/80 mt-1">শ্রোতাদের নির্দিষ্ট অ্যাডমিন-নির্ধারিত মূল্য পরিশোধ করতে হবে</p>
                </div>
              </button>
            </div>

            {/* Conditional Price Field for Paid Story */}
            {storyType === 'paid' && (
              <div className="pt-3 border-t border-purple-900/40">
                <label className="block text-xs font-semibold text-purple-200 mb-1.5 flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-pink-400" />
                  <span>গল্পের মূল্য (₹)</span>
                  <span className="text-pink-400 font-bold">*</span>
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={storyPrice}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                      setStoryPrice(val);
                      if (Number(val) > 0) {
                        setValidationErrors((prev) => prev.filter((err) => !err.includes('মূল্য')));
                      }
                    }}
                    placeholder="যেমন: ২০"
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-purple-950/70 border text-white placeholder-purple-400/50 text-xs sm:text-sm focus:outline-none transition-colors font-semibold ${
                      validationErrors.some((err) => err.includes('মূল্য'))
                        ? 'border-rose-500 focus:border-rose-400'
                        : 'border-pink-500/60 focus:border-pink-400'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-purple-400 mt-1">
                  পেইড গল্পের জন্য ভারতীয় রুপিতে (₹) ০-এর বেশি মূল্য প্রদান করুন (যেমন: ₹১০ বা ₹২০)।
                </p>
              </div>
            )}
            {validationErrors.some((err) => err.includes('ধরন')) && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> গল্পের ধরন নির্বাচন করা আবশ্যক
              </p>
            )}
          </div>

          {/* ACCESS SETTINGS SECTION (অ্যাক্সেস ও প্রিমিয়াম সেটিংস) */}
          <div className={`p-4 sm:p-5 rounded-2xl bg-purple-950/40 border transition-colors space-y-4 ${
            validationErrors.some((err) => err.includes('অ্যাক্সেস'))
              ? 'border-rose-500/80 bg-rose-950/10'
              : 'border-purple-800/40'
          }`}>
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-purple-200 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-pink-400" />
                <span>অ্যাক্সেস ও প্রিমিয়াম সেটিংস</span>
                <span className="text-pink-400 font-bold">*</span>
              </label>
              <span className="text-[11px] text-purple-400">কনটেন্ট অ্যাক্সেসের শর্ত নির্বাচন করুন</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: সাধারণ ফ্রি গল্প */}
              <button
                type="button"
                onClick={() => {
                  setAccessSetting('free_general');
                  setStoryType('free');
                  setStoryPrice('');
                  setValidationErrors((prev) => prev.filter((err) => !err.includes('অ্যাক্সেস') && !err.includes('ধরন') && !err.includes('মূল্য')));
                }}
                className={`p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 cursor-pointer ${
                  accessSetting === 'free_general'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-purple-950/60 border-purple-800/40 text-purple-300 hover:bg-purple-900/40 hover:border-purple-700/60'
                }`}
              >
                <div className="mt-0.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    accessSetting === 'free_general' ? 'border-emerald-400 bg-emerald-500' : 'border-purple-600 bg-transparent'
                  }`}>
                    {accessSetting === 'free_general' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>১. সাধারণ ফ্রি গল্প</span>
                  </p>
                  <span className="inline-block text-[10px] px-2 py-0.5 mt-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    Free content
                  </span>
                  <p className="text-[11px] text-purple-300/80 mt-1">
                    সম্পূর্ণ উন্মুক্ত — কোনো পাস বা সাবস্ক্রিপশন ছাড়াই যেকোনো সাধারণ শ্রোতা শুনতে পারবেন
                  </p>
                </div>
              </button>

              {/* Option 2: পাস প্রয়োজন */}
              <button
                type="button"
                onClick={() => {
                  setAccessSetting('pass_required');
                  setValidationErrors((prev) => prev.filter((err) => !err.includes('অ্যাক্সেস')));
                }}
                className={`p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 cursor-pointer ${
                  accessSetting === 'pass_required'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-purple-950/60 border-purple-800/40 text-purple-300 hover:bg-purple-900/40 hover:border-purple-700/60'
                }`}
              >
                <div className="mt-0.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    accessSetting === 'pass_required' ? 'border-indigo-400 bg-indigo-500' : 'border-purple-600 bg-transparent'
                  }`}>
                    {accessSetting === 'pass_required' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>২. পাস প্রয়োজন</span>
                  </p>
                  <span className="inline-block text-[10px] px-2 py-0.5 mt-1 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                    ₹20 Pass
                  </span>
                  <p className="text-[11px] text-purple-300/80 mt-1">
                    Content requires the ₹20 Pass — শ্রোতাদের সক্রিয় ₹২০ অল অ্যাক্সেস পাস থাকতে হবে
                  </p>
                </div>
              </button>

              {/* Option 3: পেইড গল্প */}
              <button
                type="button"
                onClick={() => {
                  setAccessSetting('paid_individual');
                  setStoryType('paid');
                  if (!storyPrice) setStoryPrice(20);
                  setValidationErrors((prev) => prev.filter((err) => !err.includes('অ্যাক্সেস') && !err.includes('ধরন')));
                }}
                className={`p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 cursor-pointer ${
                  accessSetting === 'paid_individual'
                    ? 'bg-pink-600/20 border-pink-500 text-white shadow-md shadow-pink-500/10'
                    : 'bg-purple-950/60 border-purple-800/40 text-purple-300 hover:bg-purple-900/40 hover:border-purple-700/60'
                }`}
              >
                <div className="mt-0.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    accessSetting === 'paid_individual' ? 'border-pink-400 bg-pink-500' : 'border-purple-600 bg-transparent'
                  }`}>
                    {accessSetting === 'paid_individual' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>৩. পেইড গল্প</span>
                  </p>
                  <span className="inline-block text-[10px] px-2 py-0.5 mt-1 rounded bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
                    Separate Payment
                  </span>
                  <p className="text-[11px] text-purple-300/80 mt-1">
                    Content requires separate payment according to the Admin-defined price
                  </p>
                </div>
              </button>
            </div>
            {validationErrors.some((err) => err.includes('অ্যাক্সেস')) && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> অ্যাক্সেস ও প্রিমিয়াম সেটিংস (সাধারণ ফ্রি গল্প / পাস প্রয়োজন / পেইড গল্প) নির্বাচন করা আবশ্যক
              </p>
            )}
          </div>

          {/* PODCAST ACCESS SECTION (পডকাস্ট অ্যাক্সেস) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1b0d36] to-[#140828] border border-indigo-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-indigo-200 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-indigo-400" />
                <span>পডকাস্ট অ্যাক্সেস</span>
                <span className="text-indigo-400 font-bold">*</span>
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ডিফল্ট নীতি
              </span>
            </div>

            <div className="space-y-2">
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
                    পডকাস্ট সেকশন শুধুমাত্র সক্রিয় ₹২০ পাস সদস্যদের জন্য উন্মুক্ত থাকবে
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
                    পাস বিহীন ব্যবহারকারীদের জন্য পডকাস্ট অ্যাক্সেস সংরক্ষিত থাকবে (বর্তমানে ফ্রন্টএন্ড সেটিংস প্রযোজ্য)।
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Upload File Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Audio File Box */}
            <div className={`p-4 rounded-2xl bg-purple-950/40 border space-y-3 transition-colors ${
              validationErrors.some((err) => err.includes('অডিও'))
                ? 'border-rose-500/80 bg-rose-950/10'
                : 'border-purple-800/40'
            }`}>
              <label className="block text-xs font-semibold text-purple-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileAudio className="w-4 h-4 text-pink-400" />
                  অডিও ফাইল (MP3, WAV, M4A)
                  <span className="text-pink-400 font-bold">*</span>
                </span>
                {audioFileName && (
                  <span className="text-[10px] text-emerald-400 font-normal">সংযুক্ত হয়েছে</span>
                )}
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleStoryAudioUpload}
                className="w-full text-xs text-purple-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-500 cursor-pointer"
              />

              {validationErrors.some((err) => err.includes('অডিও')) && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> অডিও ফাইল আপলোড করা আবশ্যক
                </p>
              )}

              {isAudioUploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-purple-300">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin text-pink-400" />
                      Firebase Storage-এ অডিও আপলোড হচ্ছে...
                    </span>
                    <span className="font-mono text-pink-300">{audioUploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-purple-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${audioUploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-purple-400">{audioUploadStatusMessage}</p>
                </div>
              )}

              {audioUploadError && (
                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-600/70 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{audioUploadError}</span>
                </div>
              )}

              {(audioPreviewUrl || audioUrl) && !isAudioUploading && (
                <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (audioPreviewRef.current) {
                          if (isAudioPreviewPlaying) {
                            audioPreviewRef.current.pause();
                            setIsAudioPreviewPlaying(false);
                          } else {
                            audioPreviewRef.current.play();
                            setIsAudioPreviewPlaying(true);
                          }
                        }
                      }}
                      className="w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center shrink-0 cursor-pointer shadow hover:bg-pink-500 transition-colors"
                    >
                      {isAudioPreviewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                    <div className="min-w-0 text-left">
                      <p className="text-xs text-white truncate">{audioFileName || 'অডিও ফাইল'}</p>
                      <p className="text-[10px] text-purple-300">
                        {durationMins} মিনিট • {isAudioFirebaseStored ? 'Firebase Storage-এ সংরক্ষিত' : 'প্রিভিউ প্রস্তুত'}
                      </p>
                    </div>
                  </div>
                  <audio
                    ref={audioPreviewRef}
                    src={audioPreviewUrl || audioUrl}
                    onEnded={() => setIsAudioPreviewPlaying(false)}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Cover Image Box */}
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-3">
              <label className="block text-xs font-semibold text-purple-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-pink-400" />
                কভার থাম্বনেইল ছবি (JPEG, PNG, WebP)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleStoryCoverUpload}
                className="w-full text-xs text-purple-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-700 file:text-white hover:file:bg-purple-600 cursor-pointer"
              />

              {isCoverUploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-purple-300">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                      Firebase Storage-এ কভার আপলোড হচ্ছে...
                    </span>
                    <span className="font-mono text-purple-300">{coverUploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-purple-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-400 transition-all duration-300"
                      style={{ width: `${coverUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {coverUploadError && (
                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-600/70 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{coverUploadError}</span>
                </div>
              )}

              {(coverPreviewUrl || coverImage) && (
                <div className="flex items-center gap-3">
                  <img
                    src={coverPreviewUrl || coverImage}
                    alt="Cover preview"
                    className="w-14 h-14 rounded-xl object-cover border border-purple-700/50 shrink-0"
                  />
                  <div className="text-xs text-purple-300/80">
                    <p className="text-white font-medium">কভার থাম্বনেইল প্রিভিউ</p>
                    <p className="text-[11px] text-purple-400">
                      {isCoverFirebaseStored ? 'Firebase Storage-এ সংরক্ষিত' : isCoverUploading ? 'আপলোড চলছে...' : 'স্টক/ডিফল্ট কভার'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Script / Transcript */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              গল্পের মূল চিত্রনাট্য ও টেক্সট (Transcript / Script)
            </label>
            <textarea
              rows={4}
              value={fullStoryText}
              onChange={(e) => setFullStoryText(e.target.value)}
              placeholder="কাহিনির কথ্য রূপ বা ডায়লগ লিখুন। সিস্টেম স্বয়ংক্রিয়ভাবে ৪টি পর্বে বিভক্ত করবে..."
              className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white placeholder-purple-400/50 text-xs sm:text-sm focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          {/* ADMIN PREVIEW: Summary & Details before publishing */}
          <div className="rounded-2xl bg-gradient-to-br from-[#1b0d30] via-[#150926] to-[#0f061b] border border-purple-800/60 p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
              <div className="flex items-center gap-2 text-pink-300 font-bold text-xs sm:text-sm">
                <Eye className="w-4 h-4 text-pink-400" />
                <span>অ্যাডমিন প্রিভিউ (পাবলিশ করার পূর্বরূপ)</span>
              </div>
              <span className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-purple-900/70 text-purple-200 font-medium border border-purple-700/40">
                সরাসরি পূর্বরূপ
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Cover Image in Preview */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-purple-700/60 bg-purple-950/80 relative shadow-md">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="কভার ছবি"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-purple-400 text-[10px] p-2 text-center">
                    <ImageIcon className="w-5 h-5 mb-1 opacity-50" />
                    <span>কভার নেই</span>
                  </div>
                )}
                <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] px-1.5 py-0.5 rounded text-purple-200">
                  কভার
                </span>
              </div>

              {/* Story Information Summary */}
              <div className="flex-1 min-w-0 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-white truncate max-w-full">
                    {title.trim() || <span className="text-purple-400 italic">গল্পের শিরোনাম (অপ্রদত্ত)</span>}
                  </h4>

                  {/* Length Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border flex items-center gap-1 ${
                    lengthCategory === 'mini'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : lengthCategory === 'medium'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : lengthCategory === 'mega'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-purple-950/60 text-purple-400 border-purple-800/40'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>
                      {lengthCategory === 'mini' && 'ছোট গল্প'}
                      {lengthCategory === 'medium' && 'মাঝারি গল্প'}
                      {lengthCategory === 'mega' && 'বড় গল্প'}
                      {!lengthCategory && 'দৈর্ঘ্য নির্বাচিত হয়নি'}
                    </span>
                  </span>

                  {/* Free / Paid Badge & Price */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border flex items-center gap-1 ${
                    storyType === 'free'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : storyType === 'paid'
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                      : 'bg-purple-950/60 text-purple-400 border-purple-800/40'
                  }`}>
                    {storyType === 'free' && 'ফ্রি গল্প'}
                    {storyType === 'paid' && (
                      <>
                        <IndianRupee className="w-3 h-3" />
                        <span>পেইড গল্প {storyPrice ? `• ₹${storyPrice}` : '(মূল্য নির্ধারিত হয়নি)'}</span>
                      </>
                    )}
                    {!storyType && 'ধরন নির্বাচিত হয়নি'}
                  </span>

                  {/* Access Requirement Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border flex items-center gap-1 ${
                    accessSetting === 'free_general'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : accessSetting === 'pass_required'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : accessSetting === 'paid_individual'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-purple-950/60 text-purple-400 border-purple-800/40'
                  }`}>
                    <Crown className="w-3 h-3" />
                    <span>
                      {accessSetting === 'free_general' && 'Access: Free (উন্মুক্ত)'}
                      {accessSetting === 'pass_required' && 'Access: ₹20 Pass Required'}
                      {accessSetting === 'paid_individual' && `Access: Paid ${storyPrice ? `(₹${storyPrice})` : ''}`}
                      {!accessSetting && 'অ্যাক্সেস নির্বাচিত হয়নি'}
                    </span>
                  </span>
                </div>

                {tagline && (
                  <p className="text-purple-300 italic text-xs truncate">"{tagline}"</p>
                )}

                {/* Grid for existing story details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-purple-900/40 text-[11px]">
                  <div>
                    <span className="text-purple-400">কথক:</span>{' '}
                    <span className="text-purple-100 font-medium">{narrator || 'অনির্দিষ্ট'}</span>
                  </div>
                  <div>
                    <span className="text-purple-400">লেখক:</span>{' '}
                    <span className="text-purple-100 font-medium">{author || 'অনির্দিষ্ট'}</span>
                  </div>
                  <div>
                    <span className="text-purple-400">জনরা:</span>{' '}
                    <span className="text-purple-100 font-medium">{genre}</span>
                  </div>
                  <div>
                    <span className="text-purple-400">সময়কাল:</span>{' '}
                    <span className="text-purple-100 font-medium">{durationMins} মিনিট</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-purple-400">অডিও ফাইল:</span>{' '}
                    <span className="text-pink-300 font-medium truncate inline-block max-w-[220px] align-bottom">
                      {audioFileName || (audioUrl ? 'অনলাইন অডিও লিংক যুক্ত আছে' : 'অডিও ফাইল সংযুক্ত করা হয়নি')}
                    </span>
                  </div>
                </div>

                {/* Dedicated Podcast Access Preview info pill */}
                <div className="mt-2 p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-700/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-indigo-200">
                    <Radio className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold text-white">Podcast Access: ₹20 Pass Required</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                    নীতি সংকেত
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Errors Alert Box */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-600/60 text-rose-200 text-xs space-y-2 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>অনুগ্রহ করে নিচের আবশ্যক তথ্যগুলো পূরণ করুন:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-rose-200/90 text-[11px]">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pt-2">
            {publishError ? (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs flex items-center gap-2 max-w-xl">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{publishError}</span>
              </div>
            ) : <div />}
            <div className="flex justify-end w-full sm:w-auto">
              <button
                type="submit"
                disabled={isPublishing || isAudioUploading || isCoverUploading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-lg shadow-pink-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ফায়ারবেসে সংরক্ষণ করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>গল্পটি প্রকাশ ও সংরক্ষণ করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Stories Catalog & Management Table */}
      <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-pink-400" />
              প্ল্যাটফর্মে সংরক্ষিত গল্পসমূহ ({stories.length}টি)
            </h3>
            <p className="text-xs text-purple-300/80">অনলাইনে লাইভ থাকা সব গল্পের তালিকা ও স্ট্যাটাস</p>
            {deleteStatusMessage && (
              <p className="text-xs text-emerald-300 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {deleteStatusMessage}
              </p>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCatalog}
              onChange={(e) => setSearchCatalog(e.target.value)}
              placeholder="গল্প বা কথক খুঁজুন..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              className="p-3.5 rounded-xl bg-[#201037]/80 border border-purple-800/40 flex items-start gap-3 relative group hover:border-pink-500/40 transition-colors"
            >
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-16 h-16 rounded-lg object-cover shrink-0 border border-purple-700/50"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-300 font-medium">
                    {story.genre}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200">
                    {story.lengthCategory === 'mini' ? 'ছোট গল্প' : story.lengthCategory === 'mega' ? 'বড় গল্প' : 'মাঝারি গল্প'}
                  </span>
                  {story.isLittlePassOnly ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> {story.singlePurchasePrice ? `পেইড • ₹${story.singlePurchasePrice}` : 'পাস'}
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                      ফ্রি
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-1">{story.title}</h4>
                <p className="text-[11px] text-purple-300/80 truncate">কথক: {story.narrator}</p>
                <div className="flex items-center gap-2 text-[10px] text-purple-400 mt-1">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {Math.round(story.duration / 60)} মিনিট
                  </span>
                  <span>•</span>
                  <span>{story.listenCount} বার শোনা হয়েছে</span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteStory(story)}
                disabled={deletingStoryId === story.id}
                className="p-1.5 rounded-lg text-purple-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors cursor-pointer"
                title="গল্প ডিলিট করুন"
              >
                {deletingStoryId === story.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}

          {filteredStories.length === 0 && (
            <div className="col-span-full text-center py-8 text-xs text-purple-300/60">
              কোনো গল্প খুঁজে পাওয়া যায়নি
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

