import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Music,
  Users,
  Copy,
  Download,
  Check,
  Crown,
  FileAudio,
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  Search,
  Mic,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogOut,
  Radio,
  BookOpen,
  Volume2,
  ExternalLink,
  KeyRound,
  MessageSquare,
  Phone,
  Settings,
  Calendar,
  MapPin,
  Briefcase,
  QrCode,
  Database,
  Flame,
  Play,
  Pause,
  UploadCloud,
  Mail,
  FileText,
  CheckCheck,
  Loader2,
  HardDrive,
  Scale
} from 'lucide-react';
import { AdminLegalSupportManager } from '../admin/components/AdminLegalSupportManager';
import { uploadAudioToFirebaseStorage, uploadCoverToFirebaseStorage } from '../services/firebaseStorage';
import { getFirebaseConfig } from '../services/firebaseConfig';
import {
  Story,
  StoryGenre,
  StoryPricingTier,
  SubscriberLead,
  NarratorApplication,
  CreatorSession,
  LifeStoryEpisode,
  LifeStorySubmission,
  UserContactMessage,
  JoyPaymentConfig,
  PaymentTransaction,
  AdminActivityLog,
  UpiConfig,
  AboutMissionData,
  TeamMember
} from '../types';
import { INITIAL_ABOUT_MISSION_DATA } from '../data/aboutMission';
import { AdminPaymentManagement } from './AdminPaymentManagement';

interface CreatorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStory: (newStory: Story) => void;
  onAddLifeStoryEpisode?: (newEpisode: LifeStoryEpisode) => void;
  subscribers: SubscriberLead[];
  creatorSession: CreatorSession | null;
  onLogout: () => void;
  narratorApplications: NarratorApplication[];
  onApproveNarrator: (appId: string, approvalCode: string) => void;
  onRejectNarrator: (appId: string) => void;
  onDeleteNarratorApp: (appId: string) => void;
  lifeStorySubmissions: LifeStorySubmission[];
  onUpdateLifeStoryStatus: (submissionId: string, status: 'new' | 'contacted' | 'recorded' | 'archived') => void;
  onDeleteLifeStorySubmission: (submissionId: string) => void;
  onUpdateSubscriberStatus: (subscriberId: string, status: 'verified' | 'pending_verification' | 'rejected') => void;
  onDeleteSubscriber: (subscriberId: string) => void;
  paymentTransactions: PaymentTransaction[];
  onApprovePayment: (transactionId: string) => void;
  onRejectPayment: (transactionId: string, reason: string) => void;
  onApproveRefund: (transactionId: string) => void;
  onRejectRefund: (transactionId: string, reason: string) => void;
  onCompleteRefund: (transactionId: string, refundUtr: string, refundAmount: number, refundNote: string) => void;
  upiConfig: UpiConfig;
  onUpdateUpiConfig: (newConfig: UpiConfig) => void;
  adminActivityLogs: AdminActivityLog[];
  onOpenStandaloneAdmin?: () => void;
}

