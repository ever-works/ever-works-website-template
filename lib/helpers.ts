export type LanguageCode = "en" | "fr" | "es" | "zh" | "de" | "ar";

export type LanguageCountryCode = {
  [key in LanguageCode]: string;
};

export const LANGUAGE_COUNTRY_CODES: LanguageCountryCode = {
  en: "US",
  fr: "FR",
  es: "ES",
  zh: "CN",
  de: "DE",
  ar: "SA"
};

export const appLocales = [...Object.keys(LANGUAGE_COUNTRY_CODES)];

export function getCountryCode(languageCode: LanguageCode = "en"): string {
  return LANGUAGE_COUNTRY_CODES[languageCode as LanguageCode];
}