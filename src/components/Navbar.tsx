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
  Sun,
  Palette,
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
  onToggleTheme: (newTheme?: ThemeMode) => void;
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

  const isLight = theme === 'purple-light' || theme === 'calm-green';

  return (
    <>
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors ${
        isLight
          ? 'border-purple-200/90 bg-white/95 text-zinc-900 shadow-xs'
          : 'border-purple-900/30 bg-[#120a1c]/95 text-white'
      }`}>
        <div className="mx-auto flex h-[52px] sm:h-16 max-w-7xl items-center justify-between px-2.5 sm:px-6 gap-1.5 sm:gap-4">
          
          {/* Brand & Logo (গপ্পো কাহিনী) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
            <GoppoKahiniLogo size="md" showSubtitle={true} isLight={isLight} theme={theme} />
          </div>

          {/* Desktop Search Bar (খুঁজুন...) */}
          <div className="hidden md:flex flex-1 max-w-sm mx-3">
            <div className="relative w-full">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isLight ? 'text-purple-600' : 'text-purple-300'
              }`} />
              <input
                type="text"
                placeholder="গল্প, কথক বা লেখক খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-full border py-1.5 pl-9 pr-8 text-xs transition-all focus:outline-none ${
                  isLight
                    ? 'border-purple-200 bg-purple-50/50 text-zinc-900 placeholder-zinc-400 focus:border-purple-500 focus:bg-white'
                    : 'border-purple-900/40 bg-[#181224] text-white placeholder-zinc-500 focus:border-pink-400'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 ${
                    isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Header: Search (Mobile) + Pass (Desktop) + User Account / Login Chip + Single Theme Toggle + 3-Line Menu Button */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Mobile Search Button */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className={`md:hidden flex h-8 w-8 items-center justify-center rounded-lg border transition-all shrink-0 active:scale-95 ${
                isLight
                  ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                  : 'bg-[#181224] border-purple-900/40 text-zinc-300 hover:text-white hover:border-pink-400'
              }`}
              title="গল্প খুঁজুন"
              aria-label="অনুসন্ধান"
            >
              <Search className={`h-3.5 w-3.5 ${isLight ? 'text-purple-600' : 'text-purple-300'}`} />
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
                className={`flex items-center gap-1 sm:gap-2 rounded-full border px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-xs transition-all shadow-sm shrink-0 active:scale-95 ${
                  isLight
                    ? 'border-purple-200 bg-purple-50/80 text-zinc-900 hover:bg-purple-100'
                    : 'border-purple-500/40 bg-[#1e132e] text-white hover:bg-[#28183c] hover:border-pink-400'
                }`}
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
                <span className={`hidden sm:inline font-medium max-w-[100px] truncate ${
                  isLight ? 'text-zinc-800' : 'text-purple-200'
                }`}>
                  {currentUser.displayName}
                </span>
                {isSubscribed && (
                  <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-pink-400 text-pink-400 shrink-0" />
                )}
              </button>
            ) : (
              <button
                onClick={() => onOpenUserAuth('general')}
                className={`flex items-center gap-1 sm:gap-1.5 rounded-full border px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium transition-all shrink-0 active:scale-95 ${
                  isLight
                    ? 'border-purple-200 bg-white text-purple-800 hover:bg-purple-50 shadow-xs'
                    : 'border-purple-900/50 bg-[#181224] hover:bg-[#221634] hover:border-pink-500/50 text-purple-200'
                }`}
              >
                <LogIn className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-pink-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold">লগইন</span>
              </button>
            )}

            {/* Single Unified Theme Toggle Button (ডার্ক মোড চালু করুন / লাইট মোড চালু করুন) */}
            <button
              id="navbar-theme-toggle-btn"
              type="button"
              onClick={() => onToggleTheme(isLight ? 'purple-dark' : 'purple-light')}
              title={isLight ? 'ডার্ক মোড চালু করুন' : 'লাইট মোড চালু করুন'}
              aria-label={isLight ? 'ডার্ক মোড চালু করুন' : 'লাইট মোড চালু করুন'}
              className={`flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl border transition-all active:scale-95 shrink-0 touch-manipulation ${
                isLight
                  ? 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 shadow-xs'
                  : 'border-purple-900/40 bg-[#181224] hover:bg-[#201830] text-amber-300'
              }`}
            >
              {isLight ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4 text-amber-300" />
              )}
            </button>

            {/* 3-Line Hamburger Menu Button (তিন লাইনের মেনু বার) */}
            <button
              id="main-hamburger-menu-btn"
              onClick={() => setIsMenuOpen(true)}
              aria-label="মূল মেনু খুলুন"
              className={`flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border px-2 sm:px-3.5 py-1 sm:py-2 text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 touch-manipulation ${
                isLight
                  ? 'border-purple-200 bg-white hover:bg-purple-50 hover:border-purple-300 text-zinc-800'
                  : 'border-purple-500/30 bg-[#181224] hover:bg-[#201830] hover:border-pink-400 text-white'
              }`}
            >
              {/* Distinctive 3-Line Bars */}
              <div className="flex flex-col justify-between w-3.5 h-3 sm:w-4 sm:h-3.5 py-0.5 shrink-0">
                <span className={`h-0.5 w-full rounded-full ${isLight ? 'bg-purple-700' : 'bg-purple-300'}`} />
                <span className="h-0.5 w-3/4 bg-pink-500 rounded-full" />
                <span className={`h-0.5 w-full rounded-full ${isLight ? 'bg-purple-700' : 'bg-purple-300'}`} />
              </div>
              <span className={`text-[11px] sm:text-xs font-medium ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                মেনু
              </span>

              {(bookmarkCount > 0 || activeAmbientCount > 0) ? (
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
              ) : null}
            </button>

          </div>
        </div>

        {/* Mobile Search Overlay Input */}
        {showMobileSearch && (
          <div className={`md:hidden border-t px-4 py-2.5 animate-fadeIn ${
            isLight ? 'border-purple-200 bg-white' : 'border-purple-900/40 bg-[#120a1c]'
          }`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isLight ? 'text-purple-600' : 'text-pink-400'
              }`} />
              <input
                type="text"
                autoFocus
                placeholder="গল্প, কথক বা লেখক খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-full border py-2 pl-9 pr-8 text-xs focus:outline-none ${
                  isLight
                    ? 'border-purple-200 bg-purple-50/70 text-zinc-900 placeholder-zinc-400 focus:border-purple-400 focus:bg-white'
                    : 'border-purple-900/40 bg-[#181224] text-white placeholder-zinc-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 ${
                    isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-white'
                  }`}
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel Content */}
          <div 
            className={`relative z-10 flex h-full w-full max-w-sm flex-col shadow-2xl overflow-y-auto transition-colors ${
              isLight
                ? 'bg-[#fcfaff] border-l border-purple-200 text-zinc-900'
                : 'bg-[#130b1e] border-l border-purple-900/40 text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className={`sticky top-0 z-20 flex items-center justify-between border-b px-5 py-4 backdrop-blur-md transition-colors ${
              isLight
                ? 'border-purple-200 bg-white/95 text-zinc-900'
                : 'border-purple-900/30 bg-[#130b1e]/95 text-white'
            }`}>
              <div className="flex items-center gap-2">
                <GoppoKahiniLogo size="sm" showSubtitle={false} />
                <div>
                  <h3 className={`text-sm font-bold font-serif-story leading-none ${
                    isLight ? 'text-zinc-900' : 'text-white'
                  }`}>
                    গপ্পো কাহিনী মেনু
                  </h3>
                  <p className={`text-[10px] mt-0.5 ${
                    isLight ? 'text-zinc-500' : 'text-zinc-400'
                  }`}>
                    রোমাঞ্চ • শান্তি • মানুষের জীবন কথা
                  </p>
                </div>
              </div>

              <button
                onClick={closeDrawer}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                  isLight
                    ? 'bg-purple-100/70 text-zinc-600 hover:text-zinc-950 hover:bg-purple-200/80 border-purple-200'
                    : 'bg-[#1d122b] text-zinc-400 hover:text-white hover:bg-[#27193a] border border-purple-900/30'
                }`}
                title="মেনু বন্ধ করুন"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body Items */}
            <div className="flex-1 p-5 space-y-4">

              {/* 1. Theme Selector Card in Menu (থিম ও রঙ নির্বাচন) */}
              <div className={`rounded-2xl border p-3.5 space-y-2.5 ${
                isLight
                  ? 'border-purple-200 bg-white shadow-sm'
                  : 'border-purple-900/40 bg-[#1a1129]'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                    isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    <Palette className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                      থিম ও রঙ পরিবর্তন
                    </h4>
                    <p className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      লাইট নাকি ডার্ক — আপনার পছন্দ মতো বেছে নিন
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Light Theme Option (পার্পল ও হোয়াইট) */}
                  <button
                    type="button"
                    onClick={() => onToggleTheme('purple-light')}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                      isLight
                        ? 'border-purple-600 bg-purple-50/90 text-purple-950 ring-2 ring-purple-500/30 shadow-xs'
                        : 'border-purple-900/40 bg-black/40 text-zinc-300 hover:border-purple-500/50 hover:bg-[#201435]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-100 text-amber-700 shadow-xs">
                        <Sun className="h-3 w-3" />
                      </span>
                      {isLight && <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />}
                    </div>
                    <span className="text-xs font-bold block leading-tight">পার্পল ও হোয়াইট</span>
                    <span className={`text-[9px] block mt-0.5 ${isLight ? 'text-purple-700 font-medium' : 'text-zinc-500'}`}>
                      পারফেক্ট লাইট মোড
                    </span>
                  </button>

                  {/* Dark Theme Option (পার্পল ও ব্ল্যাক) */}
                  <button
                    type="button"
                    onClick={() => onToggleTheme('purple-dark')}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                      !isLight
                        ? 'border-pink-500 bg-purple-950/60 text-white ring-2 ring-pink-500/30 shadow-xs'
                        : 'border-purple-200 bg-purple-50/30 text-zinc-700 hover:border-purple-400 hover:bg-purple-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-900/60 text-purple-300">
                        <Moon className="h-3 w-3" />
                      </span>
                      {!isLight && <CheckCircle2 className="h-3.5 w-3.5 text-pink-400" />}
                    </div>
                    <span className="text-xs font-bold block leading-tight">পার্পল ও ব্ল্যাক</span>
                    <span className={`text-[9px] block mt-0.5 ${!isLight ? 'text-pink-300 font-medium' : 'text-zinc-500'}`}>
                      ডার্ক নাইট মোড
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. User Account / Authentication Card */}
              {currentUser ? (
                <div className={`rounded-2xl border p-3.5 space-y-3 ${
                  isLight
                    ? 'border-purple-200 bg-white shadow-sm'
                    : 'border-purple-900/40 bg-[#1a1129]'
                }`}>
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
                        <h4 className={`text-xs font-bold truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                          {currentUser.displayName}
                        </h4>
                        {isSubscribed && (
                          <span className="rounded-full bg-pink-500/20 px-1.5 py-0.2 text-[9px] font-bold text-pink-400 border border-pink-500/30">
                            পাস সক্রিয়
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] truncate ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
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
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-[11px] font-semibold transition-all border ${
                        isLight
                          ? 'bg-purple-100/70 hover:bg-purple-200/80 border-purple-200 text-purple-900'
                          : 'bg-purple-900/40 hover:bg-purple-800/60 border-purple-500/30 text-purple-200'
                      }`}
                    >
                      <User className="h-3.5 w-3.5 text-pink-500" />
                      <span>প্রোফাইল ও পাস</span>
                    </button>

                    <button
                      onClick={() => {
                        closeDrawer();
                        onLogoutUser();
                      }}
                      className={`flex items-center justify-center gap-1 rounded-xl py-2 px-2.5 text-[11px] font-medium transition-all border ${
                        isLight
                          ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                          : 'bg-black/40 hover:bg-rose-950/40 border-purple-900/40 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300'
                      }`}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>লগআউট</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`rounded-2xl border p-3.5 space-y-2 ${
                  isLight
                    ? 'border-purple-200 bg-white shadow-sm'
                    : 'border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-[#181124] to-[#120b1c]'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-600">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        শ্রোতা একাউন্ট খুলুন বা লগইন করুন
                      </h4>
                      <p className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
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

              {/* 3. Subscription Pass Card (₹20 Monthly Pass) */}
              <div className={`rounded-2xl border p-4 shadow-sm ${
                isLight
                  ? 'border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50/40 to-white'
                  : 'border-pink-500/30 bg-gradient-to-br from-pink-950/25 via-[#181124] to-[#120b1c]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/20 text-pink-500">
                      <Crown className="h-4 w-4 fill-pink-500" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isLight ? 'text-purple-900' : 'text-pink-300'}`}>
                        {isSubscribed ? 'গপ্পো কাহিনী পাস (সক্রিয়)' : 'গপ্পো কাহিনী মাসিক পাস'}
                      </h4>
                      <p className={`text-[10px] ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
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

              {/* 4. Content Category Switcher (গল্পঘর vs মানুষের জীবন কথা) */}
              {onSelectView && (
                <div className="space-y-1.5">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider px-1 ${
                    isLight ? 'text-zinc-500' : 'text-zinc-400'
                  }`}>
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
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                          : isLight
                            ? 'bg-white text-zinc-700 border-purple-200 hover:bg-purple-50'
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
                          ? 'bg-pink-500 text-white border-pink-400 shadow-md font-bold'
                          : isLight
                            ? 'bg-white text-zinc-700 border-purple-200 hover:bg-purple-50'
                            : 'bg-[#181124] text-zinc-300 border-purple-900/30 hover:bg-[#201730]'
                      }`}
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span>জীবন কথা</span>
                      <span className="flex h-1.5 w-1.5 rounded-full bg-pink-400" />
                    </button>
                  </div>
                </div>
              )}

              {/* 5. EXPANDABLE / COLLAPSIBLE ACCORDION: লাইব্রেরি ও অডিও ফিচার (USER-ONLY ACCESS) */}
              <div className={`rounded-2xl border overflow-hidden transition-all ${
                isLight
                  ? 'border-purple-200 bg-white shadow-sm'
                  : 'border-purple-900/40 bg-[#160e22]'
              }`}>
                
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
                  className={`w-full flex items-center justify-between p-3.5 text-xs text-left transition-colors ${
                    isLight
                      ? 'text-zinc-800 hover:bg-purple-50/70'
                      : 'text-zinc-200 hover:bg-[#201533]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      <Headphones className="h-4 w-4" />
                    </div>
                    <div>
                      <span className={`font-bold block ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        লাইব্রেরি ও অডিও ফিচার
                      </span>
                      <span className={`text-[10px] block ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {currentUser ? 'ইতিহাস, বুকমার্ক ও সাউন্ড মিক্সার' : 'লগইন আবশ্যক (User Only)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!currentUser && (
                      <span className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] ${
                        isLight ? 'bg-pink-100 border border-pink-300 text-pink-700' : 'bg-pink-950/50 border border-pink-500/30 text-pink-300'
                      }`}>
                        <Lock className="h-2.5 w-2.5" />
                        লক
                      </span>
                    )}
                    <div className={`transition-transform duration-200 ${
                      isLibraryOpen ? (isLight ? 'rotate-180 text-purple-600' : 'rotate-180 text-pink-400') : 'text-zinc-400'
                    }`}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </button>

                {/* Collapsible Children (Smoothly reveals when expanded) */}
                {isLibraryOpen && (
                  <div className={`border-t p-2 space-y-1 animate-fadeIn ${
                    isLight ? 'border-purple-100 bg-purple-50/40' : 'border-purple-900/40 bg-[#130b1c]/80'
                  }`}>
                    
                    {/* Listening History (শোনার ইতিহাস) */}
                    <button
                      onClick={() => handleProtectedLibraryAction(() => {
                        if (onOpenHistory) onOpenHistory();
                      })}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all group ${
                        isLight
                          ? 'text-zinc-700 hover:bg-purple-100/70 hover:text-purple-950'
                          : 'text-zinc-200 hover:bg-[#221634] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                          isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/15 text-purple-300'
                        }`}>
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">শোনার ইতিহাস</span>
                      </div>
                      {historyCount > 0 ? (
                        <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                          {historyCount}
                        </span>
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-700" />
                      )}
                    </button>

                    {/* Bookmarks (সংরক্ষিত গল্প) */}
                    <button
                      onClick={() => handleProtectedLibraryAction(onOpenBookmarks)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all group ${
                        isLight
                          ? 'text-zinc-700 hover:bg-purple-100/70 hover:text-purple-950'
                          : 'text-zinc-200 hover:bg-[#221634] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                          isLight ? 'bg-pink-100 text-pink-600' : 'bg-pink-500/15 text-pink-400'
                        }`}>
                          <Bookmark className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">সংরক্ষিত গল্প (বুকমার্ক)</span>
                      </div>
                      {bookmarkCount > 0 ? (
                        <span className="rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          {bookmarkCount}
                        </span>
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-700" />
                      )}
                    </button>

                    {/* Ambient Mixer (আবহ ধ্বনি মিক্সার) */}
                    <button
                      onClick={() => handleProtectedLibraryAction(onOpenMixer)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all group ${
                        isLight
                          ? 'text-zinc-700 hover:bg-purple-100/70 hover:text-purple-950'
                          : 'text-zinc-200 hover:bg-[#221634] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                          isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/15 text-purple-300'
                        }`}>
                          <Sliders className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">আবহ ধ্বনি মিক্সার (বৃষ্টি, নদী, বন)</span>
                      </div>
                      {activeAmbientCount > 0 ? (
                        <span className="rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          {activeAmbientCount} সক্রিয়
                        </span>
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-700" />
                      )}
                    </button>

                    {/* Future Feature Notice */}
                    <div className={`px-3 py-1.5 flex items-center justify-between text-[10px] border-t ${
                      isLight ? 'border-purple-100 text-zinc-500' : 'border-purple-900/30 text-zinc-500'
                    }`}>
                      <span>অফলাইন অডিও ও স্লিপ টাইমার</span>
                      <span className={isLight ? 'text-purple-600' : 'text-purple-400/70'}>শীঘ্রই আসছে</span>
                    </div>

                  </div>
                )}
              </div>

              {/* 6. EXPANDABLE / COLLAPSIBLE ACCORDION: কমিউনিটি ও তথ্য */}
              <div className={`rounded-2xl border overflow-hidden transition-all ${
                isLight
                  ? 'border-purple-200 bg-white shadow-sm'
                  : 'border-purple-900/40 bg-[#160e22]'
              }`}>
                
                {/* Accordion Header Button with Animated Dropdown Arrow */}
                <button
                  type="button"
                  onClick={() => setIsCommunityOpen(!isCommunityOpen)}
                  className={`w-full flex items-center justify-between p-3.5 text-xs text-left transition-colors ${
                    isLight
                      ? 'text-zinc-800 hover:bg-purple-50/70'
                      : 'text-zinc-200 hover:bg-[#201533]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      isLight ? 'bg-pink-100 text-pink-600' : 'bg-pink-500/20 text-pink-400'
                    }`}>
                      <Info className="h-4 w-4" />
                    </div>
                    <div>
                      <span className={`font-bold block ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        কমিউনিটি ও তথ্য
                      </span>
                      <span className={`text-[10px] block ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        কথক অডিশন, পরিচিতি ও নীতি
                      </span>
                    </div>
                  </div>

                  <div className={`transition-transform duration-200 ${
                    isCommunityOpen ? (isLight ? 'rotate-180 text-purple-600' : 'rotate-180 text-pink-400') : 'text-zinc-400'
                  }`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {/* Collapsible Children */}
                {isCommunityOpen && (
                  <div className={`border-t p-2 space-y-1 animate-fadeIn ${
                    isLight ? 'border-purple-100 bg-purple-50/40' : 'border-purple-900/40 bg-[#130b1c]/80'
                  }`}>
                    
                    {/* Join as Narrator Application (কথক হিসেবে যোগ দিন) */}
                    <button
                      onClick={() => {
                        closeDrawer();
                        onOpenNarratorApplication();
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all group ${
                        isLight
                          ? 'text-zinc-700 hover:bg-purple-100/70 hover:text-purple-950'
                          : 'text-zinc-200 hover:bg-[#221634] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                          isLight ? 'bg-pink-100 text-pink-600' : 'bg-pink-500/15 text-pink-400'
                        }`}>
                          <Mic className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">কথক হিসেবে যোগ দিন (ভয়েস)</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-700" />
                    </button>

                    {/* About Us (আমাদের কথা ও উদ্দেশ্য) */}
                    <button
                      onClick={() => {
                        closeDrawer();
                        onOpenAbout();
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all group ${
                        isLight
                          ? 'text-zinc-700 hover:bg-purple-100/70 hover:text-purple-950'
                          : 'text-zinc-200 hover:bg-[#221634] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                          isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/15 text-purple-300'
                        }`}>
                          <Info className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">আমাদের কথা ও উদ্দেশ্য</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-700" />
                    </button>

                  </div>
                )}
              </div>

              {/* 7. EXPANDABLE ACCORDION: আইন ও সহায়তা (Legal & Support) */}
              {onSelectPolicy && (
                <LegalSupportDropdown
                  variant="drawer-accordion"
                  theme={theme}
                  onSelectPolicy={(slug) => {
                    closeDrawer();
                    onSelectPolicy(slug);
                  }}
                />
              )}

              {/* Authorized Admin Panel Access in Drawer */}
              {isAdmin && (
                <div className={`pt-2 border-t ${isLight ? 'border-purple-200' : 'border-purple-900/30'}`}>
                  <button
                    onClick={() => {
                      closeDrawer();
                      if (onOpenStudio) onOpenStudio();
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-semibold w-full group border shadow-sm ${
                      isLight
                        ? 'bg-purple-100/80 hover:bg-purple-200 text-purple-900 border-purple-300'
                        : 'bg-purple-900/40 hover:bg-purple-800/50 text-pink-300 hover:text-white border-pink-500/30'
                    }`}
                    title="এডমিন ক্রিয়েটর স্টুডিও"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`h-3.5 w-3.5 ${isLight ? 'text-purple-700' : 'text-pink-400'}`} />
                      <span>ক্রিয়েটর স্টুডিও প্যানেল</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}

              {/* General App Footer in Drawer */}
              <div className={`pt-3 border-t flex items-center justify-between text-[11px] ${
                isLight ? 'border-purple-200 text-zinc-500' : 'border-purple-950/40 text-zinc-500'
              }`}>
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

