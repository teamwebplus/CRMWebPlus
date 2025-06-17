import React, { useState } from 'react';
import { Globe, Clock, DollarSign, Languages, Save, Database, RefreshCw } from 'lucide-react';
import Button from '../UI/Button';
import Select from '../UI/Select';
import Input from '../UI/Input';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    timezone: 'Asia/Manila',
    dateFormat: 'MM/DD/YYYY',
    currency: 'PHP',
    language: 'English',
    dataRetention: '12',
    autoBackup: true,
    backupFrequency: 'daily'
  });
  
  const [loading, setLoading] = useState(false);
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
    setSettings(prev => ({ ...prev, [field]: value }));
    if (message) setMessage(null);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, this would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setMessage({ type: 'success', text: 'System settings saved successfully!' });
    } catch (error) {
      console.error('Error saving system settings:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save system settings' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunBackup = async () => {
    setLoading(true);
    
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
    } finally {
      setLoading(false);
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
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            options={timezoneOptions}
          />
          
          <Select
            label="Date Format"
            value={settings.dateFormat}
            onChange={(e) => handleInputChange('dateFormat', e.target.value)}
            options={dateFormatOptions}
          />
          
          <Select
            label="Currency"
            value={settings.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            options={currencyOptions}
          />
          
          <Select
            label="Language"
            value={settings.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
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
            onChange={(e) => handleInputChange('dataRetention', e.target.value)}
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
                  onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Enable automatic backups
                </span>
              </div>
              <Select
                value={settings.backupFrequency}
                onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
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