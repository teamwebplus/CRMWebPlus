import { useState, useEffect, useMemo } from 'react';
import { useClients } from './useClients';
import { useLeads } from './useLeads';
import { useOpportunities } from './useOpportunities';
import { useTasks } from './useTasks';
import type { Database } from '../lib/supabase';

type Client = Database['public']['Tables']['clients']['Row'];
type Lead = Database['public']['Tables']['leads']['Row'];
type Opportunity = Database['public']['Tables']['opportunities']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

export interface SearchResult {
  id: string;
  type: 'client' | 'lead' | 'opportunity' | 'task';
  title: string;
  subtitle: string;
  data: Client | Lead | Opportunity | Task;
}

export function useSearch() {
  const { clients } = useClients();
  const { leads } = useLeads();
  const { opportunities } = useOpportunities();
  const { tasks } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    // Search clients
    clients.forEach(client => {
      if (
        client.name.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.company.toLowerCase().includes(term)
      ) {
        results.push({
          id: client.id,
          type: 'client',
          title: client.name,
          subtitle: `${client.company} • ${client.email}`,
          data: client
        });
      }
    });

    // Search leads
    leads.forEach(lead => {
      if (
        lead.name.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        lead.company.toLowerCase().includes(term)
      ) {
        results.push({
          id: lead.id,
          type: 'lead',
          title: lead.name,
          subtitle: `${lead.company} • ${lead.source}`,
          data: lead
        });
      }
    });

    // Search opportunities
    opportunities.forEach(opportunity => {
      if (
        opportunity.title.toLowerCase().includes(term) ||
        opportunity.description.toLowerCase().includes(term)
      ) {
        results.push({
          id: opportunity.id,
          type: 'opportunity',
          title: opportunity.title,
          subtitle: `₱${opportunity.value.toLocaleString()} • ${opportunity.stage}`,
          data: opportunity
        });
      }
    });

    // Search tasks
    tasks.forEach(task => {
      if (
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term)
      ) {
        results.push({
          id: task.id,
          type: 'task',
          title: task.title,
          subtitle: `${task.status} • ${new Date(task.due_date).toLocaleDateString()}`,
          data: task
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [searchTerm, clients, leads, opportunities, tasks]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults
  };
}