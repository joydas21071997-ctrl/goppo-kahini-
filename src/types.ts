export type StoryGenre = 
  | 'All'
  | 'ভৌতিক ও অলৌকিক'
  | 'রহস্য ও গোয়েন্দা'
  | 'রোমাঞ্চ ও থ্রিলার'
  | 'প্রেম ও রোমান্স (রোমান্টিক গল্প)'
  | 'ঘুমের গল্প ও প্রশান্তি'
  | 'কাল্পনিক ও মায়াবী'
  | 'ঐতিহাসিক ও লোকগাথা'
  | 'বাস্তব ও রূপকথা';

export type StoryLengthCategory = 'all' | 'mini' | 'medium' | 'mega';

export type StoryPricingTier = 'free' | 'pass_included' | 'single_pay' | 'mega_exclusive';

export interface Chapter {
  id: string;
  title: string;
  timestamp: number; // in seconds
  duration: number; // in seconds
}

export interface TranscriptLine {
  id: string;
  time: number; // in seconds
  text: string;
  speaker?: string;
}

export interface Story {
  id: string;
  title: string;
  tagline: string;
  description: string;
  author: string;
  narrator: string;
  voiceStyle: 'warm' | 'whisper' | 'deep' | 'mysterious' | 'british';
  genre: StoryGenre;
  lengthCategory: 'mini' | 'medium' | 'mega'; // ছোট (<10m), মাঝারি (10-25m), বড়/মেগা (25m+)
  duration: number; // seconds
  isLittlePassOnly: boolean; // premium subscription required (₹20/mo)
  pricingType?: StoryPricingTier; // free, pass_included, single_pay (e.g. ₹5 or ₹10), mega_exclusive
  singlePurchasePrice?: number; // e.g. ₹5, ₹10, ₹15, ₹20
  audioUrl?: string; // Uploaded mp3 audio link / blob / data url
  audioFileName?: string;
  coverImage: string;
  colorGradient: string;
  releaseDate: string;
  rating: number;
  listenCount: number;
  chapters: Chapter[];
  transcript: TranscriptLine[];
  fullStoryText: string;
  createdAt?: number | string;
  storageAudioPath?: string;
  storageCoverPath?: string;
}

export interface UserContactMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  category: 'complaint' | 'feedback' | 'story_request' | 'payment_help' | 'general_feedback' | 'other';
  subject?: string;
  message: string;
  createdAt?: string;
  timestamp?: string;
  status: 'unread' | 'read' | 'replied';
}

export interface Bookmark {
  id: string;
  storyId: string;
  storyTitle: string;
  timestamp: number;
  chapterTitle: string;
  note: string;
  createdAt: string;
}

export interface ListeningHistoryItem {
  id: string;
  storyId: string;
  storyTitle: string;
  narrator: string;
  genre: string;
  coverImage: string;
  lastPlayedAt: string;
  duration: number;
}

export type PaymentStatus = 
  | 'pending'          // Pending / যাচাইয়ের অপেক্ষায়
  | 'paid'             // Paid / Approved / অনুমোদিত
  | 'rejected'         // Rejected / বাতিল
  | 'refund_requested' // Refund Requested / রিফান্ডের অনুরোধ
  | 'refunded'         // Refunded / ফেরত দেওয়া হয়েছে
  | 'cancelled';       // Cancelled / বাতিলকৃত

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userWhatsapp: string;
  planId: 'little_monthly' | 'little_annual' | 'single_story';
  planName: string;
  amount: number;
  currency: 'INR' | 'BDT' | 'USD';
  country?: 'India' | 'Bangladesh' | 'International';
  paymentMethod?: string;
  paymentDate: string; // YYYY-MM-DD
  paymentTime: string; // HH:mm AM/PM
  utrTransactionId: string; // 12-digit UPI UTR or Reference ID
  screenshotUrl?: string; // base64 or image URL
  screenshotName?: string;
  status: PaymentStatus;
  subscriptionStartDate?: string;
  subscriptionExpiryDate?: string;
  targetStoryId?: string;
  rejectionReason?: string;
  
  // Refund Fields
  refundReason?: string;
  refundRequestedDate?: string;
  refundAmount?: number;
  refundDate?: string;
  refundUtr?: string;
  refundNote?: string;
  
  // Cancellation Fields
  cancellationDate?: string;
  cancellationReason?: string;
  
  // Audit Trail
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
}

export interface AdminActivityLog {
  id: string;
  adminName: string;
  action: 
    | 'submit_payment'
    | 'approve_payment' 
    | 'reject_payment' 
    | 'request_refund'
    | 'approve_refund' 
    | 'approve_refund_request'
    | 'reject_refund' 
    | 'complete_refund' 
    | 'cancel_subscription' 
    | 'update_upi_settings';
  details: string;
  targetId: string;
  timestamp: string;
}

