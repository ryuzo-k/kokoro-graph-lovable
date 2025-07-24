import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
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
  const { t } = useLanguage();

  const analyzeNetwork = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-network-insights', {
        body: { communityId, userId }
      });

      if (error) {
        console.error('Analysis error:', error);
        toast.error(t('network.analysis.failed'));
        return;
      }

      setAnalysis(data);
      toast.success(t('network.analysis.complete'));
    } catch (error) {
      console.error('Network analysis error:', error);
      toast.error(t('network.analysis.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const getSkillColor = (category: string) => {
    const colors = {
      'Technical Skills': 'bg-blue-100 text-blue-800',
      'Communication': 'bg-green-100 text-green-800',
      'Expertise': 'bg-purple-100 text-purple-800',
      'Other': 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!analysis) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm border border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            {t('network.analysis.title')}
          </CardTitle>
          <CardDescription>
            {t('network.analysis.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={analyzeNetwork} 
            disabled={isLoading}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isLoading ? t('network.analysis.analyzing') : t('network.analysis.analyze')}
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
            {t('network.analysis.results')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('network.analysis.analyzedOn')} {new Date(analysis.analysisDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('network.analysis.overview')}</TabsTrigger>
          <TabsTrigger value="skills">{t('network.analysis.skills')}</TabsTrigger>
          <TabsTrigger value="strengths">{t('network.analysis.strengths')}</TabsTrigger>
          <TabsTrigger value="recommendations">{t('network.analysis.recommendations')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('network.stats.totalConnections')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.networkInsights.totalConnections}</div>
                <p className="text-xs text-muted-foreground">{t('stats.recorded')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('stats.averageTrust')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analysis.networkInsights.averageTrust.toFixed(1)}/5
                </div>
                <p className="text-xs text-muted-foreground">{t('network.analysis.overallAverage')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('network.analysis.skillsCount')}</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(analysis.skills).flat().length}
                </div>
                <p className="text-xs text-muted-foreground">{t('network.analysis.identifiedSkills')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('network.analysis.skillAnalysis')}</CardTitle>
              <CardDescription>
                {t('network.analysis.skillCategories')}
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
                  {t('network.analysis.strengths')}
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
                  {t('network.analysis.improvements')}
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
                {t('network.analysis.recommendations')}
              </CardTitle>
              <CardDescription>
                {t('network.analysis.recommendationsDesc')}
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
          {isLoading ? t('network.analysis.reanalyzing') : t('network.analysis.reanalyze')}
        </Button>
      </div>
    </div>
  );
};

export default NetworkInsights;