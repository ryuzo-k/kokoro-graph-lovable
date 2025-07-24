import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Initialize Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('Authentication failed');
    }

    const { linkedinUrl, userId } = await req.json();
    
    if (!linkedinUrl) {
      return new Response(
        JSON.stringify({ error: 'LinkedIn URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing LinkedIn profile: ${linkedinUrl}`);

    // Fetch LinkedIn profile content (this is a simplified approach)
    // Note: In production, you might want to use a proper LinkedIn API or scraping service
    let profileContent = '';
    
    try {
      const response = await fetch(linkedinUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const htmlContent = await response.text();
        // Extract visible text from HTML
        profileContent = htmlContent
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 4000);
      }
    } catch (error) {
      console.log('Direct fetching failed, proceeding with URL analysis only');
    }

    // AI Analysis for LinkedIn profile assessment and fraud detection
    const analysisPrompt = `
Analyze this LinkedIn profile for professional credibility and fraud detection:

LinkedIn URL: ${linkedinUrl}
Profile Content: ${profileContent || 'Content not available - analyze based on URL pattern and common LinkedIn fraud indicators'}

Please provide a JSON response with:
{
  "professional_score": 0-100,
  "fraud_risk_level": "low|medium|high",
  "experience_assessment": {
    "estimated_years": number,
    "career_progression": "realistic|questionable|suspicious",
    "skill_consistency": "consistent|inconsistent|fraudulent"
  },
  "red_flags": ["flag1", "flag2", ...],
  "positive_indicators": ["indicator1", "indicator2", ...],
  "credibility_factors": {
    "profile_completeness": 0-100,
    "network_quality": "low|medium|high",
    "content_authenticity": "authentic|questionable|fake"
  },
  "overall_assessment": "detailed assessment"
}

Key fraud detection criteria:
1. Unrealistic career progression (too fast advancement)
2. Inconsistent job titles vs responsibilities
3. Gaps in employment without explanation
4. Overstated achievements or responsibilities
5. Generic or copy-paste descriptions
6. Suspicious connection patterns
7. Fake company affiliations
8. Mismatched skills vs experience level
9. Inconsistent geographic/timeline information
10. Too many endorsements from questionable sources

Rate the professional credibility considering:
- Career timeline consistency
- Skill-experience alignment  
- Achievement believability
- Network authenticity
- Content quality and originality
`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR professional and fraud detection specialist focused on identifying fake or exaggerated LinkedIn profiles. Be particularly vigilant about detecting individuals who oversell their capabilities.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to analyze LinkedIn profile with AI');
    }

    const aiResult = await aiResponse.json();
    let analysis;
    
    try {
      analysis = JSON.parse(aiResult.choices[0].message.content);
    } catch {
      // Fallback analysis if AI response isn't valid JSON
      analysis = {
        professional_score: 50,
        fraud_risk_level: 'medium',
        experience_assessment: {
          estimated_years: 0,
          career_progression: 'questionable',
          skill_consistency: 'inconsistent'
        },
        red_flags: ['Unable to parse AI response'],
        positive_indicators: [],
        credibility_factors: {
          profile_completeness: 50,
          network_quality: 'medium',
          content_authenticity: 'questionable'
        },
        overall_assessment: 'Basic analysis performed due to AI parsing error'
      };
    }

    // Calculate final score with fraud penalties
    let finalScore = analysis.professional_score;
    
    // Apply fraud risk penalties
    if (analysis.fraud_risk_level === 'high') {
      finalScore = Math.max(0, finalScore - 40);
    } else if (analysis.fraud_risk_level === 'medium') {
      finalScore = Math.max(0, finalScore - 20);
    }

    // Additional penalties for specific red flags
    const seriousRedFlags = analysis.red_flags?.filter(flag => 
      flag.toLowerCase().includes('fake') || 
      flag.toLowerCase().includes('fraudulent') ||
      flag.toLowerCase().includes('suspicious')
    ).length || 0;
    
    finalScore = Math.max(0, finalScore - (seriousRedFlags * 10));

    // Update user profile with LinkedIn analysis using authenticated client
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        linkedin_url: linkedinUrl,
        linkedin_score: Math.round(finalScore),
        fraud_risk_level: analysis.fraud_risk_level,
        last_analyzed_at: new Date().toISOString(),
        analysis_details: {
          linkedin_analysis: analysis,
          url_analyzed: linkedinUrl,
          content_available: profileContent.length > 0
        }
      })
      .eq('user_id', user.id); // Use authenticated user ID

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error('Failed to update profile');
    }

    return new Response(
      JSON.stringify({
        success: true,
        score: Math.round(finalScore),
        fraud_risk_level: analysis.fraud_risk_level,
        analysis: analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in LinkedIn analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});