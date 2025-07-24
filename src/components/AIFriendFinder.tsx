import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { Bot, Users, Star, Shield, TrendingUp } from 'lucide-react';

interface AddedPerson {
  id: string;
  name: string;
  company: string;
  position: string;
  location: string;
  trustAnalysis: {
    trustScore: number;
    expertiseScore: number;
    communicationScore: number;
    fraudRiskLevel: 'low' | 'medium' | 'high';
    reasoning: string;
  };
}

const AIFriendFinder: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('');
  const [addedPeople, setAddedPeople] = useState<AddedPerson[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const getFraudRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const simulateProgress = () => {
    const steps = [
      { progress: 10, status: 'LinkedInプロフィールをスクレイピング中...' },
      { progress: 30, status: 'AI分析エンジン起動中...' },
      { progress: 50, status: '接続者リストを抽出中...' },
      { progress: 70, status: '信頼スコアを算出中...' },
      { progress: 90, status: 'データベースに保存中...' },
      { progress: 100, status: '分析完了！' }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setProgress(step.progress);
        setCurrentStatus(step.status);
      }, index * 2000);
    });
  };

  const handleAnalyze = async () => {
    if (!linkedinUrl.trim()) {
      toast({
        title: "エラー",
        description: "LinkedIn URLを入力してください",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setCurrentStatus('分析を開始しています...');
    setAddedPeople([]);
    setAnalysisComplete(false);

    // Start progress simulation
    simulateProgress();

    try {
      const { data, error } = await supabase.functions.invoke('ai-friend-finder', {
        body: {
          linkedinUrl: linkedinUrl.trim(),
          searchDepth: 1
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setAddedPeople(data.addedPeople || []);
        setAnalysisComplete(true);
        toast({
          title: "分析完了！",
          description: data.message,
          duration: 5000,
        });
      } else {
        throw new Error(data.error || '分析に失敗しました');
      }
    } catch (error) {
      console.error('AI Friend Finder error:', error);
      toast({
        title: "エラー",
        description: error.message || 'AI分析中にエラーが発生しました',
        variant: "destructive",
      });
      setCurrentStatus('エラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setLinkedinUrl('');
    setProgress(0);
    setCurrentStatus('');
    setAddedPeople([]);
    setAnalysisComplete(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Bot className="h-8 w-8 text-primary" />
            AI友達発見エージェント
          </CardTitle>
          <p className="text-muted-foreground">
            LinkedInプロフィールを分析して、自動的に友達を探し出し、AIが信頼スコアを算出します
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="LinkedIn プロフィール URL を入力"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={isAnalyzing}
              className="flex-1"
            />
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !linkedinUrl.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isAnalyzing ? (
                <>
                  <Bot className="mr-2 h-4 w-4 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  AI分析開始
                </>
              )}
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-3">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {currentStatus}
              </p>
            </div>
          )}

          {analysisComplete && addedPeople.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  発見された友達 ({addedPeople.length}人)
                </h3>
                <Button variant="outline" onClick={handleReset}>
                  新しい分析
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {addedPeople.map((person) => (
                  <Card key={person.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random`} />
                          <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{person.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {person.position} @ {person.company}
                          </p>
                          <p className="text-xs text-muted-foreground">{person.location}</p>
                          
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">
                                信頼度: {person.trustAnalysis.trustScore}/5
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">
                                専門性: {person.trustAnalysis.expertiseScore}/5
                              </span>
                            </div>
                            
                            <Badge 
                              className={getFraudRiskColor(person.trustAnalysis.fraudRiskLevel)}
                              variant="secondary"
                            >
                              リスク: {person.trustAnalysis.fraudRiskLevel}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {person.trustAnalysis.reasoning}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {analysisComplete && addedPeople.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                新しい友達が見つかりませんでした。別のLinkedInプロフィールを試してみてください。
              </p>
              <Button variant="outline" onClick={handleReset} className="mt-4">
                別のプロフィールを分析
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIFriendFinder;