import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Sound utility functions
export function playCorrectSound() {
  const audio = new Audio();
  audio.src = '/sounds/correct.mp3';
  audio.play().catch(err => console.error('Error playing sound:', err));
}

export function playIncorrectSound() {
  const audio = new Audio();
  audio.src = '/sounds/incorrect.mp3';
  audio.play().catch(err => console.error('Error playing sound:', err));
}

export function speakText(text: string, lang: string = 'en-US') {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower rate for children
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
  }
}

// Function to speak congratulation message when correct answer is selected
export function speakCongratulation(lang: string = 'en-US') {
  const congratsMessage = lang.startsWith('he') ? 
    'כל הכבוד! תשובה נכונה!' : 
    'Well done! Correct answer!';
  
  // Use a slight delay to allow the correct sound to play first
  setTimeout(() => {
    speakText(congratsMessage, lang);
  }, 500);
}

// Function to speak the wrong answer that was selected
export function speakWrongAnswer(wrongValue: string, lang: string = 'en-US') {
  const wrongMessage = lang.startsWith('he') ? 
    `בחרת ${wrongValue}, נסה שוב` : 
    `You selected ${wrongValue}, try again`;
  
  // Use a slight delay to allow the incorrect sound to play first
  setTimeout(() => {
    speakText(wrongMessage, lang);
  }, 500);
}
