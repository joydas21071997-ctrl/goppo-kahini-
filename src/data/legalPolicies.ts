export type LegalPolicySlug =
  | 'privacy-policy'
  | 'terms'
  | 'refund-policy'
  | 'data-deletion';

export interface LegalPolicySection {
  id: string;
  heading: string;
  headingBn?: string;
  paragraphs: string[];
  bulletPoints?: string[];
}

export interface LegalPolicyDoc {
  slug: LegalPolicySlug;
  titleEn: string;
  titleBn: string;
  categoryEn: string;
  categoryBn: string;
  shortDescEn: string;
  shortDescBn: string;
  lastUpdatedEn: string;
  lastUpdatedBn: string;
  iconName: string;
  complianceBadgeEn: string;
  complianceBadgeBn: string;
  sections: LegalPolicySection[];
}

/**
 * Mapping of legacy, alias, and deprecated policy routes to the 4 final canonical policies.
 */
export const OLD_POLICY_REDIRECTS: Record<string, LegalPolicySlug> = {
  // Privacy Policy aliases & legacy routes
  'privacy': 'privacy-policy',
  'privacy-policy': 'privacy-policy',
  'dpdp': 'privacy-policy',
  'grievance': 'privacy-policy',
  'grievance-officer': 'privacy-policy',
  'nodal-officer': 'privacy-policy',
  'complaint': 'privacy-policy',
  'third-party-services': 'privacy-policy',
  'third-party': 'privacy-policy',
  'partners': 'privacy-policy',
  'app-permissions': 'privacy-policy',
  'permissions': 'privacy-policy',
  'app-permission': 'privacy-policy',
  'contact': 'privacy-policy',
  'contact-us': 'privacy-policy',
  'support': 'privacy-policy',
  'help': 'privacy-policy',

  // Terms & Conditions aliases & legacy routes
  'terms': 'terms',
  'terms-and-conditions': 'terms',
  'tos': 'terms',
  'subscription-terms': 'terms',
  'subscription': 'terms',
  'pricing-terms': 'terms',
  'pass-terms': 'terms',
  'community-guidelines': 'terms',
  'guidelines': 'terms',
  'community': 'terms',
  'rules': 'terms',
  'copyright-policy': 'terms',
  'copyright': 'terms',
  'dmca': 'terms',
  'ipr': 'terms',
  'disclaimer': 'terms',
  'disclaimers': 'terms',
  'legal-info': 'terms',
  'legal': 'terms',
  'about-legal': 'terms',
  'legal-notice': 'terms',

  // Refund Policy aliases
  'refund': 'refund-policy',
  'refund-policy': 'refund-policy',
  'cancellation': 'refund-policy',

  // Account & Data Deletion aliases
  'data-deletion': 'data-deletion',
  'delete-account': 'data-deletion',
  'data-delete': 'data-deletion',
  'account-deletion': 'data-deletion',
};

