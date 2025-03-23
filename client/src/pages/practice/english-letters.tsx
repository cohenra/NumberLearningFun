import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LetterCard } from "@/components/ui/letter-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { SuccessAnimation } from "@/components/ui/success-animation";
import { WrongAnswerAnimation } from "@/components/ui/wrong-answer-animation";
import type { Letter, InsertProgress } from "@shared/schema";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/lib/i18n/languageContext";
import { playCorrectSound, playIncorrectSound, speakText } from "@/lib/utils";

export default function PracticeEnglishLetters() {
  const { t, locale } = useLanguage();
  const { data: letters, isLoading } = useQuery<Letter[]>({ 
    queryKey: ["/api/letters", { type: "english" }],
    queryFn: async () => {
      const response = await fetch("/api/letters?type=english");
      return response.json();
    }
  });

  const [currentLetter, setCurrentLetter] = useState<Letter | null>(null);
  const [options, setOptions] = useState<Letter[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [wrongLetter, setWrongLetter] = useState("");
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  const saveMutation = useMutation({
    mutationFn: async (progress: InsertProgress) => {
      await apiRequest("POST", "/api/progress", progress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    }
  });

  useEffect(() => {
    if (letters && letters.length >= 4) {
      generateNewQuestion();
    }
  }, [letters]);

  const saveProgress = () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    saveMutation.mutate({
      correctAnswers: score,
      totalQuestions: totalAttempts,
      timeTaken,
      numberRange: 26, // English alphabet has 26 letters
      contentType: 'english-letters'
    });
  };

  const generateNewQuestion = () => {
    if (!letters || letters.length < 4) return;

    // Select random letter as answer
    const answer = letters[Math.floor(Math.random() * letters.length)];
    setCurrentLetter(answer);

    // Generate 3 other unique random letters as options
    const otherOptions = letters
      .filter(l => l.id !== answer.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Combine and shuffle all options
    setOptions([answer, ...otherOptions].sort(() => Math.random() - 0.5));

    // Speak the question after a short delay
    setTimeout(() => {
      const questionText = locale === 'he' 
        ? `${t('practice.questionLetter')} ${answer.englishText}?` 
        : `${t('practice.questionLetter')} ${answer.englishText}?`;
      speakText(questionText, locale === 'he' ? 'he-IL' : 'en-US');
    }, 500);
  };

  const handleSelect = (selected: Letter) => {
    setTotalAttempts(prev => prev + 1);

    if (selected.id === currentLetter?.id) {
      setScore(prev => prev + 1);
      setShowSuccess(true);
      playCorrectSound();
      setTimeout(() => {
        setShowSuccess(false);
        generateNewQuestion();
      }, 2000);
    } else {
      setWrongLetter(selected.englishText);
      setShowWrong(true);
      playIncorrectSound();
      setTimeout(() => {
        setShowWrong(false);
      }, 2000);
    }

    // Save progress every 5 attempts
    if (totalAttempts > 0 && totalAttempts % 5 === 0) {
      saveProgress();
    }
  };

  // When component mounts, speak the initial question
  useEffect(() => {
    if (currentLetter) {
      const questionText = locale === 'he' 
        ? `${t('practice.questionLetter')} ${currentLetter.englishText}?` 
        : `${t('practice.questionLetter')} ${currentLetter.englishText}?`;
      speakText(questionText, locale === 'he' ? 'he-IL' : 'en-US');
    }
  }, [currentLetter, locale]);

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8 pt-14 md:pt-16 flex items-center justify-center">
      <div className="text-2xl">{t('common.loading')}</div>
    </div>;
  }

  if (!letters || letters.length < 4 || !currentLetter || options.length < 4) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8 pt-14 md:pt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">{t('practice.englishLettersTitle')}</h1>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8 pt-14 md:pt-16">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('practice.titleEnglish')}</h1>
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
          <h2 className="text-2xl text-center mb-8">{t('practice.questionLetter')} {currentLetter.englishText}?</h2>
          
          <motion.div 
            className="grid grid-cols-2 gap-6 mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {options.map((option) => (
              <LetterCard
                key={option.id}
                letter={option}
                onClick={() => handleSelect(option)}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {showSuccess && <SuccessAnimation />}
      {showWrong && <WrongAnswerAnimation number={wrongLetter} />}
    </div>
  );
} 