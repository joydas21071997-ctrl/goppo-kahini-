import React, { useState, useEffect, useMemo } from 'react';
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
  Users,
  Flame,
  Gift,
  LayoutGrid,
  Layers,
  ChevronRight,
  Grid3X3,
  Moon,
  Compass,
  Ghost,
  Eye,
  RotateCcw,
  Calendar
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
  ItemReview,
  Series,
  Episode
} from './types';
import { INITIAL_STORIES, AMBIENT_SOUND_TRACKS } from './data/stories';
import { INITIAL_SERIES, INITIAL_SERIES_EPISODES } from './data/seriesData';
import { subscribeSeriesFromFirestore, subscribeEpisodesForSeries } from './services/firestoreSeries';
import { evaluateEpisodeAccess } from './utils/episodeAccess';
import { getSecureEpisodeStreamUrl } from './services/secureStream';
import { SeriesSection } from './components/series/SeriesSection';
import { SeriesDetailModal } from './components/series/SeriesDetailModal';
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
import { LanguageOnboardingModal } from './components/LanguageOnboardingModal';
import { NotificationPermissionModal } from './components/NotificationPermissionModal';
import { FilterExploreSection, SortOption } from './components/FilterExploreSection';
import { detectUserCountry, getPassPriceConfig } from './utils/country';
import { useLanguage, AppLanguage } from './context/LanguageContext';
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
import { LegalPolicySlug, OLD_POLICY_REDIRECTS } from './data/legalPolicies';
import {
  subscribeStoriesFromFirestore,
  saveStoryToFirestore,
  deleteStoryFromFirestore,
} from './services/firestoreStories';
import {
  saveUserBookmarksToFirestore,
  fetchUserBookmarksFromFirestore,
  saveUserHistoryToFirestore,
  fetchUserHistoryFromFirestore,
} from './services/firestoreUser';
import {
  subscribeTransactionsFromFirestore,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  subscribeSubscribersFromFirestore,
  saveSubscriberToFirestore,
  deleteSubscriberFromFirestore,
  subscribeNarratorAppsFromFirestore,
  saveNarratorAppToFirestore,
  deleteNarratorAppFromFirestore,
  subscribeLifeStoriesFromFirestore,
  saveLifeStoryToFirestore,
  deleteLifeStoryFromFirestore,
  subscribePodcastEpisodesFromFirestore,
  savePodcastEpisodeToFirestore,
  deletePodcastEpisodeFromFirestore,
  subscribeUpiConfigFromFirestore,
  saveUpiConfigToFirestore,
} from './services/firestoreAdminData';

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
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with any missing initial stories so new defaults aren't lost
          const existingIds = new Set(parsed.map((s: Story) => s.id));
          const missing = INITIAL_STORIES.filter((s) => !existingIds.has(s.id));
          return [...parsed, ...missing];
        }
      } catch {}
    }
    return INITIAL_STORIES;
  });

  // --- Story Catalog View & Density Customization ---
  const [catalogViewMode, setCatalogViewMode] = useState<'sectors' | 'grid'>('sectors');
  const [gridDensity, setGridDensity] = useState<'compact' | 'normal'>('compact');

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

  // --- Theme Mode: Purple & White (Light) vs Purple & Black (Dark) ---
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('goppo_theme');
    if (saved === 'purple-dark' || saved === 'midnight-dark') return 'purple-dark';
    return 'purple-light';
  });

  const isLight = theme === 'purple-light' || theme === 'calm-green';

  const handleToggleTheme = (newTheme?: ThemeMode) => {
    const targetTheme = newTheme
      ? newTheme
      : isLight
      ? 'purple-dark'
      : 'purple-light';
    setTheme(targetTheme);
    localStorage.setItem('goppo_theme', targetTheme);
  };

  useEffect(() => {
    localStorage.setItem('goppo_theme', theme);
    if (isLight) {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('theme-dark');
      document.body.style.backgroundColor = '#fcfaff';
      document.body.style.color = '#18181b';
    } else {
      document.documentElement.classList.add('theme-dark');
      document.documentElement.classList.remove('theme-light');
      document.body.style.backgroundColor = '#120a1c';
      document.body.style.color = '#ffffff';
    }
  }, [theme, isLight]);

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

  // --- Series & Episodes State (ADD-ONLY) ---
  const [seriesList, setSeriesList] = useState<Series[]>(INITIAL_SERIES);
  const [activeSeries, setActiveSeries] = useState<Series | null>(null);
  const [seriesEpisodes, setSeriesEpisodes] = useState<Episode[]>([]);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [activePlayingEpisode, setActivePlayingEpisode] = useState<Episode | null>(null);
  const [targetPaywallEpisode, setTargetPaywallEpisode] = useState<Episode | null>(null);
  const [targetPaywallSeries, setTargetPaywallSeries] = useState<Series | null>(null);

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
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [showAllThisMonth, setShowAllThisMonth] = useState(false);
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

  // --- Audience Language Preference & Story Language Filtering ---
  const [selectedStoryLanguage, setSelectedStoryLanguage] = useState<'all' | 'bn' | 'hi' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('gk_app_language');
      if (savedLang === 'hi') return 'hi';
      if (savedLang === 'en') return 'all';
      if (savedLang === 'bn') return 'bn';
    }
    return 'bn';
  });

  // --- Modals for Language Onboarding & Notification Prompt ---
  const [isLanguageOnboardingOpen, setIsLanguageOnboardingOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const triggerNotificationCheck = () => {
    try {
      if (typeof window !== 'undefined') {
        const pref = localStorage.getItem('gk_notification_preference');
        if (!pref) {
          setTimeout(() => {
            setIsNotificationModalOpen(true);
          }, 600);
        }
      }
    } catch {}
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    try {
      if (typeof window !== 'undefined') {
        const hasSelected = localStorage.getItem('gk_has_selected_language_onboarding');
        if (!hasSelected) {
          setIsLanguageOnboardingOpen(true);
        } else {
          triggerNotificationCheck();
        }
      }
    } catch {
      triggerNotificationCheck();
    }
  };

  const handleSelectOnboardingLanguage = (lang: AppLanguage) => {
    if (lang === 'bn') setSelectedStoryLanguage('bn');
    else if (lang === 'hi') setSelectedStoryLanguage('hi');
    else setSelectedStoryLanguage('all');

    setTimeout(() => {
      triggerNotificationCheck();
    }, 450);
  };

  // --- Legal & Support Public Page Routing State ---
  const getPolicySlugFromUrl = (): LegalPolicySlug | null => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    const search = new URLSearchParams(window.location.search);
    const pageParam = (search.get('page') || search.get('policy') || search.get('legal') || '').toLowerCase();
    const hash = window.location.hash.replace(/^#/, '').toLowerCase();

    const validSlugs: LegalPolicySlug[] = [
      'privacy-policy',
      'terms',
      'refund-policy',
      'data-deletion',
    ];

    if (validSlugs.includes(path as LegalPolicySlug)) return path as LegalPolicySlug;
    if (validSlugs.includes(pageParam as LegalPolicySlug)) return pageParam as LegalPolicySlug;
    if (validSlugs.includes(hash as LegalPolicySlug)) return hash as LegalPolicySlug;

    // Check redirection map for old/alias policy routes and smoothly canonicalize
    const targetKey = path || pageParam || hash;
    if (targetKey && targetKey in OLD_POLICY_REDIRECTS) {
      const canonicalSlug = OLD_POLICY_REDIRECTS[targetKey];
      try {
        if (path && path !== canonicalSlug && path !== 'delete-account' && typeof window !== 'undefined') {
          window.history.replaceState({ policy: canonicalSlug }, '', `/${canonicalSlug}`);
        }
      } catch {
        // no-op
      }
      return canonicalSlug;
    }

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

  // --- Multilingual Support Hook ---
  const { t, language } = useLanguage();

  // --- Dynamic Country & Pass Price Detection (India: ₹20 / Bangladesh: ৳25) ---
  const userCountry = useMemo(() => detectUserCountry(currentUser), [currentUser]);
  const passPriceConfig = useMemo(() => getPassPriceConfig(userCountry, language), [userCountry, language]);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  const [userAuthReason, setUserAuthReason] = useState<'play_story' | 'take_pass' | 'library' | 'general'>('general');
  const [userAuthMessage, setUserAuthMessage] = useState<string | undefined>(undefined);
  const [isUserAccountOpen, setIsUserAccountOpen] = useState(false);
  const [pendingPlayStory, setPendingPlayStory] = useState<Story | null>(null);
  const [playbackNotice, setPlaybackNotice] = useState<string | null>(null);

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

  // Listen to Firestore Series real-time synchronization (ADD-ONLY)
  useEffect(() => {
    const unsub = subscribeSeriesFromFirestore((firestoreSeries) => {
      if (firestoreSeries && firestoreSeries.length > 0) {
        setSeriesList(firestoreSeries);
      }
    });
    return () => unsub();
  }, []);

  // Listen to Episodes for currently active Series
  useEffect(() => {
    if (!activeSeries) {
      setSeriesEpisodes([]);
      return;
    }
    const unsub = subscribeEpisodesForSeries(activeSeries.id, (eps) => {
      setSeriesEpisodes(eps);
    });
    return () => unsub();
  }, [activeSeries?.id]);

  // Listen to Firestore Transactions real-time synchronization (Admin reads all; authenticated user reads only own)
  useEffect(() => {
    const isAdmin = isAuthorizedAdmin(creatorSession, currentUser);
    if (isAdmin) {
      const unsubscribe = subscribeTransactionsFromFirestore((items) => {
        if (items && items.length > 0) {
          setPaymentTransactions(items);
          localStorage.setItem('goppo_payment_transactions', JSON.stringify(items));
        }
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    } else if (currentUser?.uid) {
      const unsubscribe = subscribeTransactionsFromFirestore((items) => {
        if (items) {
          setPaymentTransactions(items);
        }
      }, undefined, currentUser.uid);
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [creatorSession, currentUser]);

  // Listen to Firestore Subscribers CRM real-time synchronization (Admin-only collection)
  useEffect(() => {
    if (!isAuthorizedAdmin(creatorSession, currentUser)) return;
    const unsubscribe = subscribeSubscribersFromFirestore((items) => {
      if (items && items.length > 0) {
        setSubscribers(items);
        localStorage.setItem('goppo_kahini_subscribers', JSON.stringify(items));
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [creatorSession, currentUser]);

  // Listen to Firestore Narrator Applications real-time synchronization (Admin-only read)
  useEffect(() => {
    if (!isAuthorizedAdmin(creatorSession, currentUser)) return;
    const unsubscribe = subscribeNarratorAppsFromFirestore((items) => {
      if (items && items.length > 0) {
        setNarratorApplications(items);
        localStorage.setItem('goppo_narrator_applications', JSON.stringify(items));
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [creatorSession, currentUser]);

  // Listen to Firestore Life Stories Submissions real-time synchronization (Admin-only read)
  useEffect(() => {
    if (!isAuthorizedAdmin(creatorSession, currentUser)) return;
    const unsubscribe = subscribeLifeStoriesFromFirestore((items) => {
      if (items && items.length > 0) {
        setLifeStorySubmissions(items);
        localStorage.setItem('goppo_life_story_submissions', JSON.stringify(items));
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [creatorSession, currentUser]);

  // Listen to Firestore Podcast Episodes real-time synchronization (Public read, Admin write)
  useEffect(() => {
    const unsubscribe = subscribePodcastEpisodesFromFirestore((items) => {
      if (items && items.length > 0) {
        setLifeStories(items);
        localStorage.setItem('goppo_podcast_episodes', JSON.stringify(items));
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Listen to Firestore Global UPI / System Settings Configuration (Admin-only read/write)
  useEffect(() => {
    if (!isAuthorizedAdmin(creatorSession, currentUser)) return;
    const unsubscribe = subscribeUpiConfigFromFirestore((config) => {
      if (config && config.upiId) {
        setUpiConfig(config);
        localStorage.setItem('goppo_upi_config', JSON.stringify(config));
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [creatorSession, currentUser]);

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
        t('auth_prompt_pass', '২০ টাকার মাসিক পাস নিতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন বা সাইন আপ করুন।')
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

  // Load user bookmarks & listening history from Firestore on login
  useEffect(() => {
    if (currentUser?.uid) {
      fetchUserBookmarksFromFirestore(currentUser.uid)
        .then((cloudBms) => {
          if (cloudBms && Array.isArray(cloudBms) && cloudBms.length > 0) {
            setBookmarks((prev) => {
              const map = new Map<string, BookmarkType>();
              [...cloudBms, ...prev].forEach((b) => map.set(b.id, b));
              return Array.from(map.values());
            });
          }
        })
        .catch(console.error);

      fetchUserHistoryFromFirestore(currentUser.uid)
        .then((cloudHist) => {
          if (cloudHist && Array.isArray(cloudHist) && cloudHist.length > 0) {
            setListeningHistory((prev) => {
              const map = new Map<string, ListeningHistoryItem>();
              [...cloudHist, ...prev].forEach((h) => map.set(h.id, h));
              return Array.from(map.values());
            });
          }
        })
        .catch(console.error);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    localStorage.setItem('goppo_kahini_bookmarks', JSON.stringify(bookmarks));
    if (currentUser?.uid) {
      saveUserBookmarksToFirestore(currentUser.uid, bookmarks).catch(console.error);
    }
  }, [bookmarks, currentUser?.uid]);

  useEffect(() => {
    if (currentUser?.uid) {
      saveUserHistoryToFirestore(currentUser.uid, listeningHistory).catch(console.error);
    }
  }, [listeningHistory, currentUser?.uid]);

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

        // Next Episode Check (Rule 23)
        if (activePlayingEpisode && activeSeries) {
          const nextEp = seriesEpisodes.find(
            (e) => e.episodeNumber === activePlayingEpisode.episodeNumber + 1
          );
          if (nextEp) {
            const nextAccess = evaluateEpisodeAccess(nextEp, subscription);
            if (nextAccess.unlocked) {
              handlePlayEpisode(activeSeries, nextEp);
            }
          }
        }
      },
      (playing) => {
        setIsPlaying(playing);
      }
    );
  }, [currentStory, subscription, activePlayingEpisode, activeSeries, seriesEpisodes]);

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
        t('auth_prompt_listen', 'গল্প শুনতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন বা রেজিস্টার করুন।')
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
    setActivePlayingEpisode(null);
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

  // Play a Series Episode seamlessly reusing the existing audio player architecture
  const handlePlayEpisode = async (series: Series, episode: Episode) => {
    // 1. User login check
    if (!currentUser) {
      handleOpenUserAuth(
        'play_story',
        t('auth_prompt_listen', 'গল্প শুনতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন বা রেজিস্টার করুন।')
      );
      return;
    }

    // 2. Evaluate Episode Access (Rules 4, 6, 7, 8, 9)
    const access = evaluateEpisodeAccess(episode, subscription);
    if (!access.unlocked) {
      if (access.reason === 'needs_pass') {
        // Previously purchased, but Main Pass expired -> Prompt to renew ₹20 pass
        handleOpenSubscriptionFlow(null);
        return;
      }
      // Needs individual episode ticket (e.g. ₹5)
      setTargetPaywallEpisode(episode);
      setTargetPaywallSeries(series);
      setTargetPaywallStory(null);
      setIsSubscriptionModalOpen(true);
      return;
    }

    // 3. Resolve Playback Audio Stream URL:
    // Free / Trailer: play existing public audioUrl directly
    // Paid: call getEpisodeStreamUrl() backend authorization to obtain temporary signed stream URL
    let resolvedAudioUrl = (episode.audioUrl || '').trim();
    if (episode.accessType === 'paid') {
      try {
        resolvedAudioUrl = await getSecureEpisodeStreamUrl(series.id, episode.id);
      } catch (err: any) {
        console.error('Failed to get secure episode stream URL:', err);
        const errorMsg = err?.message || 'অডিও স্ট্রিম লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
        setPlaybackNotice(errorMsg);
        setTimeout(() => setPlaybackNotice(null), 4000);
        return;
      }
    }

    // 4. Adapt Episode into Story for audio player
    setActiveSeries(series);
    setActivePlayingEpisode(episode);

    const episodeAsStory: Story = {
      id: episode.id,
      title: episode.title,
      tagline: `${series.title} • পর্ব ${episode.episodeNumber}`,
      description: episode.description || series.description,
      author: series.author || 'জয় (Joy)',
      narrator: series.author || 'কথক',
      voiceStyle: 'mysterious',
      genre: (series.genre as StoryGenre) || 'রোমাঞ্চ ও থ্রিলার',
      lengthCategory: 'medium',
      duration: episode.duration,
      isLittlePassOnly: episode.accessType === 'paid',
      pricingType: episode.accessType === 'paid' ? 'single_pay' : 'free',
      singlePurchasePrice: episode.price || 0,
      audioUrl: resolvedAudioUrl,
      coverImage: episode.thumbnail || series.thumbnail,
      colorGradient: 'from-purple-900 via-pink-950 to-black',
      releaseDate: episode.publishedAt || episode.createdAt,
      rating: 4.95,
      listenCount: 1,
      chapters: [],
      transcript: [],
      fullStoryText: episode.description,
      storyType: 'series_episode',
    };

    handlePlayStoryDirect(episodeAsStory);
  };

  // Series / Episode Deep-linking handler (Rules 18, 19)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    let targetSeriesId: string | null = null;
    let targetEpId: string | null = null;

    const seriesMatch = pathname.match(/^\/series\/([^/]+)(?:\/episode\/([^/]+))?/);
    if (seriesMatch) {
      targetSeriesId = seriesMatch[1];
      targetEpId = seriesMatch[2] || null;
    } else if (searchParams.has('series')) {
      targetSeriesId = searchParams.get('series');
      targetEpId = searchParams.get('episode');
    }

    if (targetSeriesId) {
      const foundSeries = seriesList.find((s) => s.id === targetSeriesId);
      if (foundSeries) {
        setActiveSeries(foundSeries);
        setIsSeriesModalOpen(true);

        if (targetEpId) {
          const epList = INITIAL_SERIES_EPISODES[targetSeriesId] || [];
          const foundEp = epList.find((e) => e.id === targetEpId);
          if (foundEp) {
            handlePlayEpisode(foundSeries, foundEp);
          }
        }
      }
    }
  }, [seriesList]);

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

    // Persist immediately to Google AI Studio Firestore
    saveTransactionToFirestore(newTx).catch(console.error);
    saveSubscriberToFirestore(newLead).catch(console.error);

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
      unlockedStoryIds: txData.targetStoryId
        ? Array.from(new Set([...(subscription?.unlockedStoryIds || []), txData.targetStoryId]))
        : subscription?.unlockedStoryIds || [],
      unlockedEpisodeIds: txData.targetEpisodeId
        ? Array.from(new Set([...(subscription?.unlockedEpisodeIds || []), txData.targetEpisodeId]))
        : subscription?.unlockedEpisodeIds || [],
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

    // If user unlocked an episode, start playback
    if (targetPaywallEpisode && targetPaywallSeries) {
      handlePlayEpisode(targetPaywallSeries, targetPaywallEpisode);
      setTargetPaywallEpisode(null);
      setTargetPaywallSeries(null);
    }
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
      saveTransactionToFirestore(tx).catch(console.error);
      const matchingLead = subscribers.find((lead) => lead.transactionId === tx.utrTransactionId);
      if (matchingLead) {
        saveSubscriberToFirestore({ ...matchingLead, verificationStatus: 'verified' }).catch(console.error);
      }
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
        unlockedEpisodeIds: tx.targetEpisodeId
          ? Array.from(new Set([...(prev.unlockedEpisodeIds || []), tx.targetEpisodeId]))
          : prev.unlockedEpisodeIds || [],
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

      // If user was waiting for paywalled story or episode, start playback
      if (targetPaywallStory) {
        handlePlayStory(targetPaywallStory);
        setTargetPaywallStory(null);
      } else if (targetPaywallEpisode && targetPaywallSeries) {
        handlePlayEpisode(targetPaywallSeries, targetPaywallEpisode);
        setTargetPaywallEpisode(null);
        setTargetPaywallSeries(null);
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
          const updatedLead = { ...lead, verificationStatus: 'rejected' as const };
          saveSubscriberToFirestore(updatedLead).catch(console.error);
          return updatedLead;
        }
        return lead;
      })
    );

    if (targetTx) {
      saveTransactionToFirestore({
        ...targetTx,
        status: 'rejected',
        rejectedBy: 'জয় (সুপার অ্যাডমিন)',
        rejectedDate: timeStr,
        rejectionReason: reason,
      }).catch(console.error);
    }

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
      prev.map((t) => {
        if (t.id === transactionId) {
          const updated = {
            ...t,
            status: 'paid' as const,
            rejectionReason: `রিফান্ড বাতিল: ${reason}`,
          };
          saveTransactionToFirestore(updated).catch(console.error);
          return updated;
        }
        return t;
      })
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
          saveTransactionToFirestore(refundedTx).catch(console.error);
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
        prev.map((t) => {
          if (t.id === latestPaid.id) {
            const updated = {
              ...t,
              status: 'cancelled' as const,
              cancellationDate: timeStr,
              cancellationReason: reason || 'ব্যবহারকারী স্বেচ্ছায় বাতিল করেছেন',
            };
            saveTransactionToFirestore(updated).catch(console.error);
            return updated;
          }
          return t;
        })
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
    saveUpiConfigToFirestore(newConfig).catch(console.error);
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
      prev.map((s) => {
        if (s.id === subscriberId) {
          const updated = { ...s, verificationStatus: status };
          saveSubscriberToFirestore(updated).catch(console.error);
          return updated;
        }
        return s;
      })
    );
  };

  const handleDeleteSubscriber = (subscriberId: string) => {
    setSubscribers((prev) => prev.filter((s) => s.id !== subscriberId));
    deleteSubscriberFromFirestore(subscriberId).catch(console.error);
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
    saveLifeStoryToFirestore(newSub).catch(console.error);
  };

  const handleUpdateLifeStoryStatus = (
    submissionId: string,
    status: 'new' | 'contacted' | 'recorded' | 'archived'
  ) => {
    setLifeStorySubmissions((prev) =>
      prev.map((item) => {
        if (item.id === submissionId) {
          const updated = { ...item, status };
          saveLifeStoryToFirestore(updated).catch(console.error);
          return updated;
        }
        return item;
      })
    );
  };

  const handleDeleteLifeStorySubmission = (submissionId: string) => {
    setLifeStorySubmissions((prev) => prev.filter((item) => item.id !== submissionId));
    deleteLifeStoryFromFirestore(submissionId).catch(console.error);
  };

  // Story Publishing
  const handleAddNewStory = (newStory: Story) => {
    setStories((prev) => {
      const updated = [newStory, ...prev.filter((s) => s.id !== newStory.id)];
      localStorage.setItem('goppo_kahini_custom_stories', JSON.stringify(updated));
      return updated;
    });
    saveStoryToFirestore(newStory).catch(console.error);
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
    saveNarratorAppToFirestore(newApp).catch(console.error);
  };

  const handleApproveNarrator = (appId: string, approvalCode: string) => {
    setNarratorApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const approved = {
            ...a,
            status: 'approved' as const,
            approvalCode,
            approvedDate: new Date().toISOString().split('T')[0],
            approvedBy: 'জয় (Joy)',
          };
          saveNarratorAppToFirestore(approved).catch(console.error);
          return approved;
        }
        return a;
      })
    );
  };

  const handleRejectNarrator = (appId: string) => {
    setNarratorApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const rejected = { ...a, status: 'rejected' as const };
          saveNarratorAppToFirestore(rejected).catch(console.error);
          return rejected;
        }
        return a;
      })
    );
  };

  const handleDeleteNarratorApp = (appId: string) => {
    setNarratorApplications((prev) => prev.filter((a) => a.id !== appId));
    deleteNarratorAppFromFirestore(appId).catch(console.error);
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
        handleOpenUserAuth('library', t('login_required_bookmarks', 'বুকমার্ক ও সংরক্ষিত গল্প দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।'));
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

  // Filtered stories logic (Search + Length Category + Genre + Access + Sort)
  const filteredStories = stories
    .filter((story) => {
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

      // Language filter
      if (selectedStoryLanguage === 'bn') {
        const isBn = !story.language || story.language === 'bn';
        if (!isBn) return false;
      } else if (selectedStoryLanguage === 'hi') {
        if (story.language !== 'hi') return false;
      } else if (selectedStoryLanguage === 'en') {
        if (story.language !== 'en') return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.listenCount * (b.rating || 4.5)) - (a.listenCount * (a.rating || 4.5));
      }
      if (sortBy === 'rating') {
        return (b.rating || 4.5) - (a.rating || 4.5);
      }
      if (sortBy === 'latest') {
        return b.id.localeCompare(a.id);
      }
      return 0; // Default/trending maintains curated story order
    });

  // Base stories prioritized by audience language
  const storiesForSelectedLanguage = useMemo(() => {
    if (selectedStoryLanguage === 'all') return stories;
    if (selectedStoryLanguage === 'bn') {
      return stories.filter((s) => !s.language || s.language === 'bn');
    }
    if (selectedStoryLanguage === 'hi') {
      return stories.filter((s) => s.language === 'hi');
    }
    if (selectedStoryLanguage === 'en') {
      return stories.filter((s) => s.language === 'en');
    }
    return stories;
  }, [stories, selectedStoryLanguage]);

  // --- 5 Streamlined Story Collections for Home Flow ---

  // 1. New Releases (নতুন প্রকাশিত গল্প) - sorted by newest release date first
  const newReleaseStories = useMemo(() => {
    return [...storiesForSelectedLanguage].sort((a, b) => {
      const getTimestamp = (s: Story) => {
        if (s.releaseDate) {
          const t = new Date(s.releaseDate).getTime();
          if (!isNaN(t)) return t;
        }
        if (typeof s.createdAt === 'number') return s.createdAt;
        if (typeof s.createdAt === 'string') {
          const t = new Date(s.createdAt).getTime();
          if (!isNaN(t)) return t;
        }
        return 0;
      };
      return getTimestamp(b) - getTimestamp(a);
    });
  }, [storiesForSelectedLanguage]);

  // 2. Popular & Trending (জনপ্রিয় ও ট্রেন্ডিং গল্প) - ONE combined section using real listenCount & rating
  const popularTrendingStories = useMemo(() => {
    return [...storiesForSelectedLanguage]
      .filter((s) => s.listenCount > 0 || (s.rating && s.rating > 0))
      .sort((a, b) => (b.listenCount * (b.rating || 4.5)) - (a.listenCount * (a.rating || 4.5)));
  }, [storiesForSelectedLanguage]);

  // 3. Free Stories (ফ্রি গল্প) - currently available free stories
  const freeStories = useMemo(() => {
    return storiesForSelectedLanguage.filter((s) => !s.isLittlePassOnly);
  }, [storiesForSelectedLanguage]);

  // 4. This Month's Stories (এই মাসের গল্প) - published during current calendar month (dynamic)
  const thisMonthStories = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return storiesForSelectedLanguage.filter((story) => {
      let d: Date | null = null;
      if (story.releaseDate) {
        d = new Date(story.releaseDate);
      } else if (story.createdAt) {
        d = new Date(story.createdAt);
      }
      if (!d || isNaN(d.getTime())) return false;
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [storiesForSelectedLanguage]);

  // 5. Mega Premium Series (মেগা প্রিমিয়াম সিরিজ) - only if content exists
  const megaSeriesStories = useMemo(() => {
    return storiesForSelectedLanguage.filter(
      (s) => s.lengthCategory === 'mega' || s.pricingType === 'mega_exclusive'
    );
  }, [storiesForSelectedLanguage]);

  const isFilterActive =
    searchQuery.trim() !== '' ||
    selectedGenre !== 'All' ||
    selectedLengthCategory !== 'all' ||
    accessFilter !== 'all' ||
    sortBy !== 'trending';

  const activeFilterCount =
    (selectedGenre !== 'All' ? 1 : 0) +
    (selectedLengthCategory !== 'all' ? 1 : 0) +
    (accessFilter !== 'all' ? 1 : 0) +
    (sortBy !== 'trending' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  const handleResetAllFilters = () => {
    setSelectedLengthCategory('all');
    setSelectedGenre('All');
    setAccessFilter('all');
    setSortBy('trending');
    setSearchQuery('');
  };

  const handleScrollToSector = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Theme styling definitions - Light Purple (White / Lilac) vs Dark Purple & Black
  const themeContainerClass = isLight
    ? 'bg-[#fcfaff] text-zinc-900 selection:bg-purple-200 selection:text-purple-900'
    : 'bg-[#120a1c] text-zinc-100 selection:bg-pink-500/30 selection:text-pink-300';

  const heroSectionClass = isLight
    ? 'border-b border-purple-200/80 bg-gradient-to-b from-purple-100/60 via-purple-50/40 to-[#fcfaff]'
    : 'border-b border-purple-900/30 bg-gradient-to-b from-[#2a1442]/90 via-[#1d0e2f]/90 to-[#140921]';

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
          deleteStoryFromFirestore(id).catch(console.error);
        }}
        lifeStoryEpisodes={lifeStories}
        onAddLifeStoryEpisode={(ep) => {
          setLifeStories((prev) => [ep, ...prev]);
          savePodcastEpisodeToFirestore(ep).catch(console.error);
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
            handleOpenUserAuth('library', t('login_required_bookmarks', 'সংরক্ষিত গল্প দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।'));
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
            handleOpenUserAuth('library', t('login_required_history', 'পূর্বে শোনা গল্পের তালিকা দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।'));
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
        onToggleTheme={handleToggleTheme}
        activeView={activeMainView}
        onSelectView={(view) => setActiveMainView(view)}
        currentUser={currentUser}
        onOpenUserAuth={handleOpenUserAuth}
        onOpenUserAccount={() => setIsUserAccountOpen(true)}
        onLogoutUser={handleLogoutUser}
        onSelectPolicy={handleSelectPolicy}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        onOpenLanguageModal={() => setIsLanguageOnboardingOpen(true)}
        onGoHome={() => {
          setActiveMainView('stories');
          setCurrentPolicyPage(null);
          setSearchQuery('');
          if (typeof window !== 'undefined') {
            window.history.pushState(null, '', '/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      {/* CONDITIONAL MAIN VIEW: 1. LEGAL & SUPPORT PAGE OR 2. LIFE STORIES OR 3. STORIES */}
      {currentPolicyPage ? (
        <LegalSupportPage
          initialSlug={currentPolicyPage}
          onNavigateHome={handleNavigateHomeFromPolicy}
          onSelectPolicy={handleSelectPolicy}
          theme={theme}
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
          {/* Hero Banner - Clean, Compact, Emotionally Appealing & Minimal */}
          <section
            className={`relative overflow-hidden py-4 sm:py-6 px-3.5 sm:px-6 lg:px-8 border-b transition-colors ${
              isLight
                ? 'border-purple-200/80 bg-gradient-to-b from-purple-100/50 via-purple-50/30 to-[#fcfaff]'
                : 'border-purple-900/30 bg-gradient-to-b from-[#1f1030]/90 via-[#160c23]/95 to-[#120a1c]'
            }`}
          >
            {/* Soft Ambient Light Glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative mx-auto max-w-5xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left Content: Emotionally appealing tagline & Single Pass CTA */}
                <div className="max-w-xl">
                  {/* Emotional Tagline: naturally translatable to Bengali, Hindi & English */}
                  <h1
                    className={`font-serif-story text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-snug ${
                      isLight ? 'text-zinc-900' : 'text-white'
                    }`}
                  >
                    {t('hero_tagline', 'প্রতিটি গল্পে এক নতুন অনুভূতি')}
                  </h1>

                  <p
                    className={`mt-1 text-xs sm:text-sm font-medium ${
                      isLight ? 'text-zinc-600' : 'text-purple-200/80'
                    }`}
                  >
                    {t('hero_subtitle', 'হৃদয় ছোঁয়া বাংলা গল্প ও প্রশান্তিময় সুর')}
                  </p>

                  {/* Single Clean Pass CTA - Dynamic Country Price (India: ₹20 / Bangladesh: ৳25) */}
                  <div className="mt-3.5 flex items-center gap-3 flex-wrap">
                    {subscription?.status !== 'active' ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleOpenSubscriptionFlow(null)}
                          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 hover:from-purple-500 hover:to-pink-500 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-pink-950/40 hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                        >
                          <Crown className="h-3.5 w-3.5 fill-white" />
                          <span>{passPriceConfig.ctaText}</span>
                        </button>
                        <span
                          className={`text-[11px] font-semibold ${
                            isLight ? 'text-zinc-500' : 'text-purple-300/80'
                          }`}
                        >
                          ({passPriceConfig.validityText})
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsSubscriptionManagerOpen(true)}
                        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                          isLight
                            ? 'bg-pink-50 border-pink-300 text-pink-700 hover:bg-pink-100'
                            : 'bg-pink-500/15 border-pink-500/40 text-pink-300 hover:bg-pink-500/25'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-pink-500" />
                        <span>{t('pass_active', 'পাস সক্রিয় (ম্যানেজ করুন)')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Compact Featured Story Highlight */}
                {stories[0] && (
                  <div
                    className={`hidden sm:flex items-center gap-3 rounded-2xl border p-2.5 sm:p-3 shrink-0 max-w-xs transition-colors ${
                      isLight
                        ? 'border-purple-200/90 bg-white/95 text-zinc-900 shadow-xs'
                        : 'border-purple-900/40 bg-[#150d22]/90 text-white shadow-md'
                    }`}
                  >
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-black border border-purple-900/30 shrink-0">
                      <img
                        src={stories[0]?.coverImage || INITIAL_STORIES[0].coverImage}
                        alt={stories[0]?.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-bold text-pink-500 uppercase tracking-wider block">
                        {t('today_featured', 'আজকের বিশেষ গল্প')}
                      </span>
                      <h4
                        className={`font-serif-story text-xs font-bold truncate ${
                          isLight ? 'text-zinc-900' : 'text-white'
                        }`}
                      >
                        {stories[0]?.title}
                      </h4>
                      <p
                        className={`text-[10px] truncate ${
                          isLight ? 'text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        {stories[0]?.narrator}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePlayStory(stories[0])}
                      className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-2.5 py-1 text-[11px] font-bold text-white transition-all shadow-xs shrink-0 active:scale-95"
                    >
                      {t('listen', 'শুনুন')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Main Catalog */}
          <main className="mx-auto max-w-7xl w-full flex-1 px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
            
            {/* New Series Section (ADD-ONLY, Rule 21) */}
            <SeriesSection
              seriesList={seriesList}
              onSelectSeries={(series) => {
                setActiveSeries(series);
                setIsSeriesModalOpen(true);
              }}
              theme={theme}
            />

            {/* Clean, Premium Filter & Explore Section */}
            <FilterExploreSection
              selectedGenre={selectedGenre}
              onSelectGenre={setSelectedGenre}
              selectedLengthCategory={selectedLengthCategory}
              onSelectLengthCategory={setSelectedLengthCategory}
              accessFilter={accessFilter}
              onSelectAccessFilter={setAccessFilter}
              sortBy={sortBy}
              onSelectSortBy={setSortBy}
              activeFilterCount={activeFilterCount}
              onResetAll={handleResetAllFilters}
              catalogViewMode={catalogViewMode}
              onSelectCatalogViewMode={setCatalogViewMode}
              gridDensity={gridDensity}
              onSelectGridDensity={setGridDensity}
              isLight={isLight}
              totalStoryCount={stories.length}
              matchingStoryCount={filteredStories.length}
              selectedLanguageFilter={selectedStoryLanguage}
              onSelectLanguageFilter={setSelectedStoryLanguage}
            />

            {/* Stories Display Area */}
            {isFilterActive ? (
              /* Filtered Results View */
              <div>
                <div className={`mb-4 flex items-center justify-between rounded-2xl border p-3.5 transition-colors ${
                  isLight ? 'border-purple-200 bg-purple-50/70 text-purple-950' : 'border-purple-900/30 bg-[#14101c] text-zinc-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-pink-500" />
                    <span className="text-xs sm:text-sm font-semibold">
                      {t('search_results_title', 'খোঁজার ফলাফল')}: <span className="font-bold text-pink-500">{filteredStories.length} {t('stories_found', 'টি গল্প')}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetAllFilters}
                    className="flex items-center gap-1 text-xs font-semibold text-pink-500 hover:underline hover:text-pink-600"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{t('see_all_sectors_btn', 'সব গল্প দেখুন')}</span>
                  </button>
                </div>

                {filteredStories.length === 0 ? (
                  <div className={`rounded-3xl border p-12 text-center transition-colors ${
                    isLight ? 'border-purple-200 bg-white text-zinc-600 shadow-sm' : 'border-purple-900/30 bg-[#14101c]/90 text-zinc-400'
                  }`}>
                    <p className={`text-sm ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{t('no_stories_found', 'আপনার পছন্দের কোনো গল্প পাওয়া যায়নি। ফিল্টার পরিবর্তন করে দেখুন।')}</p>
                    <button
                      onClick={handleResetAllFilters}
                      className="mt-3 text-xs text-pink-500 hover:underline font-medium"
                    >
                      {t('reset_all_filters_btn', 'সব ফিল্টার রিসেট করুন')}
                    </button>
                  </div>
                ) : (
                  <div className={gridDensity === 'compact'
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3'
                    : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'
                  }>
                    {filteredStories.map((story) => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        compact={gridDensity === 'compact'}
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
                        theme={theme}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : catalogViewMode === 'grid' ? (
              /* Full Unified Grid View */
              <div className={gridDensity === 'compact'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3'
                : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'
              }>
                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    compact={gridDensity === 'compact'}
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
                    theme={theme}
                  />
                ))}
              </div>
            ) : (
              /* 5 Streamlined Story Sections (Clean, Story-Focused, Minimal) */
              <div className="space-y-10 sm:space-y-12">

                {/* Section 1: নতুন প্রকাশিত গল্প (New Releases - max 6, newest first, small new badge) */}
                {newReleaseStories.length > 0 && (
                  <section id="section-new-releases" className="scroll-mt-20">
                    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 border-purple-200/50 dark:border-purple-900/30">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 text-pink-600 dark:text-pink-400">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base sm:text-lg font-bold ${
                              isLight ? 'text-zinc-900 font-display' : 'text-zinc-100 font-display'
                            }`}>
                              {t('new_releases_title', 'নতুন প্রকাশিত গল্প')}
                            </h3>
                            <span className="rounded-full bg-pink-100 dark:bg-pink-950/60 border border-pink-300/60 dark:border-pink-700/40 px-2 py-0.5 text-[10px] font-bold text-pink-800 dark:text-pink-300">
                              {t('badge_new', 'নতুন')}
                            </span>
                          </div>
                          <p className={`text-[11px] sm:text-xs mt-0.5 ${
                            isLight ? 'text-zinc-600' : 'text-zinc-400'
                          }`}>
                            {t('new_releases_sub', 'সর্বশেষ যুক্ত হওয়া রোমাঞ্চকর ও মনোগ্রাহী গল্প')}
                          </p>
                        </div>
                      </div>

                      {newReleaseStories.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setSortBy('latest')}
                          className={`text-xs font-semibold hover:underline flex items-center gap-0.5 ${
                            isLight ? 'text-purple-700' : 'text-pink-400'
                          }`}
                        >
                          <span>{t('see_all', 'সবগুলো দেখুন')}</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className={gridDensity === 'compact'
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3'
                      : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'
                    }>
                      {newReleaseStories.slice(0, 6).map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          compact={gridDensity === 'compact'}
                          isNew={true}
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
                          theme={theme}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 2: জনপ্রিয় ও ট্রেন্ডিং গল্প (Popular & Trending - ONE combined section) */}
                {popularTrendingStories.length > 0 && (
                  <section id="section-popular-trending" className="scroll-mt-20">
                    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 border-purple-200/50 dark:border-purple-900/30">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          <Flame className="h-4 w-4 fill-current text-amber-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base sm:text-lg font-bold ${
                              isLight ? 'text-zinc-900 font-display' : 'text-zinc-100 font-display'
                            }`}>
                              {t('popular_trending_title', 'জনপ্রিয় ও ট্রেন্ডিং গল্প')}
                            </h3>
                            <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-700/40 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                              {t('top_rated', 'শীর্ষ রেটেড')}
                            </span>
                          </div>
                          <p className={`text-[11px] sm:text-xs mt-0.5 ${
                            isLight ? 'text-zinc-600' : 'text-zinc-400'
                          }`}>
                            {t('popular_trending_sub', 'শ্রোতাদের সর্বাধিক পছন্দের ও সবচেয়ে বেশি শোনা গল্প')}
                          </p>
                        </div>
                      </div>

                      {popularTrendingStories.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setSortBy('popular')}
                          className={`text-xs font-semibold hover:underline flex items-center gap-0.5 ${
                            isLight ? 'text-purple-700' : 'text-pink-400'
                          }`}
                        >
                          <span>{t('see_all', 'সবগুলো দেখুন')}</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className={gridDensity === 'compact'
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3'
                      : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'
                    }>
                      {popularTrendingStories.slice(0, 6).map((story, index) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          compact={gridDensity === 'compact'}
                          rankingNumber={index + 1}
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
                          theme={theme}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 3: ফ্রি গল্প (Free Stories - Max 6, individual Free badge, hide if empty) */}
                {freeStories.length > 0 && (
                  <section id="section-free-stories" className="scroll-mt-20">
                    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 border-purple-200/50 dark:border-purple-900/30">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          <Gift className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base sm:text-lg font-bold ${
                              isLight ? 'text-zinc-900 font-display' : 'text-zinc-100 font-display'
                            }`}>
                              {t('free_stories_title', 'ফ্রি গল্প')}
                            </h3>
                            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-700/40 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                              {freeStories.length} {t('open_stories_badge', 'টি উন্মুক্ত')}
                            </span>
                          </div>
                          <p className={`text-[11px] sm:text-xs mt-0.5 ${
                            isLight ? 'text-zinc-600' : 'text-zinc-400'
                          }`}>
                            {t('free_stories_sub', 'কোনো পাস ছাড়াই সম্পূর্ণ বিনামূল্যে উন্মুক্ত গল্প')}
                          </p>
                        </div>
                      </div>

                      {freeStories.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setAccessFilter('free')}
                          className={`text-xs font-semibold hover:underline flex items-center gap-0.5 ${
                            isLight ? 'text-purple-700' : 'text-pink-400'
                          }`}
                        >
                          <span>{t('see_all', 'সবগুলো দেখুন')}</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className={gridDensity === 'compact'
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3'
                      : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'
                    }>
                      {freeStories.slice(0, 6).map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          compact={gridDensity === 'compact'}
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
                          theme={theme}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 4: এই মাসের গল্প (This Month's Stories - Dynamic calendar month, hidden if empty) */}
                {thisMonthStories.length > 0 && (
                  <section id="section-this-month" className="scroll-mt-20">
                    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 border-purple-200/50 dark:border-purple-900/30">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-300">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base sm:text-lg font-bold ${
                              isLight ? 'text-zinc-900 font-display' : 'text-zinc-100 font-display'
                            }`}>
                              {t('this_month_title', 'এই মাসের গল্প')}
                            </h3>
                            <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-300/60 dark:border-blue-700/40 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300">
                              {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'en' ? 'en-US' : 'bn-BD', { month: 'long' })}
                            </span>
                          </div>
                          <p className={`text-[11px] sm:text-xs mt-0.5 ${
                            isLight ? 'text-zinc-600' : 'text-zinc-400'
                          }`}>
                            {t('this_month_sub', 'চলতি মাসে প্রকাশিত বিশেষ আকর্ষণীয় গল্পসমূহ')}
                          </p>
                        </div>
                      </div>

                      {thisMonthStories.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setShowAllThisMonth(!showAllThisMonth)}
                          className={`text-xs font-semibold hover:underline flex items-center gap-0.5 ${
                            isLight ? 'text-purple-700' : 'text-pink-400'
                          }`}
                        >
                          <span>{showAllThisMonth ? t('show_less', 'কম দেখুন') : t('see_all', 'সবগুলো দেখুন')}</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className={gridDensity === 'compact'
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3'
                      : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'
                    }>
                      {(showAllThisMonth ? thisMonthStories : thisMonthStories.slice(0, 6)).map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          compact={gridDensity === 'compact'}
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
                          theme={theme}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 5: মেগা প্রিমিয়াম সিরিজ (Mega Premium Series - ONLY IF CONTENT EXISTS) */}
                {megaSeriesStories.length > 0 && (
                  <section id="section-mega-series" className="scroll-mt-20">
                    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 border-purple-200/50 dark:border-purple-900/30">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300">
                          <Crown className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base sm:text-lg font-bold ${
                              isLight ? 'text-zinc-900 font-display' : 'text-zinc-100 font-display'
                            }`}>
                              {t('mega_premium_title', 'মেগা প্রিমিয়াম সিরিজ')}
                            </h3>
                            <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-300/60 dark:border-purple-700/40 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:text-purple-300">
                              {t('badge_mega', 'মেগা পাস')}
                            </span>
                          </div>
                          <p className={`text-[11px] sm:text-xs mt-0.5 ${
                            isLight ? 'text-zinc-600' : 'text-zinc-400'
                          }`}>
                            {t('mega_premium_sub', 'দীর্ঘ উপন্যাসধর্মী ধারাবাহিক ও এক্সক্লুসিভ মেগা অডিও')}
                          </p>
                        </div>
                      </div>

                      {megaSeriesStories.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setSelectedLengthCategory('mega')}
                          className={`text-xs font-semibold hover:underline flex items-center gap-0.5 ${
                            isLight ? 'text-purple-700' : 'text-pink-400'
                          }`}
                        >
                          <span>{t('see_all', 'সবগুলো দেখুন')}</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className={gridDensity === 'compact'
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3'
                      : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'
                    }>
                      {megaSeriesStories.slice(0, 6).map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          compact={gridDensity === 'compact'}
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
                          theme={theme}
                        />
                      ))}
                    </div>
                  </section>
                )}

              </div>
            )}

          </main>
        </>
      )}

      {/* App Footer */}
      <footer className={`mt-auto border-t py-6 px-4 text-center text-xs transition-colors ${
        isLight ? 'border-purple-200 bg-white text-zinc-600' : 'border-purple-900/30 bg-[#120a1c]/90 text-zinc-400'
      }`}>
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`font-serif-story font-bold ${isLight ? 'text-purple-950' : 'text-zinc-300'}`}>
              {language === 'bn' ? 'গপ্পো কাহিনী' : 'Goppo Kahini'}
            </span>
            <span className={isLight ? 'text-purple-300' : 'text-zinc-400'}>•</span>
            <span className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {t('footer_tagline', 'বাংলার নিখাদ রোমাঞ্চ ও মানুষের জীবনের সত্য কথা')}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
            <button
              onClick={() => {
                if (currentPolicyPage) handleNavigateHomeFromPolicy();
                setActiveMainView('stories');
              }}
              className={`transition-colors ${isLight ? 'text-zinc-600 hover:text-purple-950 font-medium' : 'text-zinc-400 hover:text-white'}`}
            >
              {t('nav_stories', 'গল্পঘর')}
            </button>

            <button
              onClick={() => {
                if (currentPolicyPage) handleNavigateHomeFromPolicy();
                setActiveMainView('lifestories');
              }}
              className="text-pink-500 hover:text-pink-600 font-semibold transition-colors"
            >
              🎙️ {t('life_stories_title', 'মানুষের জীবন কথা')}
            </button>

            <button
              onClick={() => setIsNarratorAppModalOpen(true)}
              className={`font-semibold transition-colors ${isLight ? 'text-purple-700 hover:text-purple-900' : 'text-purple-300 hover:text-purple-200'}`}
            >
              {t('narrator_audition', 'কথক অডিশন')}
            </button>

            {/* Mobile-First Compact Legal & Support Dropdown */}
            <LegalSupportDropdown
              variant="footer-dropdown"
              theme={theme}
              onSelectPolicy={handleSelectPolicy}
            />

            {creatorSession?.isLoggedIn && (
              <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${
                isLight ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-[#1a1426] border-purple-900/40 text-pink-300'
              }`}>
                <span className="font-semibold">
                  {creatorSession.role === 'super_admin' ? '👑 Admin' : `🎙️ ${creatorSession.name}`}
                </span>
                <button
                  onClick={() => setIsStudioOpen(true)}
                  className="text-pink-500 hover:underline text-[10px]"
                >
                  {t('creator_studio', 'স্টুডিও')}
                </button>
                <button
                  onClick={handleCreatorLogout}
                  className="text-rose-500 hover:underline text-[10px]"
                >
                  {t('logout', 'লগআউট')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={`mt-3 pt-3 border-t max-w-5xl mx-auto flex items-center justify-center text-[11px] ${
          isLight ? 'border-purple-200/60 text-zinc-500' : 'border-purple-900/30 text-zinc-400'
        }`}>
          <span>© 2026 Goppo Kahini. All rights reserved.</span>
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
        theme={theme}
      />

      {/* Mobile App Bottom Navigation Bar with 5 tabs */}
      <MobileBottomNav
        currentTab={mobileTab}
        onSelectTab={handleSelectMobileTab}
        subscription={subscription}
        bookmarkCount={bookmarks.length}
        currentUser={currentUser}
        onRequireLogin={(msg) => handleOpenUserAuth('library', msg)}
        theme={theme}
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
        onClose={() => {
          setIsSubscriptionModalOpen(false);
          setTargetPaywallEpisode(null);
          setTargetPaywallSeries(null);
        }}
        upiConfig={upiConfig}
        onSubmitPayment={handleSubmitPayment}
        existingTransactions={paymentTransactions}
        targetStory={targetPaywallStory}
        targetEpisode={targetPaywallEpisode}
        targetSeries={targetPaywallSeries}
        currentSubscription={subscription}
        currentUser={currentUser}
        onOpenUserAuth={() => handleOpenUserAuth('take_pass')}
      />

      {/* Series Detail Modal (ADD-ONLY, Rule 20) */}
      <SeriesDetailModal
        isOpen={isSeriesModalOpen}
        onClose={() => setIsSeriesModalOpen(false)}
        series={activeSeries}
        episodes={seriesEpisodes}
        subscription={subscription}
        currentPlayingEpisodeId={activePlayingEpisode?.id}
        isPlaying={isPlaying}
        onPlayEpisode={handlePlayEpisode}
        onUnlockEpisode={(series, ep) => {
          setTargetPaywallEpisode(ep);
          setTargetPaywallSeries(series);
          setTargetPaywallStory(null);
          setIsSubscriptionModalOpen(true);
        }}
        onRenewMainPass={() => {
          setTargetPaywallStory(null);
          setTargetPaywallEpisode(null);
          setTargetPaywallSeries(null);
          handleOpenSubscriptionFlow(null);
        }}
        theme={theme}
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
          currentUser={
            currentUser ||
            (creatorSession?.isLoggedIn
              ? {
                  uid: 'XENByyR5dOY1i0NqI0ridlEmVc23',
                  email: creatorSession.email || 'joydas.21071997@gmail.com',
                  displayName: creatorSession.name || 'জয় (প্রতিষ্ঠাতা)',
                  role: 'admin',
                  emailVerified: true,
                  createdAt: '2026-01-01T00:00:00.000Z',
                  provider: 'password',
                }
              : null)
          }
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

      {/* Playback Notice Toast Banner */}
      {playbackNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-red-950/90 text-red-200 border border-red-800/80 shadow-2xl backdrop-blur-md text-sm font-medium animate-in fade-in slide-in-from-top-4 flex items-center gap-3 max-w-md mx-4">
          <Info className="w-5 h-5 text-red-400 shrink-0" />
          <span>{playbackNotice}</span>
        </div>
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
          onFinish={handleSplashFinish}
          durationMs={2500}
        />
      )}

      {/* Audience Language Selection Onboarding Modal (বাংলা, हिन्दी, English) */}
      <LanguageOnboardingModal
        isOpen={isLanguageOnboardingOpen}
        onClose={() => setIsLanguageOnboardingOpen(false)}
        onSelectLanguage={handleSelectOnboardingLanguage}
        isLight={isLight}
      />

      {/* Notification Permission Request Modal */}
      <NotificationPermissionModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        isLight={isLight}
      />

    </div>
  );
}
