import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Trophy, Coins, Award } from "lucide-react";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

export const QuizResults = ({ score, totalQuestions, onRestart }: QuizResultsProps) => {
  const [stellarWallet, setStellarWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const percentage = (score / totalQuestions) * 100;
  const rewardAmount = score * 10; // 10 XLM per correct answer

  const handleClaimReward = async () => {
    if (!stellarWallet) {
      toast({
        title: "Wallet required",
        description: "Please enter your Stellar wallet address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save quiz attempt to database
      const { error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert({
          user_id: user.id,
          score,
          total_questions: totalQuestions,
          stellar_wallet: stellarWallet,
          reward_amount: rewardAmount,
        });

      if (attemptError) throw attemptError;

      // Call edge function to send rewards
      const { data, error } = await supabase.functions.invoke("stellar-rewards", {
        body: {
          wallet: stellarWallet,
          amount: rewardAmount,
          score,
          totalQuestions,
        },
      });

      if (error) throw error;

      toast({
        title: "Rewards claimed!",
        description: `${rewardAmount} XLM sent to your wallet. Check your Stellar account!`,
      });

      // Update profile with rewards
      await supabase
        .from("profiles")
        .update({
          total_rewards: rewardAmount,
          quizzes_completed: 1,
          stellar_wallet: stellarWallet,
        })
        .eq("id", user.id);

    } catch (error: any) {
      toast({
        title: "Claim failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      <Card className="p-8 text-center">
        <Trophy className="w-20 h-20 mx-auto mb-4 text-primary" />
        <h2 className="text-4xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-muted-foreground mb-6">Great job on completing the quiz</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">{score}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold">{percentage}%</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">{rewardAmount}</div>
            <div className="text-sm text-muted-foreground">XLM Earned</div>
          </div>
        </div>

        {percentage >= 70 && (
          <div className="p-4 bg-primary/10 rounded-lg mb-6 flex items-center justify-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            <span className="font-semibold">NFT Certificate Eligible!</span>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Coins className="w-6 h-6 text-primary" />
          Claim Your Rewards
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet">Stellar Wallet Address (Testnet)</Label>
            <Input
              id="wallet"
              placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={stellarWallet}
              onChange={(e) => setStellarWallet(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter your Stellar testnet wallet address to receive your rewards
            </p>
          </div>

          <Button
            onClick={handleClaimReward}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Processing..." : `Claim ${rewardAmount} XLM Rewards`}
          </Button>
        </div>
      </Card>

      <Button onClick={onRestart} variant="outline" className="w-full">
        Take Another Quiz
      </Button>
    </div>
  );
};
