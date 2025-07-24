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
    
    // Profile
    'profile.title': 'プロフィール',
    'profile.settings': 'プロフィール設定',
    'profile.overallTrust': '総合信頼度スコア',
    'profile.yourOverallTrust': 'あなたの総合信頼度',
    'profile.developmentLevel': '開発レベル',
    'profile.linkedinTrust': 'LinkedIn信頼度',
    'profile.technicalScore': '技術スコア',
    'profile.peopleTrust': '相手からの信頼度',
    'profile.evaluations': '件の評価',
    'profile.noEvaluations': '評価データがありません',
    'profile.fraudRisk': '詐欺リスク',
    'profile.hallOfFame': '殿堂入りユーザー',
    'profile.trustRank': '信頼ランク',
    'profile.title.legend': 'レジェンド',
    'profile.title.master': 'マスター',
    'profile.title.expert': 'エキスパート',
    'profile.communityContribution': 'コミュニティ貢献',
    'profile.scoreExplanation': 'スコアについて',
    'profile.scoreDescription': '総合信頼度は、GitHub開発レベル、LinkedIn信頼度、ポートフォリオ技術スコア、人からの信頼度の平均値です。各プラットフォームの分析結果と実際の人間関係での評価を組み合わせて、あなたの専門性と信頼性を評価します。',
    'profile.basicInfo': '基本情報',
    'profile.github': 'GitHub',
    'profile.linkedin': 'LinkedIn',
    'profile.portfolio': 'ポートフォリオ',
    'profile.email': 'メールアドレス',
    'profile.displayName': '表示名',
    'profile.displayNamePlaceholder': '表示名を入力してください',
    'profile.avatarChange': '画像をクリックしてプロフィール写真を変更',
    'profile.analyzing': '分析中...',
    'profile.analyze': '分析',
    'profile.saving': '保存中...',
    'profile.save': '保存',
    'profile.loginRequired': 'ログインが必要です',
    'profile.loginButton': 'ログインする',
    'profile.back': '戻る',
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
    
    // Profile
    'profile.title': 'Profile',
    'profile.settings': 'Profile Settings',
    'profile.overallTrust': 'Overall Trust Score',
    'profile.yourOverallTrust': 'Your Overall Trust',
    'profile.developmentLevel': 'Development Level',
    'profile.linkedinTrust': 'LinkedIn Trust',
    'profile.technicalScore': 'Technical Score',
    'profile.peopleTrust': 'People\'s Trust',
    'profile.evaluations': 'evaluations',
    'profile.noEvaluations': 'No evaluation data',
    'profile.fraudRisk': 'Fraud Risk',
    'profile.hallOfFame': 'Hall of Fame User',
    'profile.trustRank': 'Trust Rank',
    'profile.title.legend': 'Legend',
    'profile.title.master': 'Master',
    'profile.title.expert': 'Expert',
    'profile.communityContribution': 'Community Contribution',
    'profile.scoreExplanation': 'About Score',
    'profile.scoreDescription': 'Overall trust score is the average of GitHub development level, LinkedIn trust, portfolio technical score, and people\'s trust. It evaluates your expertise and reliability by combining analysis results from each platform with actual human relationship evaluations.',
    'profile.basicInfo': 'Basic Info',
    'profile.github': 'GitHub',
    'profile.linkedin': 'LinkedIn',
    'profile.portfolio': 'Portfolio',
    'profile.email': 'Email Address',
    'profile.displayName': 'Display Name',
    'profile.displayNamePlaceholder': 'Enter your display name',
    'profile.avatarChange': 'Click image to change profile picture',
    'profile.analyzing': 'Analyzing...',
    'profile.analyze': 'Analyze',
    'profile.saving': 'Saving...',
    'profile.save': 'Save',
    'profile.loginRequired': 'Login required',
    'profile.loginButton': 'Login',
    'profile.back': 'Back',
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