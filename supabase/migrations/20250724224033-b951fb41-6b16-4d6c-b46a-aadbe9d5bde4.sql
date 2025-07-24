-- ============================================
-- セキュリティ警告の修正
-- ============================================

-- Function Search Path Mutableの警告を修正
-- 既存の関数を更新してsearch_pathを設定

-- 1. update_relationship_on_meeting関数の修正
CREATE OR REPLACE FUNCTION public.update_relationship_on_meeting()
RETURNS TRIGGER AS $$
DECLARE
  person1_uuid UUID;
  person2_uuid UUID;
BEGIN
  -- 人物のUUIDを取得
  SELECT id INTO person1_uuid FROM public.people WHERE name = NEW.my_name AND user_id = NEW.user_id LIMIT 1;
  SELECT id INTO person2_uuid FROM public.people WHERE name = NEW.other_name LIMIT 1;
  
  -- 人物が見つからない場合は作成
  IF person1_uuid IS NULL THEN
    INSERT INTO public.people (name, user_id) VALUES (NEW.my_name, NEW.user_id)
    RETURNING id INTO person1_uuid;
  END IF;
  
  IF person2_uuid IS NULL THEN
    INSERT INTO public.people (name, user_id) VALUES (NEW.other_name, NEW.user_id)
    RETURNING id INTO person2_uuid;
  END IF;
  
  -- 関係性を更新または作成
  INSERT INTO public.relationships (person1_id, person2_id, relationship_strength, trust_score, last_interaction, total_meetings)
  VALUES (person1_uuid, person2_uuid, 1.0, NEW.rating, NEW.created_at, 1)
  ON CONFLICT (person1_id, person2_id) 
  DO UPDATE SET
    relationship_strength = relationships.relationship_strength + 0.2,
    trust_score = (relationships.trust_score * relationships.total_meetings + NEW.rating) / (relationships.total_meetings + 1),
    last_interaction = NEW.created_at,
    total_meetings = relationships.total_meetings + 1,
    updated_at = now();
  
  -- 逆方向の関係性も作成（双方向）
  INSERT INTO public.relationships (person1_id, person2_id, relationship_strength, trust_score, last_interaction, total_meetings)
  VALUES (person2_uuid, person1_uuid, 1.0, NEW.rating, NEW.created_at, 1)
  ON CONFLICT (person1_id, person2_id) 
  DO UPDATE SET
    relationship_strength = relationships.relationship_strength + 0.2,
    trust_score = (relationships.trust_score * relationships.total_meetings + NEW.rating) / (relationships.total_meetings + 1),
    last_interaction = NEW.created_at,
    total_meetings = relationships.total_meetings + 1,
    updated_at = now();
  
  -- タイムラインエントリを作成
  INSERT INTO public.relationship_timeline (person1_id, person2_id, relationship_type, trust_change, event_date, description, meeting_id)
  VALUES (person1_uuid, person2_uuid, 'met', NEW.rating, NEW.created_at, NEW.detailed_feedback, NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 2. initialize_privacy_settings関数の修正
CREATE OR REPLACE FUNCTION public.initialize_privacy_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';