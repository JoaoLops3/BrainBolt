-- Optimize Multiplayer Performance
-- Add indexes for faster queries
-- Add trigger for automatic activity updates

-- 1. Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_game_status 
ON multiplayer_rooms(game_status);

CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_room_code 
ON multiplayer_rooms(room_code);

CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_host_id 
ON multiplayer_rooms(host_id);

CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_guest_id 
ON multiplayer_rooms(guest_id);

CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_status_guest 
ON multiplayer_rooms(game_status, guest_id) 
WHERE game_status = 'waiting';

-- 2. Add index for multiplayer answers
CREATE INDEX IF NOT EXISTS idx_multiplayer_answers_room_user 
ON multiplayer_answers(room_id, user_id);

CREATE INDEX IF NOT EXISTS idx_multiplayer_answers_question 
ON multiplayer_answers(question_id);

-- 3. Add last_activity column if not exists
ALTER TABLE multiplayer_rooms 
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Create function to update scores atomically
CREATE OR REPLACE FUNCTION increment_score(
  room_id UUID,
  score_field TEXT,
  points INTEGER DEFAULT 100
)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'UPDATE multiplayer_rooms SET %I = COALESCE(%I, 0) + $2 WHERE id = $1',
    score_field, score_field
  ) USING room_id, points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to automatically update last_activity on INSERT/UPDATE
CREATE OR REPLACE FUNCTION update_multiplayer_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_multiplayer_rooms_last_activity ON multiplayer_rooms;
CREATE TRIGGER update_multiplayer_rooms_last_activity
  BEFORE UPDATE ON multiplayer_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_multiplayer_last_activity();

DROP TRIGGER IF EXISTS insert_multiplayer_rooms_last_activity ON multiplayer_rooms;
CREATE TRIGGER insert_multiplayer_rooms_last_activity
  BEFORE INSERT ON multiplayer_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_multiplayer_last_activity();

-- 7. Create function to clean up old rooms (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_multiplayer_rooms()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM multiplayer_rooms 
  WHERE created_at < NOW() - INTERVAL '24 hours'
    AND game_status IN ('waiting', 'finished');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Add column for room expiry (if needed for cleanup)
ALTER TABLE multiplayer_rooms 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE 
DEFAULT (NOW() + INTERVAL '2 hours');

-- 9. Update policies to allow heartbeat updates
CREATE POLICY "Users can update their own room heartbeat" 
ON multiplayer_rooms 
FOR UPDATE 
USING (
  auth.uid() = host_id OR auth.uid() = guest_id
);

-- 10. Create function to check room connectivity
CREATE OR REPLACE FUNCTION check_room_connectivity(room_id UUID)
RETURNS JSON AS $$
DECLARE
  room_data RECORD;
  result JSON;
BEGIN
  SELECT 
    id,
    host_id,
    guest_id,
    last_activity,
    EXTRACT(EPOCH FROM (NOW() - last_activity)) as seconds_since_activity
  INTO room_data
  FROM multiplayer_rooms 
  WHERE id = room_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Room not found');
  END IF;
  
  result := json_build_object(
    'room_id', room_data.id,
    'host_id', room_data.host_id,
    'guest_id', room_data.guest_id,
    'last_activity', room_data.last_activity,
    'seconds_since_activity', room_data.seconds_since_activity,
    'is_active', room_data.seconds_since_activity < 30
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create view for room statistics (useful for monitoring)
CREATE OR REPLACE VIEW multiplayer_room_stats AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as total_rooms,
  COUNT(*) FILTER (WHERE game_status = 'waiting') as waiting_rooms,
  COUNT(*) FILTER (WHERE game_status = 'playing') as playing_rooms,
  COUNT(*) FILTER (WHERE game_status = 'finished') as finished_rooms,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_duration_seconds
FROM multiplayer_rooms 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- 12. Grant necessary permissions
GRANT EXECUTE ON FUNCTION increment_score TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_multiplayer_rooms TO service_role;
GRANT EXECUTE ON FUNCTION check_room_connectivity TO authenticated;
GRANT SELECT ON multiplayer_room_stats TO authenticated;
