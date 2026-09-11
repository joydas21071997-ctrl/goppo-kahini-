import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  Crown,
  Sparkles,
  Sliders,
  CheckCircle2,
  X,
  Info,
  Moon,
  Mic,
  KeyRound,
  Radio,
  Headphones,
  Lock,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  User,
  FileText,
  Clock,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { GoppoKahiniLogo } from './GoppoKahiniLogo';
import { ThemeMode, CreatorSession, AudienceUser } from '../types';
import { isAuthorizedAdmin } from '../services/adminAuth';
import { LegalSupportDropdown } from './legal/LegalSupportDropdown';
import { LegalPolicySlug } from '../data/legalPolicies';

interface NavbarProps {
  isSubscribed: boolean;
  onOpenSubscriptionModal: () => void;
  onOpenSubscriptionManager: () => void;
  onOpenBookmarks: () => void;
  onOpenMixer: () => void;
  onOpenAbout: () => void;
  onOpenStudio?: () => void;
  onOpenNarratorApplication: () => void;
  onOpenCreatorLogin: () => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  onLogoutCreator?: () => void;
  creatorSession: CreatorSession | null;
  bookmarkCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeAmbientCount: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeView?: 'stories' | 'lifestories';
  onSelectView?: (view: 'stories' | 'lifestories') => void;
  currentUser: AudienceUser | null;
  onOpenUserAuth: (reason?: 'play_story' | 'take_pass' | 'library' | 'general', message?: string) => void;
  onOpenUserAccount: () => void;
  onLogoutUser: () => void;
  onSelectPolicy?: (slug: LegalPolicySlug) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSubscribed,
  onOpenSubscriptionModal,
  onOpenSubscriptionManager,
  onOpenBookmarks,
  onOpenMixer,
  onOpenAbout,
  onOpenStudio,
  onOpenNarratorApplication,
  onOpenCreatorLogin,
  onOpenHistory,
  historyCount = 0,
  onLogoutCreator,
  creatorSession,
  bookmarkCount,
  searchQuery,
  setSearchQuery,
  activeAmbientCount,
  theme,
  onToggleTheme,
  activeView = 'stories',
  onSelectView,
  currentUser,
  onOpenUserAuth,
  onOpenUserAccount,
  onLogoutUser,
  onSelectPolicy,
}) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Accordion state for "লাইব্রেরি ও অডিও ফিচার" (default collapsed to keep screen compact)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Accordion state for "কমিউনিটি ও তথ্য" (default collapsed to keep screen compact)
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  // Check if current user or session is an authorized Admin
  const isAdmin = isAuthorizedAdmin(creatorSession, currentUser);

  const closeDrawer = () => setIsMenuOpen(false);

  // Handle protected library feature click
  const handleProtectedLibraryAction = (actionCallback: () => void) => {
    if (!currentUser) {
      closeDrawer();
      onOpenUserAuth('library', 'লাইব্রেরি ও ব্যক্তিগত ফিচার ব্যবহার করতে অনুগ্রহ করে প্রথমে লগইন করুন।');
      return;
    }
    closeDrawer();
    actionCallback();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-purple-900/30 bg-[#120a1c]/95 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-[52px] sm:h-16 max-w-7xl items-center justify-between px-2.5 sm:px-6 gap-1.5 sm:gap-4">
          
          {/* Brand & Logo (গপ্পো কাহিনী) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
            <GoppoKahiniLogo size="md" showSubtitle={true} />
          </div>

          {/* Desktop Search Bar (খুঁজুন...) */}
          <div className="hidden md:flex flex-1 max-w-sm mx-3">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
              <input
                type="text"
                placeholder="গল্প, কথক বা লেখক খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-purple-900/40 bg-[#181224] py-1.5 pl-9 pr-8 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Header: Search (Mobile) + User Account / Login Chip + 3-Line Menu Button */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Mobile Search Button */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-[#181224] border border-purple-900/40 text-zinc-300 hover:text-white hover:border-pink-400 transition-all shrink-0 active:scale-95"
              title="গল্প খুঁজুন"
              aria-label="অনুসন্ধান"
            >
              <Search className="h-3.5 w-3.5 text-purple-300" />
            </button>

            {/* Quick ₹20 Pass Button (Desktop) */}
            <button
              onClick={isSubscribed ? onOpenSubscriptionManager : onOpenSubscriptionModal}
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600/90 to-pink-600/90 hover:from-purple-500 hover:to-pink-500 border border-pink-500/30 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all active:scale-95"
            >
              <Crown className="h-3.5 w-3.5 fill-white" />
              <span>{isSubscribed ? 'পাস সক্রিয়' : '₹২০ মাসিক পাস'}</span>
            </button>

            {/* User Account / Login Button */}
            {currentUser ? (
              <button
                onClick={onOpenUserAccount}
                className="flex items-center gap-1 sm:gap-2 rounded-full border border-purple-500/40 bg-[#1e132e] hover:bg-[#28183c] hover:border-pink-400 px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-xs text-white transition-all shadow-sm shrink-0 active:scale-95"
                title="আমার অ্যাকাউন্ট ও প্রোফাইল"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover border border-pink-400/50 shrink-0"
                  />
                ) : (
                  <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-pink-600 text-[10px] sm:text-[11px] font-bold text-white shrink-0">
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline font-medium text-purple-200 max-w-[100px] truncate">
                  {currentUser.displayName}
                </span>
                {isSubscribed && (
                  <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-pink-400 text-pink-400 shrink-0" />
                )}
              </button>
            ) : (
              <button
                onClick={() => onOpenUserAuth('general')}
                className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-purple-900/50 bg-[#181224] hover:bg-[#221634] hover:border-pink-500/50 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-purple-200 transition-all shrink-0 active:scale-95"
              >
                <LogIn className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-pink-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold">লগইন</span>
              </button>
            )}

            {/* 3-Line Hamburger Menu Button (তিন লাইনের মেনু বার) */}
            <button
              id="main-hamburger-menu-btn"
              onClick={() => setIsMenuOpen(true)}
              aria-label="মূল মেনু খুলুন"
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-purple-500/30 bg-[#181224] hover:bg-[#201830] hover:border-pink-400 px-2 sm:px-3.5 py-1 sm:py-2 text-xs font-bold text-white transition-all shadow-sm active:scale-95 shrink-0 touch-manipulation"
            >
              {/* Distinctive 3-Line Bars: Light Purple & Pink */}
              <div className="flex flex-col justify-between w-3.5 h-3 sm:w-4 sm:h-3.5 py-0.5 shrink-0">
                <span className="h-0.5 w-full bg-purple-300 rounded-full" />
                <span className="h-0.5 w-3/4 bg-pink-400 rounded-full" />
                <span className="h-0.5 w-full bg-purple-300 rounded-full" />
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-zinc-200">মেনু</span>

              {(bookmarkCount > 0 || activeAmbientCount > 0) ? (
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
              ) : null}
            </button>

          </div>
        </div>

        {/* Mobile Search Overlay Input */}
        {showMobileSearch && (
          <div className="md:hidden border-t border-purple-900/40 bg-[#120a1c] px-4 py-2.5 animate-fadeIn">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400" />
              <input
                type="text"
                autoFocus
                placeholder="গল্প, কথক বা লেখক খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-purple-900/40 bg-[#181224] py-2 pl-9 pr-8 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* SLIDING SIDE DRAWER (তিন লাইনের মেনুর পরিমার্জিত প্যানেল) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel Content */}
          <div 
            className="relative z-10 flex h-full w-full max-w-sm flex-col bg-[#130b1e] border-l border-purple-900/40 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-purple-900/30 bg-[#130b1e]/95 px-5 py-4 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <GoppoKahiniLogo size="sm" showSubtitle={false} />
                <div>
                  <h3 className="text-sm font-bold text-white font-serif-story leading-none">
                    গপ্পো কাহিনী মেনু
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    রোমাঞ্চ • শান্তি • মানুষের জীবন কথা
                  </p>
                </div>
              </div>

              <button
                onClick={closeDrawer}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1d122b] text-zinc-400 hover:text-white hover:bg-[#27193a] border border-purple-900/30 transition-colors"
                title="মেনু বন্ধ করুন"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body Items */}
            <div className="flex-1 p-5 space-y-4">

              {/* 1. User Account / Authentication Card */}
              {currentUser ? (
                <div className="rounded-2xl border border-purple-900/40 bg-[#1a1129] p-3.5 space-y-3">
                  <div className="flex items-center gap-3">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName}
                        className="h-11 w-11 rounded-xl object-cover border border-pink-400/40"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 font-bold text-white text-base">
                        {currentUser.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white truncate">
                          {currentUser.displayName}
                        </h4>
                        {isSubscribed && (
                          <span className="rounded-full bg-pink-500/20 px-1.5 py-0.2 text-[9px] font-bold text-pink-300 border border-pink-500/30">
                            পাস সক্রিয়
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        closeDrawer();
                        onOpenUserAccount();
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 py-2 px-2.5 text-[11px] font-semibold text-purple-200 transition-all"
                    >
                      <User className="h-3.5 w-3.5 text-pink-400" />
                      <span>প্রোফাইল ও পাস</span>
                    </button>

                    <button
                      onClick={() => {
                        closeDrawer();
                        onLogoutUser();
                      }}
                      className="flex items-center justify-center gap-1 rounded-xl bg-black/40 hover:bg-rose-950/40 border border-purple-900/40 hover:border-rose-500/40 py-2 px-2.5 text-[11px] font-medium text-zinc-400 hover:text-rose-300 transition-all"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>লগআউট</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-[#181124] to-[#120b1c] p-3.5 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-pink-400">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        শ্রোতা একাউন্ট খুলুন বা লগইন করুন
                      </h4>
                      <p className="text-[10px] text-zinc-400">
                        লাইব্রেরি ফিচার ব্যবহার ও ২০ টাকার পাস সক্রিয় করতে
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      closeDrawer();
                      onOpenUserAuth('general');
                    }}
                    className="w-full mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 hover:opacity-95 py-2 px-3 text-xs font-bold text-white shadow-md transition-all active:scale-98"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>লগইন / নতুন অ্যাকাউন্ট</span>
                  </button>
                </div>
              )}

              {/* 2. Subscription Pass Card (₹20 Monthly Pass) */}
              <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-950/25 via-[#181124] to-[#120b1c] p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
                      <Crown className="h-4 w-4 fill-pink-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-pink-300">
                        {isSubscribed ? 'গপ্পো কাহিনী পাস (সক্রিয়)' : 'গপ্পো কাহিনী মাসিক পাস'}
                      </h4>
                      <p className="text-[10px] text-zinc-400">
                        {isSubscribed ? 'সকল গল্প আনলিমিটেড উপভোগ করুন' : 'মাত্র ₹২০/মাস — সব গল্প আনলক'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    closeDrawer();
                    if (isSubscribed) {
                      onOpenSubscriptionManager();
                    } else {
                      onOpenSubscriptionModal();
                    }
                  }}
                  className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-md ${
                    isSubscribed
                      ? 'bg-pink-600 hover:bg-pink-500 text-white'
                      : 'bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 hover:opacity-95 text-white font-bold'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-pink-200" />
                      <span>পাস স্ট্যাটাস ও তথ্য</span>
                    </>
                  ) : (
                    <>
                      <Crown className="h-3.5 w-3.5 fill-white" />
                      <span>₹২০ মাসিক পাস নিন</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3. Content Category Switcher (গল্পঘর vs মানুষের জীবন কথা) */}
              {onSelectView && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
                    কন্টেন্ট বিভাগ
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onSelectView('stories');
                        closeDrawer();
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded-xl p-2.5 text-xs font-bold transition-all border ${
                        activeView === 'stories'
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950/40'
                          : 'bg-[#181124] text-zinc-300 border-purple-900/30 hover:bg-[#201730]'
                      }`}
                    >
                      <Radio className="h-3.5 w-3.5" />
                      <span>গল্পঘর</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectView('lifestories');
                        closeDrawer();
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded-xl p-2.5 text-xs font-bold transition-all border relative ${
                        activeView === 'lifestories'
                          ? 'bg-pink-500 text-white border-pink-400 shadow-md shadow-pink-950/40 font-bold'
                          : 'bg-[#181124] text-zinc-300 border-purple-900/30 hover:bg-[#201730]'
                      }`}
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span>জীবন কথা</span>
                      <span className="flex h-1.5 w-1.5 rounded-full bg-pink-300" />
                    </button>
                  </div>
                </div>
              )}

              {/* 4. EXPANDABLE / COLLAPSIBLE ACCORDION: লাইব্রেরি ও অডিও ফিচার (USER-ONLY ACCESS) */}
              <div className="rounded-2xl border border-purple-900/40 bg-[#160e22] overflow-hidden transition-all">
                
                {/* Accordion Header Button with Animated Dropdown Arrow */}
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      handleProtectedLibraryAction(() => {});
                      return;
                    }
                    setIsLibraryOpen(!isLibraryOpen);
                  }}
                  className="w-full flex items-center justify-between p-3.5 text-xs text-left text-zinc-200 hover:bg-[#201533] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
                      <Headphones className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">লাইব্রেরি ও অডিও ফিচার</span>
                      <span className="text-[10px] text-zinc-400 block">
                        {currentUser ? 'ইতিহাস, বুকমার্ক ও সাউন্ড মিক্সার' : 'লগইন আবশ্যক (User Only)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!currentUser && (
                      <span className="flex items-center gap-1 rounded-md bg-pink-950/50 border border-pink-500/30 px-1.5 py-0.5 text-[9px] text-pink-300">
                        <Lock className="h-2.5 w-2.5" />
                        লক
                      </span>
                    )}
                    <div className={`transition-transform duration-200 ${isLibraryOpen ? 'rotate-180 text-pink-400' : 'text-zinc-500'}`}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </button>

                {/* Collapsible Children (Smoothly reveals when expanded) */}
                {isLibraryOpen && (
                  <div className="border-t border-purple-900/40 p-2 space-y-1 bg-[#130b1c]/80 animate-fadeIn">
                    
                    {/* Listening History (শোনার ইতিহাস) */}
                    <button
                      onClick={() => handleProtectedLibraryAction(() => {
                        if (onOpenHistory) onOpenHistory();
                      })}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-zinc-200 hover:bg-[#221634] hover:text-white transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/15 text-purple-300">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">শোনার ইতিহাস</span>
                      </div>
                      {historyCount > 0 ? (
                        <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                          {historyCount}
                        </span>
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300" />
                      )}
                    </button>

                    {/* Bookmarks (সংরক্ষিত গল্প) */}
                    <button
                      onClick={() => handleProtectedLibraryAction(onOpenBookmarks)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-zinc-200 hover:bg-[#221634] hover:text-white transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-pink-500/15 text-pink-400">
                          <Bookmark className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">সংরক্ষিত গল্প (বুকমার্ক)</span>
                      </div>
                      {bookmarkCount > 0 ? (
                        <span className="rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          {bookmarkCount}
                        </span>
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300" />
                      )}
                    </button>

                    {/* Ambient Mixer (আবহ ধ্বনি মিক্সার) */}
                    <button
                      onClick={() => handleProtectedLibraryAction(onOpenMixer)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-zinc-200 hover:bg-[#221634] hover:text-white transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/15 text-purple-300">
                          <Sliders className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">আবহ ধ্বনি মিক্সার (বৃষ্টি, নদী, বন)</span>
                      </div>
                      {activeAmbientCount > 0 ? (
                        <span className="rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          {activeAmbientCount} সক্রিয়
                        </span>
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300" />
                      )}
                    </button>

                    {/* Future Feature Notice */}
                    <div className="px-3 py-1.5 flex items-center justify-between text-[10px] text-zinc-500 border-t border-purple-900/30">
                      <span>অফলাইন অডিও ও স্লিপ টাইমার</span>
                      <span className="text-purple-400/70">শীঘ্রই আসছে</span>
                    </div>

                  </div>
                )}
              </div>

              {/* 5. EXPANDABLE / COLLAPSIBLE ACCORDION: কমিউনিটি ও তথ্য */}
              <div className="rounded-2xl border border-purple-900/40 bg-[#160e22] overflow-hidden transition-all">
                
                {/* Accordion Header Button with Animated Dropdown Arrow */}
                <button
                  type="button"
                  onClick={() => setIsCommunityOpen(!isCommunityOpen)}
                  className="w-full flex items-center justify-between p-3.5 text-xs text-left text-zinc-200 hover:bg-[#201533] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400">
                      <Info className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">কমিউনিটি ও তথ্য</span>
                      <span className="text-[10px] text-zinc-400 block">কথক অডিশন, পরিচিতি ও নীতি</span>
                    </div>
                  </div>

                  <div className={`transition-transform duration-200 ${isCommunityOpen ? 'rotate-180 text-pink-400' : 'text-zinc-500'}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {/* Collapsible Children */}
                {isCommunityOpen && (
                  <div className="border-t border-purple-900/40 p-2 space-y-1 bg-[#130b1c]/80 animate-fadeIn">
                    
                    {/* Join as Narrator Application (কথক হিসেবে যোগ দিন) */}
                    <button
                      onClick={() => {
                        closeDrawer();
                        onOpenNarratorApplication();
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-zinc-200 hover:bg-[#221634] hover:text-white transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-pink-500/15 text-pink-400">
                          <Mic className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">কথক হিসেবে যোগ দিন (ভয়েস)</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300" />
                    </button>

                    {/* About Us (আমাদের কথা ও উদ্দেশ্য) */}
                    <button
                      onClick={() => {
                        closeDrawer();
                        onOpenAbout();
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-zinc-200 hover:bg-[#221634] hover:text-white transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/15 text-purple-300">
                          <Info className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">আমাদের কথা ও উদ্দেশ্য</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300" />
                    </button>

                  </div>
                )}
              </div>

              {/* 6. EXPANDABLE ACCORDION: আইন ও সহায়তা (Legal & Support) */}
              {onSelectPolicy && (
                <LegalSupportDropdown
                  variant="drawer-accordion"
                  onSelectPolicy={(slug) => {
                    closeDrawer();
                    onSelectPolicy(slug);
                  }}
                />
              )}

              {/* Authorized Admin Panel Subtle Access Option (Strictly hidden for normal users & visitors) */}
              {isAdmin && (
                <div className="pt-2 border-t border-purple-900/30 space-y-1.5">
                  <a
                    href="/admin.html"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 text-pink-300 hover:text-white transition-all text-xs font-semibold w-full group border border-pink-500/30 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-pink-400" />
                      <span>স্বতন্ত্র অ্যাডমিন অ্যাপ (নতুন ট্যাব)</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform text-pink-400" />
                  </a>

                  <button
                    onClick={() => {
                      closeDrawer();
                      if (onOpenStudio) onOpenStudio();
                    }}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors text-[11px] font-medium tracking-wide w-full group"
                    title="এডমিন প্যানেল"
                  >
                    <Lock className="h-3 w-3 text-zinc-500 group-hover:text-pink-400 transition-colors shrink-0" />
                    <span>কুইক স্টুডিও মডাল</span>
                  </button>
                </div>
              )}

              {/* General App Footer in Drawer */}
              <div className="pt-3 border-t border-purple-950/40 flex items-center justify-between text-zinc-500 text-[11px]">
                <span>গপ্পো কাহিনী অডিও প্ল্যাটফর্ম</span>
                <span>© ২০২৬ • সর্বস্বত্ব সংরক্ষিত</span>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

