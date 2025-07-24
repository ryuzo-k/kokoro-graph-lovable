import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Users, Star, Calendar } from 'lucide-react';

interface Meeting {
  id: string;
  otherPerson: string;
  location: string;
  rating: number;
  date: string;
}

interface PersonProfileData {
  name: string;
  avatar?: string;
  averageRating: number;
  totalMeetings: number;
  locations: string[];
  recentMeetings: Meeting[];
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card shadow-card max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex justify-between items-start mb-4">
            <div></div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-xl"
            >
              ×
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