import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Sparkles, AlertCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useCommunities, Community } from '@/hooks/useCommunities';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CommunityRecommendation {
  community: Community;
  matchScore: number;
  reasons: string[];
}

export const CommunityRecommendations = () => {
  const { profile } = useProfile();
  const { communities, userCommunities, joinCommunity } = useCommunities();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<CommunityRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const generateRecommendations = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // Get communities user is not already in
      const userCommunityIds = userCommunities.map(c => c.id);
      const availableCommunities = communities.filter(c => !userCommunityIds.includes(c.id));

      const recs: CommunityRecommendation[] = [];

      for (const community of availableCommunities) {
        let score = 0;
        const reasons: string[] = [];

        // Score based on GitHub analysis
        if (profile.github_score && profile.github_score > 70) {
          if (community.name.includes('技術') || community.name.includes('開発') || 
              community.name.includes('AI') || community.name.includes('ML')) {
            score += 30;
            reasons.push('高いGitHubスコアから技術コミュニティがおすすめ');
          }
        }

        // Score based on LinkedIn analysis
        if (profile.linkedin_score && profile.linkedin_score > 70) {
          if (community.name.includes('ビジネス') || community.name.includes('起業') ||
              community.name.includes('Founders')) {
            score += 25;
            reasons.push('LinkedInプロフィールからビジネス系コミュニティがマッチ');
          }
        }

        // Score based on portfolio
        if (profile.portfolio_score && profile.portfolio_score > 60) {
          if (community.name.includes('プロダクト') || community.name.includes('デザイン')) {
            score += 20;
            reasons.push('ポートフォリオスコアからプロダクト系がおすすめ');
          }
        }

        // Crypto/Fintech specific scoring
        if (community.name.includes('フィンテック') || community.name.includes('クリプト')) {
          if (profile.github_score && profile.github_score > 50) {
            score += 15;
            reasons.push('技術力がフィンテック領域に活かせそう');
          }
        }

        // General activity bonus
        if (profile.github_score || profile.linkedin_score || profile.portfolio_score) {
          score += 10;
          reasons.push('アクティブなプロフィールを持っている');
        }

        if (score > 20) {
          recs.push({ community, matchScore: score, reasons });
        }
      }

      // Sort by score and take top 3
      recs.sort((a, b) => b.matchScore - a.matchScore);
      setRecommendations(recs.slice(0, 3));

    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "エラー",
        description: "コミュニティ推薦の生成に失敗しました",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    const result = await joinCommunity(communityId);
    if (result.success) {
      toast({
        title: "成功",
        description: "コミュニティに参加しました！",
      });
      // Remove from recommendations
      setRecommendations(prev => prev.filter(r => r.community.id !== communityId));
    }
  };

  const autoJoinRecommendedCommunities = async () => {
    if (!profile || recommendations.length === 0) return;

    setLoading(true);
    try {
      // Auto-join top recommendation if score is very high
      const topRec = recommendations[0];
      if (topRec.matchScore > 50) {
        await handleJoinCommunity(topRec.community.id);
        toast({
          title: "自動参加",
          description: `${topRec.community.name}に自動で参加しました！`,
        });
      }
    } catch (error) {
      console.error('Error auto-joining communities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && communities.length > 0 && userCommunities.length >= 0) {
      generateRecommendations();
    }
  }, [profile, communities, userCommunities]);

  if (!profile || recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          おすすめコミュニティ
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          あなたのSNS分析結果に基づいて推薦しています
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.community.id} className="border border-border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-foreground">{rec.community.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {rec.community.description}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  マッチ度 {rec.matchScore}%
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <Users className="w-4 h-4 mr-1" />
                {rec.community.member_count} メンバー
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-foreground mb-1">推薦理由:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {rec.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleJoinCommunity(rec.community.id)}
                disabled={loading}
                className="w-full"
              >
                参加する
              </Button>
            </div>
          ))}

          {recommendations.length > 0 && (
            <Button
              onClick={autoJoinRecommendedCommunities}
              variant="outline"
              disabled={loading}
              className="w-full mt-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              トップ推薦コミュニティに自動参加
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};