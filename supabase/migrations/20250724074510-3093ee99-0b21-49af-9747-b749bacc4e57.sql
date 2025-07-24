-- ユーザープロフィールにサンプル分析スコアを追加して、コミュニティ推薦機能をテストできるようにする

UPDATE profiles 
SET 
  github_score = 85,
  linkedin_score = 78,
  portfolio_score = 70,
  fraud_risk_level = 'low',
  last_analyzed_at = NOW(),
  analysis_details = '{
    "github_analysis": {
      "total_repos": 45,
      "active_repos": 12,
      "total_commits": 1250,
      "languages": ["TypeScript", "Python", "Go"],
      "contribution_streak": 180
    },
    "linkedin_analysis": {
      "experience_years": 8,
      "company_tier": "tier1",
      "skill_endorsements": 35,
      "connection_count": 850,
      "recent_activity": "high"
    },
    "portfolio_analysis": {
      "project_count": 8,
      "technology_diversity": "high",
      "ui_quality": "excellent",
      "technical_complexity": "advanced"
    }
  }'::jsonb
WHERE user_id = (SELECT id FROM auth.users LIMIT 1);