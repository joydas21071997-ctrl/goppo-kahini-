import {
  Story,
  StoryGenre,
  StoryPricingTier,
  StoryLengthCategory,
  SubscriberLead,
  NarratorApplication,
  CreatorSession,
  LifeStoryEpisode,
  LifeStorySubmission,
  UserContactMessage,
  PaymentTransaction,
  AdminActivityLog,
  UpiConfig,
  AboutMissionData,
  TeamMember,
  AudienceUser
} from '../types';

export type AdminTab =
  | 'overview'
  | 'stories'
  | 'podcasts'
  | 'payments'
  | 'crm'
  | 'narrators'
  | 'permissions'
  | 'lifestories'
  | 'inbox'
  | 'settings'
  | 'about_mission';

export interface AdminPortalProps {
  // Navigation & session
  creatorSession: CreatorSession | null;
  currentUser?: AudienceUser | null;
  onLogout: () => void;
  onClose?: () => void;
  isStandalone?: boolean;

  // Stories
  stories?: Story[];
  onAddStory: (newStory: Story) => void;
  onDeleteStory?: (storyId: string) => void;

  // Life Story Podcast Episodes
  lifeStoryEpisodes?: LifeStoryEpisode[];
  onAddLifeStoryEpisode?: (newEpisode: LifeStoryEpisode) => void;

  // Subscribers CRM
  subscribers: SubscriberLead[];
  onUpdateSubscriberStatus: (subscriberId: string, status: 'verified' | 'pending_verification' | 'rejected') => void;
  onDeleteSubscriber: (subscriberId: string) => void;
  onAddSubscriber?: (subscriber: SubscriberLead) => void;

  // Narrators
  narratorApplications: NarratorApplication[];
  onApproveNarrator: (appId: string, approvalCode: string) => void;
  onRejectNarrator: (appId: string) => void;
  onDeleteNarratorApp: (appId: string) => void;

  // User Submissions (মানুষের জীবন কথা)
  lifeStorySubmissions: LifeStorySubmission[];
  onUpdateLifeStoryStatus: (submissionId: string, status: 'new' | 'contacted' | 'recorded' | 'archived') => void;
  onDeleteLifeStorySubmission: (submissionId: string) => void;

  // Payments & Subscriptions
  paymentTransactions: PaymentTransaction[];
  onApprovePayment: (transactionId: string) => void;
  onRejectPayment: (transactionId: string, reason: string) => void;
  onApproveRefund: (transactionId: string) => void;
  onRejectRefund: (transactionId: string, reason: string) => void;
  onCompleteRefund: (transactionId: string, refundUtr: string, refundAmount: number, refundNote: string) => void;
  upiConfig: UpiConfig;
  onUpdateUpiConfig: (newConfig: UpiConfig) => void;
  adminActivityLogs: AdminActivityLog[];
}
