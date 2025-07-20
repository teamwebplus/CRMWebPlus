import React, { useState } from 'react';
import { Globe, Clock, DollarSign, Languages, Save, Database, RefreshCw, Shield, UserPlus } from 'lucide-react';
import Button from '../UI/Button';
import Select from '../UI/Select';
import Input from '../UI/Input';
import { useSystemSettings } from '../../hooks/useSystemSettings';

export default function SystemSettings() {
  const { settings, loading, updateSettings } = useSystemSettings();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const timezoneOptions = [
    { value: 'Asia/Manila', label: 'Asia/Manila (GMT+8)' },
    { value: 'UTC', label: 'UTC (GMT+0)' },
    { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
    { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (GMT+11)' }
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY' }
  ];

  const currencyOptions = [
    { value: 'PHP', label: 'Philippine Peso (PHP)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'JPY', label: 'Japanese Yen (JPY)' },
    { value: 'AUD', label: 'Australian Dollar (AUD)' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Filipino', label: 'Filipino' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Japanese', label: 'Japanese' }
  ];

  const dataRetentionOptions = [
    { value: '3', label: '3 months' },
    { value: '6', label: '6 months' },
    { value: '12', label: '1 year' },
    { value: '24', label: '2 years' },
    { value: '36', label: '3 years' },
    { value: '0', label: 'Forever' }
  ];

  const backupFrequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const handleInputChange = (field: string, value: any) => {
    if (message) setMessage(null);
  };

  const handleSaveSettings = async () => {
    try {
      const result = await updateSettings(settings);
      if (result.success) {
      setMessage({ type: 'success', text: 'System settings saved successfully!' });
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving system settings:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save system settings' 
      });
    }
  };

  const handleRunBackup = async () => {
    try {
      // In a real implementation, this would trigger a backup
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate backup process
      
      setMessage({ type: 'success', text: 'Backup completed successfully!' });
    } catch (error) {
      console.error('Error running backup:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to run backup' 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Preferences</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure system-wide settings for your CRM experience.
        </p>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          Security & Access Control
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-start space-x-3">
              <UserPlus className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">User Registration</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Allow new users to create accounts through the sign-up page
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    settings.registrationEnabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {settings.registrationEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.registrationEnabled}
                onChange={(e) => updateSettings({ registrationEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          {!settings.registrationEnabled && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Registration Disabled:</strong> New users cannot create accounts. Only administrators can add new users through the user management interface.
              </p>
            </div>
          )}
          
          {settings.registrationEnabled && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Registration Enabled:</strong> New users can create accounts through the sign-up page. Consider disabling this for enhanced security in production environments.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Regional Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          Regional Settings
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Timezone"
            value={settings.timezone}
            onChange={(e) => updateSettings({ timezone: e.target.value })}
            options={timezoneOptions}
          />
          
          <Select
            label="Date Format"
            value={settings.dateFormat}
            onChange={(e) => updateSettings({ dateFormat: e.target.value })}
            options={dateFormatOptions}
          />
          
          <Select
            label="Currency"
            value={settings.currency}
            onChange={(e) => updateSettings({ currency: e.target.value })}
            options={currencyOptions}
          />
          
          <Select
            label="Language"
            value={settings.language}
            onChange={(e) => updateSettings({ language: e.target.value })}
            options={languageOptions}
          />
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          Data Management
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Data Retention Period"
            value={settings.dataRetention}
            onChange={(e) => updateSettings({ dataRetention: e.target.value })}
            options={dataRetentionOptions}
            helperText="How long to keep historical data before archiving"
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Automatic Backups
            </label>
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => updateSettings({ autoBackup: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Enable automatic backups
                </span>
              </div>
              <Select
                value={settings.backupFrequency}
                onChange={(e) => updateSettings({ backupFrequency: e.target.value })}
                options={backupFrequencyOptions}
                className="w-32"
                disabled={!settings.autoBackup}
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Button
              onClick={handleRunBackup}
              variant="outline"
              icon={RefreshCw}
              loading={loading}
            >
              Run Manual Backup Now
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Creates a complete backup of your CRM data that can be downloaded or stored in the cloud.
            </p>
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
          Save System Settings
        </Button>
      </div>
    </div>
  );
}