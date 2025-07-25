import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export function useUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: ProfileInsert) => {
    try {
      // For demo purposes, we'll create a profile directly without creating an auth user
      // In a real application, this would be handled by an admin backend service
      const profileData = {
        user_id: crypto.randomUUID(), // Generate a fake UUID for demo
        name: userData.name,
        email: userData.email,
        role: userData.role || 'user',
        phone: userData.phone || null,
        department: userData.department || null,
        avatar_url: userData.avatar_url || null,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      setUsers(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      setError(error);
      return { data: null, error };
    }
  };

  const updateUser = async (id: string, updates: ProfileUpdate) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setUsers(prev => prev.map(user => user.id === id ? data : user));
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      setError(error);
      return { data: null, error };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setUsers(prev => prev.filter(user => user.id !== id));
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      setError(error);
      return { error };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
}