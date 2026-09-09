export interface CountryCode {
  code: string; // e.g. "+91"
  name: string; // Country Name
  bengaliName: string;
  flag: string;
  minDigits: number;
  maxDigits: number;
}

export const WORLD_COUNTRY_CODES: CountryCode[] = [
  { code: '+91', name: 'India', bengaliName: 'ভারত (+91)', flag: '🇮🇳', minDigits: 10, maxDigits: 10 },
  { code: '+880', name: 'Bangladesh', bengaliName: 'বাংলাদেশ (+880)', flag: '🇧🇩', minDigits: 10, maxDigits: 11 },
  { code: '+1', name: 'United States & Canada', bengaliName: 'যুক্তরাষ্ট্র ও কানাডা (+1)', flag: '🇺🇸', minDigits: 10, maxDigits: 10 },
  { code: '+44', name: 'United Kingdom', bengaliName: 'যুক্তরাজ্য (+44)', flag: '🇬🇧', minDigits: 10, maxDigits: 11 },
  { code: '+971', name: 'United Arab Emirates', bengaliName: 'সংযুক্ত আরব আমিরাত (+971)', flag: '🇦🇪', minDigits: 9, maxDigits: 9 },
  { code: '+966', name: 'Saudi Arabia', bengaliName: 'সৌদি আরব (+966)', flag: '🇸🇦', minDigits: 9, maxDigits: 9 },
  { code: '+965', name: 'Kuwait', bengaliName: 'কুয়েত (+965)', flag: '🇰🇼', minDigits: 8, maxDigits: 8 },
  { code: '+974', name: 'Qatar', bengaliName: 'কাতার (+974)', flag: '🇶🇦', minDigits: 8, maxDigits: 8 },
  { code: '+968', name: 'Oman', bengaliName: 'ওমান (+968)', flag: '🇴🇲', minDigits: 8, maxDigits: 8 },
  { code: '+973', name: 'Bahrain', bengaliName: 'বাহরাইন (+973)', flag: '🇧🇭', minDigits: 8, maxDigits: 8 },
  { code: '+60', name: 'Malaysia', bengaliName: 'মালয়েশিয়া (+60)', flag: '🇲🇾', minDigits: 9, maxDigits: 10 },
  { code: '+65', name: 'Singapore', bengaliName: 'সিঙ্গাপুর (+65)', flag: '🇸🇬', minDigits: 8, maxDigits: 8 },
  { code: '+61', name: 'Australia', bengaliName: 'অস্ট্রেলিয়া (+61)', flag: '🇦🇺', minDigits: 9, maxDigits: 9 },
  { code: '+49', name: 'Germany', bengaliName: 'জার্মানি (+49)', flag: '🇩🇪', minDigits: 10, maxDigits: 11 },
  { code: '+33', name: 'France', bengaliName: 'ফ্রান্স (+33)', flag: '🇫🇷', minDigits: 9, maxDigits: 9 },
  { code: '+39', name: 'Italy', bengaliName: 'ইতালি (+39)', flag: '🇮🇹', minDigits: 9, maxDigits: 10 },
  { code: '+34', name: 'Spain', bengaliName: 'স্পেন (+34)', flag: '🇪🇸', minDigits: 9, maxDigits: 9 },
  { code: '+31', name: 'Netherlands', bengaliName: 'নেদারল্যান্ডস (+31)', flag: '🇳🇱', minDigits: 9, maxDigits: 9 },
  { code: '+41', name: 'Switzerland', bengaliName: 'সুইজারল্যান্ড (+41)', flag: '🇨🇭', minDigits: 9, maxDigits: 9 },
  { code: '+46', name: 'Sweden', bengaliName: 'সুইডেন (+46)', flag: '🇸🇪', minDigits: 9, maxDigits: 10 },
  { code: '+47', name: 'Norway', bengaliName: 'নরওয়ে (+47)', flag: '🇳🇴', minDigits: 8, maxDigits: 8 },
  { code: '+353', name: 'Ireland', bengaliName: 'আয়ারল্যান্ড (+353)', flag: '🇮🇪', minDigits: 9, maxDigits: 9 },
  { code: '+64', name: 'New Zealand', bengaliName: 'নিউজিল্যান্ড (+64)', flag: '🇳🇿', minDigits: 9, maxDigits: 10 },
  { code: '+27', name: 'South Africa', bengaliName: 'দক্ষিণ আফ্রিকা (+27)', flag: '🇿🇦', minDigits: 9, maxDigits: 9 },
  { code: '+81', name: 'Japan', bengaliName: 'জাপান (+81)', flag: '🇯🇵', minDigits: 10, maxDigits: 10 },
  { code: '+82', name: 'South Korea', bengaliName: 'দক্ষিণ কোরিয়া (+82)', flag: '🇰🇷', minDigits: 9, maxDigits: 10 },
  { code: '+92', name: 'Pakistan', bengaliName: 'পাকিস্তান (+92)', flag: '🇵🇰', minDigits: 10, maxDigits: 10 },
  { code: '+977', name: 'Nepal', bengaliName: 'নেপাল (+977)', flag: '🇳🇵', minDigits: 10, maxDigits: 10 },
  { code: '+94', name: 'Sri Lanka', bengaliName: 'শ্রীলঙ্কা (+94)', flag: '🇱🇰', minDigits: 9, maxDigits: 9 },
  { code: '+975', name: 'Bhutan', bengaliName: 'ভুটান (+975)', flag: '🇧🇹', minDigits: 8, maxDigits: 8 },
  { code: '+960', name: 'Maldives', bengaliName: 'মালদ্বীপ (+960)', flag: '🇲🇻', minDigits: 7, maxDigits: 7 },
  { code: '+90', name: 'Turkey', bengaliName: 'তুরস্ক (+90)', flag: '🇹🇷', minDigits: 10, maxDigits: 10 },
  { code: '+20', name: 'Egypt', bengaliName: 'মিশর (+20)', flag: '🇪🇬', minDigits: 10, maxDigits: 10 },
  { code: '+234', name: 'Nigeria', bengaliName: 'নাইজেরিয়া (+234)', flag: '🇳🇬', minDigits: 10, maxDigits: 10 },
  { code: '+254', name: 'Kenya', bengaliName: 'কেনিয়া (+254)', flag: '🇰🇪', minDigits: 9, maxDigits: 9 },
  { code: '+55', name: 'Brazil', bengaliName: 'ব্রাজিল (+55)', flag: '🇧🇷', minDigits: 10, maxDigits: 11 },
  { code: '+52', name: 'Mexico', bengaliName: 'মেক্সিকো (+52)', flag: '🇲🇽', minDigits: 10, maxDigits: 10 },
  { code: '+62', name: 'Indonesia', bengaliName: 'ইন্দোনেশিয়া (+62)', flag: '🇮🇩', minDigits: 9, maxDigits: 11 },
  { code: '+63', name: 'Philippines', bengaliName: 'ফিলিপাইন (+63)', flag: '🇵🇭', minDigits: 10, maxDigits: 10 },
  { code: '+84', name: 'Vietnam', bengaliName: 'ভিয়েতনাম (+84)', flag: '🇻🇳', minDigits: 9, maxDigits: 10 },
  { code: '+66', name: 'Thailand', bengaliName: 'থাইল্যান্ড (+66)', flag: '🇹🇭', minDigits: 9, maxDigits: 9 },
];
