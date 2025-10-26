// src/pages/QuizResults.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Share2,
  Home,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  Users,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { submitQuizResult, getLeaderboard } from "../firebase";
import { mintRewardNFT, shouldMintReward, getNFTMetadata } from "../nftService";
import { StellarService } from "@/StellarService";
import { checkConnection } from "../components/auth/Frighter";

const QuizResults = ({ publicKey }) => {
  console.log("🏁 QuizResults mounted for publicKey:", publicKey);
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [nftMinting, setNftMinting] = useState(false);
  const [nftMinted, setNftMinted] = useState(false);
  const [nftTxHash, setNftTxHash] = useState(null);
  const [nftMetadata, setNftMetadata] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [error, setError] = useState("");

  const { quiz, answers, timeElapsed } = location.state || {};

  useEffect(() => {
    if (!quiz || !answers || !publicKey) {
      setError("Missing quiz data or wallet connection");
      navigate("/dashboard");
      return;
    }

    processResults();
  }, []);

  const processResults = async () => {
    setLoading(true);
    try {
      const score = calculateScore();
      const correctCount = getCorrectCount();

      // Submit result to Firebase
      const result = {
        publicKey,
        score,
        correctCount,
        totalQuestions: quiz.questions.length,
        timeElapsed,
        answers,
        completedAt: Date.now(),
      };
      await submitQuizResult(code, publicKey, result);
      console.log("✅ Result submitted to Firebase");

      // Load leaderboard
      const leaderboardData = await getLeaderboard(code);
      setLeaderboard(leaderboardData);

      // Find user's rank
      const rank = leaderboardData.findIndex((r) => r.publicKey === publicKey) + 1;
      setUserRank(rank);

      // Check Freighter connection
      const isFreighterConnected = await checkConnection();
      if (!isFreighterConnected) {
        setError("Freighter wallet is not connected. Please ensure Freighter is installed and allowed.");
        return;
      }

      // Mint NFT if score qualifies
      if (shouldMintReward(score)) {
        await mintNFTReward();
      }

      // Load NFT metadata
      const stellarService = new StellarService(publicKey);
      const metadata = await getNFTMetadata(stellarService);
      setNftMetadata(metadata);
    } catch (error) {
      console.error("Error processing results:", error);
      setError(`Failed to process quiz results: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const mintNFTReward = async () => {
    setNftMinting(true);
    setError("");
    try {
      console.log("🎨 Attempting to mint NFT reward...");
      const stellarService = new StellarService(publicKey);
      const result = await mintRewardNFT( publicKey);

      if (result.success) {
        setNftMinted(true);
        setNftTxHash(result.txHash);
        console.log("✅ NFT minted successfully!");
        console.log("Explorer URL:", result.explorerUrl);
      } 
    } catch (error) {
      console.error("NFT Minting Error:", error);
    } finally {
      setNftMinting(false);
    }
  };

  const calculateScore = () => {
    if (!quiz || !answers) return 0;
    const correct = answers.filter(
      (answer, index) => answer === quiz.questions[index].correctAnswer
    ).length;
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const getCorrectCount = () => {
    if (!quiz || !answers) return 0;
    return answers.filter(
      (answer, index) => answer === quiz.questions[index].correctAnswer
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

  const shareResults = async () => {
    const score = calculateScore();
    const quizLink = `${window.location.origin}/join?code=${code}`;
    let text = `I just scored ${score}% on "${quiz.topic}" quiz! 🎯`;
    if (nftMinted) {
      text += `\n\n🎨 And I earned an NFT reward!`;
    }
    text += `\n\nTake the quiz: ${quizLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Quiz Results", text });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Results copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!quiz || !answers || !publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg">
          <p className="text-slate-600 mb-4">No quiz data or wallet connection available</p>
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
  const earnedNFT = shouldMintReward(score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
              earnedNFT
                ? "bg-gradient-to-br from-green-400 to-emerald-500"
                : "bg-gradient-to-br from-orange-400 to-red-500"
            }`}
          >
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {earnedNFT ? "Congratulations! 🎉" : "Quiz Complete!"}
          </h1>
          <p className="text-slate-600 text-lg mb-8">{quiz.topic}</p>
          <div className="inline-flex items-center space-x-4 mb-8">
            <div className={`text-6xl font-bold ${scoreGrade.color}`}>{score}%</div>
            <div className={`px-6 py-3 rounded-xl ${scoreGrade.bg}`}>
              <div className={`text-3xl font-bold ${scoreGrade.color}`}>{scoreGrade.grade}</div>
            </div>
          </div>
          <p className="text-slate-600">
            You answered <span className="font-semibold text-slate-900">{correctCount}</span> out of{" "}
            <span className="font-semibold text-slate-900">{quiz.questions.length}</span> questions correctly
          </p>
          {userRank && (
            <p className="text-blue-600 font-semibold mt-2">🏆 Rank #{userRank} on leaderboard</p>
          )}
        </div>
        {earnedNFT && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">🎨 NFT Reward Earned!</h3>
                {nftMinting && (
                  <div className="flex items-center space-x-2 text-purple-700 mb-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Minting your NFT reward...</span>
                  </div>
                )}
                {nftMinted && nftTxHash && (
                  <div className="space-y-2">
                    <p className="text-green-700 font-medium mb-2">✅ NFT successfully minted to your wallet!</p>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${nftTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      <span>View Transaction</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {nftMetadata && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-3">
                          {nftMetadata.imageUri && (
                            <img
                              src={nftMetadata.imageUri}
                              alt="NFT"
                              className="w-16 h-16 rounded-lg object-cover"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">{nftMetadata.name}</p>
                            <p className="text-sm text-slate-600">Symbol: {nftMetadata.symbol}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!nftMinting && !nftMinted && (
                  <div>
                    <p className="text-purple-700 mb-2">
                      You scored {score}%! Click below to mint your NFT reward.
                    </p>
                    <button
                      onClick={mintNFTReward}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      Mint NFT
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
        {leaderboard.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-violet-50">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Leaderboard</h2>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {leaderboard.slice(0, 5).map((entry, index) => {
                const isCurrentUser = entry.publicKey === publicKey;
                return (
                  <div
                    key={entry.publicKey}
                    className={`px-6 py-4 ${isCurrentUser ? "bg-blue-50" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0
                              ? "bg-yellow-400 text-white"
                              : index === 1
                              ? "bg-slate-300 text-white"
                              : index === 2
                              ? "bg-orange-400 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className={`font-medium ${isCurrentUser ? "text-blue-700" : "text-slate-900"}`}>
                            {isCurrentUser ? "You" : entry.publicKey.slice(0, 8) + "..."}
                          </p>
                          <p className="text-sm text-slate-500">{formatTime(entry.timeElapsed)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{entry.score}%</p>
                        <p className="text-sm text-slate-600">
                          {entry.correctCount}/{entry.totalQuestions} correct
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCorrect ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
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
                            <div key={optIndex} className={`p-3 rounded-lg border-2 ${optionStyle}`}>
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
                      <div
                        className={`p-3 rounded-lg ${
                          isCorrect ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-200"
                        }`}
                      >
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