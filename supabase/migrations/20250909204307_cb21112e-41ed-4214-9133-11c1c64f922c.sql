-- Create friendships table
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Create policies for friendships
CREATE POLICY "Users can view their own friendships" 
ON public.friendships 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendship requests" 
ON public.friendships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendship status" 
ON public.friendships 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update profiles table to include more detailed stats
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS games_won INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS games_lost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS multiplayer_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS multiplayer_losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS speed_games_played INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS normal_games_played INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_score DECIMAL(10,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS win_percentage DECIMAL(5,2) DEFAULT 0.0;

-- Update game_sessions table to include opponent info for multiplayer
ALTER TABLE public.game_sessions 
ADD COLUMN IF NOT EXISTS opponent_id UUID,
ADD COLUMN IF NOT EXISTS game_result TEXT CHECK (game_result IN ('win', 'loss', 'draw')),
ADD COLUMN IF NOT EXISTS room_id UUID;

-- Create function to update user stats after each game
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile stats
  UPDATE public.profiles 
  SET 
    games_played = games_played + 1,
    total_score = total_score + NEW.final_score,
    games_won = CASE 
      WHEN NEW.game_result = 'win' THEN games_won + 1 
      ELSE games_won 
    END,
    games_lost = CASE 
      WHEN NEW.game_result = 'loss' THEN games_lost + 1 
      ELSE games_lost 
    END,
    multiplayer_wins = CASE 
      WHEN NEW.game_mode = 'multiplayer' AND NEW.game_result = 'win' THEN multiplayer_wins + 1 
      ELSE multiplayer_wins 
    END,
    multiplayer_losses = CASE 
      WHEN NEW.game_mode = 'multiplayer' AND NEW.game_result = 'loss' THEN multiplayer_losses + 1 
      ELSE multiplayer_losses 
    END,
    speed_games_played = CASE 
      WHEN NEW.game_mode = 'speed' THEN speed_games_played + 1 
      ELSE speed_games_played 
    END,
    normal_games_played = CASE 
      WHEN NEW.game_mode = 'normal' THEN normal_games_played + 1 
      ELSE normal_games_played 
    END,
    best_streak = CASE 
      WHEN NEW.max_streak > best_streak THEN NEW.max_streak 
      ELSE best_streak 
    END,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  -- Update calculated fields
  UPDATE public.profiles 
  SET 
    average_score = CASE 
      WHEN games_played > 0 THEN ROUND(total_score::decimal / games_played, 2)
      ELSE 0 
    END,
    win_percentage = CASE 
      WHEN games_played > 0 THEN ROUND((games_won::decimal / games_played) * 100, 2)
      ELSE 0 
    END
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update stats after game session insert
CREATE TRIGGER update_user_stats_after_game
AFTER INSERT ON public.game_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_stats();

-- Enable realtime for friendships
ALTER TABLE public.friendships REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;