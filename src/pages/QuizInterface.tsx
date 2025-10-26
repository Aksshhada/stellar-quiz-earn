import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, Award, ArrowRight, Loader2 } from "lucide-react";
import { getQuizFromFirebase } from "../firebase";

const QuizInterface = ({ publicKey }) => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [quizStartTime] = useState(Date.now());

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - quizStartTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStartTime]);

  // Load quiz data from Firebase
  useEffect(() => {
    loadQuiz();
  }, [code]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      console.log("🔍 Loading quiz with code:", code);
      
      // ✅ LOAD FROM FIREBASE
      const quizData = await getQuizFromFirebase(code);
      
      if (quizData) {
        console.log("✅ Quiz loaded from Firebase:", quizData);
        console.log("📝 Questions:", quizData.questions);
        setQuiz(quizData);
        setAnswers(new Array(quizData.questions.length).fill(null));
      } else {
        console.error("❌ Quiz not found with code:", code);
        setQuiz(null);
      }
    } catch (error) {
      console.error("❌ Error loading quiz:", error);
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (!showFeedback) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    // Record answer
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);

    // Show feedback
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Quiz complete - navigate to results
      navigate(`/results/${code}`, {
        state: {
          quiz,
          answers,
          timeElapsed,
          publicKey
        }
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Quiz Not Found</h2>
          <p className="text-slate-600 mb-6">
            The quiz code <span className="font-mono font-bold">{code}</span> is invalid or expired.
          </p>
          <button
            onClick={() => navigate("/join")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Try Another Code
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{quiz.topic}</h1>
              <p className="text-slate-600 text-sm capitalize">Difficulty: {quiz.difficulty}</p>
            </div>
            <div className="flex items-center space-x-2 text-slate-700">
              <Clock className="w-5 h-5" />
              <span className="font-mono font-semibold">{formatTime(timeElapsed)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-violet-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === question.correctAnswer;
              
              let buttonStyle = "bg-white border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50";
              
              if (showFeedback) {
                if (isCorrectOption) {
                  buttonStyle = "bg-green-50 border-2 border-green-500";
                } else if (isSelected && !isCorrect) {
                  buttonStyle = "bg-red-50 border-2 border-red-500";
                } else {
                  buttonStyle = "bg-slate-50 border-2 border-slate-200 opacity-50";
                }
              } else if (isSelected) {
                buttonStyle = "bg-blue-50 border-2 border-blue-500";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${buttonStyle} ${
                    showFeedback ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        showFeedback && isCorrectOption
                          ? "bg-green-500 text-white"
                          : showFeedback && isSelected && !isCorrect
                          ? "bg-red-500 text-white"
                          : isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-slate-900 font-medium">{option}</span>
                    </div>
                    {showFeedback && isCorrectOption && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    {showFeedback && isSelected && !isCorrect && (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`mt-6 p-4 rounded-lg border-2 ${
              isCorrect
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-start space-x-3">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-semibold mb-1 ${
                    isCorrect ? "text-green-900" : "text-red-900"
                  }`}>
                    {isCorrect ? "Correct! ✓" : "Incorrect ✗"}
                  </h3>
                  <p className={isCorrect ? "text-green-800" : "text-red-800"}>
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-6">
            {!showFeedback ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Submit Answer</span>
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span>
                  {currentQuestion < quiz.questions.length - 1
                    ? "Next Question"
                    : "View Results"}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quiz Info */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Score: {answers.filter((a, i) => a === quiz.questions[i]?.correctAnswer).length}/{currentQuestion + (showFeedback ? 1 : 0)}</span>
            </div>
            <div>
              Quiz Code: <span className="font-mono font-semibold text-blue-600">{code}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;