export const CreatorStudioModal: React.FC<CreatorStudioModalProps> = ({
  isOpen,
  onClose,
  onAddStory,
  onAddLifeStoryEpisode,
  subscribers,
  creatorSession,
  onLogout,
  narratorApplications,
  onApproveNarrator,
  onRejectNarrator,
  onDeleteNarratorApp,
  lifeStorySubmissions,
  onUpdateLifeStoryStatus,
  onDeleteLifeStorySubmission,
  onUpdateSubscriberStatus,
  onDeleteSubscriber,
  paymentTransactions,
  onApprovePayment,
  onRejectPayment,
  onApproveRefund,
  onRejectRefund,
  onCompleteRefund,
  upiConfig,
  onUpdateUpiConfig,
  adminActivityLogs,
  onOpenStandaloneAdmin,
}) => {
  const isSuperAdmin = creatorSession?.role === 'super_admin';
  const [activeTab, setActiveTab] = useState<'payments' | 'upload' | 'crm' | 'lifestories' | 'inbox' | 'approvals' | 'settings' | 'guidelines' | 'about_mission' | 'legal_support'>('payments');

  // About Us & Mission data management state (Saved to localStorage)
  const [aboutMissionData, setAboutMissionData] = useState<AboutMissionData>(() => {
    try {
      const saved = localStorage.getItem('goppo_about_mission_data');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ABOUT_MISSION_DATA;
  });
  const [missionStatementInput, setMissionStatementInput] = useState(aboutMissionData.missionStatement);
  const [missionTitleInput, setMissionTitleInput] = useState(aboutMissionData.title);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberPhoto, setNewMemberPhoto] = useState('');
  const [newMemberBio, setNewMemberBio] = useState('');
  const [newMemberIsFounder, setNewMemberIsFounder] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [aboutSaveSuccess, setAboutSaveSuccess] = useState(false);

  // Admin Password Change state
  const [currentAdminPasswordInput, setCurrentAdminPasswordInput] = useState('');
  const [newAdminPasswordInput, setNewAdminPasswordInput] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sub-section within Upload: Stories vs Life Story Podcast
  const [uploadSubSection, setUploadSubSection] = useState<'story' | 'podcast'>('story');

  // Form State for Story Upload
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState(isSuperAdmin ? 'জয় (Joy)' : 'গপ্পো কাহিনী');
  const [narrator, setNarrator] = useState(creatorSession?.name || 'জয় (Joy)');
  const [genre, setGenre] = useState<StoryGenre>('ভৌতিক ও অলৌকিক');
  const [lengthCategory, setLengthCategory] = useState<'mini' | 'medium' | 'mega'>('medium');
  const [durationMins, setDurationMins] = useState(15);
  const [pricingTier, setPricingTier] = useState<StoryPricingTier>('pass_included');
  const [customPrice, setCustomPrice] = useState<number>(5);

  // Audio Upload & Duration Detection
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDurationSec, setAudioDurationSec] = useState<number>(0);
  const [isAudioPreviewPlaying, setIsAudioPreviewPlaying] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Firebase Storage Upload States for Story Audio
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [isAudioFirebaseStored, setIsAudioFirebaseStored] = useState(false);
  const [audioUploadStatusMessage, setAudioUploadStatusMessage] = useState('');

  // Thumbnail Upload
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80');
  const [coverImageFileName, setCoverImageFileName] = useState('');
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [isCoverFirebaseStored, setIsCoverFirebaseStored] = useState(false);

  const [fullStoryText, setFullStoryText] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Podcast / Life Story Episode Upload State
  const [podcastTitle, setPodcastTitle] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerAge, setSpeakerAge] = useState<number>(45);
  const [speakerLocation, setSpeakerLocation] = useState('');
  const [speakerProfession, setSpeakerProfession] = useState('');
  const [keyQuote, setKeyQuote] = useState('');
  const [podcastSummary, setPodcastSummary] = useState('');
  const [podcastAudioFile, setPodcastAudioFile] = useState<File | null>(null);
  const [podcastAudioName, setPodcastAudioName] = useState('');
  const [podcastAudioUrl, setPodcastAudioUrl] = useState('');
  const [podcastDurationSec, setPodcastDurationSec] = useState<number>(0);
  const [podcastCoverImage, setPodcastCoverImage] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80');
  const [podcastPublishSuccess, setPodcastPublishSuccess] = useState(false);
  const [isPodcastAudioUploading, setIsPodcastAudioUploading] = useState(false);
  const [podcastAudioUploadProgress, setPodcastAudioUploadProgress] = useState(0);
  const [isPodcastFirebaseStored, setIsPodcastFirebaseStored] = useState(false);
  const [podcastUploadStatusMessage, setPodcastUploadStatusMessage] = useState('');

  // Contact Messages & Inbox State
  const [contactMessages, setContactMessages] = useState<UserContactMessage[]>(() => {
    try {
      const stored = localStorage.getItem('goppo_contact_messages');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxCategoryFilter, setInboxCategoryFilter] = useState<'all' | 'unread' | 'feedback' | 'complaint' | 'payment_issue' | 'story_request'>('all');

  // Listen to contact messages updates
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem('goppo_contact_messages');
        if (stored) setContactMessages(JSON.parse(stored));
      } catch {}
    };
    window.addEventListener('goppo_contact_messages_updated', handleUpdate);
    return () => window.removeEventListener('goppo_contact_messages_updated', handleUpdate);
  }, []);

  const handleStoryAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioFileName(file.name);
    setAudioUrl(objectUrl);
    setIsAudioUploading(true);
    setAudioUploadProgress(0);
    setAudioUploadStatusMessage('Firebase Storage-এ আপলোড শুরু হচ্ছে...');
    setIsAudioFirebaseStored(false);

    // Auto-fetch audio duration from file metadata
    const tempAudio = new Audio(objectUrl);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        const totalSec = Math.round(tempAudio.duration);
        setAudioDurationSec(totalSec);
        const mins = Math.max(1, Math.round(totalSec / 60));
        setDurationMins(mins);

        // Auto-select category & default pricing rule based on duration
        if (mins < 10) {
          setLengthCategory('mini');
          setPricingTier('free');
        } else if (mins <= 25) {
          setLengthCategory('medium');
          setPricingTier('pass_included');
        } else {
          setLengthCategory('mega');
          setPricingTier('single_pay');
          setCustomPrice(10);
        }
      }
    };

    try {
      const result = await uploadAudioToFirebaseStorage(file, (info) => {
        setAudioUploadProgress(info.progress);
        if (info.status === 'uploading') {
          setAudioUploadStatusMessage(`Firebase Storage-এ আপলোড হচ্ছে (${info.progress}%)...`);
        } else if (info.status === 'completed') {
          setAudioUploadStatusMessage('Firebase Storage-এ সফলভাবে সংরক্ষিত হয়েছে!');
        } else if (info.status === 'error') {
          setAudioUploadStatusMessage('অডিও আপলোডে সমস্যা হয়েছে');
        }
      });

      if (result.downloadUrl) {
        setAudioUrl(result.downloadUrl);
      }
      setIsAudioFirebaseStored(result.isFirebaseStored);
    } catch (err) {
      console.warn('Audio upload warning:', err);
    } finally {
      setIsAudioUploading(false);
    }
  };

  const handleStoryCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setCoverImage(objectUrl);
    setCoverImageFileName(file.name);
    setIsCoverUploading(true);
    setCoverUploadProgress(0);
    setIsCoverFirebaseStored(false);

    try {
      const result = await uploadCoverToFirebaseStorage(file, (pct) => {
        setCoverUploadProgress(pct);
      });
      if (result.downloadUrl) {
        setCoverImage(result.downloadUrl);
      }
      setIsCoverFirebaseStored(result.isFirebaseStored);
    } catch (err) {
      console.warn('Cover upload warning:', err);
    } finally {
      setIsCoverUploading(false);
    }
  };

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

  // CRM Search & Filters
  const [crmSearch, setCrmSearch] = useState('');
  const [crmStatusFilter, setCrmStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Life Stories Submissions Search & Filter
  const [lifeSearch, setLifeSearch] = useState('');
  const [lifeStatusFilter, setLifeStatusFilter] = useState<'all' | 'new' | 'contacted' | 'recorded'>('all');

  // Narrator Approvals Filters & Feedback
  const [appFilter, setAppFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Joy Payment Settings state
  const [upiId, setUpiId] = useState('joydas21071997@okaxis');
  const [bkashNumber, setBkashNumber] = useState('+880 1712 345678');
  const [paypalEmail, setPaypalEmail] = useState('joydas.21071997@gmail.com');
  const [settingsSaved, setSettingsSaved] = useState(false);

  if (!isOpen) return null;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const totalSeconds = audioDurationSec > 0 ? audioDurationSec : durationMins * 60;
    const quarter = Math.max(1, Math.floor(totalSeconds / 4));

    const newStory: Story = {
      id: `story-custom-${Date.now()}`,
      title: title.trim(),
      tagline: tagline.trim() || 'এক নতুন রোমাঞ্চকর অডিও কাহিনি',
      description: description.trim() || fullStoryText.slice(0, 160) || 'গপ্পো কাহিনী অরিজিনাল অডিও উপস্থাপনা...',
      author: author.trim() || 'জয় (Joy)',
      narrator: narrator.trim() || 'জয় (Joy)',
      voiceStyle: genre === 'ঘুমের গল্প ও প্রশান্তি' ? 'whisper' : 'mysterious',
      genre,
      lengthCategory,
      duration: totalSeconds,
      isLittlePassOnly: pricingTier !== 'free',
      pricingType: pricingTier,
      singlePurchasePrice: (pricingTier === 'single_pay' || pricingTier === 'mega_exclusive') ? customPrice : undefined,
      audioUrl: audioUrl || undefined,
      audioFileName: audioFileName || undefined,
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      colorGradient: genre === 'প্রেম ও রোমান্স (রোমান্টিক গল্প)' ? 'from-rose-950 via-zinc-950 to-black' : 'from-emerald-950 via-zinc-950 to-black',
      releaseDate: new Date().toISOString().split('T')[0],
      rating: 5.0,
      listenCount: 1,
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
    };

    onAddStory(newStory);
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 4000);

    // Reset fields
    setTitle('');
    setTagline('');
    setDescription('');
    setFullStoryText('');
    setAudioFile(null);
    setAudioFileName('');
    setAudioUrl('');
    setAudioDurationSec(0);
    setCoverImageFileName('');
  };

  const handlePublishPodcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podcastTitle.trim() || !speakerName.trim()) return;

    const newEp: LifeStoryEpisode = {
      id: `life-ep-${Date.now()}`,
      title: podcastTitle.trim(),
      speakerName: speakerName.trim(),
      speakerAge: Number(speakerAge) || 45,
      speakerProfession: speakerProfession.trim() || 'সাধারণ মানুষ',
      speakerLocation: speakerLocation.trim() || 'পশ্চিমবঙ্গ',
      duration: podcastDurationSec > 0 ? podcastDurationSec : 900,
      releaseDate: new Date().toISOString().split('T')[0],
      summary: podcastSummary.trim() || `${speakerName}-এর জীবনের না-বলা অভিজ্ঞতার গল্প।`,
      keyQuote: keyQuote.trim() || `“জীবন যেমনই হোক, পথ চলতে থামা যাবে না।”`,
      coverImage: podcastCoverImage || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      audioUrl: podcastAudioUrl || undefined,
      tags: ['বাস্তব অভিজ্ঞতা', 'অনুপ্রেরণা', 'জীবন কথা'],
      listenCount: 1,
      featured: true,
    };

    if (onAddLifeStoryEpisode) {
      onAddLifeStoryEpisode(newEp);
    }

    try {
      const stored = localStorage.getItem('goppo_custom_life_stories');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newEp);
      localStorage.setItem('goppo_custom_life_stories', JSON.stringify(list));
      window.dispatchEvent(new Event('goppo_life_stories_updated'));
    } catch {}

    setPodcastPublishSuccess(true);
    setTimeout(() => setPodcastPublishSuccess(false), 4000);

    setPodcastTitle('');
    setSpeakerName('');
    setKeyQuote('');
    setPodcastSummary('');
    setSpeakerLocation('');
    setSpeakerProfession('');
    setPodcastAudioFile(null);
    setPodcastAudioName('');
    setPodcastAudioUrl('');
    setPodcastDurationSec(0);
  };

  const handleMarkMessageRead = (msgId: string) => {
    const updated = contactMessages.map((m) =>
      m.id === msgId ? { ...m, status: (m.status === 'read' ? 'unread' : 'read') as 'read' | 'unread' } : m
    );
    setContactMessages(updated);
    localStorage.setItem('goppo_contact_messages', JSON.stringify(updated));
    window.dispatchEvent(new Event('goppo_contact_messages_updated'));
  };

  const handleDeleteMessage = (msgId: string) => {
    const updated = contactMessages.filter((m) => m.id !== msgId);
    setContactMessages(updated);
    localStorage.setItem('goppo_contact_messages', JSON.stringify(updated));
    window.dispatchEvent(new Event('goppo_contact_messages_updated'));
  };

  // Filtered Subscribers safely guarded
  const filteredSubscribers = (subscribers || []).filter((s) => {
    if (!s) return false;
    const sName = String(s.name || '').toLowerCase();
    const sEmail = String(s.email || '').toLowerCase();
    const sPhone = String(s.phone || (s as any).phoneNumber || '');
    const sWhatsapp = String(s.whatsapp || s.phone || (s as any).phoneNumber || '');
    const sTxn = String(s.transactionId || (s as any).utrNumber || '').toLowerCase();
    const q = (crmSearch || '').toLowerCase();

    const matchesSearch =
      !q ||
      sName.includes(q) ||
      sEmail.includes(q) ||
      sPhone.includes(q) ||
      sWhatsapp.includes(q) ||
      sTxn.includes(q);

    const sStatus = s.verificationStatus || ((s as any).status === 'verified' ? 'verified' : 'pending_verification');
    const matchesStatus =
      crmStatusFilter === 'all'
        ? true
        : crmStatusFilter === 'verified'
        ? sStatus === 'verified'
        : sStatus === 'pending_verification';

    return matchesSearch && matchesStatus;
  });

  // Filtered Life Stories Submissions
  const filteredLifeSubmissions = lifeStorySubmissions.filter((sub) => {
    const matchesSearch =
      sub.fullName.toLowerCase().includes(lifeSearch.toLowerCase()) ||
      sub.location.toLowerCase().includes(lifeSearch.toLowerCase()) ||
      sub.storyTitle.toLowerCase().includes(lifeSearch.toLowerCase()) ||
      sub.whatsapp.includes(lifeSearch) ||
      sub.phone.includes(lifeSearch);

    const matchesStatus =
      lifeStatusFilter === 'all'
        ? true
        : sub.status === lifeStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtered Narrator Applications
  const filteredApplications = narratorApplications.filter((app) => {
    if (appFilter === 'all') return true;
    return app.status === appFilter;
  });

  const pendingNarratorsCount = narratorApplications.filter((a) => a.status === 'pending').length;
  const newLifeStoriesCount = lifeStorySubmissions.filter((s) => s.status === 'new').length;
  const pendingSubscribersCount = subscribers.filter((s) => s.verificationStatus === 'pending_verification').length;

  const copyAllEmails = () => {
    const emails = subscribers.map((s) => s.email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  const copyTextToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const exportCSV = () => {
    const headers = 'ID,Name,Email,WhatsApp,Phone,Country,Tier,Amount,Currency,Method,TransactionID,Status,Date\n';
    const rows = subscribers
      .map(
        (s) =>
          `"${s.id}","${s.name}","${s.email}","${s.whatsapp || s.phone}","${s.phone}","${s.country}","${s.tier}","${s.amount}","${s.currency}","${s.method}","${s.transactionId || ''}","${s.verificationStatus}","${s.date}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `goppokahini_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-3xl border border-zinc-700 bg-zinc-950 shadow-2xl overflow-hidden my-4">
        
        {/* Top Gold & Emerald Bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-zinc-850"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-6 max-h-[88vh] overflow-y-auto">
          
          {/* Header & Role Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-story text-xl sm:text-2xl font-bold text-white">
                  {isSuperAdmin ? 'জয়-এর ক্রিয়েটর ও অ্যাডমিন স্টুডিও' : 'কথক আপলোড পোর্টাল'}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  isSuperAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {isSuperAdmin ? '👑 সুপার অ্যাডমিন (Joy)' : '🎙️ অনুমোদিত কথক'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isSuperAdmin
                  ? 'গল্প প্রকাশ, পেমেন্ট ও আসল ক্রেতা CRM, জীবন কথা পডকাস্ট আবেদন এবং কথক অনুমোদন।'
                  : `লগইন আছেন: ${creatorSession?.name} (${creatorSession?.email})`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onOpenStandaloneAdmin && isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenStandaloneAdmin();
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-900/40 px-3 py-1.5 text-xs text-purple-200 hover:bg-purple-800/50 hover:text-white transition-colors cursor-pointer"
                  title="সম্পূর্ণ স্ক্রিন স্বতন্ত্র অ্যাডমিন পোর্টালে যান"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-pink-400" />
                  <span>ফুলস্ক্রিন অ্যাডমিন পোর্টাল</span>
                </button>
              )}

              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-900/50 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>লগআউট</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-zinc-850 pb-3">
            {/* Premier: Payments & Subscription Management (Joy Super Admin Only) */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all relative ${
                  activeTab === 'payments'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-950/40'
                    : 'text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-750'
                }`}
              >
                <Crown className={`h-3.5 w-3.5 ${activeTab === 'payments' ? 'fill-black text-black' : 'text-amber-400'}`} />
                <span>পেমেন্ট ও UTR ভেরিফিকেশন</span>
                {paymentTransactions.filter(t => t.status === 'pending').length > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-black text-white">
                    {paymentTransactions.filter(t => t.status === 'pending').length}
                  </span>
                )}
              </button>
            )}

            {/* 1. Upload */}
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/60'
              }`}
            >
              <UploadCloud className="h-3.5 w-3.5 text-emerald-400" />
              <span>গল্প ও পডকাস্ট আপলোড</span>
            </button>

            {/* 2. User Messages & Feedback Inbox (Joy Super Admin Only) */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('inbox')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all relative ${
                  activeTab === 'inbox'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/60'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                <span>শ্রোতাদের বার্তা ও অভিযোগ</span>
                {contactMessages.filter(m => m.status === 'unread').length > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-black text-white">
                    {contactMessages.filter(m => m.status === 'unread').length}
                  </span>
                )}
              </button>
            )}

            {/* 3. Paid Customers & Verification (Joy Super Admin Only) */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('crm')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all relative ${
                  activeTab === 'crm'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/60'
                }`}
              >
                <Users className="h-3.5 w-3.5 text-amber-400" />
                <span>👑 ক্রেতা ও পেমেন্ট তালিকা</span>
                <span className="rounded-full bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-300">
                  {subscribers.length}
                </span>
                {pendingSubscribersCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-black">
                    {pendingSubscribersCount}
                  </span>
                )}
              </button>
            )}

            {/* 4. Life Stories Podcast Submissions (Joy Super Admin Only) */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('lifestories')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all relative ${
                  activeTab === 'lifestories'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/60'
                }`}
              >
                <Mic className="h-3.5 w-3.5 text-teal-400" />
                <span>🎙️ জীবন কথা পডকাস্ট আবেদন</span>
                {newLifeStoriesCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                    {newLifeStoriesCount}
                  </span>
                )}
              </button>
            )}

            {/* 5. Narrator Approvals (Joy Super Admin Only) */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('approvals')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all relative ${
                  activeTab === 'approvals'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/60'
                }`}
              >
                <KeyRound className="h-3.5 w-3.5 text-purple-400" />
                <span>কথক আবেদন</span>
                {pendingNarratorsCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                    {pendingNarratorsCount}
                  </span>
                )}
              </button>
            )}

            {/* 6. Payment Settings (Joy Super Admin Only) */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-zinc-800 text-white border border-zinc-600'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/60'
                }`}
              >
                <Settings className="h-3.5 w-3.5 text-zinc-400" />
                <span>QR ও পেমেন্ট সেটিংস</span>
              </button>
            )}

            {/* 7. About Us & Team Management (Joy Super Admin Only) */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('about_mission')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all relative ${
                  activeTab === 'about_mission'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/60'
                }`}
              >
                <Users className="h-3.5 w-3.5 text-purple-300" />
                <span>আমাদের কথা ও টিম এডিট</span>
                <span className="rounded-full bg-zinc-800 px-1.5 py-0.2 text-[10px] text-green-300 font-mono">
                  {aboutMissionData.teamMembers.length}
                </span>
              </button>
            )}

            {/* Legal & Support Policies (Super Admin) */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('legal_support')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all relative ${
                  activeTab === 'legal_support'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/60'
                }`}
              >
                <Scale className="h-3.5 w-3.5 text-purple-300" />
                <span>আইন, পলিসি ও সহায়তা</span>
              </button>
            )}

            {/* Guidelines (For Approved Narrators) */}
            {!isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('guidelines')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  activeTab === 'guidelines'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/60'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 text-teal-400" />
                <span>কথক নির্দেশিকা</span>
              </button>
            )}
          </div>

          {/* TAB 0: PAYMENTS & SUBSCRIPTIONS MANAGEMENT (Super Admin Joy Only) */}
          {activeTab === 'payments' && isSuperAdmin && (
            <div className="mt-5">
              <AdminPaymentManagement
                transactions={paymentTransactions}
                onApprovePayment={onApprovePayment}
                onRejectPayment={onRejectPayment}
                onApproveRefund={onApproveRefund}
                onRejectRefund={onRejectRefund}
                onCompleteRefund={onCompleteRefund}
                upiConfig={upiConfig}
                onUpdateUpiConfig={onUpdateUpiConfig}
                activityLogs={adminActivityLogs}
              />
            </div>
          )}

          {/* TAB 1: STORY & PODCAST UPLOAD */}
          {activeTab === 'upload' && (
            <div className="mt-5 space-y-5">
              
              {/* Sub-Section Switcher: Audio Stories vs Life Story Podcasts */}
              <div className="flex items-center justify-between p-2 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadSubSection('story')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      uploadSubSection === 'story'
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-950/40'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Music className="h-3.5 w-3.5" />
                    <span>অডিও গল্প আপলোড (Stories)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadSubSection('podcast')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      uploadSubSection === 'podcast'
                        ? 'bg-teal-500 text-black shadow-md shadow-teal-950/40'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>জীবন কথা পডকাস্ট আপলোড (Podcast)</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-400 pr-2">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span>সরাসরি MP3 অডিও ফাইল আপলোড করুন</span>
                </div>
              </div>

              {/* A. STORY UPLOAD FORM */}
              {uploadSubSection === 'story' && (
                <div>
                  {publishSuccess && (
                    <div className="mb-5 rounded-2xl border border-emerald-500 bg-emerald-950/60 p-4 text-center animate-fadeIn">
                      <p className="text-sm font-bold text-emerald-300 flex items-center justify-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>গল্পটি সফলভাবে গপ্পো কাহিনীতে প্রকাশ করা হয়েছে! অডিও ও কভার যুক্ত হয়েছে।</span>
                      </p>
                    </div>
                  )}

                  <form onSubmit={handlePublish} className="space-y-4">
                    
                    {/* 1. AUDIO FILE UPLOAD (Core User Request - Firebase Storage & 100% Real Audio) */}
                    <div className="rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-950/15 p-4 transition-all hover:border-emerald-500/70">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <FileAudio className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-white">গল্পের অডিও ফাইল আপলোড (MP3 / WAV / M4A)</span>
                              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                                Firebase Storage সংযুক্ত
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              আপনার আসল কণ্ঠস্বর বা অডিও রেকর্ড আপলোড করুন। গল্পটিতে কোনো এআই টিটিএস থাকবে না — শ্রোতারা আপনার আপলোড করা অরিজিনাল অডিও শুনবেন।
                            </p>
                          </div>
                        </div>

                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 text-xs font-bold transition-all shadow-md shrink-0">
                          {isAudioUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-black" />
                              <span>আপলোড হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-4 w-4" />
                              <span>MP3 ফাইল আপলোড</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="audio/mp3,audio/wav,audio/m4a,audio/mpeg,audio/*"
                            onChange={handleStoryAudioUpload}
                            disabled={isAudioUploading}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Firebase Storage Progress Bar */}
                      {isAudioUploading && (
                        <div className="mt-3 rounded-xl bg-zinc-900/90 border border-emerald-500/30 p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>{audioUploadStatusMessage || 'Firebase Storage-এ সংরক্ষিত হচ্ছে...'}</span>
                            </span>
                            <span className="text-white font-mono font-bold">{audioUploadProgress}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                              style={{ width: `${Math.max(5, audioUploadProgress)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Uploaded Audio Info & Immediate Preview Player */}
                      {audioUrl && (
                        <div className="mt-3.5 pt-3 border-t border-emerald-900/40 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 rounded-xl p-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (!audioPreviewRef.current) return;
                                if (isAudioPreviewPlaying) {
                                  audioPreviewRef.current.pause();
                                  setIsAudioPreviewPlaying(false);
                                } else {
                                  audioPreviewRef.current.play();
                                  setIsAudioPreviewPlaying(true);
                                }
                              }}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black hover:scale-105 transition-transform"
                              title="টেস্ট প্লে করুন"
                            >
                              {isAudioPreviewPlaying ? <Pause className="h-4 w-4 fill-black" /> : <Play className="h-4 w-4 fill-black ml-0.5" />}
                            </button>
                            <audio
                              ref={audioPreviewRef}
                              src={audioUrl}
                              onEnded={() => setIsAudioPreviewPlaying(false)}
                              className="hidden"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-emerald-300 truncate max-w-xs sm:max-w-md">
                                {audioFileName || 'audio_story_track.mp3'}
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                চিহ্নিত দৈর্ঘ্য: <span className="text-white font-bold">{Math.floor(audioDurationSec / 60)} মিনিট {audioDurationSec % 60} সেকেন্ড</span> ({audioDurationSec}s)
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border ${
                              isAudioFirebaseStored
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              <span>{isAudioFirebaseStored ? 'Firebase Storage-এ লাইভ' : 'প্লেব্যাকের জন্য প্রস্তুত'}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setAudioFile(null);
                                setAudioFileName('');
                                setAudioUrl('');
                                setAudioDurationSec(0);
                                setIsAudioPreviewPlaying(false);
                                setIsAudioFirebaseStored(false);
                              }}
                              className="text-zinc-500 hover:text-rose-400 p-1"
                              title="অডিও সরান"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Optional Direct Audio URL */}
                      <div className="mt-2.5">
                        <input
                          type="url"
                          placeholder="অথবা অনলাইন অডিও URL লিঙ্ক থাকলে পেস্ট করুন (যেমন: Firebase Storage URL / https://.../story.mp3)"
                          value={audioUrl.startsWith('blob:') ? '' : audioUrl}
                          onChange={(e) => {
                            setAudioUrl(e.target.value);
                            setAudioFileName(e.target.value.split('/').pop() || 'online_audio.mp3');
                          }}
                          className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-1.5 text-[11px] text-zinc-300 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 2. COVER IMAGE / THUMBNAIL UPLOAD */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800">
                            <img
                              src={coverImage}
                              alt="Cover Preview"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">গল্পের কভার ছবি / থাম্বনেইল আপলোড</span>
                              {isCoverFirebaseStored && (
                                <span className="text-[10px] text-teal-400 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-800/40 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Firebase Storage-এ সংরক্ষিত</span>
                                </span>
                              )}
                              {coverImageFileName && !isCoverFirebaseStored && (
                                <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                                  {coverImageFileName}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              গল্পের মনমুগ্ধকর পোস্টার বা কভার ফটো আপলোড করুন (Firebase Storage-এ সংরক্ষিত হবে)।
                            </p>
                          </div>
                        </div>

                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white px-3 py-1.5 text-xs font-bold transition-all shrink-0">
                          {isCoverUploading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                              <span>আপলোড হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                              <span>ছবি বাছুন</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleStoryCoverUpload}
                            disabled={isCoverUploading}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Cover upload progress */}
                      {isCoverUploading && (
                        <div className="mt-2.5 space-y-1">
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>ছবি আপলোড হচ্ছে...</span>
                            <span>{coverUploadProgress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${coverUploadProgress}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="mt-2.5">
                        <input
                          type="url"
                          placeholder="অথবা কভার ছবির সরাসরি URL লিঙ্ক দিন..."
                          value={coverImage.startsWith('blob:') ? '' : coverImage}
                          onChange={(e) => setCoverImage(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[11px] text-zinc-300 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 3. CATEGORY & GENRE DROPDOWNS (Requested Dropdowns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Category Dropdown */}
                      <div>
                        <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                          <span>গল্পের বিভাগ ও সময়সীমা <span className="text-rose-400">*</span></span>
                          <span className="text-[10px] text-emerald-400 font-normal">ড্রপডাউন নির্বাচন</span>
                        </label>
                        <select
                          value={lengthCategory}
                          onChange={(e) => {
                            const val = e.target.value as 'mini' | 'medium' | 'mega';
                            setLengthCategory(val);
                            if (val === 'mini') {
                              setDurationMins(6);
                              setPricingTier('free');
                            } else if (val === 'medium') {
                              setDurationMins(15);
                              setPricingTier('pass_included');
                            } else {
                              setDurationMins(35);
                              setPricingTier('single_pay');
                              setCustomPrice(10);
                            }
                          }}
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="mini">⚡ মিনি গল্প (&lt; ১০ মিনিট) — সাধারণত ফ্রি</option>
                          <option value="medium">📖 মাঝারি গল্প (১০ - ২৫ মিনিট) — ২০ টাকার পাস বা ৫/১০ টাকায় বিক্রি</option>
                          <option value="mega">🎙️ বড় মেগা সিরিজ (২৫+ মিনিট) — একক পেইড ক্রয় / মেগা এক্সক্লুসিভ</option>
                        </select>
                      </div>

                      {/* Genre Dropdown */}
                      <div>
                        <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                          <span>জনরা / গল্পের ধরন <span className="text-rose-400">*</span></span>
                          <span className="text-[10px] text-amber-400 font-normal">ড্রপডাউন নির্বাচন</span>
                        </label>
                        <select
                          value={genre}
                          onChange={(e) => setGenre(e.target.value as StoryGenre)}
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="প্রেম ও রোমান্স (রোমান্টিক গল্প)">💖 প্রেম ও রোমান্স (রোমান্টিক গল্প)</option>
                          <option value="ভৌতিক ও অলৌকিক">👻 ভৌতিক ও অলৌকিক</option>
                          <option value="রহস্য ও গোয়েন্দা">🔍 রহস্য ও গোয়েন্দা</option>
                          <option value="রোমাঞ্চ ও থ্রিলার">⚡ রোমাঞ্চ ও থ্রিলার</option>
                          <option value="ঘুমের গল্প ও প্রশান্তি">🌙 ঘুমের গল্প ও প্রশান্তি</option>
                          <option value="ঐতিহাসিক ও লোকগাথা">📜 ঐতিহাসিক ও লোকগাথা</option>
                        </select>
                      </div>

                    </div>

                    {/* 4. PRICING TIERS & MONETIZATION POLICY (As Requested by Joy) */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-amber-400" />
                          <span className="text-xs font-bold text-white">মূল্য নির্ধারণ ও প্রবেশাধিকার নীতি (Pricing Tier)</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">জয় দা-এর নির্ধারিত নিয়ম</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        
                        {/* Option 1: Free */}
                        <label
                          className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                            pricingTier === 'free'
                              ? 'border-emerald-500 bg-emerald-500/15 text-white ring-1 ring-emerald-500'
                              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400">🟢 সম্পূর্ণ ফ্রি</span>
                            <input
                              type="radio"
                              name="pricingTier"
                              value="free"
                              checked={pricingTier === 'free'}
                              onChange={() => setPricingTier('free')}
                              className="accent-emerald-500"
                            />
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1">
                            কোনো টাকা লাগবে না, সব শ্রোতা বিনা পয়সায় শুনতে পারবেন।
                          </p>
                        </label>

                        {/* Option 2: 20 Rs Pass Included */}
                        <label
                          className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                            pricingTier === 'pass_included'
                              ? 'border-amber-500 bg-amber-500/15 text-white ring-1 ring-amber-500'
                              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400">🟡 ২০ টাকার পাস</span>
                            <input
                              type="radio"
                              name="pricingTier"
                              value="pass_included"
                              checked={pricingTier === 'pass_included'}
                              onChange={() => setPricingTier('pass_included')}
                              className="accent-amber-500"
                            />
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1">
                            যাঁরা মাসিক ₹২০ লিটল পাস নেবেন, তাঁরা এই গল্প আনলক পাবেন।
                          </p>
                        </label>

                        {/* Option 3: Single Purchase (₹5 or ₹10) */}
                        <label
                          className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                            pricingTier === 'single_pay'
                              ? 'border-cyan-500 bg-cyan-500/15 text-white ring-1 ring-cyan-500'
                              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-cyan-400">🟠 একক ক্রয় (₹৫ / ₹১০)</span>
                            <input
                              type="radio"
                              name="pricingTier"
                              value="single_pay"
                              checked={pricingTier === 'single_pay'}
                              onChange={() => setPricingTier('single_pay')}
                              className="accent-cyan-500"
                            />
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1">
                            মাঝারি গল্প শুধু ₹৫ বা ₹১০ দিয়ে আলাদাভাবে কেনা যাবে।
                          </p>
                        </label>

                        {/* Option 4: Mega Exclusive */}
                        <label
                          className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                            pricingTier === 'mega_exclusive'
                              ? 'border-rose-500 bg-rose-500/15 text-white ring-1 ring-rose-500'
                              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-400">🔴 মেগা এক্সক্লুসিভ</span>
                            <input
                              type="radio"
                              name="pricingTier"
                              value="mega_exclusive"
                              checked={pricingTier === 'mega_exclusive'}
                              onChange={() => setPricingTier('mega_exclusive')}
                              className="accent-rose-500"
                            />
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1">
                            বড় থ্রিলার মেগা সিরিজের জন্য বিশেষ মূল্য নির্ধারণ।
                          </p>
                        </label>

                      </div>

                      {/* Custom Price Select for Single Purchase / Mega Exclusive */}
                      {(pricingTier === 'single_pay' || pricingTier === 'mega_exclusive') && (
                        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                          <span className="text-xs text-zinc-300 font-bold">একক ক্রয়ের মূল্য সেট করুন:</span>
                          <div className="flex items-center gap-2">
                            {[5, 10, 15, 20].map((price) => (
                              <button
                                key={price}
                                type="button"
                                onClick={() => setCustomPrice(price)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  customPrice === price
                                    ? 'bg-amber-500 text-black shadow'
                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                              >
                                ₹{price}
                              </button>
                            ))}
                            <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-700">
                              <span className="text-xs text-zinc-400">₹</span>
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={customPrice}
                                onChange={(e) => setCustomPrice(Number(e.target.value))}
                                className="w-12 bg-transparent text-xs text-white focus:outline-none text-center font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 5. TITLE & TAGLINE */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-zinc-300">
                          গল্পের নাম (Title) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: কুয়াশা ঘেরা নীলকুঠির রহস্য"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-300">এক লাইনে আকর্ষণীয় ট্যাগলাইন</label>
                        <input
                          type="text"
                          placeholder="যেমন: মাঝরাতের ঘন কুয়াশায় পথ ভুলে অচেনা বাড়িতে এক রাতের গল্প..."
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 6. AUTHOR & NARRATOR */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-zinc-300">লেখক / রচয়িতা</label>
                        <input
                          type="text"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-300">কথক / উপস্থাপক</label>
                        <input
                          type="text"
                          value={narrator}
                          onChange={(e) => setNarrator(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 7. STORY SCRIPT / FULL TEXT */}
                    <div>
                      <label className="text-xs font-bold text-zinc-300">গল্পের স্ক্রিপ্ট বা সারসংক্ষেপ</label>
                      <textarea
                        rows={3}
                        placeholder="শ্রোতাদের পড়ার জন্য কাহিনির ভূমিকা বা সারসংক্ষেপ..."
                        value={fullStoryText}
                        onChange={(e) => setFullStoryText(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none leading-relaxed resize-none"
                      />
                    </div>

                    {/* Submit Story Action */}
                    <div className="pt-3 border-t border-zinc-850 flex items-center justify-between">
                      <div className="text-xs text-zinc-400 space-x-2">
                        <span>দৈর্ঘ্য: <strong className="text-emerald-400">{durationMins} মিনিট</strong></span>
                        <span>•</span>
                        <span>অডিও: <strong className={audioUrl ? 'text-emerald-400' : 'text-amber-400'}>{audioUrl ? 'সংযুক্ত' : 'যুক্ত করুন'}</strong></span>
                      </div>

                      <button
                        type="submit"
                        className="rounded-2xl bg-gradient-to-r from-emerald-500 via-amber-500 to-amber-400 px-6 py-2.5 text-xs sm:text-sm font-bold text-black hover:opacity-95 transition-all shadow-lg flex items-center gap-2"
                      >
                        <UploadCloud className="h-4 w-4" />
                        <span>গল্পটি প্রকাশ করুন</span>
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* B. LIFE STORY PODCAST UPLOAD FORM */}
              {uploadSubSection === 'podcast' && (
                <div>
                  {podcastPublishSuccess && (
                    <div className="mb-5 rounded-2xl border border-teal-500 bg-teal-950/60 p-4 text-center animate-fadeIn">
                      <p className="text-sm font-bold text-teal-300 flex items-center justify-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>জীবন কথা পডকাস্ট এপিসোডটি সফলভাবে প্রকাশ করা হয়েছে!</span>
                      </p>
                    </div>
                  )}

                  <form onSubmit={handlePublishPodcast} className="space-y-4">
                    
                    {/* Podcast Audio Upload with Firebase Storage */}
                    <div className="rounded-2xl border-2 border-dashed border-teal-500/40 bg-teal-950/15 p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                            <Mic className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">পডকাস্ট অডিও ফাইল আপলোড (MP3)</span>
                              <span className="rounded-full bg-teal-500/20 border border-teal-500/40 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                                Firebase Storage
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              মানুষের জীবনের আসল রেকর্ডকৃত সাক্ষাৎকারের অডিও ফাইল আপলোড করুন।
                            </p>
                          </div>
                        </div>

                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-black px-4 py-2 text-xs font-bold transition-all shadow-md shrink-0">
                          {isPodcastAudioUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-black" />
                              <span>আপলোড হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-4 w-4" />
                              <span>পডকাস্ট অডিও বাছুন</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handlePodcastAudioUpload}
                            disabled={isPodcastAudioUploading}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Podcast upload progress */}
                      {isPodcastAudioUploading && (
                        <div className="mt-3 rounded-xl bg-zinc-900/90 border border-teal-500/30 p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-teal-400 font-semibold">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>{podcastUploadStatusMessage || 'Firebase Storage-এ পডকাস্ট আপলোড হচ্ছে...'}</span>
                            </span>
                            <span className="text-white font-mono font-bold">{podcastAudioUploadProgress}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300 rounded-full"
                              style={{ width: `${Math.max(5, podcastAudioUploadProgress)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {podcastAudioUrl && (
                        <div className="mt-3 pt-3 border-t border-teal-900/40 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 rounded-xl p-3">
                          <div>
                            <p className="text-xs font-bold text-teal-300 truncate max-w-sm">
                              {podcastAudioName || 'podcast_episode.mp3'}
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              দৈর্ঘ্য: {Math.floor(podcastDurationSec / 60)} মিনিট {podcastDurationSec % 60} সেকেন্ড
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-teal-400 font-semibold bg-teal-950/60 border border-teal-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{isPodcastFirebaseStored ? 'Firebase Storage-এ লাইভ' : 'প্রস্তুত'}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setPodcastAudioFile(null);
                                setPodcastAudioName('');
                                setPodcastAudioUrl('');
                                setPodcastDurationSec(0);
                                setIsPodcastFirebaseStored(false);
                              }}
                              className="text-zinc-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Speaker Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-zinc-300">
                          পডকাস্টের শিরোনাম <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: শূন্য থেকে সফলতার গল্প: এক কৃষকের লড়াই"
                          value={podcastTitle}
                          onChange={(e) => setPodcastTitle(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-300">
                          বক্তার নাম <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: সুবল মণ্ডল"
                          value={speakerName}
                          onChange={(e) => setSpeakerName(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-zinc-300">বয়স</label>
                        <input
                          type="number"
                          value={speakerAge}
                          onChange={(e) => setSpeakerAge(Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-300">পেশা</label>
                        <input
                          type="text"
                          placeholder="যেমন: প্রাক্তন শিক্ষক"
                          value={speakerProfession}
                          onChange={(e) => setSpeakerProfession(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-300">ঠিকানা / জেলা</label>
                        <input
                          type="text"
                          placeholder="যেমন: বর্ধমান, পশ্চিমবঙ্গ"
                          value={speakerLocation}
                          onChange={(e) => setSpeakerLocation(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300">অনুপ্রেরণামূলক উক্তি (Key Quote)</label>
                      <input
                        type="text"
                        placeholder="যেমন: জীবন যেমনই হোক, সততা ও পরিশ্রম থাকলে একদিন পথ পাওয়া যায়।"
                        value={keyQuote}
                        onChange={(e) => setKeyQuote(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300">পডকাস্টের সারসংক্ষেপ</label>
                      <textarea
                        rows={3}
                        placeholder="এই এপিসোডে কী কী বিশেষ অভিজ্ঞতার কথা বলা হয়েছে..."
                        value={podcastSummary}
                        onChange={(e) => setPodcastSummary(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white focus:border-teal-500 focus:outline-none resize-none"
                      />
                    </div>

                    {/* Submit Podcast Action */}
                    <div className="pt-3 border-t border-zinc-850 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">
                        মানুষের বাস্তব অভিজ্ঞতার পডকাস্ট
                      </span>

                      <button
                        type="submit"
                        className="rounded-2xl bg-teal-500 hover:bg-teal-400 px-6 py-2.5 text-xs sm:text-sm font-bold text-black transition-all shadow-lg flex items-center gap-2"
                      >
                        <Mic className="h-4 w-4" />
                        <span>পডকাস্ট এপিসোড প্রকাশ করুন</span>
                      </button>
                    </div>

                  </form>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: PAID CUSTOMERS & CRM (Super Admin Joy Only) */}
          {activeTab === 'crm' && isSuperAdmin && (
            <div className="mt-5 space-y-5">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5">
                  <div className="text-[11px] font-medium text-zinc-400">মোট ক্রেতা / সাবস্ক্রাইবার</div>
                  <div className="text-xl font-bold text-white mt-1">{subscribers.length} জন</div>
                </div>

                <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-3.5">
                  <div className="text-[11px] font-medium text-emerald-400">ভারত (₹20 UPI)</div>
                  <div className="text-xl font-bold text-emerald-300 mt-1">
                    {subscribers.filter((s) => s.country === 'India').length} জন
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-900/40 bg-sky-950/20 p-3.5">
                  <div className="text-[11px] font-medium text-sky-400">বাংলাদেশ (৳25 bKash)</div>
                  <div className="text-xl font-bold text-sky-300 mt-1">
                    {subscribers.filter((s) => s.country === 'Bangladesh').length} জন
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-3.5">
                  <div className="text-[11px] font-medium text-amber-400">যাচাইকরণ বাকি (Pending)</div>
                  <div className="text-xl font-bold text-amber-300 mt-1">
                    {pendingSubscribersCount} জন
                  </div>
                </div>
              </div>

              {/* Action Bar: Search, Status Filter, Export */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="নাম, ইমেইল, WhatsApp বা UTR খুঁজুন..."
                      value={crmSearch}
                      onChange={(e) => setCrmSearch(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>

                  <select
                    value={crmStatusFilter}
                    onChange={(e) => setCrmStatusFilter(e.target.value as any)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 px-3 text-xs text-zinc-300 focus:outline-none"
                  >
                    <option value="all">সকল অবস্থা</option>
                    <option value="verified">🟢 অনুমোদিত (Verified)</option>
                    <option value="pending">🟡 যাচাই বাকি (Pending)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={copyAllEmails}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:bg-zinc-800 transition-colors"
                  >
                    {copiedEmails ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-amber-400" />}
                    <span>ইমেইল কপি ({subscribers.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={exportCSV}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-3 py-1.5 text-xs font-bold text-black shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>CSV ডাউনলোড</span>
                  </button>
                </div>
              </div>

              {/* Paying Customer Records Table */}
              <div className="overflow-x-auto rounded-2xl border border-zinc-850 bg-zinc-950">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-800 bg-zinc-900/70 text-zinc-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">গ্রাহকের নাম ও ইমেইল</th>
                      <th className="px-4 py-3 font-semibold">আসল হোয়াটসঅ্যাপ ও ফোন</th>
                      <th className="px-4 py-3 font-semibold">দেশ ও প্ল্যান</th>
                      <th className="px-4 py-3 font-semibold">পেমেন্ট UTR / TrxID</th>
                      <th className="px-4 py-3 font-semibold">অবস্থা (Status)</th>
                      <th className="px-4 py-3 font-semibold text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {filteredSubscribers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                          কোনো ক্রেতার তথ্য পাওয়া যায়নি
                        </td>
                      </tr>
                    ) : (
                      filteredSubscribers.map((sub) => {
                        const cleanWa = (sub.whatsapp || sub.phone || '').replace(/\D/g, '');
                        const waLink = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
                          `নমস্কার ${sub.name}! গপ্পো কাহিনীতে আপনার পাস ও সাবস্ক্রিপশন সফলভাবে অনুমোদিত হয়েছে। যেকোনো গল্পের জন্য আমাদের জানান!`
                        )}`;

                        return (
                          <tr key={sub.id} className="hover:bg-zinc-900/40 transition-colors">
                            {/* Name & Email */}
                            <td className="px-4 py-3">
                              <div className="font-bold text-white">{sub.name}</div>
                              <div className="font-mono text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <span>{sub.email}</span>
                                <button
                                  type="button"
                                  onClick={() => copyTextToClipboard(sub.email, `em-${sub.id}`)}
                                  className="text-zinc-500 hover:text-white"
                                  title="ইমেইল কপি"
                                >
                                  {copiedText === `em-${sub.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                </button>
                              </div>
                            </td>

                            {/* WhatsApp & Calling Phone */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
                                <span>{sub.whatsapp || sub.phone}</span>
                                {cleanWa && (
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 text-[10px] text-emerald-300 hover:bg-emerald-500/30"
                                    title="সরাসরি হোয়াটসঅ্যাপে চ্যাট করুন"
                                  >
                                    <MessageSquare className="h-3 w-3" />
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                              </div>
                              {sub.phone && sub.phone !== sub.whatsapp && (
                                <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-zinc-500" />
                                  <a href={`tel:${sub.phone}`} className="hover:text-white font-mono">{sub.phone}</a>
                                </div>
                              )}
                            </td>

                            {/* Country & Plan */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-white">
                                  {sub.country === 'India' ? '🇮🇳 ভারত' : sub.country === 'Bangladesh' ? '🇧🇩 বাংলাদেশ' : '🌍 গ্লোবাল'}
                                </span>
                              </div>
                              <div className="text-[11px] text-amber-400 font-bold mt-0.5">
                                {sub.currency === 'INR' ? `₹${sub.amount}` : sub.currency === 'BDT' ? `৳${sub.amount}` : `$${sub.amount}`} • {sub.tier}
                              </div>
                            </td>

                            {/* UTR / TrxID */}
                            <td className="px-4 py-3 font-mono">
                              <span className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-zinc-300 select-all">
                                {sub.transactionId || 'সরাসরি পাস'}
                              </span>
                              <div className="text-[10px] text-zinc-500 mt-0.5">{sub.method}</div>
                            </td>

                            {/* Verification Status */}
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                sub.verificationStatus === 'verified'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {sub.verificationStatus === 'verified' ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>ভেরিফাইড</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-3 w-3" />
                                    <span>যাচাইকরণ বাকি</span>
                                  </>
                                )}
                              </span>
                            </td>

                            {/* Actions: Verify / Toggle / Delete */}
                            <td className="px-4 py-3 text-right space-x-1">
                              {sub.verificationStatus === 'pending_verification' ? (
                                <button
                                  type="button"
                                  onClick={() => onUpdateSubscriberStatus(sub.id, 'verified')}
                                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black px-2.5 py-1 text-[11px] font-bold transition-all shadow-sm"
                                  title="পেমেন্ট যাচাই ও পাস সক্রিয় করুন"
                                >
                                  ভেরিফাই করুন
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onUpdateSubscriberStatus(sub.id, 'pending_verification')}
                                  className="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 text-[11px] transition-all"
                                  title="পেন্ডিং মোডে ফিরিয়ে নিন"
                                >
                                  পেন্ডিং করুন
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => onDeleteSubscriber(sub.id)}
                                className="rounded-xl p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                                title="রেকর্ড মুছে ফেলুন"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: LIFE STORIES PODCAST SUBMISSIONS (Joy Super Admin Only) */}
          {activeTab === 'lifestories' && isSuperAdmin && (
            <div className="mt-5 space-y-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif-story text-base font-bold text-white flex items-center gap-2">
                    <Mic className="h-4 w-4 text-teal-400" />
                    <span>শ্রোতা ও সাধারণ মানুষের জীবন কথা প্রস্তাব ({lifeStorySubmissions.length})</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    পডকাস্টের জন্য যাদের অভিজ্ঞতা পছন্দ হবে তাদের সরাসরি হোয়াটসঅ্যাপে মেসেজ করুন বা কল করে রেকর্ড শিডিউল করুন।
                  </p>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="নাম বা স্থান খুঁজুন..."
                      value={lifeSearch}
                      onChange={(e) => setLifeSearch(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <select
                    value={lifeStatusFilter}
                    onChange={(e) => setLifeStatusFilter(e.target.value as any)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 px-3 text-xs text-zinc-300 focus:outline-none"
                  >
                    <option value="all">সব অবস্থা</option>
                    <option value="new">নতুন আবেদন</option>
                    <option value="contacted">যোগাযোগ হয়েছে</option>
                    <option value="recorded">রেকর্ড সম্পন্ন</option>
                  </select>
                </div>
              </div>

              {/* Submissions List */}
              <div className="space-y-3">
                {filteredLifeSubmissions.length === 0 ? (
                  <div className="rounded-2xl border border-zinc-850 bg-zinc-950 p-8 text-center text-zinc-500 text-xs">
                    কোনো জীবন কথা আবেদন পাওয়া যায়নি।
                  </div>
                ) : (
                  filteredLifeSubmissions.map((item) => {
                    const cleanWa = item.whatsapp.replace(/\D/g, '');
                    const inviteMsg = `নমস্কার ${item.fullName}! গপ্পো কাহিনী অরিজিনাল পডকাস্টের পক্ষ থেকে জয় বলছি। আপনার জীবনের অভিজ্ঞতা (${item.storyTitle}) আমাদের খুব স্পর্শ করেছে। আমরা আপনার সঙ্গে একটি ছোট অডিও সেশন রেকর্ড করতে চাই। আপনি কি আগামী কয়েকদিনের মধ্যে সুবিধাজনক সময় জানাতে পারবেন?`;
                    const waInviteLink = `https://wa.me/${cleanWa}?text=${encodeURIComponent(inviteMsg)}`;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 space-y-3 transition-all hover:border-zinc-700"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{item.fullName}</span>
                              <span className="text-xs text-zinc-400">({item.age} বছর)</span>
                              <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                                item.status === 'new'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : item.status === 'contacted'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              }`}>
                                {item.status === 'new' ? 'নতুন প্রস্তাব' : item.status === 'contacted' ? 'আমন্ত্রিত' : 'রেকর্ড সম্পন্ন'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 mt-1">
                              <span className="flex items-center gap-1 text-amber-400">
                                <Briefcase className="h-3 w-3" />
                                {item.profession}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-emerald-400">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                              </span>
                              <span>•</span>
                              <span className="text-zinc-500">তারিখ: {item.submittedDate}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {cleanWa && (
                              <a
                                href={waInviteLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black px-3 py-1.5 text-xs font-bold transition-all shadow-sm"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>WhatsApp মেসেজ</span>
                              </a>
                            )}

                            <a
                              href={`tel:${item.phone || item.whatsapp}`}
                              className="p-1.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
                              title="কল করুন"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => onDeleteLifeStorySubmission(item.id)}
                              className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Story Subject & Details */}
                        <div>
                          <h4 className="font-serif-story text-sm font-bold text-amber-300">
                            {item.storyTitle}
                          </h4>
                          <p className="text-xs text-zinc-300 mt-1 leading-relaxed bg-black/40 p-3 rounded-xl border border-zinc-850">
                            {item.storySummary}
                          </p>
                        </div>

                        {/* Status update & Recording preference */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                          <div className="text-zinc-400 text-[11px]">
                            রেকর্ডিং মাধ্যম পছন্দ:{' '}
                            <span className="font-bold text-zinc-200">
                              {item.preferredRecordingMode === 'phone_audio' ? '📞 ফোন কল' : item.preferredRecordingMode === 'online_call' ? '💻 গুগল মিট' : '🎙️ সরাসরি স্টুডিও'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-zinc-400">অবস্থা পরিবর্তন:</span>
                            <button
                              type="button"
                              onClick={() => onUpdateLifeStoryStatus(item.id, 'contacted')}
                              className="rounded-lg bg-zinc-800 px-2 py-1 text-zinc-300 hover:text-white"
                            >
                              যোগাযোগ হয়েছে
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateLifeStoryStatus(item.id, 'recorded')}
                              className="rounded-lg bg-zinc-800 px-2 py-1 text-emerald-400 hover:text-white"
                            >
                              রেকর্ড সম্পন্ন
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB: INBOX - USER MESSAGES & COMPLAINTS (Joy Super Admin Only) */}
          {activeTab === 'inbox' && isSuperAdmin && (
            <div className="mt-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif-story text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    <span>শ্রোতাদের বার্তা, মতামত ও অভিযোগ ({contactMessages.length})</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    শ্রোতারা &quot;গপ্পো কাহিনী সম্পর্কে&quot; ফর্মের মাধ্যমে যেসব মতামত ও অভিযোগ পাঠিয়েছেন তা সরাসরি এখানে দেখতে পারবেন।
                  </p>
                </div>

                {contactMessages.filter(m => m.status === 'unread').length > 0 && (
                  <span className="self-start sm:self-auto rounded-full bg-blue-500/20 border border-blue-500/40 px-3 py-1 text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{contactMessages.filter(m => m.status === 'unread').length}টি অপঠিত বার্তা</span>
                  </span>
                )}
              </div>

              {/* Search & Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="নাম, ইমেইল বা বার্তার লেখা খুঁজুন..."
                    value={inboxSearch}
                    onChange={(e) => setInboxSearch(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['all', 'unread', 'feedback', 'complaint', 'payment_issue', 'story_request'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setInboxCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                        inboxCategoryFilter === cat
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {cat === 'all' && 'সবগুলো'}
                      {cat === 'unread' && 'অপঠিত'}
                      {cat === 'feedback' && 'মতামত'}
                      {cat === 'complaint' && 'অভিযোগ'}
                      {cat === 'payment_issue' && 'পেমেন্ট'}
                      {cat === 'story_request' && 'গল্পের অনুরোধ'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages List */}
              <div className="space-y-3">
                {contactMessages
                  .filter((msg) => {
                    const matchesSearch =
                      msg.senderName.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                      msg.senderEmail.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                      msg.message.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                      (msg.senderPhone && msg.senderPhone.includes(inboxSearch));

                    const matchesCategory =
                      inboxCategoryFilter === 'all'
                        ? true
                        : inboxCategoryFilter === 'unread'
                        ? msg.status === 'unread'
                        : msg.category === inboxCategoryFilter || (inboxCategoryFilter === 'feedback' && msg.category === 'general_feedback');

                    return matchesSearch && matchesCategory;
                  })
                  .length === 0 ? (
                  <div className="rounded-2xl border border-zinc-850 bg-zinc-900/40 p-10 text-center text-zinc-500">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-30" />
                    <p className="text-xs">কোনো বার্তা বা অভিযোগ পাওয়া যায়নি।</p>
                  </div>
                ) : (
                  contactMessages
                    .filter((msg) => {
                      const matchesSearch =
                        msg.senderName.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                        msg.senderEmail.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                        msg.message.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                        (msg.senderPhone && msg.senderPhone.includes(inboxSearch));

                      const matchesCategory =
                        inboxCategoryFilter === 'all'
                          ? true
                          : inboxCategoryFilter === 'unread'
                          ? msg.status === 'unread'
                          : msg.category === inboxCategoryFilter || (inboxCategoryFilter === 'feedback' && msg.category === 'general_feedback');

                      return matchesSearch && matchesCategory;
                    })
                    .map((msg) => {
                      const cleanPhone = msg.senderPhone?.replace(/[^0-9]/g, '');
                      const mailtoUrl = `mailto:${msg.senderEmail}?subject=${encodeURIComponent(
                        'Re: গপ্পো কাহিনী - আপনার বার্তার উত্তর'
                      )}&body=${encodeURIComponent(
                        `প্রিয় ${msg.senderName},\n\nগপ্পো কাহিনীতে যোগাযোগ করার জন্য ধন্যবাদ। আপনার বার্তাটি জয় দা নিজে পেয়েছেন।\n\n[এখানে আপনার উত্তর লিখুন]\n\nশুভেচ্ছান্তে,\nজয় (Joy)\nপ্রতিষ্ঠাতা ও ক্রিয়েটর, গপ্পো কাহিনী\njoydas.21071997@gmail.com`
                      )}`;

                      return (
                        <div
                          key={msg.id}
                          className={`rounded-2xl border p-4 transition-all ${
                            msg.status === 'unread'
                              ? 'border-blue-500/50 bg-blue-950/20 shadow-md shadow-blue-950/20'
                              : 'border-zinc-800 bg-zinc-900/60'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs border border-blue-500/30">
                                {msg.senderName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white">{msg.senderName}</span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                      msg.category === 'complaint'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : msg.category === 'feedback' || msg.category === 'general_feedback'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : msg.category === 'payment_help'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                    }`}
                                  >
                                    {msg.category === 'complaint' && '🔴 অভিযোগ'}
                                    {(msg.category === 'feedback' || msg.category === 'general_feedback') && '🟢 মতামত'}
                                    {msg.category === 'payment_help' && '🟡 পেমেন্ট সাহায্য'}
                                    {msg.category === 'story_request' && '🟣 গল্পের অনুরোধ'}
                                    {msg.category === 'other' && '⚪ অন্যান্য'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                                  <span>{msg.senderEmail}</span>
                                  {msg.senderPhone && (
                                    <>
                                      <span>•</span>
                                      <span className="text-zinc-300">{msg.senderPhone}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <span className="text-[10px] text-zinc-500">
                                {msg.createdAt || msg.timestamp || 'আজ'}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleMarkMessageRead(msg.id)}
                                className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-all ${
                                  msg.status === 'unread'
                                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                }`}
                                title={msg.status === 'unread' ? 'পড়া হয়েছে হিসেবে চিহ্নিত করুন' : 'অপঠিত করুন'}
                              >
                                {msg.status === 'unread' ? 'পড়া হয়েছে' : 'পঠিত'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors"
                                title="বার্তা মুছে ফেলুন"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Message Content */}
                          <div className="mt-3 text-xs text-zinc-200 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-850">
                            {msg.message}
                          </div>

                          {/* Actions: Reply via Email & Reply via WhatsApp */}
                          <div className="mt-3 flex flex-wrap items-center gap-2 justify-end">
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(
                                  `নমস্কার ${msg.senderName}, গপ্পো কাহিনীতে আপনার পাঠানো বার্তার জন্য ধন্যবাদ। জয় দা-এর তরফ থেকে লিখছি...`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black px-3 py-1.5 text-xs font-bold transition-all shadow-sm"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>WhatsApp-এ রিপ্লাই</span>
                              </a>
                            )}

                            <a
                              href={mailtoUrl}
                              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-sm"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              <span>ইমেইলে উত্তর পাঠান</span>
                            </a>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: NARRATOR APPROVALS (Joy Super Admin Only) */}
          {activeTab === 'approvals' && isSuperAdmin && (
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-story text-base font-bold text-white">
                    কথক আবেদন ও অডিশন ({narratorApplications.length})
                  </h3>
                  <p className="text-xs text-zinc-400">
                    যাদের ভয়েস পছন্দ হবে তাদের অনুমোদন কোড দিন যাতে তারা স্টুডিওতে গল্প আপলোড করতে পারেন।
                  </p>
                </div>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAppFilter('pending')}
                    className={`rounded-xl px-3 py-1 text-xs font-bold ${
                      appFilter === 'pending' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    বিবেচনাধীন ({pendingNarratorsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppFilter('approved')}
                    className={`rounded-xl px-3 py-1 text-xs font-bold ${
                      appFilter === 'approved' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    অনুমোদিত
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppFilter('all')}
                    className={`rounded-xl px-3 py-1 text-xs font-bold ${
                      appFilter === 'all' ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    সব
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredApplications.length === 0 ? (
                  <div className="rounded-2xl border border-zinc-850 bg-zinc-950 p-8 text-center text-zinc-500 text-xs">
                    কোনো আবেদন পাওয়া যায়নি।
                  </div>
                ) : (
                  filteredApplications.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white text-sm">{app.fullName}</span>
                          <span className="text-xs text-zinc-400 ml-2">({app.city})</span>
                        </div>
                        <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                          app.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : app.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {app.status === 'approved' ? 'অনুমোদিত' : app.status === 'rejected' ? 'বাতিল' : 'বিবেচনাধীন'}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 italic">{app.experienceBio}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-xs">
                        <div className="font-mono text-[11px] text-zinc-400">
                          ফোন: {app.phone} • {app.email}
                        </div>

                        {app.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const code = `KATHAK-${Math.floor(1000 + Math.random() * 9000)}`;
                                onApproveNarrator(app.id, code);
                              }}
                              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black px-3 py-1 font-bold text-xs"
                            >
                              অনুমোদন করুন
                            </button>
                            <button
                              type="button"
                              onClick={() => onRejectNarrator(app.id)}
                              className="rounded-xl bg-zinc-800 text-rose-400 hover:bg-zinc-700 px-3 py-1 text-xs"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          app.approvalCode && (
                            <div className="font-mono text-emerald-400 text-xs font-bold">
                              লগইন কোড: {app.approvalCode}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENT SETTINGS (Super Admin Joy Only) */}
          {activeTab === 'settings' && isSuperAdmin && (
            <div className="mt-5 max-w-xl space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-amber-400" />
                  <h3 className="font-serif-story text-base font-bold text-white">
                    জয়-এর পেমেন্ট অ্যাকাউন্ট ও QR কোড কনফিগারেশন
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  এখানে দেওয়া UPI ID ও বিকাশ নম্বর সরাসরি ক্রেতাদের সাবস্ক্রিপশন মডালে প্রদর্শিত হয়।
                </p>

                {settingsSaved && (
                  <div className="rounded-xl border border-purple-500/40 bg-purple-950/40 p-2.5 text-xs text-pink-300 font-bold">
                    ✓ সেটিংস সফলভাবে আপডেট হয়েছে!
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    অফিসিয়াল UPI ID (ভারত - GPay, PhonePe, Paytm)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    বিকাশ / নগদ নম্বর (বাংলাদেশ - Send Money)
                  </label>
                  <input
                    type="text"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    PayPal Email (আন্তর্জাতিক পেমেন্ট)
                  </label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSettingsSaved(true);
                    setTimeout(() => setSettingsSaved(false), 3000);
                  }}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 text-xs font-bold transition-colors"
                >
                  সংরক্ষণ করুন
                </button>
              </div>

              {/* Firebase Cloud Services & Google Services JSON Status */}
              {(() => {
                const fbConfig = getFirebaseConfig();
                return (
                  <div className="rounded-2xl border border-purple-900/50 bg-[#160e22] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-pink-400 fill-pink-400" />
                        <h3 className="font-serif-story text-base font-bold text-white">
                          ফায়ারবেস ক্লাউড ও Google Services ইন্টিগ্রেশন
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-pink-500/20 border border-pink-500/40 px-2.5 py-0.5 text-[11px] font-bold text-pink-300">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>সংযুক্ত ও সক্রিয়</span>
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      আপনার প্রদানকৃত <code className="text-pink-400 font-mono">google-services.json</code> থেকে প্রজেক্ট ও অথেনটিকেশন ক্রেডেনশিয়াল সুরক্ষিতভাবে সিস্টেমে যুক্ত করা হয়েছে।
                    </p>

                    <div className="space-y-2 rounded-xl bg-black/80 p-3 text-xs border border-purple-900/30 font-mono">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Project ID:</span>
                        <span className="text-white font-bold">{fbConfig.projectId || 'jd-productions-app'}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Project Number:</span>
                        <span className="text-white">{fbConfig.projectNumber || '451367721746'}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Android Package:</span>
                        <span className="text-pink-400 font-bold">{fbConfig.packageName || 'com.goppo.kahini'}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Database URL:</span>
                        <span className="text-zinc-300 text-[11px] truncate max-w-[240px]">
                          {fbConfig.databaseURL || 'jd-productions-app-default-rtdb.firebaseio.com'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Storage Bucket:</span>
                        <span className="text-zinc-300 text-[11px]">
                          {fbConfig.storageBucket || 'jd-productions-app.firebasestorage.app'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>App ID:</span>
                        <span className="text-zinc-300 text-[10px] truncate max-w-[200px]">
                          {fbConfig.appId || '1:451367721746:web:f5fb54079c746e8d0f31cb'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Admin Secure Password Change Card */}
              <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-purple-300" />
                  <h3 className="font-serif-story text-base font-bold text-white">
                    সুপার অ্যাডমিন গোপন পাসওয়ার্ড পরিবর্তন
                  </h3>
                </div>
                <p className="text-xs text-zinc-300">
                  শুধুমাত্র আপনি (জয়) এই পাসওয়ার্ড দিয়ে অ্যাডমিন প্যানেলে প্রবেশ করতে পারবেন। ডিফল্ট: <span className="font-mono text-pink-300">JoyGoppo@2026</span>
                </p>

                {passwordChangeStatus && (
                  <div className={`rounded-xl p-2.5 text-xs font-bold ${
                    passwordChangeStatus.type === 'success'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {passwordChangeStatus.text}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      বর্তমান পাসওয়ার্ড
                    </label>
                    <input
                      type="password"
                      placeholder="বর্তমান পাসওয়ার্ড দিন"
                      value={currentAdminPasswordInput}
                      onChange={(e) => setCurrentAdminPasswordInput(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      নতুন পাসওয়ার্ড
                    </label>
                    <input
                      type="password"
                      placeholder="নতুন পাসওয়ার্ড লিখুন"
                      value={newAdminPasswordInput}
                      onChange={(e) => setNewAdminPasswordInput(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const storedPass = localStorage.getItem('goppo_admin_secure_password') || 'JoyGoppo@2026';
                    if (currentAdminPasswordInput !== storedPass) {
                      setPasswordChangeStatus({ type: 'error', text: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়!' });
                      return;
                    }
                    if (!newAdminPasswordInput.trim() || newAdminPasswordInput.length < 4) {
                      setPasswordChangeStatus({ type: 'error', text: 'নতুন পাসওয়ার্ড ন্যূনতম ৪ অক্ষরের হতে হবে।' });
                      return;
                    }
                    localStorage.setItem('goppo_admin_secure_password', newAdminPasswordInput.trim());
                    setPasswordChangeStatus({ type: 'success', text: '✓ অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' });
                    setCurrentAdminPasswordInput('');
                    setNewAdminPasswordInput('');
                  }}
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 transition-all shadow-md"
                >
                  পাসওয়ার্ড আপডেট করুন
                </button>
              </div>

            </div>
          )}

          {/* TAB 7: ABOUT US & TEAM MEMBERS MANAGEMENT (Super Admin Joy Only) */}
          {activeTab === 'about_mission' && isSuperAdmin && (
            <div className="mt-5 space-y-6 max-w-3xl">
              
              {/* Header Box */}
              <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-zinc-950 to-black p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
                    <Users className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-serif-story text-lg font-bold text-white">
                      আমাদের কথা, উদ্দেশ্য ও টিম ম্যানেজমেন্ট
                    </h3>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      এখানে কোনো পার্টনার, সহ-প্রতিষ্ঠাতা বা নতুন সদস্যের নাম ও ছবি যোগ করলে তা সরাসরি অ্যাপের "আমাদের কথা ও উদ্দেশ্য" মডালে যুক্ত হয়ে যাবে।
                    </p>
                  </div>
                </div>

                {aboutSaveSuccess && (
                  <div className="mt-3 rounded-xl border border-purple-500/40 bg-purple-950/40 p-2.5 text-xs text-pink-300 font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-400" />
                    <span>✓ আমাদের কথা ও টিম মেম্বারদের তথ্য সফলভাবে সংরক্ষিত হয়েছে!</span>
                  </div>
                )}
              </div>

              {/* 1. Mission Statement Editor */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3.5">
                <h4 className="font-serif-story text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-300" />
                  <span>প্ল্যাটফর্মের উদ্দেশ্য ও বার্তা সম্পাদনা</span>
                </h4>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    শিরোনাম (Mission Title)
                  </label>
                  <input
                    type="text"
                    value={missionTitleInput}
                    onChange={(e) => setMissionTitleInput(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    আমাদের উদ্দেশ্য ও বার্তা (Mission Statement)
                  </label>
                  <textarea
                    rows={4}
                    value={missionStatementInput}
                    onChange={(e) => setMissionStatementInput(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-200 focus:border-purple-400 focus:outline-none leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const updated: AboutMissionData = {
                      ...aboutMissionData,
                      missionTitle: missionTitleInput,
                      missionStatement: missionStatementInput,
                    };
                    setAboutMissionData(updated);
                    localStorage.setItem('goppo_about_mission_data', JSON.stringify(updated));
                    window.dispatchEvent(new Event('goppo_about_mission_updated'));
                    setAboutSaveSuccess(true);
                    setTimeout(() => setAboutSaveSuccess(false), 3000);
                  }}
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-md"
                >
                  উদ্দেশ্য বার্তা সংরক্ষণ করুন
                </button>
              </div>

              {/* 2. Add New Team Member / Partner Form */}
              <div className="rounded-3xl border border-purple-500/20 bg-zinc-900/60 p-5 space-y-4">
                <h4 className="font-serif-story text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-pink-400" />
                  <span>নতুন পার্টনার বা সহকর্মী যোগ করুন</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      পূর্ণ নাম <span className="text-purple-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: অনির্বাণ চক্রবর্তী"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      পদবি / দায়িত্ব <span className="text-purple-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: কো-ফাউন্ডার / ক্রিয়েটিভ পার্টনার"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      ছবির লিংক (Photo URL)
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={newMemberPhoto}
                      onChange={(e) => setNewMemberPhoto(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      যোগাযোগ ইমেইল (ঐচ্ছিক)
                    </label>
                    <input
                      type="email"
                      placeholder="partner@goppokahini.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    সংক্ষিপ্ত পরিচিতি (Bio)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="সদস্যের অভিজ্ঞতা ও দায়িত্ব সম্পর্কে ২-৩ লাইন লিখুন..."
                    value={newMemberBio}
                    onChange={(e) => setNewMemberBio(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="founder-check"
                    checked={newMemberIsFounder}
                    onChange={(e) => setNewMemberIsFounder(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="founder-check" className="text-xs text-zinc-300 cursor-pointer">
                    ইনি কি প্রতিষ্ঠাতা / পার্টনার ক্যাটাগরিতে থাকবেন?
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newMemberName.trim() || !newMemberRole.trim()) {
                      alert('অনুগ্রহ করে নাম এবং পদবি পূরণ করুন।');
                      return;
                    }

                    const newMember: TeamMember = {
                      id: `member-${Date.now()}`,
                      name: newMemberName.trim(),
                      role: newMemberRole.trim(),
                      bio: newMemberBio.trim() || 'গপ্পো কাহিনীর সৃজনশীল সদস্য।',
                      photoUrl: newMemberPhoto.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                      isFounder: newMemberIsFounder,
                      joinedDate: new Date().toISOString().split('T')[0],
                      contactEmail: newMemberEmail.trim() || undefined,
                    };

                    const updated: AboutMissionData = {
                      ...aboutMissionData,
                      teamMembers: [...aboutMissionData.teamMembers, newMember],
                    };

                    setAboutMissionData(updated);
                    localStorage.setItem('goppo_about_mission_data', JSON.stringify(updated));
                    window.dispatchEvent(new Event('goppo_about_mission_updated'));

                    setNewMemberName('');
                    setNewMemberRole('');
                    setNewMemberPhoto('');
                    setNewMemberBio('');
                    setNewMemberEmail('');
                    setNewMemberIsFounder(false);
                    setAboutSaveSuccess(true);
                    setTimeout(() => setAboutSaveSuccess(false), 3000);
                  }}
                  className="rounded-2xl bg-gradient-to-r from-purple-500 to-green-400 px-5 py-2.5 text-xs font-bold text-black shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  + নতুন সদস্য যুক্ত করুন
                </button>
              </div>

              {/* 3. Existing Team Members List */}
              <div className="space-y-3">
                <h4 className="font-serif-story text-base font-bold text-white flex items-center justify-between">
                  <span>বর্তমান টিম সদস্য ও পার্টনারবৃন্দ ({aboutMissionData.teamMembers.length})</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {aboutMissionData.teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={member.name}
                          className="h-12 w-12 rounded-full object-cover border border-purple-500/30"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm">{member.name}</span>
                            {member.isFounder && (
                              <span className="rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 text-[9px] font-bold">
                                পার্টনার
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-pink-300 block">{member.role}</span>
                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{member.bio}</p>
                        </div>
                      </div>

                      {/* Remove button (Cannot remove primary Joy) */}
                      {member.id !== 'member-joy' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`আপনি কি নিশ্চিত যে "${member.name}" কে তালিকা থেকে মুছে ফেলতে চান?`)) {
                              const updated: AboutMissionData = {
                                ...aboutMissionData,
                                teamMembers: aboutMissionData.teamMembers.filter(m => m.id !== member.id),
                              };
                              setAboutMissionData(updated);
                              localStorage.setItem('goppo_about_mission_data', JSON.stringify(updated));
                              window.dispatchEvent(new Event('goppo_about_mission_updated'));
                            }
                          }}
                          className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                          title="সদস্য মুছুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: NARRATOR GUIDELINES */}
          {activeTab === 'guidelines' && !isSuperAdmin && (
            <div className="mt-5 space-y-3 text-xs text-zinc-300">
              <div className="rounded-2xl border border-teal-500/40 bg-teal-950/20 p-4">
                <h3 className="font-serif-story text-base font-bold text-teal-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>গপ্পো কাহিনী কথক গাইডলাইন ও সাউন্ড স্ট্যান্ডার্ড</span>
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  শ্রোতাদের সর্বোচ্চ মানের শ্রুতিসুখ দেওয়ার জন্য গল্প আপলোডের সময় নয়েজবিহীন ও স্পষ্ট অডিও আপলোড করুন।
                </p>
              </div>
            </div>
          )}

          {/* TAB: LEGAL & POLICIES MANAGEMENT */}
          {activeTab === 'legal_support' && isSuperAdmin && (
            <div className="mt-5">
              <AdminLegalSupportManager />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
