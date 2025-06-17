import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalClients: number;
  totalLeads: number;
  totalOpportunities: number;
  totalRevenue: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalLeads: 0,
    totalOpportunities: 0,
    totalRevenue: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all stats in parallel
      const [
        clientsResult,
        leadsResult,
        opportunitiesResult,
        tasksResult
      ] = await Promise.all([
        supabase.from('clients').select('id, value'),
        supabase.from('leads').select('id, value'),
        supabase.from('opportunities').select('id, value, stage'),
        supabase.from('tasks').select('id, status, due_date')
      ]);

      if (clientsResult.error) throw clientsResult.error;
      if (leadsResult.error) throw leadsResult.error;
      if (opportunitiesResult.error) throw opportunitiesResult.error;
      if (tasksResult.error) throw tasksResult.error;

      const clients = clientsResult.data || [];
      const leads = leadsResult.data || [];
      const opportunities = opportunitiesResult.data || [];
      const tasks = tasksResult.data || [];

      // Calculate revenue from closed-won opportunities
      const totalRevenue = opportunities
        .filter(opp => opp.stage === 'closed-won')
        .reduce((sum, opp) => sum + (opp.value || 0), 0);

      // Calculate task stats
      const now = new Date();
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const overdueTasks = tasks.filter(task => 
        task.status !== 'completed' && new Date(task.due_date) < now
      ).length;

      setStats({
        totalClients: clients.length,
        totalLeads: leads.length,
        totalOpportunities: opportunities.length,
        totalRevenue,
        totalTasks: tasks.length,
        completedTasks,
        overdueTasks,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}