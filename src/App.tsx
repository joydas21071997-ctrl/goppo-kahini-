import React, { useState, useEffect } from 'react';
import {
  Crown,
  Sparkles,
  Sliders,
  CheckCircle2,
  Headphones,
  ArrowRight,
  ShieldCheck,
  Clock,
  BookOpen,
  Filter,
  Upload,
  Info,
  Heart,
  Mic,
  Radio,
  Share2,
  Users
} from 'lucide-react';
import {
  Story,
  StoryGenre,
  StoryLengthCategory,
  UserSubscription,
  Bookmark as BookmarkType,
  AmbientTrack,
  ThemeMode,
  SubscriberLead,
  NarratorApplication,
  CreatorSession,
  LifeStoryEpisode,
  LifeStorySubmission,
  PaymentTransaction,
  AdminActivityLog,
  UpiConfig,
  ListeningHistoryItem,
  ItemReview
} from './types';
import { INITIAL_STORIES, AMBIENT_SOUND_TRACKS } from './data/stories';
import { INITIAL_LIFE_STORIES, INITIAL_LIFE_SUBMISSIONS } from './data/lifeStories';
import {
  INITIAL_PAYMENT_TRANSACTIONS,
  INITIAL_ACTIVITY_LOGS,
  DEFAULT_UPI_CONFIG
} from './data/payments';
import { getStoredReviews, saveReview } from './data/reviews';
import { audioEngine } from './services/audioEngine';
import { Navbar } from './components/Navbar';
import { StoryCard } from './components/StoryCard';
import { PlayerBar } from './components/PlayerBar';
import { FullPlayerModal } from './components/FullPlayerModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SubscriptionManagerModal } from './components/SubscriptionManagerModal';
import { AmbientMixerModal } from './components/AmbientMixerModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { MobileBottomNav, MobileNavTab } from './components/MobileBottomNav';
import { AboutModal } from './components/AboutModal';
import { CreatorStudioModal } from './components/CreatorStudioModal';
import { NarratorApplicationModal } from './components/NarratorApplicationModal';
import { CreatorLoginModal } from './components/CreatorLoginModal';
import { LifeStoriesSection } from './components/LifeStoriesSection';
import { LifeStorySubmissionModal } from './components/LifeStorySubmissionModal';
import { ListeningHistoryModal } from './components/ListeningHistoryModal';
import { ItemReviewsModal } from './components/ItemReviewsModal';
import { UserAccountModal } from './components/UserAccountModal';
import { UserAuthModal } from './components/UserAuthModal';
import { SplashScreen } from './components/SplashScreen';
import { AudienceUser } from './types';
import {
  onAudienceAuthStateChanged,
  logoutAudienceUser,
  saveAudienceUser,
} from './services/firebaseAuth';
import { isAuthorizedAdmin } from './services/adminAuth';
import { AdminPortalApp, StandaloneAdminPortal } from './admin';
import { LegalSupportPage } from './components/legal/LegalSupportPage';
import { LegalSupportDropdown } from './components/legal/LegalSupportDropdown';
import { LegalPolicySlug } from './data/legalPolicies';
import {
  subscribeStoriesFromFirestore,
  saveStoryToFirestore,
  deleteStoryFromFirestore,
} from './services/firestoreStories';

// Initial Demo Narrator Applications for Joy to review & approve
const INITIAL_NARRATOR_APPLICATIONS: NarratorApplication[] = [
  {
    id: 'narr-app-1',
    fullName: 'অনিন্দিতা সেন',
    email: 'anindita.sen.voice@gmail.com',
    phone: '+91 98310 44210',
    city: 'কলকাতা',
    preferredGenres: ['ভৌতিক ও অলৌকিক', 'ঘুমের গল্প ও প্রশান্তি'],
    sampleAudioNameOrUrl: 'anindita_bhuter_golpo_audition.mp3',
    recordingEquipment: 'Rode NT1-A কন্ডেনসার মাইক ও হোম স্টুডিও',
    experienceBio: 'গত ৩ বছর ধরে বিভিন্ন অডিও ও ইউটিউব চ্যানেলে ভয়েসওভার দিয়েছি। গা ছমছমে ভৌতিক বর্ণনা ও শান্ত ঘুমপাড়ানি গল্প আমার বিশেষত্ব।',
    status: 'pending',
    appliedDate: '2026-09-02',
  },
  {
    id: 'narr-app-2',
    fullName: 'রাকিবুল হাসান',
    email: 'rakibul.voice.dhaka@gmail.com',
    phone: '+880 1715 889922',
    city: 'ঢাকা',
    preferredGenres: ['রোমাঞ্চ ও থ্রিলার', 'রহস্য ও গোয়েন্দা'],
    sampleAudioNameOrUrl: 'rakibul_suspense_voice_demo.mp3',
    recordingEquipment: 'Blue Yeti Pro USB মাইক ও অ্যাকোস্টিক বুথ',
    experienceBio: 'থ্রিলার ও সাসপেন্সধর্মী উপন্যাসের নাট্যরূপ দিতে ভালোবাসি। স্পষ্ট উচ্চারণ ও দ্রুত ডায়লগ ডেলিভারিতে পারদর্শী।',
    status: 'pending',
    appliedDate: '2026-09-03',
  },
  {
    id: 'narr-app-3',
    fullName: 'সৌম্যদীপ ব্যানার্জী',
    email: 'soumyadeep.b@gmail.com',
    phone: '+91 94321 77650',
    city: 'হাওড়া',
    preferredGenres: ['ঐতিহাসিক ও লোকগাথা', 'বাস্তব ও রূপকথা'],
    sampleAudioNameOrUrl: 'soumya_historical_sample.wav',
    recordingEquipment: 'Fifine K688 ডাইনামিক মাইক',
    experienceBio: 'বাংলার প্রাচীন লোকগাথা ও ভৌতিক কিংবদন্তি উপস্থাপন করি।',
    status: 'approved',
    appliedDate: '2026-08-25',
    approvalCode: 'NARR-2026',
    approvedDate: '2026-08-27',
    approvedBy: 'জয় (Joy)',
  }
];

// Initial Real-World Subscriber Leads for Joy's CRM with WhatsApp and Verification
const INITIAL_LEADS: SubscriberLead[] = [
  {
    id: 'lead-1',
    name: 'শুভম চক্রবর্তী',
    email: 'shubham.kolkata@gmail.com',
    phone: '+91 98301 22419',
    whatsapp: '+91 98301 22419',
    country: 'India',
    tier: 'All Access Pass (monthly)',
    amount: 20,
    currency: 'INR',
    method: 'UPI (GPay)',
    transactionId: 'UPI-32490182741',
    verificationStatus: 'verified',
    date: '2026-08-28',
    optInMarketing: true,
  },
  {
    id: 'lead-2',
    name: 'তানভীর আহমেদ',
    email: 'tanvir.dhaka92@yahoo.com',
    phone: '+880 1712 458921',
    whatsapp: '+880 1712 458921',
    country: 'Bangladesh',
    tier: 'All Access Pass (monthly)',
    amount: 25,
    currency: 'BDT',
    method: 'bKash বিকাশ',
    transactionId: 'BKASH-8A9F0123',
    verificationStatus: 'verified',
    date: '2026-08-29',
    optInMarketing: true,
  },
  {
    id: 'lead-3',
    name: 'অদিতি মুখার্জী',
    email: 'aditi.mukherjee@outlook.com',
    phone: '+91 94330 88712',
    whatsapp: '+91 94330 88712',
    country: 'India',
    tier: 'Single Story (কালীঘাটের প্রাচীন সিন্দুক)',
    amount: 10,
    currency: 'INR',
    method: 'Paytm UPI',
    transactionId: 'PTM-889102431',
    verificationStatus: 'verified',
    date: '2026-08-30',
    optInMarketing: true,
  },
  {
    id: 'lead-4',
    name: 'কবির হাসান',
    email: 'kabir.hasan.ctg@gmail.com',
    phone: '+880 1819 634510',
    whatsapp: '+880 1819 634510',
    country: 'Bangladesh',
    tier: 'All Access Pass (monthly)',
    amount: 25,
    currency: 'BDT',
    method: 'Nagad নগদ',
    transactionId: 'NGD-77821094',
    verificationStatus: 'pending_verification',
    date: '2026-08-31',
    optInMarketing: true,
  },
  {
    id: 'lead-5',
    name: 'Rahul Roy (London)',
    email: 'rahul.roy.uk@gmail.com',
    phone: '+44 7911 123456',
    whatsapp: '+44 7911 123456',
    country: 'International',
    tier: 'All Access Pass (monthly)',
    amount: 0.49,
    currency: 'USD',
    method: 'PayPal',
    transactionId: 'PP-99014821',
    verificationStatus: 'verified',
    date: '2026-09-01',
    optInMarketing: true,
  }
];

