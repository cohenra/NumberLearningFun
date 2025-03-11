import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { SuccessAnimation } from "@/components/ui/success-animation";
import { WrongAnswerAnimation } from "@/components/ui/wrong-answer-animation";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertProgress } from "@shared/schema";

type Problem = {
  num1: number;
  num2: number;
  operator: '+' | '-';
  answer: number;
  options: number[];
}

export default function QuickMath() {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds game
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [startTime] = useState(Date.now());

  const saveMutation = useMutation({
    mutationFn: async (progress: InsertProgress) => {
      await apiRequest("POST", "/api/progress", progress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    }
  });

  const generateProblem = () => {
    // Generate numbers between 1 and 10
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = Math.random() < 0.5 ? '+' : '-';

    // Ensure subtraction doesn't result in negative numbers
    const [finalNum1, finalNum2] = operator === '-' && num1 < num2 
      ? [num2, num1] 
      : [num1, num2];

    const answer = operator === '+' 
      ? finalNum1 + finalNum2 
      : finalNum1 - finalNum2;

    // Generate 4 options including the correct answer
    let options = [answer];
    while (options.length < 4) {
      const option = answer + (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
      if (!options.includes(option) && option >= 0) {
        options.push(option);
      }
    }

    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);

    setProblem({
      num1: finalNum1,
      num2: finalNum2,
      operator,
      answer,
      options
    });
  };

  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    setTotalAttempts(0);
    setTimeLeft(60);
    generateProblem();
  };

  const saveProgress = () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    saveMutation.mutate({
      correctAnswers: score,
      totalQuestions: totalAttempts,
      timeTaken,
      numberRange: 10
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isGameActive) {
      setIsGameActive(false);
      saveProgress();
    }
    return () => clearInterval(timer);
  }, [isGameActive, timeLeft]);

  const handleAnswer = (selectedAnswer: number) => {
    setTotalAttempts(prev => prev + 1);

    if (selectedAnswer === problem?.answer) {
      setScore(prev => prev + 1);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        generateProblem();
      }, 1000);
    } else {
      setShowWrong(true);
      setTimeout(() => {
        setShowWrong(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">חשבון מהיר</h1>
            <div className="flex gap-4 mt-2">
              <p className="text-xl">ניקוד: {score}</p>
              <p className="text-xl">זמן: {timeLeft} שניות</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline">חזרה</Button>
          </Link>
        </div>

        {!isGameActive ? (
          <div className="text-center">
            <h2 className="text-2xl mb-4">מוכנים למשחק חשבון מהיר?</h2>
            <Button size="lg" onClick={startGame}>התחל!</Button>
          </div>
        ) : problem && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-4xl mb-4 text-right flex justify-center gap-4 items-center">
                <span>= ?</span>
                <span>{problem.num2}</span>
                <span>{problem.operator}</span>
                <span>{problem.num1}</span>
              </h2>
            </div>

            <motion.div 
              className="grid grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {problem.options.map((option, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleAnswer(option)}
                >
                  <CardContent className="flex items-center justify-center p-8">
                    <span className="text-4xl font-bold">{option}</span>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </>
        )}
      </div>

      {showSuccess && <SuccessAnimation />}
      {showWrong && <WrongAnswerAnimation number={problem?.answer.toString() || ""} />}
    </div>
  );
}