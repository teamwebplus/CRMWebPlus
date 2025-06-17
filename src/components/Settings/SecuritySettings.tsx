import React, { useState } from 'react';
import { Shield, Lock, Key, Eye, EyeOff, Save, AlertTriangle } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { useAuth } from '../../hooks/useAuth';

export default function SecuritySettings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (message) setMessage(null);
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return false;
    }
    
    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      // In a real implementation, you would call Supabase auth.updateUser
      // For demo purposes, we'll simulate a successful password change
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, you would enable/disable 2FA
      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTwoFactorEnabled(!twoFactorEnabled);
      setMessage({ 
        type: 'success', 
        text: `Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'} successfully!` 
      });
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update two-factor authentication' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Manage your account security settings and credentials.
        </p>
      </div>

      {/* Password Change Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          Change Password
        </h4>
        
        <div className="space-y-4">
          <Input
            label="Current Password"
            type={showPasswords ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            leftIcon={<Key className="w-4 h-4 text-gray-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            placeholder="Enter your current password"
          />
          
          <Input
            label="New Password"
            type={showPasswords ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
            placeholder="Enter your new password"
          />
          
          <Input
            label="Confirm New Password"
            type={showPasswords ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
            placeholder="Confirm your new password"
          />
          
          <div className="flex justify-end">
            <Button
              onClick={handleChangePassword}
              loading={loading}
              icon={Save}
            >
              Update Password
            </Button>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          Two-Factor Authentication
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {twoFactorEnabled 
                ? 'Two-factor authentication is enabled' 
                : 'Add an extra layer of security to your account'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {twoFactorEnabled 
                ? 'Your account is protected with an additional security layer' 
                : 'We recommend enabling 2FA for enhanced account security'}
            </p>
          </div>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={handleToggleTwoFactor}
                disabled={loading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
        
        {twoFactorEnabled && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200">Demo Mode</h5>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  In a production environment, this would configure two-factor authentication with an authenticator app or SMS verification.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          Active Sessions
        </h4>
        
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Current Session</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {navigator.userAgent}
                </p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Active Now
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled
              >
                Current
              </Button>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Mobile App</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Last active: 2 days ago
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                Revoke
              </Button>
            </div>
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
    </div>
  );
}