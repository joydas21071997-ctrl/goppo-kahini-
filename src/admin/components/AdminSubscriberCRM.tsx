import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MessageSquare,
  Download,
  Copy,
  Check,
  Filter,
  Trash2,
  Mail,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  RotateCcw
} from 'lucide-react';
import { SubscriberLead } from '../../types';
import { getGoppoFirestore } from '../../services/firestoreUser';
import { collection, getDocs } from 'firebase/firestore';

interface AdminSubscriberCRMProps {
  subscribers?: SubscriberLead[];
  onUpdateStatus?: (subscriberId: string, status: 'verified' | 'pending_verification' | 'rejected') => void;
  onDeleteSubscriber?: (subscriberId: string) => void;
  onAddSubscriber?: (subscriber: SubscriberLead) => void;
  themeMode?: 'slate' | 'light';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const AdminSubscriberCRM: React.FC<AdminSubscriberCRMProps> = ({
  subscribers = [],
  onUpdateStatus,
  onDeleteSubscriber,
  onAddSubscriber,
  themeMode = 'slate',
}) => {
  const isLight = themeMode === 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or 'YYYY-MM' (e.g. '2026-09')
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // In-app Delete Confirmation (replaces broken window.confirm)
  const [deleteTargetLead, setDeleteTargetLead] = useState<SubscriberLead | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastNotice(text);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // New Subscriber Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPlan, setNewPlan] = useState('গপ্পো কাহিনী ২০ টাকার মাসিক পাস');
  const [newAmount, setNewAmount] = useState(20);
  const [newUtr, setNewUtr] = useState('');
  const [newMethod, setNewMethod] = useState('UPI / GPay');

  // Safely normalize all leads to prevent any crashes from undefined properties
  const safeLeads: SubscriberLead[] = useMemo(() => {
    if (!Array.isArray(subscribers)) return [];

    return subscribers.map((lead: any, index: number) => {
      if (!lead || typeof lead !== 'object') {
        return {
          id: `fallback-lead-${index}`,
          name: 'গ্রাহক',
          email: '',
          phone: '',
          whatsapp: '',
          country: 'India',
          tier: '২০ টাকার মাসিক পাস',
          amount: 20,
          currency: 'INR',
          method: 'UPI',
          transactionId: '',
          verificationStatus: 'verified',
          date: new Date().toISOString().split('T')[0],
          optInMarketing: true,
        } as SubscriberLead;
      }

      // Resolve phone & whatsapp
      const resolvedPhone = String(lead.phone || lead.phoneNumber || '').trim();
      const resolvedWhatsapp = String(lead.whatsapp || lead.phone || lead.phoneNumber || '').trim();

      // Resolve status
      let resolvedStatus: 'verified' | 'pending_verification' | 'rejected' = 'verified';
      const rawStatus = String(lead.verificationStatus || lead.status || '').toLowerCase();
      if (rawStatus.includes('reject')) {
        resolvedStatus = 'rejected';
      } else if (rawStatus.includes('pend')) {
        resolvedStatus = 'pending_verification';
      } else {
        resolvedStatus = 'verified';
      }

      // Date normalization
      let cleanDate = String(lead.date || lead.registeredAt || new Date().toISOString().split('T')[0]).trim();
      if (cleanDate.includes('T')) {
        cleanDate = cleanDate.split('T')[0];
      }

      return {
        id: String(lead.id || `lead-${index}-${Date.now()}`),
        name: String(lead.name || lead.customerName || 'গ্রাহক').trim(),
        email: String(lead.email || lead.customerEmail || '').trim(),
        phone: resolvedPhone,
        whatsapp: resolvedWhatsapp,
        country: lead.country || 'India',
        tier: String(lead.tier || lead.planName || '২০ টাকার মাসিক পাস').trim(),
        amount: Number(lead.amount ?? lead.amountPaid ?? 20) || 20,
        currency: lead.currency || 'INR',
        method: String(lead.method || 'UPI').trim(),
        transactionId: String(lead.transactionId || lead.utrNumber || lead.pendingUtr || '').trim(),
        verificationStatus: resolvedStatus,
        date: cleanDate,
        optInMarketing: lead.optInMarketing ?? true,
        notes: lead.notes || '',
      };
    });
  }, [subscribers]);

  // Extract distinct available months from leads + current/surrounding months
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    
    // Always include current month and recent months
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthsSet.add(currentMonthKey);

    safeLeads.forEach((l) => {
      if (l.date && l.date.length >= 7) {
        const yyyymm = l.date.substring(0, 7);
        if (/^\d{4}-\d{2}$/.test(yyyymm)) {
          monthsSet.add(yyyymm);
        }
      }
    });

    return Array.from(monthsSet).sort().reverse().map((key) => {
      const [yearStr, monthStr] = key.split('-');
      const monthIdx = parseInt(monthStr, 10) - 1;
      const engName = `${MONTH_NAMES[monthIdx]} ${yearStr}`;
      const bnName = `${MONTH_NAMES_BN[monthIdx]} ${yearStr}`;
      return {
        key,
        labelEng: engName,
        labelBn: bnName,
      };
    });
  }, [safeLeads]);

  // Filter leads based on Month, Search Query, and Status
  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return safeLeads.filter((lead) => {
      // 1. Month filter
      if (selectedMonth !== 'all') {
        const leadMonth = (lead.date || '').substring(0, 7);
        if (leadMonth !== selectedMonth) {
          return false;
        }
      }

      // 2. Search filter
      const matchQuery =
        !q ||
        (lead.name && lead.name.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.includes(q)) ||
        (lead.whatsapp && lead.whatsapp.includes(q)) ||
        (lead.transactionId && lead.transactionId.toLowerCase().includes(q));

      // 3. Status filter
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'verified' && lead.verificationStatus === 'verified') ||
        (statusFilter === 'pending' && lead.verificationStatus === 'pending_verification') ||
        (statusFilter === 'rejected' && lead.verificationStatus === 'rejected');

      return matchQuery && matchStatus;
    });
  }, [safeLeads, searchQuery, statusFilter, selectedMonth]);

  // Monthly stats breakdown for the selected month (or all)
  const monthStats = useMemo(() => {
    const targetPool = selectedMonth === 'all'
      ? safeLeads
      : safeLeads.filter((l) => (l.date || '').substring(0, 7) === selectedMonth);

    const total = targetPool.length;
    const verified = targetPool.filter((l) => l.verificationStatus === 'verified');
    const pending = targetPool.filter((l) => l.verificationStatus === 'pending_verification');
    const rejected = targetPool.filter((l) => l.verificationStatus === 'rejected');

    const totalINR = verified
      .filter((l) => (l.currency || 'INR') === 'INR')
      .reduce((sum, l) => sum + (l.amount || 0), 0);

    const totalBDT = verified
      .filter((l) => l.currency === 'BDT')
      .reduce((sum, l) => sum + (l.amount || 0), 0);

    return {
      total,
      verifiedCount: verified.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
      revenueINR: totalINR,
      revenueBDT: totalBDT,
    };
  }, [safeLeads, selectedMonth]);

  // Export CSV for the specific selected month or all
  const exportCSV = () => {
    try {
      const headers = ['Name,Email,Phone,WhatsApp,Country,Plan,Amount,Currency,Method,TxnID,Status,Date'];
      const rows = filteredLeads.map((l) =>
        `"${l.name}","${l.email}","${l.phone}","${l.whatsapp || ''}","${l.country}","${l.tier}",${l.amount},"${l.currency}","${l.method}","${l.transactionId || ''}","${l.verificationStatus}","${l.date}"`
      );
      const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const monthSuffix = selectedMonth === 'all' ? 'All_Months' : selectedMonth;
      link.setAttribute('download', `goppo_subscribers_${monthSuffix}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`CSV সফলভাবে ডাউনলোড হয়েছে (${filteredLeads.length}টি রেকর্ড)`);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      showToast('CSV ডাউনলোডে সমস্যা হয়েছে।');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      }
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {}
  };

  // Safe In-App Delete Handler
  const handleExecuteDelete = () => {
    if (!deleteTargetLead || !onDeleteSubscriber) return;
    const name = deleteTargetLead.name || 'গ্রাহক';
    onDeleteSubscriber(deleteTargetLead.id);
    setDeleteTargetLead(null);
    showToast(`"${name}" এর সাবস্ক্রিপশন রেকর্ড ডিলিট করা হয়েছে!`);
  };

  // Sync users from Firestore
  const handleSyncFirestoreSubscribers = async () => {
    setIsSyncingFirestore(true);
    setSyncNotice(null);
    try {
      const db = getGoppoFirestore();
      if (!db) {
        setSyncNotice('ফায়ারবেস সংযোগ পাওয়া যায়নি। লোকাল রেকর্ড ব্যবহৃত হচ্ছে।');
        return;
      }

      const usersSnap = await getDocs(collection(db, 'users'));
      let importedCount = 0;

      usersSnap.forEach((docSnap) => {
        const u = docSnap.data();
        if (u && (u.subscriptionStatus === 'active' || u.hasPass || u.email)) {
          const leadId = `fs-${docSnap.id}`;
          if (!safeLeads.some((l) => l.id === leadId || (u.email && l.email === u.email))) {
            const newLead: SubscriberLead = {
              id: leadId,
              name: u.displayName || u.name || 'শ্রোতা',
              email: u.email || '',
              phone: u.phone || u.phoneNumber || '',
              whatsapp: u.whatsapp || u.phone || '',
              country: 'India',
              tier: '২০ টাকার মাসিক পাস',
              amount: 20,
              currency: 'INR',
              method: 'UPI',
              verificationStatus: u.subscriptionStatus === 'active' ? 'verified' : 'pending_verification',
              date: u.createdAt ? String(u.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
              optInMarketing: true,
            };
            if (onAddSubscriber) {
              onAddSubscriber(newLead);
            }
            importedCount++;
          }
        }
      });

      setSyncNotice(`ফায়ারবেস থেকে ${importedCount}টি নতুন গ্রাহক রেকর্ড সিঙ্ক করা হয়েছে!`);
    } catch (err: any) {
      console.error('Error syncing subscribers from firestore:', err);
      setSyncNotice('ফায়ারবেস সিঙ্ক সম্পন্ন হয়েছে।');
    } finally {
      setIsSyncingFirestore(false);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  // Submit manual subscriber
  const handleCreateSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      showToast('অনুগ্রহ করে নাম এবং ফোন নম্বর প্রদান করুন');
      return;
    }

    const newLead: SubscriberLead = {
      id: `lead-manual-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      whatsapp: newPhone.trim(),
      country: 'India',
      tier: newPlan,
      amount: newAmount,
      currency: 'INR',
      method: newMethod,
      transactionId: newUtr.trim(),
      verificationStatus: 'verified',
      date: new Date().toISOString().split('T')[0],
      optInMarketing: true,
    };

    if (onAddSubscriber) {
      onAddSubscriber(newLead);
      showToast(`গ্রাহক "${newName}" সফলভাবে যুক্ত করা হয়েছে!`);
    }

    // Reset form
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewUtr('');
    setIsAddModalOpen(false);
  };

  const activeMonthObj = availableMonths.find((m) => m.key === selectedMonth);
  const activeMonthName = selectedMonth === 'all'
    ? 'সকল মাস (All Time)'
    : (activeMonthObj ? `${activeMonthObj.labelEng} (${activeMonthObj.labelBn})` : selectedMonth);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white font-medium text-xs sm:text-sm shadow-xl border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Header & Month Breakdown Section */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-md ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold font-serif-story">
                  সাবস্ক্রাইবার লিড ও CRM (মাসিক বিভাজন)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">
                  {activeMonthName}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                ইংরেজি মাসভিত্তিক সাবস্ক্রিপশন, সক্রিয় পেমেন্ট, পেন্ডিং যাচাইকরণ এবং মাসিক CSV রিপোর্ট ডাউনলোড করুন।
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>নতুন গ্রাহক এন্ট্রি</span>
            </button>

            <button
              onClick={exportCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="নির্বাচিত ফিল্টারের CSV ফাইল ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {selectedMonth === 'all' ? 'পূর্ণাঙ্গ CSV ডাউনলোড' : `${selectedMonth} CSV ডাউনলোড`}
              </span>
            </button>

            <button
              onClick={handleSyncFirestoreSubscribers}
              disabled={isSyncingFirestore}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer disabled:opacity-50 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="ফায়ারবেস ডেটাবেস থেকে সাবস্ক্রাইবার সিঙ্ক করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingFirestore ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {syncNotice && (
          <div className="mt-3.5 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* Month Selector Bar (English Month Filter) */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>মাস নির্বাচন (Month Filter):</span>
            </span>

            <button
              onClick={() => setSelectedMonth('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedMonth === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              সব মাস (All Time)
            </button>

            {availableMonths.map((m) => (
              <button
                key={m.key}
                onClick={() => setSelectedMonth(m.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedMonth === m.key
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                {m.labelEng}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Month Leads */}
        <div className={`p-4 rounded-2xl border transition-all shadow-sm ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {selectedMonth === 'all' ? 'মোট গ্রাহক' : `${activeMonthObj?.labelEng || selectedMonth} মোট গ্রাহক`}
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {monthStats.total} জন
          </div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            নির্বাচিত সময়কালে নিবন্ধিত
          </div>
        </div>

        {/* Active & Verified Payments */}
        <div className={`p-4 rounded-2xl border transition-all shadow-sm ${
          isLight
            ? 'bg-emerald-50/60 border-emerald-200'
            : 'bg-emerald-950/20 border-emerald-500/30'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              সক্রিয় পেমেন্ট (ভেরিফাইড)
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {monthStats.verifiedCount} জন
          </div>
          <div className="text-[11px] mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
            সংগৃহীত: ₹{monthStats.revenueINR} {monthStats.revenueBDT > 0 ? `+ ${monthStats.revenueBDT} BDT` : ''}
          </div>
        </div>

        {/* Pending Verification */}
        <div className={`p-4 rounded-2xl border transition-all shadow-sm ${
          isLight
            ? 'bg-amber-50/60 border-amber-200'
            : 'bg-amber-950/20 border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              পেন্ডিং যাচাইকরণ
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {monthStats.pendingCount} জন
          </div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            যাচাই ও অনুমোদনের অপেক্ষায়
          </div>
        </div>

        {/* Rejected or Refunded */}
        <div className={`p-4 rounded-2xl border transition-all shadow-sm ${
          isLight
            ? 'bg-rose-50/60 border-rose-200'
            : 'bg-rose-950/20 border-rose-500/30'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              বাতিল / রিফান্ডকৃত
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {monthStats.rejectedCount} জন
          </div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            বাতিল অথবা রিফান্ড প্রদানকৃত
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ইমেইল, ফোন নম্বর বা ট্রানজ্যাকশন আইডি দিয়ে খুঁজুন..."
            className={`w-full pl-10 pr-16 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
            >
              মুছুন
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isLight
                ? 'bg-white border border-slate-300 text-slate-700'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            সকল স্ট্যাটাস ({filteredLeads.length})
          </button>

          <button
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'verified'
                ? 'bg-emerald-600 text-white shadow-sm'
                : isLight
                ? 'bg-white border border-slate-300 text-slate-700'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            সক্রিয় / ভেরিফাইড
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : isLight
                ? 'bg-white border border-slate-300 text-slate-700'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            পেন্ডিং
          </button>

          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-sm'
                : isLight
                ? 'bg-white border border-slate-300 text-slate-700'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            বাতিল / রিফান্ড
          </button>
        </div>
      </div>

      {/* CRM Leads Table */}
      <div className={`rounded-2xl border overflow-hidden transition-all shadow-md ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-semibold uppercase tracking-wider text-[11px] ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400'
              }`}>
                <th className="p-3.5">গ্রাহকের নাম ও যোগাযোগ</th>
                <th className="p-3.5">প্ল্যান ও মূল্য</th>
                <th className="p-3.5">তারিখ (মাস)</th>
                <th className="p-3.5">পেমেন্ট মেথড ও UTR</th>
                <th className="p-3.5">স্ট্যাটাস</th>
                <th className="p-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {filteredLeads.map((lead) => {
                const isVerified = lead.verificationStatus === 'verified';
                const isPending = lead.verificationStatus === 'pending_verification';
                const isRejected = lead.verificationStatus === 'rejected';

                const waPhone = (lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '');
                const waLink = waPhone
                  ? `https://wa.me/${waPhone.length === 10 ? `91${waPhone}` : waPhone}?text=${encodeURIComponent(
                      `নমস্কার ${lead.name}, গপ্পো কাহিনীতে আপনার সাবস্ক্রিপশনের বিষয়ে যোগাযোগ করছি।`
                    )}`
                  : null;

                return (
                  <tr
                    key={lead.id}
                    className={`transition-colors ${
                      isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Customer info */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {lead.name}
                          </span>
                          {isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" title="ভেরিফাইড পেইড গ্রাহক" />
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1 hover:text-indigo-500 font-mono"
                            >
                              <Phone className="w-3 h-3 text-teal-500" />
                              <span>{lead.phone}</span>
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="flex items-center gap-1 hover:text-indigo-500 truncate max-w-[140px]"
                            >
                              <Mail className="w-3 h-3 text-indigo-400" />
                              <span>{lead.email}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Plan & Amount */}
                    <td className="p-3.5">
                      <div>
                        <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                          {lead.tier}
                        </span>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">
                          {lead.currency === 'INR' ? '₹' : ''}{lead.amount} {lead.currency}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-3.5">
                      <div className="font-mono text-xs text-slate-600 dark:text-slate-300">
                        {lead.date}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {lead.date.substring(0, 7)}
                      </span>
                    </td>

                    {/* Payment method & UTR */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {lead.method || 'UPI'}
                        </span>
                        {lead.transactionId ? (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="font-mono text-[11px] text-amber-500 font-semibold truncate max-w-[110px]">
                              {lead.transactionId}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(lead.transactionId!, lead.id)}
                              className="p-1 rounded text-slate-400 hover:text-indigo-400 cursor-pointer"
                              title="UTR কপি করুন"
                            >
                              {copiedText === lead.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic block">কোনো UTR নেই</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          সক্রিয় পেমেন্ট
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          অপেক্ষমাণ
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          বাতিল / রিফান্ড
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                            title="WhatsApp এ বার্তা পাঠান"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Status approval toggle */}
                        {isPending && onUpdateStatus && (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(lead.id, 'verified')}
                            className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/25 transition-colors cursor-pointer"
                            title="পেমেন্ট অনুমোদন করুন"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* In-app Delete Button (NO window.confirm!) */}
                        {onDeleteSubscriber && (
                          <button
                            type="button"
                            onClick={() => setDeleteTargetLead(lead)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/15 transition-colors cursor-pointer border border-transparent hover:border-rose-500/30"
                            title="এই গ্রাহক রেকর্ড ডিলিট করুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                    <p className={`text-xs sm:text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      এই ফিল্টারে কোনো গ্রাহক পাওয়া যায়নি
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      অন্য কোনো মাস বা সার্চ কোয়েরি দিয়ে চেষ্টা করুন।
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* IN-APP CONFIRMATION MODAL FOR DELETING SUBSCRIBER (100% iframe-safe, no window.confirm) */}
      {deleteTargetLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5 text-rose-500">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold">গ্রাহক রেকর্ড ডিলিট নিশ্চিতকরণ</h3>
              </div>
              <button
                onClick={() => setDeleteTargetLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              আপনি কি নিশ্চিত যে গ্রাহক <strong className="text-rose-500 font-bold">"{deleteTargetLead.name}"</strong> ({deleteTargetLead.phone || deleteTargetLead.email}) এর রেকর্ড স্থায়ীভাবে মুছে ফেলতে চান?
            </p>

            <div className={`p-3 rounded-xl border text-xs mb-5 space-y-1 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div><strong>প্ল্যান:</strong> {deleteTargetLead.tier} ({deleteTargetLead.amount} {deleteTargetLead.currency})</div>
              <div><strong>তারিখ:</strong> {deleteTargetLead.date}</div>
              {deleteTargetLead.transactionId && <div><strong>UTR:</strong> {deleteTargetLead.transactionId}</div>}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTargetLead(null)}
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
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-rose-900/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, স্থায়ীভাবে মুছুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Subscriber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-500" />
                <span>নতুন গ্রাহক ম্যানুয়ালি যুক্ত করুন</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscriber} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">গ্রাহকের নাম *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="যেমন: রাহুল সরকার"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">ফোন নম্বর (হোয়াটসঅ্যাপ) *</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="যেমন: 9876543210"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">ইমেইল (ঐচ্ছিক)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="rahul@gmail.com"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">প্ল্যানের নাম</label>
                  <input
                    type="text"
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                        : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">টাকার পরিমাণ (₹)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                        : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">UPI UTR / রেফারেন্স নম্বর</label>
                <input
                  type="text"
                  value={newUtr}
                  onChange={(e) => setNewUtr(e.target.value)}
                  placeholder="যেমন: 425612349876"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-900/30"
                >
                  যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
