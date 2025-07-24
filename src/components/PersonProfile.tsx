import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Users, Star, Calendar, X, TrendingUp, Building, Briefcase, ExternalLink, Github, Linkedin } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Person } from '@/hooks/usePeople';
import { useMeetings, Meeting } from '@/hooks/useMeetings';
import { useMemo } from 'react';

interface PersonProfileProps {
  person: Person & {
    averageRating: number;
    meetingCount: number;
    meetings: Meeting[];
  };
  onClose: () => void;
}

const PersonProfile = ({ person, onClose }: PersonProfileProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTrustBadgeColor = (rating: number) => {
    if (rating >= 4) return 'trust-high';
    if (rating >= 3) return 'trust-medium';
    if (rating >= 2) return 'trust-low';
    return 'trust-neutral';
  };

  // Calculate dimensional scores from meetings (simplified for now)
  const dimensionalScores = useMemo(() => {
    if (!person.meetings || person.meetings.length === 0) return null;

    // For now, just use the basic rating until dimensional scoring is fully implemented
    const baseScore = person.averageRating;
    
    return {
      trustworthiness: baseScore,
      expertise: baseScore * 0.9,
      communication: baseScore * 1.1,
      collaboration: baseScore,
      leadership: baseScore * 0.8,
      innovation: baseScore * 0.9,
      integrity: baseScore * 1.0,
    };
  }, [person.meetings, person.averageRating]);

  // Prepare radar chart data
  const radarData = dimensionalScores ? [
    { dimension: '信頼性', score: dimensionalScores.trustworthiness, fullMark: 5 },
    { dimension: '専門性', score: dimensionalScores.expertise, fullMark: 5 },
    { dimension: 'コミュニケーション', score: dimensionalScores.communication, fullMark: 5 },
    { dimension: '協力性', score: dimensionalScores.collaboration, fullMark: 5 },
    { dimension: 'リーダーシップ', score: dimensionalScores.leadership, fullMark: 5 },
    { dimension: '革新性', score: dimensionalScores.innovation, fullMark: 5 },
    { dimension: '誠実性', score: dimensionalScores.integrity, fullMark: 5 },
  ] : null;

  const trustColor = getTrustBadgeColor(person.averageRating);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card shadow-card max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start mb-4">
            <CardTitle className="text-lg font-semibold">プロフィール</CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={person.avatar_url} alt={person.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(person.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground">{person.name}</h3>
              {person.position && person.company && (
                <div className="flex items-center text-muted-foreground text-sm mt-1">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {person.position} at {person.company}
                </div>
              )}
              {person.location && (
                <div className="flex items-center text-muted-foreground text-sm mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {person.location}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-foreground">
                {person.averageRating.toFixed(1)}★
              </div>
              <div className="text-xs text-muted-foreground">平均評価</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-foreground">
                {person.meetingCount}
              </div>
              <div className="text-xs text-muted-foreground">出会い回数</div>
            </div>
          </div>

          {/* Bio */}
          {person.bio && (
            <div>
              <h4 className="font-medium text-foreground mb-2">自己紹介</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {person.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {person.skills && person.skills.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-2">スキル</h4>
              <div className="flex flex-wrap gap-1">
                {person.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Multi-dimensional Radar Chart */}
          {radarData && (
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                多次元評価
              </h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid gridType="polygon" className="opacity-30" />
                    <PolarAngleAxis 
                      dataKey="dimension" 
                      fontSize={9}
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <PolarRadiusAxis 
                      domain={[0, 5]} 
                      fontSize={8}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickCount={6}
                    />
                    <Radar
                      name="評価"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.15}
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 2 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* SNS Analysis Results */}
          {(person.github_score || person.linkedin_score || person.portfolio_score) && (
            <div>
              <h4 className="font-medium text-foreground mb-3">SNS分析スコア</h4>
              <div className="grid grid-cols-3 gap-2">
                {person.github_score && (
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <div className="text-sm font-semibold text-foreground">{person.github_score}</div>
                    <div className="text-xs text-muted-foreground">GitHub</div>
                  </div>
                )}
                {person.linkedin_score && (
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <div className="text-sm font-semibold text-foreground">{person.linkedin_score}</div>
                    <div className="text-xs text-muted-foreground">LinkedIn</div>
                  </div>
                )}
                {person.portfolio_score && (
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <div className="text-sm font-semibold text-foreground">{person.portfolio_score}</div>
                    <div className="text-xs text-muted-foreground">Portfolio</div>
                  </div>
                )}
              </div>
              {person.fraud_risk_level && (
                <div className="mt-2 flex items-center justify-center">
                  <Badge variant={person.fraud_risk_level === 'low' ? 'default' : 'destructive'} className="text-xs">
                    信頼性: {person.fraud_risk_level === 'low' ? '高' : person.fraud_risk_level === 'medium' ? '中' : '低'}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Links */}
          <div className="flex gap-2">
            {person.linkedin_url && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(person.linkedin_url, '_blank')}
              >
                <Linkedin className="w-3 h-3 mr-1" />
                LinkedIn
              </Button>
            )}
            {person.github_username && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(`https://github.com/${person.github_username}`, '_blank')}
              >
                <Github className="w-3 h-3 mr-1" />
                GitHub
              </Button>
            )}
          </div>

          <Separator />

          {/* Recent Meetings */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              最近の出会い
            </h4>
            <div className="space-y-2">
              {person.meetings && person.meetings.length > 0 ? (
                person.meetings.slice(0, 3).map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">
                        {meeting.location && `${meeting.location} • `}
                        {new Date(meeting.created_at).toLocaleDateString('ja-JP')}
                      </div>
                      {/* Show basic meeting info for now */}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs bg-${getTrustBadgeColor(meeting.rating)} text-white border-0 ml-2`}
                    >
                      {meeting.rating}★
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground text-sm py-4">
                  まだ記録がありません
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonProfile;