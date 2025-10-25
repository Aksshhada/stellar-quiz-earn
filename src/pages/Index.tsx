import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Login } from "@/components/auth/Login";
import { Signup } from "@/components/auth/Signup";
import { Quiz } from "@/components/quiz/Quiz";
import { Button } from "@/components/ui/button";
import { Brain, Award, Coins, TrendingUp } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="w-12 h-12 text-primary" />
              <h1 className="text-5xl font-bold">Stellar Quiz</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn about blockchain, crypto, and Stellar while earning real rewards on the testnet
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="p-6 rounded-lg bg-card border text-center">
              <Brain className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-bold mb-2">Learn</h3>
              <p className="text-sm text-muted-foreground">
                Answer questions about blockchain and Stellar
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border text-center">
              <Coins className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-bold mb-2">Earn</h3>
              <p className="text-sm text-muted-foreground">
                Get XLM rewards for correct answers
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border text-center">
              <Award className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-bold mb-2">Achieve</h3>
              <p className="text-sm text-muted-foreground">
                Earn NFT certificates for high scores
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            {showLogin ? (
              <Login onToggleMode={() => setShowLogin(false)} />
            ) : (
              <Signup onToggleMode={() => setShowLogin(true)} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Stellar Quiz</h1>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Test Your Knowledge</h2>
            <p className="text-muted-foreground">
              Answer questions correctly to earn XLM rewards and NFT certificates
            </p>
          </div>

          <Quiz />
        </div>
      </div>
    </div>
  );
};

export default Index;
