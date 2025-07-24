import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Meeting {
  id: string;
  user_id: string;
  my_name: string;
  other_name: string;
  location: string;
  rating: number;
  created_at: string;
}

export interface MeetingData {
  myName: string;
  otherName: string;
  location: string;
  rating: number;
}

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch meetings
  const fetchMeetings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: "エラー",
        description: "出会いデータの取得に失敗しました",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add meeting
  const addMeeting = async (meetingData: MeetingData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          user_id: user.id,
          my_name: meetingData.myName,
          other_name: meetingData.otherName,
          location: meetingData.location,
          rating: meetingData.rating
        })
        .select()
        .single();

      if (error) throw error;

      setMeetings(prev => [data, ...prev]);
      
      toast({
        title: "出会いを記録しました！",
        description: `${meetingData.otherName}さんとの出会いがネットワークに追加されました。`,
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error adding meeting:', error);
      toast({
        title: "エラー",
        description: "出会いの記録に失敗しました",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    fetchMeetings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('meetings_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meetings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newMeeting = payload.new as Meeting;
          setMeetings(prev => {
            // Check if meeting already exists to avoid duplicates
            if (prev.some(m => m.id === newMeeting.id)) return prev;
            return [newMeeting, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meetings',
          filter: `other_name=eq.${user.email?.split('@')[0] || user.id}`
        },
        (payload) => {
          const newMeeting = payload.new as Meeting;
          // Notify when someone records a meeting with you
          toast({
            title: "あなたが記録されました！",
            description: `${newMeeting.my_name}さんがあなたとの出会いを記録しました（評価: ${newMeeting.rating}★）`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return {
    meetings,
    loading,
    addMeeting,
    refetch: fetchMeetings
  };
};