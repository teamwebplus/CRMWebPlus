import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, FileText, User, Edit, Trash2 } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Textarea from '../UI/Textarea';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'call' | 'demo' | 'followup' | 'task';
  attendees: string[];
  location?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  taskId?: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event;
  mode: 'create' | 'edit' | 'view';
  selectedDate?: string;
  onSave?: (event: Event) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
}

const eventTypeOptions = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'call', label: 'Call' },
  { value: 'demo', label: 'Demo' },
  { value: 'followup', label: 'Follow-up' },
  { value: 'task', label: 'Task' }
];

const attendeeOptions = [
  { value: 'John Smith', label: 'John Smith' },
  { value: 'Sarah Wilson', label: 'Sarah Wilson' },
  { value: 'Mike Johnson', label: 'Mike Johnson' },
  { value: 'Tom Davis', label: 'Tom Davis' },
  { value: 'Lisa Brown', label: 'Lisa Brown' }
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export default function EventModal({ 
  isOpen, 
  onClose, 
  event, 
  mode, 
  selectedDate, 
  onSave, 
  onEdit, 
  onDelete 
}: EventModalProps) {
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    date: selectedDate || '',
    time: '',
    type: 'meeting',
    attendees: [],
    location: '',
    description: '',
    priority: 'medium'
  });
  const [attendeeInput, setAttendeeInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        title: '',
        date: selectedDate || new Date().toISOString().split('T')[0],
        time: '',
        type: 'meeting',
        attendees: [],
        location: '',
        description: '',
        priority: 'medium'
      });
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [event, isOpen, selectedDate]);

  const handleInputChange = (field: keyof Event, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addAttendee = () => {
    if (attendeeInput.trim() && !formData.attendees?.includes(attendeeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        attendees: [...(prev.attendees || []), attendeeInput.trim()]
      }));
      setAttendeeInput('');
    }
  };

  const removeAttendee = (attendeeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees?.filter(attendee => attendee !== attendeeToRemove) || []
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.date?.trim()) {
      newErrors.date = 'Date is required';
    }
    if (!formData.time?.trim()) {
      newErrors.time = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const eventData: Event = {
        id: event?.id || Date.now().toString(),
        title: formData.title!,
        date: formData.date!,
        time: formData.time!,
        type: formData.type as Event['type'],
        attendees: formData.attendees || [],
        location: formData.location,
        description: formData.description,
        priority: formData.priority,
        taskId: formData.taskId
      };

      if (mode === 'create') {
        onSave?.(eventData);
      } else if (mode === 'edit') {
        onEdit?.(eventData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      setErrors({ submit: 'An error occurred while saving' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
    }
  };

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'call':
        return 'bg-green-100 text-green-800';
      case 'demo':
        return 'bg-purple-100 text-purple-800';
      case 'followup':
        return 'bg-orange-100 text-orange-800';
      case 'task':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isReadOnly = mode === 'view';

  if (showDeleteConfirm) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Event"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{event?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="danger" 
              onClick={handleDelete}
            >
              Delete Event
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Event' : mode === 'edit' ? 'Edit Event' : 'Event Details'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Actions for View Mode */}
        {mode === 'view' && event && (
          <div className="flex justify-end space-x-2 pb-4 border-b border-gray-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => {
                onEdit?.(event);
                onClose();
              }}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <Input
            label="Event Title"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
            disabled={isReadOnly}
            leftIcon={<FileText className="w-4 h-4 text-gray-400" />}
            placeholder="e.g., Product Demo with TechCorp"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date || ''}
              onChange={(e) => handleInputChange('date', e.target.value)}
              error={errors.date}
              disabled={isReadOnly}
              leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
            />

            <Input
              label="Time"
              type="time"
              value={formData.time || ''}
              onChange={(e) => handleInputChange('time', e.target.value)}
              error={errors.time}
              disabled={isReadOnly}
              leftIcon={<Clock className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Event Type"
              value={formData.type || 'meeting'}
              onChange={(e) => handleInputChange('type', e.target.value)}
              options={eventTypeOptions}
              disabled={isReadOnly}
            />

            <Input
              label="Location"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              disabled={isReadOnly}
              leftIcon={<MapPin className="w-4 h-4 text-gray-400" />}
              placeholder="e.g., Conference Room A, Zoom, Client Office"
            />
          </div>

          {formData.type === 'task' && (
            <Select
              label="Priority"
              value={formData.priority || 'medium'}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              options={priorityOptions}
              disabled={isReadOnly}
            />
          )}
        </div>

        {/* Attendees */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Attendees
          </label>
          {!isReadOnly && (
            <div className="flex space-x-2">
              <Input
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                placeholder="Add an attendee"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
              />
              <Button type="button" onClick={addAttendee} variant="outline">
                Add
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.attendees?.map((attendee) => (
              <span
                key={attendee}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full"
              >
                <User className="w-3 h-3 mr-1" />
                {attendee}
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeAttendee(attendee)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          disabled={isReadOnly}
          placeholder="Add any additional details about this event..."
        />

        {/* Event Type and Priority Badges for View Mode */}
        {mode === 'view' && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(formData.type!)}`}>
                {formData.type?.charAt(0).toUpperCase() + formData.type?.slice(1)}
              </span>
            </div>
            {formData.type === 'task' && formData.priority && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Priority:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(formData.priority)}`}>
                  {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                </span>
              </div>
            )}
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
              {mode === 'create' ? 'Create Event' : 'Update Event'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
}