import React, { useState, useEffect } from 'react';
import { User, Building2, Mail, Phone, Globe, MapPin, Users, Tag } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Textarea from '../UI/Textarea';
import type { Database } from '../../lib/supabase';

type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
  mode: 'create' | 'edit' | 'view';
  onSave: (data: ClientInsert | ClientUpdate) => Promise<{ data: any; error: string | null }>;
}

const statusOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'customer', label: 'Customer' },
  { value: 'inactive', label: 'Inactive' }
];

const industryOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' }
];

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'trade-show', label: 'Trade Show' },
  { value: 'google-ads', label: 'Google Ads' },
  { value: 'cold-call', label: 'Cold Call' },
  { value: 'other', label: 'Other' }
];

export default function ClientModal({ isOpen, onClose, client, mode, onSave }: ClientModalProps) {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'lead',
    value: 0,
    tags: [],
    notes: '',
    address: '',
    website: '',
    industry: '',
    employees: 0,
    source: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'lead',
        value: 0,
        tags: [],
        notes: '',
        address: '',
        website: '',
        industry: '',
        employees: 0,
        source: ''
      });
    }
    setErrors({});
  }, [client, isOpen]);

  const handleInputChange = (field: keyof Client, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
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
    if (!formData.company?.trim()) {
      newErrors.company = 'Company is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const clientData = {
        name: formData.name!,
        email: formData.email!,
        phone: formData.phone || null,
        company: formData.company!,
        status: formData.status as Client['status'],
        value: formData.value || 0,
        tags: formData.tags || [],
        notes: formData.notes || '',
        address: formData.address || null,
        website: formData.website || null,
        industry: formData.industry || null,
        employees: formData.employees || null,
        source: formData.source || null,
      };

      const { error } = await onSave(clientData);
      
      if (!error) {
        onClose();
      } else {
        setErrors({ submit: error });
      }
    } catch (error) {
      console.error('Error saving client:', error);
      setErrors({ submit: 'An error occurred while saving' });
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Client' : mode === 'edit' ? 'Edit Client' : 'Client Details'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Basic Information
            </h4>
            
            <Input
              label="Full Name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              disabled={isReadOnly}
              leftIcon={<User className="w-4 h-4 text-gray-400" />}
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              disabled={isReadOnly}
              leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
            />

            <Input
              label="Phone Number"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={isReadOnly}
              leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
            />

            <Input
              label="Company"
              value={formData.company || ''}
              onChange={(e) => handleInputChange('company', e.target.value)}
              error={errors.company}
              disabled={isReadOnly}
              leftIcon={<Building2 className="w-4 h-4 text-gray-400" />}
            />
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              Company Information
            </h4>

            <Input
              label="Website"
              value={formData.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              disabled={isReadOnly}
              leftIcon={<Globe className="w-4 h-4 text-gray-400" />}
              placeholder="https://example.com"
            />

            <Select
              label="Industry"
              value={formData.industry || ''}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              options={[{ value: '', label: 'Select Industry' }, ...industryOptions]}
              disabled={isReadOnly}
            />

            <Input
              label="Number of Employees"
              type="number"
              value={formData.employees || ''}
              onChange={(e) => handleInputChange('employees', parseInt(e.target.value) || 0)}
              disabled={isReadOnly}
              leftIcon={<Users className="w-4 h-4 text-gray-400" />}
            />

            <Input
              label="Address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={isReadOnly}
              leftIcon={<MapPin className="w-4 h-4 text-gray-400" />}
            />
          </div>
        </div>

        {/* Status and Value */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            label="Status"
            value={formData.status || 'lead'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            options={statusOptions}
            disabled={isReadOnly}
          />

          <Input
            label="Estimated Value"
            type="number"
            value={formData.value || ''}
            onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
            disabled={isReadOnly}
            placeholder="0"
          />

          <Select
            label="Source"
            value={formData.source || ''}
            onChange={(e) => handleInputChange('source', e.target.value)}
            options={[{ value: '', label: 'Select Source' }, ...sourceOptions]}
            disabled={isReadOnly}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Tags
          </label>
          {!isReadOnly && (
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full"
              >
                {tag}
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <Textarea
          label="Notes"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={4}
          disabled={isReadOnly}
          placeholder="Add any additional notes about this client..."
        />

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}

        {/* Actions */}
        {!isReadOnly && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {mode === 'create' ? 'Create Client' : 'Update Client'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
}