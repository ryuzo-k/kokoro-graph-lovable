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
import { useLanguage } from '@/hooks/useLanguage';
import { useMeetings, type Meeting } from '@/hooks/useMeetings';
import { useCommunities } from '@/hooks/useCommunities';
import { usePeople, Person } from '@/hooks/usePeople';

interface PersonWithStats extends Person {
  averageRating: number;
  meetingCount: number;
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
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { meetings, addMeeting } = useMeetings();
  const { communities } = useCommunities();
  const { people: allPeople } = usePeople();

  // Find the current community
  const currentCommunity = communities.find(c => c.id === communityId);

  // Filter meetings for this community
  const communityMeetings = useMemo(() => {
    return meetings.filter(meeting => (meeting as any).community_id === communityId);
  }, [meetings, communityId]);

  // Process meetings to create people and connections
  const { people, connections } = useMemo(() => {
    const peopleMap = new Map<string, PersonWithStats>();
    const connectionMap = new Map<string, Connection>();

    // すべてのミーティングから人物とコミュニティ情報を収集
    meetings.forEach(meeting => {
      // 人物データの処理
      [meeting.my_name, meeting.other_name].forEach(name => {
        if (!peopleMap.has(name)) {
          // 詳細情報を取得
          const detailedPerson = allPeople.find(p => p.name === name);
          
          peopleMap.set(name, {
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
            averageRating: 0,
            meetingCount: 0,
            meetings: [],
          });
        }
      });
    });

    // 各人物の統計とコミュニティ情報を計算
    peopleMap.forEach((person, name) => {
      const personMeetings = meetings.filter(m => 
        m.my_name === name || m.other_name === name
      );
      
      person.meetings = personMeetings;
      person.meetingCount = personMeetings.length;

      // 多次元信用スコア計算
      let totalTrust = 0, totalExpertise = 0, totalComm = 0, totalCollab = 0;
      let totalLeadership = 0, totalInnovation = 0, totalIntegrity = 0;
      let scoredMeetings = 0;

      personMeetings.forEach(meeting => {
        if (meeting.trustworthiness) {
          totalTrust += meeting.trustworthiness;
          totalExpertise += meeting.expertise || 3;
          totalComm += meeting.communication || 3;
          totalCollab += meeting.collaboration || 3;
          totalLeadership += meeting.leadership || 3;
          totalInnovation += meeting.innovation || 3;
          totalIntegrity += meeting.integrity || 3;
          scoredMeetings++;
        }
      });

      // 複合信用スコア（重み付き平均）
      if (scoredMeetings > 0) {
        const trustworthiness = totalTrust / scoredMeetings;
        const expertise = totalExpertise / scoredMeetings;
        const communication = totalComm / scoredMeetings;
        const collaboration = totalCollab / scoredMeetings;
        const leadership = totalLeadership / scoredMeetings;
        const innovation = totalInnovation / scoredMeetings;
        const integrity = totalIntegrity / scoredMeetings;

        // 重み付き信用スコア（誠実性と信頼性を重視）
        person.averageRating = (
          trustworthiness * 0.25 +
          integrity * 0.20 +
          expertise * 0.15 +
          communication * 0.15 +
          collaboration * 0.15 +
          leadership * 0.10
        );
      } else {
        // 従来の評価方式
        const ratings = personMeetings.map(m => m.rating);
        person.averageRating = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0;
      }

      // 参加コミュニティを取得
      const personCommunities = new Set<string>();
      personMeetings.forEach(meeting => {
        const meetingCommunity = communities.find(c => c.id === (meeting as any).community_id);
        if (meetingCommunity) {
          // コミュニティ名を短縮
          let shortName = meetingCommunity.name;
          if (shortName.includes(' - ')) {
            shortName = shortName.split(' - ')[1] || shortName.split(' - ')[0];
          }
          if (shortName.includes('コミュニティ')) {
            shortName = shortName.replace('コミュニティ', '');
          }
          personCommunities.add(shortName.trim());
        }
      });

      // PersonNode用のデータ拡張
      (person as any).communities = Array.from(personCommunities);
      (person as any).trustScore = person.averageRating;
      (person as any).connectionCount = new Set(
        personMeetings.map(m => m.my_name === name ? m.other_name : m.my_name)
      ).size;

      // 場所情報の更新
      const locationMeetings = personMeetings.filter(m => m.location);
      if (locationMeetings.length > 0 && !person.location) {
        person.location = locationMeetings[0].location;
      }
    });

    // 現在のコミュニティの人物のみを抽出（フィルタリング）
    const filteredPeople = Array.from(peopleMap.values()).filter(person => {
      return person.meetings.some(meeting => (meeting as any).community_id === communityId);
    });

    // コネクション処理
    communityMeetings.forEach(meeting => {
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
      
      // 接続の平均評価
      const connectionMeetings = communityMeetings.filter(m => 
        (m.my_name === connection.person1Id && m.other_name === connection.person2Id) ||
        (m.my_name === connection.person2Id && m.other_name === connection.person1Id)
      );
      connection.averageRating = connectionMeetings.reduce((sum, m) => sum + m.rating, 0) / connectionMeetings.length;
    });

    return {
      people: filteredPeople,
      connections: Array.from(connectionMap.values()),
    };
  }, [communityMeetings, allPeople, communities, communityId, meetings]);

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
            {t('network.communityNotFound')}
          </h2>
          <Button onClick={() => navigate('/communities')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('network.backToCommunities')}
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
                {t('network.backToCommunities')}
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
              {t('network.recordMeeting')}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="network" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              {t('network.tabs.network')}
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              {t('network.tabs.insights')}
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {t('network.tabs.stats')}
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
                          {t('network.noNetwork')}
                        </h3>
                        <p className="text-muted-foreground">
                          {t('network.createFirst')}
                        </p>
                      </div>
                      <Button 
                        onClick={() => setShowForm(true)}
                        className="bg-gradient-primary hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('network.recordMeeting')}
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
                <CardTitle>{t('network.stats.recentMeetings')}</CardTitle>
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
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setShowForm(false)}
              className="absolute -top-3 -right-3 w-10 h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 z-[60] font-bold text-lg border-2 border-background"
              aria-label="Close"
            >
              ×
            </button>
            <MeetingForm 
              onSubmit={handleMeetingSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkVisualization;