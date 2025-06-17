import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Opportunity = Database['public']['Tables']['opportunities']['Row'];
type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert'];
type OpportunityUpdate = Database['public']['Tables']['opportunities']['Update'];

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          clients:client_id (
            name,
            company
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createOpportunity = async (opportunity: OpportunityInsert) => {
    try {
      // Ensure assigned_to and created_by are strings, not UUIDs
      const opportunityData = {
        ...opportunity,
        assigned_to: opportunity.assigned_to || null,
        created_by: opportunity.created_by || 'Current User'
      };

      const { data, error } = await supabase
        .from('opportunities')
        .insert([opportunityData])
        .select(`
          *,
          clients:client_id (
            name,
            company
          )
        `)
        .single();

      if (error) throw error;
      setOpportunities(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      setError(error);
      return { data: null, error };
    }
  };

  const updateOpportunity = async (id: string, updates: OpportunityUpdate) => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          clients:client_id (
            name,
            company
          )
        `)
        .single();

      if (error) throw error;
      setOpportunities(prev => prev.map(opp => opp.id === id ? data : opp));
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      setError(error);
      return { data: null, error };
    }
  };

  const deleteOpportunity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setOpportunities(prev => prev.filter(opp => opp.id !== id));
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      setError(error);
      return { error };
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return {
    opportunities,
    loading,
    error,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    refetch: fetchOpportunities,
  };
}