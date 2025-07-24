-- リアルな出会いのサンプルデータを追加

-- まず、現在のユーザーを取得してから出会いデータを挿入
INSERT INTO meetings (
  user_id,
  my_name, 
  other_name,
  location,
  rating,
  trustworthiness,
  expertise,
  communication,
  collaboration,
  leadership,
  innovation,
  integrity,
  detailed_feedback,
  community_id,
  created_at
) VALUES
-- 田中健太との出会い
((SELECT id FROM auth.users LIMIT 1), '基島隆蔵', '田中 健太', 'メルカリ本社', 5, 5, 5, 4, 4, 3, 4, 5, 
'React開発について深く議論できました。彼のマイクロサービス設計に関する知見がとても参考になりました。また、機械学習への興味も共通していて、今後コラボできそうです。',
(SELECT id FROM communities WHERE name = '東京Tech起業家コミュニティ' LIMIT 1), NOW() - INTERVAL '2 weeks'),

-- 佐藤美穂との出会い
((SELECT id FROM auth.users LIMIT 1), '基島隆蔵', '佐藤 美穂', 'SmartNewsオフィス', 4, 4, 4, 5, 4, 4, 4, 4,
'データドリブンなプロダクト開発手法について詳しく教えてもらいました。A/Bテストの実践的な運用方法が非常に勉強になりました。',
(SELECT id FROM communities WHERE name = 'AIエンジニア研究会' LIMIT 1), NOW() - INTERVAL '1 month'),

-- 山田直樹との出会い  
((SELECT id FROM auth.users LIMIT 1), '基島隆蔵', '山田 直樹', 'freeeカフェ', 4, 4, 4, 4, 5, 5, 3, 4,
'チームマネジメントの経験が豊富で、技術チームの成長戦略について多くのアドバイスをいただきました。Ruby on Railsの運用ノウハウも貴重でした。',
(SELECT id FROM communities WHERE name = '東京Tech起業家コミュニティ' LIMIT 1), NOW() - INTERVAL '3 weeks'),

-- 鈴木あかりとの出会い
((SELECT id FROM auth.users LIMIT 1), '基島隆蔵', '鈴木 あかり', 'Figma東京オフィス', 5, 5, 5, 5, 4, 4, 5, 5,
'デザインシステムの構築について実践的なアドバイスをもらいました。国際的なプロダクトでのUX考慮点が特に参考になりました。',
(SELECT id FROM communities WHERE name = 'AIエンジニア研究会' LIMIT 1), NOW() - INTERVAL '1 week'),

-- 高橋大輔との出会い
((SELECT id FROM auth.users LIMIT 1), '基島隆蔵', '高橋 大輔', 'PayPayオフィス', 5, 5, 5, 4, 4, 5, 4, 5,
'決済システムの高可用性設計について詳しく聞けました。PayPayスケールでのアーキテクチャ設計は圧巻でした。フィンテック分野での協業も視野に入りそうです。',
(SELECT id FROM communities WHERE name = '東京Tech起業家コミュニティ' LIMIT 1), NOW() - INTERVAL '5 days'),

-- 中村りょうとの出会い
((SELECT id FROM auth.users LIMIT 1), '基島隆蔵', '中村 りょう', 'DeNA本社', 4, 4, 5, 4, 4, 3, 5, 4,
'AI研究の最前線について教えてもらいました。深層強化学習の実用化事例が興味深く、ゲーム分野でのAI活用についても議論できました。',
(SELECT id FROM communities WHERE name = '東京Tech起業家コミュニティ' LIMIT 1), NOW() - INTERVAL '2 months'),

-- 木村えりとの出会い
((SELECT id FROM auth.users LIMIT 1), '基島隆蔵', '木村 えり', 'リクルート本社', 4, 4, 4, 5, 4, 4, 4, 4,
'HR Techプロダクトでのデザイン課題について議論しました。企業と求職者をつなぐUXデザインの考え方が非常に勉強になりました。',
(SELECT id FROM communities WHERE name = 'AIエンジニア研究会' LIMIT 1), NOW() - INTERVAL '6 weeks'),

-- 斎藤まさととの出会い  
((SELECT id FROM auth.users LIMIT 1), '基島隆蔵', '斎藤 まさと', 'SoftBank本社', 5, 5, 4, 5, 4, 5, 4, 5,
'VC視点からのスタートアップ評価基準について教えてもらいました。技術的デューデリジェンスのポイントや、Go-to-Market戦略についても深く議論できました。',
(SELECT id FROM communities WHERE name = '六本木ベンチャーサロン' LIMIT 1), NOW() - INTERVAL '3 days'),

-- 小林ゆうきとの出会い
((SELECT id FROM auth.users LIMIT 1), '基島隆蔵', '小林 ゆうき', 'ヤフー本社', 4, 4, 4, 3, 4, 3, 4, 4,
'大規模データ処理とレコメンドシステムについて技術的な議論ができました。Sparkを使った機械学習パイプラインの設計が参考になりました。',
(SELECT id FROM communities WHERE name = '東京Tech起業家コミュニティ' LIMIT 1), NOW() - INTERVAL '4 weeks'),

-- 松本けんじとの出会い
((SELECT id FROM auth.users LIMIT 1), '基島隆蔵', '松本 けんじ', '六本木ヒルズ', 5, 5, 4, 5, 5, 5, 5, 5,
'B2B SaaS事業の立ち上げから成長までの実体験を聞けました。プロダクト戦略と事業開発の両面からのアプローチが非常に参考になりました。',
(SELECT id FROM communities WHERE name = '六本木ベンチャーサロン' LIMIT 1), NOW() - INTERVAL '1 week'),

-- 田中健太との2回目の出会い
((SELECT id FROM auth.users LIMIT 1), '基島隆蔵', '田中 健太', 'メルカリカフェ', 5, 5, 4, 5, 4, 4, 5, 5,
'前回の続きで、マイクロサービス間のデータ整合性について深掘りしました。分散トレーシングの実装方法も教えてもらい、実際のプロダクションでの運用事例が参考になりました。',
(SELECT id FROM communities WHERE name = '東京Tech起業家コミュニティ' LIMIT 1), NOW() - INTERVAL '1 week'),

-- 松本けんじとの2回目の出会い
((SELECT id FROM auth.users LIMIT 1), '基島隆蔵', '松本 けんじ', 'WeWork六本木', 4, 5, 4, 5, 5, 5, 4, 5,
'起業家としての彼の経験談がとても刺激的でした。特にプロダクトマーケットフィットの見つけ方と、初期チームの組み方について具体的なアドバイスをもらえました。',
(SELECT id FROM communities WHERE name = '六本木ベンチャーサロン' LIMIT 1), NOW() - INTERVAL '2 days');