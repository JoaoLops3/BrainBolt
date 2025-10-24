-- Fix multiplayer room access policies
-- Allow users to view available rooms for joining

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can view rooms they are part of" ON public.multiplayer_rooms;
DROP POLICY IF EXISTS "Users can view available rooms and rooms they are part of" ON public.multiplayer_rooms;
DROP POLICY IF EXISTS "Users can update rooms they are part of" ON public.multiplayer_rooms;

-- Create new policy that allows viewing available rooms
CREATE POLICY "Users can view available rooms and rooms they are part of" 
ON public.multiplayer_rooms 
FOR SELECT 
USING (
  -- Can view rooms they are part of (host or guest)
  auth.uid() = host_id OR auth.uid() = guest_id
  OR
  -- Can view available rooms (waiting status with no guest)
  (game_status = 'waiting' AND guest_id IS NULL)
);

-- Create the update policy
CREATE POLICY "Users can update rooms they are part of" 
ON public.multiplayer_rooms 
FOR UPDATE 
USING (auth.uid() = host_id OR auth.uid() = guest_id)
WITH CHECK (auth.uid() = host_id OR auth.uid() = guest_id);
