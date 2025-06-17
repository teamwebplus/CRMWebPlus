import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Flag, CheckCircle } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Textarea from '../UI/Textarea';
import type { Database } from '../../lib/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  mode: 'create' | 'edit' | 'view';
  onSave: (data: TaskInsert | TaskUpdate) => Promise<{ data: any; error: string | null }>;
  leadId?: string;
  clientId?: string;
  opportunityId?: string;
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

export default function TaskModal({ 
  isOpen, 
  onClose, 
  task, 
  mode, 
  onSave, 
  leadId, 
  clientId, 
  opportunityId 
}: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    lead_id: leadId || null,
    client_id: clientId || null,
    opportunity_id: opportunityId || null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      // Convert UTC date to local datetime-local format
      const dueDate = task.due_date ? new Date(task.due_date) : null;
      const localDateTime = dueDate ? 
        new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000)
          .toISOString().slice(0, 16) : '';
      
      setFormData({
        ...task,
        due_date: localDateTime
      });
    } else {
      // Set default due date to tomorrow at 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const localDateTime = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 16);

      setFormData({
        title: '',
        description: '',
        due_date: localDateTime,
        priority: 'medium',
        status: 'pending',
        lead_id: leadId || null,
        client_id: clientId || null,
        opportunity_id: opportunityId || null
      });
    }
    setErrors({});
  }, [task, isOpen, leadId, clientId, opportunityId]);

  const handleInputChange = (field: keyof Task, value: any) => {
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
    if (!formData.due_date?.trim()) {
      newErrors.due_date = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Convert local datetime to UTC
      const localDate = new Date(formData.due_date!);
      const utcDate = new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
      
      const taskData = {
        title: formData.title!,
        description: formData.description || '',
        due_date: utcDate.toISOString(),
        priority: formData.priority as Task['priority'],
        status: formData.status as Task['status'],
        lead_id: formData.lead_id,
        client_id: formData.client_id,
        opportunity_id: formData.opportunity_id
      };

      const { error } = await onSave(taskData);
      
      if (!error) {
        onClose();
      } else {
        setErrors({ submit: error });
      }
    } catch (error) {
      console.error('Error saving task:', error);
      setErrors({ submit: 'An error occurred while saving' });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Task' : mode === 'edit' ? 'Edit Task' : 'Task Details'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <Input
            label="Task Title"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
            disabled={isReadOnly}
            leftIcon={<FileText className="w-4 h-4 text-gray-400" />}
            placeholder="e.g., Follow up on proposal"
          />

          <Textarea
            label="Description"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            disabled={isReadOnly}
            placeholder="Add task details..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Due Date & Time"
              type="datetime-local"
              value={formData.due_date || ''}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
              error={errors.due_date}
              disabled={isReadOnly}
              leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
            />

            <Select
              label="Priority"
              value={formData.priority || 'medium'}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              options={priorityOptions}
              disabled={isReadOnly}
            />
          </div>

          <Select
            label="Status"
            value={formData.status || 'pending'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            options={statusOptions}
            disabled={isReadOnly}
          />
        </div>

        {/* Status and Priority Badges */}
        {mode === 'view' && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Priority:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(formData.priority!)}`}>
                <Flag className="w-3 h-3 mr-1" />
                {formData.priority?.charAt(0).toUpperCase() + formData.priority?.slice(1)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(formData.status!)}`}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {formData.status?.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
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
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {mode === 'create' ? 'Create Task' : 'Update Task'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
}