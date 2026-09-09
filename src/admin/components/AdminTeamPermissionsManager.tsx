import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Lock,
  Crown,
  CheckCircle2,
  AlertCircle,
  Users,
  Shield,
  KeyRound,
  Mail,
  UserCheck
} from 'lucide-react';
import { AuthorizedAdminUser } from '../../types';
import {
  getDelegatedAdmins,
  addDelegatedAdmin,
  removeDelegatedAdmin,
  isPrimarySuperAdminEmail
} from '../../services/adminAuth';

export const AdminTeamPermissionsManager: React.FC = () => {
  const [admins, setAdmins] = useState<AuthorizedAdminUser[]>(getDelegatedAdmins());
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'super_admin' | 'editor'>('editor');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setAdmins(getDelegatedAdmins());
    };
    window.addEventListener('goppo_admins_updated', handleUpdate);
    return () => window.removeEventListener('goppo_admins_updated', handleUpdate);
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'joyfulfilms21@gmail.com') {
      setFeedback({ type: 'error', message: 'এই ইমেইলটি অ্যাডমিন হিসেবে অনুমোদিত নয় (অধিকার প্রত্যাহারকৃত)।' });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const result = await addDelegatedAdmin({
        email: email.trim(),
        name: name.trim(),
        role,
      });

      if (result.success) {
        setFeedback({ type: 'success', message: result.message });
        setEmail('');
        setName('');
        setAdmins(getDelegatedAdmins());
      } else {
        setFeedback({ type: 'error', message: result.message });
      }
    } catch {
      setFeedback({ type: 'error', message: 'অ্যাডমিন যোগ করতে সমস্যা হয়েছে' });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleRemove = async (targetEmail: string) => {
    if (isPrimarySuperAdminEmail(targetEmail)) {
      alert('প্রধান প্রতিষ্ঠাতা জয়-এর অ্যাকাউন্ট সরানো সম্ভব নয়।');
      return;
    }

    if (!confirm(`আপনি কি সত্যিই ${targetEmail}-এর অ্যাডমিন এক্সেস প্রত্যাহার করতে চান?`)) {
      return;
    }

    const res = await removeDelegatedAdmin(targetEmail);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setAdmins(getDelegatedAdmins());
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-pink-950/30 to-[#120824] rounded-2xl border border-pink-500/30 p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>অ্যাডমিন ও রোল পারমিশন ব্যবস্থাপনা</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Role-Based Access Control (RBAC)
                </span>
              </h2>
              <p className="text-xs text-purple-300 mt-1">
                শুধুমাত্র আপনি এবং আপনার অনুমোদিত নির্দিষ্ট ইমেইলগুলোই এই অ্যাডমিন প্যানেলে লগইন ও ব্যবহারের অনুমতি পাবে।
              </p>
            </div>
          </div>
        </div>

        {feedback && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Add New Admin Form */}
      <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-purple-900/40 pb-3">
          <UserPlus className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-bold text-white">নতুন অ্যাডমিন বা এডিটর যোগ করুন</h3>
        </div>

        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                অ্যাডমিন ইমেইল এড্রেস *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-purple-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collaborator@gmail.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                নাম বা পদবী
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: অনিন্দিতা সেন (সহকারী প্রযোজক)"
                className="w-full px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                অনুমোদনের স্তর (Role)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
              >
                <option value="editor">এডিটর (গল্প ও পডকাস্ট আপলোড/পরিচালনা)</option>
                <option value="super_admin">কো-সুপার অ্যাডমিন (পূর্ণ এক্সেস ও পেমেন্ট)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-pink-600/30 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'অনুমতি প্রদান করুন'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Current Authorized Admins Table */}
      <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-300" />
            <h3 className="text-sm font-bold text-white">অনুমোদিত অ্যাডমিনদের তালিকা ({admins.length})</h3>
          </div>
          <span className="text-[11px] text-purple-400">
            ক্লাউড ফায়ারবেস ও লোকাল মেমরিতে সুরক্ষিত
          </span>
        </div>

        <div className="space-y-3">
          {admins.map((adm) => {
            const isPrimary = isPrimarySuperAdminEmail(adm.email);
            return (
              <div
                key={adm.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isPrimary
                    ? 'bg-purple-950/40 border-pink-500/40 shadow-sm shadow-pink-900/10'
                    : 'bg-purple-950/20 border-purple-800/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isPrimary
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-purple-800/30 text-purple-300'
                    }`}
                  >
                    {isPrimary ? <Crown className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{adm.name || adm.email}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          adm.role === 'super_admin'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {adm.role === 'super_admin' ? 'সুপার অ্যাডমিন' : 'এডিটর'}
                      </span>
                      {isPrimary && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          প্রতিষ্ঠাতা
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-purple-300 mt-0.5">{adm.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-[11px] text-purple-400">
                    যুক্ত: {adm.addedAt || '২০২৬'}
                  </span>

                  {!isPrimary ? (
                    <button
                      type="button"
                      onClick={() => handleRemove(adm.email)}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white text-xs flex items-center gap-1 border border-rose-900/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>বাতিল করুন</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> স্থায়ী এক্সেস
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
