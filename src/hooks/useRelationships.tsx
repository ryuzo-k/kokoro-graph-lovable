import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Relationship {
  id: string;
  person1_id: string;
  person2_id: string;
  relationship_strength: number;
  trust_score: number;
  last_interaction: string;
  total_meetings: number;
  relationship_status: 'active' | 'inactive' | 'blocked';
  is_mutual: boolean;
  created_at: string;
  updated_at: string;
}

export interface RelationshipTimeline {
  id: string;
  person1_id: string;
  person2_id: string;
  relationship_type: 'met' | 'collaborated' | 'mentored' | 'friend' | 'colleague';
  trust_change: number;
  event_date: string;
  description: string;
  meeting_id: string;
  created_at: string;
}

export interface NetworkAnalysis {
  id: string;
  person_id: string;
  centrality_score: number;
  influence_score: number;
  community_cluster: string;
  network_reach: number;
  bridge_score: number;
  analyzed_at: string;
}

export const useRelationships = () => {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [timeline, setTimeline] = useState<RelationshipTimeline[]>([]);
  const [networkAnalysis, setNetworkAnalysis] = useState<NetworkAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 関係性データの取得
  const fetchRelationships = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('relationships')
        .select('*')
        .order('last_interaction', { ascending: false });

      if (error) throw error;
      setRelationships((data || []) as Relationship[]);
    } catch (error) {
      console.error('Error fetching relationships:', error);
    }
  };

  // タイムラインデータの取得
  const fetchTimeline = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('relationship_timeline')
        .select('*')
        .order('event_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTimeline((data || []) as RelationshipTimeline[]);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  };

  // ネットワーク分析データの取得
  const fetchNetworkAnalysis = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('network_analysis')
        .select('*')
        .order('analyzed_at', { ascending: false });

      if (error) throw error;
      setNetworkAnalysis(data || []);
    } catch (error) {
      console.error('Error fetching network analysis:', error);
    }
  };

  // 人物間の関係性を取得
  const getRelationshipBetween = (person1Id: string, person2Id: string): Relationship | null => {
    return relationships.find(rel => 
      (rel.person1_id === person1Id && rel.person2_id === person2Id) ||
      (rel.person1_id === person2Id && rel.person2_id === person1Id)
    ) || null;
  };

  // 人物の全関係性を取得
  const getPersonRelationships = (personId: string): Relationship[] => {
    return relationships.filter(rel => 
      rel.person1_id === personId || rel.person2_id === personId
    );
  };

  // 人物のタイムラインを取得
  const getPersonTimeline = (personId: string): RelationshipTimeline[] => {
    return timeline.filter(entry => 
      entry.person1_id === personId || entry.person2_id === personId
    );
  };

  // ネットワーク統計の計算
  const getNetworkStats = () => {
    const totalRelationships = relationships.length;
    const avgTrustScore = relationships.length > 0 
      ? relationships.reduce((sum, rel) => sum + rel.trust_score, 0) / relationships.length 
      : 0;
    const strongRelationships = relationships.filter(rel => rel.relationship_strength > 2).length;
    const recentActivity = timeline.filter(entry => {
      const daysSince = (Date.now() - new Date(entry.event_date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    }).length;

    return {
      totalRelationships,
      avgTrustScore,
      strongRelationships,
      recentActivity
    };
  };

  // 関係性の影響力を計算
  const getInfluenceMap = () => {
    const influenceMap = new Map<string, number>();
    
    relationships.forEach(rel => {
      const person1Influence = (influenceMap.get(rel.person1_id) || 0) + rel.relationship_strength;
      const person2Influence = (influenceMap.get(rel.person2_id) || 0) + rel.relationship_strength;
      
      influenceMap.set(rel.person1_id, person1Influence);
      influenceMap.set(rel.person2_id, person2Influence);
    });

    return influenceMap;
  };

  // 関係性パスの検索（度数分離）
  const findShortestPath = (startPersonId: string, endPersonId: string): string[] => {
    if (startPersonId === endPersonId) return [startPersonId];

    const visited = new Set<string>();
    const queue: { personId: string; path: string[] }[] = [{ personId: startPersonId, path: [startPersonId] }];

    while (queue.length > 0) {
      const { personId, path } = queue.shift()!;
      
      if (visited.has(personId)) continue;
      visited.add(personId);

      const connectedPeople = getPersonRelationships(personId).map(rel => 
        rel.person1_id === personId ? rel.person2_id : rel.person1_id
      );

      for (const connectedPersonId of connectedPeople) {
        if (connectedPersonId === endPersonId) {
          return [...path, connectedPersonId];
        }
        
        if (!visited.has(connectedPersonId)) {
          queue.push({ personId: connectedPersonId, path: [...path, connectedPersonId] });
        }
      }
    }

    return []; // パスが見つからない
  };

  // 初期データ読み込み
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setIsLoading(true);
        await Promise.all([
          fetchRelationships(),
          fetchTimeline(),
          fetchNetworkAnalysis()
        ]);
        setIsLoading(false);
      };
      loadData();
    }
  }, [user]);

  // リアルタイム更新
  useEffect(() => {
    if (!user) return;

    const relationshipsChannel = supabase
      .channel('relationships-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'relationships' }, 
        () => fetchRelationships()
      )
      .subscribe();

    const timelineChannel = supabase
      .channel('timeline-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'relationship_timeline' }, 
        () => fetchTimeline()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(relationshipsChannel);
      supabase.removeChannel(timelineChannel);
    };
  }, [user]);

  return {
    relationships,
    timeline,
    networkAnalysis,
    isLoading,
    getRelationshipBetween,
    getPersonRelationships,
    getPersonTimeline,
    getNetworkStats,
    getInfluenceMap,
    findShortestPath,
    refetchRelationships: fetchRelationships,
    refetchTimeline: fetchTimeline,
    refetchNetworkAnalysis: fetchNetworkAnalysis
  };
};