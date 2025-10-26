import React from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Sparkles, Users, Trophy, Clock, Shield } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Generated Quizzes",
      description: "Powered by Google Gemini AI for intelligent, dynamic question generation"
    },
    {
      icon: Users,
      title: "Join with Code",
      description: "Simple 6-digit codes to join any quiz instantly"
    },
    {
      icon: Trophy,
      title: "Compete & Win",
      description: "Earn rewards on the Stellar blockchain for top performances"
    },
    {
      icon: Clock,
      title: "Real-Time Results",
      description: "See your performance and rankings update live"
    },
    {
      icon: Shield,
      title: "Blockchain Security",
      description: "Secure, transparent, and verifiable with Stellar technology"
    },
    {
      icon: Wallet,
      title: "Web3 Integration",
      description: "Connect your Freighter wallet and start earning"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Stellar Quiz
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto">
              AI-powered quizzes on the blockchain. Learn, compete, and earn rewards.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              <Wallet className="w-5 h-5" />
              <span>Connect & Start</span>
            </button>
            <button
              onClick={() => navigate("/join")}
              className="flex items-center space-x-3 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-md hover:shadow-lg border-2 border-slate-200 transition-all duration-200 active:scale-95"
            >
              <Users className="w-5 h-5" />
              <span>Join a Quiz</span>
            </button>
          </div>

          {/* Trust Badge */}
          <div className="pt-8">
            <p className="text-sm text-slate-500 mb-4">Powered by</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg"></div>
                <span className="font-semibold text-slate-700">Stellar</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-8 h-8 text-purple-500" />
                <span className="font-semibold text-slate-700">Google Gemini</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Why Choose Stellar Quiz?
          </h2>
          <p className="text-lg text-slate-600">
            The future of interactive learning and earning
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect Wallet",
                description: "Link your Freighter wallet to get started securely"
              },
              {
                step: "02",
                title: "Create or Join",
                description: "Start a new quiz or join one with a 6-digit code"
              },
              {
                step: "03",
                title: "Play & Earn",
                description: "Answer questions and earn rewards on the blockchain"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full text-white font-bold text-2xl mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-gradient-to-r from-blue-500 to-violet-600 rounded-2xl p-8 md:p-12 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of learners earning on the blockchain
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Connect Your Wallet Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">
            © 2025 Stellar Quiz. Built on Stellar blockchain with AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;