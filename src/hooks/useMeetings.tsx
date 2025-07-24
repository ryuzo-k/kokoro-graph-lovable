import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useToast } from './use-toast';

export interface Meeting {
  id: string;
  user_id: string;
  my_name: string;
  other_name: string;
  location: string;
  rating: number;
  created_at: string;
  community_id?: string;
  // Multi-dimensional trust scores
  trustworthiness?: number;
  expertise?: number;
  communication?: number;
  collaboration?: number;
  leadership?: number;
  innovation?: number;
  integrity?: number;
  detailed_feedback?: string;
}

export interface MeetingData {
  myName: string;
  otherName: string;
  location: string;
  rating: number;
  // Multi-dimensional scores
  trustworthiness?: number;
  expertise?: number;
  communication?: number;
  collaboration?: number;
  leadership?: number;
  innovation?: number;
  integrity?: number;
  // AI analysis
  detailed_feedback?: string;
  // Community
  community_id?: string;
}

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  // Fetch all meetings (public data now)
  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
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
          rating: meetingData.rating,
          trustworthiness: meetingData.trustworthiness,
          expertise: meetingData.expertise,
          communication: meetingData.communication,
          collaboration: meetingData.collaboration,
          leadership: meetingData.leadership,
          innovation: meetingData.innovation,
          integrity: meetingData.integrity,
          detailed_feedback: meetingData.detailed_feedback,
          community_id: meetingData.community_id
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
    fetchMeetings();

    // Subscribe to realtime changes for all meetings
    const channel = supabase
      .channel('meetings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings'
        },
        (payload) => {
          const newMeeting = payload.new as Meeting;
          
          if (payload.eventType === 'INSERT') {
            // Check if this meeting involves the current user by display name
            const userDisplayName = profile?.display_name;
            const isInvolved = userDisplayName && (
              newMeeting.other_name === userDisplayName || 
              newMeeting.my_name === userDisplayName
            );

            if (isInvolved && newMeeting.user_id !== user?.id) {
              // Someone else recorded a meeting with you
              toast({
                title: "あなたが記録されました！",
                description: `${newMeeting.my_name}さんがあなたとの出会いを記録しました（評価: ${newMeeting.rating}★）`,
              });
            }

            // Add new meeting to the list
            setMeetings(prev => {
              if (prev.some(m => m.id === newMeeting.id)) return prev;
              return [newMeeting, ...prev];
            });
          } else {
            // For updates/deletes, refetch all data
            fetchMeetings();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.display_name, toast]);

  return {
    meetings,
    loading,
    addMeeting,
    refetch: fetchMeetings
  };
};