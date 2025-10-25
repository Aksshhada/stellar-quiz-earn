import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuizQuestionProps {
  question: {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
    category: string;
    difficulty: string;
  };
  onAnswer: (isCorrect: boolean) => void;
  currentQuestion: number;
  totalQuestions: number;
}

export const QuizQuestion = ({
  question,
  onAnswer,
  currentQuestion,
  totalQuestions,
}: QuizQuestionProps) => {
  const handleAnswer = (selectedIndex: number) => {
    const isCorrect = selectedIndex === question.correct_answer;
    onAnswer(isCorrect);
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
          {question.category}
        </span>
      </div>

      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">{question.question}</h2>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(index)}
              variant="outline"
              className="w-full justify-start text-left h-auto py-4 px-6 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
              {option}
            </Button>
          ))}
        </div>
      </Card>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
        />
      </div>
    </div>
  );
};
