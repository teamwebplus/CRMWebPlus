import React, { useState, useEffect } from 'react';
import { Phone, Mail, Calendar, FileText, Users, Clock, Eye, Plus, ArrowRight, CheckCircle, User, TrendingUp, DollarSign, Target } from 'lucide-react';
import { useActivities } from '../../hooks/useActivities';
import { useTasks } from '../../hooks/useTasks';
import { useClients } from '../../hooks/useClients';
import { useLeads } from '../../hooks/useLeads';
import { useOpportunities } from '../../hooks/useOpportunities';
import ActivityModal from '../Activities/ActivityModal';
import Button from '../UI/Button';
import { formatCurrency } from '../../utils/currency';

const iconMap = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: FileText,
  note: Users,
  client_created: User,
  lead_created: Target,
  opportunity_created: TrendingUp,
  task_completed: CheckCircle,
  deal_closed: DollarSign
};

const colorMap = {
  call: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  email: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  meeting: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  task: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  note: 'text-gray-600 bg-gray-50 dark:bg-gray-700',
  client_created: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  lead_created: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  opportunity_created: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  task_completed: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  deal_closed: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
};

interface RecentActivityProps {
  onViewAll?: () => void;
  onNavigate?: (section: string, id?: string) => void;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  relatedTo?: string;
  relatedId?: string;
  relatedType?: string;
  value?: number;
  status?: string;
  priority?: string;
  completed?: boolean;
}

