-- Fix circular reference between communities and community_memberships
-- Temporarily remove the problematic policy that causes recursion
DROP POLICY IF EXISTS "Members can view their communities" ON public.communities;

-- Create a simpler approach - allow users to view all public communities without membership check
-- We'll handle membership filtering in the application code if needed
CREATE POLICY "All users can view public communities" 
ON public.communities 
FOR SELECT 
USING (is_public = true);

-- For private communities, only creators can view them
CREATE POLICY "Creators can view their own communities" 
ON public.communities 
FOR SELECT 
USING (auth.uid() = created_by);