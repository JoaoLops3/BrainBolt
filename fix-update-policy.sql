-- Execute this SQL in your Supabase Dashboard SQL Editor
-- Fix multiplayer room UPDATE policy to allow joining

-- Drop ALL existing update policies first
DROP POLICY IF EXISTS "Users can update rooms they are part of" ON public.multiplayer_rooms;
DROP POLICY IF EXISTS "Users can update their own room heartbeat" ON public.multiplayer_rooms;
DROP POLICY IF EXISTS "Users can update rooms they are part of or join available rooms" ON public.multiplayer_rooms;

-- Create new policy that allows joining available rooms
CREATE POLICY "Users can update rooms they are part of or join available rooms" 
ON public.multiplayer_rooms 
FOR UPDATE 
USING (
  -- Can update rooms they are already part of
  auth.uid() = host_id OR auth.uid() = guest_id
  OR
  -- Can join available rooms (waiting status with no guest)
  (game_status = 'waiting' AND guest_id IS NULL)
)
WITH CHECK (
  -- Can update rooms they are part of
  auth.uid() = host_id OR auth.uid() = guest_id
  OR
  -- Can join available rooms (becoming guest)
  (game_status = 'waiting' AND guest_id = auth.uid())
);
