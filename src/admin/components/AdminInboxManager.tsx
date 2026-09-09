import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Trash2,
  Mail,
  Phone,
  Clock,
  Filter,
  Tag,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { UserContactMessage } from '../../types';

export const AdminInboxManager: React.FC = () => {
  const [messages, setMessages] = useState<UserContactMessage[]>(() => {
    try {
      const stored = localStorage.getItem('goppo_contact_messages');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'unread' | 'feedback' | 'complaint' | 'payment_issue' | 'story_request'>('all');

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem('goppo_contact_messages');
        if (stored) setMessages(JSON.parse(stored));
      } catch {}
    };
    window.addEventListener('goppo_contact_messages_updated', handleUpdate);
    return () => window.removeEventListener('goppo_contact_messages_updated', handleUpdate);
  }, []);

  const saveMessages = (newMsgs: UserContactMessage[]) => {
    setMessages(newMsgs);
    localStorage.setItem('goppo_contact_messages', JSON.stringify(newMsgs));
    window.dispatchEvent(new Event('goppo_contact_messages_updated'));
  };

  const markAsRead = (id: string) => {
    const updated = messages.map((m) => (m.id === id ? { ...m, isRead: true } : m));
    saveMessages(updated);
  };

  const deleteMessage = (id: string) => {
    if (confirm('আপনি কি এই বার্তাটি মুছে ফেলতে চান?')) {
      const updated = messages.filter((m) => m.id !== id);
      saveMessages(updated);
    }
  };

  const filtered = messages.filter((m) => {
    const matchSearch =
      m.userName.toLowerCase().includes(search.toLowerCase()) ||
      m.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      categoryFilter === 'all'
        ? true
        : categoryFilter === 'unread'
        ? !m.isRead
        : m.category === categoryFilter;

    return matchSearch && matchCategory;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'payment_issue':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 font-semibold">পেমেন্ট সমস্যা</span>;
      case 'complaint':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold">অভিযোগ</span>;
      case 'story_request':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-semibold">গল্পের অনুরোধ</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">মতামত</span>;
    }
  };

  return (
    <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            শ্রোতাদের ইনবক্স ও বার্তা কেন্দ্র
          </h2>
          <p className="text-xs text-purple-300/80 mt-0.5">
            শ্রোতাদের ফিডব্যাক, অভিযোগ ও পেমেন্ট বিষয়ক সরাসরি বার্তা
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
              categoryFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-purple-950/60 text-purple-300'
            }`}
          >
            সব ({messages.length})
          </button>
          <button
            onClick={() => setCategoryFilter('unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
              categoryFilter === 'unread' ? 'bg-pink-600 text-white' : 'bg-purple-950/60 text-purple-300'
            }`}
          >
            অপঠিত ({messages.filter((m) => !m.isRead).length})
          </button>
          <button
            onClick={() => setCategoryFilter('payment_issue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
              categoryFilter === 'payment_issue' ? 'bg-red-600 text-white' : 'bg-purple-950/60 text-purple-300'
            }`}
          >
            পেমেন্ট ইস্যু
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="বার্তার বিষয়বস্তু বা ইমেইল খুঁজুন..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Message List */}
      <div className="space-y-3.5">
        {filtered.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-2xl border transition-colors ${
              !msg.isRead
                ? 'bg-[#220f38] border-pink-500/40 shadow-sm shadow-pink-500/10'
                : 'bg-[#1e0d33]/80 border-purple-900/40'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm">{msg.userName}</span>
                {getCategoryBadge(msg.category)}
                {!msg.isRead && (
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-purple-400">
                <span>{new Date(msg.createdAt).toLocaleString('bn-BD')}</span>
                {!msg.isRead && (
                  <button
                    onClick={() => markAsRead(msg.id)}
                    className="text-xs text-pink-400 hover:text-pink-300 cursor-pointer font-medium"
                  >
                    পঠিত চিহ্নিত করুন
                  </button>
                )}
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="text-purple-400 hover:text-red-400 cursor-pointer"
                  title="ডিলিট"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-purple-200 mt-2.5 leading-relaxed whitespace-pre-wrap">
              {msg.message}
            </p>

            <div className="mt-3 pt-2.5 border-t border-purple-900/40 flex items-center gap-4 text-xs text-purple-300">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                {msg.userEmail}
              </span>
              {msg.userPhone && (
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-purple-400" />
                  {msg.userPhone}
                </span>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-xs text-purple-400">
            ইনবক্সে কোনো বার্তা নেই
          </div>
        )}
      </div>
    </div>
  );
};
