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
import { useLanguage } from '@/hooks/useLanguage';
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
  const { t } = useLanguage();
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
    trustworthiness: t('meeting.trustworthiness'),
    expertise: t('meeting.expertise'), 
    communication: t('meeting.communication'),
    collaboration: t('meeting.collaboration'),
    leadership: t('meeting.leadership'),
    innovation: t('meeting.innovation'),
    integrity: t('meeting.integrity')
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.myName.trim() || !formData.otherName.trim()) {
      toast({
        title: "Input Error",
        description: "Names are required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.detailed_feedback?.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide detailed feedback about the person",
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
        title: "Feedback Required",
        description: "Please provide feedback for AI analysis",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-feedback', {
        body: {
          text: formData.detailed_feedback,
          personName: formData.otherName || 'Person'
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
          title: "AI Analysis Complete!",
          description: "Multi-dimensional scores generated from feedback",
        });
        
        setActiveTab('advanced');
      } else {
        throw new Error(data.error || 'AI analysis failed');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: "AI Analysis Error",
        description: "Analysis failed. Please enter scores manually.",
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
    { value: 5, label: '5★ Excellent', color: 'trust-high' },
    { value: 4, label: '4★ Good', color: 'trust-high' },
    { value: 3, label: '3★ Average', color: 'trust-medium' },
    { value: 2, label: '2★ Poor', color: 'trust-low' },
    { value: 1, label: '1★ Bad', color: 'trust-low' }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/95 backdrop-blur-sm border-border/50 shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center text-foreground">
          <Users className="w-5 h-5 text-primary" />
          {t('meeting.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">{t('meeting.basicInfo')}</TabsTrigger>
              <TabsTrigger value="feedback">AI {t('meeting.evaluation')}</TabsTrigger>
              <TabsTrigger value="advanced">{t('meeting.detailedEvaluation')}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="myName">{t('meeting.yourName')}</Label>
                  <Input
                    id="myName"
                    value={formData.myName}
                    onChange={(e) => setFormData(prev => ({ ...prev, myName: e.target.value }))}
                    placeholder="John Doe"
                    className="bg-background/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherName">{t('meeting.otherName')}</Label>
                  <Input
                    id="otherName"
                    value={formData.otherName}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherName: e.target.value }))}
                    placeholder="Jane Smith"
                    className="bg-background/50"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {t('meeting.location')}
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
                  {t('meeting.overallRating')}
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
                <Label htmlFor="detailed_feedback" className="text-lg font-semibold flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  {t('meeting.feedback')}
                  <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Please describe your encounter with this person. AI will generate multi-dimensional evaluation from this content.
                </p>
                <Textarea
                  id="detailed_feedback"
                  value={formData.detailed_feedback}
                  onChange={(e) => setFormData(prev => ({ ...prev, detailed_feedback: e.target.value }))}
                  placeholder={t('meeting.feedbackPlaceholder')}
                  rows={10}
                  className="resize-none bg-background/50 border-primary/30 focus:border-primary"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  ※ Detailed feedback is required. The more details you provide, the more accurate the analysis.
                </p>
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
                    {t('meeting.analyzing')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Multi-dimensional Analysis
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-6">
              <div className="text-sm text-muted-foreground mb-4">
                Rate each item from 1-5 (3 is standard)
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
            disabled={!formData.myName.trim() || !formData.otherName.trim() || !formData.detailed_feedback?.trim()}
          >
            {t('meeting.save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MeetingForm;