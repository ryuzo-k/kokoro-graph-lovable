import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  github_username: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_score: number | null;
  linkedin_score: number | null;
  portfolio_score: number | null;
  fraud_risk_level: string | null;
  last_analyzed_at: string | null;
  analysis_details: any;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch profile data
  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "エラー",
        description: "プロフィールの取得に失敗しました",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Analyze GitHub profile
  const analyzeGitHub = async (username: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.functions.invoke('analyze-github-profile', {
        body: { username, userId: user.id }
      });

      if (error) throw error;
      
      toast({
        title: "GitHub分析完了",
        description: `開発スコア: ${data.score}/100`,
      });

      // Refresh profile data
      await fetchProfile();
      return { success: true, data };
    } catch (error) {
      console.error('Error analyzing GitHub:', error);
      toast({
        title: "エラー", 
        description: "GitHub分析に失敗しました",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  // Analyze LinkedIn profile
  const analyzeLinkedIn = async (linkedinUrl: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      console.log('Starting LinkedIn analysis for:', linkedinUrl);
      
      const { data, error } = await supabase.functions.invoke('analyze-linkedin-profile', {
        body: { linkedinUrl, userId: user.id }
      });

      console.log('LinkedIn analysis response:', { data, error });

      if (error) {
        console.error('LinkedIn function error:', error);
        throw error;
      }
      
      toast({
        title: "LinkedIn分析完了",
        description: `信頼度スコア: ${data.score}/100 (詐欺リスク: ${data.fraud_risk_level})`,
      });

      // Refresh profile data
      await fetchProfile();
      return { success: true, data };
    } catch (error) {
      console.error('Error analyzing LinkedIn:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "エラー", 
        description: `LinkedIn分析に失敗しました: ${errorMessage}`,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  // Analyze portfolio
  const analyzePortfolio = async (portfolioUrl: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.functions.invoke('analyze-portfolio', {
        body: { portfolioUrl, userId: user.id }
      });

      if (error) throw error;
      
      toast({
        title: "ポートフォリオ分析完了",
        description: `技術スコア: ${data.score}/100 (詐欺リスク: ${data.fraud_risk_level})`,
      });

      // Refresh profile data
      await fetchProfile();
      return { success: true, data };
    } catch (error) {
      console.error('Error analyzing portfolio:', error);
      toast({
        title: "エラー", 
        description: "ポートフォリオ分析に失敗しました",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'github_username' | 'linkedin_url' | 'portfolio_url'>>) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      // First try to update existing profile
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError && updateError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...updates
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(insertData);
        return { success: true, data: insertData };
      } else if (updateError) {
        throw updateError;
      }

      setProfile(updateData);
      return { success: true, data: updateData };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchProfile();

    // Subscribe to profile changes
    if (user) {
      const channel = supabase
        .channel('profile_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            setProfile(payload.new as Profile);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, toast]);

  return {
    profile,
    loading,
    updateProfile,
    analyzeGitHub,
    analyzeLinkedIn,
    analyzePortfolio,
    refetch: fetchProfile
  };
};