import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Users, Star, Calendar, X, TrendingUp } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface Meeting {
  id: string;
  otherPerson: string;
  location: string;
  rating: number;
  date: string;
  // Multi-dimensional scores
  trustworthiness?: number;
  expertise?: number;
  communication?: number;
  collaboration?: number;
  leadership?: number;
  innovation?: number;
  integrity?: number;
  detailed_feedback?: string;
}

interface PersonProfileData {
  name: string;
  avatar?: string;
  averageRating: number;
  totalMeetings: number;
  locations: string[];
  recentMeetings: Meeting[];
  // Multi-dimensional averages
  dimensionalScores?: {
    trustworthiness: number;
    expertise: number;
    communication: number;
    collaboration: number;
    leadership: number;
    innovation: number;
    integrity: number;
  };
}

interface PersonProfileProps {
  person: PersonProfileData;
  onClose: () => void;
}

const PersonProfile = ({ person, onClose }: PersonProfileProps) => {
  const getTrustBadgeColor = (rating: number) => {
    if (rating >= 4) return 'trust-high';
    if (rating >= 3) return 'trust-medium';
    if (rating >= 2) return 'trust-low';
    return 'trust-neutral';
  };

  const trustColor = getTrustBadgeColor(person.averageRating);

  // Prepare radar chart data
  const radarData = person.dimensionalScores ? [
    { dimension: '信頼性', score: person.dimensionalScores.trustworthiness, fullMark: 5 },
    { dimension: '専門性', score: person.dimensionalScores.expertise, fullMark: 5 },
    { dimension: 'コミュニケーション', score: person.dimensionalScores.communication, fullMark: 5 },
    { dimension: '協力性', score: person.dimensionalScores.collaboration, fullMark: 5 },
    { dimension: 'リーダーシップ', score: person.dimensionalScores.leadership, fullMark: 5 },
    { dimension: '革新性', score: person.dimensionalScores.innovation, fullMark: 5 },
    { dimension: '誠実性', score: person.dimensionalScores.integrity, fullMark: 5 },
  ] : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card shadow-card max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex justify-between items-start mb-4">
            <div></div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage src={person.avatar} alt={person.name} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {person.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <CardTitle className="text-xl mb-2">{person.name}</CardTitle>
          
          <div className="flex justify-center gap-2 mb-4">
            <Badge className={`bg-${trustColor} text-white border-0`}>
              <Star className="w-3 h-3 mr-1" />
              {person.averageRating.toFixed(1)}
            </Badge>
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              {person.totalMeetings} meetings
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Multi-dimensional Radar Chart */}
          {radarData && (
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-muted-foreground mb-4 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                多次元評価
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid gridType="polygon" className="opacity-30" />
                    <PolarAngleAxis 
                      dataKey="dimension" 
                      fontSize={11}
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <PolarRadiusAxis 
                      domain={[0, 5]} 
                      fontSize={9}
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
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {person.locations.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                よく会う場所
              </h4>
              <div className="flex flex-wrap gap-1">
                {person.locations.map((location, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {location}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              最近の出会い
            </h4>
            <div className="space-y-2">
              {person.recentMeetings.length > 0 ? (
                person.recentMeetings.slice(0, 5).map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{meeting.otherPerson}</div>
                      <div className="text-xs text-muted-foreground">
                        {meeting.location && `${meeting.location} • `}
                        {new Date(meeting.date).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs bg-${getTrustBadgeColor(meeting.rating)} text-white border-0`}
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