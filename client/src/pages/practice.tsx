import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { NumberCard } from "@/components/ui/number-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { SuccessAnimation } from "@/components/ui/success-animation";
import { WrongAnswerAnimation } from "@/components/ui/wrong-answer-animation";
import type { Number, InsertProgress } from "@shared/schema";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/lib/i18n/languageContext";
import { playCorrectSound, playIncorrectSound, speakText, speakCongratulation, speakWrongAnswer } from "@/lib/utils";

export default function Practice() {
  const { t, locale } = useLanguage();
  const { data: numbers, isLoading } = useQuery<Number[]>({ 
    queryKey: ["/api/numbers"]
  });

  const [currentNumber, setCurrentNumber] = useState<Number | null>(null);
  const [options, setOptions] = useState<Number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [wrongNumber, setWrongNumber] = useState("");
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  const saveMutation = useMutation({
    mutationFn: async (progress: InsertProgress) => {
      await apiRequest("POST", "/api/progress", progress);
    },
    onSuccess: () => {
      // Invalidate the progress query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    }
  });

  useEffect(() => {
    if (numbers && numbers.length >= 4) {
      generateNewQuestion();
    }
  }, [numbers]);

  const saveProgress = () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    saveMutation.mutate({
      correctAnswers: score,
      totalQuestions: totalAttempts,
      timeTaken,
      numberRange: 20,
      contentType: 'numbers'
    });
  };

  const generateNewQuestion = () => {
    if (!numbers || numbers.length < 4) return;

    // Select random number as answer
    const answer = numbers[Math.floor(Math.random() * numbers.length)];
    setCurrentNumber(answer);

    // Generate 3 other unique random numbers as options
    const otherOptions = numbers
      .filter(n => n.id !== answer.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Combine and shuffle all options
    setOptions([answer, ...otherOptions].sort(() => Math.random() - 0.5));

    // Speak the question after a short delay
    setTimeout(() => {
      const questionText = locale === 'he' 
        ? `${t('practice.question')} ${answer.hebrewText}?` 
        : `${t('practice.question')} ${t(`numbers.${answer.value}`)}?`;
      speakText(questionText, locale === 'he' ? 'he-IL' : 'en-US');
    }, 500);
  };

  // Function to speak the current question
  const speakCurrentQuestion = () => {
    if (currentNumber) {
      const questionText = locale === 'he' 
        ? `${t('practice.question')} ${currentNumber.hebrewText}?` 
        : `${t('practice.question')} ${t(`numbers.${currentNumber.value}`)}?`;
      speakText(questionText, locale === 'he' ? 'he-IL' : 'en-US');
    }
  };

  const handleSelect = (selected: Number) => {
    setTotalAttempts(prev => prev + 1);

    if (selected.id === currentNumber?.id) {
      setScore(prev => prev + 1);
      setShowSuccess(true);
      playCorrectSound();
      speakCongratulation(locale === 'he' ? 'he-IL' : 'en-US');
      setTimeout(() => {
        setShowSuccess(false);
        generateNewQuestion();
      }, 2000);
    } else {
      const wrongNumberText = locale === 'he' ? selected.hebrewText : t(`numbers.${selected.value}`);
      setWrongNumber(wrongNumberText);
      setShowWrong(true);
      playIncorrectSound();
      speakWrongAnswer(wrongNumberText, locale === 'he' ? 'he-IL' : 'en-US');
      setTimeout(() => {
        setShowWrong(false);
      }, 2000);
    }

    // Save progress every 5 attempts
    if (totalAttempts > 0 && totalAttempts % 5 === 0) {
      saveProgress();
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8 flex items-center justify-center">
      <div className="text-2xl">{t('common.loading')}</div>
    </div>;
  }

  if (!numbers || numbers.length < 4 || !currentNumber || options.length < 4) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">{t('practice.title')}</h1>
            <div className="flex gap-2">
              <Link href="/content-select">
                <Button variant="outline">{t('nav.back')}</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">{t('nav.home')}</Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-xl">{t('common.notEnoughData')}</div>
          </div>
        </div>
      </div>
    );
  }

  // Get the current number text based on the language
  const currentNumberText = locale === 'he' ? currentNumber.hebrewText : t(`numbers.${currentNumber.value}`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8 pt-14 md:pt-16">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('practice.title')}</h1>
            <div className="flex gap-4 mt-2">
              <p className="text-xl">{t('practice.score')} {score}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/content-select">
              <Button 
                variant="outline"
                onClick={saveProgress}
              >
                {t('nav.back')}
              </Button>
            </Link>
            <Link href="/">
              <Button 
                variant="outline"
                onClick={saveProgress}
              >
                {t('nav.home')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-center mb-8">
            <h2 className="text-2xl text-center">{t('practice.question')} {currentNumberText}?</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2"
              onClick={speakCurrentQuestion}
              title={t('common.repeat')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            </Button>
          </div>
          
          <motion.div 
            className="grid grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {options.map((option) => (
              <NumberCard
                key={option.id}
                number={option}
                onClick={() => handleSelect(option)}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {showSuccess && <SuccessAnimation />}
      {showWrong && <WrongAnswerAnimation number={wrongNumber} />}
    </div>
  );
}