-- Fix database functions with proper search_path to prevent SQL injection
ALTER FUNCTION public.calculate_overall_trust_score(integer, integer, integer, integer, integer, integer, integer) SET search_path = '';

ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

ALTER FUNCTION public.update_community_member_count() SET search_path = '';

ALTER FUNCTION public.update_rating_from_dimensions() SET search_path = '';

-- Fix the handle_new_user function which already has proper search_path but ensure it's consistent
-- No changes needed for handle_new_user as it already has SET search_path = ''