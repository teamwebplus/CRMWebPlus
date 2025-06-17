import { useState, useEffect, useMemo } from 'react';
import { useActivities } from './useActivities';
import { useTasks } from './useTasks';
import { useClients } from './useClients';
import { useLeads } from './useLeads';
import { useOpportunities } from './useOpportunities';
import { formatCurrency } from '../utils/currency';

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  relatedTo?: string;
  relatedId?: string;
  relatedType?: 'client' | 'lead' | 'opportunity' | 'task';
  value?: number;
  status?: string;
  priority?: string;
  completed?: boolean;
  metadata?: Record<string, any>;
}

export function useRecentActivity(limit: number = 20) {
  const { activities } = useActivities();
  const { tasks } = useTasks();
  const { clients } = useClients();
  const { leads } = useLeads();
  const { opportunities } = useOpportunities();

  // Define helper functions before useMemo
  const getActivityRelatedName = (activity: any) => {
    if (activity.clients) return `${activity.clients.name} (${activity.clients.company})`;
    if (activity.leads) return `${activity.leads.name} (${activity.leads.company})`;
    if (activity.opportunities) return activity.opportunities.title;
    return 'General Activity';
  };

  const getTaskRelatedName = (task: any) => {
    // In a real implementation, you'd fetch the related entity names
    if (task.client_id) return 'Client Task';
    if (task.lead_id) return 'Lead Task';
    if (task.opportunity_id) return 'Opportunity Task';
    return 'General Task';
  };

  const recentActivities = useMemo(() => {
    const combinedActivities: ActivityItem[] = [];

    // Add regular activities
    activities.forEach(activity => {
      const relatedName = getActivityRelatedName(activity);
      combinedActivities.push({
        id: `activity-${activity.id}`,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.created_at,
        relatedTo: relatedName,
        relatedId: activity.client_id || activity.lead_id || activity.opportunity_id || undefined,
        relatedType: activity.client_id ? 'client' : activity.lead_id ? 'lead' : activity.opportunity_id ? 'opportunity' : undefined,
        completed: activity.completed,
        metadata: {
          priority: activity.priority,
          dueDate: activity.due_date
        }
      });
    });

    // Add task-related activities
    tasks.forEach(task => {
      const isCompleted = task.status === 'completed';
      const isOverdue = new Date(task.due_date) < new Date() && !isCompleted;
      
      combinedActivities.push({
        id: `task-${task.id}`,
        type: isCompleted ? 'task_completed' : isOverdue ? 'task_overdue' : 'task',
        title: isCompleted ? `✅ Completed: ${task.title}` : 
               isOverdue ? `⚠️ Overdue: ${task.title}` : 
               `📋 Task: ${task.title}`,
        description: task.description || 'No description provided',
        timestamp: isCompleted ? task.updated_at : task.created_at,
        relatedTo: getTaskRelatedName(task),
        relatedId: task.client_id || task.lead_id || task.opportunity_id || undefined,
        relatedType: task.client_id ? 'client' : task.lead_id ? 'lead' : task.opportunity_id ? 'opportunity' : 'task',
        priority: task.priority,
        completed: isCompleted,
        metadata: {
          dueDate: task.due_date,
          assignedTo: task.assigned_to
        }
      });
    });

    // Add client-related activities
    clients.forEach(client => {
      // Client creation
      combinedActivities.push({
        id: `client-created-${client.id}`,
        type: 'client_created',
        title: `👤 New Client: ${client.name}`,
        description: `${client.name} from ${client.company} added as ${client.status}`,
        timestamp: client.created_at,
        relatedTo: `${client.name} - ${client.company}`,
        relatedId: client.id,
        relatedType: 'client',
        value: client.value,
        status: client.status,
        metadata: {
          source: client.source,
          tags: client.tags
        }
      });

      // High-value client activity
      if (client.value > 100000) {
        combinedActivities.push({
          id: `client-highvalue-${client.id}`,
          type: 'high_value_client',
          title: `💎 High-Value Client: ${client.name}`,
          description: `${formatCurrency(client.value)} potential value client added`,
          timestamp: client.created_at,
          relatedTo: `${client.name} - ${client.company}`,
          relatedId: client.id,
          relatedType: 'client',
          value: client.value
        });
      }
    });

    // Add lead-related activities
    leads.forEach(lead => {
      // Lead creation
      combinedActivities.push({
        id: `lead-created-${lead.id}`,
        type: 'lead_created',
        title: `🎯 New Lead: ${lead.name}`,
        description: `${lead.name} from ${lead.company} via ${lead.source}`,
        timestamp: lead.created_at,
        relatedTo: `${lead.name} - ${lead.company}`,
        relatedId: lead.id,
        relatedType: 'lead',
        value: lead.value,
        status: lead.status,
        metadata: {
          score: lead.score,
          source: lead.source
        }
      });

      // Lead status changes
      if (lead.status === 'qualified') {
        combinedActivities.push({
          id: `lead-qualified-${lead.id}`,
          type: 'lead_qualified',
          title: `✅ Lead Qualified: ${lead.name}`,
          description: `${lead.name} qualified with score ${lead.score}`,
          timestamp: lead.updated_at,
          relatedTo: `${lead.name} - ${lead.company}`,
          relatedId: lead.id,
          relatedType: 'lead',
          value: lead.value,
          metadata: {
            score: lead.score
          }
        });
      }

      if (lead.status === 'converted') {
        combinedActivities.push({
          id: `lead-converted-${lead.id}`,
          type: 'lead_converted',
          title: `🎉 Lead Converted: ${lead.name}`,
          description: `${lead.name} successfully converted to client`,
          timestamp: lead.updated_at,
          relatedTo: `${lead.name} - ${lead.company}`,
          relatedId: lead.id,
          relatedType: 'lead',
          value: lead.value
        });
      }
    });

    // Add opportunity-related activities
    opportunities.forEach(opportunity => {
      // Opportunity creation
      combinedActivities.push({
        id: `opportunity-created-${opportunity.id}`,
        type: 'opportunity_created',
        title: `💼 New Opportunity: ${opportunity.title}`,
        description: `${formatCurrency(opportunity.value)} opportunity in ${opportunity.stage}`,
        timestamp: opportunity.created_at,
        relatedTo: opportunity.title,
        relatedId: opportunity.id,
        relatedType: 'opportunity',
        value: opportunity.value,
        status: opportunity.stage,
        metadata: {
          probability: opportunity.probability,
          expectedCloseDate: opportunity.expected_close_date
        }
      });

      // Deal closed
      if (opportunity.stage === 'closed-won') {
        combinedActivities.push({
          id: `deal-closed-${opportunity.id}`,
          type: 'deal_closed',
          title: `🎊 Deal Closed: ${opportunity.title}`,
          description: `Successfully closed ${formatCurrency(opportunity.value)} deal`,
          timestamp: opportunity.updated_at,
          relatedTo: opportunity.title,
          relatedId: opportunity.id,
          relatedType: 'opportunity',
          value: opportunity.value,
          metadata: {
            probability: opportunity.probability
          }
        });
      }

      // High-value opportunity
      if (opportunity.value > 200000 && opportunity.stage !== 'closed-won' && opportunity.stage !== 'closed-lost') {
        combinedActivities.push({
          id: `opportunity-highvalue-${opportunity.id}`,
          type: 'high_value_opportunity',
          title: `💰 High-Value Opportunity: ${opportunity.title}`,
          description: `${formatCurrency(opportunity.value)} opportunity with ${opportunity.probability}% probability`,
          timestamp: opportunity.created_at,
          relatedTo: opportunity.title,
          relatedId: opportunity.id,
          relatedType: 'opportunity',
          value: opportunity.value,
          metadata: {
            probability: opportunity.probability
          }
        });
      }
    });

    // Sort by timestamp (most recent first) and limit
    return combinedActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }, [activities, tasks, clients, leads, opportunities, limit, getActivityRelatedName, getTaskRelatedName]);

  const getActivityStats = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayActivities = recentActivities.filter(
      activity => new Date(activity.timestamp) >= todayStart
    );

    const completedTasks = recentActivities.filter(
      activity => activity.type === 'task_completed'
    ).length;

    const newLeads = recentActivities.filter(
      activity => activity.type === 'lead_created'
    ).length;

    const closedDeals = recentActivities.filter(
      activity => activity.type === 'deal_closed'
    ).length;

    const totalValue = recentActivities
      .filter(activity => activity.value)
      .reduce((sum, activity) => sum + (activity.value || 0), 0);

    return {
      todayCount: todayActivities.length,
      completedTasks,
      newLeads,
      closedDeals,
      totalValue
    };
  };

  return {
    recentActivities,
    stats: getActivityStats(),
    loading: false // Since we're using existing hooks, loading is handled by them
  };
}