export default function App() {
  // --- Persistent Storage State ---
  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('goppo_kahini_custom_stories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_STORIES;
  });

  const [subscribers, setSubscribers] = useState<SubscriberLead[]>(() => {
    const saved = localStorage.getItem('goppo_kahini_subscribers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_LEADS;
  });

  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    const saved = localStorage.getItem('goppo_kahini_subscription');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      status: 'free',
      tier: 'free',
      planName: 'ফ্রি এক্সপ্লোরার',
      price: 0,
      currency: 'INR',
      period: 'month',
      startDate: new Date().toISOString().split('T')[0],
      nextBillingDate: 'N/A',
      unlockedStoryIds: [],
      autoRenew: false,
    };
  });

  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(() => {
    const saved = localStorage.getItem('goppo_kahini_bookmarks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // --- Theme Mode: Calm Green (Default, serene, calming) vs Midnight Dark ---
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('goppo_theme');
    return (saved as ThemeMode) || 'calm-green';
  });

  // --- Active View: Stories (গল্পঘর) or Life Stories (মানুষের জীবন কথা) ---
  const [activeMainView, setActiveMainView] = useState<'stories' | 'lifestories'>('stories');

  // --- Life Stories (আমাদের কথা) State ---
  const [lifeStories, setLifeStories] = useState<LifeStoryEpisode[]>(INITIAL_LIFE_STORIES);
  const [activeLifeStoryId, setActiveLifeStoryId] = useState<string | undefined>(undefined);
  const [isLifeSubmissionModalOpen, setIsLifeSubmissionModalOpen] = useState(false);
  const [lifeStorySubmissions, setLifeStorySubmissions] = useState<LifeStorySubmission[]>(() => {
    const saved = localStorage.getItem('goppo_lifestory_submissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_LIFE_SUBMISSIONS;
  });

  // --- Audio Player State ---
  // Starts as null so bottom screen stays 100% clean until user taps play on a story
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(stories[0]?.duration || 320);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // --- Listening History State (পূর্বে শোনা গল্পের তালিকা) ---
  const [listeningHistory, setListeningHistory] = useState<ListeningHistoryItem[]>(() => {
    const saved = localStorage.getItem('goppo_listening_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  // --- Ambient Soundscapes State ---
  const [ambientTracks, setAmbientTracks] = useState<AmbientTrack[]>(AMBIENT_SOUND_TRACKS);

  // --- UI Filters State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLengthCategory, setSelectedLengthCategory] = useState<StoryLengthCategory>('all');
  const [selectedGenre, setSelectedGenre] = useState<StoryGenre>('All');
  const [accessFilter, setAccessFilter] = useState<'all' | 'free' | 'little_pass'>('all');
  const [mobileTab, setMobileTab] = useState<MobileNavTab>('stories');

  // --- Creator & Narrator Management State ---
  const [creatorSession, setCreatorSession] = useState<CreatorSession | null>(() => {
    const saved = localStorage.getItem('goppo_creator_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  const [narratorApplications, setNarratorApplications] = useState<NarratorApplication[]>(() => {
    const saved = localStorage.getItem('goppo_narrator_applications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_NARRATOR_APPLICATIONS;
  });

  // --- Payment & Subscription Transactions (Joy Super Admin Direct UPI) ---
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('goppo_payment_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_PAYMENT_TRANSACTIONS;
  });

  const [upiConfig, setUpiConfig] = useState<UpiConfig>(() => {
    const saved = localStorage.getItem('goppo_upi_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_UPI_CONFIG;
  });

  const [adminActivityLogs, setAdminActivityLogs] = useState<AdminActivityLog[]>(() => {
    const saved = localStorage.getItem('goppo_admin_activity_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_ACTIVITY_LOGS;
  });

  // --- Opening / Splash Screen State (২–৩ সেকেন্ডের জন্য লোগো ও ট্যাগলাইন) ---
  const [showSplash, setShowSplash] = useState(true);

  // --- Modals State ---
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [targetPaywallStory, setTargetPaywallStory] = useState<Story | null>(null);
  const [isSubscriptionManagerOpen, setIsSubscriptionManagerOpen] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isAmbientMixerOpen, setIsAmbientMixerOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isStandaloneAdminOpen, setIsStandaloneAdminOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('admin') === 'true' || window.location.hash === '#admin';
    }
    return false;
  });
  const [isNarratorAppModalOpen, setIsNarratorAppModalOpen] = useState(false);
  const [isCreatorLoginModalOpen, setIsCreatorLoginModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // --- Legal & Support Public Page Routing State ---
  const getPolicySlugFromUrl = (): LegalPolicySlug | null => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    const search = new URLSearchParams(window.location.search);
    const pageParam = (search.get('page') || search.get('policy') || search.get('legal') || '').toLowerCase();
    const hash = window.location.hash.replace(/^#/, '').toLowerCase();

    const validSlugs: LegalPolicySlug[] = ['privacy-policy', 'terms', 'refund-policy', 'disclaimer', 'contact'];

    if (validSlugs.includes(path as LegalPolicySlug)) return path as LegalPolicySlug;
    if (validSlugs.includes(pageParam as LegalPolicySlug)) return pageParam as LegalPolicySlug;
    if (validSlugs.includes(hash as LegalPolicySlug)) return hash as LegalPolicySlug;

    // Friendly aliases
    if (path === 'privacy' || hash === 'privacy') return 'privacy-policy';
    if (path === 'refund' || hash === 'refund') return 'refund-policy';
    if (path === 'terms-and-conditions' || hash === 'terms-and-conditions') return 'terms';
    if (path === 'support' || hash === 'support' || path === 'contact-us' || hash === 'contact-us') return 'contact';

    return null;
  };

  const [currentPolicyPage, setCurrentPolicyPage] = useState<LegalPolicySlug | null>(() => getPolicySlugFromUrl());

  const handleSelectPolicy = (slug: LegalPolicySlug) => {
    setCurrentPolicyPage(slug);
    if (typeof window !== 'undefined') {
      window.history.pushState({ policy: slug }, '', `/${slug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateHomeFromPolicy = () => {
    setCurrentPolicyPage(null);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync route on popstate and hashchange (Browser back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const slug = getPolicySlugFromUrl();
      setCurrentPolicyPage(slug);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // --- Audience User & Authentication State (শ্রোতা একাউন্ট ও লগইন স্টেট) ---
  const [currentUser, setCurrentUser] = useState<AudienceUser | null>(null);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  const [userAuthReason, setUserAuthReason] = useState<'play_story' | 'take_pass' | 'library' | 'general'>('general');
  const [userAuthMessage, setUserAuthMessage] = useState<string | undefined>(undefined);
  const [isUserAccountOpen, setIsUserAccountOpen] = useState(false);
  const [pendingPlayStory, setPendingPlayStory] = useState<Story | null>(null);

  // Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = onAudienceAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore Stories real-time synchronization
  useEffect(() => {
    const unsubscribe = subscribeStoriesFromFirestore((firestoreStories) => {
      if (firestoreStories && firestoreStories.length > 0) {
        setStories(firestoreStories);
        localStorage.setItem('goppo_kahini_custom_stories', JSON.stringify(firestoreStories));
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleOpenUserAuth = (
    reason: 'play_story' | 'take_pass' | 'library' | 'general' = 'general',
    message?: string
  ) => {
    setUserAuthReason(reason);
    setUserAuthMessage(message);
    setIsUserAuthOpen(true);
  };

  const handleUserAuthSuccess = (user: AudienceUser) => {
    setCurrentUser(user);
    setIsUserAuthOpen(false);

    // Restore user-specific ₹20 pass if exists in account
    const userSubKey = `goppo_user_sub_${user.uid}`;
    const savedUserSub = localStorage.getItem(userSubKey);
    let userHasActivePass = user.hasTwentyTakaPass || false;
    if (savedUserSub) {
      try {
        const parsed = JSON.parse(savedUserSub);
        if (parsed && parsed.status === 'active') {
          setSubscription(parsed);
          localStorage.setItem('goppo_kahini_subscription', JSON.stringify(parsed));
          userHasActivePass = true;
        }
      } catch {}
    }

    // Context Retention: If user intended to get the ₹20 Monthly Pass before login,
    // immediately route them to the existing ₹20 Monthly Pass Payment Page
    if (userAuthReason === 'take_pass') {
      setIsSubscriptionModalOpen(true);
    } else if (userAuthReason === 'play_story' && pendingPlayStory) {
      const storyToPlay = pendingPlayStory;
      setPendingPlayStory(null);
      const isSub = subscription?.status === 'active' || userHasActivePass;
      if (storyToPlay.isLittlePassOnly && !isSub) {
        setTargetPaywallStory(storyToPlay);
        setIsSubscriptionModalOpen(true);
      } else {
        handlePlayStoryDirect(storyToPlay);
      }
    }
  };

  // Dedicated ₹20 Monthly Pass User Flow:
  // If Logged Out: Home/Menu -> Click Pass -> Login/Register -> on success -> Existing ₹20 Pass Payment Page
  // If Logged In: Home/Menu -> Click Pass -> Directly open Existing ₹20 Pass Payment Page
  const handleOpenSubscriptionFlow = (targetStory?: Story | null) => {
    setTargetPaywallStory(targetStory || null);
    if (!currentUser) {
      handleOpenUserAuth(
        'take_pass',
        '২০ টাকার মাসিক পাস নিতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন বা সাইন আপ করুন।'
      );
    } else {
      setIsSubscriptionModalOpen(true);
    }
  };

  const handleLogoutUser = async () => {
    await logoutAudienceUser();
    setCurrentUser(null);
    // Reset guest session to default free plan
    const guestSub: UserSubscription = {
      status: 'free',
      tier: 'free',
      planName: 'ফ্রি এক্সপ্লোরার',
      price: 0,
      currency: 'INR',
      period: 'month',
      startDate: new Date().toISOString().split('T')[0],
      nextBillingDate: 'N/A',
      unlockedStoryIds: [],
      autoRenew: false,
    };
    setSubscription(guestSub);
    localStorage.removeItem('goppo_kahini_subscription');
  };

  // --- Reviews & 5-Star Ratings State ---
  const [reviews, setReviews] = useState<ItemReview[]>(getStoredReviews);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [activeReviewTarget, setActiveReviewTarget] = useState<{
    id: string;
    title: string;
    type: 'story' | 'life_story';
  } | null>(null);

  const handleOpenReviews = (itemId: string, itemTitle: string, itemType: 'story' | 'life_story') => {
    setActiveReviewTarget({ id: itemId, title: itemTitle, type: itemType });
    setIsReviewsModalOpen(true);
  };

  const handleAddReview = (newReview: ItemReview) => {
    const updated = saveReview(newReview);
    setReviews(updated);
  };

  // Secret Admin Access: Check URL parameters on mount (?admin=joy, ?admin=1, #admin)
  useEffect(() => {
    const checkAdminUrl = () => {
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
        search.includes('admin=joy') ||
        search.includes('admin=1') ||
        search.includes('admin=true') ||
        hash.includes('admin')
      ) {
        setIsCreatorLoginModalOpen(true);
      }
    };
    checkAdminUrl();
    window.addEventListener('hashchange', checkAdminUrl);
    return () => window.removeEventListener('hashchange', checkAdminUrl);
  }, []);

  // Sync reviews when updated from other components
  useEffect(() => {
    const handleReviewsUpdate = () => {
      setReviews(getStoredReviews());
    };
    window.addEventListener('goppo_reviews_updated', handleReviewsUpdate);
    return () => window.removeEventListener('goppo_reviews_updated', handleReviewsUpdate);
  }, []);

  // Secret click handler for Joy (3 clicks opens secret admin modal)
  const [secretAdminClicks, setSecretAdminClicks] = useState(0);
  const handleSecretAdminTrigger = () => {
    setSecretAdminClicks((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setIsCreatorLoginModalOpen(true);
        return 0;
      }
      return next;
    });
  };

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('goppo_listening_history', JSON.stringify(listeningHistory));
  }, [listeningHistory]);
  useEffect(() => {
    localStorage.setItem('goppo_payment_transactions', JSON.stringify(paymentTransactions));
  }, [paymentTransactions]);

  useEffect(() => {
    localStorage.setItem('goppo_upi_config', JSON.stringify(upiConfig));
  }, [upiConfig]);

  useEffect(() => {
    localStorage.setItem('goppo_admin_activity_logs', JSON.stringify(adminActivityLogs));
  }, [adminActivityLogs]);

  useEffect(() => {
    localStorage.setItem('goppo_creator_session', JSON.stringify(creatorSession));
  }, [creatorSession]);

  useEffect(() => {
    localStorage.setItem('goppo_narrator_applications', JSON.stringify(narratorApplications));
  }, [narratorApplications]);

  useEffect(() => {
    localStorage.setItem('goppo_lifestory_submissions', JSON.stringify(lifeStorySubmissions));
  }, [lifeStorySubmissions]);

  useEffect(() => {
    localStorage.setItem('goppo_kahini_subscription', JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem('goppo_kahini_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('goppo_kahini_custom_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('goppo_kahini_subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  useEffect(() => {
    localStorage.setItem('goppo_theme', theme);
  }, [theme]);

  // Audio Engine Callbacks Setup
  useEffect(() => {
    audioEngine.setCallbacks(
      (time, lineIndex) => {
        setCurrentTime(time);
        setCurrentLineIndex(lineIndex);

        // Free preview cutoff check (45 seconds preview for locked stories)
        const isSubscribed = subscription?.status === 'active';
        const isUnlockedIndividually = currentStory ? subscription?.unlockedStoryIds?.includes(currentStory.id) : false;
        
        if (
          currentStory?.isLittlePassOnly &&
          !isSubscribed &&
          !isUnlockedIndividually &&
          time >= 45
        ) {
          audioEngine.pause();
          setIsPlaying(false);
          setTargetPaywallStory(currentStory);
          setIsSubscriptionModalOpen(true);
        }
      },
      () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentLineIndex(0);
      },
      (playing) => {
        setIsPlaying(playing);
      }
    );
  }, [currentStory, subscription]);

  // Sleep Timer Countdown Tick
  useEffect(() => {
    if (sleepTimerRemaining === null) return;
    const interval = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          audioEngine.pause();
          setIsPlaying(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerRemaining]);

  // Load story changes
  useEffect(() => {
    if (currentStory) {
      audioEngine.loadStory(currentStory.transcript, currentStory.duration, 0, currentStory.audioUrl);
      setDuration(currentStory.duration);
    }
  }, [currentStory]);

  // --- Playback Handlers ---
  const handlePlayStoryDirect = (story: Story) => {
    if (!currentStory || currentStory.id !== story.id) {
      setCurrentStory(story);
      setCurrentTime(0);
      setCurrentLineIndex(0);
      setDuration(story.duration);
      audioEngine.loadStory(story.transcript, story.duration, 0, story.audioUrl);
    }
    audioEngine.play();
    setIsPlaying(true);

    // Record to Listening History (পূর্বে শোনা গল্পের তালিকা)
    setListeningHistory((prev) => {
      const filtered = prev.filter((item) => item.storyId !== story.id);
      const newItem: ListeningHistoryItem = {
        id: `hist-${Date.now()}`,
        storyId: story.id,
        storyTitle: story.title,
        narrator: story.narrator,
        genre: story.genre,
        coverImage: story.coverImage,
        lastPlayedAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('bn-BD'),
        duration: story.duration,
      };
      return [newItem, ...filtered].slice(0, 30);
    });
  };

  const handlePlayStory = (story: Story) => {
    // 1. Mandatory Login Check (ব্যবহারকারী লগইন না থাকলে লগইন ডায়লগ প্রদর্শন)
    if (!currentUser) {
      setPendingPlayStory(story);
      handleOpenUserAuth(
        'play_story',
        'গল্প শুনতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন বা রেজিস্টার করুন।'
      );
      return;
    }

    // 2. Premium Pass Check (যদি প্রিমিয়াম গল্প হয় এবং পাস সক্রিয় না থাকে)
    const isUnlocked = subscription?.status === 'active' || subscription?.unlockedStoryIds?.includes(story.id);
    if (story.isLittlePassOnly && !isUnlocked) {
      setTargetPaywallStory(story);
      setIsSubscriptionModalOpen(true);
      return;
    }

    // 3. Play Direct
    handlePlayStoryDirect(story);
  };

  // Completely clear and close the playing story to maintain a 100% clean interface
  const handleDismissPlayer = () => {
    audioEngine.pause();
    setIsPlaying(false);
    setCurrentStory(null);
  };

  // Play a story directly from listening history
  const handlePlayFromHistory = (storyId: string) => {
    const foundStory = stories.find((s) => s.id === storyId);
    if (foundStory) {
      handlePlayStory(foundStory);
      setIsHistoryModalOpen(false);
      return;
    }
    // Also check life stories
    const foundLife = lifeStories.find((e) => e.id === storyId);
    if (foundLife) {
      handlePlayLifeStory(foundLife);
      setIsHistoryModalOpen(false);
    }
  };

  const handleClearHistory = () => {
    setListeningHistory([]);
  };

  const handleRemoveHistoryItem = (id: string) => {
    setListeningHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLogoutCreator = () => {
    setCreatorSession(null);
    localStorage.removeItem('goppo_creator_session');
  };

  // Play a Life Story Episode seamlessly
  const handlePlayLifeStory = (episode: LifeStoryEpisode) => {
    setActiveLifeStoryId(episode.id);

    const episodeAsStory: Story = {
      id: episode.id,
      title: episode.title,
      tagline: `${episode.speakerName} (${episode.speakerProfession}) • ${episode.speakerLocation}`,
      description: episode.summary,
      author: 'আমাদের কথা পডকাস্ট',
      narrator: `${episode.speakerName} (${episode.speakerAge} বছর)`,
      voiceStyle: 'mysterious',
      genre: 'বাস্তব ও রূপকথা',
      lengthCategory: 'medium',
      duration: episode.duration,
      isLittlePassOnly: false, // Free and open for everyone to listen to real people's voices
      audioUrl: episode.audioUrl,
      coverImage: episode.coverImage,
      colorGradient: 'from-amber-950 via-zinc-950 to-black',
      releaseDate: episode.releaseDate,
      rating: 4.98,
      listenCount: episode.listenCount + 1,
      chapters: [
        { id: 'c1', title: '১. সূচনা ও পরিচয়', timestamp: 0, duration: Math.floor(episode.duration / 3) },
        { id: 'c2', title: '২. জীবনের অবিস্মরণীয় মুহূর্ত', timestamp: Math.floor(episode.duration / 3), duration: Math.floor(episode.duration / 3) },
        { id: 'c3', title: '৩. শিক্ষা ও বর্তমান বার্তা', timestamp: Math.floor((episode.duration / 3) * 2), duration: Math.floor(episode.duration / 3) },
      ],
      transcript: [
        { id: 't1', time: 0, text: `আমাদের কথা পডকাস্টে শুনছেন: ${episode.title}` },
        { id: 't2', time: 15, text: `বক্তা: ${episode.speakerName}, বয়স ${episode.speakerAge} বছর, নিবাস: ${episode.speakerLocation}।` },
        { id: 't3', time: 45, text: episode.keyQuote },
        { id: 't4', time: 75, text: episode.summary },
        { id: 't5', time: 160, text: `মানুষের জীবন কথা — বাংলার সাধারণ মানুষের অসাধারণ অভিজ্ঞতার প্রামাণ্য অডিও।` },
      ],
      fullStoryText: `${episode.title}\n\nবক্তা: ${episode.speakerName} (${episode.speakerAge} বছর)\nপেশা: ${episode.speakerProfession}\nঠিকানা: ${episode.speakerLocation}\n\n${episode.keyQuote}\n\n${episode.summary}`,
    };

    handlePlayStory(episodeAsStory);
  };

  const handlePauseStory = () => {
    audioEngine.pause();
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (!currentStory) return;
    if (isPlaying) {
      handlePauseStory();
    } else {
      handlePlayStory(currentStory);
    }
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  const handleSkipBack = () => {
    handleSeek(Math.max(0, currentTime - 15));
  };

  const handleSkipForward = () => {
    handleSeek(Math.min(duration, currentTime + 15));
  };

  const handleChangeRate = (rate: number) => {
    setPlaybackRate(rate);
    audioEngine.setPlaybackRate(rate);
  };

  const handleChangeVolume = (vol: number) => {
    setVolume(vol);
  };

  const handleSetSleepTimer = (minutes: number | null) => {
    if (minutes === null) {
      setSleepTimerRemaining(null);
    } else {
      setSleepTimerRemaining(minutes * 60);
    }
  };

  // Ambient Mixer Handlers
  const handleToggleAmbientTrack = (id: string) => {
    setAmbientTracks((prev) =>
      prev.map((track) => {
        if (track.id === id) {
          const nextState = !track.isPlaying;
          if (nextState) {
            audioEngine.startAmbientSound(id, track.volume);
          } else {
            audioEngine.stopAmbientSound(id);
          }
          return { ...track, isPlaying: nextState };
        }
        return track;
      })
    );
  };

  const handleChangeAmbientVolume = (id: string, vol: number) => {
    audioEngine.setAmbientVolume(id, vol);
    setAmbientTracks((prev) =>
      prev.map((track) => (track.id === id ? { ...track, volume: vol } : track))
    );
  };

  const handleApplyPreset = (presetName: string) => {
    audioEngine.stopAllAmbients();
    const updated = ambientTracks.map((t) => ({ ...t, isPlaying: false }));

    if (presetName === 'Rainy Hearth') {
      audioEngine.startAmbientSound('rain', 0.35);
      audioEngine.startAmbientSound('campfire', 0.3);
      setAmbientTracks(
        updated.map((t) =>
          t.id === 'rain' || t.id === 'campfire' ? { ...t, isPlaying: true } : t
        )
      );
    } else if (presetName === 'Deep Slumber') {
      audioEngine.startAmbientSound('rain', 0.25);
      audioEngine.startAmbientSound('drone', 0.18);
      setAmbientTracks(
        updated.map((t) =>
          t.id === 'rain' || t.id === 'drone' ? { ...t, isPlaying: true } : t
        )
      );
    } else if (presetName === 'Midnight Coast') {
      audioEngine.startAmbientSound('ocean', 0.3);
      audioEngine.startAmbientSound('wind', 0.25);
      setAmbientTracks(
        updated.map((t) =>
          t.id === 'ocean' || t.id === 'wind' ? { ...t, isPlaying: true } : t
        )
      );
    } else if (presetName === 'Cabin Retreat') {
      audioEngine.startAmbientSound('campfire', 0.35);
      audioEngine.startAmbientSound('wind', 0.25);
      setAmbientTracks(
        updated.map((t) =>
          t.id === 'campfire' || t.id === 'wind' ? { ...t, isPlaying: true } : t
        )
      );
    }
  };

  const handleStopAllAmbients = () => {
    audioEngine.stopAllAmbients();
    setAmbientTracks((prev) => prev.map((t) => ({ ...t, isPlaying: false })));
  };

  // --- Direct UPI Payment & Subscription Lifecycle Actions ---
  // 1. User submits payment with UTR and Screenshot
  const handleSubmitPayment = (txData: Omit<PaymentTransaction, 'id'>) => {
    const newTxId = `tx-${Date.now()}`;
    const newTx: PaymentTransaction = {
      ...txData,
      id: newTxId,
    };

    setPaymentTransactions((prev) => [newTx, ...prev]);

    // Also register in SubscriberLeads CRM for Super Admin Joy
    const newLead: SubscriberLead = {
      id: `lead-${Date.now()}`,
      name: txData.userName,
      email: txData.userEmail,
      phone: txData.userPhone,
      whatsapp: txData.userWhatsapp,
      country: txData.country || 'India',
      tier: txData.planName,
      amount: txData.amount,
      currency: txData.currency,
      method: txData.paymentMethod || 'Direct Bank UPI (jdpro@axisbank)',
      transactionId: txData.utrTransactionId,
      verificationStatus: 'pending_verification',
      date: txData.paymentDate,
      optInMarketing: true,
    };
    setSubscribers((prev) => [newLead, ...prev]);

    // Activate User's subscription immediately upon payment submission
    const isAnnual = txData.planId === 'little_annual';
    const expiryDate = new Date();
    if (isAnnual) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setDate(expiryDate.getDate() + 30);
    }
    const expiryStr = txData.subscriptionExpiryDate || expiryDate.toISOString().split('T')[0];

    const newSub: UserSubscription = {
      status: 'active',
      tier: isAnnual ? 'little_annual' : txData.planId === 'single_story' ? 'single_story' : 'little_monthly',
      planName: txData.planName,
      price: txData.amount,
      currency: txData.currency,
      period: isAnnual ? 'year' : txData.planId === 'single_story' ? 'single' : 'month',
      startDate: txData.paymentDate,
      subscriptionExpiryDate: expiryStr,
      nextBillingDate: expiryStr,
      unlockedStoryIds: txData.targetStoryId ? [txData.targetStoryId] : [],
      autoRenew: false,
      pendingTransactionId: newTxId,
      pendingUtr: txData.utrTransactionId,
      customerName: txData.userName,
      customerEmail: txData.userEmail,
      customerPhone: txData.userPhone,
      customerWhatsapp: txData.userWhatsapp,
    };
    setSubscription(newSub);
    localStorage.setItem('goppo_kahini_subscription', JSON.stringify(newSub));

    if (currentUser) {
      const userSubKey = `goppo_user_sub_${currentUser.uid}`;
      localStorage.setItem(userSubKey, JSON.stringify(newSub));

      const updatedUser: AudienceUser = {
        ...currentUser,
        hasTwentyTakaPass: true,
      };
      setCurrentUser(updatedUser);
      saveAudienceUser(updatedUser);
    }

    // Record activity log
    const now = new Date();
    const timeString = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: AdminActivityLog = {
      id: `log-${Date.now()}`,
      adminName: 'সিস্টেম (সক্রিয় পাস)',
      action: 'submit_payment',
      details: `${txData.userName} (${txData.userPhone || 'গ্রাহক'}) ₹${txData.amount}-এর ২০ টাকার মাসিক পাস সক্রিয় করেছেন (UTR: ${txData.utrTransactionId})।`,
      targetId: newTxId,
      timestamp: timeString,
    };
    setAdminActivityLogs((prev) => [newLog, ...prev]);
  };

  // 2. Admin approves payment
  const handleApprovePayment = (transactionId: string) => {
    const now = new Date();
    const nowStr = now.toISOString().split('T')[0];
    const timeStr = `${nowStr} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    let approvedTx: PaymentTransaction | null = null;

    setPaymentTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          const isAnnual = t.planId === 'little_annual';
          const expiryDate = new Date();
          if (isAnnual) {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          } else {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
          }
          const expiryStr = expiryDate.toISOString().split('T')[0];

          approvedTx = {
            ...t,
            status: 'paid',
            approvedBy: 'জয় (সুপার অ্যাডমিন)',
            approvedDate: timeStr,
            subscriptionStartDate: nowStr,
            subscriptionExpiryDate: expiryStr,
          };
          return approvedTx;
        }
        return t;
      })
    );

    // Update SubscriberLead verification status
    setSubscribers((prev) =>
      prev.map((lead) => {
        if (approvedTx && lead.transactionId === (approvedTx as PaymentTransaction).utrTransactionId) {
          return { ...lead, verificationStatus: 'verified' };
        }
        return lead;
      })
    );

    if (approvedTx) {
      const tx = approvedTx as PaymentTransaction;
      const isAnnual = tx.planId === 'little_annual';
      const expiryDate = new Date();
      if (isAnnual) {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }
      const expiryStr = expiryDate.toISOString().split('T')[0];

      // Activate user subscription
      setSubscription((prev) => ({
        ...prev,
        status: 'active',
        tier: isAnnual ? 'annual' : tx.planId === 'single_story' ? 'single_story' : 'monthly',
        planName: tx.planName,
        price: tx.amount,
        currency: tx.currency,
        period: isAnnual ? 'year' : tx.planId === 'single_story' ? 'lifetime' : 'month',
        startDate: nowStr,
        subscriptionExpiryDate: expiryStr,
        nextBillingDate: expiryStr,
        customerName: tx.userName,
        customerEmail: tx.userEmail,
        customerPhone: tx.userPhone,
        customerWhatsapp: tx.userWhatsapp,
        pendingUtr: undefined,
        pendingTransactionId: undefined,
        unlockedStoryIds: tx.targetStoryId
          ? Array.from(new Set([...(prev.unlockedStoryIds || []), tx.targetStoryId]))
          : prev.unlockedStoryIds || [],
      }));

      // Log in Activity Log
      const log: AdminActivityLog = {
        id: `log-${Date.now()}`,
        adminName: 'জয় (সুপার অ্যাডমিন)',
        action: 'approve_payment',
        details: `${tx.userName}-এর ₹${tx.amount} পেমেন্ট (UTR: ${tx.utrTransactionId}) অনুমোদন করা হয়েছে এবং পাস সক্রিয় করা হয়েছে।`,
        targetId: transactionId,
        timestamp: timeStr,
      };
      setAdminActivityLogs((prev) => [log, ...prev]);

      // If user was waiting for paywalled story, start playback
      if (targetPaywallStory) {
        handlePlayStory(targetPaywallStory);
        setTargetPaywallStory(null);
      }
    }
  };

  // 3. Admin rejects payment
  const handleRejectPayment = (transactionId: string, reason: string) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    let targetTx: PaymentTransaction | null = null;

    setPaymentTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          targetTx = t;
          return {
            ...t,
            status: 'rejected',
            rejectedBy: 'জয় (সুপার অ্যাডমিন)',
            rejectedDate: timeStr,
            rejectionReason: reason,
          };
        }
        return t;
      })
    );

    // Update SubscriberLead verification status
    setSubscribers((prev) =>
      prev.map((lead) => {
        if (targetTx && lead.transactionId === (targetTx as PaymentTransaction).utrTransactionId) {
          return { ...lead, verificationStatus: 'rejected' };
        }
        return lead;
      })
    );

    // If this was current user's pending transaction, revert to free
    setSubscription((prev) => {
      if (prev.pendingTransactionId === transactionId || prev.status === 'pending') {
        return {
          ...prev,
          status: 'free',
          tier: 'free',
          planName: 'ফ্রি এক্সপ্লোরার',
          pendingTransactionId: undefined,
          pendingUtr: undefined,
        };
      }
      return prev;
    });

    // Log in Activity Log
    const log: AdminActivityLog = {
      id: `log-${Date.now()}`,
      adminName: 'জয় (সুপার অ্যাডমিন)',
      action: 'reject_payment',
      details: `${targetTx?.userName || 'গ্রাহক'}-এর পেমেন্ট বাতিল করা হয়েছে। কারণ: ${reason}`,
      targetId: transactionId,
      timestamp: timeStr,
    };
    setAdminActivityLogs((prev) => [log, ...prev]);
  };

  // 4. User requests refund
  const handleRequestRefund = (reason: string) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const latestPaid = paymentTransactions.find((t) => t.status === 'paid');
    if (latestPaid) {
      setPaymentTransactions((prev) =>
        prev.map((t) =>
          t.id === latestPaid.id
            ? {
                ...t,
                status: 'refund_requested',
                refundReason: reason,
                refundRequestedDate: timeStr,
              }
            : t
        )
      );

      const log: AdminActivityLog = {
        id: `log-${Date.now()}`,
        adminName: 'গ্রাহক (ইউজার অনুরোধ)',
        action: 'request_refund',
        details: `${latestPaid.userName} রিফান্ডের অনুরোধ করেছেন (কারণ: ${reason})।`,
        targetId: latestPaid.id,
        timestamp: timeStr,
      };
      setAdminActivityLogs((prev) => [log, ...prev]);
    }
  };

  // 5. Admin approves refund request
  const handleApproveRefund = (transactionId: string) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    const log: AdminActivityLog = {
      id: `log-${Date.now()}`,
      adminName: 'জয় (সুপার অ্যাডমিন)',
      action: 'approve_refund_request',
      details: `রিফান্ডের অনুরোধ অনুমোদন করা হয়েছে (Transaction ID: ${transactionId})। ব্যাংক ট্রান্সফার বাকি।`,
      targetId: transactionId,
      timestamp: timeStr,
    };
    setAdminActivityLogs((prev) => [log, ...prev]);
  };

  // Admin rejects refund request
  const handleRejectRefund = (transactionId: string, reason: string) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    setPaymentTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              status: 'paid',
              rejectionReason: `রিফান্ড বাতিল: ${reason}`,
            }
          : t
      )
    );

    const log: AdminActivityLog = {
      id: `log-${Date.now()}`,
      adminName: 'জয় (সুপার অ্যাডমিন)',
      action: 'reject_refund',
      details: `রিফান্ডের অনুরোধ বাতিল করা হয়েছে (কারণ: ${reason})।`,
      targetId: transactionId,
      timestamp: timeStr,
    };
    setAdminActivityLogs((prev) => [log, ...prev]);
  };

  // 6. Admin completes refund with Bank / UPI details
  const handleCompleteRefund = (
    transactionId: string,
    refundUtr: string,
    refundAmount: number,
    refundNote: string
  ) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    let refundedTx: PaymentTransaction | null = null;

    setPaymentTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          refundedTx = {
            ...t,
            status: 'refunded',
            refundAmount,
            refundDate: timeStr,
            refundUtr,
            refundNote,
          };
          return refundedTx;
        }
        return t;
      })
    );

    // Revoke user's active subscription as refund is completed
    setSubscription((prev) => ({
      ...prev,
      status: 'free',
      tier: 'free',
      planName: 'ফ্রি এক্সপ্লোরার',
      price: 0,
      unlockedStoryIds: [],
    }));

    const log: AdminActivityLog = {
      id: `log-${Date.now()}`,
      adminName: 'জয় (সুপার অ্যাডমিন)',
      action: 'complete_refund',
      details: `${refundedTx?.userName || 'গ্রাহক'}-কে ₹${refundAmount} রিফান্ড ব্যাংক মারফত সম্পন্ন (Refund UTR: ${refundUtr})। প্রিমিয়াম অ্যাক্সেস প্রত্যাহার করা হয়েছে।`,
      targetId: transactionId,
      timestamp: timeStr,
    };
    setAdminActivityLogs((prev) => [log, ...prev]);
  };

  // 7. User cancels subscription
  const handleCancelSubscription = (reason?: string) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    setSubscription((prev) => ({
      ...prev,
      status: 'cancelled',
      autoRenew: false,
    }));

    const latestPaid = paymentTransactions.find((t) => t.status === 'paid');
    if (latestPaid) {
      setPaymentTransactions((prev) =>
        prev.map((t) =>
          t.id === latestPaid.id
            ? {
                ...t,
                status: 'cancelled',
                cancellationDate: timeStr,
                cancellationReason: reason || 'ব্যবহারকারী স্বেচ্ছায় বাতিল করেছেন',
              }
            : t
        )
      );
    }

    const log: AdminActivityLog = {
      id: `log-${Date.now()}`,
      adminName: 'গ্রাহক (ব্যবহারকারী নিজে)',
      action: 'cancel_subscription',
      details: `সাবস্ক্রিপশন বাতিল করা হয়েছে। কারণ: ${reason || 'স্বেচ্ছায় বাতিল'}`,
      targetId: latestPaid?.id || 'sub-cancel',
      timestamp: timeStr,
    };
    setAdminActivityLogs((prev) => [log, ...prev]);
  };

  // 8. Update UPI Config
  const handleUpdateUpiConfig = (newConfig: UpiConfig) => {
    setUpiConfig(newConfig);
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    const log: AdminActivityLog = {
      id: `log-${Date.now()}`,
      adminName: 'জয় (সুপার অ্যাডমিন)',
      action: 'update_upi_settings',
      details: `অফিসিয়াল UPI ID (${newConfig.upiId}) ও পেমেন্ট নির্দেশিকা আপডেট করা হয়েছে।`,
      targetId: 'upi-config',
      timestamp: timeStr,
    };
    setAdminActivityLogs((prev) => [log, ...prev]);
  };

  // Subscriber CRM Updates
  const handleUpdateSubscriberStatus = (subscriberId: string, status: 'verified' | 'pending_verification' | 'rejected') => {
    setSubscribers((prev) =>
      prev.map((s) => (s.id === subscriberId ? { ...s, verificationStatus: status } : s))
    );
  };

  const handleDeleteSubscriber = (subscriberId: string) => {
    setSubscribers((prev) => prev.filter((s) => s.id !== subscriberId));
  };

  // Life Story Handlers
  const handleLifeStorySubmit = (
    submission: Omit<LifeStorySubmission, 'id' | 'submittedDate' | 'status'>
  ) => {
    const newSub: LifeStorySubmission = {
      ...submission,
      id: `life-sub-${Date.now()}`,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'new',
    };
    setLifeStorySubmissions((prev) => [newSub, ...prev]);
  };

  const handleUpdateLifeStoryStatus = (
    submissionId: string,
    status: 'new' | 'contacted' | 'recorded' | 'archived'
  ) => {
    setLifeStorySubmissions((prev) =>
      prev.map((item) => (item.id === submissionId ? { ...item, status } : item))
    );
  };

  const handleDeleteLifeStorySubmission = (submissionId: string) => {
    setLifeStorySubmissions((prev) => prev.filter((item) => item.id !== submissionId));
  };

  // Story Publishing
  const handleAddNewStory = (newStory: Story) => {
    setStories((prev) => {
      const updated = [newStory, ...prev.filter((s) => s.id !== newStory.id)];
      localStorage.setItem('goppo_kahini_custom_stories', JSON.stringify(updated));
      return updated;
    });
  };

  // Narrator Auditions / Applications
  const handleSubmitNarratorApplication = (
    application: Omit<NarratorApplication, 'id' | 'status' | 'appliedDate'>
  ) => {
    const newApp: NarratorApplication = {
      ...application,
      id: `narr-app-${Date.now()}`,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };
    setNarratorApplications((prev) => [newApp, ...prev]);
  };

  const handleApproveNarrator = (appId: string, approvalCode: string) => {
    setNarratorApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'approved',
              approvalCode,
              approvedDate: new Date().toISOString().split('T')[0],
              approvedBy: 'জয় (Joy)',
            }
          : a
      )
    );
  };

  const handleRejectNarrator = (appId: string) => {
    setNarratorApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'rejected' } : a))
    );
  };

  const handleDeleteNarratorApp = (appId: string) => {
    setNarratorApplications((prev) => prev.filter((a) => a.id !== appId));
  };

  // Creator Session Handlers
  const handleCreatorLoginSuccess = (session: CreatorSession) => {
    setCreatorSession(session);
    setIsStudioOpen(true);
  };

  const handleCreatorLogout = () => {
    setCreatorSession(null);
    localStorage.removeItem('goppo_creator_session');
    setIsStudioOpen(false);
  };

  const handleOpenStudioRequest = () => {
    if (isAuthorizedAdmin(creatorSession, currentUser)) {
      setIsStudioOpen(true);
    } else {
      setIsCreatorLoginModalOpen(true);
    }
  };

  // Bookmarks
  const handleToggleBookmark = (story: Story, note?: string) => {
    const existing = bookmarks.find(
      (b) => b.storyId === story.id && Math.abs(b.timestamp - currentTime) < 5
    );
    if (existing) {
      setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
    } else {
      const newBm: BookmarkType = {
        id: `bm-${Date.now()}`,
        storyId: story.id,
        storyTitle: story.title,
        timestamp: Math.round(currentTime),
        chapterTitle: story.chapters[0]?.title || 'শুরু',
        note: note || '',
        createdAt: new Date().toLocaleDateString('bn-IN'),
      };
      setBookmarks((prev) => [newBm, ...prev]);
    }
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handlePlayAtBookmark = (story: Story, timestamp: number) => {
    setCurrentStory(story);
    setCurrentTime(timestamp);
    audioEngine.loadStory(story.transcript, story.duration, timestamp);
    audioEngine.seek(timestamp);
    audioEngine.play();
    setIsPlaying(true);
  };

  // Mobile Bottom Nav Handler
  const handleSelectMobileTab = (tab: MobileNavTab) => {
    setMobileTab(tab);
    if (tab === 'ambience') {
      setIsAmbientMixerOpen(true);
    } else if (tab === 'bookmarks') {
      if (!currentUser) {
        handleOpenUserAuth('library', 'সংরক্ষিত গল্প দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।');
        return;
      }
      setIsBookmarksOpen(true);
    } else if (tab === 'subscription') {
      if (currentUser && subscription?.status === 'active') {
        setIsUserAccountOpen(true);
      } else {
        handleOpenSubscriptionFlow(null);
      }
    } else if (tab === 'lifestories') {
      if (currentPolicyPage) handleNavigateHomeFromPolicy();
      setActiveMainView('lifestories');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'stories') {
      if (currentPolicyPage) handleNavigateHomeFromPolicy();
      setActiveMainView('stories');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filtered stories logic (Search + Length Category + Genre + Access)
  const filteredStories = stories.filter((story) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = story.title.toLowerCase().includes(q);
      const matchAuthor = story.author.toLowerCase().includes(q);
      const matchNarrator = story.narrator.toLowerCase().includes(q);
      const matchGenre = story.genre.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchNarrator && !matchGenre) {
        return false;
      }
    }

    // Length category filter
    if (selectedLengthCategory !== 'all' && story.lengthCategory !== selectedLengthCategory) {
      return false;
    }

    // Genre filter
    if (selectedGenre !== 'All' && story.genre !== selectedGenre) {
      return false;
    }

    // Access filter
    if (accessFilter === 'free' && story.isLittlePassOnly) return false;
    if (accessFilter === 'little_pass' && !story.isLittlePassOnly) return false;

    return true;
  });

  const genres: { label: string; value: StoryGenre }[] = [
    { label: 'সব ধারা', value: 'All' },
    { label: 'ভৌতিক ও অলৌকিক', value: 'ভৌতিক ও অলৌকিক' },
    { label: 'রহস্য ও গোয়েন্দা', value: 'রহস্য ও গোয়েন্দা' },
    { label: 'রোমাঞ্চ ও থ্রিলার', value: 'রোমাঞ্চ ও থ্রিলার' },
    { label: 'ঘুমের গল্প ও প্রশান্তি', value: 'ঘুমের গল্প ও প্রশান্তি' },
    { label: 'ঐতিহাসিক ও লোকগাথা', value: 'ঐতিহাসিক ও লোকগাথা' },
    { label: 'বাস্তব ও রূপকথা', value: 'বাস্তব ও রূপকথা' },
  ];

  // Theme styling definitions - Light Purple background, Pink accents, Soft Black containers
  const themeContainerClass =
    'bg-[#201132] text-zinc-100 selection:bg-pink-500/30 selection:text-pink-300';

  const heroSectionClass =
    'border-b border-purple-900/30 bg-gradient-to-b from-[#2a1442]/90 via-[#1d0e2f]/90 to-[#140921]';

  // Dedicated Standalone Admin Portal Screen
  if (isStandaloneAdminOpen) {
    if (!creatorSession?.isLoggedIn) {
      return <StandaloneAdminPortal />;
    }
    return (
      <AdminPortalApp
        creatorSession={creatorSession}
        currentUser={currentUser}
        onLogout={handleCreatorLogout}
        onClose={() => setIsStandaloneAdminOpen(false)}
        isStandalone={true}
        stories={stories}
        onAddStory={handleAddNewStory}
        onDeleteStory={(id) => {
          setStories((prev) => {
            const updated = prev.filter((s) => s.id !== id);
            localStorage.setItem('goppo_kahini_custom_stories', JSON.stringify(updated));
            return updated;
          });
        }}
        lifeStoryEpisodes={lifeStories}
        onAddLifeStoryEpisode={(ep) => {
          setLifeStories((prev) => [ep, ...prev]);
        }}
        subscribers={subscribers}
        onUpdateSubscriberStatus={handleUpdateSubscriberStatus}
        onDeleteSubscriber={handleDeleteSubscriber}
        narratorApplications={narratorApplications}
        onApproveNarrator={handleApproveNarrator}
        onRejectNarrator={handleRejectNarrator}
        onDeleteNarratorApp={handleDeleteNarratorApp}
        lifeStorySubmissions={lifeStorySubmissions}
        onUpdateLifeStoryStatus={handleUpdateLifeStoryStatus}
        onDeleteLifeStorySubmission={handleDeleteLifeStorySubmission}
        paymentTransactions={paymentTransactions}
        onApprovePayment={handleApprovePayment}
        onRejectPayment={handleRejectPayment}
        onApproveRefund={handleApproveRefund}
        onRejectRefund={handleRejectRefund}
        onCompleteRefund={handleCompleteRefund}
        upiConfig={upiConfig}
        onUpdateUpiConfig={handleUpdateUpiConfig}
        adminActivityLogs={adminActivityLogs}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col pb-36 sm:pb-28 antialiased transition-colors duration-300 ${themeContainerClass}`}>
      
      {/* Top Navigation Bar */}
      <Navbar
        isSubscribed={subscription?.status === 'active'}
        onOpenSubscriptionModal={() => handleOpenSubscriptionFlow(null)}
        onOpenSubscriptionManager={() => {
          if (!currentUser) {
            handleOpenUserAuth('take_pass');
            return;
          }
          setIsSubscriptionManagerOpen(true);
        }}
        onOpenBookmarks={() => {
          if (!currentUser) {
            handleOpenUserAuth('library', 'সংরক্ষিত গল্প দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।');
            return;
          }
          setIsBookmarksOpen(true);
        }}
        onOpenMixer={() => setIsAmbientMixerOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenStudio={handleOpenStudioRequest}
        onOpenNarratorApplication={() => setIsNarratorAppModalOpen(true)}
        onOpenCreatorLogin={() => setIsCreatorLoginModalOpen(true)}
        onOpenHistory={() => {
          if (!currentUser) {
            handleOpenUserAuth('library', 'পূর্বে শোনা গল্পের তালিকা দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।');
            return;
          }
          setIsHistoryModalOpen(true);
        }}
        historyCount={listeningHistory.length}
        onLogoutCreator={handleLogoutCreator}
        creatorSession={creatorSession}
        bookmarkCount={bookmarks.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeAmbientCount={ambientTracks.filter((t) => t.isPlaying).length}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'calm-green' ? 'midnight-dark' : 'calm-green')}
        activeView={activeMainView}
        onSelectView={(view) => setActiveMainView(view)}
        currentUser={currentUser}
        onOpenUserAuth={handleOpenUserAuth}
        onOpenUserAccount={() => setIsUserAccountOpen(true)}
        onLogoutUser={handleLogoutUser}
        onSelectPolicy={handleSelectPolicy}
      />

      {/* Main View Switcher Banner on Mobile/Tablet */}
      <div className="lg:hidden border-b border-purple-950/60 bg-[#120a1c]/95 px-3 py-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              if (currentPolicyPage) handleNavigateHomeFromPolicy();
              setActiveMainView('stories');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              !currentPolicyPage && activeMainView === 'stories'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#1a1426] text-zinc-400'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>গল্পঘর</span>
          </button>

          <button
            onClick={() => {
              if (currentPolicyPage) handleNavigateHomeFromPolicy();
              setActiveMainView('lifestories');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
              !currentPolicyPage && activeMainView === 'lifestories'
                ? 'bg-pink-500 text-white font-black shadow-sm'
                : 'bg-[#1a1426] text-zinc-400'
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            <span>মানুষের জীবন কথা</span>
            <span className="h-1.5 w-1.5 rounded-full bg-pink-300" />
          </button>
        </div>
      </div>

      {/* CONDITIONAL MAIN VIEW: 1. LEGAL & SUPPORT PAGE OR 2. LIFE STORIES OR 3. STORIES */}
      {currentPolicyPage ? (
        <LegalSupportPage
          initialSlug={currentPolicyPage}
          onNavigateHome={handleNavigateHomeFromPolicy}
          onSelectPolicy={handleSelectPolicy}
        />
      ) : activeMainView === 'lifestories' ? (
        <main className="mx-auto max-w-7xl w-full flex-1 px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
          <LifeStoriesSection
            episodes={lifeStories}
            onPlayEpisode={handlePlayLifeStory}
            activeEpisodeId={activeLifeStoryId}
            isPlaying={isPlaying}
            onOpenSubmissionModal={() => setIsLifeSubmissionModalOpen(true)}
          />
        </main>
      ) : (
        <>
          {/* Hero Banner with Soothing Atmosphere */}
          <section className={`relative overflow-hidden py-6 sm:py-10 px-4 sm:px-6 lg:px-8 ${heroSectionClass}`}>
            {/* Soft Ambient Light Glow: Light Purple & Pink */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative mx-auto max-w-5xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
                
                {/* Left Content */}
                <div className="max-w-2xl text-center md:text-left">
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/40 bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-300 mb-2.5 sm:mb-3">
                    <Crown className="h-3.5 w-3.5 fill-pink-400 text-pink-400" />
                    <span>প্রিমিয়াম বাংলা অডিও গল্প • মাত্র ₹২০ প্রতি মাসে</span>
                  </div>
                  
                  <h1 className="font-serif-story text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                    মন জুড়ানো বাংলা অডিও গল্পের প্রশান্তিময় ভুবন
                  </h1>
                  
                  <p className="mt-2 sm:mt-3 text-xs sm:text-base text-purple-200/80 leading-relaxed max-w-xl">
                    রোমাঞ্চ, ভৌতিক রহস্য ও শান্ত ঘুমের কাহিনীর সাথে ব্যাকগ্রাউন্ডে ঝুম বৃষ্টি আর নিঝুম রাতের আবহ সুর।
                  </p>

                  {/* Benefit Pills */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-[11px] sm:text-xs text-zinc-300">
                    <div className="flex items-center gap-1 bg-[#15111e]/90 px-2.5 py-1 rounded-full border border-purple-900/40">
                      <CheckCircle2 className="h-3.5 w-3.5 text-pink-400" />
                      <span>কোনো বিজ্ঞাপন নেই</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#15111e]/90 px-2.5 py-1 rounded-full border border-purple-900/40">
                      <CheckCircle2 className="h-3.5 w-3.5 text-pink-400" />
                      <span>স্ক্রিন অফ করে শুনুন</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#15111e]/90 px-2.5 py-1 rounded-full border border-purple-900/40">
                      <CheckCircle2 className="h-3.5 w-3.5 text-pink-400" />
                      <span>বিকাশ, UPI ও কার্ড পেমেন্ট</span>
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3">
                    {subscription?.status !== 'active' ? (
                      <button
                        onClick={() => handleOpenSubscriptionFlow(null)}
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-pink-500 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-pink-950/60 hover:opacity-95 transition-all hover:scale-105 active:scale-95 shrink-0"
                      >
                        <Crown className="h-4 w-4 fill-white" />
                        <span>মাত্র ₹২০-তে পাস নিন</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsSubscriptionManagerOpen(true)}
                        className="flex items-center gap-2 rounded-full bg-pink-500/20 border border-pink-500/40 px-4 py-2 text-xs font-bold text-pink-300 hover:bg-pink-500/30 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4 text-pink-400" />
                        <span>আপনার পাস সক্রিয় আছে (ম্যানেজ করুন)</span>
                      </button>
                    )}

                    {/* Quick switch to Life Stories podcast */}
                    <button
                      onClick={() => setActiveMainView('lifestories')}
                      className="flex items-center gap-2 rounded-full border border-pink-500/40 bg-pink-500/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-pink-300 hover:bg-pink-500/20 transition-colors"
                    >
                      <Mic className="h-4 w-4 text-pink-400" />
                      <span>মানুষের জীবন কথা পডকাস্ট</span>
                    </button>

                    <button
                      onClick={() => setIsAmbientMixerOpen(true)}
                      className="flex items-center gap-2 rounded-full border border-purple-900/50 bg-[#16121f]/90 px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      <Sliders className="h-4 w-4 text-purple-300" />
                      <span>আবহ শব্দ</span>
                    </button>
                  </div>

                </div>

                {/* Right Mini Featured Story Highlight */}
                <div className="w-full max-w-xs md:w-72 rounded-2xl border border-purple-900/40 bg-[#14101c]/90 p-3.5 sm:p-4 shadow-xl shadow-black/60">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-black border border-purple-900/40 shrink-0">
                      <img
                        src={stories[0]?.coverImage || INITIAL_STORIES[0].coverImage}
                        alt={stories[0]?.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                        আজকের বিশেষ গল্প
                      </span>
                      <h4 className="font-serif-story text-xs sm:text-sm font-bold text-white truncate">
                        {stories[0]?.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">
                        কণ্ঠে: {stories[0]?.narrator}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-pink-300 font-semibold flex items-center gap-1">
                      <Sparkles className="h-3 w-3 fill-pink-400 text-pink-400" />
                      <span>{stories[0]?.isLittlePassOnly ? 'পাস গল্প' : 'ফ্রি গল্প'}</span>
                    </span>
                    <button
                      onClick={() => handlePlayStory(stories[0])}
                      className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-bold text-white transition-colors shadow-sm"
                    >
                      শুনুন
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Main Catalog */}
          <main className="mx-auto max-w-7xl w-full flex-1 px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
            
            {/* Story Length Tabs: ছোট গল্প (< 10m), মাঝারি গল্প (10-25m), বড়/মেগা গল্প (25m+) */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-pink-400" />
                  <span>গল্পের দৈর্ঘ্য অনুযায়ী ক্যাটাগরি</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setSelectedLengthCategory('all')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all ${
                    selectedLengthCategory === 'all'
                      ? 'border-pink-500 bg-pink-500/15 text-white shadow-sm'
                      : 'border-purple-950/40 bg-[#14101c]/80 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>সব দৈর্ঘ্যের গল্প</span>
                    <span className="text-[10px] font-normal text-pink-300">({stories.length})</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">সব পর্ব একসাথে</p>
                </button>

                <button
                  onClick={() => setSelectedLengthCategory('mini')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all ${
                    selectedLengthCategory === 'mini'
                      ? 'border-pink-500 bg-pink-500/15 text-white shadow-sm'
                      : 'border-purple-950/40 bg-[#14101c]/80 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold text-pink-300 flex items-center justify-between">
                    <span>⏱️ ছোট / মিনি গল্প</span>
                    <span className="text-[10px] font-normal text-pink-300">
                      ({stories.filter((s) => s.lengthCategory === 'mini').length})
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">&lt; ১০ মিনিট (চটজলদি)</p>
                </button>

                <button
                  onClick={() => setSelectedLengthCategory('medium')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all ${
                    selectedLengthCategory === 'medium'
                      ? 'border-purple-400 bg-purple-500/15 text-white shadow-sm'
                      : 'border-purple-950/40 bg-[#14101c]/80 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold text-purple-300 flex items-center justify-between">
                    <span>📖 মাঝারি গল্প</span>
                    <span className="text-[10px] font-normal text-purple-300">
                      ({stories.filter((s) => s.lengthCategory === 'medium').length})
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">১০ - ২৫ মিনিট (মনোগ্রাহী)</p>
                </button>

                <button
                  onClick={() => setSelectedLengthCategory('mega')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all ${
                    selectedLengthCategory === 'mega'
                      ? 'border-pink-500 bg-pink-500/15 text-white shadow-sm'
                      : 'border-purple-950/40 bg-[#14101c]/80 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold text-pink-300 flex items-center justify-between">
                    <span>🎙️ বড় / মেগা গল্প</span>
                    <span className="text-[10px] font-normal text-pink-300">
                      ({stories.filter((s) => s.lengthCategory === 'mega').length})
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">২৫+ মিনিট (উপন্যাসধর্মী)</p>
                </button>
              </div>
            </div>

            {/* Genre Filter Pills */}
            <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {genres.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setSelectedGenre(g.value)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                    selectedGenre === g.value
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-md shadow-pink-950/40'
                      : 'border border-purple-900/30 bg-[#14101c]/80 text-zinc-300 hover:border-pink-500/40 hover:text-white'
                  }`}
                >
                  {g.label}
                </button>
              ))}

              <div className="h-4 w-px bg-zinc-800 mx-1 shrink-0" />

              {/* Free vs Little Pass Filter */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setAccessFilter('all')}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                    accessFilter === 'all' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  সব গল্প
                </button>
                <button
                  onClick={() => setAccessFilter('free')}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                    accessFilter === 'free' ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ফ্রি
                </button>
                <button
                  onClick={() => setAccessFilter('little_pass')}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                    accessFilter === 'little_pass' ? 'bg-pink-900/60 text-pink-300 border border-pink-500/40' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  পাস
                </button>
              </div>
            </div>

            {/* Stories Grid */}
            {filteredStories.length === 0 ? (
              <div className="rounded-3xl border border-purple-900/30 bg-[#14101c]/90 p-12 text-center">
                <p className="text-zinc-400 text-sm">আপনার পছন্দের কোনো গল্প পাওয়া যায়নি। ফিল্টার পরিবর্তন করে দেখুন।</p>
                <button
                  onClick={() => {
                    setSelectedLengthCategory('all');
                    setSelectedGenre('All');
                    setAccessFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-3 text-xs text-pink-400 hover:underline"
                >
                  সব ফিল্টার রিসেট করুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    isCurrentStory={currentStory?.id === story.id}
                    isPlaying={isPlaying && currentStory?.id === story.id}
                    isPlayingThis={isPlaying && currentStory?.id === story.id}
                    subscription={subscription}
                    isSubscribed={subscription?.status === 'active'}
                    isUnlockedSingle={subscription?.unlockedStoryIds?.includes(story.id)}
                    isBookmarked={bookmarks.some((b) => b.storyId === story.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onSelect={(s) => handlePlayStory(s)}
                    onPlay={() => handlePlayStory(story)}
                    onPause={handlePauseStory}
                    onOpenPaywall={() => handleOpenSubscriptionFlow(story)}
                    onPromptSubscription={() => handleOpenSubscriptionFlow(story)}
                    onOpenReviews={handleOpenReviews}
                    reviewsCount={story.reviewsCount || 0}
                  />
                ))}
              </div>
            )}

          </main>
        </>
      )}

      {/* App Footer */}
      <footer className="mt-auto border-t border-purple-900/30 bg-[#120a1c]/90 py-6 px-4 text-center text-xs text-zinc-400">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-story font-bold text-zinc-300">গপ্পো কাহিনী</span>
            <span className="text-zinc-400">•</span>
            <span className="text-[11px] text-zinc-400">বাংলার নিখাদ রোমাঞ্চ ও মানুষের জীবনের সত্য কথা</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
            <button
              onClick={() => {
                if (currentPolicyPage) handleNavigateHomeFromPolicy();
                setActiveMainView('stories');
              }}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              গল্পঘর
            </button>

            <button
              onClick={() => {
                if (currentPolicyPage) handleNavigateHomeFromPolicy();
                setActiveMainView('lifestories');
              }}
              className="text-pink-400 hover:text-pink-300 font-semibold transition-colors"
            >
              🎙️ মানুষের জীবন কথা
            </button>

            <button
              onClick={() => setIsNarratorAppModalOpen(true)}
              className="text-purple-300 hover:text-purple-200 font-semibold transition-colors"
            >
              কথক অডিশন
            </button>

            {/* Mobile-First Compact Legal & Support Dropdown */}
            <LegalSupportDropdown
              variant="footer-dropdown"
              onSelectPolicy={handleSelectPolicy}
            />

            {creatorSession?.isLoggedIn && (
              <div className="flex items-center gap-2 bg-[#1a1426] px-2.5 py-1 rounded-full border border-purple-900/40">
                <span className="text-pink-300 font-semibold">
                  {creatorSession.role === 'super_admin' ? '👑 জয় (Admin)' : `🎙️ ${creatorSession.name}`}
                </span>
                <button
                  onClick={() => setIsStudioOpen(true)}
                  className="text-pink-400 hover:underline text-[10px]"
                >
                  স্টুডিও
                </button>
                <button
                  onClick={handleCreatorLogout}
                  className="text-rose-400 hover:underline text-[10px]"
                >
                  লগআউট
                </button>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Docked Audio Player Bar */}
      <PlayerBar
        currentStory={currentStory}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        playbackRate={playbackRate}
        volume={volume}
        sleepTimerRemaining={sleepTimerRemaining}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        onSkipBack={handleSkipBack}
        onSkipForward={handleSkipForward}
        onChangeRate={handleChangeRate}
        onChangeVolume={handleChangeVolume}
        onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
        onSetSleepTimer={handleSetSleepTimer}
        onDismissPlayer={handleDismissPlayer}
      />

      {/* Mobile App Bottom Navigation Bar with 5 tabs */}
      <MobileBottomNav
        currentTab={mobileTab}
        onSelectTab={handleSelectMobileTab}
        subscription={subscription}
        bookmarkCount={bookmarks.length}
        currentUser={currentUser}
        onRequireLogin={(msg) => handleOpenUserAuth('library', msg)}
      />

      {/* Full Player Modal */}
      <FullPlayerModal
        isOpen={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
        story={currentStory}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        playbackRate={playbackRate}
        volume={volume}
        sleepTimerRemaining={sleepTimerRemaining}
        currentLineIndex={currentLineIndex}
        isBookmarked={currentStory ? bookmarks.some((b) => b.storyId === currentStory.id) : false}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        onSkipBack={handleSkipBack}
        onSkipForward={handleSkipForward}
        onChangeRate={handleChangeRate}
        onChangeVolume={handleChangeVolume}
        onSetSleepTimer={handleSetSleepTimer}
        onToggleBookmark={handleToggleBookmark}
        onOpenAmbientMixer={() => setIsAmbientMixerOpen(true)}
        subscription={subscription}
        currentUser={currentUser}
        onRequireLogin={(msg) => handleOpenUserAuth('general', msg)}
        onOpenReviews={handleOpenReviews}
      />

      {/* Direct Bank UPI Subscription & Pass Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        upiConfig={upiConfig}
        onSubmitPayment={handleSubmitPayment}
        existingTransactions={paymentTransactions}
        targetStory={targetPaywallStory}
        currentSubscription={subscription}
        currentUser={currentUser}
        onOpenUserAuth={() => handleOpenUserAuth('take_pass')}
      />

      {/* Subscription Manager Modal with Refund & Cancellation Flows */}
      <SubscriptionManagerModal
        isOpen={isSubscriptionManagerOpen}
        onClose={() => setIsSubscriptionManagerOpen(false)}
        subscription={subscription}
        userTransaction={paymentTransactions.find(t => t.status === 'paid' || t.status === 'pending' || t.status === 'refund_requested' || t.status === 'refunded')}
        onCancelSubscription={handleCancelSubscription}
        onRequestRefund={handleRequestRefund}
        onOpenNewSubscription={() => {
          setIsSubscriptionManagerOpen(false);
          setIsSubscriptionModalOpen(true);
        }}
      />

      {/* Ambient Soundscapes Procedural Mixer Modal */}
      <AmbientMixerModal
        isOpen={isAmbientMixerOpen}
        onClose={() => setIsAmbientMixerOpen(false)}
        tracks={ambientTracks}
        onToggleTrack={handleToggleAmbientTrack}
        onChangeVolume={handleChangeAmbientVolume}
        onApplyPreset={handleApplyPreset}
        onStopAll={handleStopAllAmbients}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        stories={stories}
        onPlayAtBookmark={handlePlayAtBookmark}
        onDeleteBookmark={handleDeleteBookmark}
      />

      {/* Listening History Modal (পূর্বে শোনা গল্প ও ইন্টারফেস ক্লিয়ারিং) */}
      <ListeningHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={listeningHistory}
        onPlayFromHistory={handlePlayFromHistory}
        onClearHistory={handleClearHistory}
        onRemoveItem={handleRemoveHistoryItem}
        allStories={stories}
      />

      {/* About Us & Narrators Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        onOpenNarratorApplication={() => setIsNarratorAppModalOpen(true)}
      />

      {/* Creator Studio & Admin CRM with Payment Management for Super Admin Joy */}
      <CreatorStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onAddStory={handleAddNewStory}
        subscribers={subscribers}
        creatorSession={creatorSession}
        onLogout={handleCreatorLogout}
        narratorApplications={narratorApplications}
        onApproveNarrator={handleApproveNarrator}
        onRejectNarrator={handleRejectNarrator}
        onDeleteNarratorApp={handleDeleteNarratorApp}
        lifeStorySubmissions={lifeStorySubmissions}
        onUpdateLifeStoryStatus={handleUpdateLifeStoryStatus}
        onDeleteLifeStorySubmission={handleDeleteLifeStorySubmission}
        onUpdateSubscriberStatus={handleUpdateSubscriberStatus}
        onDeleteSubscriber={handleDeleteSubscriber}
        paymentTransactions={paymentTransactions}
        onApprovePayment={handleApprovePayment}
        onRejectPayment={handleRejectPayment}
        onApproveRefund={handleApproveRefund}
        onRejectRefund={handleRejectRefund}
        onCompleteRefund={handleCompleteRefund}
        upiConfig={upiConfig}
        onUpdateUpiConfig={handleUpdateUpiConfig}
        adminActivityLogs={adminActivityLogs}
        onOpenStandaloneAdmin={() => setIsStandaloneAdminOpen(true)}
      />

      {/* Narrator Application / Audition Modal */}
      <NarratorApplicationModal
        isOpen={isNarratorAppModalOpen}
        onClose={() => setIsNarratorAppModalOpen(false)}
        onSubmitApplication={handleSubmitNarratorApplication}
      />

      {/* Creator / Narrator Login Portal Modal */}
      <CreatorLoginModal
        isOpen={isCreatorLoginModalOpen}
        onClose={() => setIsCreatorLoginModalOpen(false)}
        onLoginSuccess={handleCreatorLoginSuccess}
        approvedNarrators={narratorApplications.filter((a) => a.status === 'approved')}
      />

      {/* Life Story (মানুষের জীবন কথা) User Submission Modal */}
      <LifeStorySubmissionModal
        isOpen={isLifeSubmissionModalOpen}
        onClose={() => setIsLifeSubmissionModalOpen(false)}
        onSubmit={handleLifeStorySubmit}
      />

      {/* Audience User Account & Subscription Management Modal (ইউজার প্রোফাইল) */}
      <UserAccountModal
        isOpen={isUserAccountOpen}
        onClose={() => setIsUserAccountOpen(false)}
        currentUser={currentUser}
        subscription={subscription}
        onLogoutUser={handleLogoutUser}
        onOpenSubscriptionModal={() => {
          setIsUserAccountOpen(false);
          setTargetPaywallStory(null);
          setIsSubscriptionModalOpen(true);
        }}
        onOpenBookmarks={() => {
          setIsUserAccountOpen(false);
          setIsBookmarksOpen(true);
        }}
        onOpenHistory={() => {
          setIsUserAccountOpen(false);
          setIsHistoryModalOpen(true);
        }}
        onUpdateSubscriptionExpiry={(newExpiry, newStatus) => {
          setSubscription((prev) => ({
            ...prev,
            status: newStatus,
            expiresAt: newExpiry,
          }));
        }}
      />

      {/* Item Reviews & Rating Modal */}
      {activeReviewTarget && (
        <ItemReviewsModal
          isOpen={isReviewsModalOpen}
          onClose={() => {
            setIsReviewsModalOpen(false);
            setActiveReviewTarget(null);
          }}
          itemId={activeReviewTarget.id}
          itemTitle={activeReviewTarget.title}
          itemType={activeReviewTarget.type}
          currentUser={currentUser}
          onRequireLogin={(msg) => handleOpenUserAuth('general', msg)}
          onStoryStatsUpdated={({ rating, reviewsCount }) => {
            setStories((prev) =>
              prev.map((s) =>
                s.id === activeReviewTarget.id
                  ? { ...s, rating, reviewsCount }
                  : s
              )
            );
          }}
        />
      )}

      {/* Audience User Auth Modal (লগইন ও রেজিস্ট্রেশন) */}
      <UserAuthModal
        isOpen={isUserAuthOpen}
        onClose={() => setIsUserAuthOpen(false)}
        onLoginSuccess={handleUserAuthSuccess}
        initialMessage={userAuthMessage}
        triggerReason={userAuthReason === 'library' ? 'general' : userAuthReason}
      />

      {/* Opening / Splash Screen (App Launch: Existing Logo + "রোমাঞ্চ, শান্তি, জীবনের মানুষের কথা" for 2.5s) */}
      {showSplash && (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          durationMs={2500}
        />
      )}

    </div>
  );
}
