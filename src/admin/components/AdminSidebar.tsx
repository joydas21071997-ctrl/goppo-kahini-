import React from 'react';
import {
  LayoutDashboard,
  Music,
  Radio,
  CreditCard,
  Users,
  Mic,
  BookOpen,
  MessageSquare,
  Settings,
  ShieldCheck,
  Building,
  ChevronRight,
  Scale
} from 'lucide-react';
import { AdminTab } from '../types';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingPaymentsCount: number;
  pendingAuditionsCount: number;
  newLifeStoriesCount: number;
  unreadInboxCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingPaymentsCount,
  pendingAuditionsCount,
  newLifeStoriesCount,
  unreadInboxCount,
}) => {
  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: 'ড্যাশবোর্ড সারসংক্ষেপ',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'payments',
      label: 'পেমেন্ট ও রিফান্ড ম্যানেজমেন্ট',
      icon: <CreditCard className="w-4 h-4" />,
      badge: pendingPaymentsCount,
      badgeColor: 'bg-amber-500 text-amber-950 font-bold',
    },
    {
      id: 'stories',
      label: 'অডিও গল্প আপলোড ও তালিকা',
      icon: <Music className="w-4 h-4" />,
    },
    {
      id: 'podcasts',
      label: 'পডকাস্ট (জীবন কথা এপিসোড)',
      icon: <Radio className="w-4 h-4" />,
    },
    {
      id: 'crm',
      label: 'সাবস্ক্রাইবার লিড ও CRM',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'narrators',
      label: 'কথক অডিশন ও অনুমোদন',
      icon: <Mic className="w-4 h-4" />,
      badge: pendingAuditionsCount,
      badgeColor: 'bg-pink-500 text-white font-bold',
    },
    {
      id: 'permissions',
      label: 'অ্যাডমিন পারমিশন ও রোল',
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'lifestories',
      label: 'ইউজারদের বাস্তব জীবনের কাহিনি',
      icon: <BookOpen className="w-4 h-4" />,
      badge: newLifeStoriesCount,
      badgeColor: 'bg-indigo-500 text-white font-bold',
    },
    {
      id: 'inbox',
      label: 'শ্রোতাদের ইনবক্স ও বার্তা',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: unreadInboxCount,
      badgeColor: 'bg-emerald-500 text-white font-bold',
    },
    {
      id: 'about_mission',
      label: 'আমাদের লক্ষ্য ও টিম',
      icon: <Building className="w-4 h-4" />,
    },
    {
      id: 'legal_support',
      label: 'আইন, পলিসি ও সহায়তা',
      icon: <Scale className="w-4 h-4 text-purple-300" />,
    },
    {
      id: 'settings',
      label: 'UPI, সিস্টেম ও ক্লাউড কনফিগ',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-[#170c26]/90 rounded-2xl border border-purple-900/40 p-3 space-y-1.5 self-start">
      <div className="px-3 py-2 text-[11px] font-bold text-purple-400 uppercase tracking-wider">
        অ্যাডমিন নেভিগেশন
      </div>

      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-none">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-pink-600/90 to-purple-600/90 text-white shadow-md shadow-pink-600/20 font-semibold'
                  : 'text-purple-200/80 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? 'text-white' : 'text-purple-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${item.badgeColor || 'bg-purple-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 hidden lg:block opacity-70" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Super Admin Quick Note */}
      <div className="hidden lg:block mt-4 pt-3 border-t border-purple-900/40 px-3 text-[11px] text-purple-300/60 leading-relaxed">
        <p className="flex items-center gap-1 text-amber-400/90 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" /> সুপার অ্যাডমিন কন্ট্রোল
        </p>
        এখানে করা সব পরিবর্তন অবিলম্বে ফায়ারবেস ক্লাউড ও শ্রোতা অ্যাপে প্রতিফলিত হবে।
      </div>
    </aside>
  );
};
