import React from 'react';
import { X, Bookmark, Play, Trash2, Clock, Calendar } from 'lucide-react';
import { Bookmark as BookmarkType, Story } from '../types';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkType[];
  stories: Story[];
  onPlayAtBookmark: (story: Story, timestamp: number) => void;
  onDeleteBookmark: (id: string) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  stories,
  onPlayAtBookmark,
  onDeleteBookmark,
}) => {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/90 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-850 flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-850">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-amber-400 fill-amber-400" />
            <h2 className="font-serif-story text-lg font-bold text-white">
              সংরক্ষিত বুকমার্ক ও নোট
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 pb-24">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-zinc-500">
              <Bookmark className="h-10 w-10 text-zinc-700 stroke-1 mb-2" />
              <p className="text-sm font-medium text-zinc-400">এখনও কোনো বুকমার্ক সংরক্ষিত নেই</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                গল্প শোনার সময় বুকমার্ক আইকনে ট্যাপ করে বিশেষ অংশ ও নোট সেভ করে রাখতে পারেন।
              </p>
            </div>
          ) : (
            bookmarks.map((bm) => {
              const matchedStory = stories.find((s) => s.id === bm.storyId);
              return (
                <div
                  key={bm.id}
                  className="rounded-2xl border border-zinc-850 bg-black/70 p-4 transition-all hover:border-amber-500/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-serif-story text-sm font-bold text-zinc-200">
                        {bm.storyTitle}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-amber-400/90 font-mono mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>সময়: {formatTime(bm.timestamp)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteBookmark(bm.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                      title="বুকমার্ক মুছুন"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {bm.note && (
                    <p className="mt-2 text-xs text-zinc-300 italic bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
                      &ldquo;{bm.note}&rdquo;
                    </p>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-zinc-850 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {bm.createdAt}
                    </span>

                    {matchedStory && (
                      <button
                        onClick={() => {
                          onPlayAtBookmark(matchedStory, bm.timestamp);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 px-3 py-1 text-xs font-bold text-black hover:opacity-90 transition-opacity"
                      >
                        <Play className="h-3 w-3 fill-black ml-0.5" />
                        <span>শুনুন</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
