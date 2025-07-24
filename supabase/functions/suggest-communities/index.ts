import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Denv.get('SUPABASE_URL') ?? '',
      Denv.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } }
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      throw new Error('Profile not found')
    }

    // Get all available communities (excluding ones user is already in)
    const { data: userMemberships } = await supabase
      .from('community_memberships')
      .select('community_id')
      .eq('user_id', user.id)

    const userCommunityIds = userMemberships?.map(m => m.community_id) || []

    const { data: communities, error: communitiesError } = await supabase
      .from('communities')
      .select('*')
      .eq('is_public', true)
      .not('id', 'in', `(${userCommunityIds.join(',')})`)

    if (communitiesError) {
      throw new Error('Failed to fetch communities')
    }

    // Generate recommendations based on profile analysis
    const recommendations = []

    for (const community of communities || []) {
      let score = 0
      const reasons = []

      // Tech communities for high GitHub scores
      if (profile.github_score && profile.github_score > 70) {
        if (community.name.includes('技術') || 
            community.name.includes('開発') || 
            community.name.includes('AI') || 
            community.name.includes('ML') ||
            community.name.includes('プロダクト')) {
          score += 30
          reasons.push('高いGitHubスコア（開発力）が技術コミュニティにマッチ')
        }
      }

      // Business communities for high LinkedIn scores
      if (profile.linkedin_score && profile.linkedin_score > 70) {
        if (community.name.includes('ビジネス') || 
            community.name.includes('起業') ||
            community.name.includes('Founders') ||
            community.name.includes('経営')) {
          score += 25
          reasons.push('LinkedInプロフィールからビジネス系コミュニティが適している')
        }
      }

      // Creative/Product communities for portfolio scores
      if (profile.portfolio_score && profile.portfolio_score > 60) {
        if (community.name.includes('プロダクト') || 
            community.name.includes('デザイン') ||
            community.name.includes('クリエイティブ')) {
          score += 20
          reasons.push('ポートフォリオスコアからクリエイティブ系がおすすめ')
        }
      }

      // Fintech specific
      if (community.name.includes('フィンテック') || 
          community.name.includes('クリプト') ||
          community.name.includes('金融')) {
        if (profile.github_score && profile.github_score > 50) {
          score += 15
          reasons.push('技術力がフィンテック領域で活かせる')
        }
        if (profile.linkedin_score && profile.linkedin_score > 60) {
          score += 10
          reasons.push('ビジネス経験が金融分野で価値を発揮')
        }
      }

      // General engagement bonus
      const hasActiveProfile = profile.github_score || profile.linkedin_score || profile.portfolio_score
      if (hasActiveProfile) {
        score += 5
        reasons.push('アクティブなオンラインプレゼンスを持っている')
      }

      // Low fraud risk bonus
      if (profile.fraud_risk_level === 'low') {
        score += 10
        reasons.push('信頼性の高いプロフィール')
      }

      // Only include if score is above threshold
      if (score > 15) {
        recommendations.push({
          community_id: community.id,
          community_name: community.name,
          community_description: community.description,
          member_count: community.member_count,
          match_score: Math.min(score, 100), // Cap at 100%
          reasons: reasons
        })
      }
    }

    // Sort by score and return top recommendations
    recommendations.sort((a, b) => b.match_score - a.match_score)

    return new Response(
      JSON.stringify({
        success: true,
        recommendations: recommendations.slice(0, 5), // Top 5 recommendations
        profile_summary: {
          github_score: profile.github_score,
          linkedin_score: profile.linkedin_score,
          portfolio_score: profile.portfolio_score,
          fraud_risk_level: profile.fraud_risk_level
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in suggest-communities function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})