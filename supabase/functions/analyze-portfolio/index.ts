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

    const { portfolioUrl, userId } = await req.json();
    
    if (!portfolioUrl) {
      return new Response(
        JSON.stringify({ error: 'Portfolio URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing portfolio: ${portfolioUrl}`);

    // Fetch website content
    const websiteResponse = await fetch(portfolioUrl);
    if (!websiteResponse.ok) {
      throw new Error(`Failed to fetch portfolio website: ${portfolioUrl}`);
    }
    
    const htmlContent = await websiteResponse.text();
    
    // Extract text content from HTML (simple approach)
    const textContent = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 4000); // Limit content size for AI analysis

    // AI Analysis for fraud detection and skill assessment
    const analysisPrompt = `
Analyze this portfolio website content and provide a comprehensive assessment:

Website Content:
${textContent}

Please analyze and provide a JSON response with the following structure:
{
  "technical_score": 0-100,
  "fraud_risk_level": "low|medium|high",
  "skills_detected": ["skill1", "skill2", ...],
  "experience_level": "junior|mid|senior|expert",
  "red_flags": ["flag1", "flag2", ...],
  "positive_indicators": ["indicator1", "indicator2", ...],
  "overall_assessment": "detailed assessment text"
}

Look for:
1. Technical depth and accuracy
2. Real project examples with details
3. Consistent skill claims vs demonstrated work
4. Signs of exaggeration or false claims
5. Quality of project descriptions
6. Evidence of hands-on experience
7. Realistic timeline and progression

Red flags for fraud:
- Overly impressive claims without evidence
- Inconsistent technical details
- Too many advanced skills for claimed experience
- Vague project descriptions
- Unrealistic achievements
- Copy-paste content from other sources
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
            content: 'You are an expert technical recruiter and fraud detection specialist. Analyze portfolio websites to assess genuine technical skills and detect fraudulent claims.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to analyze portfolio with AI');
    }

    const aiResult = await aiResponse.json();
    let analysis;
    
    try {
      analysis = JSON.parse(aiResult.choices[0].message.content);
    } catch {
      // Fallback basic analysis if AI response isn't valid JSON
      analysis = {
        technical_score: 50,
        fraud_risk_level: 'medium',
        skills_detected: [],
        experience_level: 'mid',
        red_flags: ['Unable to parse AI response'],
        positive_indicators: [],
        overall_assessment: 'Basic analysis performed due to AI parsing error'
      };
    }

    // Calculate final score considering fraud risk
    let finalScore = analysis.technical_score;
    if (analysis.fraud_risk_level === 'high') {
      finalScore = Math.max(0, finalScore - 30);
    } else if (analysis.fraud_risk_level === 'medium') {
      finalScore = Math.max(0, finalScore - 15);
    }

    // Update user profile with portfolio analysis using authenticated client
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        portfolio_url: portfolioUrl,
        portfolio_score: Math.round(finalScore),
        fraud_risk_level: analysis.fraud_risk_level,
        last_analyzed_at: new Date().toISOString(),
        analysis_details: {
          portfolio_analysis: analysis,
          url_analyzed: portfolioUrl,
          content_length: textContent.length
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
    console.error('Error in portfolio analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});