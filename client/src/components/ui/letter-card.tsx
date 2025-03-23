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
  let displayText = letter.type === 'hebrew' ? letter.hebrewText : letter.englishText;
  let secondaryText = letter.type === 'hebrew' ? letter.transliteration : "";
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card 
        className={`w-40 h-40 cursor-pointer ${
          isSelected ? "border-4 border-primary" : ""
        }`}
        onClick={handleClick}
      >
        <CardContent className="flex flex-col items-center justify-center h-full">
          <span className="text-6xl font-bold">{displayText}</span>
          {secondaryText && <span className="text-2xl mt-1">{secondaryText}</span>}
          {autoPlayAudio && (
            <AudioPlayer 
              text={letter.type === 'hebrew' ? letter.hebrewText : letter.englishText} 
              lang={letter.type === 'hebrew' ? 'he-IL' : 'en-US'} 
              autoPlay={autoPlayAudio} 
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 