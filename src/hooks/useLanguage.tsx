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
    'profile.saving2': '保存中...',
    'profile.save2': '保存',
    'profile.loginRequired2': 'ログインが必要です',
    'profile.loginButton2': 'ログインする',
    'profile.back2': '戻る',
    'profile.fraudRiskLevel': '詐欺リスク',
    'profile.hallOfFameUser': '殿堂入りユーザー',
    'profile.trustRank2': '信頼ランク',
    'profile.title2': '称号',
    'profile.legendaryTrusted': '伝説の信頼者',
    'profile.hallOfFameTrusted': '信頼の殿堂入り',
    'profile.highTrust': '高信頼度ユーザー',
    'profile.communityContrib': 'コミュニティ貢献',
    'profile.exemplaryLeader': '模範的リーダー',
    'profile.trustworthyMember': '信頼できる仲間',
    'profile.valuableMember': '価値あるメンバー',
    'profile.ultimateTrust': 'あなたは究極の信頼を築き上げました！コミュニティの永続的な柱です。',
    'profile.trustworthy': 'あなたはコミュニティの信頼できるリーダーです。多くの人があなたを頼りにしています。',
    'profile.trustedMember': 'あなたは多くの人から信頼され、コミュニティの貴重なメンバーです。',
    'profile.scoreExplanationTitle': 'スコアについて',
    'profile.scoreExplanationText': '総合信頼度は、GitHub開発レベル、LinkedIn信頼度、ポートフォリオ技術スコア、人からの信頼度の平均値です。各プラットフォームの分析結果と実際の人間関係での評価を組み合わせて、あなたの専門性と信頼性を評価します。',
    
    // Tabs
    'profile.tabs.basic': '基本情報',
    'profile.tabs.github': 'GitHub',
    'profile.tabs.linkedin': 'LinkedIn',
    'profile.tabs.portfolio': 'ポートフォリオ',
    
    // GitHub Analysis
    'profile.github.analysis': 'GitHub分析',
    'profile.github.username': 'GitHubユーザー名',
    'profile.github.description': 'GitHubアカウントから開発レベルを自動算出します',
    'profile.github.scoreMethod': 'スコア算出方法',
    'profile.github.accountAge': 'アカウント年数',
    'profile.github.repositories': 'リポジトリ数',
    'profile.github.stars': '獲得スター数',
    'profile.github.languages': '言語多様性',
    'profile.github.followers': 'フォロワー数',
    'profile.github.activity': '最近の活動',
    'profile.github.details': '分析詳細',
    'profile.github.lastAnalyzed': '最終分析',
    'profile.github.total': '合計',
    'profile.github.yourScore': 'あなたの獲得点数',
    
    // LinkedIn Analysis  
    'profile.linkedin.analysis': 'LinkedIn分析',
    'profile.linkedin.description': 'LinkedInプロフィールから経験レベルを算出し、詐欺師を検出します',
    'profile.linkedin.trustScore': '信頼度スコア',
    'profile.linkedin.professionalScore': '専門性スコア',
    'profile.linkedin.redFlags': '懸念事項',
    'profile.linkedin.positiveIndicators': '良い点',
    'profile.linkedin.experienceAssessment': '経験評価',
    'profile.linkedin.estimatedYears': '推定経験年数',
    'profile.linkedin.careerProgression': 'キャリア進行',
    'profile.linkedin.skillConsistency': 'スキル一貫性',
    'profile.linkedin.overallAssessment': '総合評価',
    'profile.linkedin.years': '年',
    
    // Portfolio Analysis
    'profile.portfolio.analysis': 'ポートフォリオ分析',
    'profile.portfolio.url': 'ポートフォリオURL',
    'profile.portfolio.description': 'ポートフォリオサイトから技術レベルを評価し、詐欺的な表現を検出します',
    'profile.portfolio.technicalScore': '技術スコア',
    'profile.portfolio.skillsDetected': '検出スキル',
    'profile.portfolio.redFlags': '懸念事項',
    'profile.portfolio.positiveIndicators': '良い点',
    'profile.portfolio.overallAssessment': '総合評価',
    
    // Communities
    'communities.title': 'コミュニティ',
    'communities.back': '戻る',
    'communities.create': '新規作成',
    'communities.joined': '参加中のコミュニティ',
    'communities.all': 'すべてのコミュニティ',
    'communities.network': 'ネットワーク',
    'communities.join': '参加する',
    'communities.leave': '退出',
    'communities.noJoined': 'まだコミュニティに参加していません',
    'communities.newCommunity': '新しいコミュニティ',
    'communities.communityName': 'コミュニティ名',
    'communities.description': '説明（オプション）',
    'communities.cancel': 'キャンセル',
    'communities.placeholder.name': '例: 東京エンジニア会',
    'communities.placeholder.description': 'コミュニティの説明を入力してください',
    'communities.created': 'コミュニティを作成しました',
    'communities.createdSuccess': 'が正常に作成されました。',
    'communities.joined2': 'コミュニティに参加しました',
    'communities.joinedSuccess': 'に参加しました。',
    'communities.left': 'コミュニティから退出しました',
    'communities.leftSuccess': 'から退出しました。',
    
    // Meeting Form
    'meeting.title': '出会いを記録',
    'meeting.yourName': 'あなたの名前',
    'meeting.otherName': '相手の名前',
    'meeting.location': '場所',
    'meeting.basicInfo': '基本情報',
    'meeting.evaluation': '評価',
    'meeting.detailedEvaluation': '詳細評価',
    'meeting.overallRating': '総合評価',
    'meeting.trustworthiness': '信頼性',
    'meeting.expertise': '専門性',
    'meeting.communication': 'コミュニケーション',
    'meeting.collaboration': '協調性',
    'meeting.leadership': 'リーダーシップ',
    'meeting.innovation': '革新性',
    'meeting.integrity': '誠実性',
    'meeting.feedback': '詳細フィードバック',
    'meeting.feedbackPlaceholder': 'この人との出会いについて詳しく教えてください...',
    'meeting.cancel': 'キャンセル',
    'meeting.save': '保存',
    
    // Person Profile
    'person.profile': 'プロフィール',
    'person.trustScore': '信頼スコア',
    'person.connections': '件のつながり',
    'person.meetings': '件の出会い',
    'person.averageRating': '平均評価',
    'person.skills': 'スキル',
    'person.evaluationBreakdown': '評価内訳',
    'person.overallTrust': '総合信頼度',
    'person.professionalNetwork': 'プロフェッショナルネットワーク',
    'person.recentMeetings': '最近の出会い',
    'person.networkView': 'ネットワークビュー',
    'person.close': '閉じる',
    
    // Community Recommendations  
    'recommendations.title': 'おすすめコミュニティ',
    'recommendations.generating': 'AI分析中...',
    'recommendations.generate': 'おすすめを生成',
    'recommendations.noProfile': 'プロフィール分析を完了してください',
    'recommendations.matchScore': '適合度',
    'recommendations.reasons': '推薦理由',
    'recommendations.join': '参加する',
    'recommendations.highGithub': '高いGitHubスコアから技術コミュニティがおすすめ',
    'recommendations.highLinkedin': 'LinkedInプロフィールからビジネス系がおすすめ',
    'recommendations.portfolioMatch': 'ポートフォリオ内容と関連性があります',
    'recommendations.locationMatch': '地域が一致しています',
    'recommendations.error': 'おすすめ生成に失敗しました',
    
    // Network Visualization
    'network.communityNotFound': 'コミュニティが見つかりません',
    'network.backToCommunities': 'コミュニティ一覧に戻る',
    'network.noNetwork': 'このコミュニティにはまだネットワークがありません',
    'network.createFirst': '最初の出会いを記録してネットワークグラフを作成してください',
    'network.recordMeeting': '出会いを記録',
    'network.tabs.network': 'ネットワーク',
    'network.tabs.insights': 'AI分析',
    'network.tabs.stats': '統計',
    'network.insights.generating': 'AI分析中...',
    'network.insights.generate': 'インサイトを生成',
    'network.insights.networkAnalysis': 'ネットワーク分析',
    'network.insights.totalConnections': '総接続数',
    'network.insights.averageTrust': '平均信頼度',
    'network.insights.topSkills': 'トップスキル',
    'network.insights.missingSkills': '不足スキル',
    'network.insights.aiRecommendations': 'AI推奨事項',
    'network.insights.keyInsights': 'キーインサイト',
    'network.stats.metrics': 'メトリクス',
    'network.stats.recentMeetings': '最近の出会い',
    'network.stats.noMeetings': 'まだ出会いが記録されていません',
    'network.stats.ago': '前',
    'network.stats.withRating': '評価',
    
    // Stats page
    'stats.latestActivity': 'あなたの最新のネットワーク活動',
    'stats.noMeetingsYet': 'まだ出会いの記録がありません',
    'stats.startNetworking': '最初の出会いを記録して、あなたのネットワークを作り始めましょう',
    
    // Profile Tabs
    'profile.tabs.basicInfo': '基本情報',
    'profile.tabs.basicInfo2': '基本情報',
    'profile.tabs.github2': 'GitHub',
    'profile.tabs.linkedin2': 'LinkedIn', 
    'profile.tabs.portfolio2': 'ポートフォリオ',
    'profile.aboutScore': 'スコアについて',
    'profile.scoreDescriptionJa': '総合信頼度は、GitHub開発レベル、LinkedIn信頼度、ポートフォリオ技術スコア、人からの信頼度の平均値です。各プラットフォームの分析結果と実際の人間関係での評価を組み合わせて、あなたの専門性と信頼性を評価します。',
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
    
    // Communities
    'communities.title': 'Communities',
    'communities.back': 'Back',
    'communities.create': 'Create New',
    'communities.joined': 'Joined Communities',
    'communities.all': 'All Communities',
    'communities.network': 'Network',
    'communities.join': 'Join',
    'communities.leave': 'Leave',
    'communities.noJoined': 'You haven\'t joined any communities yet',
    'communities.newCommunity': 'New Community',
    'communities.communityName': 'Community Name',
    'communities.description': 'Description (Optional)',
    'communities.cancel': 'Cancel',
    'communities.placeholder.name': 'e.g. Tokyo Engineers',
    'communities.placeholder.description': 'Enter community description',
    'communities.created': 'Community Created',
    'communities.createdSuccess': ' has been successfully created.',
    'communities.joined2': 'Joined Community',
    'communities.joinedSuccess': '. You have joined ',
    'communities.left': 'Left Community',
    'communities.leftSuccess': '. You have left ',
    
    // Meeting Form
    'meeting.title': 'Record Meeting',
    'meeting.yourName': 'Your Name',
    'meeting.otherName': 'Other Person\'s Name',
    'meeting.location': 'Location',
    'meeting.basicInfo': 'Basic Info',
    'meeting.evaluation': 'Evaluation',
    'meeting.detailedEvaluation': 'Detailed Evaluation',
    'meeting.overallRating': 'Overall Rating',
    'meeting.trustworthiness': 'Trustworthiness',
    'meeting.expertise': 'Expertise',
    'meeting.communication': 'Communication',
    'meeting.collaboration': 'Collaboration',
    'meeting.leadership': 'Leadership',
    'meeting.innovation': 'Innovation',
    'meeting.integrity': 'Integrity',
    'meeting.feedback': 'Detailed Feedback',
    'meeting.feedbackPlaceholder': 'Tell us more about your encounter with this person...',
    'meeting.cancel': 'Cancel',
    'meeting.save': 'Save',
    
    // Person Profile
    'person.profile': 'Profile',
    'person.trustScore': 'Trust Score',
    'person.connections': ' connections',
    'person.meetings': ' meetings',
    'person.averageRating': 'Average Rating',
    'person.skills': 'Skills',
    'person.evaluationBreakdown': 'Evaluation Breakdown',
    'person.overallTrust': 'Overall Trust',
    'person.professionalNetwork': 'Professional Network',
    'person.recentMeetings': 'Recent Meetings',
    'person.networkView': 'Network View',
    'person.close': 'Close',
    
    // Community Recommendations  
    'recommendations.title': 'Recommended Communities',
    'recommendations.generating': 'AI Analyzing...',
    'recommendations.generate': 'Generate Recommendations',
    'recommendations.noProfile': 'Please complete your profile analysis',
    'recommendations.matchScore': 'Match Score',
    'recommendations.reasons': 'Recommendation Reasons',
    'recommendations.join': 'Join',
    'recommendations.highGithub': 'Tech communities recommended based on high GitHub score',
    'recommendations.highLinkedin': 'Business communities recommended based on LinkedIn profile',
    'recommendations.portfolioMatch': 'Related to your portfolio content',
    'recommendations.locationMatch': 'Location matches',
    'recommendations.error': 'Failed to generate recommendations',
    
    // Network Visualization
    'network.communityNotFound': 'Community not found',
    'network.backToCommunities': 'Back to Communities',
    'network.noNetwork': 'This community has no network yet',
    'network.createFirst': 'Record your first meeting to create the network graph',
    'network.recordMeeting': 'Record Meeting',
    'network.tabs.network': 'Network',
    'network.tabs.insights': 'AI Insights',
    'network.tabs.stats': 'Statistics',
    'network.insights.generating': 'Generating AI insights...',
    'network.insights.generate': 'Generate Insights',
    'network.insights.networkAnalysis': 'Network Analysis',
    'network.insights.totalConnections': 'Total Connections',
    'network.insights.averageTrust': 'Average Trust',
    'network.insights.topSkills': 'Top Skills',
    'network.insights.missingSkills': 'Missing Skills',
    'network.insights.aiRecommendations': 'AI Recommendations',
    'network.insights.keyInsights': 'Key Insights',
    'network.stats.metrics': 'Metrics',
    'network.stats.recentMeetings': 'Recent Meetings',
    'network.stats.noMeetings': 'No meetings recorded yet',
    'network.stats.ago': 'ago',
    'network.stats.withRating': 'rating',
    
    // Stats page  
    'stats.latestActivity': 'Your latest network activity',
    'stats.noMeetingsYet': 'No meetings recorded yet',
    'stats.startNetworking': 'Record your first meeting to start building your network',
    
    // Profile Tabs
    'profile.tabs.basicInfo2': 'Basic Info',
    'profile.tabs.github2': 'GitHub',
    'profile.tabs.linkedin2': 'LinkedIn', 
    'profile.tabs.portfolio2': 'Portfolio',
    'profile.aboutScore': 'About Score',
    'profile.scoreDescriptionEn': 'Overall trust score is the average of GitHub development level, LinkedIn trust, portfolio technical score, and trust from people. It combines analysis results from each platform with actual human relationship evaluations to assess your expertise and trustworthiness.',
    
    // Person Profile translations
    'profile.personTitle': 'Profile',
    'profile.averageRating': 'Average Rating',
    'profile.meetingCount': 'Meeting Count',
    'profile.bio': 'Bio',
    'profile.skills': 'Skills',
    'profile.multiDimensionalAssessment': 'Multi-dimensional Assessment',
    'profile.connectionNetwork': 'Connection Network',
    'profile.centralPerson': 'Central Person',
    'profile.sharedCommunity': 'Shared Community',
    'profile.snsAnalysisScore': 'SNS Analysis Score',
    'profile.recentMeetings': 'Recent Meetings',
    'profile.noRecordsYet': 'No records yet',
    'profile.fraudRiskLevel.low': 'High',
    'profile.fraudRiskLevel.medium': 'Medium',
    'profile.fraudRiskLevel.high': 'Low',
    
    // Dimensions
    'profile.dimensions.trustworthiness': 'Trustworthiness',
    'profile.dimensions.expertise': 'Expertise',
    'profile.dimensions.communication': 'Communication',
    'profile.dimensions.collaboration': 'Collaboration',
    'profile.dimensions.leadership': 'Leadership',
    'profile.dimensions.innovation': 'Innovation',
    'profile.dimensions.integrity': 'Integrity',
    
    // Profile form labels
    'profile.email2': 'Email Address',
    'profile.displayName2': 'Display Name',
    'profile.displayNamePlaceholder2': 'Enter your display name',
    'profile.githubUsername': 'GitHub Username',
    'profile.githubDescription': 'Automatically calculate development level from GitHub account',
    'profile.analyzing2': 'Analyzing...',
    'profile.analyze2': 'Analyze',
    'profile.developmentLevel2': 'Development Level',
    'profile.scoreMethod': 'Score Calculation Method',
    'profile.accountAge': 'Account Age',
    'profile.repositories': 'Repositories',
    'profile.stars': 'Stars Earned',
    'profile.languages': 'Language Diversity',
    'profile.followers': 'Followers',
    'profile.recentActivity': 'Recent Activity',
    'profile.analysisDetails': 'Analysis Details',
    'profile.years': 'years',
    'profile.points': 'points',
    'profile.yourScore': 'Your Score',
    'profile.total': 'Total',
    'profile.lastAnalyzed': 'Last Analyzed',
    'profile.linkedinAnalysis': 'LinkedIn Analysis',
    'profile.linkedinDescription': 'Calculate experience level from LinkedIn profile and detect fraudsters',
    'profile.trustScore2': 'Trust Score',
    'profile.professionalScore': 'Professional Score',
    'profile.redFlags': 'Red Flags',
    'profile.positiveIndicators': 'Positive Indicators',
    'profile.experienceAssessment': 'Experience Assessment',
    'profile.estimatedYears': 'Estimated Years',
    'profile.careerProgression': 'Career Progression',
    'profile.skillConsistency': 'Skill Consistency',
    'profile.overallAssessment': 'Overall Assessment',
    'profile.portfolioAnalysis': 'Portfolio Analysis',
    'profile.portfolioUrl': 'Portfolio URL',
    'profile.portfolioDescription': 'Evaluate technical level from portfolio site and detect fraudulent claims',
    'profile.technicalScore2': 'Technical Score',
    'profile.skillsDetected': 'Skills Detected',
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