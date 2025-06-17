import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2, Camera, Save, Eye, EyeOff } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Textarea from '../UI/Textarea';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ProfileSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const departmentOptions = [
    { value: '', label: 'Select Department' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'support', label: 'Customer Support' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'operations', label: 'Operations' },
    { value: 'management', label: 'Management' }
  ];

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'sales', label: 'Sales Representative' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Administrator' }
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        department: data.department || '',
        role: data.role || 'user',
        avatar_url: data.avatar_url || ''
      });
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (message) setMessage(null);
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          department: formData.department || null,
          avatar_url: formData.avatar_url || null
        })
        .eq('id', profile.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      // In a real implementation, you would upload to Supabase Storage
      // For now, we'll use a placeholder URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, avatar_url: result }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Update your personal information and profile settings.
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            className="h-24 w-24 rounded-full object-cover"
            src={formData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=3B82F6&color=fff&size=96`}
            alt={formData.name || 'User'}
          />
          <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Profile Photo</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            JPG, GIF or PNG. 1MB max.
          </p>
          <label className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <Camera className="w-4 h-4 mr-2" />
            Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          leftIcon={<User className="w-4 h-4 text-gray-400" />}
          placeholder="Enter your full name"
        />

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
          placeholder="Enter your email"
        />

        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
          placeholder="Enter your phone number"
        />

        <Select
          label="Department"
          value={formData.department}
          onChange={(e) => handleInputChange('department', e.target.value)}
          options={departmentOptions}
        />

        <Input
          label="Avatar URL (Optional)"
          value={formData.avatar_url}
          onChange={(e) =>  handleInputChange('avatar_url', e.target.value)}
          placeholder="https://example.com/avatar.jpg"
        />

        <div className="flex items-center space-x-2 mt-7">
          <div className={`px-2 py-1 text-xs font-medium rounded-full ${
            formData.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
            formData.role === 'manager' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
            formData.role === 'sales' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          }`}>
            {formData.role === 'admin' ? '👑 ' : 
             formData.role === 'manager' ? '👔 ' : 
             formData.role === 'sales' ? '💼 ' : '👤 '}
            {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Role changes require administrator approval
          </span>
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
          onClick={handleSave} 
          loading={saving}
          icon={Save}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}