import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  AlertTriangle,
  QrCode,
  Copy,
  ExternalLink,
  MessageSquare,
  Phone,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  DollarSign,
  Calendar,
  Eye,
  FileText,
  Save,
  Check,
  Ban,
  UserCheck,
  X,
  History,
  Building,
  Lock,
  Download,
  Filter
} from 'lucide-react';
import { PaymentTransaction, AdminActivityLog, UpiConfig, PaymentStatus } from '../types';

interface AdminPaymentManagementProps {
  transactions: PaymentTransaction[];
  onApprovePayment: (transactionId: string) => void;
  onRejectPayment: (transactionId: string, reason: string) => void;
  onApproveRefund: (transactionId: string) => void;
  onRejectRefund: (transactionId: string, reason: string) => void;
  onCompleteRefund: (transactionId: string, refundUtr: string, refundAmount: number, refundNote: string) => void;
  upiConfig: UpiConfig;
  onUpdateUpiConfig: (newConfig: UpiConfig) => void;
  activityLogs: AdminActivityLog[];
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

export const AdminPaymentManagement: React.FC<AdminPaymentManagementProps> = ({
  transactions,
  onApprovePayment,
  onRejectPayment,
  onApproveRefund,
  onRejectRefund,
  onCompleteRefund,
  upiConfig,
  onUpdateUpiConfig,
  activityLogs,
  themeMode = 'slate',
}) => {
  const isLight = themeMode === 'light';

  // Sub-tabs: 'transactions' | 'upi_settings' | 'activity_log'
  const [subTab, setSubTab] = useState<'transactions' | 'upi_settings' | 'activity_log'>('transactions');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or 'YYYY-MM' (e.g. '2026-09')
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastNotice(text);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Modals / Dialogs State
  const [viewScreenshotUrl, setViewScreenshotUrl] = useState<string | null>(null);
  const [selectedTxForReject, setSelectedTxForReject] = useState<PaymentTransaction | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [selectedTxForRefund, setSelectedTxForRefund] = useState<PaymentTransaction | null>(null);
  const [refundUtr, setRefundUtr] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(20);
  const [refundNote, setRefundNote] = useState('');

  // UPI Settings Form State
  const [editUpiId, setEditUpiId] = useState(upiConfig.upiId || 'jdpro@axisbank');
  const [editPayeeName, setEditPayeeName] = useState(upiConfig.payeeName || 'Goppo Kothon');
  const [editBankName, setEditBankName] = useState(upiConfig.bankName || 'Axis Bank');
  const [editAccountNumber, setEditAccountNumber] = useState(upiConfig.accountNumber || '');
  const [editIfscCode, setEditIfscCode] = useState(upiConfig.ifscCode || '');
  const [editInstructions, setEditInstructions] = useState(upiConfig.paymentInstructions || '');
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Extract distinct available months from transactions
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    
    // Always include current month
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthsSet.add(currentMonthKey);

    transactions.forEach((t) => {
      if (t.paymentDate && t.paymentDate.length >= 7) {
        const yyyymm = t.paymentDate.substring(0, 7);
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
  }, [transactions]);

  // Overall key metrics
  const totalPayments = transactions.length;
  const pendingPayments = transactions.filter((t) => t.status === 'pending').length;
  const approvedPayments = transactions.filter((t) => t.status === 'paid' || (t.status as any) === 'approved').length;
  const rejectedPayments = transactions.filter((t) => t.status === 'rejected').length;
  const refundRequests = transactions.filter((t) => t.status === 'refund_requested').length;
  const completedRefunds = transactions.filter((t) => t.status === 'refunded').length;
  const cancelledSubscriptions = transactions.filter((t) => t.status === 'cancelled').length;

  const nowStr = new Date().toISOString().split('T')[0];
  const activeSubscriptions = transactions.filter(
    (t) => (t.status === 'paid' || (t.status as any) === 'approved') && (!t.subscriptionExpiryDate || t.subscriptionExpiryDate >= nowStr)
  ).length;

  // Selected Month Metrics
  const monthStats = useMemo(() => {
    const targetPool = selectedMonth === 'all'
      ? transactions
      : transactions.filter((t) => (t.paymentDate || '').substring(0, 7) === selectedMonth);

    const total = targetPool.length;
    const paid = targetPool.filter((t) => t.status === 'paid' || (t.status as any) === 'approved');
    const pending = targetPool.filter((t) => t.status === 'pending');
    const rejected = targetPool.filter((t) => t.status === 'rejected');
    const refundReq = targetPool.filter((t) => t.status === 'refund_requested');
    const refunded = targetPool.filter((t) => t.status === 'refunded');

    const totalINR = paid
      .filter((t) => (t.currency || 'INR') === 'INR')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalBDT = paid
      .filter((t) => t.currency === 'BDT')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      total,
      paidCount: paid.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
      refundReqCount: refundReq.length,
      refundedCount: refunded.length,
      revenueINR: totalINR,
      revenueBDT: totalBDT,
    };
  }, [transactions, selectedMonth]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return transactions.filter((tx) => {
      // 1. Month filter
      if (selectedMonth !== 'all') {
        const txMonth = (tx.paymentDate || '').substring(0, 7);
        if (txMonth !== selectedMonth) {
          return false;
        }
      }

      // 2. Search query
      const matchesSearch =
        !q ||
        (tx.userName && tx.userName.toLowerCase().includes(q)) ||
        (tx.userEmail && tx.userEmail.toLowerCase().includes(q)) ||
        (tx.userPhone && tx.userPhone.includes(q)) ||
        (tx.userWhatsapp && tx.userWhatsapp.includes(q)) ||
        (tx.utrTransactionId && tx.utrTransactionId.toLowerCase().includes(q)) ||
        (tx.userId && tx.userId.toLowerCase().includes(q));

      // 3. Status filter
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'paid') {
          matchesStatus = tx.status === 'paid' || (tx.status as any) === 'approved';
        } else {
          matchesStatus = tx.status === statusFilter;
        }
      }

      // 4. Plan filter
      const matchesPlan = planFilter === 'all' || tx.planId === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [transactions, searchQuery, statusFilter, planFilter, selectedMonth]);

  // Export CSV of transactions (filtered or selected month)
  const exportPaymentCSV = () => {
    try {
      const headers = ['TxnID,CustomerName,Email,Phone,Plan,Amount,Currency,Status,PaymentDate,PaymentTime,UTR,RefundReason,RefundUTR'];
      const rows = filteredTransactions.map((t) =>
        `"${t.id}","${t.userName}","${t.userEmail}","${t.userPhone}","${t.planName}",${t.amount},"${t.currency}","${t.status}","${t.paymentDate}","${t.paymentTime}","${t.utrTransactionId || ''}","${t.refundReason || ''}","${t.refundUtr || ''}"`
      );
      const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const monthSuffix = selectedMonth === 'all' ? 'All_Months' : selectedMonth;
      link.setAttribute('download', `goppo_payments_${monthSuffix}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`পেমেন্ট ও রিফান্ড CSV সফলভাবে ডাউনলোড হয়েছে (${filteredTransactions.length}টি লেনদেন)`);
    } catch (err) {
      console.error('Failed to export payment CSV:', err);
      showToast('CSV ডাউনলোডে সমস্যা হয়েছে।');
    }
  };

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard?.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const handleSaveUpiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUpiConfig({
      upiId: editUpiId.trim(),
      payeeName: editPayeeName.trim(),
      bankName: editBankName.trim(),
      accountNumber: editAccountNumber.trim(),
      ifscCode: editIfscCode.trim(),
      paymentInstructions: editInstructions.trim(),
    });
    setSettingsSaveSuccess(true);
    showToast('UPI সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSettingsSaveSuccess(false), 3000);
  };

  const handleConfirmReject = () => {
    if (!selectedTxForReject) return;
    onRejectPayment(selectedTxForReject.id, rejectReason || 'ব্যাংক অ্যাকাউন্টে টাকা জমা হওয়ার তথ্য পাওয়া যায়নি।');
    showToast(`লেনদেন ${selectedTxForReject.utrTransactionId || selectedTxForReject.id} বাতিল করা হয়েছে।`);
    setSelectedTxForReject(null);
    setRejectReason('');
  };

  const handleConfirmRefundComplete = () => {
    if (!selectedTxForRefund) return;
    onCompleteRefund(
      selectedTxForRefund.id,
      refundUtr || `REF-${Date.now().toString().slice(-6)}`,
      refundAmount || selectedTxForRefund.amount,
      refundNote || 'ম্যানুয়াল ব্যাংক ট্রান্সফার সম্পন্ন।'
    );
    showToast(`গ্রাহক ${selectedTxForRefund.userName} এর রিফান্ড সফলভাবে সম্পন্ন হয়েছে!`);
    setSelectedTxForRefund(null);
    setRefundUtr('');
    setRefundNote('');
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

      {/* 1. TOP HEADER & SUB-NAVIGATION */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-md ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold font-serif-story">
                  পেমেন্ট ও রিফান্ড ম্যানেজমেন্ট (মাসিক রিপোর্ট)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {activeMonthName}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                সরাসরি UPI লেনদেন, ম্যানুয়াল UTR ভেরিফিকেশন, রিফান্ড ও মাসিক CSV হিসাব
              </p>
            </div>
          </div>

          {/* Sub-tab Pill Switcher & CSV Download */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={exportPaymentCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="নির্বাচিত মাসের পেমেন্ট CSV ডাউনলোড"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{selectedMonth === 'all' ? 'পেমেন্ট CSV' : `${selectedMonth} CSV`}</span>
            </button>

            <div className={`flex items-center gap-1 p-1 rounded-2xl border text-xs ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => setSubTab('transactions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  subTab === 'transactions'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>লেনদেন তালিকা</span>
                {pendingPayments > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white px-1">
                    {pendingPayments}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSubTab('upi_settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  subTab === 'upi_settings'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>UPI ও QR সেটিংস</span>
              </button>

              <button
                type="button"
                onClick={() => setSubTab('activity_log')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  subTab === 'activity_log'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>অ্যাক্টিভিটি লগ</span>
              </button>
            </div>
          </div>
        </div>

        {/* English Month Selection Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>মাস নির্বাচন (Month Filter):</span>
            </span>

            <button
              onClick={() => setSelectedMonth('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedMonth === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
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
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {m.labelEng}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD METRICS: Monthly & Overall Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Month Revenue */}
        <div className={`p-4 rounded-2xl border transition-all shadow-sm ${
          isLight ? 'bg-amber-50/60 border-amber-200 text-slate-900' : 'bg-amber-950/20 border-amber-500/40 text-white'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium text-amber-600 dark:text-amber-400">
            <span>{selectedMonth === 'all' ? 'মোট আয়' : `${activeMonthObj?.labelEng || selectedMonth} আয়`}</span>
            <DollarSign className="h-4 w-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            ₹{monthStats.revenueINR}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
            {monthStats.revenueBDT > 0 ? `+ ${monthStats.revenueBDT} BDT • ` : ''}সফল সাবস্ক্রিপশন
          </span>
        </div>

        {/* 2. Pending Payments */}
        <div className={`p-4 rounded-2xl border transition-all shadow-sm relative overflow-hidden ${
          isLight ? 'bg-white border-amber-300 text-slate-900' : 'bg-slate-900 border-amber-500/60 text-white'
        }`}>
          {monthStats.pendingCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          )}
          <div className="flex items-center justify-between text-xs font-medium text-amber-600 dark:text-amber-400">
            <span>যাচাই বাকি (Pending)</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-300 mt-1">
            {monthStats.pendingCount}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
            অনুমোদন প্রয়োজন
          </span>
        </div>

        {/* 3. Approved / Paid */}
        <div className={`p-4 rounded-2xl border transition-all shadow-sm ${
          isLight ? 'bg-emerald-50/60 border-emerald-200 text-slate-900' : 'bg-emerald-950/20 border-emerald-500/40 text-white'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span>অনুমোদিত (Approved)</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {monthStats.paidCount}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
            সক্রিয় পেইড পাস
          </span>
        </div>

        {/* 4. Refund Requests & Completed */}
        <div className={`p-4 rounded-2xl border transition-all shadow-sm ${
          isLight ? 'bg-rose-50/60 border-rose-200 text-slate-900' : 'bg-rose-950/20 border-rose-500/40 text-white'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium text-rose-600 dark:text-rose-400">
            <span>রিফান্ড অনুরোধ / সম্পন্ন</span>
            <RotateCcw className="h-4 w-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {monthStats.refundReqCount} / {monthStats.refundedCount}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
            বিবেচনাধীন / ফেরত দেওয়া
          </span>
        </div>

        {/* 5. Total Transactions */}
        <div className={`p-4 rounded-2xl border transition-all shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>মোট লেনদেন রেকর্ড</span>
            <FileText className="h-4 w-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {monthStats.total}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
            নির্বাচিত সময়কালে
          </span>
        </div>
      </div>

      {/* SUB-TAB 1: TRANSACTIONS LIST */}
      {subTab === 'transactions' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className={`rounded-2xl border p-4 space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="sm:col-span-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="গ্রাহকের নাম, ইমেইল, ফোন, বা UTR দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-xl border py-2.5 pl-9 pr-8 text-xs focus:outline-none transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                      : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-xs focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                  }`}
                >
                  <option value="all">সব স্ট্যাটাস ({transactions.length})</option>
                  <option value="pending">Pending / যাচাই বাকি ({pendingPayments})</option>
                  <option value="paid">Approved / অনুমোদিত ({approvedPayments})</option>
                  <option value="rejected">Rejected / বাতিল ({rejectedPayments})</option>
                  <option value="refund_requested">Refund Requested / রিফান্ড অনুরোধ ({refundRequests})</option>
                  <option value="refunded">Refunded / রিফান্ড সম্পন্ন ({completedRefunds})</option>
                  <option value="cancelled">Cancelled / বাতিলকৃত ({cancelledSubscriptions})</option>
                </select>
              </div>

              {/* Plan Filter */}
              <div className="sm:col-span-3">
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-xs focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                  }`}
                >
                  <option value="all">সব প্ল্যান</option>
                  <option value="little_monthly">মাসিক পাস (₹২০)</option>
                  <option value="little_annual">বার্ষিক পাস (₹১৯৯)</option>
                  <option value="single_story">একক মেগা গল্প (₹১০)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
              <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>
                লেনদেনের স্থায়ী অডিট ট্রেইল সংরক্ষিত রয়েছে। যেকোনো পেমেন্ট অনুমোদন বা রিফান্ড সরাসরি গ্রাহকের পাস সক্রিয় অথবা বাতিল করে।
              </span>
            </div>
          </div>

          {/* TRANSACTIONS CARDS */}
          {filteredTransactions.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <CreditCard className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                এই ফিল্টারে কোনো লেনদেন পাওয়া যায়নি
              </p>
              <p className="text-xs text-slate-400 mt-1">
                অন্য কোনো মাস বা সার্চ কোয়েরি পরিবর্তন করে দেখুন
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => {
                const isApproved = tx.status === 'paid' || (tx.status as any) === 'approved';
                const isPending = tx.status === 'pending';
                const isRejected = tx.status === 'rejected';
                const isRefundReq = tx.status === 'refund_requested';
                const isRefunded = tx.status === 'refunded';

                const waPhone = (tx.userWhatsapp || tx.userPhone || '').replace(/[^0-9]/g, '');
                const waLink = waPhone
                  ? `https://wa.me/${waPhone.length === 10 ? `91${waPhone}` : waPhone}?text=${encodeURIComponent(
                      `নমস্কার ${tx.userName}, গপ্পো কাহিনীতে আপনার ${tx.amount} টাকার সাবস্ক্রিপশন লেনদেনের (UTR: ${tx.utrTransactionId}) বিষয়ে যোগাযোগ করছি।`
                    )}`
                  : null;

                return (
                  <div
                    key={tx.id}
                    className={`rounded-2xl border p-4 space-y-3.5 transition-all shadow-sm ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-indigo-300'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: User details & Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {tx.userName}
                          </span>
                          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            ({tx.userEmail})
                          </span>

                          {/* Status Badge */}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              অনুমোদিত (পাস সক্রিয়)
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              <Clock className="w-3 h-3" />
                              যাচাই বাকি (Pending)
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              <XCircle className="w-3 h-3" />
                              বাতিল করা হয়েছে
                            </span>
                          )}
                          {isRefundReq && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              <RotateCcw className="w-3 h-3" />
                              রিফান্ড অনুরোধ জমা পড়েছে
                            </span>
                          )}
                          {isRefunded && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                              <Check className="w-3 h-3" />
                              রিফান্ড সম্পন্ন
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                          <span className="font-mono">{tx.userPhone}</span>
                          <span>•</span>
                          <span>তারিখ: {tx.paymentDate} {tx.paymentTime}</span>
                        </div>
                      </div>

                      {/* Contact Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-sm"
                            title="WhatsApp মেসেজ পাঠান"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        <a
                          href={`tel:${tx.userPhone}`}
                          className={`p-1.5 rounded-xl border text-xs transition-colors ${
                            isLight
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                          title="কল করুন"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Middle Row: Plan, Amount, UTR, Screenshot */}
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl border text-xs ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      {/* Plan & Amount */}
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">প্ল্যান ও মূল্য</span>
                        <div className={`font-serif-story font-bold text-sm mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {tx.planName}
                        </div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold font-serif-story text-base mt-0.5">
                          ₹{tx.amount} {tx.currency}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          শুরু: {tx.subscriptionStartDate || tx.paymentDate} • শেষ: {tx.subscriptionExpiryDate || 'যাচাইয়ের পর নির্ধারিত'}
                        </div>
                      </div>

                      {/* UTR & Transaction Details */}
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">UTR / Transaction ID</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg border ${
                            isLight
                              ? 'bg-white text-amber-600 border-amber-300'
                              : 'bg-slate-900 text-amber-400 border-slate-800'
                          }`}>
                            {tx.utrTransactionId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyUtr(tx.utrTransactionId)}
                            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
                            title="UTR কপি করুন"
                          >
                            {copiedUtr === tx.utrTransactionId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          ব্যাংক অ্যাকাউন্টে এই UTR মিলিয়ে দেখুন
                        </span>
                      </div>

                      {/* Screenshot Preview */}
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">পেমেন্ট স্ক্রিনশট</span>
                        {tx.screenshotUrl ? (
                          <div className="mt-1 flex items-center gap-2">
                            <img
                              src={tx.screenshotUrl}
                              alt="Receipt Thumbnail"
                              onClick={() => setViewScreenshotUrl(tx.screenshotUrl || null)}
                              className="h-12 w-12 object-cover rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                            />
                            <div>
                              <button
                                type="button"
                                onClick={() => setViewScreenshotUrl(tx.screenshotUrl || null)}
                                className="flex items-center gap-1 text-[11px] text-indigo-500 hover:underline font-semibold cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>বড় করে দেখুন</span>
                              </button>
                              <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                                {tx.screenshotName || 'screenshot.jpg'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 text-slate-400 italic text-[11px]">
                            কোনো স্ক্রিনশট আপলোড করা হয়নি (শুধুমাত্র UTR প্রদান করা হয়েছে)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Refund or Rejection notes if any */}
                    {tx.rejectionReason && (
                      <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl text-xs text-rose-600 dark:text-rose-300">
                        <strong>বাতিলের কারণ:</strong> {tx.rejectionReason}
                      </div>
                    )}

                    {tx.refundReason && (
                      <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-xs text-amber-700 dark:text-amber-300 space-y-1">
                        <div><strong>গ্রাহকের রিফান্ডের কারণ:</strong> {tx.refundReason}</div>
                        {tx.refundUtr && (
                          <div className="font-mono text-[11px] text-indigo-500">
                            রিফান্ড UTR: {tx.refundUtr} • নোট: {tx.refundNote}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons based on status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {tx.approvedBy && <span>অনুমোদনকারী: {tx.approvedBy} ({tx.approvedDate})</span>}
                        {tx.rejectedBy && <span>বাতিলকারী: {tx.rejectedBy} ({tx.rejectedDate})</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* If Pending: Approve / Reject */}
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                onApprovePayment(tx.id);
                                showToast(`পেমেন্ট ${tx.utrTransactionId} অনুমোদিত ও পাস সক্রিয় করা হয়েছে!`);
                              }}
                              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                              <span>অনুমোদন করুন (Approve)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTxForReject(tx);
                                setRejectReason('');
                              }}
                              className="rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 px-3 py-1.5 text-xs transition-colors cursor-pointer"
                            >
                              বাতিল (Reject)
                            </button>
                          </>
                        )}

                        {/* If Refund Requested: Process Refund / Reject Refund */}
                        {isRefundReq && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTxForRefund(tx);
                                setRefundAmount(tx.amount);
                                setRefundUtr(`REF-${Date.now().toString().slice(-6)}`);
                                setRefundNote('Axis Bank / UPI মাধ্যমে ফেরত দেওয়া হয়েছে');
                              }}
                              className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>রিফান্ড প্রসেস ও সম্পন্ন করুন</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onRejectRefund(tx.id, 'গ্রাহকের রিফান্ড অনুরোধ যাচাইয়ের পর বাতিল করা হলো।');
                                showToast('রিফান্ড অনুরোধ বাতিল করা হয়েছে।');
                              }}
                              className={`rounded-xl px-3 py-1.5 text-xs cursor-pointer ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              রিফান্ড বাতিল
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 2: UPI & QR CODE CONFIGURATION */}
      {subTab === 'upi_settings' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <form onSubmit={handleSaveUpiSettings} className={`rounded-2xl border p-5 sm:p-6 space-y-4 shadow-md ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-amber-500" />
                <h4 className="font-serif-story text-base font-bold">
                  সরাসরি UPI ও ব্যাংক অ্যাকাউন্ট সেটিংস
                </h4>
              </div>
              {settingsSaveSuccess && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                  <Check className="h-4 w-4" /> সংরক্ষিত হয়েছে!
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-slate-500 dark:text-slate-400">
                  অফিসিয়াল UPI ID * (উদা: jdpro@axisbank)
                </label>
                <input
                  type="text"
                  required
                  value={editUpiId}
                  onChange={(e) => setEditUpiId(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2.5 font-mono focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-500 dark:text-slate-400">
                  প্রাপকের নাম (Payee Name) *
                </label>
                <input
                  type="text"
                  required
                  value={editPayeeName}
                  onChange={(e) => setEditPayeeName(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2.5 focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-slate-500 dark:text-slate-400">
                    ব্যাংকের নাম
                  </label>
                  <input
                    type="text"
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2.5 focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                        : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-slate-500 dark:text-slate-400">
                    IFSC কোড
                  </label>
                  <input
                    type="text"
                    value={editIfscCode}
                    onChange={(e) => setEditIfscCode(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2.5 font-mono focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                        : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-500 dark:text-slate-400">
                  অ্যাকাউন্ট নম্বর
                </label>
                <input
                  type="text"
                  value={editAccountNumber}
                  onChange={(e) => setEditAccountNumber(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2.5 font-mono focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-500 dark:text-slate-400">
                  গ্রাহকদের জন্য বিশেষ নির্দেশিকা (Payment Instructions)
                </label>
                <textarea
                  rows={3}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  placeholder="পেমেন্টের পর ১২ ডিজিটের UTR নম্বর এবং স্ক্রিনশট সাবমিট করতে বলুন..."
                  className={`w-full rounded-xl border px-3 py-2.5 focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 text-xs shadow-md transition-all cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>UPI সেটিংস সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: ACTIVITY LOG */}
      {subTab === 'activity_log' && (
        <div className={`rounded-2xl border p-5 space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="font-serif-story text-base font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-amber-500" />
              <span>অ্যাডমিন পেমেন্ট অ্যাক্টিভিটি লগ</span>
            </h4>
            <span className="text-xs text-slate-400">সর্বশেষ {activityLogs.length}টি অ্যাকশন</span>
          </div>

          <div className="space-y-2">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">এখনো কোনো অ্যাক্টিভিটি নেই।</p>
            ) : (
              activityLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start justify-between p-3 rounded-xl border text-xs ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-500">{log.action}</span>
                    <p className={isLight ? 'text-slate-700' : 'text-slate-300'}>{log.details}</p>
                    <span className="text-[10px] text-slate-400 block">দ্বারা: {log.performedBy}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {log.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: SCREENSHOT PREVIEW */}
      {viewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className={`relative max-w-lg w-full rounded-2xl border p-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
          }`}>
            <button
              onClick={() => setViewScreenshotUrl(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-200 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <h4 className={`text-sm font-bold mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              পেমেন্ট স্ক্রিনশট প্রিভিউ
            </h4>
            <div className="overflow-hidden rounded-xl bg-black max-h-[70vh] flex items-center justify-center">
              <img
                src={viewScreenshotUrl}
                alt="Payment Receipt Large"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REJECT PAYMENT DIALOG */}
      {selectedTxForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className={`relative max-w-md w-full rounded-2xl border p-5 shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 text-rose-500 font-bold text-sm">
              <span className="flex items-center gap-1.5">
                <Ban className="h-4 w-4" />
                পেমেন্ট বাতিল নিশ্চিত করুন
              </span>
              <button onClick={() => setSelectedTxForReject(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              গ্রাহক <strong>{selectedTxForReject.userName}</strong>-এর <strong>₹{selectedTxForReject.amount}</strong> টাকার পেমেন্ট (UTR: {selectedTxForReject.utrTransactionId}) বাতিল করার কারণ উল্লেখ করুন:
            </p>

            <div>
              <textarea
                rows={3}
                required
                placeholder="যেমন: ব্যাংক অ্যাকাউন্টে UTR রেকর্ড পাওয়া যায়নি বা ভুল স্ক্রিনশট..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className={`w-full rounded-xl border p-2.5 text-xs focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500'
                    : 'bg-slate-950 border-slate-800 text-white focus:border-rose-500'
                }`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTxForReject(null)}
                className={`rounded-xl px-3 py-1.5 text-xs cursor-pointer ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                }`}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white px-4 py-1.5 text-xs shadow-md cursor-pointer"
              >
                হ্যাঁ, বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REFUND COMPLETE DIALOG */}
      {selectedTxForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className={`relative max-w-md w-full rounded-2xl border p-5 shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 text-amber-500 font-bold text-sm">
              <span className="flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4" />
                ম্যানুয়াল ব্যাংক রিফান্ড সম্পন্ন করুন
              </span>
              <button onClick={() => setSelectedTxForRefund(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              গ্রাহকের ব্যাংক অ্যাকাউন্টে বা UPI-এ টাকা ফেরত পাঠানোর পর প্রাপ্ত রিফান্ড রেফারেন্স নম্বর নিচে প্রদান করে &quot;Refunded&quot; হিসেবে মার্ক করুন।
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-slate-500 dark:text-slate-400">রিফান্ড পরিমাণ (₹) *</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className={`w-full rounded-xl border px-3 py-2 font-mono focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-500 dark:text-slate-400">রিফান্ড UTR / ব্যাংক রেফারেন্স নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="উদা: REF-BANK-8902143"
                  value={refundUtr}
                  onChange={(e) => setRefundUtr(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 font-mono focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-500 dark:text-slate-400">রিফান্ড নোট / বিবরণ</label>
                <input
                  type="text"
                  placeholder="উদা: Axis Bank থেকে সরাসরি UPI রিভার্সাল সম্পন্ন"
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTxForRefund(null)}
                className={`rounded-xl px-3 py-1.5 text-xs cursor-pointer ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                }`}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmRefundComplete}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 px-4 py-1.5 text-xs shadow-md cursor-pointer"
              >
                রিফান্ড সম্পন্ন মার্ক করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
