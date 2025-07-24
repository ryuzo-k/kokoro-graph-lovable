-- Fix infinite recursion in RLS policies for community_memberships

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view memberships of their communities" ON public.community_memberships;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Users can view their own memberships" 
ON public.community_memberships 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a policy to view all memberships in communities they belong to
CREATE POLICY "Users can view community memberships where they are members" 
ON public.community_memberships 
FOR SELECT 
USING (
  community_id IN (
    SELECT cm.community_id 
    FROM public.community_memberships cm 
    WHERE cm.user_id = auth.uid()
  )
);