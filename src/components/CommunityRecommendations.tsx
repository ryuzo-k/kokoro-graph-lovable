import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Sparkles, AlertCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useLanguage } from '@/hooks/useLanguage';
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
  const { t } = useLanguage();
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
            reasons.push(t('recommendations.highGithub'));
          }
        }

        // Score based on LinkedIn analysis
        if (profile.linkedin_score && profile.linkedin_score > 70) {
          if (community.name.includes('ビジネス') || community.name.includes('起業') ||
              community.name.includes('Founders')) {
            score += 25;
            reasons.push(t('recommendations.highLinkedin'));
          }
        }

        // Score based on portfolio
        if (profile.portfolio_score && profile.portfolio_score > 60) {
          if (community.name.includes('プロダクト') || community.name.includes('デザイン')) {
            score += 20;
            reasons.push(t('recommendations.portfolioMatch'));
          }
        }

        // Crypto/Fintech specific scoring
        if (community.name.includes('フィンテック') || community.name.includes('クリプト')) {
          if (profile.github_score && profile.github_score > 50) {
            score += 15;
            reasons.push(t('recommendations.portfolioMatch'));
          }
        }

        // General activity bonus
        if (profile.github_score || profile.linkedin_score || profile.portfolio_score) {
          score += 10;
          reasons.push(t('recommendations.locationMatch'));
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
        title: t('recommendations.error'),
        description: t('recommendations.error'),
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
        title: t('communities.joined2'),
        description: t('communities.joinedSuccess'),
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
          title: t('communities.joined2'),
          description: `${topRec.community.name}${t('communities.joinedSuccess')}`,
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
          {t('recommendations.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('recommendations.description')}
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
                  {t('recommendations.matchScore')} {rec.matchScore}%
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <Users className="w-4 h-4 mr-1" />
                {rec.community.member_count} {t('stats.yourNetwork')}
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-foreground mb-1">{t('recommendations.reasons')}:</p>
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
                {t('recommendations.join')}
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
              {t('recommendations.generate')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};