export interface UpiConfig {
  upiId: string;          // e.g. "joydas21071997@okaxis"
  payeeName: string;      // e.g. "Joy Das"
  qrImageUrl?: string;    // Custom QR image URL or base64
  bankName?: string;      // e.g. "Axis Bank"
  accountNumber?: string;
  ifscCode?: string;
  paymentInstructions?: string;

  // Automated Payment Gateway Settings (Direct Bank Settlement via API)
  gatewayMode?: 'manual_upi' | 'razorpay' | 'cashfree' | 'phonepe_pg';
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  cashfreeAppId?: string;
  cashfreeSecretKey?: string;
  isGatewayActive?: boolean;
}

export interface UserSubscription {
  status: 'free' | 'pending' | 'active' | 'cancelled' | 'expired';
  tier: 'free' | 'little_monthly' | 'little_annual' | 'single_story';
  planName: string;
  price: number;
  currency: 'INR' | 'BDT' | 'USD';
  period: 'month' | 'year' | 'single';
  startDate: string;
  nextBillingDate: string;
  subscriptionExpiryDate?: string;
  unlockedStoryIds?: string[]; // IDs of single mega stories unlocked
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  customerWhatsapp?: string;
  pendingTransactionId?: string;
  pendingUtr?: string;
  pendingPaymentDate?: string;
  cardLast4?: string;
  cardBrand?: string;
  autoRenew: boolean;
}

export interface SubscriberLead {
  id: string;
  name: string;
  email: string;
  phone: string; // Calling Phone Number
  whatsapp: string; // Real WhatsApp Number
  country: 'India' | 'Bangladesh' | 'International';
  tier: string;
  amount: number;
  currency: 'INR' | 'BDT' | 'USD';
  method: string;
  transactionId?: string; // UPI UTR or bKash TrxID or PayPal receipt
  paymentProofName?: string;
  verificationStatus: 'verified' | 'pending_verification' | 'rejected';
  date: string;
  optInMarketing: boolean;
  notes?: string;
}

export interface JoyPaymentConfig {
  upiId: string;
  upiName: string;
  upiQrImageUrl?: string;
  bkashNumber: string;
  bkashType: string;
  nagadNumber: string;
  paypalEmail: string;
  paymentNotice: string;
}

export interface LifeStoryEpisode {
  id: string;
  title: string;
  speakerName: string;
  speakerAge: number;
  speakerLocation: string;
  speakerProfession: string;
  duration: number; // in seconds
  releaseDate: string;
  summary: string;
  keyQuote: string;
  coverImage: string;
  audioUrl?: string;
  tags: string[];
  listenCount: number;
  featured?: boolean;
}

export interface LifeStorySubmission {
  id: string;
  fullName: string;
  age: string;
  profession: string;
  location: string;
  phone: string;
  whatsapp: string;
  email?: string;
  storyTitle: string;
  storySummary: string;
  preferredRecordingMode: 'in_person' | 'online_call' | 'phone_audio';
  submittedDate: string;
  status: 'new' | 'contacted' | 'recorded' | 'archived';
  notes?: string;
}

export interface AmbientTrack {
  id: string;
  name: string;
  iconName: string;
  volume: number; // 0 to 1
  isPlaying: boolean;
}

export type ThemeMode = 'calm-green' | 'midnight-dark';

export interface NarratorApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  preferredGenres: string[];
  sampleAudioNameOrUrl: string;
  sampleAudioUrl?: string; // audio playback url
  recordingEquipment: string; // e.g. Condenser Mic, Home Studio, Phone
  experienceBio: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvalCode?: string; // Secret code for narrator login if approved
  approvedDate?: string;
  approvedBy?: string;
}

export interface CreatorSession {
  isLoggedIn: boolean;
  role: 'super_admin' | 'approved_narrator';
  name: string;
  email: string;
  accessCode?: string;
}

export interface ItemReview {
  id: string;
  itemId: string; // story id or life story episode id
  itemTitle: string;
  itemType: 'story' | 'life_story';
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  likes: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string; // e.g. 'প্রতিষ্ঠাতা ও ক্রিয়েটিভ ডিরেক্টর', 'সহ-প্রতিষ্ঠাতা ও পার্টনার', 'অডিও ডিজাইনার'
  photoUrl?: string;
  bio: string;
  isFounder?: boolean;
  joinedDate?: string;
  contactEmail?: string;
}

export interface AudienceUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  provider: 'google' | 'password' | 'demo';
  createdAt: string;
  hasTwentyTakaPass?: boolean;
  role?: 'admin' | 'user';
}

export interface AuthorizedAdminUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: 'super_admin' | 'editor';
  addedAt: string;
}

export interface AboutMissionData {
  missionTitle: string;
  missionStatement: string;
  youtubeAudienceNote: string;
  keyCommitments: string[];
  teamMembers: TeamMember[];
}
