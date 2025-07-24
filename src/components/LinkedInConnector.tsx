import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Linkedin, Users, Sparkles, TrendingUp, Zap } from 'lucide-react';

interface LinkedInConnectorProps {
  onConnectionSuccess?: () => void;
}

const LinkedInConnector = ({ onConnectionSuccess }: LinkedInConnectorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkedInConnect = async () => {
    if (!user) {
      toast({
        title: language === 'ja' ? "ログインが必要" : "Login Required",
        description: language === 'ja' ? "LinkedIn連携にはログインが必要です" : "Please login to connect LinkedIn",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // LinkedInのOAuth流れを実装
      // 実際の実装では、LinkedIn APIを使用してユーザーの接続を取得
      
      // デモ用の遅延
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: language === 'ja' ? "LinkedIn連携完了！" : "LinkedIn Connected!",
        description: language === 'ja' 
          ? "あなたのネットワークが可視化されました。新しい接続を探索してみましょう！" 
          : "Your network has been visualized. Explore new connections!",
      });
      
      setIsOpen(false);
      onConnectionSuccess?.();
      
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      toast({
        title: language === 'ja' ? "接続エラー" : "Connection Error",
        description: language === 'ja' ? "LinkedIn連携に失敗しました" : "Failed to connect LinkedIn",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          className="h-6 text-xs border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
        >
          <Linkedin className="w-3 h-3 mr-1" />
          {language === 'ja' ? 'LinkedIn連携' : 'Connect LinkedIn'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] glass-effect">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            {language === 'ja' ? 'LinkedIn連携' : 'Connect LinkedIn'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Benefits Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg gradient-text">
              {language === 'ja' ? 'LinkedIn連携のメリット' : 'Benefits of LinkedIn Integration'}
            </h3>
            
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 glass-effect rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">
                    {language === 'ja' ? '自動ネットワーク構築' : 'Automatic Network Building'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ja' 
                      ? 'LinkedInの接続から自動でネットワークグラフを構築'
                      : 'Automatically build network graph from LinkedIn connections'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 glass-effect rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">
                    {language === 'ja' ? 'リアルタイム更新' : 'Real-time Updates'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ja' 
                      ? '新しい接続や変更を自動で反映'
                      : 'Automatically reflect new connections and changes'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 glass-effect rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-trust-high/20 to-trust-medium/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-trust-high" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">
                    {language === 'ja' ? 'インサイト分析' : 'Network Insights'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ja' 
                      ? 'ネットワークの影響力と関係性を分析'
                      : 'Analyze network influence and relationships'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Privacy Note */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-xs text-muted-foreground">
                <strong className="text-foreground">
                  {language === 'ja' ? 'プライバシー保護' : 'Privacy Protected'}
                </strong>
                <br />
                {language === 'ja' 
                  ? 'あなたの情報は安全に保護され、他のユーザーには共有されません。'
                  : 'Your information is securely protected and not shared with other users.'
                }
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <Button 
            onClick={handleLinkedInConnect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-glow"
            size="lg"
          >
            {isConnecting ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                {language === 'ja' ? '接続中...' : 'Connecting...'}
              </>
            ) : (
              <>
                <Linkedin className="w-4 h-4 mr-2" />
                {language === 'ja' ? 'LinkedInに接続' : 'Connect to LinkedIn'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedInConnector;