import React, { useState } from 'react';
import { Palette, Monitor, Sun, Moon, Layout, Sidebar, Save } from 'lucide-react';
import Button from '../UI/Button';
import ThemeToggle from '../UI/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    sidebarCollapsed: false,
    compactMode: false,
    highContrastMode: false,
    animationsEnabled: true,
    fontScale: '100'
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fontScaleOptions = [
    { value: '90', label: 'Small (90%)' },
    { value: '100', label: 'Default (100%)' },
    { value: '110', label: 'Large (110%)' },
    { value: '120', label: 'Extra Large (120%)' }
  ];

  const handleToggleSetting = (setting: string) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
    if (message) setMessage(null);
  };

  const handleFontScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, fontScale: e.target.value }));
    if (message) setMessage(null);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, this would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Apply font scale to document root
      document.documentElement.style.fontSize = `${parseInt(settings.fontScale) / 100}rem`;
      
      setMessage({ type: 'success', text: 'Appearance settings saved successfully!' });
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save appearance settings' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Customize the look and feel of your CRM interface.
        </p>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Palette className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          Theme
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Color Theme
            </label>
            <ThemeToggle />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Choose between light, dark, or system theme based on your preference.
            </p>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white">High Contrast Mode</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Increase contrast for better visibility
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highContrastMode}
                onChange={() => handleToggleSetting('highContrastMode')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Layout Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Layout className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          Layout
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white">Collapsed Sidebar</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start with sidebar collapsed by default
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sidebarCollapsed}
                onChange={() => handleToggleSetting('sidebarCollapsed')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white">Compact Mode</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Use smaller spacing and compact layouts
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={() => handleToggleSetting('compactMode')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white">Animations</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable interface animations and transitions
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.animationsEnabled}
                onChange={() => handleToggleSetting('animationsEnabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Font Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">
          Font Size
        </h4>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-2">
              <span>Small</span>
              <span>Default</span>
              <span>Large</span>
            </div>
            <input
              type="range"
              min="90"
              max="120"
              step="10"
              value={settings.fontScale}
              onChange={handleFontScaleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="mt-2 text-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {fontScaleOptions.find(option => option.value === settings.fontScale)?.label}
              </span>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg mt-4">
            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Preview</h5>
            <p className="text-sm text-gray-700 dark:text-gray-300" style={{ fontSize: `${parseInt(settings.fontScale) / 100}rem` }}>
              This is how your text will appear throughout the application.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2" style={{ fontSize: `${parseInt(settings.fontScale) / 100 * 0.75}rem` }}>
              Smaller text like this will also be adjusted proportionally.
            </p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2" style={{ fontSize: `${parseInt(settings.fontScale) / 100 * 1.125}rem` }}>
              Headings will look like this
            </h3>
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
          Save Appearance Settings
        </Button>
      </div>
    </div>
  );
}