-- 既存のサンプルデータをクリアして、リアルな日本語データに置き換える

-- 既存のミーティングデータを削除
DELETE FROM meetings WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%@%' LIMIT 1);

-- 既存の人物データを削除
DELETE FROM people WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%@%' LIMIT 1);

-- 既存のコミュニティメンバーシップを削除（一旦リセット）
DELETE FROM community_memberships WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%@%' LIMIT 1);

-- 既存のコミュニティをよりリアルな日本語名に更新
UPDATE communities SET 
  name = '東京Tech起業家コミュニティ',
  description = 'スタートアップ創業者・CTO・エンジニアが集まり、技術と事業について語り合うコミュニティです。'
WHERE name = 'Founders Inc - メインコミュニティ';

UPDATE communities SET 
  name = 'AIエンジニア研究会',
  description = '機械学習・深層学習・LLMの最新技術について研究・議論するエンジニアコミュニティです。'
WHERE name = 'AI/ML研究会';

UPDATE communities SET 
  name = 'プロダクト開発者の会',
  description = 'プロダクトマネージャー、デザイナー、エンジニアが協力してより良いプロダクトを作る方法を共有するコミュニティです。'
WHERE name = 'プロダクト開発サークル';

UPDATE communities SET 
  name = 'フィンテック・Web3ラボ',
  description = 'FinTech、暗号通貨、ブロックチェーン、DeFiなど金融×技術の最前線で活動する人たちのコミュニティです。'
WHERE name = 'フィンテック・クリプトクラブ';

-- 新しいコミュニティを追加
INSERT INTO communities (name, description, created_by, is_public, member_count) VALUES
('六本木ベンチャーサロン', 'ベンチャー投資家、起業家、事業開発担当者が集まる交流コミュニティです。', (SELECT id FROM auth.users LIMIT 1), true, 85),
('デザイナー×エンジニア交流会', 'デザイナーとエンジニアが協力してより良いUI/UXを作るための勉強会・交流会です。', (SELECT id FROM auth.users LIMIT 1), true, 120);

-- リアルな日本人の人物データを挿入
INSERT INTO people (name, company, position, bio, skills, avatar_url, linkedin_url, github_username, location, user_id) VALUES
('田中 健太', 'メルカリ', 'Senior Software Engineer', 'React、TypeScript、Go言語を使ったマイクロサービス開発が得意です。最近はAI/ML分野にも興味を持っています。', ARRAY['React', 'TypeScript', 'Go', 'Kubernetes', 'Machine Learning'], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/kenta-tanaka', 'kenta-dev', '東京', (SELECT id FROM auth.users LIMIT 1)),

('佐藤 美穂', 'SmartNews', 'Product Manager', 'データサイエンス出身のプロダクトマネージャーです。ユーザー行動分析とA/Bテストを活用したプロダクト改善が専門です。', ARRAY['Product Management', 'Data Science', 'SQL', 'Python', 'A/B Testing'], 'https://images.unsplash.com/photo-1494790108755-2616b612b8c2?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/miho-sato', 'miho-analytics', '東京', (SELECT id FROM auth.users LIMIT 1)),

('山田 直樹', 'freee', 'Engineering Manager', 'SaaS事業のバックエンド開発チームをリードしています。Ruby on Railsとクラウドインフラが専門分野です。', ARRAY['Ruby on Rails', 'AWS', 'Team Management', 'SaaS', 'PostgreSQL'], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/naoki-yamada', 'naoki-mgr', '東京', (SELECT id FROM auth.users LIMIT 1)),

('鈴木 あかり', 'Figma', 'Senior Product Designer', 'デザインシステムの構築とユーザビリティテストが専門です。国際的なプロダクトのUX改善に取り組んでいます。', ARRAY['UI/UX Design', 'Design Systems', 'Figma', 'User Research', 'Prototyping'], 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/akari-suzuki', 'akari-design', '東京', (SELECT id FROM auth.users LIMIT 1)),

('高橋 大輔', 'PayPay', 'Staff Engineer', '決済システムの高可用性アーキテクチャ設計が専門です。年間数兆円の取引を支えるインフラを構築しています。', ARRAY['Java', 'Spring Boot', 'Microservices', 'Payment Systems', 'High Availability'], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/daisuke-takahashi', 'daisuke-arch', '東京', (SELECT id FROM auth.users LIMIT 1)),

('中村 りょう', 'DeNA', 'AI Research Engineer', 'ゲーム内AIとレコメンドシステムの研究開発を行っています。深層強化学習とNLPが専門分野です。', ARRAY['Machine Learning', 'Deep Learning', 'Python', 'TensorFlow', 'Reinforcement Learning'], 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/ryo-nakamura', 'ryo-ai', '東京', (SELECT id FROM auth.users LIMIT 1)),

('木村 えり', 'Recruit', 'Lead Product Designer', 'HR Techプロダクトのデザインリードです。企業と求職者をつなぐインターフェースの設計を担当しています。', ARRAY['Product Design', 'User Research', 'HR Tech', 'Design Strategy', 'Adobe Creative Suite'], 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/eri-kimura', 'eri-hrtech', '東京', (SELECT id FROM auth.users LIMIT 1)),

('斎藤 まさと', 'SoftBank', 'Venture Capitalist', 'B2B SaaSとAIスタートアップへの投資を担当しています。技術的デューデリジェンスとGo-to-Market戦略支援が得意です。', ARRAY['Venture Capital', 'B2B SaaS', 'Investment Analysis', 'Go-to-Market', 'Strategic Planning'], 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/masato-saito', 'masato-vc', '東京', (SELECT id FROM auth.users LIMIT 1)),

('小林 ゆうき', 'ヤフー', 'Data Scientist', '検索エンジンとレコメンドシステムの機械学習アルゴリズムを開発しています。大規模データ処理が専門です。', ARRAY['Data Science', 'Python', 'Big Data', 'Spark', 'Machine Learning'], 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/yuki-kobayashi', 'yuki-ds', '東京', (SELECT id FROM auth.users LIMIT 1)),

('松本 けんじ', 'モノフル', 'Founder & CEO', 'B2B SaaSプロダクトを開発・運営しています。プロダクト開発から事業戦略まで幅広く担当しています。', ARRAY['Startup', 'Product Strategy', 'Business Development', 'B2B SaaS', 'Leadership'], 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/kenji-matsumoto', 'kenji-ceo', '東京', (SELECT id FROM auth.users LIMIT 1));

-- ユーザーのコミュニティ参加を追加
INSERT INTO community_memberships (user_id, community_id, role) 
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  id,
  'member'
FROM communities 
WHERE name IN ('東京Tech起業家コミュニティ', 'AIエンジニア研究会', '六本木ベンチャーサロン')
LIMIT 3;