export const LEGAL_POLICIES_DATA: Record<LegalPolicySlug, LegalPolicyDoc> = {
  // =========================================================================
  // 1. PRIVACY POLICY
  // =========================================================================
  'privacy-policy': {
    slug: 'privacy-policy',
    titleEn: 'Privacy Policy',
    titleBn: 'গোপনীয়তা নীতি',
    categoryEn: 'Data Protection & Statutory Rights',
    categoryBn: 'ডেটা সুরক্ষা ও আইনি অধিকার',
    shortDescEn: 'Comprehensive data protection practices compliant with the Digital Personal Data Protection Act, 2023 (DPDP Act) and Information Technology Act, 2000.',
    shortDescBn: 'ভারতের ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা আইন (DPDP Act, 2023) ও তথ্যপ্রযুক্তি আইন অনুযায়ী ডেটা সুরক্ষার অঙ্গীকার।',
    lastUpdatedEn: 'October 1, 2026',
    lastUpdatedBn: '১ অক্টোবর ২০২৬',
    iconName: 'Shield',
    complianceBadgeEn: 'DPDP Act 2023 & IT Act 2000 Compliant',
    complianceBadgeBn: 'DPDP Act 2023 ও IT Act 2000 মান্যতা',
    sections: [
      {
        id: 'statutory-framework',
        heading: '1. Introduction & Statutory Framework',
        headingBn: '১. ভূমিকা ও আইনি ভিত্তি',
        paragraphs: [
          'Goppo Kahini ("we", "our", or "the Platform") is an independent Indian digital audio platform dedicated to traditional Bengali audio dramas, suspense thrillers, foley soundscapes, and documentary life-stories podcasts. Goppo Kahini is founded, owned, and operated by Joy (Sole Proprietor & Lead Developer), based in Kolkata, West Bengal, India.',
          'Protecting your personal data, listener autonomy, and digital privacy is our paramount responsibility. This Privacy Policy is formulated in strict accordance with the Digital Personal Data Protection Act, 2023 ("DPDP Act 2023"), the Information Technology Act, 2000 ("IT Act 2000"), and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 ("SPDI Rules 2011").',
          'By accessing, registering on, or using the Goppo Kahini application across web and mobile platforms, you acknowledge and consent to the data collection, processing, and protection practices detailed herein. If you do not agree with this policy, please refrain from using the platform.'
        ]
      },
      {
        id: 'data-collection',
        heading: '2. Information We Collect (Data Minimisation)',
        headingBn: '২. আমরা যেসব তথ্য সংগ্রহ করি (ডেটা মিনিমাইজেশন)',
        paragraphs: [
          'Under the statutory principle of Data Minimisation enshrined in the DPDP Act 2023, we collect only the personal information strictly necessary to provide seamless audio streaming, authenticate user accounts, and maintain platform security:'
        ],
        bulletPoints: [
          'Account & Profile Credentials: When you sign up via Google OAuth or email registration, we collect your name, email address, profile picture (if provided by Google), and system-generated Firebase Authentication User Identifier (UID). We do not store plain-text passwords; authentication credentials are securely managed and hashed by Google Firebase Authentication.',
          'Transaction & Pass Verification Records: When you activate an Access Pass (such as the 28-Day Access Pass for ₹20 in India or ৳25 in Bangladesh), we collect user-submitted verification details, including the bank transaction reference number (UPI UTR / Reference ID), payment timestamp, sender mobile number or email, and optional payment receipt screenshots. We never collect, process, or store your debit/credit card numbers, CVVs, net banking passwords, or UPI MPINs.',
          'Listener Preferences & Playback State: To deliver a personalized and continuous listening experience, our database records your bookmarked stories, listening history, audio playback progress timestamps, player volume settings, and ambient sound mixer configurations.',
          'User Reviews & Interactions: Star ratings, written reviews, and comments submitted by you under audio stories or podcast episodes are stored and associated with your account display name.',
          'Communications & Support Inquiries: Contact inquiries, listener feedback, narrator audition voice submissions, and true-life story contributions submitted via in-app forms or official support channels.',
          'Device & Technical Metadata: For security and regional pass pricing (detecting INR vs. BDT availability), we process basic technical attributes including IP address, browser type, operating system, and Firebase Cloud Messaging (FCM) push notification device registration tokens (collected strictly with your explicit browser/device permission).'
        ]
      },
      {
        id: 'purpose-limitation',
        heading: '3. Purpose of Processing & Data Usage',
        headingBn: '৩. তথ্যের ব্যবহার ও উদ্দেশ্য সীমাবদ্ধতা',
        paragraphs: [
          'In alignment with the Purpose Limitation principle, your personal information is utilized exclusively for legitimate, defined, and transparent purposes:'
        ],
        bulletPoints: [
          'Delivering high-fidelity Bengali audio dramas, background ambient soundscapes, and life-story podcasts without disruption.',
          'Verifying payment transactions, preventing fraudulent or fabricated UTR submissions, and unlocking 28-Day Access Pass privileges on your account.',
          'Dispatching permission-based push notifications via FCM for new story releases, episode continuations, and critical account notices (opt-out available anytime).',
          'Providing responsive customer support, resolving technical bugs, and processing legitimate refund inquiries.',
          'Safeguarding cloud infrastructure against automated scrapers, stream ripping, unauthorized access, and malicious cyber attacks.',
          'Complying with statutory audits, financial accounting obligations, and legal directives issued under Indian law.'
        ]
      },
      {
        id: 'third-party-infrastructure',
        heading: '4. Third-Party Service Providers & Zero-Sale Commitment',
        headingBn: '৪. তৃতীয় পক্ষের সহযোগী ও ডেটা সুরক্ষা',
        paragraphs: [
          'To ensure enterprise-grade reliability and security, Goppo Kahini utilizes technical infrastructure provided by globally recognized, certified cloud and payment partners. We strictly maintain a Zero-Sale policy: we never sell, lease, monetize, or trade user personal information to commercial data brokers, advertising networks, or third-party marketers.',
          'Our enterprise technical partners include:'
        ],
        bulletPoints: [
          'Google Cloud & Firebase (Google LLC): We utilize Firebase Authentication for secure identity management, Cloud Firestore for encrypted real-time document storage (user profiles, bookmarks, reviews, listening history), Firebase Cloud Storage for high-speed audio media and artwork hosting, and Firebase Cloud Messaging (FCM) for push notifications.',
          'NPCI & Banking UPI Ecosystem: Pass transactions in India are completed peer-to-peer or peer-to-merchant via National Payments Corporation of India (NPCI) authorized UPI applications (Google Pay, PhonePe, Paytm, BHIM, Cred). Banking transactions are conducted entirely within the user\'s trusted banking application; Goppo Kahini acts solely as a verification recipient of the bank-issued transaction reference ID (UTR).'
        ]
      },
      {
        id: 'app-permissions',
        heading: '5. Device Permissions & Local Storage Usage',
        headingBn: '৫. ডিভাইস পারমিশন ও লোকাল স্টোরেজ',
        paragraphs: [
          'Goppo Kahini follows the Principle of Minimal Privileges. The web and mobile app does not access your camera, contact list, device location sensors, SMS inbox, or external file storage without cause.'
        ],
        bulletPoints: [
          'Media Session & Background Playback: We utilize standard browser Media Session APIs to enable continuous audio playback when your device screen is locked or the application is minimized, providing lock-screen play/pause controls.',
          'Browser Local Storage: We store non-sensitive local client preferences, including your UI theme mode (e.g. purple-light, calm-green, dark), volume slider level, selected ambient sound mixer volumes, and active audio player drawer states.',
          'Microphone Access (Strictly Optional): The browser will only request microphone access if you voluntarily choose to record a voice audition for narrator consideration or record a story excerpt for "Manusher Jibon Kotha". Microphone access is never initiated without prior user click and consent, and permission can be revoked at any time via your browser or device site settings.'
        ]
      },
      {
        id: 'data-security',
        heading: '6. Data Security Standards',
        headingBn: '৬. তথ্য নিরাপত্তা ও এনক্রিপশন',
        paragraphs: [
          'Your personal data is safeguarded utilizing multi-tiered security measures. All communications between your client device and our servers are encrypted in transit using industry-standard Transport Layer Security (TLS/SSL with modern cipher suites). Data stored within Google Cloud Firebase facilities is encrypted at rest using AES-256 encryption.',
          'Database access is governed by strictly audited Cloud Firestore Security Rules, ensuring that users can only read and modify their own private records (such as personal bookmarks and listening history), while administrative interfaces require cryptographic administrative role verification.',
          'Realistic Security Notice: While we implement industry-standard administrative, technical, and physical safeguards, no digital transmission across the Internet or cloud storage architecture can be guaranteed to be 100% invulnerable. We continually audit our configurations to prevent unauthorized access or disclosure.'
        ]
      },
      {
        id: 'retention-erasure',
        heading: '7. Data Retention & Account Deletion',
        headingBn: '৭. ডেটা সংরক্ষণ ও স্থায়ী অপসারণ',
        paragraphs: [
          'Personal data associated with your account is retained only for as long as your account remains active and registered on the platform.',
          'When an account is deleted—either through the in-app deletion workflow (Profile / Settings → Account → Delete Account) or via our public deletion page (https://goppokahini.in/delete-account)—all personal identifiers, authentication credentials, bookmarks, listening history, user reviews, and FCM push tokens are permanently expunged from active production databases.',
          'Statutory Retention Exceptions: In compliance with Indian tax legislation (such as the Income Tax Act, 1961) and anti-money laundering frameworks (PMLA), anonymized transaction reference records (such as bank UTR numbers, payment amounts, and transaction dates) may be retained in financial accounting archives strictly for mandatory audit compliance. These audit logs do not contain personal profile data. Automated system backups rotate and overwrite on regular schedules.'
        ]
      },
      {
        id: 'statutory-rights',
        heading: '8. User Privacy Rights Under DPDP Act, 2023',
        headingBn: '৮. ব্যবহারকারীর আইনি অধিকার (DPDP Act, 2023)',
        paragraphs: [
          'Under the Digital Personal Data Protection Act, 2023, every listener on Goppo Kahini is entitled to the following enforceable statutory rights:'
        ],
        bulletPoints: [
          'Right to Access: You have the right to obtain a summary of your personal data processed by Goppo Kahini, including the processing purposes and identities of entities with whom data is shared.',
          'Right to Correction & Updating: You have the right to request correction of inaccurate, misleading, or outdated personal information maintained in your profile.',
          'Right to Erasure (Data Deletion): You have the right to request the complete, unconditional erasure of your account and associated personal data from our platform.',
          'Right to Grievance Redressal: You have the right to readily accessible grievance redressal mechanisms through our designated Grievance Officer.',
          'Right to Nominate: In the event of death or incapacity, you have the right to nominate any individual to exercise your data rights in accordance with statutory procedures.'
        ]
      },
      {
        id: 'children-privacy',
        heading: '9. Children & Minors',
        headingBn: '৯. অপ্রাপ্তবয়স্কদের ডেটা সুরক্ষা',
        paragraphs: [
          'Goppo Kahini is designed for general audiences and literature enthusiasts. In compliance with Section 9 of the DPDP Act 2023, we do not knowingly track, profile, or conduct behavioral monitoring of children under 18 years of age.',
          'Users under 18 years of age are required to access and use the platform under the active guidance and consent of a parent or legal guardian.'
        ]
      },
      {
        id: 'grievance-redressal',
        heading: '10. Statutory Grievance Redressal & Nodal Officer',
        headingBn: '১০. আইনি অভিযোগ কর্মকর্তা (Grievance Officer)',
        paragraphs: [
          'In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and Section 13 of the DPDP Act 2023, Goppo Kahini has designated an institutional Grievance Officer to resolve user complaints regarding data protection, content, or platform usage:'
        ],
        bulletPoints: [
          'Designated Grievance Officer: Joy',
          'Role: Founder, System Administrator & Nodal Officer, Goppo Kahini',
          'Official Email: joydas.21071997@gmail.com (Subject: "LEGAL GRIEVANCE - GOPPO KAHINI")',
          'Physical Address: Kolkata, West Bengal, India — 700001',
          'Working Hours: Monday through Saturday, 10:00 AM to 8:00 PM IST',
          'Statutory Timelines: We formally acknowledge all received complaints within twenty-four (24) hours and resolve verified grievances within fifteen (15) working days.'
        ]
      },
      {
        id: 'policy-updates',
        heading: '11. Policy Updates & Contact Information',
        headingBn: '১১. নীতিমালা পরিবর্তন ও যোগাযোগের ঠিকানা',
        paragraphs: [
          'We may update this Privacy Policy from time to time to reflect operational modifications, product enhancements, or statutory regulatory developments. The "Last Updated" timestamp at the top of this document indicates the effective date of the latest revisions. Continued use of Goppo Kahini following posted revisions signifies your acceptance.',
          'For any inquiries, legal notices, or feedback regarding our privacy practices, please contact us at joydas.21071997@gmail.com.'
        ]
      }
    ]
  },

  // =========================================================================
  // 2. TERMS & CONDITIONS
  // =========================================================================
  'terms': {
    slug: 'terms',
    titleEn: 'Terms & Conditions',
    titleBn: 'শর্তাবলী ও নিয়মাবলী',
    categoryEn: 'Legal Contract & Terms of Service',
    categoryBn: 'আইনি চুক্তি ও প্ল্যাটফর্মের নিয়মাবলী',
    shortDescEn: 'Binding agreement governing platform access, 28-Day Access Pass model, intellectual property, user conduct, and copyright protections.',
    shortDescBn: 'ভারতীয় চুক্তি আইন (Indian Contract Act, 1872) ও তথ্যপ্রযুক্তি আইন অনুযায়ী প্ল্যাটফর্ম ব্যবহারের নিয়মাবলী।',
    lastUpdatedEn: 'October 1, 2026',
    lastUpdatedBn: '১ অক্টোবর ২০২৬',
    iconName: 'FileText',
    complianceBadgeEn: 'Indian Contract Act 1872 & IT Act 2000',
    complianceBadgeBn: 'Indian Contract Act 1872 মান্যতা',
    sections: [
      {
        id: 'acceptance-eligibility',
        heading: '1. Legal Acceptance & Eligibility',
        headingBn: '১. আইনি স্বীকৃতি ও যোগ্যতা',
        paragraphs: [
          'These Terms & Conditions ("Terms") constitute a legally binding electronic agreement between you ("User", "Listener", or "You") and Goppo Kahini ("Platform", "We", or "Us"), solely founded, owned, and operated by Joy, based in Kolkata, West Bengal, India.',
          'This agreement is formulated pursuant to the Indian Contract Act, 1872, the Information Technology Act, 2000, and the rules and regulations framed thereunder. By browsing, accessing, registering an account, or purchasing an Access Pass on Goppo Kahini, you unconditionally accept and agree to be bound by these Terms. If you do not agree, you must immediately discontinue using the service.',
          'Eligibility: You must be at least 18 years of age or possess legal parental/guardian consent to enter into this contract and use the services provided by Goppo Kahini.'
        ]
      },
      {
        id: 'business-model-access-pass',
        heading: '2. 28-Day Access Pass Business Model & Transparent Pricing',
        headingBn: '২. ২৮ দিনের অ্যাক্সেস পাস মডেল ও মূল্য কাঠামো',
        paragraphs: [
          'Goppo Kahini operates under a transparent, user-first, non-predatory digital access model. We reject confusing recurring subscription traps and hidden charges:',
          'Our Current Approved Regional Access Pricing:',
          '• India: ₹20 Access Pass granting 28 days of full platform access.',
          '• Bangladesh: ৳25 Access Pass granting 28 days of full platform access.',
          'Official Product Classification: The access product is officially designated as the "28-Day Access Pass". It is strictly NOT a recurring monthly subscription and does NOT auto-renew.',
          'RBI Non-Auto-Debit Protection: In strict compliance with digital payment directives issued by the Reserve Bank of India (RBI), Goppo Kahini never configures auto-debit mandates or automatic bank account recurring deductions. Once your 28-day validity expires, access simply ends. You will never be billed automatically. Re-purchasing an Access Pass is entirely voluntary and requires your explicit manual action.',
          'Paid Story Association vs. Active Pass Requirement: Paid story purchases and unlocked story associations remain permanently tied to your user account profile. However, an active 28-Day Access Pass is required to stream and listen to premium content on the platform.',
          'Forever Free Tier: Goppo Kahini maintains an open catalog of free-tier audio dramas and stories that remain permanently free to listen without requiring an Access Pass.'
        ]
      },
      {
        id: 'license-streaming-only',
        heading: '3. Limited Personal License — Online Streaming Only',
        headingBn: '৩. ব্যক্তিগত লাইসেন্স ও অনলাইন স্ট্রিমিং সীমাবদ্ধতা',
        paragraphs: [
          'Online Streaming Only (No Offline Download): Goppo Kahini provides on-demand digital audio streaming over the Internet. The platform does NOT provide offline audio downloads, MP3 file exports, or downloadable media packages.',
          'Limited Personal License: Subject to your compliance with these Terms, Goppo Kahini grants you a limited, non-exclusive, non-transferable, revocable license to stream audio content solely for your personal, domestic, and non-commercial enjoyment.',
          'No Transfer of Ownership: Acquiring an Access Pass confers a temporary listening license only; it does not transfer intellectual property rights, copyright title, or ownership of any audio drama, script, voice recording, music track, or graphic artwork to the user.'
        ]
      },
      {
        id: 'user-conduct-prohibitions',
        heading: '4. User Conduct & Prohibited Activities',
        headingBn: '৪. নিষিদ্ধ কার্যকলাপ ও আইনগত দায়বদ্ধতা',
        paragraphs: [
          'In accordance with Rule 3(1)(b) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, you agree that you shall NOT host, display, upload, modify, publish, transmit, or distribute any content or engage in any action that:'
        ],
        bulletPoints: [
          'Stream Ripping & Piracy: Employs scrapers, crawlers, automated bots, stream rippers, screen recorders, or network interception tools to extract, capture, copy, or download audio files from the platform.',
          'Unauthorized Redistribution: Re-uploads, broadcasts, syndicates, sells, or commercially exploits Goppo Kahini audio dramas on YouTube, Facebook, Spotify, Telegram, podcasts feeds, or public broadcasting systems.',
          'Payment Fraud: Submits counterfeit, manipulated, or fabricated UPI UTR transaction reference numbers or payment slips to falsely claim Access Pass activation. Fraudulent submissions are reported to law enforcement authorities under cybercrime laws.',
          'System Compromise: Interferes with, bypasses, or damages the security, rate-limiting, authentication protocols, or cloud infrastructure of Firebase and Google Cloud.',
          'Harassment & Abuse: Defames, harasses, threatens, stalks, or invades the privacy of any listener, narrator, author, or administrator on the platform.'
        ]
      },
      {
        id: 'community-guidelines',
        heading: '5. Community Guidelines & User-Generated Content',
        headingBn: '৫. কমিউনিটি ও মন্তব্য নীতি (User Content)',
        paragraphs: [
          'Goppo Kahini encourages constructive literary discussions, star ratings, and honest listener reviews. To preserve a safe and civil creative environment under IT Rules 2021, user-generated reviews and comments must adhere to strict community standards:'
        ],
        bulletPoints: [
          'Prohibited Content: Comments must not contain hate speech, communal slurs, sexually explicit or pornographic language, defamation, personal contact details (doxxing), spam, commercial advertisements, or material threatening the sovereignty, unity, and integrity of India.',
          'Administrative Moderation Rights: We reserve the absolute right to screen, moderate, reject, or permanently delete any review, comment, or forum submission that violates these guidelines, and to suspend or terminate offending user accounts without liability.'
        ]
      },
      {
        id: 'copyright-ipr',
        heading: '6. Intellectual Property Rights & Takedown Protocol',
        headingBn: '৬. কপিরাইট ও মেধা-স্বত্ব (Copyright Act, 1957)',
        paragraphs: [
          'Statutory Protection: All audio dramas, vocal narrations, foley background sound effects, customized musical scores, script adaptations, illustrations, logos, visual branding, and application software are protected under the Indian Copyright Act, 1957 and international copyright treaties.',
          'Fair Dealing (Section 52): Statutory fair dealing exemptions recognized under Section 52 of the Copyright Act, 1957—such as bona fide personal study, literary review, or academic quotation—are strictly respected within legal boundaries.',
          'Notice and Takedown Procedure: If you are a copyright owner or authorized agent and believe that content hosted on Goppo Kahini infringes your copyright, please dispatch a formal takedown notice to joydas.21071997@gmail.com containing:',
          '• Full legal name, physical address, and contact coordinates of the copyright holder;',
          '• Title and description of the original copyrighted work and evidence of copyright ownership;',
          '• Specific URL, title, and location of the allegedly infringing material on Goppo Kahini;',
          '• A sworn statement that the notice is made in good faith and that information supplied is accurate under penalty of perjury.',
          'Verified notices will be investigated and acted upon within thirty-six (36) hours in accordance with IT Intermediary Rules.'
        ]
      },
      {
        id: 'disclaimers-advisories',
        heading: '7. Disclaimers, Artistic Dramatization & Audio Health',
        headingBn: '৭. দাবিত্যাগ, সৃষ্টিশীল স্বাধীনতা ও শ্রবণ সতর্কতা',
        paragraphs: [
          'Works of Creative Fiction: Mystery, supernatural, thriller, and horror stories featured on Goppo Kahini are creative works of fiction, folklore, and dramatization protected under Article 19(1)(a) of the Constitution of India (Freedom of Speech and Creative Expression). Any resemblance to real persons, living or dead, or actual events is purely coincidental.',
          'Anti-Superstition Stance: Supernatural folklore and ghost stories are broadcast strictly for dramatic entertainment and cultural folklore appreciation. Goppo Kahini does not promote, validate, or endorse superstition, witchcraft, irrational fear, or unscientific claims.',
          'Manusher Jibon Kotha (Life Stories) Disclosures: Personal memories and autobiographical reflections shared in our documentary life-story podcast series are expressed in the contributors\' own authentic voices. Views expressed belong entirely to the respective speakers and do not necessarily reflect the official opinions of Goppo Kahini.',
          'Hearing Safety Advisory: Our productions incorporate high-dynamic range foley effects, sudden audio peaks, and dramatic bass frequencies. To protect your hearing health, please listen at moderate volume levels and exercise caution when driving or operating machinery.'
        ]
      },
      {
        id: 'service-availability-termination',
        heading: '8. Service Availability, Suspension & Termination',
        headingBn: '৮. পরিষেবা প্রাপ্যতা ও অ্যাকাউন্ট বাতিলকরণ',
        paragraphs: [
          'Goppo Kahini is provided on an "as is" and "as available" basis. We strive to maintain continuous uptime but do not guarantee uninterrupted or error-free service.',
          'We reserve the right to modify, suspend, or discontinue any feature, story, or service tier at any time with or without prior notice.',
          'We reserve the right to suspend, restrict, or terminate any user account immediately and without compensation if the user violates these Terms, attempts payment fraud, engages in piracy, or conducts abusive behavior.',
          'You may terminate your account at any time via the in-app Account Deletion tool or by emailing joydas.21071997@gmail.com.'
        ]
      },
      {
        id: 'governing-law-jurisdiction',
        heading: '9. Governing Law & Exclusive Jurisdiction',
        headingBn: '৯. প্রযোজ্য আইন ও আদালত এখতিয়ার',
        paragraphs: [
          'These Terms, their interpretation, and any disputes or claims arising out of or in connection with them or platform usage shall be governed exclusively by the substantive laws of the Republic of India, without regard to conflict of law principles.',
          'Exclusive Jurisdiction: The competent civil and cyber courts in Kolkata, West Bengal, India, shall have exclusive territorial and subject-matter jurisdiction to resolve all claims, proceedings, or litigation arising from this agreement or platform use.'
        ]
      },
      {
        id: 'contact-details',
        heading: '10. Institutional Contact & Inquiries',
        headingBn: '১০. প্রাতিষ্ঠানিক যোগাযোগের ঠিকানা',
        paragraphs: [
          'Platform Entity: Goppo Kahini (Sole Proprietor: Joy)',
          'Registered Seat: Kolkata, West Bengal, India — 700001',
          'Official Contact Email: joydas.21071997@gmail.com'
        ]
      }
    ]
  },

  // =========================================================================
  // 3. REFUND POLICY
  // =========================================================================
  'refund-policy': {
    slug: 'refund-policy',
    titleEn: 'Refund Policy',
    titleBn: 'রিফান্ড ও বাতিলকরণ নীতি',
    categoryEn: 'Billing & Consumer Rights',
    categoryBn: 'পেমেন্ট ও ভোক্তা সুরক্ষা',
    shortDescEn: 'Clear, transparent refund framework for digital audio access passes compliant with Consumer Protection (E-Commerce) Rules, 2020.',
    shortDescBn: 'ভোক্তা সুরক্ষা (ই-কমার্স) বিধিমালা ২০২০ অনুযায়ী ডিজিটাল সেবার ন্যায্য রিফান্ড ও বাতিল নির্দেশিকা।',
    lastUpdatedEn: 'October 1, 2026',
    lastUpdatedBn: '১ অক্টোবর ২০২৬',
    iconName: 'RefreshCcw',
    complianceBadgeEn: 'Consumer Protection (E-Commerce) Rules 2020',
    complianceBadgeBn: 'Consumer Protection Rules 2020 মান্যতা',
    sections: [
      {
        id: 'digital-content-nature',
        heading: '1. Nature of Digital Streaming Services',
        headingBn: '১. ডিজিটাল স্ট্রিমিং সেবার প্রকৃতি',
        paragraphs: [
          'Goppo Kahini delivers digital audio entertainment via instant online streaming. The 28-Day Access Pass (priced at ₹20 in India and ৳25 in Bangladesh) is an intangible digital service that grants immediate, non-physical access to our premium audio catalog upon payment verification.',
          'Because digital streaming access is delivered immediately and can be consumed in real time, digital access products operate under specialized refund standards as recognized under consumer protection principles.'
        ]
      },
      {
        id: 'general-no-change-of-mind',
        heading: '2. General Rule: No Change-of-Mind Refunds',
        headingBn: '২. সাধারণ নীতি: সিদ্ধান্ত পরিবর্তনের অজুহাতে রিফান্ড প্রযোজ্য নয়',
        paragraphs: [
          'Once a 28-Day Access Pass has been successfully verified, activated on your account, and content has been made available for streaming, refunds are generally not granted merely because a user changes their mind, decides not to listen, or experiences subjective dissatisfaction with particular story storylines, narrator styles, or creative choices.',
          'Digital content access cannot be "returned" once accessed. We encourage users to listen to our extensive catalog of Forever Free stories prior to purchasing an Access Pass.'
        ]
      },
      {
        id: 'eligible-circumstances',
        heading: '3. Legitimate Circumstances Eligible for Refund Review',
        headingBn: '৩. যেসকল ক্ষেত্রে রিফান্ড মঞ্জুর করা হয়',
        paragraphs: [
          'In compliance with the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020, Goppo Kahini promptly reviews and honors refund requests in the following legitimate circumstances:'
        ],
        bulletPoints: [
          'Duplicate or Multiple Transactions: Where banking gateway latency or accidental repeated taps resulted in duplicate charges for the same user account and same access pass period, all duplicate excess payments will be refunded in full.',
          'Payment Completed but Access Not Activated: Where valid payment was debited from your bank account and valid proof (such as a valid UPI UTR reference) was provided, but due to a technical server failure attributable to Goppo Kahini, access was not activated within seventy-two (72) hours, and the user requests cancellation.',
          'Unauthorized or Fraudulent Transactions: Verified unauthorized transactions that occurred without the account holder\'s authorization, supported by official banking fraud documentation.',
          'Severe & Prolonged Service Outage: Significant technical failure attributable solely to our cloud infrastructure preventing audio streaming for an extended period, where our support team cannot rectify the failure within a reasonable timeframe.',
          'Mandatory Statutory Compliance: Where refund is explicitly mandated by applicable statutory law or judicial order.'
        ]
      },
      {
        id: 'ineligible-scenarios',
        heading: '4. Non-Eligible Refund Scenarios',
        headingBn: '৪. যেসকল ক্ষেত্রে রিফান্ড প্রযোজ্য নয়',
        paragraphs: [
          'Refund claims will not be approved in the following cases:'
        ],
        bulletPoints: [
          'The 28-Day Access Pass was activated correctly and audio stories were streamed during the validity window.',
          'Local user-side technical deficiencies, including poor internet bandwidth, faulty headphones/speakers, or unsupported legacy browsers.',
          'Accounts suspended or banned due to piracy, abusive comments, harassment, or violation of our Terms & Conditions.',
          'Submissions involving forged, altered, or fabricated UPI UTR numbers.',
          'Refund claims submitted more than seven (7) days after the transaction date.'
        ]
      },
      {
        id: 'refund-request-process',
        heading: '5. Refund Claim Submission Process',
        headingBn: '৫. রিফান্ডের আবেদন দাখিল প্রক্রিয়া',
        paragraphs: [
          'To submit a legitimate refund claim, send an email to joydas.21071997@gmail.com within seven (7) calendar days of the transaction. Your email must include:'
        ],
        bulletPoints: [
          'Subject Line: "REFUND REQUEST - [Your Registered Email or Phone]"',
          'Registered account name, email address, and mobile number;',
          'Exact date, time, and payment amount (₹20 or ৳25);',
          'Bank / UPI Transaction Reference Number (UTR ID);',
          'A clear explanation of the issue (accompanied by banking debit proof or error screenshots where applicable).'
        ]
      },
      {
        id: 'timelines-payout',
        heading: '6. Verification & Payout Timelines',
        headingBn: '৬. যাচাই ও অর্থ স্থানান্তরের সময়সীমা',
        paragraphs: [
          'Upon receipt of your refund claim, our administration will cross-reference the submitted UTR against our banking settlement records within forty-eight (48) hours.',
          'Once a refund is approved, the funds are initiated immediately back to the original source bank account or UPI VPA from which the payment originated. Actual credit turnaround time depends on the banking network, NPCI clearing switches, and the policies of your issuing bank. Goppo Kahini does not charge any processing or administrative cancellation fees on approved refunds.'
        ]
      },
      {
        id: 'mobile-app-store-billing',
        heading: '7. Mobile App Store Billing (Google Play)',
        headingBn: '৭. মোবাইল অ্যাপ স্টোর ও গুগল প্লে বিলিং',
        paragraphs: [
          'Where Goppo Kahini is downloaded via official app stores (such as Google Play) and an in-app purchase is processed through Google Play Billing rather than direct UPI:',
          'The transaction is governed by the applicable Google Play Terms of Service and Google Play Refund Policies. In such cases, refund requests must be initiated directly through the user\'s Google Play Account Order History.'
        ]
      },
      {
        id: 'payment-support-contact',
        heading: '8. Payment Support Contact',
        headingBn: '৮. পেমেন্ট সহায়তা ও যোগাযোগ',
        paragraphs: [
          'For any assistance regarding pass activation, billing questions, or refund inquiries, please email joydas.21071997@gmail.com.'
        ]
      }
    ]
  },

  // =========================================================================
  // 4. ACCOUNT & DATA DELETION
  // =========================================================================
  'data-deletion': {
    slug: 'data-deletion',
    titleEn: 'Account & Data Deletion',
    titleBn: 'অ্যাকাউন্ট ও ডেটা অপসারণ নীতি',
    categoryEn: 'User Data Autonomy & Right to Erasure',
    categoryBn: 'ব্যবহারকারীর ডেটা স্বাধীনতা ও অপসারণ অধিকার',
    shortDescEn: 'Clear instructions and statutory right to permanently erase your Goppo Kahini account and personal data under DPDP Act 2023 Section 12.',
    shortDescBn: 'DPDP Act 2023 এর সেকশন ১২ অনুযায়ী অ্যাকাউন্ট ও ব্যক্তিগত তথ্য সম্পূর্ণ মুছে ফেলার স্বয়ংসম্পূর্ণ নিয়মাবলী।',
    lastUpdatedEn: 'October 1, 2026',
    lastUpdatedBn: '১ অক্টোবর ২০২৬',
    iconName: 'Trash2',
    complianceBadgeEn: 'DPDP Act Sec 12 Right to Erasure',
    complianceBadgeBn: 'DPDP Act ধারা ১২ ডেটা অপসারণ অধিকার',
    sections: [
      {
        id: 'statutory-right-erasure',
        heading: '1. Statutory Right to Erasure (DPDP Act, 2023)',
        headingBn: '১. ডেটা মুছে ফেলার আইনি অধিকার (Right to Erasure)',
        paragraphs: [
          'Under Section 12 of the Digital Personal Data Protection Act, 2023 ("DPDP Act 2023"), every user possesses the fundamental legal right to request the permanent erasure of their personal data and user account.',
          'Goppo Kahini is committed to complete user data freedom. You are never locked into our service. Whenever you choose to leave, you can permanently delete your account, authentication credentials, and personal history with absolute ease and without incurring penalties.'
        ]
      },
      {
        id: 'in-app-deletion-path',
        heading: '2. In-App Deletion Workflow (Instant & Self-Service)',
        headingBn: '২. অ্যাপের ভেতরের সহজ ডিলিট পদ্ধতি (In-App Path)',
        paragraphs: [
          'Authenticated users can initiate instantaneous self-service account deletion directly inside the Goppo Kahini application:',
          'Step-by-Step In-App Deletion Path:',
          '1. Log in to your Goppo Kahini account on web or mobile.',
          '2. Tap the Profile / Account icon in the navigation bar to open the User Account modal.',
          '3. Navigate to the Account Details tab.',
          '4. Scroll to the "Delete Account" (অ্যাকাউন্ট স্থায়ীভাবে মুছুন) action button.',
          '5. Review the warning prompt and confirm your request.',
          'Security Safeguard: Deletion is cryptographically tied to the authenticated user\'s own active session via Firebase Authentication. We do not provide unauthenticated or arbitrary UID deletion mechanisms that could endanger user accounts.'
        ]
      },
      {
        id: 'public-deletion-page',
        heading: '3. Public Deletion Page & Direct Email Support',
        headingBn: '৩. পাবলিক ডিলিট পেজ ও ইমেইল সহায়তা',
        paragraphs: [
          'Public Deletion URL: To comply with public web standards and mobile app store developer policies (including Google Play Account Deletion guidelines), this policy and self-service deletion guidance is publicly accessible at:',
          'https://goppokahini.in/delete-account (also accessible via https://goppokahini.in/data-deletion)',
          'Direct Email Deletion Channel: If you cannot access your account, have lost login credentials, or prefer manual assistance, you may send an email request from your registered email address to joydas.21071997@gmail.com with the subject line "Account Deletion Request".',
          'Upon identity verification, our administrators will permanently process the deletion of your account and dispatch a formal confirmation within thirty (30) days as required under statutory regulations.'
        ]
      },
      {
        id: 'data-deleted-scope',
        heading: '4. What Personal Data is Permanently Deleted',
        headingBn: '৪. অ্যাকাউন্ট মোছার পর কী কী স্থায়ীভাবে অপসারিত হয়',
        paragraphs: [
          'Upon completion of the deletion process, the following personal records are permanently and irretrievably expunged from our production databases:'
        ],
        bulletPoints: [
          'Firebase Authentication Identity: Your Google OAuth link, registered email address, authentication credentials, and user UID.',
          'User Profile Metadata: Display name, telephone number, user bio, profile photo references, and account creation timestamps stored in Cloud Firestore.',
          'Personal Library & Listening History: All bookmarked audio stories, favorite lists, listening progress timestamps, and personalized audio settings.',
          'User Reviews & Star Ratings: All comments, written feedback, and rating submissions authored under your user identity.',
          'Push Notification Device Tokens: FCM device registration tokens associated with your account are immediately deregistered and purged.',
          'Direct Support Message Threads: User-submitted contact tickets and support correspondence linked to your user identity.'
        ]
      },
      {
        id: 'data-not-deleted',
        heading: '5. What Data is NOT Deleted (Platform & Public Content)',
        headingBn: '৫. যেসকল কনটেন্ট প্ল্যাটফর্মে বহাল থাকবে',
        paragraphs: [
          'To protect platform integrity, literary creators, and community rights, the following non-personal and platform assets are NOT deleted:'
        ],
        bulletPoints: [
          'Public Stories & Audio Episodes: Original stories, narrator voice tracks, scripts, and audio dramatizations published by Goppo Kahini or official creators.',
          'Administrative Records & Master Catalog: Public platform catalog data, genre tags, and administrative logs.',
          'Other Users\' Data: Data belonging to other independent listeners and creators on the platform.'
        ]
      },
      {
        id: 'retention-exceptions',
        heading: '6. Legitimate & Statutory Audit Retention Exceptions',
        headingBn: '৬. আইনি বাধ্যবাধকতায় সংরক্ষিত তথ্য (ব্যতিক্রম)',
        paragraphs: [
          'In strict compliance with statutory legislation in India—including the Income Tax Act, 1961, Goods and Services Tax (GST) accounting rules, and the Prevention of Money Laundering Act, 2002 (PMLA):',
          '• Anonymized Financial Ledgers: Records of financial transactions (such as bank UPI UTR reference codes, payment timestamps, and transaction amounts) are maintained in historical financial ledgers strictly for mandatory statutory audits, tax filing, and anti-fraud verification. These audit records do not retain user profile links or browsing activity.',
          '• Disaster Recovery Backups: Routine system backups stored in secure, encrypted archives cannot be altered selectively. Data residing in backup archives rotates off and is permanently overwritten according to regular automated retention lifecycles.',
          'We do not claim that every backup archive record disappears instantaneously; automated backup overwrite cycles purge residual data systematically.'
        ]
      },
      {
        id: 'contact-officer',
        heading: '7. Data Protection & Deletion Contact',
        headingBn: '৭. ডেটা সুরক্ষা যোগাযোগ',
        paragraphs: [
          'If you have questions regarding account deletion, data portability, or your rights under the DPDP Act 2023, please reach out directly to:',
          'Joy (Data Protection & Grievance Officer, Goppo Kahini)',
          'Official Email: joydas.21071997@gmail.com',
          'Address: Kolkata, West Bengal, India — 700001'
        ]
      }
    ]
  }
};
