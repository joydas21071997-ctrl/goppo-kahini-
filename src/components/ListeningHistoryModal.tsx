import React from 'react';
import { X, Play, Clock, Trash2, BookOpen, Headphones } from 'lucide-react';
import { ListeningHistoryItem, Story } from '../types';

interface ListeningHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ListeningHistoryItem[];
  onPlayFromHistory: (storyId: string) => void;
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
  allStories: Story[];
}

export const ListeningHistoryModal: React.FC<ListeningHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onPlayFromHistory,
  onClearHistory,
  onRemoveItem,
  allStories,
}) => {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins} মি. ${secs > 0 ? `${secs} সে.` : ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative flex flex-col w-full max-w-lg max-h-[85vh] rounded-2xl bg-[#120a1c] border border-purple-500/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/30 px-5 py-4 bg-[#181024]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-pink-400">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif-story text-base sm:text-lg font-bold text-white">
                শোনার ইতিহাস
              </h3>
              <p className="text-[11px] text-zinc-400">
                পূর্বে যে গল্পগুলো আপনি শুনেছেন বা চালু করেছিলেন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-purple-900/40 transition-colors"
            title="বন্ধ করুন"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-zinc-900">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-300 mb-1">
                ইতিহাসে কোনো গল্প নেই
              </h4>
              <p className="text-xs text-zinc-500 max-w-xs mb-4">
                আপনি এখনো কোনো গল্প শোনেননি। গল্পঘর থেকে যেকোনো গল্প প্লে করলে তা স্বয়ংক্রিয়ভাবে এখানে সংরক্ষিত হবে।
              </p>
            </div>
          ) : (
            history.map((item) => {
              const matchedStory = allStories.find((s) => s.id === item.storyId);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 pt-2.5 first:pt-0 group rounded-xl p-2 hover:bg-zinc-900/60 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                    <img
                      src={item.coverImage || matchedStory?.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200'}
                      alt={item.storyTitle}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate font-serif-story">
                      {item.storyTitle}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                      <span className="truncate">{item.narrator}</span>
                      <span>•</span>
                      <span>{formatTime(item.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-zinc-500 mt-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{item.lastPlayedAt}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onPlayFromHistory(item.storyId);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-bold shadow-sm transition-all"
                      title="পুনরায় শুনুন"
                    >
                      <Play className="h-3 w-3 fill-white" />
                      <span className="hidden sm:inline">শুনুন</span>
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                      title="তালিকা থেকে সরান"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-850 px-4 py-3 bg-zinc-900/40">
            <span className="text-xs text-zinc-500">
              মোট {history.length}টি গল্প সংরক্ষিত আছে
            </span>
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:border-rose-900/40 text-xs font-medium transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>ইতিহাস মুছুন</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
