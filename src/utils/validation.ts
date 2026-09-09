/**
 * Strict Anti-Fraud and Real User Data Validation Engine
 * Protects Goppo Kahini from fake emails, temporary mailboxes, dummy names, fake numbers, and weak passwords.
 */

// Known temporary, disposable, or bot email provider domains
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'mailinator.com',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'sharklasers.com',
  'trashmail.com',
  'trashmail.net',
  'getairmail.com',
  'dispostable.com',
  'maildrop.cc',
  'mytemp.email',
  'inboxkitten.com',
  'crazymailing.com',
  'fakemailgenerator.com',
  'emailondeck.com',
  'burnermail.io',
  'mohmal.com',
  'nada.ltd',
  'getnada.com',
  'dropmail.me',
  'minuteinbox.com',
  'tempail.com',
  'generator.email',
  'mailsac.com',
  'harakirimail.com',
  'byom.de',
  'discard.email',
  'spamgourmet.com',
  'mytrashmail.com',
  'tempm.com',
  'fakemail.net',
  'mailcatch.com',
  'jetable.org',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'einrot.com',
  'test.com',
  'example.com',
  'fake.com',
  'dummy.com',
  'sample.com',
  'xyz.com',
  'abc.com',
  'asdf.com',
  'qwerty.com',
  'noemail.com',
]);

// Dummy username prefixes to reject
const BANNED_EMAIL_PREFIXES = new Set([
  'test',
  'fake',
  'dummy',
  'asdf',
  'qwert',
  'qwerty',
  'admin',
  'administrator',
  'user',
  'user123',
  'demo',
  'sample',
  'temp',
  'none',
  'abc',
  'xyz',
  'null',
  'undefined',
  '123456',
  '12345678',
]);

// Common fake dummy phone patterns
const BANNED_PHONE_PATTERNS = new Set([
  '0000000000',
  '1111111111',
  '2222222222',
  '3333333333',
  '4444444444',
  '5555555555',
  '6666666666',
  '7777777777',
  '8888888888',
  '9999999999',
  '1234567890',
  '0987654321',
  '9876543210',
  '0123456789',
  '9898989898',
  '9988776655',
  '9123456789',
  '01700000000',
  '01711111111',
  '01800000000',
  '01900000000',
  '01712345678',
  '01812345678',
  '01912345678',
]);

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validate real human name
 * Accepts Bengali and English letters, rejects repetitive or gibberish patterns.
 */
export function validateRealName(name: string): ValidationResult {
  const clean = name.trim();

  if (!clean || clean.length < 3) {
    return {
      isValid: false,
      errorMessage: 'অনুগ্রহ করে আপনার সম্পূর্ণ ও আসল নাম লিখুন (কমপক্ষে ৩টি অক্ষর)।',
    };
  }

  if (clean.length > 50) {
    return {
      isValid: false,
      errorMessage: 'নামটি অতিরিক্ত দীর্ঘ। অনুগ্রহ করে সঠিক নাম লিখুন।',
    };
  }

  // Must contain Bengali or English letters
  const hasLetters = /[\u0980-\u09FFA-Za-z]/.test(clean);
  if (!hasLetters) {
    return {
      isValid: false,
      errorMessage: 'নামে অবশ্যই বাংলা বা ইংরেজি বর্ণ থাকতে হবে। শুধুমাত্র সংখ্যা বা প্রতীক গ্রহণযোগ্য নয়।',
    };
  }

  // Reject all numbers or symbols
  if (/^[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?\s]+$/.test(clean)) {
    return {
      isValid: false,
      errorMessage: 'নামে শুধুমাত্র সংখ্যা বা চিহ্ন গ্রহণযোগ্য নয়।',
    };
  }

  // Check 3+ consecutive identical characters (e.g. "aaaa", "1111")
  if (/(.)\1{2,}/i.test(clean)) {
    return {
      isValid: false,
      errorMessage: 'নামে পরপর একই অক্ষরের পুনরাবৃত্তি করা যাবে না। অনুগ্রহ করে আপনার আসল নাম লিখুন।',
    };
  }

  // Check banned keywords
  const lower = clean.toLowerCase();
  const bannedKeywords = [
    'test',
    'fake',
    'asdf',
    'qwerty',
    'qwert',
    'dummy',
    'admin',
    'administrator',
    'anonymous',
    'unknown',
    'nobody',
    'none',
    'demo',
    'sample',
    'robot',
    'bot',
  ];
  for (const banned of bannedKeywords) {
    if (lower === banned || lower.startsWith(`${banned} `) || lower.endsWith(` ${banned}`)) {
      return {
        isValid: false,
        errorMessage: 'কাল্পনিক বা ছদ্মনাম গ্রহণযোগ্য নয়। অনুগ্রহ করে আপনার আসল নাম ব্যবহার করুন।',
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate authentic email address
 * Rejects temporary, disposable, or obvious dummy emails.
 */
export function validateRealEmail(email: string): ValidationResult {
  const clean = email.trim().toLowerCase();

  if (!clean) {
    return {
      isValid: false,
      errorMessage: 'অনুগ্রহ করে একটি সক্রিয় ইমেইল আইডি প্রদান করুন।',
    };
  }

  // Standard email format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return {
      isValid: false,
      errorMessage: 'ইমেইলের বিন্যাস সঠিক নয় (উদা: yourname@gmail.com)।',
    };
  }

  const [username, domain] = clean.split('@');
  if (!username || !domain) {
    return {
      isValid: false,
      errorMessage: 'সঠিক ইমেইল আইডি দিন।',
    };
  }

  // Reject disposable email domains
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      errorMessage: 'কোনো অস্থায়ী বা ফেক ইমেইল সার্ভিস গ্রহণযোগ্য নয়। অনুগ্রহ করে আসল জিমেইল বা পার্সোনাল ইমেইল ব্যবহার করুন।',
    };
  }

  // Reject dummy prefixes (e.g. test@gmail.com, fake@gmail.com)
  if (BANNED_EMAIL_PREFIXES.has(username)) {
    return {
      isValid: false,
      errorMessage: 'এটি একটি টেস্ট বা ফেক ইমেইল মনে হচ্ছে। অনুগ্রহ করে আপনার আসল ইমেইল আইডি দিন।',
    };
  }

  // Reject username with 4+ consecutive identical characters (e.g. aaaa@gmail.com)
  if (/(.)\1{3,}/.test(username)) {
    return {
      isValid: false,
      errorMessage: 'ইমেইলে অপ্রয়োজনীয় অক্ষরের পুনরাবৃত্তি রয়েছে। অনুগ্রহ করে আসল ইমেইল আইডি দিন।',
    };
  }

  // Must have a valid TLD length >= 2
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2 || /^[0-9]+$/.test(tld)) {
    return {
      isValid: false,
      errorMessage: 'ইমেইল ডোমেইনটি সঠিক নয়।',
    };
  }

  return { isValid: true };
}

