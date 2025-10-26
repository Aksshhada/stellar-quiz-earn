import React, { useState } from "react";
import { Wallet, AlertCircle, Menu, X } from "lucide-react";
import { requestAccess } from "@stellar/freighter-api";
import { useNavigate, useLocation } from "react-router-dom";

const Header = ({ publicKey, setPublicKey }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Helper to shorten wallet address
  const truncateAddress = (address) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  // ✅ Connect Wallet Handler
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError("");
      const access = await requestAccess();

      if (access?.address) {
        setPublicKey(access.address);
        // Only navigate if on landing page
        if (location.pathname === "/") {
          navigate("/dashboard");
        }
      } else {
        setError("Wallet connection failed. Please try again.");
      }
    } catch (err) {
      console.error("Freighter connect error:", err);
      setError("Error connecting to Freighter wallet. Make sure it's installed.");
    } finally {
      setIsConnecting(false);
    }
  };

  // ✅ Disconnect Handler
  const disconnectWallet = () => {
    setPublicKey("");
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent hidden sm:block">
                Stellar Quiz
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {publicKey && (
                <>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate("/join")}
                    className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Join Quiz
                  </button>
                  <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-800">
                        Connected
                      </span>
                    </div>
                    <div className="h-5 w-px bg-green-300"></div>
                    <span className="text-sm font-mono text-slate-900 font-medium">
                      {truncateAddress(publicKey)}
                    </span>
                  </div>
                </>
              )}

              {publicKey ? (
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>Connect Wallet</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-700" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-200 ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-4 space-y-4 bg-slate-50">
            {publicKey ? (
              <>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-800">
                        Connected
                      </span>
                    </div>
                  </div>
                  <div className="font-mono text-xs text-slate-900 bg-white rounded-lg p-2 break-all">
                    {publicKey}
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors border border-slate-200"
                >
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    navigate("/join");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors border border-slate-200"
                >
                  Join Quiz
                </button>

                <button
                  onClick={() => {
                    disconnectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  Disconnect Wallet
                </button>
              </>
            ) : (
              <>
                {error && (
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>Connect Wallet</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-slate-500">
                  Secure connection via Freighter wallet
                </p>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Error Toast - Desktop */}
      {error && !mobileMenuOpen && (
        <div className="hidden md:block fixed top-20 right-4 z-50 max-w-sm animate-slide-in">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200 shadow-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 mb-1">
                  Connection Error
                </h3>
                <p className="text-xs text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;