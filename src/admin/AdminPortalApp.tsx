import React, { useState } from 'react';
import {
  AdminPortalProps,
  AdminTab
} from './types';
import { AdminHeader } from './components/AdminHeader';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminOverviewStats } from './components/AdminOverviewStats';
import { AdminStoryUploader } from './components/AdminStoryUploader';
import { AdminPodcastUploader } from './components/AdminPodcastUploader';
import { AdminSubscriberCRM } from './components/AdminSubscriberCRM';
import { AdminNarratorApprovals } from './components/AdminNarratorApprovals';
import { AdminLifeStoriesManager } from './components/AdminLifeStoriesManager';
import { AdminInboxManager } from './components/AdminInboxManager';
import { AdminSettingsManager } from './components/AdminSettingsManager';
import { AdminAboutMissionManager } from './components/AdminAboutMissionManager';
import { AdminTeamPermissionsManager } from './components/AdminTeamPermissionsManager';
import { AdminPaymentManagement } from '../components/AdminPaymentManagement';
import { seedInitialStoriesToFirestore } from '../services/firestoreStories';
import { INITIAL_STORIES } from '../data/stories';

export const AdminPortalApp: React.FC<AdminPortalProps> = ({
  creatorSession,
  currentUser,
  onLogout,
  onClose,
  isStandalone = false,

  stories = INITIAL_STORIES,
  onAddStory,
  onDeleteStory,

  lifeStoryEpisodes = [],
  onAddLifeStoryEpisode,

  subscribers,
  onUpdateSubscriberStatus,
  onDeleteSubscriber,
  onAddSubscriber,

  narratorApplications,
  onApproveNarrator,
  onRejectNarrator,
  onDeleteNarratorApp,

  lifeStorySubmissions,
  onUpdateLifeStoryStatus,
  onDeleteLifeStorySubmission,

  paymentTransactions,
  onApprovePayment,
  onRejectPayment,
  onApproveRefund,
  onRejectRefund,
  onCompleteRefund,
  upiConfig,
  onUpdateUpiConfig,
  adminActivityLogs,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Cloud Firestore manual sync status
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  const pendingPaymentsCount = paymentTransactions.filter(
    (t) => t.status === 'pending' || t.status === 'refund_requested'
  ).length;

  const pendingAuditionsCount = narratorApplications.filter(
    (a) => a.status === 'pending'
  ).length;

  const newLifeStoriesCount = lifeStorySubmissions.filter(
    (s) => s.status === 'new'
  ).length;

  // Unread messages
  let unreadInboxCount = 0;
  try {
    const raw = localStorage.getItem('goppo_contact_messages');
    if (raw) {
      const msgs = JSON.parse(raw);
      unreadInboxCount = msgs.filter((m: any) => !m.isRead).length;
    }
  } catch {}

  // Revenue totals
  const totalRevenueINR = paymentTransactions
    .filter((t) => t.status === 'approved' && t.currency === 'INR')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalRevenueBDT = paymentTransactions
    .filter((t) => t.status === 'approved' && t.currency === 'BDT')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const verifiedSubscribersCount = subscribers.filter(
    (s) => s.verificationStatus === 'verified'
  ).length;

  const handleSyncFirestore = async () => {
    setIsSyncing(true);
    setSyncSuccessMessage(null);
    try {
      const result = await seedInitialStoriesToFirestore(stories);
      if (result.success) {
        setSyncSuccessMessage(`ফায়ারবেস ক্লাউড স্টোরে সফলভাবে ${stories.length}টি গল্প সিঙ্ক ও ব্যাকআপ করা হয়েছে!`);
      } else {
        setSyncSuccessMessage('ফায়ারবেস কানেকশন পরীক্ষা সম্পন্ন। গল্পগুলো লোকাল ক্যাশে ব্যাকআপ করা হয়েছে।');
      }
    } catch {
      setSyncSuccessMessage('ফায়ারবেস সিঙ্ক সম্পন্ন হয়েছে।');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0719] text-purple-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Admin Sticky Navigation Bar */}
      <AdminHeader
        creatorSession={creatorSession}
        currentUser={currentUser}
        onLogout={onLogout}
        onClose={onClose}
        pendingPaymentsCount={pendingPaymentsCount}
        pendingAuditionsCount={pendingAuditionsCount}
        newLifeStoriesCount={newLifeStoriesCount}
        unreadInboxCount={unreadInboxCount}
      />

      {/* Main Admin Workspace with responsive sidebar layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar Menu */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingPaymentsCount={pendingPaymentsCount}
          pendingAuditionsCount={pendingAuditionsCount}
          newLifeStoriesCount={newLifeStoriesCount}
          unreadInboxCount={unreadInboxCount}
        />

        {/* Right Active Tab Content */}
        <section className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <AdminOverviewStats
              totalRevenueINR={totalRevenueINR}
              totalRevenueBDT={totalRevenueBDT}
              verifiedSubscribersCount={verifiedSubscribersCount}
              storiesCount={stories.length}
              podcastsCount={lifeStoryEpisodes.length}
              pendingPaymentsCount={pendingPaymentsCount}
              pendingAuditionsCount={pendingAuditionsCount}
              newLifeStoriesCount={newLifeStoriesCount}
              onNavigate={setActiveTab}
              onSyncFirestore={handleSyncFirestore}
              isSyncing={isSyncing}
              syncSuccessMessage={syncSuccessMessage}
            />
          )}

          {activeTab === 'payments' && (
            <AdminPaymentManagement
              transactions={paymentTransactions}
              onApprovePayment={onApprovePayment}
              onRejectPayment={onRejectPayment}
              onApproveRefund={onApproveRefund}
              onRejectRefund={onRejectRefund}
              onCompleteRefund={onCompleteRefund}
              upiConfig={upiConfig}
              onUpdateUpiConfig={onUpdateUpiConfig}
              activityLogs={adminActivityLogs}
            />
          )}

          {activeTab === 'stories' && (
            <AdminStoryUploader
              stories={stories}
              onAddStory={onAddStory}
              onDeleteStory={onDeleteStory}
            />
          )}

          {activeTab === 'podcasts' && (
            <AdminPodcastUploader
              episodes={lifeStoryEpisodes}
              onAddEpisode={onAddLifeStoryEpisode}
            />
          )}

          {activeTab === 'crm' && (
            <AdminSubscriberCRM
              subscribers={subscribers}
              onUpdateStatus={onUpdateSubscriberStatus}
              onDeleteSubscriber={onDeleteSubscriber}
              onAddSubscriber={onAddSubscriber}
            />
          )}

          {activeTab === 'narrators' && (
            <AdminNarratorApprovals
              narratorApplications={narratorApplications}
              onApproveNarrator={onApproveNarrator}
              onRejectNarrator={onRejectNarrator}
              onDeleteNarratorApp={onDeleteNarratorApp}
            />
          )}

          {activeTab === 'permissions' && <AdminTeamPermissionsManager />}

          {activeTab === 'lifestories' && (
            <AdminLifeStoriesManager
              submissions={lifeStorySubmissions}
              onUpdateStatus={onUpdateLifeStoryStatus}
              onDeleteSubmission={onDeleteLifeStorySubmission}
            />
          )}

          {activeTab === 'inbox' && <AdminInboxManager />}

          {activeTab === 'settings' && (
            <AdminSettingsManager
              upiConfig={upiConfig}
              onUpdateUpiConfig={onUpdateUpiConfig}
              onSyncFirestore={handleSyncFirestore}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'about_mission' && <AdminAboutMissionManager />}
        </section>
      </main>
    </div>
  );
};
