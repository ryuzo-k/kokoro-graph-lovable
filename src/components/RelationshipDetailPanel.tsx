import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Users, 
  Clock, 
  Star, 
  TrendingUp, 
  MessageCircle, 
  Calendar,
  Heart,
  Network,
  Target,
  Award
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useRelationships, Relationship, RelationshipTimeline } from '@/hooks/useRelationships';
import { Person } from '@/hooks/usePeople';

interface PersonWithStats extends Person {
  averageRating: number;
  meetingCount: number;
}

interface RelationshipDetailPanelProps {
  person: PersonWithStats;
  onClose: () => void;
}

const RelationshipDetailPanel = ({ person, onClose }: RelationshipDetailPanelProps) => {
  const { language } = useLanguage();
  const {
    getPersonRelationships,
    getPersonTimeline,
    findShortestPath,
    getInfluenceMap
  } = useRelationships();

  const [selectedView, setSelectedView] = useState<'relationships' | 'timeline' | 'influence'>('relationships');

  const personRelationships = getPersonRelationships(person.id);
  const personTimeline = getPersonTimeline(person.id);
  const influenceMap = getInfluenceMap();
  const personInfluence = influenceMap.get(person.id) || 0;

  const getTrustColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600 bg-green-100';
    if (score >= 4) return 'text-blue-600 bg-blue-100';
    if (score >= 3) return 'text-yellow-600 bg-yellow-100';
    if (score >= 2) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getRelationshipStrengthColor = (strength: number) => {
    if (strength >= 3) return 'text-purple-600 bg-purple-100';
    if (strength >= 2) return 'text-indigo-600 bg-indigo-100';
    if (strength >= 1) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === 'ja' 
      ? date.toLocaleDateString('ja-JP')
      : date.toLocaleDateString('en-US');
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return language === 'ja' ? '今日' : 'Today';
    if (daysDiff === 1) return language === 'ja' ? '昨日' : 'Yesterday';
    if (daysDiff < 7) return language === 'ja' ? `${daysDiff}日前` : `${daysDiff} days ago`;
    if (daysDiff < 30) return language === 'ja' ? `${Math.floor(daysDiff / 7)}週間前` : `${Math.floor(daysDiff / 7)} weeks ago`;
    return language === 'ja' ? `${Math.floor(daysDiff / 30)}ヶ月前` : `${Math.floor(daysDiff / 30)} months ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-4xl h-[80vh] overflow-hidden animate-scale-in glass-effect">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                <span className="text-2xl font-bold text-primary-foreground">
                  {person.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl gradient-text">
                  {person.name}
                  {language === 'ja' ? 'の関係性分析' : "'s Relationship Analysis"}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className={getTrustColor(person.averageRating)}>
                    <Star className="w-3 h-3 mr-1" />
                    {person.averageRating.toFixed(1)}
                  </Badge>
                  <Badge className={getRelationshipStrengthColor(personInfluence)}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {language === 'ja' ? '影響力' : 'Influence'}: {personInfluence.toFixed(1)}
                  </Badge>
                  <Badge variant="outline">
                    <Network className="w-3 h-3 mr-1" />
                    {personRelationships.length} {language === 'ja' ? '件の関係' : 'connections'}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="hover-scale"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-full">
          <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-4 mb-2">
              <TabsTrigger value="relationships" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {language === 'ja' ? '関係性' : 'Relationships'}
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {language === 'ja' ? 'タイムライン' : 'Timeline'}
              </TabsTrigger>
              <TabsTrigger value="influence" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                {language === 'ja' ? '影響分析' : 'Influence'}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 px-4 pb-4">
              <TabsContent value="relationships" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {personRelationships.map((relationship) => (
                        <Card key={relationship.id} className="p-4 hover-lift glass-effect">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-foreground">
                                {/* 相手の名前を表示（実際には人物データから取得する必要があります） */}
                                {language === 'ja' ? '相手' : 'Connected Person'}
                              </h4>
                              <Badge className={getTrustColor(relationship.trust_score)}>
                                {relationship.trust_score.toFixed(1)}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {language === 'ja' ? '関係強度' : 'Strength'}
                                </span>
                                <Badge className={getRelationshipStrengthColor(relationship.relationship_strength)}>
                                  {relationship.relationship_strength.toFixed(1)}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {language === 'ja' ? '会った回数' : 'Meetings'}
                                </span>
                                <span className="font-medium">{relationship.total_meetings}</span>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {language === 'ja' ? '最後の接触' : 'Last Contact'}
                                </span>
                                <span className="text-xs">{getTimeAgo(relationship.last_interaction)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant={relationship.relationship_status === 'active' ? 'default' : 'secondary'}>
                                {relationship.relationship_status}
                              </Badge>
                              {relationship.is_mutual && (
                                <Badge variant="outline">
                                  <Heart className="w-3 h-3 mr-1" />
                                  {language === 'ja' ? '相互' : 'Mutual'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {personRelationships.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {language === 'ja' 
                            ? 'まだ関係性が記録されていません' 
                            : 'No relationships recorded yet'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="timeline" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {personTimeline.map((entry, index) => (
                      <div key={entry.id} className="relative">
                        {index !== personTimeline.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-16 bg-border"></div>
                        )}
                        <div className="flex items-start gap-4 p-4 glass-effect rounded-lg hover-lift">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                            <Calendar className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">
                                {entry.relationship_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(entry.event_date)}
                              </span>
                            </div>
                            <p className="text-foreground">{entry.description}</p>
                            {entry.trust_change && (
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <span className="text-sm text-muted-foreground">
                                  {language === 'ja' ? '信頼度変化' : 'Trust Change'}: {entry.trust_change > 0 ? '+' : ''}{entry.trust_change}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {personTimeline.length === 0 && (
                      <div className="text-center py-12">
                        <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {language === 'ja' 
                            ? 'まだタイムラインがありません' 
                            : 'No timeline entries yet'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="influence" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    {/* 影響力メトリクス */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="p-4 text-center glass-effect">
                        <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                        <div className="text-2xl font-bold text-foreground">{personInfluence.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">
                          {language === 'ja' ? '総合影響力' : 'Total Influence'}
                        </div>
                      </Card>
                      
                      <Card className="p-4 text-center glass-effect">
                        <Network className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-foreground">{personRelationships.length}</div>
                        <div className="text-xs text-muted-foreground">
                          {language === 'ja' ? '直接的関係' : 'Direct Connections'}
                        </div>
                      </Card>
                      
                      <Card className="p-4 text-center glass-effect">
                        <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-foreground">{person.averageRating.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">
                          {language === 'ja' ? '平均信頼度' : 'Avg Trust'}
                        </div>
                      </Card>
                      
                      <Card className="p-4 text-center glass-effect">
                        <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-foreground">
                          {personRelationships.filter(r => r.relationship_strength > 2).length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {language === 'ja' ? '強い関係' : 'Strong Bonds'}
                        </div>
                      </Card>
                    </div>

                    {/* ネットワーク分析 */}
                    <Card className="p-6 glass-effect">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        {language === 'ja' ? 'ネットワーク分析' : 'Network Analysis'}
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            {language === 'ja' ? '中心性スコア' : 'Centrality Score'}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-primary" 
                                style={{ width: `${Math.min(personInfluence * 20, 100)}%` }}
                              />
                            </div>
                            <span className="font-medium">{(personInfluence * 20).toFixed(0)}%</span>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="font-medium mb-2">
                            {language === 'ja' ? '関係性の質' : 'Relationship Quality'}
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                {language === 'ja' ? '高品質関係' : 'High Quality'}
                              </span>
                              <span className="font-medium">
                                {personRelationships.filter(r => r.trust_score >= 4).length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                {language === 'ja' ? '中品質関係' : 'Medium Quality'}
                              </span>
                              <span className="font-medium">
                                {personRelationships.filter(r => r.trust_score >= 3 && r.trust_score < 4).length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelationshipDetailPanel;