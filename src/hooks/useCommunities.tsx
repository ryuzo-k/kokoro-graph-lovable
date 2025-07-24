import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Community {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useCommunities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all public communities
  const fetchCommunities = async () => {
    console.log('Fetching communities...');
    try {
      const { data, error } = await supabase
        .from('communities' as any)
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      console.log('Communities fetch result:', { data, error });
      if (error) throw error;
      setCommunities((data as unknown as Community[]) || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast({
        title: "エラー",
        description: "コミュニティの取得に失敗しました。",
        variant: "destructive"
      });
    }
  };

  // Fetch user's communities
  const fetchUserCommunities = async () => {
    if (!user) return;

    try {
      // First get user's memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('community_memberships' as any)
        .select('community_id')
        .eq('user_id', user.id);

      if (membershipError) throw membershipError;

      if (!memberships || memberships.length === 0) {
        setUserCommunities([]);
        return;
      }

      // Then get community details
      const communityIds = memberships.map((m: any) => m.community_id);
      const { data: communityData, error: communityError } = await supabase
        .from('communities' as any)
        .select('*')
        .in('id', communityIds);

      if (communityError) throw communityError;
      setUserCommunities((communityData as unknown as Community[]) || []);
    } catch (error) {
      console.error('Error fetching user communities:', error);
      toast({
        title: "エラー", 
        description: "参加中のコミュニティの取得に失敗しました。",
        variant: "destructive"
      });
    }
  };

  // Create a new community
  const createCommunity = async (communityData: {
    name: string;
    description?: string;
    is_public: boolean;
  }) => {
    console.log('Creating community:', communityData);
    if (!user) {
      toast({
        title: "エラー",
        description: "ログインが必要です。",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      const { data, error } = await supabase
        .from('communities' as any)
        .insert([{
          ...communityData,
          created_by: user.id
        }])
        .select()
        .single();

      console.log('Community creation result:', { data, error });
      if (error) throw error;

      // Automatically join the creator to the community
      const { error: membershipError } = await supabase
        .from('community_memberships' as any)
        .insert([{
          community_id: (data as any).id,
          user_id: user.id,
          role: 'admin'
        }]);

      console.log('Membership creation result:', { membershipError });
      if (membershipError) throw membershipError;

      await Promise.all([fetchCommunities(), fetchUserCommunities()]);
      return { success: true, data };
    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        title: "エラー",
        description: "コミュニティの作成に失敗しました。",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  // Join a community
  const joinCommunity = async (communityId: string) => {
    if (!user) {
      toast({
        title: "エラー",
        description: "ログインが必要です。",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      const { error } = await supabase
        .from('community_memberships' as any)
        .insert([{
          community_id: communityId,
          user_id: user.id,
          role: 'member'
        }]);

      if (error) throw error;

      await Promise.all([fetchCommunities(), fetchUserCommunities()]);
      return { success: true };
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "エラー",
        description: "コミュニティへの参加に失敗しました。",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  // Leave a community
  const leaveCommunity = async (communityId: string) => {
    if (!user) {
      toast({
        title: "エラー",
        description: "ログインが必要です。",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      const { error } = await supabase
        .from('community_memberships' as any)
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) throw error;

      await Promise.all([fetchCommunities(), fetchUserCommunities()]);
      return { success: true };
    } catch (error) {
      console.error('Error leaving community:', error);
      toast({
        title: "エラー",
        description: "コミュニティからの退出に失敗しました。",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchCommunities(), fetchUserCommunities()]);
      setLoading(false);
    };

    if (user) {
      initializeData();
    } else {
      fetchCommunities().then(() => setLoading(false));
    }

    // Set up realtime subscription for communities
    const channel = supabase
      .channel('communities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communities'
        },
        () => {
          // Refetch data when any change occurs
          fetchCommunities();
          if (user) {
            fetchUserCommunities();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    communities,
    userCommunities,
    loading,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    refetch: () => Promise.all([fetchCommunities(), fetchUserCommunities()])
  };
};