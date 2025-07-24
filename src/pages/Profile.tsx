import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Save, ArrowLeft, Github, Linkedin, Globe, Search, Shield, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile, analyzeGitHub, analyzeLinkedIn, analyzePortfolio } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState({ github: false, linkedin: false, portfolio: false });
  const [formData, setFormData] = useState({
    display_name: '',
    avatar_url: '',
    github_username: '',
    linkedin_url: '',
    portfolio_url: ''
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        avatar_url: profile.avatar_url || '',
        github_username: profile.github_username || '',
        linkedin_url: profile.linkedin_url || '',
        portfolio_url: profile.portfolio_url || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const result = await updateProfile({
        display_name: formData.display_name,
        avatar_url: formData.avatar_url,
        github_username: formData.github_username,
        linkedin_url: formData.linkedin_url,
        portfolio_url: formData.portfolio_url
      });

      if (result.success) {
        toast({
          title: "保存完了",
          description: "プロフィールが更新されました",
        });
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "エラー",
        description: "プロフィールの保存に失敗しました",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));

      toast({
        title: "アップロード完了",
        description: "プロフィール画像をアップロードしました",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "エラー",
        description: "画像のアップロードに失敗しました",
        variant: "destructive"
      });
    }
  };

  const handleAnalyzeGitHub = async () => {
    if (!formData.github_username.trim()) {
      toast({
        title: "エラー",
        description: "GitHubユーザー名を入力してください",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(prev => ({ ...prev, github: true }));
    await analyzeGitHub(formData.github_username.trim());
    setAnalyzing(prev => ({ ...prev, github: false }));
  };

  const handleAnalyzeLinkedIn = async () => {
    if (!formData.linkedin_url.trim()) {
      toast({
        title: "エラー",
        description: "LinkedIn URLを入力してください",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(prev => ({ ...prev, linkedin: true }));
    await analyzeLinkedIn(formData.linkedin_url.trim());
    setAnalyzing(prev => ({ ...prev, linkedin: false }));
  };

  const handleAnalyzePortfolio = async () => {
    if (!formData.portfolio_url.trim()) {
      toast({
        title: "エラー",
        description: "ポートフォリオURLを入力してください",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(prev => ({ ...prev, portfolio: true }));
    await analyzePortfolio(formData.portfolio_url.trim());
    setAnalyzing(prev => ({ ...prev, portfolio: false }));
  };

  const getFraudRiskColor = (riskLevel: string | null) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p>ログインが必要です</p>
            <Button onClick={() => navigate('/auth')} className="mt-4">
              ログインする
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <header className="bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
            <h1 className="text-xl font-bold">プロフィール</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="bg-card/80 backdrop-blur-sm shadow-card">
          <CardHeader>
            <CardTitle>プロフィール設定</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">基本情報</TabsTrigger>
                <TabsTrigger value="github">GitHub</TabsTrigger>
                <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                <TabsTrigger value="portfolio">ポートフォリオ</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-6 mt-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={formData.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        {formData.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    画像をクリックしてプロフィール写真を変更
                  </p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_name">表示名</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="表示名を入力してください"
                      disabled={loading}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* GitHub Tab */}
              <TabsContent value="github" className="space-y-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Github className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">GitHub分析</h3>
                  {profile?.github_score && (
                    <Badge variant="outline" className={getScoreColor(profile.github_score)}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {profile.github_score}/100
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="github_username">GitHubユーザー名</Label>
                    <div className="flex gap-2">
                      <Input
                        id="github_username"
                        value={formData.github_username}
                        onChange={(e) => setFormData(prev => ({ ...prev, github_username: e.target.value }))}
                        placeholder="github-username"
                        disabled={loading}
                      />
                      <Button 
                        onClick={handleAnalyzeGitHub}
                        disabled={analyzing.github}
                        variant="outline"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        {analyzing.github ? '分析中...' : '分析'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      GitHubアカウントから開発レベルを自動算出します
                    </p>
                  </div>

                  {profile?.github_score && (
                    <Card className="p-4 bg-muted/50">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">開発レベル</span>
                          <span className={`font-bold ${getScoreColor(profile.github_score)}`}>
                            {profile.github_score}/100
                          </span>
                        </div>
                        
                        {/* Score explanation */}
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                            スコア算出方法
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-300">
                            <div>• アカウント年数: 20点</div>
                            <div>• リポジトリ数: 25点</div>
                            <div>• 獲得スター数: 20点</div>
                            <div>• 言語多様性: 15点</div>
                            <div>• フォロワー数: 10点</div>
                            <div>• 最近の活動: 10点</div>
                          </div>
                        </div>
                        
                        {/* Detailed analysis */}
                        {profile.analysis_details && Object.keys(profile.analysis_details).length > 0 && (
                          <div className="mt-4 pt-3 border-t border-border">
                            <h4 className="text-sm font-semibold mb-2">分析詳細</h4>
                            <div className="space-y-3 text-xs">
                              {/* GitHub analysis from details object */}
                              {profile.analysis_details.details && (
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-blue-600 font-medium">アカウント年数:</span>
                                    <span className="ml-2">{profile.analysis_details.details.accountAgeYears} 年</span>
                                  </div>
                                  <div>
                                    <span className="text-green-600 font-medium">リポジトリ数:</span>
                                    <span className="ml-2">{profile.analysis_details.details.repositoryCount}</span>
                                  </div>
                                  <div>
                                    <span className="text-orange-600 font-medium">スター数:</span>
                                    <span className="ml-2">{profile.analysis_details.details.totalStars}</span>
                                  </div>
                                  <div>
                                    <span className="text-purple-600 font-medium">フォロワー数:</span>
                                    <span className="ml-2">{profile.analysis_details.details.followers}</span>
                                  </div>
                                  <div>
                                    <span className="text-indigo-600 font-medium">言語多様性:</span>
                                    <span className="ml-2">{profile.analysis_details.details.languageDiversity}</span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Analysis breakdown */}
                              {profile.analysis_details.breakdown && (
                                <div className="pt-2 border-t">
                                  <h5 className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">あなたの獲得点数</h5>
                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="flex justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                                      <span>アカウント年数:</span>
                                      <span className="font-medium text-blue-600">{Math.round(profile.analysis_details.breakdown.account_age * 100) / 100}/20</span>
                                    </div>
                                    <div className="flex justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                                      <span>リポジトリ:</span>
                                      <span className="font-medium text-green-600">{Math.round(profile.analysis_details.breakdown.repository_count * 100) / 100}/25</span>
                                    </div>
                                    <div className="flex justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                                      <span>スター:</span>
                                      <span className="font-medium text-orange-600">{Math.round(profile.analysis_details.breakdown.stars_received * 100) / 100}/20</span>
                                    </div>
                                    <div className="flex justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                                      <span>言語多様性:</span>
                                      <span className="font-medium text-purple-600">{Math.round(profile.analysis_details.breakdown.language_diversity * 100) / 100}/15</span>
                                    </div>
                                    <div className="flex justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                                      <span>フォロワー:</span>
                                      <span className="font-medium text-indigo-600">{Math.round(profile.analysis_details.breakdown.followers * 100) / 100}/10</span>
                                    </div>
                                    <div className="flex justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                                      <span>活動状況:</span>
                                      <span className="font-medium text-teal-600">{Math.round(profile.analysis_details.breakdown.recent_activity * 100) / 100}/10</span>
                                    </div>
                                  </div>
                                  <div className="mt-3 pt-2 border-t text-center">
                                    <span className="text-sm font-semibold">
                                      合計: <span className={`text-lg ${getScoreColor(profile.github_score)}`}>{profile.github_score}/100</span>
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {profile.last_analyzed_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            最終分析: {new Date(profile.last_analyzed_at).toLocaleDateString('ja-JP')}
                          </p>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* LinkedIn Tab */}
              <TabsContent value="linkedin" className="space-y-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Linkedin className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">LinkedIn分析</h3>
                  {profile?.linkedin_score && (
                    <Badge variant="outline" className={getScoreColor(profile.linkedin_score)}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {profile.linkedin_score}/100
                    </Badge>
                  )}
                  {profile?.fraud_risk_level && (
                    <Badge className={`${getFraudRiskColor(profile.fraud_risk_level)} text-white`}>
                      <Shield className="w-3 h-3 mr-1" />
                      詐欺リスク: {profile.fraud_risk_level}
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                        placeholder="https://www.linkedin.com/in/your-profile"
                        disabled={loading}
                      />
                      <Button 
                        onClick={handleAnalyzeLinkedIn}
                        disabled={analyzing.linkedin}
                        variant="outline"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        {analyzing.linkedin ? '分析中...' : '分析'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      LinkedInプロフィールから経験レベルを算出し、詐欺師を検出します
                    </p>
                  </div>

                  {profile?.linkedin_score && (
                    <Card className="p-4 bg-muted/50">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">信頼度スコア</span>
                          <span className={`font-bold ${getScoreColor(profile.linkedin_score)}`}>
                            {profile.linkedin_score}/100
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">詐欺リスク</span>
                          <Badge className={`${getFraudRiskColor(profile.fraud_risk_level)} text-white`}>
                            {profile.fraud_risk_level}
                          </Badge>
                        </div>
                        
                        {/* Detailed analysis */}
                        {profile.analysis_details?.linkedin_analysis && (
                          <div className="mt-4 pt-3 border-t border-border">
                            <h4 className="text-sm font-semibold mb-2">分析詳細</h4>
                            <div className="space-y-3 text-xs">
                              {/* Professional Score */}
                              {profile.analysis_details.linkedin_analysis.professional_score && (
                                <div>
                                  <span className="text-blue-600 font-medium">専門性スコア:</span>
                                  <span className="ml-2">{profile.analysis_details.linkedin_analysis.professional_score}/100</span>
                                </div>
                              )}
                              
                              {/* Red flags */}
                              {profile.analysis_details.linkedin_analysis.red_flags?.length > 0 && (
                                <div>
                                  <span className="text-red-600 font-medium">懸念事項:</span>
                                  <ul className="mt-1 ml-3 space-y-1">
                                    {profile.analysis_details.linkedin_analysis.red_flags.map((flag: string, index: number) => (
                                      <li key={index} className="text-red-600">• {flag}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Positive indicators */}
                              {profile.analysis_details.linkedin_analysis.positive_indicators?.length > 0 && (
                                <div>
                                  <span className="text-green-600 font-medium">良い点:</span>
                                  <ul className="mt-1 ml-3 space-y-1">
                                    {profile.analysis_details.linkedin_analysis.positive_indicators.map((indicator: string, index: number) => (
                                      <li key={index} className="text-green-600">• {indicator}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Experience assessment */}
                              {profile.analysis_details.linkedin_analysis.experience_assessment && (
                                <div className="pt-2 border-t">
                                  <span className="text-purple-600 font-medium">経験評価:</span>
                                  <div className="mt-1 space-y-1">
                                    <div>推定経験年数: {profile.analysis_details.linkedin_analysis.experience_assessment.estimated_years}年</div>
                                    <div>キャリア進行: {profile.analysis_details.linkedin_analysis.experience_assessment.career_progression}</div>
                                    <div>スキル一貫性: {profile.analysis_details.linkedin_analysis.experience_assessment.skill_consistency}</div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Overall assessment */}
                              {profile.analysis_details.linkedin_analysis.overall_assessment && (
                                <div className="pt-2 border-t">
                                  <span className="font-medium">総合評価:</span>
                                  <p className="mt-1 text-muted-foreground">
                                    {profile.analysis_details.linkedin_analysis.overall_assessment}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Portfolio Tab */}
              <TabsContent value="portfolio" className="space-y-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">ポートフォリオ分析</h3>
                  {profile?.portfolio_score && (
                    <Badge variant="outline" className={getScoreColor(profile.portfolio_score)}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {profile.portfolio_score}/100
                    </Badge>
                  )}
                  {profile?.fraud_risk_level && (
                    <Badge className={`${getFraudRiskColor(profile.fraud_risk_level)} text-white`}>
                      <Shield className="w-3 h-3 mr-1" />
                      詐欺リスク: {profile.fraud_risk_level}
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="portfolio_url">ポートフォリオURL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="portfolio_url"
                        value={formData.portfolio_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                        placeholder="https://your-portfolio.com"
                        disabled={loading}
                      />
                      <Button 
                        onClick={handleAnalyzePortfolio}
                        disabled={analyzing.portfolio}
                        variant="outline"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        {analyzing.portfolio ? '分析中...' : '分析'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ポートフォリオサイトから技術レベルを評価し、詐欺的な表現を検出します
                    </p>
                  </div>

                  {profile?.portfolio_score && (
                    <Card className="p-4 bg-muted/50">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">技術スコア</span>
                          <span className={`font-bold ${getScoreColor(profile.portfolio_score)}`}>
                            {profile.portfolio_score}/100
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">詐欺リスク</span>
                          <Badge className={`${getFraudRiskColor(profile.fraud_risk_level)} text-white`}>
                            {profile.fraud_risk_level}
                          </Badge>
                        </div>
                        
                        {/* Detailed analysis */}
                        {profile.analysis_details?.portfolio_analysis && (
                          <div className="mt-4 pt-3 border-t border-border">
                            <h4 className="text-sm font-semibold mb-2">分析詳細</h4>
                            <div className="space-y-2 text-xs">
                              {profile.analysis_details.portfolio_analysis.skills_detected?.length > 0 && (
                                <div>
                                  <span className="text-blue-600 font-medium">検出スキル:</span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {profile.analysis_details.portfolio_analysis.skills_detected.map((skill: string, index: number) => (
                                      <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {profile.analysis_details.portfolio_analysis.red_flags?.length > 0 && (
                                <div>
                                  <span className="text-red-600 font-medium">懸念事項:</span>
                                  <ul className="mt-1 ml-3 space-y-1">
                                    {profile.analysis_details.portfolio_analysis.red_flags.map((flag: string, index: number) => (
                                      <li key={index} className="text-red-600">• {flag}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {profile.analysis_details.portfolio_analysis.positive_indicators?.length > 0 && (
                                <div>
                                  <span className="text-green-600 font-medium">良い点:</span>
                                  <ul className="mt-1 ml-3 space-y-1">
                                    {profile.analysis_details.portfolio_analysis.positive_indicators.map((indicator: string, index: number) => (
                                      <li key={index} className="text-green-600">• {indicator}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {profile.analysis_details.portfolio_analysis.overall_assessment && (
                                <div>
                                  <span className="font-medium">総合評価:</span>
                                  <p className="mt-1 text-muted-foreground">
                                    {profile.analysis_details.portfolio_analysis.overall_assessment}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            {/* Save Button */}
            <div className="pt-4">
              <Button 
                onClick={handleSave}
                disabled={saving || loading}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;