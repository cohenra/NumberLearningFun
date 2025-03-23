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
