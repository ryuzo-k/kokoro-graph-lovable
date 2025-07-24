import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="hover-scale"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('settings.back')}
            </Button>
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">{t('settings.title')}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Language Settings */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                {t('settings.language')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={language === 'ja' ? 'default' : 'outline'}
                  onClick={() => setLanguage('ja')}
                  className="justify-start h-auto p-4 flex-col items-start space-y-2"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-lg">🇯🇵</span>
                    <span className="font-medium">{t('settings.language.japanese')}</span>
                    {language === 'ja' && <Badge variant="secondary" className="ml-auto">{t('settings.selected')}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    {t('settings.displayJapanese')}
                  </p>
                </Button>

                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  onClick={() => setLanguage('en')}
                  className="justify-start h-auto p-4 flex-col items-start space-y-2"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-lg">🇺🇸</span>
                    <span className="font-medium">{t('settings.language.english')}</span>
                    {language === 'en' && <Badge variant="secondary" className="ml-auto">{t('settings.selected')}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    {t('settings.displayEnglish')}
                  </p>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>{t('settings.account')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">{t('settings.email')}</label>
                <p className="text-foreground font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t('settings.userId')}</label>
                <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;