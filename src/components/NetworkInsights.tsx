import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Users, Target } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface NetworkInsightsProps {
  communityId: string;
  userId: string;
}

interface AnalysisResult {
  skills: Record<string, string[]>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  networkInsights: {
    totalConnections: number;
    averageTrust: number;
    topSkills: { skill: string; category: string }[];
    missingSkills: string[];
  };
  analysisDate: string;
}

const NetworkInsights = ({ communityId, userId }: NetworkInsightsProps) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeNetwork = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-network-insights', {
        body: { communityId, userId }
      });

      if (error) {
        console.error('Analysis error:', error);
        toast.error('分析に失敗しました');
        return;
      }

      setAnalysis(data);
      toast.success('ネットワーク分析が完了しました');
    } catch (error) {
      console.error('Network analysis error:', error);
      toast.error('分析中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getSkillColor = (category: string) => {
    const colors = {
      '技術スキル': 'bg-blue-100 text-blue-800',
      'コミュニケーション': 'bg-green-100 text-green-800',
      '専門知識': 'bg-purple-100 text-purple-800',
      'その他': 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!analysis) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm border border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI人脈分析
          </CardTitle>
          <CardDescription>
            あなたの人脈ネットワークをAIが分析し、強み・弱み・改善提案を提供します
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={analyzeNetwork} 
            disabled={isLoading}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isLoading ? '分析中...' : '人脈を分析する'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/95 backdrop-blur-sm border border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI人脈分析結果
          </CardTitle>
          <CardDescription className="text-center">
            {new Date(analysis.analysisDate).toLocaleDateString('ja-JP')} に分析
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="skills">スキル分析</TabsTrigger>
          <TabsTrigger value="strengths">強み・弱み</TabsTrigger>
          <TabsTrigger value="recommendations">提案</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総つながり数</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.networkInsights.totalConnections}</div>
                <p className="text-xs text-muted-foreground">記録された出会い</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均信頼度</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analysis.networkInsights.averageTrust.toFixed(1)}/5
                </div>
                <p className="text-xs text-muted-foreground">全体の評価平均</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">分析スキル数</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(analysis.skills).flat().length}
                </div>
                <p className="text-xs text-muted-foreground">識別されたスキル</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>スキル分析</CardTitle>
              <CardDescription>
                あなたの人脈から識別されたスキルカテゴリ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(analysis.skills).map(([category, skills]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-semibold text-sm">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className={getSkillColor(category)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strengths" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  強み
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-5 h-5" />
                  改善ポイント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Lightbulb className="w-5 h-5" />
                改善提案
              </CardTitle>
              <CardDescription>
                AIが分析したあなたの人脈強化のための具体的な提案
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <Button 
          onClick={analyzeNetwork} 
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          <Brain className="w-4 h-4" />
          {isLoading ? '再分析中...' : '再分析する'}
        </Button>
      </div>
    </div>
  );
};

export default NetworkInsights;