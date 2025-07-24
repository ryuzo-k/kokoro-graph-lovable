-- ============================================
-- 全体ネットワーク可視化のためのデータベース拡張
-- ============================================

-- 1. meetingsテーブルに公開レベルを追加
ALTER TABLE public.meetings 
ADD COLUMN visibility_level TEXT DEFAULT 'private' CHECK (visibility_level IN ('private', 'friends', 'community', 'public'));

-- 2. 関係性の時系列を追跡するテーブル
CREATE TABLE public.relationship_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person1_id UUID NOT NULL,
  person2_id UUID NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('met', 'collaborated', 'mentored', 'friend', 'colleague')),
  trust_change NUMERIC,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  meeting_id UUID REFERENCES public.meetings(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. 人物間の集約関係性テーブル
CREATE TABLE public.relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person1_id UUID NOT NULL,
  person2_id UUID NOT NULL,
  relationship_strength NUMERIC DEFAULT 1.0,
  trust_score NUMERIC DEFAULT 3.0,
  last_interaction TIMESTAMP WITH TIME ZONE,
  total_meetings INTEGER DEFAULT 0,
  relationship_status TEXT DEFAULT 'active' CHECK (relationship_status IN ('active', 'inactive', 'blocked')),
  is_mutual BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(person1_id, person2_id)
);

-- 4. ネットワーク分析結果キャッシュテーブル
CREATE TABLE public.network_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL,
  centrality_score NUMERIC DEFAULT 0,
  influence_score NUMERIC DEFAULT 0,
  community_cluster TEXT,
  network_reach INTEGER DEFAULT 0,
  bridge_score NUMERIC DEFAULT 0,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(person_id)
);

-- 5. プライバシー設定テーブル
CREATE TABLE public.privacy_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  show_connections_to_others BOOLEAN DEFAULT true,
  show_meeting_history BOOLEAN DEFAULT false,
  show_trust_scores BOOLEAN DEFAULT true,
  allow_friend_recommendations BOOLEAN DEFAULT true,
  visibility_level TEXT DEFAULT 'friends' CHECK (visibility_level IN ('private', 'friends', 'community', 'public')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- RLS ポリシー設定
-- ============================================

-- relationship_timeline のRLS
ALTER TABLE public.relationship_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view timeline entries they're involved in" 
ON public.relationship_timeline 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.people p 
    WHERE (p.id = person1_id OR p.id = person2_id) 
    AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.meetings m 
    WHERE m.id = meeting_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create timeline entries for their meetings" 
ON public.relationship_timeline 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meetings m 
    WHERE m.id = meeting_id AND m.user_id = auth.uid()
  )
);

-- relationships のRLS
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view relationships they're involved in" 
ON public.relationships 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.people p 
    WHERE (p.id = person1_id OR p.id = person2_id) 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own relationships" 
ON public.relationships 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.people p 
    WHERE (p.id = person1_id OR p.id = person2_id) 
    AND p.user_id = auth.uid()
  )
);

-- network_analysis のRLS
ALTER TABLE public.network_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own network analysis" 
ON public.network_analysis 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.people p 
    WHERE p.id = person_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own network analysis" 
ON public.network_analysis 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.people p 
    WHERE p.id = person_id AND p.user_id = auth.uid()
  )
);

-- privacy_settings のRLS
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own privacy settings" 
ON public.privacy_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- ============================================
-- トリガーとファンクション
-- ============================================

-- 関係性の自動更新ファンクション
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- meetingsテーブルにトリガーを追加
CREATE TRIGGER update_relationships_trigger
  AFTER INSERT ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_relationship_on_meeting();

-- プライバシー設定の自動初期化ファンクション  
CREATE OR REPLACE FUNCTION public.initialize_privacy_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- profilesテーブルにトリガーを追加
CREATE TRIGGER initialize_privacy_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_privacy_settings();

-- updated_atの自動更新トリガー
CREATE TRIGGER update_relationships_updated_at
  BEFORE UPDATE ON public.relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON public.privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();