import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/languageContext";

export default function Home() {
  const { t, dir } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4 text-primary">{t('app.title')}</h1>
        <p className="text-2xl text-gray-600">{t('app.subtitle')}</p>
      </motion.div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link href="/content-select">
          <Button 
            className="w-full text-2xl py-8"
            size="lg"
          >
            {t('nav.learn')}
          </Button>
        </Link>

        <Link href="/content-select?mode=practice">
          <Button 
            className="w-full text-2xl py-8"
            variant="secondary"
            size="lg"
          >
            {t('nav.practice')}
          </Button>
        </Link>

        <Link href="/quick-math">
          <Button 
            className="w-full text-2xl py-8"
            variant="secondary"
            size="lg"
          >
            {t('nav.quickMath')}
          </Button>
        </Link>

        <Link href="/parent-dashboard">
          <Button 
            className="w-full text-xl py-4 mt-4"
            variant="outline"
          >
            {t('nav.parentDashboard')}
          </Button>
        </Link>
      </div>
    </div>
  );
}