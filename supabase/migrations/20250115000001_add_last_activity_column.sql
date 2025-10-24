-- Add last_activity column to multiplayer_rooms if it doesn't exist
-- This column is used for tracking room activity and cleanup

-- Add last_activity column if not exists
ALTER TABLE public.multiplayer_rooms 
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have current timestamp
UPDATE public.multiplayer_rooms 
SET last_activity = NOW() 
WHERE last_activity IS NULL;

-- Create trigger to automatically update last_activity on INSERT/UPDATE
CREATE OR REPLACE FUNCTION update_multiplayer_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_multiplayer_rooms_last_activity ON public.multiplayer_rooms;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_multiplayer_rooms_last_activity
  BEFORE INSERT OR UPDATE ON public.multiplayer_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_multiplayer_last_activity();
