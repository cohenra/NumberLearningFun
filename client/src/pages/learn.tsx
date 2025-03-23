import { useQuery } from "@tanstack/react-query";
import { NumberCard } from "@/components/ui/number-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { Number } from "@shared/schema";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/languageContext";

export default function Learn() {
  const { t } = useLanguage();
  const { data: numbers, isLoading } = useQuery<Number[]>({ 
    queryKey: ["/api/numbers"]
  });

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8 pt-14 md:pt-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{t('learn.title')}</h1>
          <div className="flex gap-2">
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
          {numbers?.map((number) => (
            <NumberCard
              key={number.id}
              number={number}
              onClick={() => {}} // Just for playing audio
            />
          ))}
        </motion.div>

        <div className="mt-8 text-center">
          <Link href="/practice">
            <Button size="lg" className="text-xl">
              {t('learn.practiceNow')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
