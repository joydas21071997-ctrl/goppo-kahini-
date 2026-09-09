import React from 'react';
import { Radio, CloudRain, Bookmark, Crown, Mic } from 'lucide-react';
import { UserSubscription, AudienceUser } from '../types';

export type MobileNavTab = 'stories' | 'lifestories' | 'ambience' | 'bookmarks' | 'subscription';

interface MobileBottomNavProps {
  currentTab: MobileNavTab;
  onSelectTab: (tab: MobileNavTab) => void;
  subscription: UserSubscription;
  bookmarkCount: number;
  currentUser?: AudienceUser | null;
  onRequireLogin?: (message?: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  subscription,
  bookmarkCount,
  currentUser,
  onRequireLogin,
}) => {
  const isSubscribed = subscription?.status === 'active';

  const handleBookmarksClick = () => {
    if (!currentUser && onRequireLogin) {
      onRequireLogin('বুকমার্ক ও সংরক্ষিত গল্প দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।');
      return;
    }
    onSelectTab('bookmarks');
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-purple-900/40 bg-[#120a1c]/95 backdrop-blur-xl px-1.5 py-1 safe-area-bottom">
      <div className="flex items-center justify-around">
        
        {/* Tab 1: Stories */}
        <button
          onClick={() => onSelectTab('stories')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'stories'
              ? 'text-pink-300 font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Radio className={`h-5 w-5 ${currentTab === 'stories' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">গল্পঘর</span>
        </button>

        {/* Tab 2: Life Stories Podcast (আমাদের কথা) */}
        <button
          onClick={() => onSelectTab('lifestories')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
            currentTab === 'lifestories'
              ? 'text-pink-300 font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Mic className={`h-5 w-5 ${currentTab === 'lifestories' ? 'stroke-[2.5] text-pink-300' : ''}`} />
          <span className="text-[10px] mt-0.5">জীবন কথা</span>
          <span className="absolute -top-0.5 right-1 h-1.5 w-1.5 rounded-full bg-pink-400" />
        </button>

        {/* Tab 3: Ambience Mixer */}
        <button
          onClick={() => onSelectTab('ambience')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'ambience'
              ? 'text-purple-300 font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CloudRain className={`h-5 w-5 ${currentTab === 'ambience' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">আবহ</span>
        </button>

        {/* Tab 4: Bookmarks */}
        <button
          onClick={handleBookmarksClick}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'bookmarks'
              ? 'text-pink-300 font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Bookmark className={`h-5 w-5 ${currentTab === 'bookmarks' ? 'stroke-[2.5] fill-pink-400/20' : ''}`} />
          <span className="text-[10px] mt-0.5">বুকমার্ক</span>
          {bookmarkCount > 0 && (
            <span className="absolute top-0 right-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-pink-500 px-1 text-[9px] font-bold text-white">
              {bookmarkCount}
            </span>
          )}
        </button>

        {/* Tab 5: Pass */}
        <button
          onClick={() => onSelectTab('subscription')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'subscription'
              ? 'text-pink-300 font-bold'
              : isSubscribed
              ? 'text-pink-400'
              : 'text-zinc-400 hover:text-purple-300'
          }`}
        >
          <div className="relative">
            <Crown className={`h-5 w-5 ${isSubscribed ? 'fill-pink-400 text-pink-400' : 'text-purple-300'}`} />
            {isSubscribed && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-pink-400 ring-2 ring-black" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">{isSubscribed ? 'আমার পাস' : '২০₹ পাস'}</span>
        </button>

      </div>
    </nav>
  );
};
