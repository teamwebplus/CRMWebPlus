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

  const createUser = async (userData: Omit<ProfileInsert, 'user_id'>) => {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: 'TempPassword123!', // Temporary password - user should change it
        email_confirm: true,
        user_metadata: {
          name: userData.name
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // The profile should be created automatically by the trigger
      // Wait a moment for the trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch the created profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        // If profile wasn't created by trigger, create it manually
        const { data: manualProfile, error: manualError } = await supabase
          .from('profiles')
          .insert([{
            user_id: authData.user.id,
            name: userData.name,
            email: userData.email,
            role: userData.role || 'user',
            phone: userData.phone,
            department: userData.department,
            avatar_url: userData.avatar_url
          }])
          .select()
          .single();

        if (manualError) throw manualError;
        setUsers(prev => [manualProfile, ...prev]);
        return { data: manualProfile, error: null };
      }

      // Update the profile with additional data if needed
      if (userData.role !== 'user' || userData.phone || userData.department || userData.avatar_url) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            role: userData.role || 'user',
            phone: userData.phone,
            department: userData.department,
            avatar_url: userData.avatar_url
          })
          .eq('id', profileData.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setUsers(prev => [updatedProfile, ...prev]);
        return { data: updatedProfile, error: null };
      }

      setUsers(prev => [profileData, ...prev]);
      return { data: profileData, error: null };
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
      // Get the user to find their auth user_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Delete the auth user (this will cascade to delete the profile)
      const { error: authError } = await supabase.auth.admin.deleteUser(profile.user_id);
      if (authError) throw authError;

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