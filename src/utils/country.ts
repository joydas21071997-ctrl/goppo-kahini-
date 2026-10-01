import { useState, useEffect } from 'react';
import { AudienceUser } from '../types';

export type SupportedCountry = 'IN' | 'BD';

export interface PassPriceConfig {
  country: SupportedCountry;
  currency: 'INR' | 'BDT';
  symbol: string;
  amount: number;
  ctaText: string;
  validityDays: number;
  validityText: string;
  badgeText: string;
}

export function detectUserCountry(user?: AudienceUser | null): SupportedCountry {
  try {
    // 1. Explicit user override if set
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gk_selected_country');
      if (stored === 'BD' || stored === 'IN') {
        return stored;
      }
    }

    // 2. Check logged-in user phone number country code
    if (user?.phoneNumber) {
      if (user.phoneNumber.startsWith('+880') || user.phoneNumber.startsWith('880')) {
        return 'BD';
      }
      if (user.phoneNumber.startsWith('+91') || user.phoneNumber.startsWith('91')) {
        return 'IN';
      }
    }

    // 3. Check browser timezone
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const tzLower = timeZone.toLowerCase();
      if (tzLower.includes('dhaka') || tzLower.includes('bangladesh')) {
        return 'BD';
      }
      if (
        tzLower.includes('kolkata') ||
        tzLower.includes('calcutta') ||
        tzLower.includes('india')
      ) {
        return 'IN';
      }
    }

    // 4. Check browser languages / locales
    if (typeof navigator !== 'undefined') {
      const languages = navigator.languages || [navigator.language || ''];
      for (const lang of languages) {
        if (!lang) continue;
        const normalized = lang.toLowerCase();
        if (normalized === 'bn-bd' || normalized.endsWith('-bd')) {
          return 'BD';
        }
        if (normalized === 'bn-in' || normalized.endsWith('-in') || normalized.startsWith('hi')) {
          return 'IN';
        }
      }
    }
  } catch {
    // Fallback safely to India
  }

  return 'IN';
}

export type AppLanguage = 'bn' | 'hi' | 'en';

export function getPassPriceConfig(country: SupportedCountry, lang: AppLanguage = 'bn'): PassPriceConfig {
  if (country === 'BD') {
    let ctaText = '৳25-এ Pass নিন';
    let validityText = '২৮ দিন মেয়াদ';
    let badgeText = '৳২৫ পাস';

    if (lang === 'hi') {
      ctaText = '৳25 में Pass लें';
      validityText = '28 दिन वैधता';
      badgeText = '৳25 पास';
    } else if (lang === 'en') {
      ctaText = 'Get Pass for ৳25';
      validityText = '28 days validity';
      badgeText = '৳25 Pass';
    }

    return {
      country: 'BD',
      currency: 'BDT',
      symbol: '৳',
      amount: 25,
      ctaText,
      validityDays: 28,
      validityText,
      badgeText,
    };
  }

  let ctaText = '₹20-তে Pass নিন';
  let validityText = '২৮ দিন মেয়াদ';
  let badgeText = '₹২০ পাস';

  if (lang === 'hi') {
    ctaText = '₹20 में Pass लें';
    validityText = '28 दिन वैधता';
    badgeText = '₹20 पास';
  } else if (lang === 'en') {
    ctaText = 'Get Pass for ₹20';
    validityText = '28 days validity';
    badgeText = '₹20 Pass';
  }

  return {
    country: 'IN',
    currency: 'INR',
    symbol: '₹',
    amount: 20,
    ctaText,
    validityDays: 28,
    validityText,
    badgeText,
  };
}

export function useCountry(user?: AudienceUser | null) {
  const [country, setCountry] = useState<SupportedCountry>(() => detectUserCountry(user));

  useEffect(() => {
    setCountry(detectUserCountry(user));
  }, [user]);

  return {
    country,
    passConfig: getPassPriceConfig(country),
  };
}
