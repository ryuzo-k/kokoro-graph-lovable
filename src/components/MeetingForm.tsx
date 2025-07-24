import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Brain, Users, MapPin, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MeetingData {
  myName: string;
  otherName: string;
  location: string;
  rating: number;
  // Multi-dimensional scores
  trustworthiness?: number;
  expertise?: number;
  communication?: number;
  collaboration?: number;
  leadership?: number;
  innovation?: number;
  integrity?: number;
  // AI analysis
  detailed_feedback?: string;
}

interface MeetingFormProps {
  onSubmit: (data: MeetingData) => void;
}

const MeetingForm = ({ onSubmit }: MeetingFormProps) => {
  const [formData, setFormData] = useState<MeetingData>({
    myName: '',
    otherName: '',
    location: '',
    rating: 3,
    trustworthiness: 3,
    expertise: 3,
    communication: 3,
    collaboration: 3,
    leadership: 3,
    innovation: 3,
    integrity: 3,
    detailed_feedback: '',
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const dimensionLabels = {
    trustworthiness: '信頼性',
    expertise: '専門性', 
    communication: 'コミュニケーション',
    collaboration: '協力性',
    leadership: 'リーダーシップ',
    innovation: '革新性',
    integrity: '誠実性'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.myName.trim() || !formData.otherName.trim()) {
      toast({
        title: "入力エラー",
        description: "名前は必須項目です",
        variant: "destructive"
      });
      return;
    }

    onSubmit(formData);
    
    // Reset form
    setFormData({
      myName: '',
      otherName: '',
      location: '',
      rating: 3,
      trustworthiness: 3,
      expertise: 3,
      communication: 3,
      collaboration: 3,
      leadership: 3,
      innovation: 3,
      integrity: 3,
      detailed_feedback: '',
    });
    setActiveTab('basic');
  };

  const handleAIAnalysis = async () => {
    if (!formData.detailed_feedback?.trim()) {
      toast({
        title: "フィードバックが必要です",
        description: "AI分析のためにフィードバックを入力してください",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-feedback', {
        body: {
          text: formData.detailed_feedback,
          personName: formData.otherName || '相手'
        }
      });

      if (error) throw error;

      if (data.success && data.analysis) {
        const analysis = data.analysis;
        setFormData(prev => ({
          ...prev,
          trustworthiness: analysis.trustworthiness,
          expertise: analysis.expertise,
          communication: analysis.communication,
          collaboration: analysis.collaboration,
          leadership: analysis.leadership,
          innovation: analysis.innovation,
          integrity: analysis.integrity,
        }));

        toast({
          title: "AI分析完了！",
          description: "フィードバックから多次元スコアを生成しました",
        });
        
        setActiveTab('advanced');
      } else {
        throw new Error(data.error || 'AI分析に失敗しました');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: "AI分析エラー",
        description: "分析に失敗しました。手動で評価を入力してください。",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDimensionChange = (dimension: keyof MeetingData, value: number) => {
    setFormData(prev => ({ ...prev, [dimension]: value }));
  };

  const ratings = [
    { value: 5, label: '5★ 素晴らしい', color: 'trust-high' },
    { value: 4, label: '4★ 良い', color: 'trust-high' },
    { value: 3, label: '3★ 普通', color: 'trust-medium' },
    { value: 2, label: '2★ あまり', color: 'trust-low' },
    { value: 1, label: '1★ 悪い', color: 'trust-low' }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/95 backdrop-blur-sm border-border/50 shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center text-foreground">
          <Users className="w-5 h-5 text-primary" />
          新しい出会いを記録
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本情報</TabsTrigger>
              <TabsTrigger value="feedback">AI分析</TabsTrigger>
              <TabsTrigger value="advanced">詳細評価</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="myName">あなたの名前</Label>
                  <Input
                    id="myName"
                    value={formData.myName}
                    onChange={(e) => setFormData(prev => ({ ...prev, myName: e.target.value }))}
                    placeholder="田中太郎"
                    className="bg-background/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherName">出会った相手</Label>
                  <Input
                    id="otherName"
                    value={formData.otherName}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherName: e.target.value }))}
                    placeholder="佐藤花子"
                    className="bg-background/50"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  場所・地域
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Tokyo, Shibuya"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  総合評価
                </Label>
                <Select
                  value={formData.rating.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ratings.map((rating) => (
                      <SelectItem key={rating.value} value={rating.value.toString()}>
                        <span className={`text-${rating.color}`}>
                          {rating.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="detailed_feedback">この人についての詳細なフィードバック</Label>
                <Textarea
                  id="detailed_feedback"
                  value={formData.detailed_feedback}
                  onChange={(e) => setFormData(prev => ({ ...prev, detailed_feedback: e.target.value }))}
                  placeholder="この人の印象、スキル、性格、協力性などについて正直に記述してください。AIが自動で多次元評価を行います。

例: 
- 技術的な知識が豊富で、複雑な問題も分かりやすく説明してくれた
- チームワークを大切にし、他のメンバーの意見もよく聞いていた
- 新しいアイデアを積極的に提案し、実装にも熱心だった"
                  rows={8}
                  className="resize-none bg-background/50"
                />
              </div>
              
              <Button 
                type="button"
                onClick={handleAIAnalysis}
                disabled={isAnalyzing || !formData.detailed_feedback?.trim()}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AIで多次元分析
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-6">
              <div className="text-sm text-muted-foreground mb-4">
                各項目を1-5で評価してください（3が標準）
              </div>
              
              {Object.entries(dimensionLabels).map(([key, label]) => (
                <div key={key} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">{label}</Label>
                    <span className="text-sm text-muted-foreground">
                      {formData[key as keyof MeetingData]}
                    </span>
                  </div>
                  <Slider
                    value={[formData[key as keyof MeetingData] as number]}
                    onValueChange={(value) => handleDimensionChange(key as keyof MeetingData, value[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <Button 
            type="submit" 
            className="w-full mt-6 bg-gradient-primary hover:opacity-90 transition-opacity"
            disabled={!formData.myName.trim() || !formData.otherName.trim()}
          >
            出会いを記録
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MeetingForm;