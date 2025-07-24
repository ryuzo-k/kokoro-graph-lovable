-- Make all network data public - remove privacy restrictions
-- Users must agree to share their data publicly to use this service

-- Drop existing restrictive policies for people table
DROP POLICY IF EXISTS "Users can view their own people" ON public.people;

-- Create new public policy for people
CREATE POLICY "Everyone can view all people" 
ON public.people 
FOR SELECT 
USING (true);

-- Drop existing restrictive policies for meetings table  
DROP POLICY IF EXISTS "Users can view their own meetings" ON public.meetings;

-- Create new public policy for meetings
CREATE POLICY "Everyone can view all meetings" 
ON public.meetings 
FOR SELECT 
USING (true);

-- Enable realtime for people and meetings tables
ALTER TABLE public.people REPLICA IDENTITY FULL;
ALTER TABLE public.meetings REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.people;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;