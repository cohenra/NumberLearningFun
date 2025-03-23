import { he } from './he';
import { en } from './en';

export const locales = {
  he,
  en
};

export type Locale = keyof typeof locales;
export type LocaleObject = typeof locales.he;

export default locales; 