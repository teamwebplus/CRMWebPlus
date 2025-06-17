import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Phone, Mail, Users } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Textarea from '../UI/Textarea';
import { useClients } from '../../hooks/useClients';
import { useLeads } from '../../hooks/useLeads';
import { useOpportunities } from '../../hooks/useOpportunities';
import type { Database } from '../../lib/supabase';

type Activity = Database['public']['Tables']['activities']['Row'];
type ActivityInsert = Database['public']['Tables']['activities']['Insert'];
type ActivityUpdate = Database['public']['Tables']['activities']['Update'];

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity?: Activity;
  mode: 'create' | 'edit' | 'view';
  onSave: (data: ActivityInsert | ActivityUpdate) => Promise<{ data: any; error: string | null }>;
  clientId?: string;
  leadId?: string;
  opportunityId?: string;
}

const typeOptions = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'task', label: 'Task' },
  { value: 'note', label: 'Note' }
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export default function ActivityModal({ 
  isOpen, 
  onClose, 
  activity, 
  mode, 
  onSave,
  clientId,
  leadId,
  opportunityId
}: ActivityModalProps) {
  const { clients } = useClients();
  const { leads } = useLeads();
  const { opportunities } = useOpportunities();
  
  const [formData, setFormData] = useState<Partial<Activity>>({
    type: 'call',
    title: '',
    description: '',
    client_id: clientId || null,
    lead_id: leadId || null,
    opportunity_id: opportunityId || null,
    completed: false,
    due_date: null,
    priority: 'medium'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const clientOptions = clients.map(client => ({
    value: client.id,
    label: `${client.name} - ${client.company}`
  }));

  const leadOptions = leads.map(lead => ({
    value: lead.id,
    label: `${lead.name} - ${lead.company}`
  }));

  const opportunityOptions = opportunities.map(opp => ({
    value: opp.id,
    label: opp.title
  }));

  useEffect(() => {
    if (activity) {
      setFormData(activity);
    } else {
      setFormData({
        type: 'call',
        title: '',
        description: '',
        client_id: clientId || null,
        lead_id: leadId || null,
        opportunity_id: opportunityId || null,
        completed: false,
        due_date: null,
        priority: 'medium'
      });
    }
    setErrors({});
  }, [activity, isOpen, clientId, leadId, opportunityId]);

  const handleInputChange = (field: keyof Activity, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const activityData = {
        type: formData.type as Activity['type'],
        title: formData.title!,
        description: formData.description!,
        client_id: formData.client_id,
        lead_id: formData.lead_id,
        opportunity_id: formData.opportunity_id,
        completed: formData.completed || false,
        due_date: formData.due_date,
        priority: formData.priority as Activity['priority']
      };

      const { error } = await onSave(activityData);
      
      if (!error) {
        onClose();
      } else {
        setErrors({ submit: error });
      }
    } catch (error) {
      console.error('Error saving activity:', error);
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
      title={mode === 'create' ? 'Add New Activity' : mode === 'edit' ? 'Edit Activity' : 'Activity Details'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Activity Type"
            value={formData.type || 'call'}
            onChange={(e) => handleInputChange('type', e.target.value)}
            options={typeOptions}
            disabled={isReadOnly}
          />

          <Select
            label="Priority"
            value={formData.priority || 'medium'}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            options={priorityOptions}
            disabled={isReadOnly}
          />
        </div>

        <Input
          label="Activity Title"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors.title}
          disabled={isReadOnly}
          leftIcon={<FileText className="w-4 h-4 text-gray-400" />}
          placeholder="e.g., Follow-up call with client"
        />

        <Textarea
          label="Description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          error={errors.description}
          disabled={isReadOnly}
          placeholder="Describe the activity details..."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Related Client"
            value={formData.client_id || ''}
            onChange={(e) => handleInputChange('client_id', e.target.value || null)}
            options={[{ value: '', label: 'Select Client' }, ...clientOptions]}
            disabled={isReadOnly}
          />

          <Select
            label="Related Lead"
            value={formData.lead_id || ''}
            onChange={(e) => handleInputChange('lead_id', e.target.value || null)}
            options={[{ value: '', label: 'Select Lead' }, ...leadOptions]}
            disabled={isReadOnly}
          />

          <Select
            label="Related Opportunity"
            value={formData.opportunity_id || ''}
            onChange={(e) => handleInputChange('opportunity_id', e.target.value || null)}
            options={[{ value: '', label: 'Select Opportunity' }, ...opportunityOptions]}
            disabled={isReadOnly}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Due Date (Optional)"
            type="datetime-local"
            value={formData.due_date ? new Date(formData.due_date).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleInputChange('due_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
            disabled={isReadOnly}
            leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
          />

          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="completed"
              checked={formData.completed || false}
              onChange={(e) => handleInputChange('completed', e.target.checked)}
              disabled={isReadOnly}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="completed" className="text-sm font-medium text-gray-700">
              Mark as completed
            </label>
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}

        {!isReadOnly && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {mode === 'create' ? 'Create Activity' : 'Update Activity'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
}