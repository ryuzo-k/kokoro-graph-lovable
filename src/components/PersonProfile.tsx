import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Users, Star, Calendar, X, TrendingUp, Building, Briefcase, ExternalLink, Github, Linkedin, Network } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/hooks/useLanguage';
import { Person, usePeople } from '@/hooks/usePeople';
import { useMeetings, Meeting } from '@/hooks/useMeetings';
import { useCommunities } from '@/hooks/useCommunities';
import { useMemo } from 'react';
import PersonNetworkView from './PersonNetworkView';

interface PersonProfileProps {
  person: Person & {
    averageRating: number;
    meetingCount: number;
    meetings: Meeting[];
  };
  onClose: () => void;
}

const PersonProfile = ({ person, onClose }: PersonProfileProps) => {
  const { t } = useLanguage();
  const { userCommunities } = useCommunities();
  
  const { meetings } = useMeetings();
  const { people } = usePeople();
  
  // Get connected people from meetings
  const connectedPeople = useMemo(() => {
    if (!person.meetings || person.meetings.length === 0) return [];
    
    // Get all people who have meetings with this person
    const connectedPersonNames = new Set<string>();
    person.meetings.forEach(meeting => {
      // Add the other person in each meeting
      if (meeting.my_name === person.name) {
        connectedPersonNames.add(meeting.other_name);
      } else {
        connectedPersonNames.add(meeting.my_name);
      }
    });
    
    // Convert names to person objects with stats
    const connectedPeopleArray = Array.from(connectedPersonNames).map(name => {
      // Find the detailed person info
      const detailedPerson = people.find(p => p.name === name);
      
      // Get all meetings for this person
      const personMeetings = meetings.filter(m => 
        m.my_name === name || m.other_name === name
      );
      
      // Calculate average rating
      const ratings = personMeetings.map(m => m.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;
      
      return {
        id: detailedPerson?.id || name,
        name,
        company: detailedPerson?.company,
        position: detailedPerson?.position,
        bio: detailedPerson?.bio,
        skills: detailedPerson?.skills,
        avatar_url: detailedPerson?.avatar_url,
        linkedin_url: detailedPerson?.linkedin_url,
        github_username: detailedPerson?.github_username,
        location: detailedPerson?.location,
        user_id: detailedPerson?.user_id || '',
        created_at: detailedPerson?.created_at || '',
        updated_at: detailedPerson?.updated_at || '',
        averageRating,
        meetingCount: personMeetings.length,
        meetings: personMeetings,
      };
    });
    
    return connectedPeopleArray;
  }, [person.meetings, meetings, people, person.name]);
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
    { dimension: t('profile.dimensions.trustworthiness'), score: dimensionalScores.trustworthiness, fullMark: 5 },
    { dimension: t('profile.dimensions.expertise'), score: dimensionalScores.expertise, fullMark: 5 },
    { dimension: t('profile.dimensions.communication'), score: dimensionalScores.communication, fullMark: 5 },
    { dimension: t('profile.dimensions.collaboration'), score: dimensionalScores.collaboration, fullMark: 5 },
    { dimension: t('profile.dimensions.leadership'), score: dimensionalScores.leadership, fullMark: 5 },
    { dimension: t('profile.dimensions.innovation'), score: dimensionalScores.innovation, fullMark: 5 },
    { dimension: t('profile.dimensions.integrity'), score: dimensionalScores.integrity, fullMark: 5 },
  ] : null;

  const trustColor = getTrustBadgeColor(person.averageRating);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card shadow-card max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start mb-4">
            <CardTitle className="text-lg font-semibold">{t('profile.personTitle')}</CardTitle>
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
              <div className="text-xs text-muted-foreground">{t('profile.averageRating')}</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-foreground">
                {person.meetingCount}
              </div>
              <div className="text-xs text-muted-foreground">{t('profile.meetingCount')}</div>
            </div>
          </div>

          {/* Bio */}
          {person.bio && (
            <div>
              <h4 className="font-medium text-foreground mb-2">{t('profile.bio')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {person.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {person.skills && person.skills.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-2">{t('profile.skills')}</h4>
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
                {t('profile.multiDimensionalAssessment')}
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
                      name={t('profile.evaluation')}
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

          {/* Connection Network */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-1">
              <Network className="w-4 h-4" />
              {t('profile.connectionNetwork')}
            </h4>
            <PersonNetworkView
              centerPerson={person}
              connectedPeople={connectedPeople}
              userCommunities={userCommunities}
            />
            <div className="mt-2 text-xs text-muted-foreground text-center">
              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-1"></span>
              {t('profile.centralPerson')}
              <span className="inline-block w-2 h-2 bg-accent rounded-full ml-4 mr-1"></span>
              {t('profile.sharedCommunity')}
            </div>
          </div>

          {/* SNS Analysis Results */}
          {(person.github_score || person.linkedin_score || person.portfolio_score) && (
            <div>
              <h4 className="font-medium text-foreground mb-3">{t('profile.snsAnalysisScore')}</h4>
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
                    {t('profile.fraudRisk')}: {t(`profile.fraudRiskLevel.${person.fraud_risk_level}`)}
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
              {t('profile.recentMeetings')}
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
                  {t('profile.noRecordsYet')}
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