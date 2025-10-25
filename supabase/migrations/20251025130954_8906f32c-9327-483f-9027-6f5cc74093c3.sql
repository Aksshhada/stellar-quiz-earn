-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'blockchain',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  stellar_wallet TEXT,
  reward_sent BOOLEAN DEFAULT FALSE,
  reward_amount NUMERIC(10, 7),
  transaction_hash TEXT,
  nft_issued BOOLEAN DEFAULT FALSE,
  nft_asset_code TEXT,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  stellar_wallet TEXT,
  total_rewards NUMERIC(10, 7) DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_questions (public read)
CREATE POLICY "Anyone can view quiz questions"
  ON public.quiz_questions
  FOR SELECT
  USING (true);

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own attempts"
  ON public.quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
  ON public.quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, SPLIT_PART(NEW.email, '@', 1));
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert sample quiz questions
INSERT INTO public.quiz_questions (question, options, correct_answer, difficulty, category) VALUES
('What is Stellar?', '["A social media platform", "A distributed blockchain network", "A cryptocurrency exchange", "A mobile payment app"]', 1, 'easy', 'stellar'),
('What is the native cryptocurrency of Stellar?', '["XRP", "XLM (Lumens)", "BTC", "ETH"]', 1, 'easy', 'stellar'),
('What is the primary purpose of Stellar?', '["Gaming", "Cross-border payments and asset tokenization", "Social networking", "Video streaming"]', 1, 'medium', 'stellar'),
('What consensus mechanism does Stellar use?', '["Proof of Work", "Proof of Stake", "Stellar Consensus Protocol (SCP)", "Delegated Proof of Stake"]', 2, 'medium', 'stellar'),
('What is an anchor in the Stellar network?', '["A hardware wallet", "A trusted entity that holds deposits and issues credits", "A mining pool", "A smart contract"]', 1, 'hard', 'stellar'),
('What is Soroban?', '["A Stellar wallet", "Stellar smart contracts platform", "A cryptocurrency", "A trading bot"]', 1, 'medium', 'stellar'),
('What is the average transaction time on Stellar?', '["10 minutes", "1 hour", "3-5 seconds", "1 minute"]', 2, 'medium', 'stellar'),
('What makes Stellar different from Bitcoin?', '["It uses Proof of Work", "It focuses on fast, low-cost cross-border transactions", "It has limited supply", "It requires mining"]', 1, 'medium', 'stellar'),
('What is a trustline in Stellar?', '["A security feature", "Permission to hold a specific asset from an issuer", "A transaction record", "A wallet backup"]', 1, 'hard', 'stellar'),
('What is the minimum XLM balance required to maintain a Stellar account?', '["0 XLM", "1 XLM", "10 XLM", "100 XLM"]', 1, 'hard', 'stellar');