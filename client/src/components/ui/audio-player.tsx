import { useEffect } from "react";

interface AudioPlayerProps {
  text: string;
  autoPlay?: boolean;
}

export function AudioPlayer({ text, autoPlay = false }: AudioPlayerProps) {
  useEffect(() => {
    if (autoPlay) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      speechSynthesis.speak(utterance);
    }
  }, [text, autoPlay]);

  return null;
}