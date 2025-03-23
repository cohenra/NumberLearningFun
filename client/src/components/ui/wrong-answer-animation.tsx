import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/languageContext";

interface WrongAnswerAnimationProps {
  number: string;
}

export function WrongAnswerAnimation({ number }: WrongAnswerAnimationProps) {
  const { t } = useLanguage();
  
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
        <h2 className="text-4xl font-bold mb-4 text-red-500">❌ {t('practice.wrong')}</h2>
        <p className="text-2xl">{t('practice.question')} {number}</p>
        <p className="text-xl mt-2">{t('practice.tryAgain')}</p>
      </motion.div>
    </motion.div>
  );
}