export default function RecentActivity({ onViewAll, onNavigate }: RecentActivityProps) {
  const { activities, loading: activitiesLoading, createActivity } = useActivities();
  const { tasks, loading: tasksLoading } = useTasks();
  const { clients, loading: clientsLoading } = useClients();
  const { leads, loading: leadsLoading } = useLeads();
  const { opportunities, loading: opportunitiesLoading } = useOpportunities();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allActivities, setAllActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Combine all activities from different modules
    const combinedActivities: ActivityItem[] = [];

    // Add regular activities
    activities.forEach(activity => {
      combinedActivities.push({
        id: `activity-${activity.id}`,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.created_at,
        relatedTo: getRelatedName(activity),
        relatedId: activity.client_id || activity.lead_id || activity.opportunity_id || undefined,
        relatedType: activity.client_id ? 'client' : activity.lead_id ? 'lead' : activity.opportunity_id ? 'opportunity' : undefined,
        completed: activity.completed
      });
    });

    // Add task activities
    tasks.forEach(task => {
      combinedActivities.push({
        id: `task-${task.id}`,
        type: task.status === 'completed' ? 'task_completed' : 'task',
        title: task.status === 'completed' ? `Task Completed: ${task.title}` : `Task: ${task.title}`,
        description: task.description || 'No description provided',
        timestamp: task.status === 'completed' ? task.updated_at : task.created_at,
        relatedTo: getTaskRelatedName(task),
        relatedId: task.client_id || task.lead_id || task.opportunity_id || undefined,
        relatedType: task.client_id ? 'client' : task.lead_id ? 'lead' : task.opportunity_id ? 'opportunity' : undefined,
        priority: task.priority,
        completed: task.status === 'completed'
      });
    });

    // Add client creation activities
    clients.forEach(client => {
      combinedActivities.push({
        id: `client-${client.id}`,
        type: 'client_created',
        title: `New Client Added: ${client.name}`,
        description: `${client.name} from ${client.company} has been added as a ${client.status}`,
        timestamp: client.created_at,
        relatedTo: `${client.name} - ${client.company}`,
        relatedId: client.id,
        relatedType: 'client',
        value: client.value
      });
    });

    // Add lead creation activities
    leads.forEach(lead => {
      combinedActivities.push({
        id: `lead-${lead.id}`,
        type: 'lead_created',
        title: `New Lead: ${lead.name}`,
        description: `${lead.name} from ${lead.company} added via ${lead.source}`,
        timestamp: lead.created_at,
        relatedTo: `${lead.name} - ${lead.company}`,
        relatedId: lead.id,
        relatedType: 'lead',
        value: lead.value,
        status: lead.status
      });
    });

    // Add opportunity activities
    opportunities.forEach(opportunity => {
      if (opportunity.stage === 'closed-won') {
        combinedActivities.push({
          id: `deal-${opportunity.id}`,
          type: 'deal_closed',
          title: `Deal Closed: ${opportunity.title}`,
          description: `Successfully closed deal worth ${formatCurrency(opportunity.value)}`,
          timestamp: opportunity.updated_at,
          relatedTo: opportunity.title,
          relatedId: opportunity.id,
          relatedType: 'opportunity',
          value: opportunity.value
        });
      } else {
        combinedActivities.push({
          id: `opportunity-${opportunity.id}`,
          type: 'opportunity_created',
          title: `New Opportunity: ${opportunity.title}`,
          description: `${formatCurrency(opportunity.value)} opportunity in ${opportunity.stage} stage`,
          timestamp: opportunity.created_at,
          relatedTo: opportunity.title,
          relatedId: opportunity.id,
          relatedType: 'opportunity',
          value: opportunity.value,
          status: opportunity.stage
        });
      }
    });

    // Sort by timestamp (most recent first) and take top 10
    const sortedActivities = combinedActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    setAllActivities(sortedActivities);
  }, [activities, tasks, clients, leads, opportunities]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getRelatedName = (activity: any) => {
    if (activity.clients) return `${activity.clients.name} (${activity.clients.company})`;
    if (activity.leads) return `${activity.leads.name} (${activity.leads.company})`;
    if (activity.opportunities) return activity.opportunities.title;
    return 'General Activity';
  };

  const getTaskRelatedName = (task: any) => {
    // This would need to be enhanced with actual client/lead/opportunity data
    if (task.client_id) return 'Client Task';
    if (task.lead_id) return 'Lead Task';
    if (task.opportunity_id) return 'Opportunity Task';
    return 'General Task';
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (onNavigate && activity.relatedType && activity.relatedId) {
      const sectionMap = {
        client: 'clients',
        lead: 'leads',
        opportunity: 'opportunities',
        task: 'tasks'
      };
      onNavigate(sectionMap[activity.relatedType as keyof typeof sectionMap], activity.relatedId);
    }
  };

  const getPriorityIndicator = (priority?: string) => {
    if (!priority) return null;
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return <div className={`w-2 h-2 rounded-full ${colors[priority as keyof typeof colors]}`} />;
  };

  const loading = activitiesLoading || tasksLoading || clientsLoading || leadsLoading || opportunitiesLoading;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Latest interactions and updates across all modules</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={Plus}
            >
              Add
            </Button>
            {onViewAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewAll}
                icon={Eye}
              >
                View All
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {allActivities.length > 0 ? (
            allActivities.map((activity) => {
              const Icon = iconMap[activity.type as keyof typeof iconMap] || FileText;
              const colorClasses = colorMap[activity.type as keyof typeof colorMap] || colorMap.note;
              
              return (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                      <div className="flex items-center space-x-2">
                        {getPriorityIndicator(activity.priority)}
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-4">
                        {activity.relatedTo && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Related to: {activity.relatedTo}
                          </p>
                        )}
                        {activity.value && (
                          <p className="text-xs font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(activity.value)}
                          </p>
                        )}
                        {activity.status && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                            {activity.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {activity.completed && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm">No recent activities</p>
              <Button 
                onClick={() => setIsModalOpen(true)} 
                variant="outline" 
                size="sm" 
                className="mt-3"
              >
                Add First Activity
              </Button>
            </div>
          )}
        </div>

        {/* Activity Summary */}
        {allActivities.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activities.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Activities</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tasks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Completed Tasks</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {leads.filter(l => l.status === 'converted').length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Converted Leads</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {opportunities.filter(o => o.stage === 'closed-won').length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Closed Deals</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="create"
        onSave={createActivity}
      />
    </>
  );
}