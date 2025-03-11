import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { NumberCard } from "@/components/ui/number-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SuccessAnimation } from "@/components/ui/success-animation";
import { WrongAnswerAnimation } from "@/components/ui/wrong-answer-animation";
import type { Number, InsertProgress } from "@shared/schema";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

export default function Practice() {
  const { data: numbers } = useQuery<Number[]>({ 
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
    }
  });

  useEffect(() => {
    if (numbers) {
      generateNewQuestion();
    }
  }, [numbers]);

  const saveProgress = () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    saveMutation.mutate({
      correctAnswers: score,
      totalQuestions: totalAttempts,
      timeTaken,
      numberRange: 10
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
  };

  const handleSelect = (selected: Number) => {
    setTotalAttempts(prev => prev + 1);

    if (selected.id === currentNumber?.id) {
      setScore(prev => prev + 1);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        generateNewQuestion();
      }, 2000);
    } else {
      setWrongNumber(selected.hebrewText);
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

  if (!currentNumber || !options.length) {
    return <div>טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">תרגול מספרים</h1>
            <p className="text-xl mt-2">תשובות נכונות: {score}</p>
          </div>
          <Link href="/">
            <Button 
              variant="outline" 
              onClick={saveProgress}
            >
              חזרה
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl mb-4">איפה המספר {currentNumber.hebrewText}?</h2>
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

      {showSuccess && <SuccessAnimation />}
      {showWrong && <WrongAnswerAnimation number={wrongNumber} />}
    </div>
  );
}