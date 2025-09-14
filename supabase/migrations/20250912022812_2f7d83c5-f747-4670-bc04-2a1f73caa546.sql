-- Create table for multiplayer invitations
CREATE TABLE public.multiplayer_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL,
  inviter_id UUID NOT NULL,
  invited_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.multiplayer_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for multiplayer invitations
CREATE POLICY "Users can view invitations they sent or received" 
ON public.multiplayer_invitations 
FOR SELECT 
USING ((auth.uid() = inviter_id) OR (auth.uid() = invited_id));

CREATE POLICY "Users can create invitations" 
ON public.multiplayer_invitations 
FOR INSERT 
WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update invitations they received" 
ON public.multiplayer_invitations 
FOR UPDATE 
USING (auth.uid() = invited_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_multiplayer_invitations_updated_at
BEFORE UPDATE ON public.multiplayer_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically expire old invitations
CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.multiplayer_invitations
  SET status = 'expired'
  WHERE status = 'pending' 
    AND created_at < (now() - INTERVAL '10 minutes');
END;
$$;