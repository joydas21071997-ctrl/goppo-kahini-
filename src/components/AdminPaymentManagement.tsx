import React, { useState } from 'react';
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
  Lock
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
}

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
}) => {
  // Sub-tabs: 'transactions' | 'upi_settings' | 'activity_log'
  const [subTab, setSubTab] = useState<'transactions' | 'upi_settings' | 'activity_log'>('transactions');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

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

  // 10 Key Metrics Calculations
  const totalPayments = transactions.length;
  const pendingPayments = transactions.filter((t) => t.status === 'pending').length;
  const approvedPayments = transactions.filter((t) => t.status === 'paid').length;
  const rejectedPayments = transactions.filter((t) => t.status === 'rejected').length;
  const refundRequests = transactions.filter((t) => t.status === 'refund_requested').length;
  const completedRefunds = transactions.filter((t) => t.status === 'refunded').length;
  const cancelledSubscriptions = transactions.filter((t) => t.status === 'cancelled').length;

  // Active vs Expired
  const nowStr = new Date().toISOString().split('T')[0];
  const activeSubscriptions = transactions.filter(
    (t) => t.status === 'paid' && (!t.subscriptionExpiryDate || t.subscriptionExpiryDate >= nowStr)
  ).length;
  const expiredSubscriptions = transactions.filter(
    (t) => t.status === 'paid' && t.subscriptionExpiryDate && t.subscriptionExpiryDate < nowStr
  ).length;

  // Total Revenue: sum of all 'paid' transactions minus refunded
  const totalRevenue = transactions
    .filter((t) => t.status === 'paid')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Filtered Transactions
  const filteredTransactions = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tx.userName.toLowerCase().includes(q) ||
      tx.userEmail.toLowerCase().includes(q) ||
      tx.userPhone.includes(q) ||
      tx.userWhatsapp.includes(q) ||
      tx.utrTransactionId.toLowerCase().includes(q) ||
      tx.userId.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesPlan = planFilter === 'all' || tx.planId === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

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
    setTimeout(() => setSettingsSaveSuccess(false), 3000);
  };

  const handleConfirmReject = () => {
    if (!selectedTxForReject) return;
    onRejectPayment(selectedTxForReject.id, rejectReason || 'ব্যাংক অ্যাকাউন্টে টাকা জমা হওয়ার তথ্য পাওয়া যায়নি।');
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
    setSelectedTxForRefund(null);
    setRefundUtr('');
    setRefundNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & SUB-NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-pink-400" />
            <h3 className="font-serif-story text-base sm:text-lg font-bold text-white">
              পেমেন্ট ও সাবস্ক্রিপশন ম্যানেজমেন্ট
            </h3>
            <span className="rounded-full bg-pink-500/20 border border-pink-500/30 px-2 py-0.5 text-[10px] font-bold text-pink-300">
              সরাসরি UPI
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            সব লেনদেন, ম্যানুয়াল UTR ভেরিফিকেশন, রিফান্ড প্রসেস ও UPI কনফিগারেশন
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-2xl border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setSubTab('transactions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              subTab === 'transactions'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              subTab === 'upi_settings'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>UPI ও QR সেটিংস</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('activity_log')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              subTab === 'activity_log'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>অ্যাক্টিভিটি লগ</span>
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD METRICS: 10 Key Metrics Required by User */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* 1. Total Revenue */}
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 to-black p-3 sm:p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>মোট আয় (Revenue)</span>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </div>
          <div className="font-serif-story text-xl sm:text-2xl font-black text-amber-400 mt-1">
            ₹{totalRevenue}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">সফল সাবস্ক্রিপশন</span>
        </div>

        {/* 2. Pending Payments */}
        <div className="rounded-2xl border border-amber-500/60 bg-amber-500/10 p-3 sm:p-3.5 relative overflow-hidden">
          {pendingPayments > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          )}
          <div className="flex items-center justify-between text-zinc-300 text-[11px]">
            <span>যাচাই বাকি (Pending)</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="font-serif-story text-xl sm:text-2xl font-black text-amber-300 mt-1">
            {pendingPayments}
          </div>
          <span className="text-[10px] text-amber-400/90 mt-0.5 block">অনুমোদন প্রয়োজন</span>
        </div>

        {/* 3. Approved Payments */}
        <div className="rounded-2xl border border-purple-500/40 bg-purple-950/20 p-3 sm:p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>অনুমোদিত (Approved)</span>
            <CheckCircle2 className="h-4 w-4 text-pink-400" />
          </div>
          <div className="font-serif-story text-xl sm:text-2xl font-black text-pink-400 mt-1">
            {approvedPayments}
          </div>
          <span className="text-[10px] text-pink-300/80 mt-0.5 block">পেমেন্ট সফল</span>
        </div>

        {/* 4. Active Subscriptions */}
        <div className="rounded-2xl border border-pink-500/40 bg-pink-950/20 p-3 sm:p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>সক্রিয় পাস (Active)</span>
            <UserCheck className="h-4 w-4 text-purple-300" />
          </div>
          <div className="font-serif-story text-xl sm:text-2xl font-black text-purple-300 mt-1">
            {activeSubscriptions}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">বর্তমানে বৈধ</span>
        </div>

        {/* 5. Refund Requests */}
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-3 sm:p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>রিফান্ড অনুরোধ</span>
            <RotateCcw className="h-4 w-4 text-rose-400" />
          </div>
          <div className="font-serif-story text-xl sm:text-2xl font-black text-rose-300 mt-1">
            {refundRequests}
          </div>
          <span className="text-[10px] text-rose-300/80 mt-0.5 block">বিবেচনাধীন</span>
        </div>

        {/* 6. Completed Refunds */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>রিফান্ড সম্পন্ন</span>
            <Check className="h-4 w-4 text-sky-400" />
          </div>
          <div className="font-serif-story text-xl font-bold text-white mt-1">
            {completedRefunds}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">টাকা ফেরত দেওয়া হয়েছে</span>
        </div>

        {/* 7. Rejected Payments */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>বাতিল পেমেন্ট</span>
            <XCircle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="font-serif-story text-xl font-bold text-rose-400 mt-1">
            {rejectedPayments}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">অপ্রমাণিত বা বাতিল</span>
        </div>

        {/* 8. Cancelled Subscriptions */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>বাতিলকৃত পাস</span>
            <Ban className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="font-serif-story text-xl font-bold text-zinc-300 mt-1">
            {cancelledSubscriptions}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">ব্যবহারকারী বাতিল করেছেন</span>
        </div>

        {/* 9. Expired Subscriptions */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>মেয়াদোত্তীর্ণ পাস</span>
            <Calendar className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="font-serif-story text-xl font-bold text-zinc-300 mt-1">
            {expiredSubscriptions}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">মেয়াদ শেষ হয়েছে</span>
        </div>

        {/* 10. Total Payments */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>মোট লেনদেন</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="font-serif-story text-xl font-bold text-white mt-1">
            {totalPayments}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">স্থায়ী রেকর্ড</span>
        </div>
      </div>

      {/* SUB-TAB 1: TRANSACTIONS LIST */}
      {subTab === 'transactions' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="sm:col-span-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="ব্যবহারকারীর নাম, ইমেইল, ফোন, বা UTR দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black py-2 pl-9 pr-8 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
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
                  className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
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
                  className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">সব প্ল্যান</option>
                  <option value="little_monthly">মাসিক পাস (₹২০)</option>
                  <option value="little_annual">বার্ষিক পাস (₹১৯৯)</option>
                  <option value="single_story">একক মেগা গল্প (₹১০)</option>
                </select>
              </div>
            </div>

            {/* Permanent Records Notice (Rule #10) */}
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1 border-t border-zinc-850">
              <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>
                অর্থনৈতিক অডিট নিয়ম: <strong>Financial Transaction Record Delete করা যাবে না।</strong> সমস্ত লেনদেন ও UTR ইতিহাস আজীবন সংরক্ষিত থাকবে।
              </span>
            </div>
          </div>

          {/* TRANSACTIONS TABLE / CARDS */}
          {filteredTransactions.length === 0 ? (
            <div className="rounded-2xl border border-zinc-850 bg-zinc-950 p-8 text-center text-zinc-500 text-xs">
              কোনো লেনদেন পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => {
                const isPending = tx.status === 'pending';
                const isApproved = tx.status === 'paid';
                const isRejected = tx.status === 'rejected';
                const isRefundReq = tx.status === 'refund_requested';
                const isRefundDone = tx.status === 'refunded';
                const isCancel = tx.status === 'cancelled';

                const cleanWa = tx.userWhatsapp?.replace(/\D/g, '') || tx.userPhone.replace(/\D/g, '');
                const waLink = cleanWa
                  ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(
                      `নমস্কার ${tx.userName}! গপ্পো কাহিনী পডকাস্টের পক্ষ থেকে জয় বলছি। আপনার পেমেন্ট (UTR: ${tx.utrTransactionId}) সংক্রান্ত তথ্য:`
                    )}`
                  : null;

                return (
                  <div
                    key={tx.id}
                    className={`rounded-2xl border p-4 space-y-3 transition-all ${
                      isPending
                        ? 'border-amber-500/50 bg-amber-950/15 shadow-md shadow-amber-950/20'
                        : isRefundReq
                        ? 'border-rose-500/50 bg-rose-950/15 shadow-md'
                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                    }`}
                  >
                    {/* Header Row: User Info + Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{tx.userName}</span>
                          <span className="text-xs font-mono text-zinc-400">({tx.userId})</span>
                          
                          {/* Status Badge */}
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              isPending
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : isApproved
                                ? 'bg-purple-500/20 text-pink-300 border border-purple-500/40'
                                : isRejected
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : isRefundReq
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                                : isRefundDone
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {isPending
                              ? '⏳ Pending / যাচাই বাকি'
                              : isApproved
                              ? '✓ Paid / অনুমোদিত'
                              : isRejected
                              ? '✕ Rejected / বাতিল'
                              : isRefundReq
                              ? '⚠️ Refund Requested'
                              : isRefundDone
                              ? '✓ Refunded / সম্পন্ন'
                              : 'Cancelled / বাতিলকৃত'}
                          </span>
                        </div>

                        {/* Contacts */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-zinc-400 mt-1">
                          <span className="font-mono text-zinc-300">{tx.userEmail}</span>
                          <span>•</span>
                          <span className="font-mono text-zinc-300">{tx.userPhone}</span>
                          <span>•</span>
                          <span className="text-zinc-500">তারিখ: {tx.paymentDate} {tx.paymentTime}</span>
                        </div>
                      </div>

                      {/* Contact Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white px-2.5 py-1 text-xs font-bold transition-all"
                            title="WhatsApp মেসেজ পাঠান"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        <a
                          href={`tel:${tx.userPhone}`}
                          className="p-1.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
                          title="কল করুন"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Middle Row: Plan, Amount, UTR, Screenshot */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-black/40 p-3 rounded-2xl border border-zinc-850 text-xs">
                      {/* Plan & Amount */}
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold">প্ল্যান ও মূল্য</span>
                        <div className="font-serif-story font-bold text-white text-sm mt-0.5">
                          {tx.planName}
                        </div>
                        <div className="text-pink-400 font-bold font-serif-story text-base mt-0.5">
                          ₹{tx.amount}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1">
                          শুরু: {tx.subscriptionStartDate || tx.paymentDate} • শেষ: {tx.subscriptionExpiryDate || 'যাচাইয়ের পর নির্ধারিত'}
                        </div>
                      </div>

                      {/* UTR & Transaction Details */}
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold">UTR / Transaction ID</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-sm font-bold text-amber-300 bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-800">
                            {tx.utrTransactionId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyUtr(tx.utrTransactionId)}
                            className="p-1 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg text-xs"
                            title="UTR কপি করুন"
                          >
                            {copiedUtr === tx.utrTransactionId ? <Check className="h-3.5 w-3.5 text-pink-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-1 block">
                          ব্যাংক অ্যাকাউন্টে এই UTR মিলিয়ে দেখুন
                        </span>
                      </div>

                      {/* Screenshot Preview */}
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold">পেমেন্ট স্ক্রিনশট</span>
                        {tx.screenshotUrl ? (
                          <div className="mt-1 flex items-center gap-2">
                            <img
                              src={tx.screenshotUrl}
                              alt="Receipt Thumbnail"
                              onClick={() => setViewScreenshotUrl(tx.screenshotUrl || null)}
                              className="h-12 w-12 object-cover rounded-lg border border-zinc-700 cursor-pointer hover:opacity-80 transition-opacity"
                            />
                            <div>
                              <button
                                type="button"
                                onClick={() => setViewScreenshotUrl(tx.screenshotUrl || null)}
                                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>বড় করে দেখুন</span>
                              </button>
                              <span className="text-[10px] text-zinc-400 block truncate max-w-[120px]">
                                {tx.screenshotName || 'screenshot.jpg'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 text-zinc-400 italic text-[11px]">
                            কোনো স্ক্রিনশট আপলোড করা হয়নি (শুধুমাত্র UTR প্রদান করা হয়েছে)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Refund or Rejection notes if any */}
                    {tx.rejectionReason && (
                      <div className="bg-rose-950/20 border border-rose-900/40 p-2.5 rounded-xl text-xs text-rose-300">
                        <strong>বাতিলের কারণ:</strong> {tx.rejectionReason}
                      </div>
                    )}

                    {tx.refundReason && (
                      <div className="bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-xl text-xs text-amber-300 space-y-1">
                        <div><strong>গ্রাহকের রিফান্ডের কারণ:</strong> {tx.refundReason}</div>
                        {tx.refundUtr && (
                          <div className="font-mono text-[11px] text-pink-400">
                            রিফান্ড UTR: {tx.refundUtr} • নোট: {tx.refundNote}
                          </div>
                        )}
                      </div>
                    )}

                    {tx.cancellationReason && (
                      <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-400">
                        <strong>বাতিলের বিবরণ:</strong> {tx.cancellationReason}
                      </div>
                    )}

                    {/* BOTTOM ACTION BUTTONS */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/80 text-xs">
                      <div className="text-[11px] text-zinc-400">
                        {tx.approvedBy && <span>অনুমোদনকারী: {tx.approvedBy} ({tx.approvedDate})</span>}
                        {tx.rejectedBy && <span>বাতিলকারী: {tx.rejectedBy} ({tx.rejectedDate})</span>}
                      </div>

                      {/* Action buttons based on status */}
                      <div className="flex items-center gap-2">
                        {/* If Pending: Approve / Reject */}
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => onApprovePayment(tx.id)}
                              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white px-3.5 py-1.5 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
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
                              className="rounded-xl bg-zinc-800 text-rose-400 hover:bg-zinc-700 px-3 py-1.5 text-xs transition-colors"
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
                              className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 font-bold text-xs flex items-center gap-1.5 transition-all"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>রিফান্ড প্রসেস ও সম্পন্ন করুন</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onRejectRefund(tx.id, 'গ্রাহকের রিফান্ড অনুরোধ যাচাইয়ের পর বাতিল করা হলো।')}
                              className="rounded-xl bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1.5 text-xs"
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
          <form onSubmit={handleSaveUpiSettings} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-amber-400" />
              <div>
                <h4 className="font-serif-story text-base font-bold text-white">
                  জয়-এর UPI অ্যাকাউন্ট ও পেমেন্ট কনফিগারেশন
                </h4>
                <p className="text-xs text-zinc-400">
                  এখানে পরিবর্তন করলে গ্রাহকদের পেমেন্ট পেইজে সঙ্গে সঙ্গে নতুন UPI ID ও ডাইনামিক QR কার্যকর হবে।
                </p>
              </div>
            </div>

            {settingsSaveSuccess && (
              <div className="rounded-xl border border-purple-500/40 bg-purple-950/40 p-3 text-xs text-pink-300 font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-pink-400" />
                <span>UPI ও পেমেন্ট কনফিগারেশন সফলভাবে আপডেট হয়েছে!</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                অফিসিয়াল UPI ID * (বর্তমানে: jdpro@axisbank)
              </label>
              <input
                type="text"
                required
                value={editUpiId}
                onChange={(e) => setEditUpiId(e.target.value)}
                className="w-full rounded-xl border border-zinc-750 bg-black px-3 py-2 text-xs text-amber-300 font-mono focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                এই UPI ID তে ব্যবহারকারীরা সরাসরি GPay, PhonePe, Paytm বা BHIM দিয়ে পেমেন্ট করবেন।
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                অ্যাকাউন্ট বা পেয়ি নাম (Payee Name)
              </label>
              <input
                type="text"
                value={editPayeeName}
                onChange={(e) => setEditPayeeName(e.target.value)}
                className="w-full rounded-xl border border-zinc-750 bg-black px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  ব্যাংক নাম (Bank Name)
                </label>
                <input
                  type="text"
                  value={editBankName}
                  onChange={(e) => setEditBankName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-750 bg-black px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  IFSC কোড
                </label>
                <input
                  type="text"
                  value={editIfscCode}
                  onChange={(e) => setEditIfscCode(e.target.value)}
                  className="w-full rounded-xl border border-zinc-750 bg-black px-3 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                পেমেন্ট পেজের নির্দেশিকা বার্তা (Payment Instructions)
              </label>
              <textarea
                rows={2}
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                className="w-full rounded-xl border border-zinc-750 bg-black p-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black px-5 py-2 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>সেটিংস সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: ADMIN ACTIVITY LOG */}
      {subTab === 'activity_log' && (
        <div className="space-y-3 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h4 className="font-serif-story text-sm font-bold text-white">
              অ্যাডমিন অ্যাক্টিভিটি ও অডিট লগ ({activityLogs.length})
            </h4>
            <span className="text-xs text-zinc-400">কে, কখন, কী অ্যাকশন করেছেন</span>
          </div>

          <div className="space-y-2">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-300 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-300">{log.adminName}</span>
                    <span className="rounded-full bg-zinc-800 px-2 py-0.2 text-[10px] text-zinc-400">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-zinc-300">{log.details}</p>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: SCREENSHOT VIEWER */}
      {viewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-4 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-400" />
                পেমেন্ট স্ক্রিনশট ভিউয়ার
              </h4>
              <button
                type="button"
                onClick={() => setViewScreenshotUrl(null)}
                className="p-1 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 max-h-[70vh] overflow-auto flex justify-center bg-black rounded-2xl p-2">
              <img
                src={viewScreenshotUrl}
                alt="Full Payment Screenshot"
                className="max-h-[65vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REJECT PAYMENT DIALOG */}
      {selectedTxForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full bg-zinc-950 border border-rose-900/60 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-rose-400 font-bold text-sm">
              <span>পেমেন্ট বাতিল (Reject) করুন</span>
              <button onClick={() => setSelectedTxForReject(null)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-300 space-y-1">
              <div>গ্রাহক: <strong>{selectedTxForReject.userName}</strong></div>
              <div>পরিমাণ: <strong>₹{selectedTxForReject.amount}</strong></div>
              <div>UTR: <span className="font-mono text-amber-300">{selectedTxForReject.utrTransactionId}</span></div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                বাতিলের কারণ লিখুন *
              </label>
              <textarea
                required
                rows={2}
                placeholder="উদা: ব্যাংক অ্যাকাউন্টে UTR রেকর্ড মেলেনি / ভুল অ্যামাউন্ট..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black p-2.5 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedTxForReject(null)}
                className="rounded-xl bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white px-4 py-1.5 text-xs shadow-md"
              >
                হ্যাঁ, বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REFUND COMPLETE DIALOG */}
      {selectedTxForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full bg-zinc-950 border border-amber-500/50 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-amber-300 font-bold text-sm">
              <span className="flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4" />
                ম্যানুয়াল ব্যাংক রিফান্ড সম্পন্ন করুন
              </span>
              <button onClick={() => setSelectedTxForRefund(null)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              আপনি গ্রাহকের ব্যাংক অ্যাকাউন্টে/UPI-এ টাকা ফেরত পাঠানোর পর প্রাপ্ত রিফান্ড রেফারেন্স নম্বর নিচে প্রবেশ করিয়ে &quot;Refunded&quot; হিসেবে মার্ক করুন।
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">রিফান্ড পরিমাণ (₹) *</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">রিফান্ড UTR / ব্যাংক রেফারেন্স নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="উদা: REF-BANK-8902143"
                  value={refundUtr}
                  onChange={(e) => setRefundUtr(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">রিফান্ড নোট / বিবরণ</label>
                <input
                  type="text"
                  placeholder="উদা: Axis Bank থেকে সরাসরি UPI রিভার্সাল সম্পন্ন"
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTxForRefund(null)}
                className="rounded-xl bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmRefundComplete}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 font-bold text-white px-4 py-1.5 text-xs shadow-md"
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
