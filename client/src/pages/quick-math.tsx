import { useState, useEffect } from "react";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SuccessAnimation } from "@/components/ui/success-animation";
import { WrongAnswerAnimation } from "@/components/ui/wrong-answer-animation";
import { useLanguage } from "@/lib/i18n/languageContext";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertProgress } from "@shared/schema";
import { playCorrectSound, playIncorrectSound, speakText, speakCongratulation, speakWrongAnswer } from "@/lib/utils";

type Problem = {
  num1: number;
  num2: number;
  answer: number;
  options: number[];
};

type DifficultyLevel = 'easy' | 'hard';

export default function QuickMath() {
  const { t, locale } = useLanguage();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);
  const [startTime] = useState(Date.now());
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('easy');

  const saveMutation = useMutation({
    mutationFn: async (progress: InsertProgress) => {
      await apiRequest("POST", "/api/progress", progress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    }
  });

  useEffect(() => {
    if (isGameActive) {
      generateProblem();

      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsGameActive(false);
            saveProgress();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isGameActive]);

  const saveProgress = () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    saveMutation.mutate({
      correctAnswers: score,
      totalQuestions: totalAttempts,
      timeTaken,
      numberRange: 20,
      contentType: 'quick-math'
    });
  };

  const generateProblem = () => {
    // Generate numbers between 1 and 20
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const answer = num1 + num2;
    
    // Generate 3 other unique options for the easy mode
    let options = [answer];
    while (options.length < 4) {
      const option = answer + (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
      if (!options.includes(option) && option >= 0) {
        options.push(option);
      }
    }
    
    // Shuffle options
    options.sort(() => Math.random() - 0.5);
    
    setProblem({
      num1,
      num2,
      answer,
      options
    });
    
    setAnswer("");
  };

  const handleAnswerSelect = (selectedAnswer: number) => {
    setTotalAttempts(prev => prev + 1);
    
    if (selectedAnswer === problem?.answer) {
      setScore(prev => prev + 1);
      setShowSuccess(true);
      playCorrectSound();
      speakCongratulation(locale === 'he' ? 'he-IL' : 'en-US');
      setTimeout(() => {
        setShowSuccess(false);
        generateProblem();
      }, 1500);
    } else {
      const wrongAnswerText = selectedAnswer.toString();
      setWrongAnswer(wrongAnswerText);
      setShowWrong(true);
      playIncorrectSound();
      speakWrongAnswer(wrongAnswerText, locale === 'he' ? 'he-IL' : 'en-US');
      setTimeout(() => {
        setShowWrong(false);
      }, 1500);
    }

    // Save progress every 5 attempts
    if (totalAttempts > 0 && totalAttempts % 5 === 0) {
      saveProgress();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTotalAttempts(prev => prev + 1);
    
    const userAnswer = parseInt(answer);
    
    if (userAnswer === problem?.answer) {
      setScore(prev => prev + 1);
      setShowSuccess(true);
      playCorrectSound();
      speakCongratulation(locale === 'he' ? 'he-IL' : 'en-US');
      setTimeout(() => {
        setShowSuccess(false);
        generateProblem();
      }, 1500);
    } else {
      const wrongAnswerText = answer;
      setWrongAnswer(wrongAnswerText);
      setShowWrong(true);
      playIncorrectSound();
      speakWrongAnswer(wrongAnswerText, locale === 'he' ? 'he-IL' : 'en-US');
      setTimeout(() => {
        setShowWrong(false);
      }, 1500);
    }

    // Save progress every 5 attempts
    if (totalAttempts > 0 && totalAttempts % 5 === 0) {
      saveProgress();
    }
  };

  // Function to speak the math problem
  const speakProblem = () => {
    if (problem) {
      const questionText = locale === 'he' 
        ? `${t('quickMath.question')} ${problem.num1} ${t('quickMath.operation.addition')} ${problem.num2}?` 
        : `${t('quickMath.question')} ${problem.num1} ${t('quickMath.operation.addition')} ${problem.num2}?`;
      speakText(questionText, locale === 'he' ? 'he-IL' : 'en-US');
    }
  };

  // Speak the problem only when it changes, not on every render
  useEffect(() => {
    if (problem && isGameActive) {
      setTimeout(speakProblem, 500);
    }
  }, [problem]);

  if (!isGameActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8 pt-14 md:pt-16 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">{t('quickMath.title')}</h1>
          <p className="text-2xl mb-8">{t('quickMath.readyToPlay')}</p>
        </div>
        
        <div className="flex flex-col gap-6 w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
            <h2 className="text-xl mb-4 font-medium text-center">{t('quickMath.selectDifficulty')}</h2>
            <div className="flex gap-4">
              <Button 
                className={`flex-1 ${difficultyLevel === 'easy' ? 'bg-primary' : 'bg-gray-300'}`}
                onClick={() => setDifficultyLevel('easy')}
              >
                {t('quickMath.easy')}
              </Button>
              <Button 
                className={`flex-1 ${difficultyLevel === 'hard' ? 'bg-primary' : 'bg-gray-300'}`}
                onClick={() => setDifficultyLevel('hard')}
              >
                {t('quickMath.hard')}
              </Button>
            </div>
          </div>
          
          <Button 
            size="lg"
            className="text-xl py-6"
            onClick={() => setIsGameActive(true)}
          >
            {t('quickMath.start')}
          </Button>
          
          <Link href="/" className="mt-4">
            <Button 
              variant="outline" 
              className="w-full"
            >
              {t('nav.home')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8 pt-14 md:pt-16">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('quickMath.title')}</h1>
            <div className="flex gap-4 mt-2">
              <p className="text-xl">{t('quickMath.score')} {score}</p>
              <p className="text-xl">{t('common.time')}: {timeLeft} {t('common.seconds')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsGameActive(false)}
            >
              {t('nav.back')}
            </Button>
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
            <h2 className="text-2xl text-center">
              {t('quickMath.question')} {problem?.num1} + {problem?.num2}?
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2"
              onClick={speakProblem}
              title={t('common.repeat')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            </Button>
          </div>
          
          {difficultyLevel === 'easy' ? (
            <motion.div 
              className="grid grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {problem?.options.map((option, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleAnswerSelect(option)}
                >
                  <CardContent className="flex items-center justify-center p-8">
                    <span className="text-4xl font-bold">{option}</span>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="?"
                className="text-center text-3xl h-16"
                autoFocus
              />
              
              <Button 
                type="submit" 
                size="lg" 
                className="mt-4"
              >
                {t('practice.next')}
              </Button>
            </form>
          )}
        </div>
      </div>

      {showSuccess && <SuccessAnimation />}
      {showWrong && <WrongAnswerAnimation number={wrongAnswer} />}
    </div>
  );
}