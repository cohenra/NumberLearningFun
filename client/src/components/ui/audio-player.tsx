import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/languageContext";

interface AudioPlayerProps {
  text: string;
  autoPlay?: boolean;
  lang?: string;
}

export function AudioPlayer({ text, autoPlay = false, lang }: AudioPlayerProps) {
  const { locale } = useLanguage();
  const speechLang = lang || (locale === 'he' ? 'he-IL' : 'en-US');
  
  useEffect(() => {
    if (autoPlay) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLang;
      speechSynthesis.speak(utterance);
    }
  }, [text, autoPlay, speechLang]);

  return null;
}