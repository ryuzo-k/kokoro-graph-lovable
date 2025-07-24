-- Allow users to view meetings where they are mentioned by display name
-- This is needed for calculating "people trust score" from others' evaluations

-- First, let's update the meetings table RLS policy to allow users to see meetings 
-- where they are mentioned as "other_name" (evaluated by others)

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own meetings" ON public.meetings;

-- Create new policies that allow viewing meetings in two cases:
-- 1. User created the meeting (existing functionality)
-- 2. User is mentioned as "other_name" in the meeting (new functionality for trust scores)

-- Policy 1: Users can view meetings they created
CREATE POLICY "Users can view meetings they created" 
ON public.meetings 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Users can view meetings where they are mentioned as "other_name"
-- We need to join with profiles to match display_name with other_name
CREATE POLICY "Users can view meetings where they are mentioned" 
ON public.meetings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.display_name = meetings.other_name
  )
);