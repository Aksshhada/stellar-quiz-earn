import React, { useState } from "react";
import { 
  Sparkles, 
  Users, 
  Plus, 
  Clock, 
  Trophy, 
  Play, 
  Search,
  Zap,
  Gift,
  TrendingUp
} from "lucide-react";

const QuizDashboard = ({ publicKey }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("join"); // 'join' or 'create'
  const [quizPrompt, setQuizPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  console.log(publicKey)

  // Mock ongoing quizzes data
  const ongoingQuizzes = [
    {
      id: 1,
      title: "Stellar Blockchain Basics",
      creator: "GBXH...4KL2",
      players: 12,
      maxPlayers: 20,
      timeLeft: "3:45",
      difficulty: "Easy",
      prize: "NFT Badge",
      status: "active"
    },
    {
      id: 2,
      title: "Advanced Smart Contracts",
      creator: "GCYP...8MN3",
      players: 8,
      maxPlayers: 15,
      timeLeft: "4:20",
      difficulty: "Hard",
      prize: "Exclusive NFT",
      status: "active"
    },
    {
      id: 3,
      title: "Crypto Trading Fundamentals",
      creator: "GDRF...2PQ9",
      players: 15,
      maxPlayers: 25,
      timeLeft: "2:15",
      difficulty: "Medium",
      prize: "Winner NFT",
      status: "active"
    },
    {
      id: 4,
      title: "Web3 Developer Quiz",
      creator: "GBKL...7XY4",
      players: 6,
      maxPlayers: 10,
      timeLeft: "4:50",
      difficulty: "Medium",
      prize: "Dev Badge NFT",
      status: "active"
    }
  ];

  const handleCreateQuiz = async () => {
    if (!quizPrompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      alert("Quiz created! Redirecting to quiz room...");
    }, 2000);
  };

  const handleJoinQuiz = (quizId) => {
    alert(`Joining quiz ${quizId}...`);
    // Navigate to quiz room
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "Easy": return "bg-green-100 text-green-700 border-green-300";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Hard": return "bg-red-100 text-red-700 border-red-300";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by AI & Stellar Blockchain</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Quiz Arena
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Compete, Learn, and Win Exclusive NFTs
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Multiplayer Rooms</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>5 Minute Challenges</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>NFT Rewards</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-xl p-1 shadow-lg border border-slate-200">
            <button
              onClick={() => setActiveTab("join")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "join"
                  ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Join Quiz</span>
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>Create Quiz</span>
            </button>
          </div>
        </div>

        {/* Join Quiz Tab */}
        {activeTab === "join" && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search quizzes by title, creator, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium mb-1">Active Rooms</p>
                    <p className="text-3xl font-bold text-slate-900">{ongoingQuizzes.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium mb-1">Total Players</p>
                    <p className="text-3xl font-bold text-slate-900">41</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium mb-1">NFTs Minted</p>
                    <p className="text-3xl font-bold text-slate-900">127</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quiz Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ongoingQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          {quiz.title}
                        </h3>
                        <p className="text-sm text-slate-600 font-mono">
                          Created by: {quiz.creator}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {quiz.players}/{quiz.maxPlayers} Players
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{quiz.timeLeft} left</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 mb-4 border border-amber-200">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-900">
                          Prize: {quiz.prize}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinQuiz(quiz.id)}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2"
                    >
                      <Play className="w-5 h-5" />
                      <span>Join Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Quiz Tab */}
        {activeTab === "create" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-violet-600 p-8 text-white">
                <div className="flex items-center space-x-3 mb-3">
                  <Sparkles className="w-8 h-8" />
                  <h2 className="text-3xl font-bold">Create AI Quiz</h2>
                </div>
                <p className="text-blue-100">
                  Describe your quiz topic and let AI generate questions for you
                </p>
              </div>

              <div className="p-8 space-y-6">
                {/* Quiz Topic Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Quiz Topic or Prompt
                  </label>
                  <textarea
                    value={quizPrompt}
                    onChange={(e) => setQuizPrompt(e.target.value)}
                    placeholder="E.g., 'Create a quiz about Stellar blockchain features and use cases' or 'Generate questions about DeFi fundamentals'"
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none text-slate-900 placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Be specific about the topic, difficulty level, and any particular areas you want to focus on
                  </p>
                </div>

                {/* Quiz Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Max Players
                    </label>
                    <select className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-slate-900">
                      <option>10 Players</option>
                      <option>15 Players</option>
                      <option>20 Players</option>
                      <option>25 Players</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Difficulty Level
                    </label>
                    <select className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-slate-900">
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">
                          5 Minute Timer
                        </h4>
                        <p className="text-xs text-blue-700">
                          Each quiz runs for exactly 5 minutes
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <Gift className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-purple-900 mb-1">
                          NFT Reward
                        </h4>
                        <p className="text-xs text-purple-700">
                          Top player receives a minted NFT
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateQuiz}
                  disabled={!quizPrompt.trim() || isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Quiz...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate & Create Quiz</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">AI-Powered</h3>
                <p className="text-sm text-slate-600">Questions generated by advanced AI</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Live Leaderboard</h3>
                <p className="text-sm text-slate-600">Real-time ranking updates</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">NFT Rewards</h3>
                <p className="text-sm text-slate-600">Exclusive NFTs for winners</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDashboard;