import { useSearch } from "wouter";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/languageContext";

export default function ContentSelect() {
  const { t } = useLanguage();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const mode = params.get('mode') || 'learn';

  // Define content options
  const contentOptions = [
    {
      id: 'numbers',
      title: t('content.numbers'),
      icon: '123',
      href: mode === 'learn' ? '/learn' : '/practice'
    },
    {
      id: 'hebrew-letters',
      title: t('content.hebrewLetters'),
      icon: 'אבג',
      href: mode === 'learn' ? '/learn/hebrew-letters' : '/practice/hebrew-letters'
    },
    {
      id: 'english-letters',
      title: t('content.englishLetters'),
      icon: 'ABC',
      href: mode === 'learn' ? '/learn/english-letters' : '/practice/english-letters'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8 pt-14 md:pt-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            {mode === 'learn' ? t('content.selectToLearn') : t('content.selectToPractice')}
          </h1>
          <Link href="/">
            <Button variant="outline">{t('nav.home')}</Button>
          </Link>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {contentOptions.map((option) => (
            <Link key={option.id} href={option.href} className="block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="h-60 cursor-pointer hover:border-primary hover:border-2">
                  <CardContent className="flex flex-col items-center justify-center h-full">
                    <span className="text-6xl font-bold mb-4">{option.icon}</span>
                    <span className="text-2xl font-medium">{option.title}</span>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
} 