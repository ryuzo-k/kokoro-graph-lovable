import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { communityId, userId } = await req.json();
    
    if (!communityId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Community ID and User ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all meetings in the community
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .eq('community_id', communityId);

    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch meetings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!meetings || meetings.length === 0) {
      return new Response(
        JSON.stringify({ 
          skills: {},
          strengths: [],
          weaknesses: [],
          recommendations: [],
          networkInsights: {
            totalConnections: 0,
            averageTrust: 0,
            topSkills: [],
            missingSkills: []
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze feedback texts with OpenAI
    const feedbackTexts = meetings
      .filter(m => m.detailed_feedback && m.detailed_feedback.trim())
      .map(m => m.detailed_feedback);

    if (feedbackTexts.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No feedback data available for analysis',
          skills: {},
          strengths: [],
          weaknesses: [],
          recommendations: []
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `
以下は人との出会いに関するフィードバックのリストです。これらを分析して、以下の形式のJSONで回答してください：

フィードバック：
${feedbackTexts.map((text, i) => `${i + 1}. ${text}`).join('\n')}

以下の形式で分析結果を返してください：
{
  "skills": {
    "技術スキル": ["JavaScript", "React", "データベース設計"],
    "コミュニケーション": ["プレゼンテーション", "チームワーク", "リーダーシップ"],
    "専門知識": ["AI/ML", "デザイン", "マーケティング"],
    "その他": ["時間管理", "問題解決", "創造性"]
  },
  "strengths": [
    "技術的な専門知識が豊富な人脈",
    "信頼性の高いメンバーが多い",
    "多様なバックグラウンドの人材"
  ],
  "weaknesses": [
    "マーケティング分野の専門家が不足",
    "国際的な経験を持つ人材が少ない"
  ],
  "recommendations": [
    "デザイン分野の専門家とのネットワーキングを強化",
    "グローバルな視点を持つ人材との接点を増やす",
    "若手起業家コミュニティへの参加"
  ]
}

分析は日本語で行い、具体的で実用的な洞察を提供してください。`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'あなたは人脈ネットワーク分析の専門家です。フィードバックを分析して、スキル分類、強み、弱み、改善提案を日本語で提供してください。' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze feedback' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const analysisText = aiData.choices[0].message.content;

    let analysis;
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse analysis results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate network insights
    const networkInsights = {
      totalConnections: meetings.length,
      averageTrust: meetings.reduce((sum, m) => sum + (m.rating || 0), 0) / meetings.length,
      topSkills: Object.entries(analysis.skills || {})
        .flatMap(([category, skills]) => (skills as string[]).map(skill => ({ skill, category })))
        .slice(0, 5),
      missingSkills: analysis.recommendations || []
    };

    const result = {
      ...analysis,
      networkInsights,
      analysisDate: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-network-insights function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});