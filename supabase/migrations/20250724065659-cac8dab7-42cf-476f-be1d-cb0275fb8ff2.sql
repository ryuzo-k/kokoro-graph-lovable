-- Create people table for storing contact profiles
CREATE TABLE public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  position TEXT,
  bio TEXT,
  skills TEXT[],
  avatar_url TEXT,
  linkedin_url TEXT,
  github_username TEXT,
  location TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own people"
ON public.people
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own people"
ON public.people
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own people"
ON public.people
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own people"
ON public.people
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_people_updated_at
BEFORE UPDATE ON public.people
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();