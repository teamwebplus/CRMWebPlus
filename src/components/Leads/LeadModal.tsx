import React, { useState, useEffect } from 'react';
import { User, Building2, Mail, Phone, Globe, Target, TrendingUp, Star, Calendar } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Textarea from '../UI/Textarea';
import LeadTasksSection from './LeadTasksSection';
import type { Database } from '../../lib/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];
type LeadInsert = Database['public']['Tables']['leads']['Insert'];
type LeadUpdate = Database['public']['Tables']['leads']['Update'];

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead;
  mode: 'create' | 'edit' | 'view';
  onSave: (data: LeadInsert | LeadUpdate) => Promise<{ data: any; error: string | null }>;
}

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' }
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

export default function LeadModal({ isOpen, onClose, lead, mode, onSave }: LeadModalProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    status: 'new',
    score: 50,
    value: 0,
    notes: '',
    address: '',
    website: '',
    industry: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'tasks'>('details');

  useEffect(() => {
    if (lead) {
      setFormData(lead);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: '',
        status: 'new',
        score: 50,
        value: 0,
        notes: '',
        address: '',
        website: '',
        industry: ''
      });
    }
    setErrors({});
    setActiveTab('details');
  }, [lead, isOpen]);

  const handleInputChange = (field: keyof Lead, value: any) => {
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
    if (!formData.company?.trim()) {
      newErrors.company = 'Company is required';
    }
    if (!formData.source?.trim()) {
      newErrors.source = 'Source is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const leadData = {
        name: formData.name!,
        email: formData.email!,
        phone: formData.phone || null,
        company: formData.company!,
        source: formData.source!,
        status: formData.status as Lead['status'],
        score: formData.score || 50,
        value: formData.value || 0,
        notes: formData.notes || '',
        address: formData.address || null,
        website: formData.website || null,
        industry: formData.industry || null,
      };

      const { error } = await onSave(leadData);
      
      if (!error) {
        onClose();
      } else {
        setErrors({ submit: error });
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      setErrors({ submit: 'An error occurred while saving' });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Lead' : mode === 'edit' ? 'Edit Lead' : 'Lead Details'}
      size="xl"
    >
      {/* Tabs for view mode */}
      {mode === 'view' && lead && (
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lead Details
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Tasks
            </button>
          </nav>
        </div>
      )}

      {/* Tasks Tab Content */}
      {mode === 'view' && lead && activeTab === 'tasks' && (
        <LeadTasksSection leadId={lead.id} leadName={lead.name} />
      )}

      {/* Details Tab Content */}
      {(mode !== 'view' || activeTab === 'details') && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Lead Information
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

            {/* Lead Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Lead Details
              </h4>

              <Select
                label="Source"
                value={formData.source || ''}
                onChange={(e) => handleInputChange('source', e.target.value)}
                options={[{ value: '', label: 'Select Source' }, ...sourceOptions]}
                error={errors.source}
                disabled={isReadOnly}
              />

              <Select
                label="Status"
                value={formData.status || 'new'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                options={statusOptions}
                disabled={isReadOnly}
              />

              <Select
                label="Industry"
                value={formData.industry || ''}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                options={[{ value: '', label: 'Select Industry' }, ...industryOptions]}
                disabled={isReadOnly}
              />

              <Input
                label="Website"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={isReadOnly}
                leftIcon={<Globe className="w-4 h-4 text-gray-400" />}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Score and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Lead Score
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.score || 50}
                  onChange={(e) => handleInputChange('score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span className={`font-medium ${getScoreColor(formData.score || 50)}`}>
                    {formData.score || 50}
                  </span>
                  <span>100</span>
                </div>
              </div>
            </div>

            <Input
              label="Estimated Value"
              type="number"
              value={formData.value || ''}
              onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
              disabled={isReadOnly}
              leftIcon={<TrendingUp className="w-4 h-4 text-gray-400" />}
              placeholder="0"
            />
          </div>

          {/* Address */}
          <Input
            label="Address"
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            disabled={isReadOnly}
            placeholder="Full address"
          />

          {/* Notes */}
          <Textarea
            label="Notes"
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            disabled={isReadOnly}
            placeholder="Add any additional notes about this lead..."
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
                {mode === 'create' ? 'Create Lead' : 'Update Lead'}
              </Button>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}