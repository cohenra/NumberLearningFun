import { useQuery } from "@tanstack/react-query";
import { LetterCard } from "@/components/ui/letter-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { Letter } from "@shared/schema";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/languageContext";

export default function LearnEnglishLetters() {
  const { t } = useLanguage();
  const { data: letters, isLoading } = useQuery<Letter[]>({ 
    queryKey: ["/api/letters", { type: "english" }],
    queryFn: async () => {
      const response = await fetch("/api/letters?type=english");
      return response.json();
    }
  });

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{t('learn.englishLettersTitle')}</h1>
          <div className="flex gap-2">
            <Link href="/content-select">
              <Button variant="outline">{t('nav.back')}</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">{t('nav.home')}</Button>
            </Link>
          </div>
        </div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {letters?.map((letter) => (
            <LetterCard
              key={letter.id}
              letter={letter}
              onClick={() => {}} // Just for playing audio
            />
          ))}
        </motion.div>

        <div className="mt-8 text-center">
          <Link href="/practice/english-letters">
            <Button size="lg" className="text-xl">
              {t('learn.practiceNow')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 