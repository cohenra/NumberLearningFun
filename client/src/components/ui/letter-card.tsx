import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AudioPlayer } from "./audio-player";
import type { Letter } from "@shared/schema";
import { useLanguage } from "@/lib/i18n/languageContext";

interface LetterCardProps {
  letter: Letter;
  onClick?: () => void;
  isSelected?: boolean;
  autoPlayAudio?: boolean;
}

export function LetterCard({ 
  letter, 
  onClick, 
  isSelected = false,
  autoPlayAudio = false 
}: LetterCardProps) {
  const { locale } = useLanguage();
  
  const handleClick = () => {
    // Play audio on click with the correct language
    let text, lang;
    
    if (letter.type === 'hebrew') {
      text = letter.hebrewText;
      lang = 'he-IL';
    } else {
      text = letter.englishText;
      lang = 'en-US';
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);

    // Call the onClick handler if provided
    if (onClick) onClick();
  };

  // Get the letter text based on type and current language
  // For Hebrew letters, display just the letter itself, not the full name
  let displayText = letter.type === 'hebrew' ? letter.value : letter.englishText;
  
  // Only show transliteration for English letters, not for Hebrew
  let secondaryText = letter.type === 'hebrew' ? "" : letter.transliteration;
  
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
              {letter.type === 'hebrew' ? letter.value : letter.englishText}
            </span>
            <span className="text-sm block mt-2">
              {letter.type === 'hebrew' 
                ? locale === 'he' ? letter.hebrewText : letter.transliteration
                : locale === 'he' ? letter.transliteration : letter.englishText
              }
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 