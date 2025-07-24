import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MeetingForm from '@/components/MeetingForm';
import NetworkGraph from '@/components/NetworkGraph';
import NetworkInsights from '@/components/NetworkInsights';
import { ArrowLeft, Plus, Network, BarChart3, Users, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMeetings, type Meeting } from '@/hooks/useMeetings';
import { useCommunities } from '@/hooks/useCommunities';

interface Person {
  id: string;
  name: string;
  averageRating: number;
  meetingCount: number;
  location?: string;
  avatar?: string;
  meetings: Meeting[];
}

interface Connection {
  person1Id: string;
  person2Id: string;
  meetingCount: number;
  averageRating: number;
  lastMeeting: string;
}

const NetworkVisualization = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { meetings, addMeeting } = useMeetings();
  const { communities } = useCommunities();

  // Find the current community
  const currentCommunity = communities.find(c => c.id === communityId);

  // Filter meetings for this community
  const communityMeetings = useMemo(() => {
    return meetings.filter(meeting => (meeting as any).community_id === communityId);
  }, [meetings, communityId]);

  // Process meetings to create people and connections
  const { people, connections } = useMemo(() => {
    const peopleMap = new Map<string, Person>();
    const connectionMap = new Map<string, Connection>();

    communityMeetings.forEach(meeting => {
      // Add people
      [meeting.my_name, meeting.other_name].forEach(name => {
        if (!peopleMap.has(name)) {
          peopleMap.set(name, {
            id: name,
            name,
            averageRating: 0,
            meetingCount: 0,
            meetings: [],
          });
        }
      });

      // Update person data  
      const myPerson = peopleMap.get(meeting.my_name)!;
      const otherPerson = peopleMap.get(meeting.other_name)!;

      myPerson.meetings.push(meeting);
      otherPerson.meetings.push(meeting);
      myPerson.meetingCount++;
      otherPerson.meetingCount++;

      if (meeting.location) {
        myPerson.location = meeting.location;
        otherPerson.location = meeting.location;
      }

      // Calculate average ratings
      const myRatings = myPerson.meetings.map(m => 
        m.my_name === myPerson.name ? m.rating : 5 - m.rating + 1
      );
      myPerson.averageRating = myRatings.reduce((a, b) => a + b, 0) / myRatings.length;

      const otherRatings = otherPerson.meetings.map(m => 
        m.other_name === otherPerson.name ? m.rating : 5 - m.rating + 1
      );
      otherPerson.averageRating = otherRatings.reduce((a, b) => a + b, 0) / otherRatings.length;

      // Add connections
      const connectionKey = [meeting.my_name, meeting.other_name].sort().join('-');
      if (!connectionMap.has(connectionKey)) {
        connectionMap.set(connectionKey, {
          person1Id: meeting.my_name,
          person2Id: meeting.other_name,
          meetingCount: 0,
          averageRating: 0,
          lastMeeting: meeting.created_at,
        });
      }

      const connection = connectionMap.get(connectionKey)!;
      connection.meetingCount++;
      connection.lastMeeting = meeting.created_at;
      
      // Calculate connection average rating
      const connectionMeetings = communityMeetings.filter(m => 
        (m.my_name === connection.person1Id && m.other_name === connection.person2Id) ||
        (m.my_name === connection.person2Id && m.other_name === connection.person1Id)
      );
      connection.averageRating = connectionMeetings.reduce((sum, m) => sum + m.rating, 0) / connectionMeetings.length;
    });

    return {
      people: Array.from(peopleMap.values()),
      connections: Array.from(connectionMap.values()),
    };
  }, [communityMeetings]);

  const handleMeetingSubmit = useCallback(async (meetingData: any) => {
    const result = await addMeeting({
      ...meetingData,
      community_id: communityId
    });
    if (result?.success) {
      setShowForm(false);
    }
  }, [addMeeting, communityId]);

  const stats = useMemo(() => ({
    totalPeople: people.length,
    totalConnections: connections.length,
    averageTrust: people.length > 0 
      ? people.reduce((sum, p) => sum + p.averageRating, 0) / people.length 
      : 0,
    totalMeetings: communityMeetings.length,
  }), [people, connections, communityMeetings]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!currentCommunity) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            コミュニティが見つかりません
          </h2>
          <Button onClick={() => navigate('/communities')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            コミュニティ一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/communities')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
              <div className="flex items-center gap-3">
                <Network className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{currentCommunity.name}</h1>
                  <p className="text-sm text-muted-foreground">{currentCommunity.description}</p>
                </div>
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  {currentCommunity.member_count}
                </Badge>
              </div>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4 mr-2" />
              出会いを記録
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="network" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              ネットワーク
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI分析
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              統計
            </TabsTrigger>
          </TabsList>

          <TabsContent value="network">
            <Card className="h-[calc(100vh-200px)] bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-0 h-full">
                {people.length > 0 ? (
                  <NetworkGraph 
                    people={people} 
                    connections={connections}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Network className="w-16 h-16 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          このコミュニティにはまだネットワークがありません
                        </h3>
                        <p className="text-muted-foreground">
                          最初の出会いを記録してネットワークグラフを作成してください
                        </p>
                      </div>
                      <Button 
                        onClick={() => setShowForm(true)}
                        className="bg-gradient-primary hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        出会いを記録
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <NetworkInsights 
              communityId={communityId!} 
              userId={user.id} 
            />
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-card/80 backdrop-blur-sm shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    総人数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.totalPeople}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    つながり
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.totalConnections}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    平均信頼度
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.averageTrust.toFixed(1)}★
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    総出会い数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.totalMeetings}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm shadow-card">
              <CardHeader>
                <CardTitle>最近の出会い</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {communityMeetings.slice(-10).reverse().map((meeting) => (
                    <div 
                      key={meeting.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {meeting.my_name} → {meeting.other_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {meeting.location && `${meeting.location} • `}
                          {new Date(meeting.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {meeting.rating}★
                      </div>
                    </div>
                  ))}
                  {communityMeetings.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      このコミュニティにはまだ出会いの記録がありません
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Meeting Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-card rounded-full shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              ×
            </button>
            <MeetingForm onSubmit={handleMeetingSubmit} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkVisualization;