import React, { useState } from 'react';
import { Calendar, Clock, Phone, Mail, Users, FileText, Search, Filter, Plus, Edit, Trash2, Eye, Activity } from 'lucide-react';
import { useActivities } from '../../hooks/useActivities';
import ActivityModal from './ActivityModal';
import ActivityFeed from './ActivityFeed';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';

const iconMap = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: FileText,
  note: Users
};

const colorMap = {
  call: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  email: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  meeting: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  task: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  note: 'text-gray-600 bg-gray-50 dark:bg-gray-700'
};

export default function ActivitiesView() {
  const { activities, loading, createActivity, updateActivity, deleteActivity } = useActivities();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<any>();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'feed'>('feed');

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || activity.type === typeFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'completed' && activity.completed) ||
      (statusFilter === 'pending' && !activity.completed);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateActivity = () => {
    setSelectedActivity(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditActivity = (activity: any) => {
    setSelectedActivity(activity);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewActivity = (activity: any) => {
    setSelectedActivity(activity);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      await deleteActivity(activityId);
    }
  };

  const handleActivityClick = (activity: any) => {
    // Handle navigation to related items
    console.log('Navigate to:', activity);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRelatedName = (activity: any) => {
    if (activity.clients) return `${activity.clients.name} (${activity.clients.company})`;
    if (activity.leads) return `${activity.leads.name} (${activity.leads.company})`;
    if (activity.opportunities) return activity.opportunities.title;
    return 'No relation';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('feed')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'feed'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-1" />
              Activity Feed
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              List View
            </button>
          </div>
        </div>
        
        <Button onClick={handleCreateActivity} icon={Plus}>
          Add Activity
        </Button>
      </div>

      {/* Activity Feed View */}
      {viewMode === 'feed' && (
        <ActivityFeed 
          limit={50} 
          onActivityClick={handleActivityClick}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Filters for List View */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
              className="sm:w-80"
            />
            <div className="flex gap-2">
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'call', label: 'Calls' },
                  { value: 'email', label: 'Emails' },
                  { value: 'meeting', label: 'Meetings' },
                  { value: 'task', label: 'Tasks' },
                  { value: 'note', label: 'Notes' }
                ]}
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'pending', label: 'Pending' }
                ]}
              />
            </div>
          </div>

          {/* Activities List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="space-y-4">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => {
                    const Icon = iconMap[activity.type as keyof typeof iconMap] || FileText;
                    const colorClasses = colorMap[activity.type as keyof typeof colorMap] || colorMap.note;
                    
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                            <div className="flex items-center space-x-2">
                              {activity.completed && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                                  Completed
                                </span>
                              )}
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleViewActivity(activity)}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                                  title="View Activity"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditActivity(activity)}
                                  className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                  title="Edit Activity"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteActivity(activity.id)}
                                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                  title="Delete Activity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{activity.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Related to: {getRelatedName(activity)}</span>
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTime(activity.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <div className="text-gray-500 dark:text-gray-400">
                      {searchTerm || typeFilter || statusFilter ? 'No activities match your filters' : 'No activities found'}
                    </div>
                    {!searchTerm && !typeFilter && !statusFilter && (
                      <Button onClick={handleCreateActivity} className="mt-4" icon={Plus}>
                        Add Your First Activity
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activity={selectedActivity}
        mode={modalMode}
        onSave={modalMode === 'create' ? createActivity : (data) => updateActivity(selectedActivity!.id, data)}
      />
    </div>
  );
}