-- Extend meetings table with multi-dimensional scoring and AI analysis
ALTER TABLE public.meetings 
ADD COLUMN IF NOT EXISTS detailed_feedback TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis_scores JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS trustworthiness INTEGER CHECK (trustworthiness >= 1 AND trustworthiness <= 5),
ADD COLUMN IF NOT EXISTS expertise INTEGER CHECK (expertise >= 1 AND expertise <= 5),
ADD COLUMN IF NOT EXISTS communication INTEGER CHECK (communication >= 1 AND communication <= 5),
ADD COLUMN IF NOT EXISTS collaboration INTEGER CHECK (collaboration >= 1 AND collaboration <= 5),
ADD COLUMN IF NOT EXISTS leadership INTEGER CHECK (leadership >= 1 AND leadership <= 5),
ADD COLUMN IF NOT EXISTS innovation INTEGER CHECK (innovation >= 1 AND innovation <= 5),
ADD COLUMN IF NOT EXISTS integrity INTEGER CHECK (integrity >= 1 AND integrity <= 5);

-- Create index for better performance on AI analysis queries
CREATE INDEX IF NOT EXISTS idx_meetings_ai_analysis ON public.meetings USING GIN(ai_analysis_scores);

-- Create a function to calculate overall trust score from multi-dimensional scores
CREATE OR REPLACE FUNCTION calculate_overall_trust_score(
  p_trustworthiness INTEGER,
  p_expertise INTEGER,
  p_communication INTEGER,
  p_collaboration INTEGER,
  p_leadership INTEGER,
  p_innovation INTEGER,
  p_integrity INTEGER
)
RETURNS NUMERIC AS $$
BEGIN
  -- Calculate weighted average (integrity and trustworthiness are weighted higher)
  RETURN ROUND(
    (
      COALESCE(p_trustworthiness, 3) * 0.25 +  -- 25% weight
      COALESCE(p_expertise, 3) * 0.15 +        -- 15% weight
      COALESCE(p_communication, 3) * 0.15 +    -- 15% weight
      COALESCE(p_collaboration, 3) * 0.15 +    -- 15% weight
      COALESCE(p_leadership, 3) * 0.10 +       -- 10% weight
      COALESCE(p_innovation, 3) * 0.10 +       -- 10% weight
      COALESCE(p_integrity, 3) * 0.20          -- 20% weight
    ), 1
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a trigger to automatically update the main rating based on dimensional scores
CREATE OR REPLACE FUNCTION update_rating_from_dimensions()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if dimensional scores are provided
  IF NEW.trustworthiness IS NOT NULL OR 
     NEW.expertise IS NOT NULL OR 
     NEW.communication IS NOT NULL OR 
     NEW.collaboration IS NOT NULL OR 
     NEW.leadership IS NOT NULL OR 
     NEW.innovation IS NOT NULL OR 
     NEW.integrity IS NOT NULL THEN
    
    NEW.rating := calculate_overall_trust_score(
      NEW.trustworthiness,
      NEW.expertise,
      NEW.communication,
      NEW.collaboration,
      NEW.leadership,
      NEW.innovation,
      NEW.integrity
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic rating calculation
DROP TRIGGER IF EXISTS trigger_update_rating_from_dimensions ON public.meetings;
CREATE TRIGGER trigger_update_rating_from_dimensions
  BEFORE INSERT OR UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_from_dimensions();