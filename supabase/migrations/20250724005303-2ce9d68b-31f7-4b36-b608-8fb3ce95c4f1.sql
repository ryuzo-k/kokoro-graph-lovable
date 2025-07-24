-- Add new fields to profiles table for enhanced professional verification
ALTER TABLE public.profiles ADD COLUMN github_username TEXT;
ALTER TABLE public.profiles ADD COLUMN linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN portfolio_url TEXT;
ALTER TABLE public.profiles ADD COLUMN github_score INTEGER CHECK (github_score >= 0 AND github_score <= 100);
ALTER TABLE public.profiles ADD COLUMN linkedin_score INTEGER CHECK (linkedin_score >= 0 AND linkedin_score <= 100);
ALTER TABLE public.profiles ADD COLUMN portfolio_score INTEGER CHECK (portfolio_score >= 0 AND portfolio_score <= 100);
ALTER TABLE public.profiles ADD COLUMN fraud_risk_level TEXT CHECK (fraud_risk_level IN ('low', 'medium', 'high'));
ALTER TABLE public.profiles ADD COLUMN last_analyzed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN analysis_details JSONB DEFAULT '{}'::jsonb;

-- Create index for better performance on score queries
CREATE INDEX idx_profiles_scores ON public.profiles (github_score, linkedin_score, portfolio_score);
CREATE INDEX idx_profiles_fraud_risk ON public.profiles (fraud_risk_level);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.github_username IS 'GitHub username for development level analysis';
COMMENT ON COLUMN public.profiles.linkedin_url IS 'LinkedIn profile URL for experience verification';
COMMENT ON COLUMN public.profiles.portfolio_url IS 'Portfolio website URL for skill assessment';
COMMENT ON COLUMN public.profiles.github_score IS 'Development skill score (0-100) based on GitHub activity';
COMMENT ON COLUMN public.profiles.linkedin_score IS 'Professional experience score (0-100) based on LinkedIn data';
COMMENT ON COLUMN public.profiles.portfolio_score IS 'Technical skill score (0-100) based on portfolio analysis';
COMMENT ON COLUMN public.profiles.fraud_risk_level IS 'Risk level for fraudulent claims: low, medium, high';
COMMENT ON COLUMN public.profiles.analysis_details IS 'Detailed analysis results and reasoning in JSON format';