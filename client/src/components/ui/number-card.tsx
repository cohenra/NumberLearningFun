import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AudioPlayer } from "./audio-player";
import type { Number } from "@shared/schema";
import { useLanguage } from "@/lib/i18n/languageContext";

interface NumberCardProps {
  number: Number;
  onClick?: () => void;
  isSelected?: boolean;
  autoPlayAudio?: boolean;
}

export function NumberCard({ 
  number, 
  onClick, 
  isSelected = false,
  autoPlayAudio = false 
}: NumberCardProps) {
  const { t, locale } = useLanguage();
  
  const handleClick = () => {
    // Play audio on click with the correct language
    const text = locale === 'he' ? number.hebrewText : t(`numbers.${number.value}`);
    const lang = locale === 'he' ? 'he-IL' : 'en-US';
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);

    // Call the onClick handler if provided
    if (onClick) onClick();
  };

  // Get the number text based on current language
  const numberText = locale === 'he' ? number.hebrewText : t(`numbers.${number.value}`);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card 
        className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
        onClick={handleClick}
      >
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <span className="text-4xl font-bold block">
              {number.value}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}