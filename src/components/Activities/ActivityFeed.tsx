import React, { useState } from 'react';
import { Clock, Filter, RefreshCw, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useRecentActivity } from '../../hooks/useRecentActivity';
import Button from '../UI/Button';
import Select from '../UI/Select';
import { formatCurrency } from '../../utils/currency';

interface ActivityFeedProps {
  limit?: number;
  showFilters?: boolean;
  onActivityClick?: (activity: any) => void;
}

const activityTypeColors = {
  call: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  email: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  meeting: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  task: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  task_completed: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  task_overdue: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  client_created: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  lead_created: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  lead_qualified: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  lead_converted: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  opportunity_created: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  deal_closed: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  high_value_client: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  high_value_opportunity: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
};

export default function ActivityFeed({ limit = 20, showFilters = true, onActivityClick }: ActivityFeedProps) {
  const { recentActivities, stats } = useRecentActivity(limit);
  const [typeFilter, setTypeFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredActivities = recentActivities.filter(activity => {
    const matchesType = !typeFilter || activity.type.includes(typeFilter);
    
    let matchesTime = true;
    if (timeFilter) {
      const activityDate = new Date(activity.timestamp);
      const now = new Date();
      
      switch (timeFilter) {
        case 'today':
          matchesTime = activityDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesTime = activityDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesTime = activityDate >= monthAgo;
          break;
      }
    }
    
    return matchesType && matchesTime;
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getActivityIcon = (type: string) => {
    if (type.includes('completed')) return '✅';
    if (type.includes('overdue')) return '⚠️';
    if (type.includes('closed')) return '🎊';
    if (type.includes('converted')) return '🎉';
    if (type.includes('qualified')) return '✅';
    if (type.includes('high_value')) return '💎';
    if (type.includes('client')) return '👤';
    if (type.includes('lead')) return '🎯';
    if (type.includes('opportunity')) return '💼';
    if (type.includes('deal')) return '💰';
    if (type.includes('task')) return '📋';
    if (type.includes('call')) return '📞';
    if (type.includes('email')) return '📧';
    if (type.includes('meeting')) return '📅';
    return '📝';
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayCount}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedTasks}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">New Leads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newLeads}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalValue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                { value: 'task', label: 'Tasks' },
                { value: 'client', label: 'Clients' },
                { value: 'lead', label: 'Leads' },
                { value: 'opportunity', label: 'Opportunities' },
                { value: 'deal', label: 'Deals' }
              ]}
            />
            <Select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' }
              ]}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            icon={RefreshCw}
          >
            Refresh
          </Button>
        </div>
      )}

      {/* Activity Feed */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const colorClasses = activityTypeColors[activity.type as keyof typeof activityTypeColors] || 'text-gray-600 bg-gray-50';
              
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => onActivityClick?.(activity)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(activity.timestamp)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{activity.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {activity.relatedTo && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.relatedTo}
                          </span>
                        )}
                        {activity.value && (
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(activity.value)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {activity.priority && (
                          <span className={`w-2 h-2 rounded-full ${
                            activity.priority === 'high' ? 'bg-red-500' :
                            activity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                        )}
                        {activity.status && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                            {activity.status}
                          </span>
                        )}
                        {activity.completed && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>No activities match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}