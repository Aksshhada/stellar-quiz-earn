import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Trophy,
  Award,
  Clock,
  Target,
  TrendingUp,
  Share2,
  Home,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";

const QuizResults = ({ publicKey }) => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [rewardTxHash, setRewardTxHash] = useState(null);
  
  // Get quiz data from navigation state
  const { quiz, answers, timeElapsed } = location.state || {};

  useEffect(() => {
    if (!quiz || !answers) {
      navigate("/dashboard");
      return;
    }

    // Process results and distribute rewards
    processResults();
  }, []);

  const processResults = async () => {
    setLoading(true);
    try {
      // TODO: Send results to backend
      // const response = await fetch('/api/quiz/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     code,
      //     publicKey,
      //     answers,
      //     timeElapsed
      //   })
      // });

      // TODO: Trigger Stellar payment if user scored well
      // if (score >= passingScore) {
      //   const txHash = await distributeReward(publicKey, rewardAmount);
      //   setRewardTxHash(txHash);
      // }

      // Simulated transaction hash
      if (calculateScore() >= 60) {
        setRewardTxHash("ABC123XYZ789STELLAR0000TRANSACTION0000HASH");
      }
    } catch (error) {
      console.error("Error processing results:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    if (!quiz || !answers) return 0;
    const correct = answers.filter((answer, index) => 
      answer === quiz.questions[index].correctAnswer
    ).length;
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const getCorrectCount = () => {
    if (!quiz || !answers) return 0;
    return answers.filter((answer, index) => 
      answer === quiz.questions[index].correctAnswer
    ).length;
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return { grade: "A+", color: "text-green-600", bg: "bg-green-50" };
    if (score >= 80) return { grade: "A", color: "text-green-600", bg: "bg-green-50" };
    if (score >= 70) return { grade: "B", color: "text-blue-600", bg: "bg-blue-50" };
    if (score >= 60) return { grade: "C", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { grade: "F", color: "text-red-600", bg: "bg-red-50" };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const shareResults = () => {
    const score = calculateScore();
    const text = `I just scored ${score}% on "${quiz.topic}" quiz on Stellar Quiz! 🎯\n\nJoin me: Code ${code}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Stellar Quiz Results",
        text: text,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert("Results copied to clipboard!");
    }
  };

  if (!quiz || !answers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No quiz data available</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const score = calculateScore();
  const correctCount = getCorrectCount();
  const scoreGrade = getScoreGrade(score);
  const passed = score >= 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
            passed ? "bg-gradient-to-br from-green-400 to-emerald-500" : "bg-gradient-to-br from-orange-400 to-red-500"
          }`}>
            <Trophy className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {passed ? "Congratulations! 🎉" : "Quiz Complete!"}
          </h1>
          <p className="text-slate-600 text-lg mb-8">{quiz.topic}</p>

          {/* Score Display */}
          <div className="inline-flex items-center space-x-4 mb-8">
            <div className={`text-6xl font-bold ${scoreGrade.color}`}>
              {score}%
            </div>
            <div className={`px-6 py-3 rounded-xl ${scoreGrade.bg}`}>
              <div className={`text-3xl font-bold ${scoreGrade.color}`}>
                {scoreGrade.grade}
              </div>
            </div>
          </div>

          <p className="text-slate-600">
            You answered <span className="font-semibold text-slate-900">{correctCount}</span> out of{" "}
            <span className="font-semibold text-slate-900">{quiz.questions.length}</span> questions correctly
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Accuracy</p>
                <p className="text-2xl font-bold text-slate-900">{score}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Time</p>
                <p className="text-2xl font-bold text-slate-900">{formatTime(timeElapsed)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Grade</p>
                <p className={`text-2xl font-bold ${scoreGrade.color}`}>{scoreGrade.grade}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        {passed && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  🎊 Reward Earned!
                </h3>
                <p className="text-slate-700 mb-3">
                  You've earned <span className="font-bold text-yellow-700">0.5 XLM</span> for completing this quiz!
                </p>
                {rewardTxHash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${rewardTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    <span>View Transaction</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Question Review */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900">Question Review</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={index} className="p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-3">
                        {index + 1}. {question.question}
                      </h3>
                      
                      <div className="space-y-2 mb-3">
                        {question.options.map((option, optIndex) => {
                          const isUserAnswer = userAnswer === optIndex;
                          const isCorrectOption = optIndex === question.correctAnswer;
                          
                          let optionStyle = "border-slate-200 bg-slate-50";
                          if (isCorrectOption) {
                            optionStyle = "border-green-300 bg-green-50";
                          } else if (isUserAnswer && !isCorrect) {
                            optionStyle = "border-red-300 bg-red-50";
                          }
                          
                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border-2 ${optionStyle}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-slate-900">{option}</span>
                                {isCorrectOption && (
                                  <span className="text-green-600 text-sm font-medium">✓ Correct</span>
                                )}
                                {isUserAnswer && !isCorrect && (
                                  <span className="text-red-600 text-sm font-medium">Your answer</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className={`p-3 rounded-lg ${
                        isCorrect ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-200"
                      }`}>
                        <p className="text-sm text-slate-700">
                          <span className="font-medium">Explanation:</span> {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={shareResults}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border-2 border-slate-200 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Share Results</span>
          </button>

          <button
            onClick={() => navigate("/join")}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Take Another Quiz</span>
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border-2 border-slate-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;