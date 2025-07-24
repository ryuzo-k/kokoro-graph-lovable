import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Person {
  id: string;
  name: string;
  company?: string;
  position?: string;
  bio?: string;
  skills?: string[];
  avatar_url?: string;
  linkedin_url?: string;
  github_username?: string;
  location?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const usePeople = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching people:', error);
        toast.error('人物データの取得に失敗しました');
        return;
      }

      setPeople(data || []);
    } catch (error) {
      console.error('Error in fetchPeople:', error);
      toast.error('人物データの取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const addPerson = async (personData: Omit<Person, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return { success: false };
      }

      const { data, error } = await supabase
        .from('people')
        .insert([{ ...personData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error adding person:', error);
        toast.error('人物の追加に失敗しました');
        return { success: false };
      }

      setPeople(prev => [...prev, data]);
      toast.success('人物を追加しました');
      return { success: true, data };
    } catch (error) {
      console.error('Error in addPerson:', error);
      toast.error('人物の追加中にエラーが発生しました');
      return { success: false };
    }
  };

  const updatePerson = async (id: string, updates: Partial<Person>) => {
    try {
      const { data, error } = await supabase
        .from('people')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating person:', error);
        toast.error('人物の更新に失敗しました');
        return { success: false };
      }

      setPeople(prev => prev.map(person => person.id === id ? data : person));
      toast.success('人物を更新しました');
      return { success: true, data };
    } catch (error) {
      console.error('Error in updatePerson:', error);
      toast.error('人物の更新中にエラーが発生しました');
      return { success: false };
    }
  };

  const deletePerson = async (id: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting person:', error);
        toast.error('人物の削除に失敗しました');
        return { success: false };
      }

      setPeople(prev => prev.filter(person => person.id !== id));
      toast.success('人物を削除しました');
      return { success: true };
    } catch (error) {
      console.error('Error in deletePerson:', error);
      toast.error('人物の削除中にエラーが発生しました');
      return { success: false };
    }
  };

  const getPersonByName = (name: string): Person | undefined => {
    return people.find(person => person.name === name);
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  return {
    people,
    isLoading,
    addPerson,
    updatePerson,
    deletePerson,
    getPersonByName,
    refetch: fetchPeople,
  };
};