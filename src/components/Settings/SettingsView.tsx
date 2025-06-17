import React, { useState } from 'react';
import { User, Bell, Shield, Database, Palette, Globe, Save, Eye, EyeOff } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Textarea from '../UI/Textarea';
import ThemeToggle from '../UI/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();
  
  const [settings, setSettings] = useState({
    // Profile settings
    name: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1 (555) 123-4567',
    department: 'Sales',
    role: 'Sales Manager',
    bio: 'Experienced sales manager with 10+ years in CRM and customer relationship management.',
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    taskReminders: true,
    leadAlerts: true,
    
    // Security settings
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
    
    // System settings
    timezone: 'Asia/Manila',
    dateFormat: 'MM/DD/YYYY',
    currency: 'PHP',
    language: 'English',
    
    // Appearance settings
    theme: theme,
    sidebarCollapsed: false,
    compactMode: false
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log('Saving settings:', settings);
    // Show success message
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            value={settings.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            leftIcon={<User className="w-4 h-4 text-gray-400" />}
          />
          <Input
            label="Email Address"
            type="email"
            value={settings.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            leftIcon={<Globe className="w-4 h-4 text-gray-400" />}
          />
          <Input
            label="Phone Number"
            value={settings.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
          <Input
            label="Department"
            value={settings.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
          />
          <Select
            label="Role"
            value={settings.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            options={[
              { value: 'Sales Manager', label: 'Sales Manager' },
              { value: 'Sales Rep', label: 'Sales Representative' },
              { value: 'Admin', label: 'Administrator' },
              { value: 'User', label: 'User' }
            ]}
          />
        </div>
        <div className="mt-6">
          <Textarea
            label="Bio"
            value={settings.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={3}
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
            { key: 'weeklyReports', label: 'Weekly Reports', description: 'Get weekly performance reports' },
            { key: 'taskReminders', label: 'Task Reminders', description: 'Reminders for upcoming tasks' },
            { key: 'leadAlerts', label: 'Lead Alerts', description: 'Notifications for new leads' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{item.label}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onChange={(e) => handleInputChange(item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>
        <div className="space-y-4">
          <Input
            label="Current Password"
            type={showPassword ? 'text' : 'password'}
            value={settings.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            leftIcon={<Shield className="w-4 h-4 text-gray-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={settings.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            leftIcon={<Shield className="w-4 h-4 text-gray-400" />}
          />
          <Input
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            value={settings.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            leftIcon={<Shield className="w-4 h-4 text-gray-400" />}
          />
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Timezone"
            value={settings.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            options={[
              { value: 'Asia/Manila', label: 'Asia/Manila (GMT+8)' },
              { value: 'UTC', label: 'UTC (GMT+0)' },
              { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
              { value: 'Europe/London', label: 'Europe/London (GMT+0)' }
            ]}
          />
          <Select
            label="Date Format"
            value={settings.dateFormat}
            onChange={(e) => handleInputChange('dateFormat', e.target.value)}
            options={[
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
            ]}
          />
          <Select
            label="Currency"
            value={settings.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            options={[
              { value: 'PHP', label: 'Philippine Peso (PHP)' },
              { value: 'USD', label: 'US Dollar (USD)' },
              { value: 'EUR', label: 'Euro (EUR)' },
              { value: 'GBP', label: 'British Pound (GBP)' }
            ]}
          />
          <Select
            label="Language"
            value={settings.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            options={[
              { value: 'English', label: 'English' },
              { value: 'Filipino', label: 'Filipino' },
              { value: 'Spanish', label: 'Spanish' }
            ]}
          />
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance Settings</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Theme Preference
            </label>
            <ThemeToggle />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Choose your preferred theme or set to auto to match your system preference
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              { key: 'sidebarCollapsed', label: 'Collapsed Sidebar', description: 'Start with sidebar collapsed by default' },
              { key: 'compactMode', label: 'Compact Mode', description: 'Use smaller spacing and compact layouts' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{item.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.key as keyof typeof settings] as boolean}
                    onChange={(e) => handleInputChange(item.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'system':
        return renderSystemTab();
      case 'appearance':
        return renderAppearanceTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex justify-end">
            <Button onClick={handleSave} icon={Save}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}