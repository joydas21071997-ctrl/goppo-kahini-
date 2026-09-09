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
  ExternalLink
} from 'lucide-react';
import { SubscriberLead } from '../../types';
import { getGoppoFirestore } from '../../services/firestoreUser';
import { collection, getDocs } from 'firebase/firestore';

interface AdminSubscriberCRMProps {
  subscribers?: SubscriberLead[];
  onUpdateStatus?: (subscriberId: string, status: 'verified' | 'pending_verification' | 'rejected') => void;
  onDeleteSubscriber?: (subscriberId: string) => void;
  onAddSubscriber?: (subscriber: SubscriberLead) => void;
}

export const AdminSubscriberCRM: React.FC<AdminSubscriberCRMProps> = ({
  subscribers = [],
  onUpdateStatus,
  onDeleteSubscriber,
  onAddSubscriber,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

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
        date: String(lead.date || lead.registeredAt || new Date().toISOString().split('T')[0]).trim(),
        optInMarketing: lead.optInMarketing ?? true,
        notes: lead.notes || '',
      };
    });
  }, [subscribers]);

  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return safeLeads.filter((lead) => {
      const matchQuery =
        !q ||
        (lead.name && lead.name.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.includes(q)) ||
        (lead.whatsapp && lead.whatsapp.includes(q)) ||
        (lead.transactionId && lead.transactionId.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'verified' && lead.verificationStatus === 'verified') ||
        (statusFilter === 'pending' && lead.verificationStatus === 'pending_verification') ||
        (statusFilter === 'rejected' && lead.verificationStatus === 'rejected');

      return matchQuery && matchStatus;
    });
  }, [safeLeads, searchQuery, statusFilter]);

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
      link.setAttribute('download', `goppo_kahini_subscribers_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {}
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
              date: u.createdAt || new Date().toISOString().split('T')[0],
              optInMarketing: true,
            };
            if (onAddSubscriber) {
              onAddSubscriber(newLead);
            }
            importedCount++;
          }
        }
      });

      setSyncNotice(`ক্লাউড ফায়ারস্টোর থেকে ${importedCount} জন নতুন গ্রাহক সিঙ্ক করা হয়েছে!`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setSyncNotice(`সিঙ্ক ত্রুটি: ${errMsg}`);
    } finally {
      setIsSyncingFirestore(false);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() && !newPhone.trim()) return;

    const newSubscriber: SubscriberLead = {
      id: `manual-sub-${Date.now()}`,
      name: newName.trim() || 'গ্রাহক',
      email: newEmail.trim() || '',
      phone: newPhone.trim(),
      whatsapp: newPhone.trim(),
      country: 'India',
      tier: newPlan,
      amount: Number(newAmount) || 20,
      currency: 'INR',
      method: newMethod,
      transactionId: newUtr.trim() || `MANUAL-${Date.now()}`,
      verificationStatus: 'verified',
      date: new Date().toISOString().split('T')[0],
      optInMarketing: true,
    };

    if (onAddSubscriber) {
      onAddSubscriber(newSubscriber);
    }

    // Reset
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewUtr('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-400" />
              <span>সাবস্ক্রাইবার লিড ও কাস্টমার রিলেশনশিপ (CRM)</span>
            </h2>
          </div>
          <p className="text-xs text-purple-300/80 mt-0.5">
            সব পেইড গ্রাহকের WhatsApp যোগাযোগ, ফোন নম্বর ও অ্যাক্টিভেশন ডিরেক্টরি
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleSyncFirestoreSubscribers}
            disabled={isSyncingFirestore}
            className="px-3.5 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="ক্লাউড ফায়ারস্টোর থেকে গ্রাহক তালিকা সিঙ্ক করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFirestore ? 'animate-spin text-pink-400' : ''}`} />
            <span>{isSyncingFirestore ? 'সিঙ্ক হচ্ছে...' : 'ক্লাউড সিঙ্ক'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-pink-600/30 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>নতুন গ্রাহক যুক্ত করুন</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Sync Notice Alert */}
      {syncNotice && (
        <div className="p-3.5 rounded-xl bg-purple-950/60 border border-pink-500/40 text-xs text-pink-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ফোন, ইমেইল বা ট্রানজ্যাকশন আইডি দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-pink-600 text-white shadow-sm shadow-pink-600/30' : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/40'
            }`}
          >
            সব ({safeLeads.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'verified' ? 'bg-emerald-600 text-white' : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/40'
            }`}
          >
            ভেরিফাইড ({safeLeads.filter((s) => s.verificationStatus === 'verified').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/40'
            }`}
          >
            পেন্ডিং ({safeLeads.filter((s) => s.verificationStatus === 'pending_verification').length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-purple-900/40">
        <table className="w-full text-left text-xs text-purple-200">
          <thead className="bg-[#140822] text-purple-300 font-semibold border-b border-purple-900/50">
            <tr>
              <th className="p-3">গ্রাহকের নাম ও ইমেইল</th>
              <th className="p-3">ফোন ও WhatsApp</th>
              <th className="p-3">প্ল্যান ও মূল্য</th>
              <th className="p-3">পদ্ধতি ও ট্রানজ্যাকশন</th>
              <th className="p-3">স্ট্যাটাস</th>
              <th className="p-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-900/30">
            {filteredLeads.map((lead) => {
              const rawWa = lead.whatsapp || lead.phone || '';
              const cleanWa = rawWa.replace(/[^0-9]/g, '');
              const waUrl = cleanWa
                ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(`নমস্কার ${lead.name || 'শ্রোতা'}, গপ্পো কাহিনী এন্টারটেইনমেন্টে আপনার অডিও সাবস্ক্রিপশন সফলভাবে সক্রিয় করা হয়েছে। ধন্যবাদ!`)}`
                : null;

              return (
                <tr key={lead.id} className="hover:bg-purple-950/40 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-white">{lead.name || 'বেনামী গ্রাহক'}</div>
                    {lead.email ? (
                      <div className="text-[11px] text-purple-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[150px]">{lead.email}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-purple-500 italic mt-0.5">ইমেইল যুক্ত নেই</div>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="text-white font-mono">{lead.phone || 'ফোন নেই'}</div>
                    {waUrl ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline mt-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp চ্যাট</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-purple-500">-</span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="font-medium text-white">{lead.tier || '২০ টাকার পাস'}</div>
                    <div className="text-[11px] text-pink-300 font-semibold">
                      {lead.currency} {lead.amount}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="text-purple-300">{lead.method || 'UPI'}</div>
                    <div
                      className="text-[10px] font-mono text-purple-400 mt-0.5 truncate max-w-[130px] flex items-center gap-1"
                      title={lead.transactionId}
                    >
                      <span>{lead.transactionId || 'N/A'}</span>
                      {lead.transactionId && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(lead.transactionId!, lead.id)}
                          className="hover:text-pink-300"
                        >
                          {copiedText === lead.id ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="p-3">
                    {lead.verificationStatus === 'verified' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> সক্রিয়
                      </span>
                    ) : lead.verificationStatus === 'rejected' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30 inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> বাতিল
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> যাচাই বাকি
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {lead.verificationStatus !== 'verified' && onUpdateStatus && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(lead.id, 'verified')}
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors cursor-pointer"
                          title="ভেরিফাই অনুমোদন করুন"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteSubscriber && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`আপনি কি ${lead.name} এর রেকর্ড ডিলিট করতে চান?`)) {
                              onDeleteSubscriber(lead.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-purple-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="ডিলিট করুন"
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
                <td colSpan={6} className="p-8 text-center text-xs text-purple-400">
                  কোনো গ্রাহক পাওয়া যায়নি
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Add Subscriber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1b0d2d] border border-purple-800/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-pink-400" />
                <span>নতুন গ্রাহক ম্যানুয়ালি যুক্ত করুন</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-purple-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1">গ্রাহকের নাম *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="যেমন: অনির্বাণ সরকার"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-800/50 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-purple-200 mb-1">ফোন / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-800/50 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-purple-200 mb-1">ইমেইল</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-800/50 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-purple-200 mb-1">প্ল্যান</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-800/50 text-xs text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="গপ্পো কাহিনী ২০ টাকার মাসিক পাস">২০ টাকার মাসিক পাস</option>
                    <option value="একক গল্প টিকিট">একক গল্প টিকিট</option>
                    <option value="মেগা এক্সক্লুসিভ পাস">মেগা এক্সক্লুসিভ পাস</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-purple-200 mb-1">টাকার পরিমাণ (INR)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-800/50 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1">UTR / পেমেন্ট রেফারেন্স</label>
                <input
                  type="text"
                  value={newUtr}
                  onChange={(e) => setNewUtr(e.target.value)}
                  placeholder="যেমন: UTR592019482103"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-800/50 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-purple-800/40">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-purple-300 hover:text-white bg-purple-900/30 hover:bg-purple-900/50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-pink-600 hover:bg-pink-500 shadow-md shadow-pink-600/30 cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
