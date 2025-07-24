import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    const { text, personName } = await req.json();

    if (!text || !personName) {
      throw new Error('Text and person name are required');
    }

    console.log(`Analyzing feedback for ${personName}: ${text}`);

    const analysisPrompt = `
あなたは人材評価の専門家です。以下のテキストを分析し、その人物に対する多次元的な評価を行ってください。

評価対象: ${personName}
フィードバック内容: "${text}"

以下の7つの指標それぞれについて、1-5のスコア（1=非常に低い、2=低い、3=普通、4=高い、5=非常に高い）で評価してください：

1. 信頼性 (Trustworthiness) - 約束を守る、誠実である
2. 専門性 (Expertise) - 専門知識、技術力
3. コミュニケーション (Communication) - 意思疎通能力、表現力
4. 協力性 (Collaboration) - チームワーク、他者との連携
5. リーダーシップ (Leadership) - 指導力、影響力
6. 革新性 (Innovation) - 創造性、新しいアイデア
7. 誠実性 (Integrity) - 道徳性、倫理観

フィードバックから読み取れない指標については、3（普通）として評価してください。

レスポンスは以下のJSON形式で返してください：
{
  "trustworthiness": [1-5の数値],
  "expertise": [1-5の数値], 
  "communication": [1-5の数値],
  "collaboration": [1-5の数値],
  "leadership": [1-5の数値],
  "innovation": [1-5の数値],
  "integrity": [1-5の数値],
  "analysis_summary": "評価の根拠となった主要なポイントを日本語で簡潔に説明",
  "positive_aspects": ["ポジティブな要素1", "ポジティブな要素2"],
  "areas_for_improvement": ["改善点1", "改善点2"],
  "overall_impression": "総合的な印象を1-2文で"
}
`;

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
            content: 'あなたは人材評価の専門家です。公正で建設的な評価を行い、必ずJSON形式で返答してください。' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponseText = data.choices[0].message.content;

    console.log('AI Analysis Response:', aiResponseText);

    // Try to parse JSON from the response
    let analysisResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Raw AI response:', aiResponseText);
      
      // Fallback: provide default scores
      analysisResult = {
        trustworthiness: 3,
        expertise: 3,
        communication: 3,
        collaboration: 3,
        leadership: 3,
        innovation: 3,
        integrity: 3,
        analysis_summary: "AI分析に失敗しました。デフォルト値を使用しています。",
        positive_aspects: ["分析を再試行してください"],
        areas_for_improvement: ["分析を再試行してください"],
        overall_impression: "分析を再試行してください。"
      };
    }

    // Validate scores are within 1-5 range
    const dimensions = ['trustworthiness', 'expertise', 'communication', 'collaboration', 'leadership', 'innovation', 'integrity'];
    dimensions.forEach(dim => {
      if (!analysisResult[dim] || analysisResult[dim] < 1 || analysisResult[dim] > 5) {
        console.warn(`Invalid score for ${dim}: ${analysisResult[dim]}, defaulting to 3`);
        analysisResult[dim] = 3;
      }
    });

    console.log('Final analysis result:', analysisResult);

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: analysisResult 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-feedback function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});