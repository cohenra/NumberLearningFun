import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AudioPlayer } from "./audio-player";
import type { Number } from "@shared/schema";

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
  const handleClick = () => {
    // Play audio on click
    const utterance = new SpeechSynthesisUtterance(number.hebrewText);
    utterance.lang = 'he-IL';
    speechSynthesis.speak(utterance);

    // Call the onClick handler if provided
    if (onClick) onClick();
  };

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
          <span className="text-6xl font-bold">{number.value}</span>
          <span className="text-3xl mt-2 font-bold">{number.hebrewText}</span>
          {autoPlayAudio && <AudioPlayer text={number.hebrewText} autoPlay={autoPlayAudio} />}
        </CardContent>
      </Card>
    </motion.div>
  );
}