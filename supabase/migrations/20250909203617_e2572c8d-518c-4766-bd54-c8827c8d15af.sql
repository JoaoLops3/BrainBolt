-- Create multiplayer game rooms table
CREATE TABLE public.multiplayer_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  host_id UUID NOT NULL,
  guest_id UUID,
  current_question_id TEXT,
  current_question_index INTEGER DEFAULT 0,
  host_score INTEGER DEFAULT 0,
  guest_score INTEGER DEFAULT 0,
  host_answer INTEGER,
  guest_answer INTEGER,
  question_start_time TIMESTAMP WITH TIME ZONE,
  game_status TEXT DEFAULT 'waiting' CHECK (game_status IN ('waiting', 'playing', 'question_answered', 'finished')),
  winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.multiplayer_rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for multiplayer rooms
CREATE POLICY "Users can view rooms they are part of" 
ON public.multiplayer_rooms 
FOR SELECT 
USING (auth.uid() = host_id OR auth.uid() = guest_id);

CREATE POLICY "Users can create rooms as host" 
ON public.multiplayer_rooms 
FOR INSERT 
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update rooms they are part of" 
ON public.multiplayer_rooms 
FOR UPDATE 
USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_multiplayer_rooms_updated_at
BEFORE UPDATE ON public.multiplayer_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for multiplayer rooms
ALTER TABLE public.multiplayer_rooms REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_rooms;