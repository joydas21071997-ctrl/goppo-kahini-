export type LegalPolicySlug =
  | 'privacy-policy'
  | 'terms'
  | 'data-deletion'
  | 'grievance'
  | 'refund-policy'
  | 'subscription-terms'
  | 'community-guidelines'
  | 'copyright-policy'
  | 'disclaimer'
  | 'third-party-services'
  | 'app-permissions'
  | 'legal-info'
  | 'contact';

export interface LegalPolicySection {
  id: string;
  headingBn: string;
  headingEn: string;
  paragraphsBn: string[];
  bulletPointsBn?: string[];
}

export interface LegalPolicyDoc {
  slug: LegalPolicySlug;
  titleBn: string;
  titleEn: string;
  categoryBn: string;
  shortDescBn: string;
  shortDescEn: string;
  lastUpdatedBn: string;
  lastUpdatedEn: string;
  iconName: string;
  complianceBadgeBn: string;
  complianceBadgeEn: string;
  sections: LegalPolicySection[];
}

export const LEGAL_POLICIES_DATA: Record<LegalPolicySlug, LegalPolicyDoc> = {
  'privacy-policy': {
    slug: 'privacy-policy',
    titleBn: 'গোপনীয়তা নীতি',
    titleEn: 'Privacy Policy',
    categoryBn: 'ডেটা সুরক্ষা ও অধিকার',
    shortDescBn: 'ভারতের ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা আইন (DPDP Act, 2023) ও তথ্যপ্রযুক্তি আইন (IT Act, 2000) অনুযায়ী ডেটা সুরক্ষার অঙ্গীকার।',
    shortDescEn: 'DPDP Act 2023 & IT Act 2000 compliant privacy practices and data protection standards.',
    lastUpdatedBn: '১ সেপ্টেম্বর ২০২৬',
    lastUpdatedEn: 'September 1, 2026',
    iconName: 'Shield',
    complianceBadgeBn: 'DPDP Act 2023 ও IT Act 2000 মান্যতা',
    complianceBadgeEn: 'DPDP Act 2023 & IT Act 2000 Compliant',
    sections: [
      {
        id: 'intro',
        headingBn: '১. ভূমিকা ও আইনি ভিত্তি',
        headingEn: '1. Introduction & Statutory Framework',
        paragraphsBn: [
          'গপ্পো কাহিনী (Goppo Kahini) প্ল্যাটফর্মে আপনার ব্যক্তিগত তথ্যের সুরক্ষা নিশ্চিত করা আমাদের সর্বোচ্চ অগ্রাধিকার। এই গোপনীয়তা নীতি ভারতের ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা আইন, ২০২৩ (Digital Personal Data Protection Act, 2023 - DPDP Act) এবং তথ্যপ্রযুক্তি আইন, ২০০০ (Information Technology Act, 2000) ও তথ্যপ্রযুক্তি (যৌক্তিক নিরাপত্তা ব্যবস্থা ও সংবেদনশীল ব্যক্তিগত ডেটা) বিধিমালা ২০১১ (SPDI Rules 2011)-এর সুস্পষ্ট অনুশাসন অনুসারে প্রণীত।',
          'আমাদের ওয়েব অ্যাপে প্রবেশ বা ব্যবহারের মাধ্যমে আপনি এই নীতিমালার শর্তাবলীর সাথে সম্মতি জ্ঞাপন করছেন। আমরা আপনার তথ্যের গোপনীয়তা রক্ষা এবং কোনো তৃতীয় পক্ষের কাছে অননুমোদিত হস্তান্তর রোধে আইনগতভাবে প্রতিশ্রুতিবদ্ধ।'
        ]
      },
      {
        id: 'info-collected',
        headingBn: '২. আমরা যেসব তথ্য সংগ্রহ করি (ডেটা মিনিমাইজেশন)',
        headingEn: '2. Information We Collect (Data Minimisation)',
        paragraphsBn: [
          'আইনের ডেটা মিনিমাইজেশন নীতি অনুযায়ী কেবলমাত্র প্ল্যাটফর্ম পরিচালনায় অত্যাবশ্যকীয় তথ্য সংগ্রহ করা হয়:'
        ],
        bulletPointsBn: [
          'প্রোফাইল তথ্য: গুগল অথেনটিকেশন বা ইমেইল নিবন্ধনের মাধ্যমে সংগৃহীত নাম, ইমেইল ঠিকানা ও ইউজার আইডি (UID)।',
          'পাস ও লেনদেন তথ্য: ২০ টাকার মাসিক পাস অ্যাক্টিভেশনের উদ্দেশ্যে প্রেরক প্রদত্ত ইউপিআই রেফারেন্স আইডি (UPI UTR / Reference No.), মোবাইল নম্বর ও স্ক্রিনশট রসিদ।',
          'শ্রোতার পছন্দ ও লাইব্রেরি ডেটা: বুকমার্ক করা গল্পের তালিকা, শেষ শোনার সময়কাল, অডিও প্লেয়ারের ভলিউম ও সাউন্ড মিক্সার সেটিংস।',
          'ইউজার রিভিউ ও মতামত: গল্পের নিচে আপনার দেওয়া রেটিং, লিখিত পর্যালোচনা ও ইনবক্স যোগাযোগ বার্তা।'
        ]
      },
      {
        id: 'purpose-limitation',
        headingBn: '৩. তথ্যের ব্যবহার ও উদ্দেশ্য সীমাবদ্ধতা (Purpose Limitation)',
        headingEn: '3. Purpose of Processing & Consent',
        paragraphsBn: [
          'আপনার ব্যক্তিগত তথ্য কেবলমাত্র সুনির্দিষ্ট এবং বৈধ উদ্দেশ্যে ব্যবহৃত হয়:'
        ],
        bulletPointsBn: [
          'উচ্চমানের বাংলা অডিও গল্প, আবহধ্বনি ও জীবনের গল্প পডকাস্ট নিরবচ্ছিন্নভাবে পরিবেশন করা।',
          '২০ টাকার অল-অ্যাক্সেস মাসিক পাসের সত্যতা যাচাই ও অ্যাকাউন্ট প্রিমিয়াম মর্যাদায় উন্নীত করা।',
          'শ্রোতাদের পাঠানো অভিযোগ, নতুন গল্পের অনুরোধ বা প্রযুক্তিগত সমস্যার যথাযথ সমাধান প্রদান।',
          'স্প্যাম, সাইবার আক্রমণ ও প্রতারণামূলক ইউটিআর ব্যবহার প্রতিরোধে ক্লাউড অবকাঠামোর সার্বিক নিরাপত্তা রক্ষা।'
        ]
      },
      {
        id: 'dpdp-rights',
        headingBn: '৪. ব্যবহারকারীর আইনি অধিকার (DPDP Act, 2023 Rights)',
        headingEn: '4. Your Legal Rights Under DPDP Act 2023',
        paragraphsBn: [
          'DPDP Act, 2023 অনুযায়ী গপ্পো কাহিনীর প্রতিটি ভারতীয় ও বৈশ্বিক শ্রোতার নিম্নলিখিত মৌলিক অধিকার সংরক্ষিত রয়েছে:'
        ],
        bulletPointsBn: [
          'অ্যাক্সেসের অধিকার (Right to Access): আপনার সংরক্ষিত তথ্যের সংক্ষিপ্ত বিবরণ ও প্রক্রিয়াকরণ স্থিতি জানার অধিকার।',
          'সংশোধনের অধিকার (Right to Correction): যেকোনো ভুল বা অসম্পূর্ণ তথ্য আপডেট বা শুধরে নেওয়ার অধিকার।',
          'ডেটা মুছে ফেলার অধিকার (Right to Erasure): অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলার মাধ্যমে আপনার সমস্ত তথ্য প্ল্যাটফর্ম থেকে নিঃশর্তভাবে অপসারণের অধিকার।',
          'অভিযোগ জানানোর অধিকার (Right to Grievance Redressal): মনোনীত গ্রিভান্স অফিসারের মাধ্যমে ১৫ দিনের মধ্যে সমস্যার সমাধান পাওয়ার অধিকার।',
          'মনোনয়নের অধিকার (Right to Nominate): মৃত্যু বা অক্ষমতার ক্ষেত্রে অন্য কাউকে অধিকার হস্তান্তরের সুবিধা।'
        ]
      },
      {
        id: 'security-measures',
        headingBn: '৫. তথ্য নিরাপত্তা ও ক্লাউড স্টোরেজ',
        headingEn: '5. Data Security Standards & Encryption',
        paragraphsBn: [
          'আপনার ব্যক্তিগত ডেটা Google Cloud Firebase (Firestore & Firebase Auth)-এর শিল্পমানের এন্ড-টু-এন্ড এনক্রিপশন (AES-256 ও SSL/TLS প্রোটোকল) দ্বারা সুরক্ষিত।',
          'আমরা কখনো কোনো বাণিজ্যিক ডেটা ব্রোকার বা বিজ্ঞাপন সংস্থার কাছে শ্রোতাদের ব্যক্তিগত তথ্য ও ইমেইল বিক্রি, লিজ বা ভাড়া দিই না।'
        ]
      }
    ]
  },
  'terms': {
    slug: 'terms',
    titleBn: 'শর্তাবলী ও নিয়মাবলী',
    titleEn: 'Terms & Conditions',
    categoryBn: 'আইনি চুক্তি ও ব্যবহারের নিয়ম',
    shortDescBn: 'ভারতীয় চুক্তি আইন (Indian Contract Act, 1872) ও তথ্যপ্রযুক্তি আইন অনুযায়ী প্ল্যাটফর্ম ব্যবহারের নিয়ম।',
    shortDescEn: 'Legally binding terms governing platform access and audio listening in India.',
    lastUpdatedBn: '১ সেপ্টেম্বর ২০২৬',
    lastUpdatedEn: 'September 1, 2026',
    iconName: 'FileText',
    complianceBadgeBn: 'Indian Contract Act 1872 মান্যতা',
    complianceBadgeEn: 'Indian Contract Act 1872 Compliant',
    sections: [
      {
        id: 'acceptance',
        headingBn: '১. আইনি স্বীকৃতি ও যোগ্যতা',
        headingEn: '1. Legal Acceptance & User Eligibility',
        paragraphsBn: [
          'গপ্পো কাহিনী ওয়েব অ্যাপ ব্রাউজ বা ব্যবহার করে আপনি ভারতীয় চুক্তি আইন, ১৮৭২ (Indian Contract Act, 1872)-এর অধীনে এই ব্যবহারের শর্তাবলীর সাথে সম্পূর্ণভাবে সম্মত হচ্ছেন। আপনি যদি এই শর্তাবলীতে অসম্মত হন, তবে পরিষেবাটি ব্যবহার করা থেকে বিরত থাকুন।',
          'পরিষেবাটি ব্যবহারের জন্য ব্যবহারকারীর বয়স ন্যূনতম ১৮ বছর বা উপযুক্ত অভিভাবকের তত্ত্বাবধান আবশ্যক।'
        ]
      },
      {
        id: 'license',
        headingBn: '২. ব্যক্তিগত সীমিত লাইসেন্স মঞ্জুরি',
        headingEn: '2. Limited Personal Listening License',
        paragraphsBn: [
          'গপ্পো কাহিনী শ্রোতাদের শুধুমাত্র ব্যক্তিগত, পারিবারিক ও অ-বাণিজ্যিক উদ্দেশ্যে অডিও গল্প এবং পডকাস্ট শোনার জন্য একটি অ-হস্তান্তরযোগ্য, পরিবর্তনযোগ্য ও সীমাবদ্ধ লাইসেন্স প্রদান করে।',
          'পাস গ্রহণ বা গল্প শোনার অর্থ কোনো কপিরাইট বা বৌদ্ধিক সম্পদের মালিকানা হস্তান্তর নয়। সমস্ত ডিজিটাল কনটেন্ট গপ্পো কাহিনীর নিজস্ব ও স্বত্বাধিকারীদের সংরক্ষিত সম্পদ।'
        ]
      },
      {
        id: 'prohibited-activities',
        headingBn: '৩. নিষিদ্ধ কার্যকলাপ ও আইনগত দণ্ড',
        headingEn: '3. Prohibited Conduct & Violations',
        paragraphsBn: [
          'প্ল্যাটফর্ম ব্যবহারে নিম্নলিখিত যেকোনো কার্যকলাপ ভারতীয় আইন অনুযায়ী শাস্তিযোগ্য অপরাধ হিসেবে গণ্য হবে:'
        ],
        bulletPointsBn: [
          'গল্প ডাউনলোড করে কোনো ইউটিউব চ্যানেল, ফেসবুক পেজ বা সোশ্যাল মিডিয়ায় অনুমতিহীন পুনঃপ্রচার বা বিক্রি করা।',
          'অডিও স্ট্রিম রিপিং, পাইরেসি টুলস, স্ক্র্যাপার বা বট দিয়ে কনটেন্ট সংগ্রহ করার অপচেষ্টা।',
          'ভুয়া বা এডিটেড ইউপিআই ইউটিআর (Fake UTR) সাবমিট করে প্রতারণামূলকভাবে পাস সক্রিয় করার চেষ্টা।',
          'কমেন্ট বা পর্যালোচনায় কোনো সাম্প্রদায়িক, উস্কানিমূলক, মানহানিকর বা অশালীন ভাষা ব্যবহার করা।'
        ]
      },
      {
        id: 'termination',
        headingBn: '৪. অ্যাকাউন্ট বাতিল ও আইনি পদক্ষেপ',
        headingEn: '4. Suspension, Termination & Legal Action',
        paragraphsBn: [
          'কোনো ব্যবহারকারী এই শর্তাবলী বা নীতি লঙ্ঘন করলে গপ্পো কাহিনী পূর্ব নোটিশ ছাড়াই উক্ত অ্যাকাউন্টের অ্যাক্সেস স্থগিত বা বাতিল করার এবং ভারতীয় সাইবার আইন অনুযায়ী আইনি পদক্ষেপ গ্রহণের পূর্ণ অধিকার রাখে।'
        ]
      },
      {
        id: 'governing-law',
        headingBn: '৫. প্রযোজ্য আইন ও আদালত এখতিয়ার',
        headingEn: '5. Governing Law & Jurisdiction',
        paragraphsBn: [
          'এই শর্তাবলী ভারতের প্রজাতন্ত্রের আইন অনুযায়ী পরিচালিত ও ব্যাখ্যায়িত হবে। গপ্পো কাহিনী সংক্রান্ত যেকোনো বিবাদের ক্ষেত্রে ভারতের পশ্চিমবঙ্গ রাজ্যের কলকাতা হাইকোর্ট ও অধস্তন উপযুক্ত আদালতের একচ্ছত্র এখতিয়ার থাকবে।'
        ]
      }
    ]
  },
  'data-deletion': {
    slug: 'data-deletion',
    titleBn: 'অ্যাকাউন্ট ও ডেটা অপসারণ নীতি',
    titleEn: 'Account & Data Deletion',
    categoryBn: 'ব্যবহারকারীর ডেটা স্বাধীনতা',
    shortDescBn: 'DPDP Act 2023 এর সেকশন ১২ অনুযায়ী অ্যাকাউন্ট ও ব্যক্তিগত তথ্য সম্পূর্ণ মুছে ফেলার নিয়মাবলী।',
    shortDescEn: 'Statutory right to erasure and permanent account removal under DPDP Act 2023.',
    lastUpdatedBn: '১ সেপ্টেম্বর ২০২৬',
    lastUpdatedEn: 'September 1, 2026',
    iconName: 'Trash2',
    complianceBadgeBn: 'Right to Erasure (DPDP Act Sec 12)',
    complianceBadgeEn: 'DPDP Act Right to Erasure',
    sections: [
      {
        id: 'erasure-right',
        headingBn: '১. ডেটা মুছে ফেলার অধিকার (Right to Erasure)',
        headingEn: '1. Statutory Right to Erasure',
        paragraphsBn: [
          'ভারতের ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা আইন, ২০২৩ (DPDP Act, 2023)-এর ১২ নম্বর ধারা অনুযায়ী যেকোনো ব্যবহারকারী যেকোনো সময় গপ্পো কাহিনী প্ল্যাটফর্ম থেকে তার ব্যক্তিগত অ্যাকাউন্ট ও সংরক্ষিত যাবতীয় ডেটা সম্পূর্ণ মুছে ফেলার আইনি দাবি করতে পারেন।',
          'আমরা ব্যবহারকারীর ডেটা স্বাধীনতার প্রতি শ্রদ্ধাশীল এবং অনুরোধ পাওয়ার পর দ্রুততম সময়ে আপনার তথ্যের স্থায়ী বিলুপ্তি সাধন করি।'
        ]
      },
      {
        id: 'what-gets-deleted',
        headingBn: '২. অ্যাকাউন্ট মোছার পর কী কী স্থায়ীভাবে অপসারিত হয়?',
        headingEn: '2. Data That Will Be Permanently Removed',
        paragraphsBn: [
          'অ্যাকাউন্ট ডিলিট করার অনুরোধ কার্যকর হওয়ার সাথে সাথে আপনার নিম্নোক্ত তথ্যসমূহ ডাটাবেস থেকে স্থায়ীভাবে অপসারিত হবে:'
        ],
        bulletPointsBn: [
          'গুগল বা ইমেইল ভিত্তিক প্রোফাইল (নাম, ইমেইল ও ইউজার আইডি)।',
          'সংরক্ষিত সমস্ত বুকমার্ক, ফেভারিট গল্প ও শোনার ইতিহাস (Listening History)।',
          'ব্যবহারকারীর দেওয়া গল্পের রেটিং ও লিখিত রিভিউ (মন্তব্য)।',
          'যোগাযোগ ফর্ম ও ইনবক্সে জমা হওয়া বার্তা ও ব্যক্তিগত মোবাইল নম্বর।'
        ]
      },
      {
        id: 'retention-exceptions',
        headingBn: '৩. আইনি বাধ্যবাধকতামূলক সংরক্ষণের ব্যতিক্রম',
        headingEn: '3. Legal & Statutory Retention Exceptions',
        paragraphsBn: [
          'ভারতের আয়কর আইন ও আর্থিক তছরুপ প্রতিরোধ আইন (PMLA)-এর নির্দেশিকা অনুসারে, ২০ টাকার পাসের আর্থিক অডিট ও ট্যাক্স যাচাইকরণের জন্য পেমেন্ট সংক্রান্ত ইউপিআই ট্রানজ্যাকশন আইডি (UTR) ও তারিখ নির্দিষ্ট বিধিবদ্ধ মেয়াদের জন্য বেনামী (anonymized) আর্থিক খতিয়ান হিসেবে সংরক্ষিত থাকতে পারে। এতে আপনার ব্যক্তিগত পরিচিতি যুক্ত থাকবে না।'
        ]
      },
      {
        id: 'deletion-steps',
        headingBn: '৪. ডেটা মোছার আবেদন প্রক্রিয়া ও সময়সীমা',
        headingEn: '4. How to Request Deletion & SLA',
        paragraphsBn: [
          'আপনি দুটি উপায়ে আপনার অ্যাকাউন্ট মুছে ফেলতে পারেন:',
          'পদ্ধতি ১ (ইমেইল আবেদন): আপনার নিবন্ধিত ইমেইল থেকে "Account Deletion Request" লিখে আমাদের অফিশিয়াল ইমেইল joydas.21071997@gmail.com এ একটি মেইল করুন।',
          'পদ্ধতি ২ (অ্যাপ পোর্টাল): ব্যবহারকারী অ্যাকাউন্ট মোডাল থেকে "অ্যাকাউন্ট স্থায়ীভাবে মুছুন" অপশনটি সিলেক্ট করে কনফার্ম করুন।',
          'আবেদন প্রাপ্তির ৩০ (ত্রিশ) দিনের মধ্যে আপনার সমস্ত তথ্য স্থায়ীভাবে স্ক্র্যাপ ও অপসারিত হবে এবং কনফার্মেশন ইমেইল পাঠানো হবে।'
        ]
      }
    ]
  },
  'grievance': {
    slug: 'grievance',
    titleBn: 'অভিযোগ নিষ্পত্তি ও নোডাল অফিসার',
    titleEn: 'Grievance / Privacy Contact',
    categoryBn: 'আইনি অনুপালন ও নোডাল কর্মকর্তা',
    shortDescBn: 'তথ্যপ্রযুক্তি (মধ্যস্থতাকারী নির্দেশিকা) বিধিমালা ২০২১-এর রুল ৩(২) অনুসারে অভিযোগ নিষ্পত্তির প্রাতিষ্ঠানিক চ্যানেল।',
    shortDescEn: 'Mandatory statutory grievance redressal mechanism under Rule 3(2) of IT Rules 2021.',
    lastUpdatedBn: '১ সেপ্টেম্বর ২০২৬',
    lastUpdatedEn: 'September 1, 2026',
    iconName: 'Scale',
    complianceBadgeBn: 'IT Rules 2021 রুল ৩(২) নোডাল কর্মকর্তা',
    complianceBadgeEn: 'IT Rules 2021 Rule 3(2) Mandate',
    sections: [
      {
        id: 'mandate',
        headingBn: '১. আইনি নির্দেশিকা ও প্রাতিষ্ঠানিক প্রতিশ্রুতি',
        headingEn: '1. Statutory Mandate (Rule 3(2) of IT Rules 2021)',
        paragraphsBn: [
          'ভারতের তথ্যপ্রযুক্তি (মধ্যস্থতাকারী নির্দেশিকা ও ডিজিটাল মিডিয়া এথিক্স কোড) বিধিমালা ২০২১ (Information Technology Intermediary Guidelines and Digital Media Ethics Code Rules, 2021)-এর রুল ৩(২) এবং DPDP Act 2023-এর বিধান অনুসারে গপ্পো কাহিনী একজন দায়িত্বপ্রাপ্ত অভিযোগ কর্মকর্তা (Grievance Officer) নিয়োগ করেছে।',
          'প্ল্যাটফর্মের কোনো কনটেন্ট, কপিরাইট সমস্যা, ব্যবহারকারীর আচরণ, বা পেমেন্ট সংক্রান্ত যেকোনো অভিযোগ আইনসঙ্গত সময়ে নিষ্পত্তির জন্য আমরা প্রতিশ্রুতিবদ্ধ।'
        ]
      },
      {
        id: 'officer-details',
        headingBn: '২. দায়িত্বপ্রাপ্ত অভিযোগ কর্মকর্তার বিবরণ',
        headingEn: '2. Designated Grievance Officer Details',
        paragraphsBn: [
          'অভিযোগ জানানোর জন্য সরাসরি যোগাযোগ করুন:'
        ],
        bulletPointsBn: [
          'কর্মকর্তার নাম: জয় (Joy)',
          'পদবী: প্রতিষ্ঠাতা, সিস্টেম অ্যাডমিনিস্ট্রেটর ও গ্রিভান্স অফিসার, গপ্পো কাহিনী',
          'অফিসিয়াল যোগাযোগ ইমেইল: joydas.21071997@gmail.com',
          'ঠিকানা: কলকাতা, পশ্চিমবঙ্গ, ভারত — ৭০০০০১',
          'কার্যকাল: সোমবার থেকে শনিবার, সকাল ১০:০০ টা থেকে রাত ৮:০০ টা (IST)'
        ]
      },
      {
        id: 'timelines',
        headingBn: '৩. অভিযোগ নিষ্পত্তির আইনি সময়সীমা',
        headingEn: '3. Statutory Resolution Timelines',
        paragraphsBn: [
          'আইনি বাধ্যবাধকতা অনুসারে অভিযোগ নিষ্পত্তি প্রক্রিয়া পরিচালিত হয়:'
        ],
        bulletPointsBn: [
          'প্রাপ্তি স্বীকার (Acknowledgment): অভিযোগ মেইল পাওয়ার ২৪ (চব্বিশ) ঘণ্টার মধ্যে অভিযোগকারীকে আনুষ্ঠানিক টিকিট ও প্রাপ্তিস্বীকার প্রদান।',
          'তদন্ত ও নিষ্পত্তি (Resolution): অভিযোগ প্রাপ্তির তারিখ থেকে অনধিক ১৫ (পনেরো) কার্যদিবসের মধ্যে অভিযোগের সার্বিক তদন্ত ও কার্যকর প্রতিকার নিশ্চিত করা।'
        ]
      },
      {
        id: 'how-to-file',
        headingBn: '৪. অভিযোগ দাখিলের নিয়মাবলী',
        headingEn: '4. How to Submit a Valid Grievance',
        paragraphsBn: [
          'আপনার অভিযোগ দ্রুত নিষ্পত্তির জন্য মেইলের সাবজেক্টে "LEGAL GRIEVANCE" উল্লেখ করুন এবং আপনার নাম, যোগাযোগের নম্বর, সুনির্দিষ্ট ঘটনার তারিখ এবং প্রাসঙ্গিক প্রমাণাদি (যেমন স্ক্রিনশট বা লিংক) সংযোজন করুন।'
        ]
      }
    ]
  },
  'refund-policy': {
    slug: 'refund-policy',
    titleBn: 'রিফান্ড ও বাতিলকরণ নীতি',
    titleEn: 'Refund & Cancellation Policy',
    categoryBn: 'পেমেন্ট ও ভোক্তা সুরক্ষা',
    shortDescBn: 'ভোক্তা সুরক্ষা (ই-কমার্স) বিধিমালা ২০২০ অনুযায়ী ডিজিটাল সেবার ন্যায্য রিফান্ড ও বাতিল নির্দেশিকা।',
    shortDescEn: 'Consumer Protection (E-Commerce) Rules 2020 compliant refund and cancellation framework.',
    lastUpdatedBn: '১ সেপ্টেম্বর ২০২৬',
    lastUpdatedEn: 'September 1, 2026',
    iconName: 'RefreshCcw',
    complianceBadgeBn: 'Consumer Protection Rules 2020 মান্যতা',
    complianceBadgeEn: 'Consumer Protection (E-Commerce) 2020',
    sections: [
      {
        id: 'digital-nature',
        headingBn: '১. ডিজিটাল স্ট্রিমিং সেবার প্রকৃতি',
        headingEn: '1. Nature of Digital Streaming Services',
        paragraphsBn: [
          'গপ্পো কাহিনীর ২০ টাকার অল-অ্যাক্সেস মাসিক পাস একটি অবস্তুগত ডিজিটাল স্ট্রিমিং সেবা। পেমেন্ট যাচাই ও পাস সক্রিয় হওয়ার সাথে সাথে ব্যবহারকারী তাৎক্ষণিকভাবে সমস্ত প্রিমিয়াম অডিও গল্প উপভোগ করার অধিকার লাভ করেন। ফলে একবার সক্রিয় হওয়া পাসের ক্ষেত্রে সাধারণত রিফান্ড প্রযোজ্য নয়।'
        ]
      },
      {
        id: 'eligible-cases',
        headingBn: '২. যেসকল ক্ষেত্রে ১০০% রিফান্ড নিশ্চিত করা হয়',
        headingEn: '2. Circumstances Eligible for Full Refund',
        paragraphsBn: [
          'ভোক্তা সুরক্ষা আইন, ২০১৯ ও ই-কমার্স বিধিমালা ২০২০ অনুসারে নিম্নোক্ত ক্ষেত্রে সম্পূর্ণ রিফান্ড প্রদান করা হয়:'
        ],
        bulletPointsBn: [
          'ডুপ্লিকেট বা অতিরিক্ত কর্তন: কারিগরি বা নেটওয়ার্ক সমস্যার কারণে একই পাসের জন্য একাধিকবার টাকা কেটে নেওয়া হলে অতিরিক্ত অর্থ সম্পূর্ণ ফেরত দেওয়া হবে।',
          'অ্যাক্টিভেশনে বিলম্ব: সঠিক ইউপিআই ট্রানজ্যাকশন আইডি ও তথ্য জমা দেওয়ার পরও যদি আমাদের প্রযুক্তিগত ত্রুটির কারণে ৭২ ঘণ্টার মধ্যে পাস সক্রিয় না হয় এবং ব্যবহারকারী বাতিল করতে চান।',
          'অননুমোদিত লেনদেন: ব্যাংকিং সাইবার প্রতারণার প্রমাণ উপস্থাপনে ব্যাংক কর্তৃক স্বীকৃত অবৈধ লেনদেন।'
        ]
      },
      {
        id: 'non-eligible',
        headingBn: '৩. যেসকল ক্ষেত্রে রিফান্ড গ্রহণযোগ্য নয়',
        headingEn: '3. Non-Eligible Refund Scenarios',
        paragraphsBn: [
          'নিম্নোক্ত পরিস্থিতিতে কোনো রিফান্ড দাবি প্রযোজ্য হবে না:'
        ],
        bulletPointsBn: [
          'পাস সক্রিয় হওয়ার পর গল্প উপভোগ করার পর ব্যক্তিগত গল্প রুচির পরিবর্তনের অজুহাতে।',
          'ব্যবহারকারীর নিজস্ব ইন্টারনেট সংযোগের ধীরগতি বা ডিভাইসের স্পিকারের ত্রুটির ক্ষেত্রে।',
          'ভুয়া বা কাল্পনিক ইউটিআর নম্বর জমা দিয়ে প্রতারণার অভিযোগে বাতিলকৃত অ্যাকাউন্ট।'
        ]
      },
      {
        id: 'timeline-process',
        headingBn: '৪. রিফান্ডের আবেদন ও নিষ্পত্তি সময়সীমা',
        headingEn: '4. Refund Application & Payout Timeline',
        paragraphsBn: [
          'লেনদেনের ৭ দিনের মধ্যে আপনার নিবন্ধিত ইমেইল ও ইউপিআই ইউটিআর বিবরণ সহ joydas.21071997@gmail.com এ যোগাযোগ করুন।',
          'রিফান্ড অনুমোদিত হলে ৫ থেকে ৭ ব্যাংকিং কার্যদিবসের (Banking Business Days) মধ্যে মূল ইউপিআই বা ব্যাংক অ্যাকাউন্টে কোনো প্রকার প্রসেসিং ফি কর্তন ছাড়াই সরাসরি অর্থ স্থানান্তর করা হবে।'
        ]
      }
    ]
  },
  'subscription-terms': {
    slug: 'subscription-terms',
    titleBn: 'সাবস্ক্রিপশন ও ২০ টাকা পাস শর্তাবলী',
    titleEn: 'Subscription Terms',
    categoryBn: 'পাস ও অ্যাক্সেস পলিসি',
    shortDescBn: 'আরবিআই (RBI) ডিজিটাল পেমেন্ট বিধি ও স্বচ্ছ মূল্যায়নে ২০ টাকার মাসিক অল-অ্যাক্সেস পাসের নিয়ম।',
    shortDescEn: 'Transparent terms for the ₹20 monthly all-access pass with no auto-debit traps.',
    lastUpdatedBn: '১ সেপ্টেম্বর ২০২৬',
    lastUpdatedEn: 'September 1, 2026',
    iconName: 'CreditCard',
    complianceBadgeBn: 'RBI নন-অটোডেবিট সুরক্ষা মান্যতা',
    complianceBadgeEn: 'RBI Transparent Digital Access Compliant',
    sections: [
      {
        id: 'pass-structure',
        headingBn: '১. ২০ টাকার অল-অ্যাক্সেস পাসের কাঠামো ও মূল্য',
        headingEn: '1. Structure of ₹20 All-Access Pass',
        paragraphsBn: [
          'গপ্পো কাহিনী কোনো দীর্ঘমেয়াদী বা জটিল লুকানো সাবস্ক্রিপশন চাপিয়ে দেয় না। প্ল্যাটফর্মের সমস্ত প্রিমিয়াম অডিও ড্রামা ও থ্রিলার আনলিমিটেড শোনার জন্য প্রতি ৩০ দিনের জন্য মাত্র ২০ (বিশ) টাকার একটি নামমাত্র রক্ষণাবেক্ষণ পাস নির্ধারিত রয়েছে।',
          'এই মূল্য চূড়ান্ত এবং এতে কোনো লুকানো চার্জ, কর বা অতিরিক্ত ফি যুক্ত নেই।'
        ]
      },
      {
        id: 'no-auto-debit',
        headingBn: '২. অটো-ডেবিট বা অটো-রিনিউয়াল ফাঁদ মুক্ত নীতি (RBI Compliant)',
        headingEn: '2. Explicit Consent - No Hidden Auto-Debits',
        paragraphsBn: [
          'ভারতের কেন্দ্রীয় ব্যাংক (Reserve Bank of India - RBI)-এর ডিজিটাল ই-ম্যান্ডেট সংক্রান্ত গ্রাহক সুরক্ষা নির্দেশিকা সম্পূর্ণ বজায় রেখে গপ্পো কাহিনীতে কোনো প্রকার স্বয়ংক্রিয় ব্যাংক ব্যালেন্স কাটার (Auto-Debit) সিস্টেম রাখা হয়নি।',
          '৩০ দিনের মেয়াদ শেষ হলে আপনার অ্যাকাউন্ট থেকে এক পয়সাও স্বয়ংক্রিয়ভাবে কাটা যাবে না। আপনি সম্পূর্ণ নিজের ইচ্ছায় পরবর্তী মাসে পুনরায় ২০ টাকা দিয়ে পাস সক্রিয় করতে পারবেন।'
        ]
      },
      {
        id: 'fair-usage',
        headingBn: '৩. ব্যক্তিগত ব্যবহার ও ডিভাইস সীমাবদ্ধতা',
        headingEn: '3. Fair Usage & Personal Listening Scope',
        paragraphsBn: [
          '২০ টাকার পাসটি একক ব্যক্তির ব্যক্তিগত ও ঘরোয়া বিনোদনের জন্য লাইসেন্সকৃত। একটি পাস দিয়ে একই সময়ে একাধিক বাণিজ্যিক স্থানে বা পাবলিক স্পিকারে বাণিজ্যিক সম্প্রচার করা নিষিদ্ধ।'
        ]
      },
      {
        id: 'free-tier',
        headingBn: '৪. আজীবন বিনামূল্যে উন্মুক্ত কনটেন্ট',
        headingEn: '4. Forever Free Stories Commitment',
        paragraphsBn: [
          'পাস গ্রহণ না করলেও শ্রোতারা প্ল্যাটফর্মের উন্মুক্ত গল্পসমূহ (Free Stories) সম্পূর্ণ বিনামূল্যে ও আজীবন যেকোনো সময় উপভোগ করতে পারবেন।'
        ]
      }
    ]
  },
  'community-guidelines': {
    slug: 'community-guidelines',
    titleBn: 'কমিউনিটি ও মন্তব্য নির্দেশিকা',
    titleEn: 'Community Guidelines',
    categoryBn: 'শ্রোতা আচরণ ও মডারেশন',
    shortDescBn: 'IT Rules 2021 এর রুল ৩(১)(খ) অনুযায়ী গল্পের পর্যালোচনা, কমেন্ট ও রিভিউয়ের সুস্থ পরিবেশ নীতিমালা।',
    shortDescEn: 'Code of conduct for reviews, comments, and community interactions under IT Rules 2021.',
    lastUpdatedBn: '১ সেপ্টেম্বর ২০২৬',
    lastUpdatedEn: 'September 1, 2026',
    iconName: 'Users',
    complianceBadgeBn: 'IT Rules 2021 রুল ৩(১)(খ) মান্যতা',
    complianceBadgeEn: 'IT Rules 2021 Rule 3(1)(b) Compliant',
    sections: [
      {
        id: 'healthy-space',
        headingBn: '১. সুস্থ ও গঠনমূলক সাহিত্য পরিবেশ',
        headingEn: '1. Nurturing a Constructive Literary Space',
        paragraphsBn: [
          'গপ্পো কাহিনী বাংলা সাহিত্য, রহস্য ও শ্রুতিনাটক ভালোবাসেন এমন শ্রোতাদের একটি সুশৃঙ্খল পরিবার। গল্পের নিচে শ্রোতাদের রিভিউ, স্টার রেটিং ও আলোচনা এই উদ্যোগকে সমৃদ্ধ করে। এই পরিসরকে সুস্থ, সুন্দর ও নিরাপদ রাখতে আমরা IT Rules 2021 এর রুল ৩(১)(খ) অনুসরণ করি।'
        ]
      },
      {
        id: 'prohibited-content',
        headingBn: '২. যেসকল কনটেন্ট সম্পূর্ণ নিষিদ্ধ',
        headingEn: '2. Prohibited User-Generated Content',
        paragraphsBn: [
          'গল্পের মন্তব্য, রেটিং, বা অডিশন সাবমিশনে নিম্নোক্ত বিষয়াদি প্রকাশ করা সম্পূর্ণ আইনত নিষিদ্ধ:'
        ],
        bulletPointsBn: [
          'কোনো ব্যক্তি, ধর্ম, বর্ণ বা লিঙ্গকে উদ্দেশ্য করে বিদ্বেষমূলক বক্তব্য (Hate Speech) বা উস্কানি।',
          'অশ্লীল, কুরুচিপূর্ণ, পর্নোগ্রাফিক বা হিংসাত্মক ভাষা ও উপাদান।',
          'অন্যের ব্যক্তিগত তথ্য, ফোন নম্বর বা ঠিকানা অনুমতি ছাড়া প্রকাশ করা (Doxxing)।',
          'মিথ্যা রিভিউ দেওয়া বা উদ্দেশ্যপ্রণোদিতভাবে স্প্যামিং এবং বাণিজ্যিক বিজ্ঞাপন প্রচার।',
          'ভারতের সার্বভৌমত্ব, অখণ্ডতা বা জনশৃঙ্খলার পরিপন্থী কোনো ক্ষতিকর বক্তব্য।'
        ]
      },
      {
        id: 'moderation-powers',
        headingBn: '৩. মডারেশন ও মন্তব্য অপসারণ অধিকার',
        headingEn: '3. Administrator Moderation Rights',
        paragraphsBn: [
          'গপ্পো কাহিনী অ্যাডমিন প্যানেল যেকোনো নীতিমালা লঙ্ঘনকারী রিভিউ বা কমেন্ট তাৎক্ষণিকভাবে মুছে ফেলা এবং পুনরাবৃত্তিমূলক অপব্যবহারকারীর অ্যাকাউন্ট ব্লক করার নিরঙ্কুশ অধিকার সংরক্ষণ করে।'
        ]
      }
    ]
  },
  'copyright-policy': {
    slug: 'copyright-policy',
    titleBn: 'কপিরাইট ও মেধা-স্বত্ব নীতি',
    titleEn: 'Copyright Policy',
    categoryBn: 'মেধাসম্পদ ও স্বত্বাধিকার',
    shortDescBn: 'ভারতীয় কপিরাইট আইন ১৯৫৭ (Copyright Act, 1957) ও টেক-ডাউন নোটিশ সংক্রান্ত আইনি নীতিমালা।',
    shortDescEn: 'Protection of intellectual property under Indian Copyright Act 1957 & takedown protocol.',
    lastUpdatedBn: '১ সেপ্টেম্বর ২০২৬',
    lastUpdatedEn: 'September 1, 2026',
    iconName: 'ShieldAlert',
    complianceBadgeBn: 'Indian Copyright Act 1957 মান্যতা',
    complianceBadgeEn: 'Indian Copyright Act 1957 Compliant',
    sections: [
      {
        id: 'copyright-ownership',
        headingBn: '১. গপ্পো কাহিনীর স্বত্বাধিকার ও মেধাসম্পদ',
        headingEn: '1. Original Voice, Soundscapes & Script Ownership',
        paragraphsBn: [
          'গপ্পো কাহিনীতে প্রকাশিত সমস্ত শ্রুতিনাটক, কথকের মৌলিক কণ্ঠস্বর, আবহ সঙ্গীত (Foley & Background Soundscapes), লোগো, গ্রাফিক্স ও কোড ভারতীয় কপিরাইট আইন, ১৯৫৭ (Indian Copyright Act, 1957) অনুযায়ী সংরক্ষিত।',
          'অনুমতি ছাড়া কোনো অডিও ট্র্যাক কপি করে অন্য কোনো ডিজিটাল মাধ্যমে সম্প্রচার বা বাণিজ্যিক ব্যবহার আইনত দণ্ডনীয়।'
        ]
      },
      {
        id: 'fair-dealing',
        headingBn: '২. ন্যায্য ব্যবহার (Fair Dealing - Section 52)',
        headingEn: '2. Fair Dealing Recognition (Section 52)',
        paragraphsBn: [
          'আইনের ৫২ নম্বর ধারা অনুসারে কেবল ব্যক্তিগত পর্যালোচনা, সাহিত্য সমালোচনা ও গবেষণামূলক উদ্ধৃতি ব্যতীত অন্য কোনো উদ্দেশ্যে গপ্পো কাহিনীর কনটেন্ট পুনরুৎপাদন করা যাবে না।'
        ]
      },
      {
        id: 'takedown-notice',
        headingBn: '৩. স্বত্বাধিকার লঙ্ঘন ও টেক-ডাউন নোটিশ পদ্ধতি',
        headingEn: '3. Notice and Take-Down Procedure (IT Rules 2021)',
        paragraphsBn: [
          'আপনি যদি কোনো গল্পের মূল লেখক বা বৈধ স্বত্বাধিকারী হন এবং মনে করেন যে আপনার সম্মতি ব্যতিরেকে গল্প ব্যবহৃত হয়েছে, তবে তাৎক্ষণিকভাবে নিম্নোক্ত তথ্যসহ joydas.21071997@gmail.com এ নোটিশ পাঠান:'
        ],
        bulletPointsBn: [
          'কপিরাইটযুক্ত মূল রচনার প্রমাণ বা প্রকাশনা তথ্য।',
          'গপ্পো কাহিনীতে ব্যবহৃত সংশ্লিষ্ট গল্পের লিংক বা সঠিক নাম।',
          'আপনার পূর্ণ নাম, ঠিকানা ও আইনগত স্বত্বাধিকারের সত্যায়িত ঘোষণা।',
          'নোটিশ পর্যালোচনার ৩৬ (ছত্রিশ) ঘণ্টার মধ্যে সংশ্লিষ্ট কনটেন্ট সাময়িকভাবে সরিয়ে তদন্ত সম্পন্ন করা হবে।'
        ]
      }
    ]
  },
  'disclaimer': {
    slug: 'disclaimer',
    titleBn: 'দাবিত্যাগ ও বিষয়বস্তু সতর্কতা',
    titleEn: 'Disclaimer',
    categoryBn: 'আইনি ঘোষণা ও স্বাস্থ্যবিধি',
    shortDescBn: 'কাল্পনিক সাহিত্যকর্ম, পৌরাণিক গাথা ও অডিও স্বাস্থ্যবিধি বিষয়ক আইনি ঘোষণাপত্র।',
    shortDescEn: 'Disclaimers on fictional nature, audio safety, and supernatural folklore under Indian Law.',
    lastUpdatedBn: '১ সেপ্টেম্বর ২০২৬',
    lastUpdatedEn: 'September 1, 2026',
    iconName: 'AlertTriangle',
    complianceBadgeBn: 'আর্টিকেল ১৯(১)(ক) সৃজনশীল স্বাধীনতা ও সতর্কতা',
    complianceBadgeEn: 'Constitutional Creative Freedom & Advisory',
    sections: [
      {
        id: 'fictional-work',
        headingBn: '১. কাল্পনিক সৃষ্টিশীল সাহিত্য ও নাট্যরূপ',
        headingEn: '1. Works of Fiction & Artistic Dramatization',
        paragraphsBn: [
          'গপ্পো কাহিনীতে পরিবেশিত রহস্য, থ্রিলার এবং ভৌতিক গল্পসমূহ মূলত কাল্পনিক সাহিত্যকর্ম ও সৃষ্টিশীল শ্রুতিনাটক। ভারতীয় সংবিধানের অনুচ্ছেদ ১৯(১)(ক)-এর অধীনে প্রদত্ত বাক ও ভাব প্রকাশের স্বাধীনতা অনুযায়ী এটি বিনোদনের উদ্দেশ্যে পরিবেশিত।',
          'এসব গল্পের কোনো চরিত্র, স্থান, নাম বা ঘটনার সাথে বাস্তব কোনো ব্যক্তি বা ঘটনার মিল খুঁজে পাওয়া গেলে তা সম্পূর্ণ অনিচ্ছাকৃত ও কাকতালীয়।'
        ]
      },
      {
        id: 'supernatural-notice',
        headingBn: '২. অতিলৌকিক ও ভৌতিক বিষয়ে সতর্কতা (অন্ধবিশ্বাস বিরোধী অবস্থান)',
        headingEn: '2. Supernatural Lore & Anti-Superstition Stance',
        paragraphsBn: [
          'অলৌকিক ও লোকগাথা বিষয়ক গল্পগুলি কেবল রোমাঞ্চ রসাস্বাদনে পরিবেশিত। গপ্পো কাহিনী কোনো প্রকার অন্ধবিশ্বাস, কুসংস্কার, অপবিজ্ঞান বা ভিত্তিহীন ভীতি প্রচারকে সমর্থন করে না এবং কোনো অতিপ্রাকৃতিক দাবির বৈজ্ঞানিক সত্যতা দাবি করে না।'
        ]
      },
      {
        id: 'life-stories-disclaimer',
        headingBn: '৩. ‘মানুষের জীবন কথা’ পডকাস্টের দায়মুক্তি',
        headingEn: '3. "Manusher Jibon Kotha" Podcast Disclosures',
        paragraphsBn: [
          '‘মানুষের জীবন কথা’ বিভাগে সাধারণ মানুষের বাস্তব জীবনের লড়াই ও অভিজ্ঞতা তাদের নিজস্ব বয়ানে পরিবেশিত হয়। এতে ব্যক্ত মতামত সম্পূর্ণভাবে গল্পদাতার নিজস্ব। গপ্পো কাহিনী এর ঐতিহাসিক নির্ভুলতার কোনো আইনি দায়ভার গ্রহণ করে না।'
        ]
      },
      {
        id: 'audio-health',
        headingBn: '৪. শ্রবণ সতর্কতা ও স্বাস্থ্যবিধি',
        headingEn: '4. Hearing Safety & Volume Precautions',
        paragraphsBn: [
          'আমাদের গল্পগুলিতে রোমাঞ্চকর সাউন্ড ইফেক্ট ও গভীর ড্রামাটিক মিউজিক থাকে। দীর্ঘ সময় একটানা উচ্চ শব্দে শুনলে শ্রবণশক্তির ক্ষতি হতে পারে। অনুগ্রহ করে সহনীয় মাত্রায় হেডফোনে শুনুন এবং যানবাহন চালানোর সময় সতর্ক থাকুন।'
        ]
      }
    ]
  },
  'third-party-services': {
    slug: 'third-party-services',
    titleBn: 'তৃতীয় পক্ষের পরিষেবা ও পার্টনারস',
    titleEn: 'Third-Party Services',
    categoryBn: 'প্রযুক্তিগত সহযোগী ও পরিকাঠামো',
    shortDescBn: 'Google Firebase, NPCI UPI পরিকাঠামো ও অন্যান্য ক্লাউড অংশীদারদের সাথে ডেটা আদান-প্রদান স্বচ্ছতা।',
    shortDescEn: 'Transparency disclosures for Google Cloud, Firebase, and NPCI UPI payment gateways.',
    lastUpdatedBn: '১ সেপ্টেম্বর ২০২৬',
    lastUpdatedEn: 'September 1, 2026',
    iconName: 'Server',
    complianceBadgeBn: 'পার্টনার স্বচ্ছতা ও নিরাপত্তা অনুপালন',
    complianceBadgeEn: 'Infrastructure Transparency Compliant',
    sections: [
      {
        id: 'infra-overview',
        headingBn: '১. কেন তৃতীয় পক্ষের নির্ভরযোগ্য সেবা প্রয়োজন?',
        headingEn: '1. Why We Rely on Enterprise Partners',
        paragraphsBn: [
          'গপ্পো কাহিনী বিশ্বমানের অডিও স্ট্রিমিং অভিজ্ঞতা ও সর্বোচ্চ তথ্য নিরাপত্তা নিশ্চিত করতে শীর্ষস্থানীয় ও আন্তর্জাতিকভাবে স্বীকৃত ক্লাউড পার্টনারদের অবকাঠামো ব্যবহার করে। আমরা কোনো অননুমোদিত তৃতীয় পক্ষের সাথে ডেটা ভাগ করি না।'
        ]
      },
      {
        id: 'firebase-details',
        headingBn: '২. গুগল ক্লাউড ও ফায়ারবেস (Google Firebase)',
        headingEn: '2. Google Firebase Services (Auth, DB & Storage)',
        paragraphsBn: [
          'আমরা গুগল এলএলসি (Google LLC)-এর সাবসিডিয়ারি ফায়ারবেসের ক্লাউড সেবা গ্রহণ করি:'
        ],
        bulletPointsBn: [
          'Firebase Authentication: পাসওয়ার্ডলেস ও নিরাপদ গুগল সাইন-ইন পরিচালনায়।',
          'Cloud Firestore: ব্যবহারকারী প্রোফাইল, গল্প মেটাডেটা ও রিভিউ ডাটাবেস সংরক্ষণে।',
          'Firebase Cloud Storage: মূল অডিও গল্প ও কভার ছবির দ্রুত ও এনক্রিপ্টেড হোস্টিংয়ে।'
        ]
      },
      {
        id: 'upi-ecosystem',
        headingBn: '৩. ভারতীয় ইউপিআই পেমেন্ট ইকোসিস্টেম (NPCI)',
        headingEn: '3. NPCI Unified Payments Interface (UPI)',
        paragraphsBn: [
          '২০ টাকার পেমেন্ট ন্যাশনাল পেমেন্টস কর্পোরেশন অব ইন্ডিয়া (NPCI) অনুমোদিত যেকোনো ইউপিআই অ্যাপের (Google Pay, PhonePe, Paytm, BHIM) মাধ্যমে সরাসরি আপনার ব্যাংক থেকে সম্পন্ন হয়। গপ্পো কাহিনী কোনো ব্যাংকিং পিন বা পাসওয়ার্ড গ্রহণ করে না।'
        ]
      }
    ]
  },
  'app-permissions': {
    slug: 'app-permissions',
    titleBn: 'অ্যাপ পারমিশন ও ডেটা ব্যবহার',
    titleEn: 'App Permissions & Data Usage',
    categoryBn: 'ডিভাইস নিরাপত্তা ও পারমিশন',
    shortDescBn: 'ব্যাকগ্রাউন্ড অডিও প্লেব্যাক, সাউন্ড ক্যাশিং ও ঐচ্ছিক অডিও রেকর্ডিং পারমিশনের স্বচ্ছ বিবরণ।',
    shortDescEn: 'Clear explanation of device permissions, media session controls, and microphone access.',
    lastUpdatedBn: '১ সেপ্টেম্বর ২০২৬',
    lastUpdatedEn: 'September 1, 2026',
    iconName: 'Smartphone',
    complianceBadgeBn: 'ডিভাইস প্রিভিলেজ মিনিমাইজেশন',
    complianceBadgeEn: 'Minimal Device Permissions Compliant',
    sections: [
      {
        id: 'permission-policy',
        headingBn: '১. পারমিশন মিনিমাইজেশন নীতি',
        headingEn: '1. Principle of Minimal Privileges',
        paragraphsBn: [
          'গপ্পো কাহিনী একটি প্রগ্রেসিভ ও আধুনিক ওয়েব অ্যাপ্লিকেশন। আমরা ব্যবহারকারীর ফোনে অযাচিত কোনো পারমিশন চাই না। আমাদের অ্যাপে লোকেশন, ক্যামেরা, কন্টাক্টস বা ফোনের মেমোরি স্ক্যান করার কোনো পারমিশন প্রয়োজন হয় না।'
        ]
      },
      {
        id: 'permissions-list',
        headingBn: '২. যেসব সুনির্দিষ্ট পারমিশন প্রয়োজন হয়',
        headingEn: '2. Specific Permissions Requested',
        paragraphsBn: [
          'অ্যাপের স্বাভাবিক কার্যকারিতার জন্য কেবল নিম্নোক্ত সুবিধাসমূহ ব্যবহৃত হয়:'
        ],
        bulletPointsBn: [
          'মিডিয়া সেশন ও ব্যাকগ্রাউন্ড অডিও: ফোনের স্ক্রিন লক থাকলেও বা অন্য অ্যাপে থাকলেও অডিও যাতে বন্ধ না হয় এবং লক-স্ক্রিনে কন্ট্রোল দেখা যায়।',
          'ব্রাউজার লোকাল স্টোরেজ: আপনার শেষ শোনার পজিশন, বুকমার্ক এবং প্লেয়ার সাউন্ড মিক্সার সেটিংস সংরক্ষণ করতে।',
          'মাইক্রোফোন (ঐচ্ছিক ও শর্তসাপেক্ষ): শুধুমাত্র যখন আপনি স্বেচ্ছায় কথক অডিশন দিতে ভয়েস স্যাম্পল রেকর্ড করবেন বা জীবনের গল্প বলবেন। আপনার পূর্বানুমতি ছাড়া এটি কখনোই সক্রিয় হয় না।'
        ]
      },
      {
        id: 'revoke',
        headingBn: '৩. যেকোনো সময় পারমিশন প্রত্যাহারের সুবিধা',
        headingEn: '3. Revoking Permissions Anytime',
        paragraphsBn: [
          'আপনি যেকোনো সময় ব্রাউজার সেটিংস থেকে গপ্পো কাহিনীর সাইট পারমিশন পর্যালোচনা ও বন্ধ করতে পারেন।'
        ]
      }
    ]
  },
  'legal-info': {
    slug: 'legal-info',
    titleBn: 'আইনি পরিচিতি ও বিচারিক এখতিয়ার',
    titleEn: 'About / Legal Information',
    categoryBn: 'প্রাতিষ্ঠানিক পরিচয় ও তথ্য',
    shortDescBn: 'গপ্পো কাহিনী ডিজিটাল প্ল্যাটফর্মের পরিচালনাকারী, অফিসিয়াল সত্ত্বা ও ভারতের বিচারিক এখতিয়ার।',
    shortDescEn: 'Corporate entity, nodal ownership details, and exclusive Kolkata jurisdiction.',
    lastUpdatedBn: '১ সেপ্টেম্বর ২০২৬',
    lastUpdatedEn: 'September 1, 2026',
    iconName: 'Building',
    complianceBadgeBn: 'ভারতের সাংবিধানিক ও স্ট্যাটুটরি মান্যতা',
    complianceBadgeEn: 'Statutory Indian Entity Disclosures',
    sections: [
      {
        id: 'entity-details',
        headingBn: '১. প্রাতিষ্ঠানিক সত্ত্বা ও পরিচালকের পরিচয়',
        headingEn: '1. Legal Entity & Proprietorship Disclosures',
        paragraphsBn: [
          'গপ্পো কাহিনী (Goppo Kahini) হলো বাংলা সাহিত্যের শ্রুতিনাটক, সাসপেন্স থ্রিলার ও পডকাস্ট পরিবেশনের একটি স্বাধীন ভারতীয় ডিজিটাল অডিও প্ল্যাটফর্ম।',
          'এই উদ্যোগের একমাত্র প্রতিষ্ঠাতা, স্বত্বাধিকারী ও মুখ্য প্রযুক্তি পরিচালক হলেন জয় (Joy)।'
        ]
      },
      {
        id: 'regulatory-compliance',
        headingBn: '২. ভারতীয় প্রযোজ্য আইনের অনুপালন',
        headingEn: '2. Statutory Compliance Framework in India',
        paragraphsBn: [
          'গপ্পো কাহিনী প্ল্যাটফর্ম ভারতের সমস্ত প্রযোজ্য আইন ও সাংবিধানিক বিধিমালার প্রতি পূর্ণ আস্থা ও শ্রদ্ধা বজায় রেখে পরিচালিত হয়:'
        ],
        bulletPointsBn: [
          'ভারতের সংবিধান (Constitution of India) — অনুচ্ছেদ ১৯(১)(ক) বাক ও সৃজনশীল স্বাধীনতার পরিধি।',
          'তথ্যপ্রযুক্তি আইন, ২০০০ ও মধ্যস্থতাকারী বিধিমালা ২০২১ (IT Act & Intermediary Guidelines 2021)।',
          'ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা আইন, ২০২৩ (DPDP Act, 2023)।',
          'ভোক্তা সুরক্ষা আইন, ২০১৯ ও ই-কমার্স বিধিমালা ২০২০ (Consumer Protection Act, 2019)।',
          'ভারতীয় কপিরাইট আইন, ১৯৫৭ (Indian Copyright Act, 1957)।',
          'ভারতীয় চুক্তি আইন, ১৮৭২ (Indian Contract Act, 1872)।'
        ]
      },
      {
        id: 'jurisdiction-seat',
        headingBn: '৩. বিচারিক এখতিয়ার ও আইনি বিরোধ নিষ্পত্তি',
        headingEn: '3. Legal Seat & Exclusive Jurisdiction',
        paragraphsBn: [
          'এই প্ল্যাটফর্ম সম্পর্কিত যেকোনো প্রকার বিরোধ, আইনি নোটিশ বা দাবির ক্ষেত্রে পারস্পরিক সৌহার্দ্যপূর্ণ আলোচনাকে অগ্রাধিকার দেওয়া হবে। যদি কোনো বিবাদ আদালতে উপস্থাপিত হয়, তবে ভারতের পশ্চিমবঙ্গ রাজ্যের কলকাতা আদালতের একচ্ছত্র এখতিয়ার বলবৎ থাকবে।'
        ]
      },
      {
        id: 'official-contacts',
        headingBn: '৪. প্রাতিষ্ঠানিক যোগাযোগের ঠিকানা',
        headingEn: '4. Institutional Contact Coordinates',
        paragraphsBn: [
          'অফিসিয়াল আইনি যোগাযোগ: joydas.21071997@gmail.com',
          'ঠিকানা: কলকাতা, পশ্চিমবঙ্গ, ভারত — ৭০০০০১',
          'সাপোর্ট পোর্টাল: অ্যাপের "যোগাযোগ ও সহায়তা" সেকশনের মাধ্যমে সার্বক্ষণিক ইনবক্স টিকিটিং সুবিধা।'
        ]
      }
    ]
  },
  'contact': {
    slug: 'contact',
    titleBn: 'যোগাযোগ ও সহায়তা',
    titleEn: 'Contact Us & Support',
    categoryBn: 'সরাসরি সহায়তা ও ইনবক্স',
    shortDescBn: 'টিম গপ্পো কাহিনী ও জয়-এর সাথে সরাসরি যোগাযোগ, অভিযোগ ও দ্রুত ফিডব্যাক পাওয়ার ঠিকানা।',
    shortDescEn: 'Reach out directly to founder Joy and the team for assistance and inquiries.',
    lastUpdatedBn: '১ সেপ্টেম্বর ২০২৬',
    lastUpdatedEn: 'September 1, 2026',
    iconName: 'Mail',
    complianceBadgeBn: '২৪ ঘণ্টার মধ্যে দ্রুত সাড়া দেওয়ার নিশ্চয়তা',
    complianceBadgeEn: '24-Hour Acknowledgment SLA',
    sections: [
      {
        id: 'direct-touch',
        headingBn: 'সরাসরি যোগাযোগ মাধ্যম',
        headingEn: 'Direct Contact Channels',
        paragraphsBn: [
          'গপ্পো কাহিনীর প্রতিটি শ্রোতার ভালোবাসা ও মতামত আমাদের অনুপ্রেরণা। আপনার যেকোনো প্রশ্ন, পাস সক্রিয়করণে সহায়তা, নতুন গল্পের অনুরোধ বা পরামর্শ জানাতে নিচের ফর্মটি ব্যবহার করুন অথবা সরাসরি ইমেইল করুন।'
        ]
      }
    ]
  }
};
