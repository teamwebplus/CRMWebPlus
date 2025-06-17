import React, { useState } from 'react';
import { Bell, Mail, Calendar, CheckSquare, User, TrendingUp, Target, Save, Phone } from 'lucide-react';
import Button from '../UI/Button';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  icon: React.ComponentType<any>;
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'new_lead',
      title: 'New Lead',
      description: 'When a new lead is added to the system',
      email: true,
      push: true,
      sms: false,
      icon: Target
    },
    {
      id: 'new_client',
      title: 'New Client',
      description: 'When a new client is added to the system',
      email: true,
      push: true,
      sms: false,
      icon: User
    },
    {
      id: 'new_opportunity',
      title: 'New Opportunity',
      description: 'When a new opportunity is created',
      email: true,
      push: true,
      sms: false,
      icon: TrendingUp
    },
    {
      id: 'task_assigned',
      title: 'Task Assignment',
      description: 'When a task is assigned to you',
      email: true,
      push: true,
      sms: true,
      icon: CheckSquare
    },
    {
      id: 'task_due',
      title: 'Task Due Soon',
      description: 'When a task is due within 24 hours',
      email: true,
      push: true,
      sms: true,
      icon: Calendar
    },
    {
      id: 'meeting_reminder',
      title: 'Meeting Reminder',
      description: 'Reminders for upcoming meetings',
      email: true,
      push: true,
      sms: true,
      icon: Calendar
    },
    {
      id: 'deal_closed',
      title: 'Deal Closed',
      description: 'When a deal is marked as closed',
      email: true,
      push: true,
      sms: false,
      icon: TrendingUp
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggle = (settingId: string, channel: 'email' | 'push' | 'sms') => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { ...setting, [channel]: !setting[channel] } 
        : setting
    ));
    
    if (message) setMessage(null);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, this would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save notification preferences' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Manage how and when you receive notifications from the system.
        </p>
      </div>

      {/* Channel Legend */}
      <div className="flex items-center space-x-8 mb-4">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Push</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {settings.map((setting) => {
            const Icon = setting.icon;
            
            return (
              <div key={setting.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{setting.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{setting.description}</p>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Email Toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.email}
                            onChange={() => handleToggle(setting.id, 'email')}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                          <Mail className="w-4 h-4 text-gray-400 ml-2" />
                        </label>
                        
                        {/* Push Toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.push}
                            onChange={() => handleToggle(setting.id, 'push')}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                          <Bell className="w-4 h-4 text-gray-400 ml-2" />
                        </label>
                        
                        {/* SMS Toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.sms}
                            onChange={() => handleToggle(setting.id, 'sms')}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                          <Phone className="w-4 h-4 text-gray-400 ml-2" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Email Frequency Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          Email Frequency
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="frequency-realtime"
              name="email-frequency"
              checked={true}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
            />
            <label htmlFor="frequency-realtime" className="text-sm text-gray-700 dark:text-gray-300">
              Real-time - Send emails as events occur
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="frequency-daily"
              name="email-frequency"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
            />
            <label htmlFor="frequency-daily" className="text-sm text-gray-700 dark:text-gray-300">
              Daily Digest - Send a daily summary of all notifications
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="frequency-weekly"
              name="email-frequency"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
            />
            <label htmlFor="frequency-weekly" className="text-sm text-gray-700 dark:text-gray-300">
              Weekly Digest - Send a weekly summary of all notifications
            </label>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
            : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings} 
          loading={loading}
          icon={Save}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}