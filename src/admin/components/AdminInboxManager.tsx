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
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Send,
  Copy,
  Check,
  RefreshCw,
  Inbox,
  User,
  CheckCheck,
  AlertCircle,
  X
} from 'lucide-react';
import { UserContactMessage } from '../../types';
import {
  subscribeToContactMessages,
  markContactMessageStatus,
  deleteContactMessage,
  getLocalCachedMessages,
} from '../../services/firestoreInbox';

interface AdminInboxManagerProps {
  themeMode?: 'slate' | 'light';
}

export const AdminInboxManager: React.FC<AdminInboxManagerProps> = ({ themeMode = 'slate' }) => {
  const isLight = themeMode === 'light';
  const [messages, setMessages] = useState<UserContactMessage[]>(() => getLocalCachedMessages());
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'replied' | 'pending' | 'complaint' | 'payment_issue'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // In-app deletion dialog state (replaces browser window.confirm which fails in iframes)
  const [deleteTargetMessage, setDeleteTargetMessage] = useState<UserContactMessage | null>(null);
  const [isBulkDeletingReplied, setIsBulkDeletingReplied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Real-time Firestore & LocalStorage Sync
  useEffect(() => {
    const unsubscribe = subscribeToContactMessages((updatedList) => {
      setMessages(updatedList);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleReplied = async (msg: UserContactMessage) => {
    const isCurrentlyReplied = msg.status === 'replied';
    const nextStatus = isCurrentlyReplied ? 'read' : 'replied';
    
    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id ? { ...m, status: nextStatus, isRead: true } : m
      )
    );

    try {
      await markContactMessageStatus(msg.id, nextStatus);
      showToast(
        nextStatus === 'replied'
          ? `"${msg.senderName || 'শ্রোতা'}" এর বার্তার কাজ সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে!`
          : 'বার্তার স্ট্যাটাস পরিবর্তন করা হয়েছে।'
      );
    } catch (err) {
      console.error('Failed to update message status:', err);
    }
  };

  const handleToggleRead = async (msg: UserContactMessage) => {
    const currentIsRead = msg.isRead === true || msg.status === 'read' || msg.status === 'replied';
    const nextStatus = currentIsRead ? 'unread' : 'read';

    // Optimistic update
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id ? { ...m, status: nextStatus, isRead: !currentIsRead } : m
      )
    );

    try {
      await markContactMessageStatus(msg.id, nextStatus);
    } catch (err) {
      console.error('Failed to update read status:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetMessage) return;
    const targetId = deleteTargetMessage.id;
    const targetName = deleteTargetMessage.senderName || 'শ্রোতা';

    // 1. Immediately remove from active state so user gets instant response
    setMessages((prev) => prev.filter((m) => m.id !== targetId));
    setDeleteTargetMessage(null);

    // 2. Persist delete in local tombstone and Firestore
    try {
      await deleteContactMessage(targetId);
      showToast(`"${targetName}" এর বার্তাটি সফলভাবে স্থায়ীভাবে মুছে ফেলা হয়েছে!`);
    } catch (err) {
      console.error('Error deleting message:', err);
      showToast('বার্তাটি মুছে ফেলা হয়েছে।');
    }
  };

  const handleConfirmBulkDeleteReplied = async () => {
    const repliedMessages = messages.filter((m) => m.status === 'replied');
    if (repliedMessages.length === 0) {
      setIsBulkDeletingReplied(false);
      return;
    }

    const count = repliedMessages.length;
    // Optimistic remove
    setMessages((prev) => prev.filter((m) => m.status !== 'replied'));
    setIsBulkDeletingReplied(false);

    // Delete each
    for (const msg of repliedMessages) {
      await deleteContactMessage(msg.id);
    }

    showToast(`কাজ সম্পন্ন হওয়া মোট ${count}টি বার্তা একসাথে মুছে ফেলা হয়েছে!`);
  };

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    const cached = getLocalCachedMessages();
    setMessages(cached);
    setTimeout(() => setIsRefreshing(false), 500);
    showToast('ইনবক্স ডেটা রিফ্রেশ করা হয়েছে।');
  };

  // Search & Filter
  const filtered = messages.filter((m) => {
    const name = String(m.senderName || m.userName || '').toLowerCase();
    const email = String(m.senderEmail || m.userEmail || '').toLowerCase();
    const phone = String(m.senderPhone || m.userPhone || '').toLowerCase();
    const body = String(m.message || '').toLowerCase();
    const query = search.trim().toLowerCase();

    const matchSearch =
      !query ||
      name.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      body.includes(query);

    const isRead = m.isRead === true || m.status === 'read' || m.status === 'replied';
    const isReplied = m.status === 'replied';

    let matchTab = true;
    if (filterTab === 'unread') {
      matchTab = !isRead;
    } else if (filterTab === 'replied') {
      matchTab = isReplied;
    } else if (filterTab === 'pending') {
      matchTab = !isReplied;
    } else if (filterTab === 'payment_issue') {
      matchTab = m.category === 'payment_help' || m.category === 'payment_issue';
    } else if (filterTab === 'complaint') {
      matchTab = m.category === 'complaint';
    }

    return matchSearch && matchTab;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'payment_issue':
      case 'payment_help':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <AlertTriangle className="w-2.5 h-2.5" />
            পেমেন্ট সহায়তা
          </span>
        );
      case 'complaint':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-500 border border-rose-500/30">
            <AlertTriangle className="w-2.5 h-2.5" />
            অভিযোগ
          </span>
        );
      case 'story_request':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">
            <Sparkles className="w-2.5 h-2.5" />
            গল্পের অনুরোধ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-500 border border-blue-500/30">
            <HelpCircle className="w-2.5 h-2.5" />
            মতামত ও সহায়তা
          </span>
        );
    }
  };

  const formatMessageDate = (msg: UserContactMessage) => {
    if (msg.timestamp) return msg.timestamp;
    if (msg.createdAt) {
      try {
        const d = new Date(msg.createdAt);
        return `${d.toLocaleDateString('bn-BD')} ${d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;
      } catch {}
    }
    return 'তারিখ অনুপলব্ধ';
  };

  const unreadCount = messages.filter((m) => !(m.isRead === true || m.status === 'read' || m.status === 'replied')).length;
  const repliedCount = messages.filter((m) => m.status === 'replied').length;
  const pendingCount = messages.length - repliedCount;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white font-medium text-xs sm:text-sm shadow-xl border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-md ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold font-serif-story">শ্রোতাদের ইনবক্স বার্তা</h2>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30">
                    {unreadCount}টি নতুন
                  </span>
                )}
                {repliedCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                    {repliedCount}টির কাজ শেষ
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                শ্রোতাদের পাঠানো মতামত, টেকনিক্যাল সহায়তা ও পরামর্শ। উত্তর দেওয়া হয়ে গেলে বার্তাটি স্থায়ীভাবে ডিলিট করতে পারেন।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {repliedCount > 0 && (
              <button
                onClick={() => setIsBulkDeletingReplied(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="যেসব বার্তার উত্তর দেওয়া শেষ হয়েছে সেগুলো সব একসাথে ডিলিট করুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>সম্পন্ন বার্তা মুছুন ({repliedCount})</span>
              </button>
            )}

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="ইনবক্স রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            সব বার্তা ({messages.length})
          </button>

          <button
            onClick={() => setFilterTab('unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterTab === 'unread'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            অপঠিত ({unreadCount})
          </button>

          <button
            onClick={() => setFilterTab('replied')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              filterTab === 'replied'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>কাজ সম্পন্ন / উত্তর দেওয়া ({repliedCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterTab === 'pending'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            উত্তর বাকি ({pendingCount})
          </button>

          <button
            onClick={() => setFilterTab('payment_issue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterTab === 'payment_issue'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            পেমেন্ট ইস্যু
          </button>

          <button
            onClick={() => setFilterTab('complaint')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterTab === 'complaint'
                ? 'bg-rose-700 text-white shadow-md shadow-rose-900/30'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            অভিযোগ
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম, ইমেইল, ফোন নম্বর বা বার্তার বিষয়বস্তু দিয়ে খুঁজুন..."
          className={`w-full pl-10 pr-16 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
            isLight
              ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-sm'
              : 'bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
          }`}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
          >
            মুছুন
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="space-y-3.5">
        {filtered.map((msg) => {
          const isRead = msg.isRead === true || msg.status === 'read' || msg.status === 'replied';
          const isReplied = msg.status === 'replied';
          const senderDisplayName = msg.senderName || msg.userName || 'নামহীন শ্রোতা';
          const senderDisplayEmail = msg.senderEmail || msg.userEmail || 'ইমেইল দেওয়া হয়নি';
          const senderDisplayPhone = msg.senderPhone || msg.userPhone;

          return (
            <div
              key={msg.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-sm ${
                isReplied
                  ? isLight
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                    : 'bg-emerald-950/15 border-emerald-500/30 text-white'
                  : !isRead
                  ? isLight
                    ? 'bg-white border-rose-300 shadow-md shadow-rose-500/5 ring-1 ring-rose-400/30'
                    : 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-rose-500/40 shadow-lg shadow-rose-950/10'
                  : isLight
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-slate-900/90 border-slate-800 text-white'
              }`}
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isReplied
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-indigo-500/20 text-indigo-500'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>

                  <span className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {senderDisplayName}
                  </span>

                  {getCategoryBadge(msg.category)}

                  {isReplied ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                      <CheckCheck className="w-3 h-3 text-emerald-500" />
                      উত্তর দেওয়া সম্পন্ন (কাজ শেষ)
                    </span>
                  ) : !isRead ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                      নতুন বার্তা
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/15 text-slate-500 dark:text-slate-400">
                      পঠিত
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className={`flex items-center gap-1 font-mono text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Clock className="w-3.5 h-3.5" />
                    {formatMessageDate(msg)}
                  </span>

                  {/* Mark as Answered/Done button (User's primary requested control) */}
                  <button
                    onClick={() => handleToggleReplied(msg)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                      isReplied
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : isLight
                        ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30'
                    }`}
                    title={isReplied ? 'আবার উত্তর বাকি হিসেবে মার্ক করুন' : 'বার্তার উত্তর বা কাজ সম্পন্ন হিসেবে চিহ্নিত করুন'}
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>{isReplied ? 'কাজ শেষ ✓' : 'কাজ সম্পন্ন মার্ক করুন'}</span>
                  </button>

                  {/* Read / Unread Toggle */}
                  <button
                    onClick={() => handleToggleRead(msg)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      !isRead
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 hover:bg-rose-500/25 border border-rose-500/30'
                        : isLight
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isRead ? 'অপঠিত' : 'পঠিত'}
                  </button>

                  {/* High-visibility In-App Delete Button (NO window.confirm!) */}
                  <button
                    onClick={() => setDeleteTargetMessage(msg)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/15 transition-colors cursor-pointer border border-transparent hover:border-rose-500/30"
                    title="এই বার্তাটি মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="py-3">
                {msg.subject && (
                  <h4 className={`text-xs font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    বিষয়: {msg.subject}
                  </h4>
                )}
                <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}>
                  {msg.message || 'কোনো লিখিত বিষয়বস্তু পাওয়া যায়নি।'}
                </p>
              </div>

              {/* Contact Footer Info & Actions */}
              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  {senderDisplayEmail && senderDisplayEmail !== 'ইমেইল দেওয়া হয়নি' && (
                    <a
                      href={`mailto:${senderDisplayEmail}?subject=Re: গপ্পো কাহিনী - আপনার বার্তার উত্তর`}
                      className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      title="শ্রোতার ইমেইলে সরাসরি উত্তর পাঠান"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{senderDisplayEmail}</span>
                    </a>
                  )}

                  {senderDisplayPhone && (
                    <a
                      href={`tel:${senderDisplayPhone}`}
                      className={`flex items-center gap-1.5 font-mono ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}
                      title="ফোনে যোগাযোগ করুন"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-500" />
                      <span>{senderDisplayPhone}</span>
                    </a>
                  )}
                </div>

                {/* Quick utility actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleCopy(msg.message, msg.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500 font-medium">কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>বার্তা কপি</span>
                      </>
                    )}
                  </button>

                  {senderDisplayEmail && senderDisplayEmail !== 'ইমেইল দেওয়া হয়নি' && (
                    <a
                      href={`mailto:${senderDisplayEmail}?subject=Re: গপ্পো কাহিনী`}
                      className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-[11px] text-white font-medium flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <Send className="w-3 h-3" />
                      <span>ইমেইলে উত্তর দিন</span>
                    </a>
                  )}

                  {/* If completed, show direct quick delete button */}
                  {isReplied && (
                    <button
                      onClick={() => setDeleteTargetMessage(msg)}
                      className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-[11px] text-white font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>কাজ শেষ • ডিলিট</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className={`text-center py-16 px-4 rounded-2xl border ${
            isLight
              ? 'bg-white border-slate-200 text-slate-600'
              : 'bg-slate-900/40 border-slate-800 text-slate-400'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
              isLight ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-slate-500'
            }`}>
              <Inbox className="w-6 h-6" />
            </div>
            <p className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              {search ? 'অনুসন্ধানের সাথে মেলে এমন কোনো বার্তা পাওয়া যায়নি' : 'এই ক্যাটাগরিতে বর্তমানে কোনো বার্তা নেই'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              শ্রোতারা যোগাযোগ ফর্ম থেকে বার্তা পাঠালে এখানে তাৎক্ষণিক রিয়েলটাইমে প্রদর্শিত হবে।
            </p>
          </div>
        )}
      </div>

      {/* IN-APP CONFIRMATION MODAL FOR SINGLE MESSAGE DELETION (100% iframe safe, no window.confirm) */}
      {deleteTargetMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5 text-rose-500">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold">বার্তা ডিলিট নিশ্চিতকরণ</h3>
              </div>
              <button
                onClick={() => setDeleteTargetMessage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              আপনি কি নিশ্চিত যে <strong className="text-rose-500 font-semibold">"{deleteTargetMessage.senderName || 'শ্রোতা'}"</strong> এর এই বার্তাটি স্থায়ীভাবে মুছে ফেলতে চান?
            </p>

            <div className={`p-3 rounded-xl border text-xs mb-5 max-h-28 overflow-y-auto ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <p className="italic font-sans">"{deleteTargetMessage.message}"</p>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTargetMessage(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                বাতিল করুন
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-rose-900/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, স্থায়ীভাবে মুছুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL FOR BULK DELETION OF REPLIED MESSAGES */}
      {isBulkDeletingReplied && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5 text-rose-500">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold">সম্পন্ন সকল বার্তা মুছুন</h3>
              </div>
              <button
                onClick={() => setIsBulkDeletingReplied(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed mb-5 ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              আপনার ইনবক্সে মোট <strong className="text-emerald-500 font-bold">{repliedCount}টি</strong> বার্তার কাজ বা উত্তর দেওয়া সম্পন্ন হয়েছে। আপনি কি এই সমস্ত সম্পন্ন বার্তা একবারে স্থায়ীভাবে মুছে ফেলতে চান?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBulkDeletingReplied(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                বাতিল করুন
              </button>

              <button
                type="button"
                onClick={handleConfirmBulkDeleteReplied}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-rose-900/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, সবগুলো মুছুন ({repliedCount})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
