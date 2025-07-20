import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface SystemSettings {
  registrationEnabled: boolean;
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
  dataRetention: string;
  autoBackup: boolean;
  backupFrequency: string;
}

const defaultSettings: SystemSettings = {
  registrationEnabled: false, // Default to disabled for security
  timezone: 'Asia/Manila',
  dateFormat: 'MM/DD/YYYY',
  currency: 'PHP',
  language: 'English',
  dataRetention: '12',
  autoBackup: true,
  backupFrequency: 'daily'
};

export function useSystemSettings() {
  const [settings, setSettings] = useLocalStorage<SystemSettings>('crm-system-settings', defaultSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would save to your backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      setSettings(prev => ({ ...prev, ...newSettings }));
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetToDefaults
  };
}