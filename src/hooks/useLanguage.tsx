import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ja: {
    // Header
    'app.title': 'Kokoro Graph',
    'app.subtitle': '信頼関係の可視化プラットフォーム',
    'nav.communities': 'コミュニティ',
    'nav.profile': 'プロフィール',
    'nav.record': '出会いを記録',
    'nav.login': 'ログイン',
    'nav.logout': 'ログアウト',
    'nav.settings': '設定',
    
    // Landing Page
    'landing.headline': 'あなたの人間関係を可視化しませんか？',
    'landing.description': 'Kokoro Graphで出会いを記録し、信頼関係のネットワークを築いていきましょう。あなたの人脈を美しく可視化し、新たな発見を。',
    'landing.feature1.title': 'ネットワーク可視化',
    'landing.feature1.desc': '人間関係を美しいグラフで表示',
    'landing.feature2.title': '信頼度分析',
    'landing.feature2.desc': 'AI による詳細な信頼度評価',
    'landing.feature3.title': 'インサイト発見',
    'landing.feature3.desc': '人脈から新たな気づきを発見',
    'landing.cta': '今すぐ始める',
    
    // Tabs
    'tab.network': 'ネットワーク',
    'tab.stats': '統計・分析',
    
    // Stats
    'stats.totalPeople': '総人数',
    'stats.connections': 'つながり',
    'stats.averageTrust': '平均信頼度',
    'stats.totalMeetings': '総出会い数',
    'stats.yourNetwork': 'あなたの人脈',
    'stats.relationships': '関係性の数',
    'stats.trustLevel': '信頼レベル',
    'stats.recorded': '記録された出会い',
    
    // Network
    'network.create': 'ネットワークを作成しましょう',
    'network.firstRecord': '最初の出会いを記録してあなたの人間関係ネットワークを可視化してください。一つ一つの出会いが美しいグラフになります。',
    'network.firstMeeting': '最初の出会いを記録',
    
    // Settings
    'settings.title': '設定',
    'settings.language': '言語設定',
    'settings.language.japanese': '日本語',
    'settings.language.english': 'English',
    'settings.account': 'アカウント情報',
    'settings.email': 'メールアドレス',
    'settings.userId': 'ユーザーID',
    'settings.back': '戻る',
    'settings.selected': '選択中',
    'settings.displayJapanese': '日本語で表示します',
    'settings.displayEnglish': 'Display in English',
    
    // Search
    'search.people': '人を検索...',
    'search.location': '場所',
    'search.all': 'すべて',
    'search.results': '件',
    'search.connections': 'つながり',
  },
  en: {
    // Header
    'app.title': 'Kokoro Graph',
    'app.subtitle': 'Trust Relationship Visualization Platform',
    'nav.communities': 'Communities',
    'nav.profile': 'Profile',
    'nav.record': 'Record Meeting',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.settings': 'Settings',
    
    // Landing Page
    'landing.headline': 'Visualize Your Human Relationships',
    'landing.description': 'Record your encounters with Kokoro Graph and build a network of trust relationships. Beautifully visualize your connections and discover new insights.',
    'landing.feature1.title': 'Network Visualization',
    'landing.feature1.desc': 'Display relationships in beautiful graphs',
    'landing.feature2.title': 'Trust Analysis',
    'landing.feature2.desc': 'Detailed trust evaluation by AI',
    'landing.feature3.title': 'Insight Discovery',
    'landing.feature3.desc': 'Discover new insights from your network',
    'landing.cta': 'Get Started Now',
    
    // Tabs
    'tab.network': 'Network',
    'tab.stats': 'Statistics',
    
    // Stats
    'stats.totalPeople': 'Total People',
    'stats.connections': 'Connections',
    'stats.averageTrust': 'Average Trust',
    'stats.totalMeetings': 'Total Meetings',
    'stats.yourNetwork': 'Your Network',
    'stats.relationships': 'Number of Relationships',
    'stats.trustLevel': 'Trust Level',
    'stats.recorded': 'Recorded Encounters',
    
    // Network
    'network.create': 'Let\'s Create Your Network',
    'network.firstRecord': 'Record your first encounter to visualize your human relationship network. Each encounter becomes a beautiful graph.',
    'network.firstMeeting': 'Record First Meeting',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language Settings',
    'settings.language.japanese': '日本語',
    'settings.language.english': 'English',
    'settings.account': 'Account Information',
    'settings.email': 'Email Address',
    'settings.userId': 'User ID',
    'settings.back': 'Back',
    'settings.selected': 'Selected',
    'settings.displayJapanese': '日本語で表示します',
    'settings.displayEnglish': 'Display in English',
    
    // Search
    'search.people': 'Search people...',
    'search.location': 'Location',
    'search.all': 'All',
    'search.results': 'results',
    'search.connections': 'connections',
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ja');

  useEffect(() => {
    // Get language from localStorage or detect from browser
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Auto-detect language based on browser locale
      const browserLanguage = navigator.language.toLowerCase();
      if (browserLanguage.startsWith('ja')) {
        setLanguage('ja');
      } else {
        setLanguage('en');
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};