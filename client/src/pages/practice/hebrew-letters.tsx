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

export default function PracticeHebrewLetters() {
  const { t, locale } = useLanguage();
  const { data: letters } = useQuery<Letter[]>({ 
    queryKey: ["/api/letters", { type: "hebrew" }],
    queryFn: async () => {
      const response = await fetch("/api/letters?type=hebrew");
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
      numberRange: 22, // Hebrew alphabet has 22 letters
      contentType: 'hebrew-letters'
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
  };

  const handleSelect = (selected: Letter) => {
    setTotalAttempts(prev => prev + 1);

    if (selected.id === currentLetter?.id) {
      setScore(prev => prev + 1);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        generateNewQuestion();
      }, 2000);
    } else {
      setWrongLetter(selected.hebrewText);
      setShowWrong(true);
      setTimeout(() => {
        setShowWrong(false);
      }, 2000);
    }

    // Save progress every 5 attempts
    if (totalAttempts > 0 && totalAttempts % 5 === 0) {
      saveProgress();
    }
  };

  if (!currentLetter || !options.length) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">{t('practice.hebrewLettersTitle')}</h1>
            <p className="text-xl mt-2">{t('practice.score')} {score}</p>
          </div>
          <Link href="/">
            <Button 
              variant="outline" 
              onClick={saveProgress}
            >
              {t('nav.home')}
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl mb-4">{t('practice.questionLetter')} {currentLetter.hebrewText}?</h2>
        </div>

        <motion.div 
          className="grid grid-cols-2 gap-6"
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

      {showSuccess && <SuccessAnimation />}
      {showWrong && <WrongAnswerAnimation number={wrongLetter} />}
    </div>
  );
} 