import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MeetingForm from '@/components/MeetingForm';
import NetworkGraph from '@/components/NetworkGraph';
import { Heart, Network, Plus, BarChart3, LogIn, LogOut, User, Users, Sparkles, TrendingUp, MapPin, Calendar, Star, Settings, Bot } from 'lucide-react';
import AIFriendFinder from '@/components/AIFriendFinder';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { useMeetings, type Meeting } from '@/hooks/useMeetings';
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

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { meetings, addMeeting } = useMeetings();
  const { people: allPeople } = usePeople();

  // Process meetings to create people and connections
  const { people, connections } = useMemo(() => {
    const peopleMap = new Map<string, PersonWithStats>();
    const connectionMap = new Map<string, Connection>();

    meetings.forEach(meeting => {
      // Add people
      [meeting.my_name, meeting.other_name].forEach(name => {
        if (!peopleMap.has(name)) {
          // Try to find detailed info from allPeople
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

      // Update person data  
      const myPerson = peopleMap.get(meeting.my_name)!;
      const otherPerson = peopleMap.get(meeting.other_name)!;

      myPerson.meetings.push(meeting);
      otherPerson.meetings.push(meeting);
      myPerson.meetingCount++;
      otherPerson.meetingCount++;

      if (meeting.location && !myPerson.location) {
        myPerson.location = meeting.location;
      }
      if (meeting.location && !otherPerson.location) {
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
      const connectionMeetings = meetings.filter(m => 
        (m.my_name === connection.person1Id && m.other_name === connection.person2Id) ||
        (m.my_name === connection.person2Id && m.other_name === connection.person1Id)
      );
      connection.averageRating = connectionMeetings.reduce((sum, m) => sum + m.rating, 0) / connectionMeetings.length;
    });

    return {
      people: Array.from(peopleMap.values()),
      connections: Array.from(connectionMap.values()),
    };
  }, [meetings, allPeople]);

  const handleMeetingSubmit = useCallback(async (meetingData: any) => {
    const result = await addMeeting(meetingData);
    if (result?.success) {
      setShowForm(false);
    }
  }, [addMeeting]);

  const stats = useMemo(() => ({
    totalPeople: people.length,
    totalConnections: connections.length,
    averageTrust: people.length > 0 
      ? people.reduce((sum, p) => sum + p.averageRating, 0) / people.length 
      : 0,
    totalMeetings: meetings.length,
  }), [people, connections, meetings]);

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border shadow-soft animate-fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 hover-scale cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative">
                <Heart className="w-8 h-8 text-primary animate-pulse" />
                <Sparkles className="w-4 h-4 text-primary/60 absolute -top-1 -right-1" />
              </div>
               <div>
                 <h1 className="text-2xl font-bold text-foreground">{t('app.title')}</h1>
                 <p className="text-xs text-muted-foreground">{t('app.subtitle')}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{user.email?.split('@')[0]}</span>
                  </div>
                  <Button 
                    onClick={() => navigate('/communities')}
                    variant="ghost"
                    size="sm"
                    className="hover-scale"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {t('nav.communities')}
                  </Button>
                  <Button 
                    onClick={() => navigate('/profile')}
                    variant="ghost"
                    size="sm"
                    className="hover-scale"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {t('nav.profile')}
                  </Button>
                  <Button 
                    onClick={() => navigate('/settings')}
                    variant="ghost"
                    size="sm"
                    className="hover-scale"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {t('nav.settings')}
                  </Button>
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-primary hover:opacity-90 transition-all duration-300 hover-scale shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{t('nav.record')}</span>
                    <span className="sm:hidden">{t('nav.record')}</span>
                  </Button>
                  <Button 
                    onClick={signOut}
                    variant="outline"
                    size="sm"
                    className="hover-scale"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{t('nav.logout')}</span>
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-primary hover:opacity-90 transition-all duration-300 hover-scale shadow-lg"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('nav.login')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        {!user ? (
          <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-secondary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
            
            <div className="relative z-10 text-center py-20 animate-fade-in">
              <div className="max-w-4xl mx-auto px-4 space-y-12">
                {/* Hero Icon */}
                <div className="relative inline-block">
                  <div className="relative">
                    <Heart className="w-32 h-32 text-primary mx-auto animate-pulse drop-shadow-2xl" />
                    <div className="absolute inset-0 w-32 h-32 mx-auto border-2 border-primary/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 w-32 h-32 mx-auto border border-primary/20 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  </div>
                  <Sparkles className="w-8 h-8 text-accent absolute -top-4 -right-4 animate-bounce" />
                  <Network className="w-6 h-6 text-primary/60 absolute -bottom-2 -left-6 animate-pulse" />
                </div>
                
                {/* Headline */}
                <div className="space-y-6">
                  <h1 className="text-6xl md:text-7xl font-bold text-foreground leading-tight tracking-tight">
                    <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
                      {t('app.title')}
                    </span>
                  </h1>
                  <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                    {t('landing.description')}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-lg text-primary/80">
                    <span>✨</span>
                    <span className="italic">人間関係の可視化で、コミュニティをもっと豊かに</span>
                    <span>✨</span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="space-y-6">
                  <Button 
                    onClick={() => navigate('/auth')}
                    size="lg"
                    className="bg-gradient-primary hover:opacity-90 transition-all duration-500 hover-scale shadow-xl px-12 py-6 text-xl font-semibold rounded-2xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <LogIn className="w-6 h-6 mr-3" />
                    <span>{t('landing.cta')}</span>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    📈 すでに <span className="font-semibold text-primary">1,000+</span> のつながりが記録されています
                  </p>
                </div>
                
                {/* Feature highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
                  <div className="group p-8 bg-gradient-to-br from-card/80 to-card/40 rounded-2xl backdrop-blur-sm border border-border/50 hover-scale transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Network className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl text-foreground mb-4">{t('landing.feature1.title')}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('landing.feature1.desc')}
                    </p>
                  </div>
                  <div className="group p-8 bg-gradient-to-br from-card/80 to-card/40 rounded-2xl backdrop-blur-sm border border-border/50 hover-scale transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10" style={{ animationDelay: '0.2s' }}>
                    <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="font-bold text-xl text-foreground mb-4">{t('landing.feature2.title')}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('landing.feature2.desc')}
                    </p>
                  </div>
                  <div className="group p-8 bg-gradient-to-br from-card/80 to-card/40 rounded-2xl backdrop-blur-sm border border-border/50 hover-scale transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/10" style={{ animationDelay: '0.4s' }}>
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="font-bold text-xl text-foreground mb-4">{t('landing.feature3.title')}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('landing.feature3.desc')}
                    </p>
                  </div>
                </div>
                
                {/* Social proof section */}
                <div className="mt-20 p-8 bg-gradient-to-r from-muted/30 to-muted/50 rounded-2xl backdrop-blur-sm border border-border/30">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full border-2 border-background"></div>
                        <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-full border-2 border-background"></div>
                        <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary/80 rounded-full border-2 border-background"></div>
                        <div className="w-10 h-10 bg-muted rounded-full border-2 border-background flex items-center justify-center text-xs font-semibold">+99</div>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground">活発なコミュニティ</p>
                        <p className="text-sm text-muted-foreground">毎日新しいつながりが生まれています</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-amber-500">
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <span className="ml-2 text-foreground font-semibold">4.9/5</span>
                      <span className="text-muted-foreground text-sm">(128件のレビュー)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
        <div className="animate-fade-in">
        <Tabs defaultValue="network" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-600 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="network" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Network className="w-4 h-4" />
              {t('tab.network')}
            </TabsTrigger>
            <TabsTrigger value="ai-finder" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bot className="w-4 h-4" />
              AI友達発見
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              {t('tab.stats')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="network" className="animate-fade-in">
            <Card className="h-[calc(100vh-200px)] bg-card/50 backdrop-blur-sm border-border/50 shadow-lg overflow-hidden">
              <CardContent className="p-0 h-full">
                {people.length > 0 ? (
                  <NetworkGraph 
                    people={people} 
                    connections={connections}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-6 animate-scale-in">
                      <div className="relative">
                        <Network className="w-16 h-16 text-muted-foreground mx-auto" />
                        <div className="absolute inset-0 w-16 h-16 mx-auto border-2 border-muted-foreground/20 rounded-full animate-ping"></div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {t('network.create')}
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                          {t('network.firstRecord')}
                        </p>
                      </div>
                      <Button 
                        onClick={() => setShowForm(true)}
                        className="bg-gradient-primary hover:opacity-90 transition-all duration-300 hover-scale shadow-lg"
                        size="lg"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        {t('network.firstMeeting')}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-finder" className="animate-fade-in">
            <AIFriendFinder />
          </TabsContent>

          <TabsContent value="stats" className="animate-fade-in">
            {/* Quick Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover-scale transition-all duration-300">
                <CardHeader className="pb-2 flex flex-row items-center space-y-0">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {t('stats.totalPeople')}
                  </CardTitle>
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-auto" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.totalPeople}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {t('stats.yourNetwork')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover-scale transition-all duration-300">
                <CardHeader className="pb-2 flex flex-row items-center space-y-0">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                    {t('stats.connections')}
                  </CardTitle>
                  <Network className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {stats.totalConnections}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {t('stats.relationships')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800 hover-scale transition-all duration-300">
                <CardHeader className="pb-2 flex flex-row items-center space-y-0">
                  <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    {t('stats.averageTrust')}
                  </CardTitle>
                  <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 ml-auto" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.averageTrust.toFixed(1)}★
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    {t('stats.trustLevel')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover-scale transition-all duration-300">
                <CardHeader className="pb-2 flex flex-row items-center space-y-0">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    {t('stats.totalMeetings')}
                  </CardTitle>
                  <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 ml-auto" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats.totalMeetings}
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {t('stats.recorded')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Meetings */}
            <Card className="bg-card/80 backdrop-blur-sm shadow-lg border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{t('network.stats.recentMeetings')}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">{t('stats.latestActivity')}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {meetings.slice(-10).reverse().map((meeting, index) => (
                    <div 
                      key={meeting.id}
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg hover:from-muted/50 hover:to-muted/70 transition-all duration-200 hover-scale border border-border/30"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground flex items-center gap-2">
                            <span className="truncate">{meeting.my_name}</span>
                            <Heart className="w-3 h-3 text-primary/60" />
                            <span className="truncate">{meeting.other_name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            {meeting.location && (
                              <>
                                <MapPin className="w-3 h-3" />
                                <span>{meeting.location}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>{new Date(meeting.created_at).toLocaleDateString('ja-JP')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                          <Star className="w-3 h-3 mr-1 text-amber-600" />
                          {meeting.rating}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {meetings.length === 0 && (
                    <div className="text-center py-12 animate-fade-in">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {t('stats.noMeetingsYet')}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {t('stats.startNetworking')}
                      </p>
                      <Button 
                        onClick={() => setShowForm(true)}
                        className="bg-gradient-primary hover:opacity-90 transition-all duration-300 hover-scale"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('nav.record')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
        )}
      </main>

      {/* Meeting Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative animate-scale-in">
            <button
              onClick={() => setShowForm(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-card rounded-full shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 z-10 hover-scale border border-border"
            >
              ×
            </button>
            <div className="animate-fade-in">
              <MeetingForm onSubmit={handleMeetingSubmit} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
