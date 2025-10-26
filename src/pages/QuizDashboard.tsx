import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Sparkles,
  Clock,
  Users,
  Trophy,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Share2,
  ExternalLink,
} from "lucide-react";
import { generateQuizWithGemini, generateQuizCode } from "../geminiapi";
import { saveQuizToFirebase, listenToParticipants } from "../firebase";

const QuizDashboard = ({ publicKey }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quizForm, setQuizForm] = useState({
    topic: "",
    numberOfQuestions: 5,
    difficulty: "medium",
  });
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [quizCode, setQuizCode] = useState(null);
  const [quizLink, setQuizLink] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const navigate = useNavigate();

  // Sample active quizzes (replace with actual data from Firebase)
  const [activeQuizzes, setActiveQuizzes] = useState([]);

 // DEBUG VERSION - QuizDashboard with detailed logging

// Add this AFTER line 55 where you see "console.log("Generated Questions:", questions);"
// Replace the entire try-catch block (lines 48-88) with this:

const handleCreateQuiz = async () => {
  if (!quizForm.topic.trim()) {
    setError("Please enter a quiz topic");
    return;
  }

  setIsCreating(true);
  setError("");

  try {
    // 1. Generate quiz using Gemini AI
    console.log("🎯 STEP 1: Generating questions with Gemini...");
    const questions = await generateQuizWithGemini({
      topic: quizForm.topic,
      numberOfQuestions: quizForm.numberOfQuestions,
      difficulty: quizForm.difficulty,
    });
    console.log("✅ STEP 1 COMPLETE: Generated", questions.length, "questions");
    console.log("Questions:", questions);

    // 2. Generate unique quiz code
    console.log("🎯 STEP 2: Generating quiz code...");
    const code = generateQuizCode();
    console.log("✅ STEP 2 COMPLETE: Code =", code);

    // 3. Create quiz object
    console.log("🎯 STEP 3: Creating quiz object...");
    const newQuiz = {
      code,
      topic: quizForm.topic,
      difficulty: quizForm.difficulty,
      questions: questions,
      questionsCount: questions.length,
      createdBy: publicKey,
    };
    console.log("✅ STEP 3 COMPLETE: Quiz object created");
    console.log("Quiz:", newQuiz);

    // 4. 🔥 SAVE TO FIREBASE (This is likely where it's failing!)
    console.log("🎯 STEP 4: Saving to Firebase...");
    console.log("Calling saveQuizToFirebase with:", newQuiz);
    
    try {
      await saveQuizToFirebase(newQuiz);
      console.log("✅ STEP 4 COMPLETE: Saved to Firebase successfully!");
    } catch (firebaseError) {
      console.error("❌ FIREBASE ERROR:", firebaseError);
      console.error("Error message:", firebaseError.message);
      console.error("Error stack:", firebaseError.stack);
      throw new Error(`Firebase save failed: ${firebaseError.message}`);
    }

    // 5. Generate shareable link
    console.log("🎯 STEP 5: Generating shareable link...");
    const shareableLink = `${window.location.origin}/join?code=${code}`;
    console.log("✅ STEP 5 COMPLETE: Link =", shareableLink);
    
    // 6. Update UI state
    console.log("🎯 STEP 6: Updating UI state...");
    setGeneratedQuiz(newQuiz);
    setQuizCode(code);
    setQuizLink(shareableLink);
    
    // Add to local state
    setActiveQuizzes([{ ...newQuiz, participants: 0 }, ...activeQuizzes]);
    
    console.log("🎉 ALL STEPS COMPLETE! Quiz created successfully!");
    
  } catch (err) {
    console.error("❌ QUIZ CREATION ERROR:", err);
    console.error("Error type:", err.name);
    console.error("Error message:", err.message);
    console.error("Full error:", err);
    setError(err.message || "Failed to create quiz. Please try again.");
  } finally {
    console.log("🏁 Cleaning up...");
    setIsCreating(false);
  }
};

  const copyQuizCode = () => {
    if (quizCode) {
      navigator.clipboard.writeText(quizCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyQuizLink = () => {
    if (quizLink) {
      navigator.clipboard.writeText(quizLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const shareQuiz = async () => {
    if (navigator.share && quizLink) {
      try {
        await navigator.share({
          title: `Join my quiz: ${generatedQuiz.topic}`,
          text: `Take this quiz about ${generatedQuiz.topic}! Use code: ${quizCode}`,
          url: quizLink,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      copyQuizLink();
    }
  };

  const resetForm = () => {
    setShowCreateModal(false);
    setQuizForm({
      topic: "",
      numberOfQuestions: 5,
      difficulty: "medium",
    });
    setGeneratedQuiz(null);
    setQuizCode(null);
    setQuizLink(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome Back!
          </h1>
          <p className="text-slate-600">
            Create AI-powered quizzes and share with anyone, anywhere
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-slate-900">0</span>
            </div>
            <p className="text-slate-600 text-sm">Total Rewards</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-slate-900">
                {activeQuizzes.length}
              </span>
            </div>
            <p className="text-slate-600 text-sm">Active Quizzes</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-slate-900">0</span>
            </div>
            <p className="text-slate-600 text-sm">Completed</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            <Sparkles className="w-5 h-5" />
            <span>Create Shareable Quiz</span>
          </button>
          <button
            onClick={() => navigate("/join")}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-md hover:shadow-lg border-2 border-slate-200 transition-all duration-200 active:scale-95"
          >
            <Users className="w-5 h-5" />
            <span>Join with Code</span>
          </button>
        </div>

        {/* Active Quizzes */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Your Quizzes</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {activeQuizzes.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                  <Plus className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 mb-4">No quizzes yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first quiz
                </button>
              </div>
            ) : (
              activeQuizzes.map((quiz) => (
                <QuizListItem key={quiz.code} quiz={quiz} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {!generatedQuiz ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Create Shareable Quiz
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Quiz Topic
                    </label>
                    <input
                      type="text"
                      value={quizForm.topic}
                      onChange={(e) =>
                        setQuizForm({ ...quizForm, topic: e.target.value })
                      }
                      placeholder="e.g., Blockchain Technology"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Number of Questions
                    </label>
                    <select
                      value={quizForm.numberOfQuestions}
                      onChange={(e) =>
                        setQuizForm({
                          ...quizForm,
                          numberOfQuestions: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                      <option value={20}>20 Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Difficulty
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["easy", "medium", "hard"].map((level) => (
                        <button
                          key={level}
                          onClick={() =>
                            setQuizForm({ ...quizForm, difficulty: level })
                          }
                          className={`py-2 px-4 rounded-lg font-medium capitalize transition-all ${
                            quizForm.difficulty === level
                              ? "bg-blue-500 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCreateQuiz}
                    disabled={isCreating || !quizForm.topic.trim()}
                    className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Quiz</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Quiz Created! 🎉
                  </h2>
                  <p className="text-slate-600">
                    Share this link with anyone to play
                  </p>
                </div>

                {/* Shareable Link */}
                <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl p-4 mb-4 border-2 border-blue-200">
                  <p className="text-sm text-slate-600 mb-2 font-medium">
                    📱 Shareable Link
                  </p>
                  <div className="flex items-center space-x-2 bg-white rounded-lg p-3">
                    <input
                      type="text"
                      value={quizLink}
                      readOnly
                      className="flex-1 text-sm text-blue-600 font-mono bg-transparent outline-none"
                    />
                    <button
                      onClick={copyQuizLink}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {linkCopied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-blue-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quiz Code */}
                <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
                  <p className="text-sm text-slate-600 mb-2 text-center">
                    Or use code
                  </p>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-3xl font-bold text-blue-600 tracking-widest">
                      {quizCode}
                    </span>
                    <button
                      onClick={copyQuizCode}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-blue-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quiz Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Topic</span>
                    <span className="font-medium text-slate-900">
                      {generatedQuiz.topic}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Questions</span>
                    <span className="font-medium text-slate-900">
                      {generatedQuiz.questionsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-600">Difficulty</span>
                    <span className="font-medium text-slate-900 capitalize">
                      {quizForm.difficulty}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={shareQuiz}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-lg transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share Quiz</span>
                  </button>

                  <button
                    onClick={resetForm}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Quiz List Item Component with real-time participant count
const QuizListItem = ({ quiz }) => {
  const [participantCount, setParticipantCount] = useState(quiz.participants || 0);

  useEffect(() => {
    // Listen to real-time participant updates
    const unsubscribe = listenToParticipants(quiz.code, (count) => {
      setParticipantCount(count);
    });

    return () => unsubscribe && unsubscribe();
  }, [quiz.code]);

  const quizLink = `${window.location.origin}/join?code=${quiz.code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(quizLink);
  };

  return (
    <div className="px-6 py-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1">{quiz.topic}</h3>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{quiz.questionsCount} questions</span>
            </span>
            <span className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{participantCount} participants</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Code</p>
            <span className="font-mono font-bold text-blue-600">
              {quiz.code}
            </span>
          </div>
          <button
            onClick={copyLink}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            title="Copy shareable link"
          >
            <ExternalLink className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizDashboard;