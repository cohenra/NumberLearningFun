import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/languageContext";

export function SuccessAnimation() {
  const { t } = useLanguage();
  
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white p-8 rounded-lg text-center"
      >
        <h2 className="text-4xl font-bold mb-4">🎉 {t('practice.correct')} 🎉</h2>
        <p className="text-2xl">{t('voiceCommands.correctAnswer')}</p>
      </motion.div>
    </motion.div>
  );
}
