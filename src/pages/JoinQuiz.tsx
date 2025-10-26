import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hash, ArrowRight, AlertCircle } from "lucide-react";

const JoinQuiz = ({ publicKey }) => {
  const [quizCode, setQuizCode] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setQuizCode(value);
    setError("");
  };

  const handleJoinQuiz = async () => {
    if (quizCode.length !== 6) {
      setError("Please enter a valid 6-digit quiz code");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      // TODO: Add your API call here to verify the quiz exists
      // Example:
      // const response = await fetch(`/api/quiz/verify/${quizCode}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ publicKey })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to quiz interface
      navigate(`/quiz/${quizCode}`);
    } catch (err) {
      console.error("Error joining quiz:", err);
      setError("Failed to join quiz. Please check the code and try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && quizCode.length === 6) {
      handleJoinQuiz();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full mb-4">
              <Hash className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Join a Quiz
            </h1>
            <p className="text-slate-600">
              Enter the 6-digit code to join
            </p>
          </div>

          {/* Connected Wallet Display */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                Wallet Connected
              </span>
            </div>
            <div className="font-mono text-xs text-slate-700 bg-white rounded-lg p-2 break-all">
              {publicKey}
            </div>
          </div>

          {/* Code Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quiz Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={quizCode}
                onChange={handleCodeChange}
                onKeyPress={handleKeyPress}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-4 text-center text-3xl font-bold tracking-widest border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
              {quizCode.length === 6 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-2 text-center">
              {quizCode.length}/6 digits
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Join Button */}
          <button
            onClick={handleJoinQuiz}
            disabled={quizCode.length !== 6 || isJoining}
            className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isJoining ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Joining...</span>
              </>
            ) : (
              <>
                <span>Join Quiz</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">or</span>
            </div>
          </div>

          {/* Create Quiz Link */}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            Create your own quiz instead
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Don't have a code?{" "}
            <button
              onClick={() => navigate("/dashboard")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create a new quiz
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz;