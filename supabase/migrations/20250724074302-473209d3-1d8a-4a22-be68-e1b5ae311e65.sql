-- リアルな出会いのサンプルデータを追加して、アプリの主要機能を体験できるようにする

-- 現在のユーザーIDを取得
WITH current_user AS (
  SELECT id as user_id FROM auth.users LIMIT 1
),
-- コミュニティIDを取得
communities_data AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM communities
),
-- 人物IDを取得
people_data AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM people
  WHERE user_id = (SELECT user_id FROM current_user)
)

-- リアルな出会いデータを挿入
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
)
SELECT 
  cu.user_id,
  '基島隆蔵',
  CASE 
    WHEN pd.rn = 1 THEN '田中 健太'
    WHEN pd.rn = 2 THEN '佐藤 美穂'
    WHEN pd.rn = 3 THEN '山田 直樹'
    WHEN pd.rn = 4 THEN '鈴木 あかり'
    WHEN pd.rn = 5 THEN '高橋 大輔'
    WHEN pd.rn = 6 THEN '中村 りょう'
    WHEN pd.rn = 7 THEN '木村 えり'
    WHEN pd.rn = 8 THEN '斎藤 まさと'
    WHEN pd.rn = 9 THEN '小林 ゆうき'
    WHEN pd.rn = 10 THEN '松本 けんじ'
  END,
  CASE 
    WHEN pd.rn = 1 THEN 'メルカリ本社'
    WHEN pd.rn = 2 THEN 'SmartNewsオフィス'
    WHEN pd.rn = 3 THEN 'freeeカフェ'
    WHEN pd.rn = 4 THEN 'Figma東京オフィス'
    WHEN pd.rn = 5 THEN 'PayPayオフィス'
    WHEN pd.rn = 6 THEN 'DeNA本社'
    WHEN pd.rn = 7 THEN 'リクルート本社'
    WHEN pd.rn = 8 THEN 'SoftBank本社'
    WHEN pd.rn = 9 THEN 'ヤフー本社'
    WHEN pd.rn = 10 THEN '六本木ヒルズ'
  END,
  CASE 
    WHEN pd.rn = 1 THEN 5  -- 田中健太
    WHEN pd.rn = 2 THEN 4  -- 佐藤美穂
    WHEN pd.rn = 3 THEN 4  -- 山田直樹
    WHEN pd.rn = 4 THEN 5  -- 鈴木あかり
    WHEN pd.rn = 5 THEN 5  -- 高橋大輔
    WHEN pd.rn = 6 THEN 4  -- 中村りょう
    WHEN pd.rn = 7 THEN 4  -- 木村えり
    WHEN pd.rn = 8 THEN 5  -- 斎藤まさと
    WHEN pd.rn = 9 THEN 4  -- 小林ゆうき
    WHEN pd.rn = 10 THEN 5 -- 松本けんじ
  END,
  -- 多次元評価スコア
  CASE 
    WHEN pd.rn = 1 THEN 5 -- 田中健太：信頼性
    WHEN pd.rn = 2 THEN 4
    WHEN pd.rn = 3 THEN 4
    WHEN pd.rn = 4 THEN 5
    WHEN pd.rn = 5 THEN 5
    WHEN pd.rn = 6 THEN 4
    WHEN pd.rn = 7 THEN 4
    WHEN pd.rn = 8 THEN 5
    WHEN pd.rn = 9 THEN 4
    WHEN pd.rn = 10 THEN 5
  END,
  CASE 
    WHEN pd.rn = 1 THEN 5 -- 専門性
    WHEN pd.rn = 2 THEN 4
    WHEN pd.rn = 3 THEN 4
    WHEN pd.rn = 4 THEN 5
    WHEN pd.rn = 5 THEN 5
    WHEN pd.rn = 6 THEN 5
    WHEN pd.rn = 7 THEN 4
    WHEN pd.rn = 8 THEN 4
    WHEN pd.rn = 9 THEN 4
    WHEN pd.rn = 10 THEN 4
  END,
  CASE 
    WHEN pd.rn = 1 THEN 4 -- コミュニケーション
    WHEN pd.rn = 2 THEN 5
    WHEN pd.rn = 3 THEN 4
    WHEN pd.rn = 4 THEN 5
    WHEN pd.rn = 5 THEN 4
    WHEN pd.rn = 6 THEN 4
    WHEN pd.rn = 7 THEN 5
    WHEN pd.rn = 8 THEN 5
    WHEN pd.rn = 9 THEN 3
    WHEN pd.rn = 10 THEN 5
  END,
  CASE 
    WHEN pd.rn = 1 THEN 4 -- 協力性
    WHEN pd.rn = 2 THEN 4
    WHEN pd.rn = 3 THEN 5
    WHEN pd.rn = 4 THEN 4
    WHEN pd.rn = 5 THEN 4
    WHEN pd.rn = 6 THEN 4
    WHEN pd.rn = 7 THEN 4
    WHEN pd.rn = 8 THEN 4
    WHEN pd.rn = 9 THEN 4
    WHEN pd.rn = 10 THEN 5
  END,
  CASE 
    WHEN pd.rn = 1 THEN 3 -- リーダーシップ
    WHEN pd.rn = 2 THEN 4
    WHEN pd.rn = 3 THEN 5
    WHEN pd.rn = 4 THEN 4
    WHEN pd.rn = 5 THEN 5
    WHEN pd.rn = 6 THEN 3
    WHEN pd.rn = 7 THEN 4
    WHEN pd.rn = 8 THEN 5
    WHEN pd.rn = 9 THEN 3
    WHEN pd.rn = 10 THEN 5
  END,
  CASE 
    WHEN pd.rn = 1 THEN 4 -- 革新性
    WHEN pd.rn = 2 THEN 4
    WHEN pd.rn = 3 THEN 3
    WHEN pd.rn = 4 THEN 5
    WHEN pd.rn = 5 THEN 4
    WHEN pd.rn = 6 THEN 5
    WHEN pd.rn = 7 THEN 4
    WHEN pd.rn = 8 THEN 4
    WHEN pd.rn = 9 THEN 4
    WHEN pd.rn = 10 THEN 5
  END,
  CASE 
    WHEN pd.rn = 1 THEN 5 -- 誠実性
    WHEN pd.rn = 2 THEN 4
    WHEN pd.rn = 3 THEN 4
    WHEN pd.rn = 4 THEN 5
    WHEN pd.rn = 5 THEN 5
    WHEN pd.rn = 6 THEN 4
    WHEN pd.rn = 7 THEN 4
    WHEN pd.rn = 8 THEN 5
    WHEN pd.rn = 9 THEN 4
    WHEN pd.rn = 10 THEN 5
  END,
  CASE 
    WHEN pd.rn = 1 THEN 'React開発について深く議論できました。彼のマイクロサービス設計に関する知見がとても参考になりました。また、機械学習への興味も共通していて、今後コラボできそうです。'
    WHEN pd.rn = 2 THEN 'データドリブンなプロダクト開発手法について詳しく教えてもらいました。A/Bテストの実践的な運用方法が非常に勉強になりました。'
    WHEN pd.rn = 3 THEN 'チームマネジメントの経験が豊富で、技術チームの成長戦略について多くのアドバイスをいただきました。Ruby on Railsの運用ノウハウも貴重でした。'
    WHEN pd.rn = 4 THEN 'デザインシステムの構築について実践的なアドバイスをもらいました。国際的なプロダクトでのUX考慮点が特に参考になりました。'
    WHEN pd.rn = 5 THEN '決済システムの高可用性設計について詳しく聞けました。PayPayスケールでのアーキテクチャ設計は圧巻でした。フィンテック分野での協業も視野に入りそうです。'
    WHEN pd.rn = 6 THEN 'AI研究の最前線について教えてもらいました。深層強化学習の実用化事例が興味深く、ゲーム分野でのAI活用についても議論できました。'
    WHEN pd.rn = 7 THEN 'HR Techプロダクトでのデザイン課題について議論しました。企業と求職者をつなぐUXデザインの考え方が非常に勉強になりました。'
    WHEN pd.rn = 8 THEN 'VC視点からのスタートアップ評価基準について教えてもらいました。技術的デューデリジェンスのポイントや、Go-to-Market戦略についても深く議論できました。'
    WHEN pd.rn = 9 THEN '大規模データ処理とレコメンドシステムについて技術的な議論ができました。Sparkを使った機械学習パイプラインの設計が参考になりました。'
    WHEN pd.rn = 10 THEN 'B2B SaaS事業の立ち上げから成長までの実体験を聞けました。プロダクト戦略と事業開発の両面からのアプローチが非常に参考になりました。'
  END,
  -- コミュニティとの関連付け
  CASE 
    WHEN pd.rn IN (1, 3, 5, 6, 9) THEN (SELECT id FROM communities_data WHERE rn = 1) -- 東京Tech起業家コミュニティ
    WHEN pd.rn IN (2, 4, 7) THEN (SELECT id FROM communities_data WHERE rn = 2) -- AIエンジニア研究会  
    WHEN pd.rn IN (8, 10) THEN (SELECT id FROM communities_data WHERE rn = 5) -- 六本木ベンチャーサロン
  END,
  -- 作成日時を過去1-3ヶ月の間でランダムに設定
  CASE 
    WHEN pd.rn = 1 THEN NOW() - INTERVAL '2 weeks'
    WHEN pd.rn = 2 THEN NOW() - INTERVAL '1 month'
    WHEN pd.rn = 3 THEN NOW() - INTERVAL '3 weeks'
    WHEN pd.rn = 4 THEN NOW() - INTERVAL '1 week'
    WHEN pd.rn = 5 THEN NOW() - INTERVAL '5 days'
    WHEN pd.rn = 6 THEN NOW() - INTERVAL '2 months'
    WHEN pd.rn = 7 THEN NOW() - INTERVAL '6 weeks'
    WHEN pd.rn = 8 THEN NOW() - INTERVAL '3 days'
    WHEN pd.rn = 9 THEN NOW() - INTERVAL '4 weeks'
    WHEN pd.rn = 10 THEN NOW() - INTERVAL '1 week'
  END
FROM 
  current_user cu
  CROSS JOIN people_data pd
  CROSS JOIN communities_data cd;

-- 追加の会話記録を挿入（同じ人と複数回会った場合）
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
)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  '基島隆蔵',
  '田中 健太',
  'メルカリカフェ',
  5,
  5, 4, 5, 4, 4, 5, 5,
  '前回の続きで、マイクロサービス間のデータ整合性について深掘りしました。分散トレーシングの実装方法も教えてもらい、実際のプロダクションでの運用事例が参考になりました。',
  (SELECT id FROM communities WHERE name = '東京Tech起業家コミュニティ' LIMIT 1),
  NOW() - INTERVAL '1 week'

UNION ALL

SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  '基島隆蔵',
  '松本 けんじ',
  'WeWork六本木',
  4,
  5, 4, 5, 5, 5, 4, 5,
  '起業家としての彼の経験談がとても刺激的でした。特にプロダクトマーケットフィットの見つけ方と、初期チームの組み方について具体的なアドバイスをもらえました。',
  (SELECT id FROM communities WHERE name = '六本木ベンチャーサロン' LIMIT 1),
  NOW() - INTERVAL '2 days';