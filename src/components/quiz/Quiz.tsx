import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResults } from "./QuizResults";
import { toast } from "@/hooks/use-toast";

export const Quiz = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .limit(10);

      if (error) throw error;

      setQuestions(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load questions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    // Move to next question after a brief delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setShowResults(true);
      }
    }, 500);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    loadQuestions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No questions available</p>
      </div>
    );
  }

  if (showResults) {
    return (
      <QuizResults
        score={score}
        totalQuestions={questions.length}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <QuizQuestion
      question={questions[currentQuestionIndex]}
      onAnswer={handleAnswer}
      currentQuestion={currentQuestionIndex + 1}
      totalQuestions={questions.length}
    />
  );
};