/**
 * Validate real, active mobile phone number globally (All countries worldwide)
 * Complies with International Telecommunication Union (ITU E.164) standard.
 * Accepts numbers from 7 to 15 digits worldwide while strictly blocking dummy/fake numbers.
 */
export function validateRealPhone(phone: string): ValidationResult {
  const raw = phone.trim();

  if (!raw) {
    return {
      isValid: false,
      errorMessage: 'অনুগ্রহ করে আপনার সক্রিয় মোবাইল নম্বরটি প্রদান করুন।',
    };
  }

  // Remove spaces, hyphens, plus, parentheses
  const digits = raw.replace(/[\s\-()+]/g, '');

  if (!/^\d+$/.test(digits)) {
    return {
      isValid: false,
      errorMessage: 'মোবাইল নম্বরে শুধুমাত্র সংখ্যা ব্যবহার করুন।',
    };
  }

  // Global length check (International standard: 7 to 15 digits)
  if (digits.length < 7 || digits.length > 15) {
    return {
      isValid: false,
      errorMessage: 'আন্তর্জাতিক মানদণ্ড অনুযায়ী সঠিক মোবাইল নম্বর দিন (৭ থেকে ১৫ অঙ্ক)।',
    };
  }

  // Reject banned dummy patterns
  if (BANNED_PHONE_PATTERNS.has(digits) || BANNED_PHONE_PATTERNS.has(digits.slice(-10))) {
    return {
      isValid: false,
      errorMessage: 'এটি একটি ফেক বা ক্রমিক মোবাইল নম্বর। অনুগ্রহ করে আপনার আসল মোবাইল নম্বর প্রদান করুন।',
    };
  }

  // Check 5+ consecutive identical digits (e.g. 999999xxxx or 000000)
  if (/(\d)\1{4,}/.test(digits)) {
    return {
      isValid: false,
      errorMessage: 'মোবাইল নম্বরে অস্বাভাবিক সংখ্যার পুনরাবৃত্তি পাওয়া গেছে। আসল নম্বর দিন।',
    };
  }

  // Reject numbers that are all identical or simple sequence
  const uniqueDigits = new Set(digits.split(''));
  if (uniqueDigits.size <= 2 && digits.length >= 8) {
    return {
      isValid: false,
      errorMessage: 'এটি কোনো বৈধ মোবাইল নম্বর নয়। আপনার আসল মোবাইল নম্বর দিন।',
    };
  }

  return { isValid: true };
}

/**
 * Validate strong password
 * Minimum 8 characters, must contain at least 1 letter and 1 number.
 * Rejects obvious/sequential weak passwords.
 */
export function validateStrongPassword(password: string): ValidationResult {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      errorMessage: 'নিরাপত্তার স্বার্থে পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।',
    };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return {
      isValid: false,
      errorMessage: 'পাসওয়ার্ডে অন্তত একটি ইংরেজি অক্ষর (a-z বা A-Z) থাকতে হবে।',
    };
  }

  if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return {
      isValid: false,
      errorMessage: 'পাসওয়ার্ডে অন্তত একটি সংখ্যা (০-৯) বা বিশেষ চিহ্ন থাকতে হবে।',
    };
  }

  const weakPasswords = [
    '12345678',
    '123456789',
    '1234567890',
    'password',
    'password123',
    'qwertyui',
    'asdfghjk',
    '11111111',
    '00000000',
    'admin123',
  ];

  if (weakPasswords.includes(password.toLowerCase())) {
    return {
      isValid: false,
      errorMessage: 'এই পাসওয়ার্ডটি অত্যন্ত দুর্বল ও অনুমেয়। একটি জটিল ও নিরাপদ পাসওয়ার্ড দিন।',
    };
  }

  return { isValid: true };
}
