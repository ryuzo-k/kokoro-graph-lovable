-- Fix infinite recursion in community_memberships policies completely
-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view community memberships where they are members" ON public.community_memberships;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.community_memberships;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own memberships only" 
ON public.community_memberships 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow viewing all memberships for community creators (using communities table)
CREATE POLICY "Community creators can view all memberships in their communities" 
ON public.community_memberships 
FOR SELECT 
USING (
  community_id IN (
    SELECT id FROM public.communities 
    WHERE created_by = auth.uid()
  )
);