import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Building2, Camera } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import type { Database } from '../../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: Profile;
  mode: 'create' | 'edit' | 'view';
  onSave: (data: ProfileInsert | ProfileUpdate) => Promise<{ data: any; error: string | null }>;
}

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'sales', label: 'Sales Representative' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Administrator' }
];

const departmentOptions = [
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'support', label: 'Customer Support' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'operations', label: 'Operations' },
  { value: 'management', label: 'Management' }
];

export default function UserModal({ isOpen, onClose, user, mode, onSave }: UserModalProps) {
  const [formData, setFormData] = useState<Partial<Profile>>({
    name: '',
    email: '',
    role: 'user',
    phone: '',
    department: '',
    avatar_url: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'user',
        phone: '',
        department: '',
        avatar_url: ''
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const handleInputChange = (field: keyof Profile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const userData = {
        name: formData.name!.trim(),
        email: formData.email!.trim(),
        role: formData.role!,
        phone: formData.phone?.trim() || null,
        department: formData.department?.trim() || null,
        avatar_url: formData.avatar_url?.trim() || null,
      };

      // Remove the problematic user_id assignment for create mode
      // The user_id should be handled by the backend/database trigger
      // or set to an actual authenticated user's ID

      const { error } = await onSave(userData);
      
      if (!error) {
        onClose();
      } else {
        setErrors({ submit: error });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors({ submit: 'An error occurred while saving' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full system access and user management';
      case 'manager':
        return 'Team management and advanced features';
      case 'sales':
        return 'Sales-focused features and client management';
      case 'user':
        return 'Basic CRM features and personal tasks';
      default:
        return '';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New User' : mode === 'edit' ? 'Edit User' : 'User Details'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <img
            className="h-16 w-16 rounded-full"
            src={formData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=3B82F6&color=fff`}
            alt={formData.name || 'User'}
          />
          {!isReadOnly && (
            <div>
              <Button type="button" variant="outline" size="sm" icon={Camera}>
                Change Photo
              </Button>
              <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</p>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            disabled={isReadOnly}
            leftIcon={<User className="w-4 h-4 text-gray-400" />}
            placeholder="Enter full name"
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            disabled={isReadOnly}
            leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
            placeholder="Enter email address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={isReadOnly}
            leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
            placeholder="Enter phone number"
          />

          <Input
            label="Avatar URL (Optional)"
            value={formData.avatar_url || ''}
            onChange={(e) => handleInputChange('avatar_url', e.target.value)}
            disabled={isReadOnly}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        {/* Role and Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Select
              label="Role"
              value={formData.role || 'user'}
              onChange={(e) => handleInputChange('role', e.target.value)}
              options={roleOptions}
              disabled={isReadOnly}
            />
            {formData.role && (
              <p className="text-xs text-gray-500">
                {getRoleDescription(formData.role)}
              </p>
            )}
          </div>

          <Select
            label="Department"
            value={formData.department || ''}
            onChange={(e) => handleInputChange('department', e.target.value)}
            options={[{ value: '', label: 'Select Department' }, ...departmentOptions]}
            disabled={isReadOnly}
          />
        </div>

        {/* Role Badge for View Mode */}
        {mode === 'view' && (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {formData.role?.charAt(0).toUpperCase() + formData.role?.slice(1)} Access
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {getRoleDescription(formData.role || '')}
              </div>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}

        {/* Actions */}
        {!isReadOnly && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {mode === 'create' ? 'Create User' : 'Update User'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
}