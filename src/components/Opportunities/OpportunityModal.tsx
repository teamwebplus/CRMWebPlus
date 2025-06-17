import React, { useState, useEffect } from 'react';
import { Target, Building2, DollarSign, Calendar, User, FileText, Users, Zap, Edit, Trash2 } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Textarea from '../UI/Textarea';
import { useClients } from '../../hooks/useClients';
import { useUsers } from '../../hooks/useUsers';
import type { Database } from '../../lib/supabase';

type Opportunity = Database['public']['Tables']['opportunities']['Row'];
type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert'];
type OpportunityUpdate = Database['public']['Tables']['opportunities']['Update'];

interface OpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity?: Opportunity;
  mode: 'create' | 'edit' | 'view';
  onSave: (data: OpportunityInsert | OpportunityUpdate) => Promise<{ data: any; error: string | null }>;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunityId: string) => void;
}

const stageOptions = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed-won', label: 'Closed Won' },
  { value: 'closed-lost', label: 'Closed Lost' }
];

export default function OpportunityModal({ 
  isOpen, 
  onClose, 
  opportunity, 
  mode, 
  onSave, 
  onEdit, 
  onDelete 
}: OpportunityModalProps) {
  const { clients } = useClients();
  const { users } = useUsers();
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    title: '',
    client_id: '',
    value: 0,
    stage: 'prospecting',
    probability: 25,
    expected_close_date: '',
    assigned_to: '',
    description: '',
    products: [],
    competitors: [],
    next_steps: ''
  });
  const [productInput, setProductInput] = useState('');
  const [competitorInput, setCompetitorInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const clientOptions = clients.map(client => ({
    value: client.id,
    label: `${client.name} - ${client.company}`
  }));

  const userOptions = users.map(user => ({
    value: user.name, // Using name instead of ID for simplicity
    label: `${user.name} (${user.role})`
  }));

  useEffect(() => {
    if (opportunity) {
      // Format the date for the date input
      const formattedDate = opportunity.expected_close_date ? 
        new Date(opportunity.expected_close_date).toISOString().split('T')[0] : '';
      
      setFormData({
        ...opportunity,
        expected_close_date: formattedDate
      });
    } else {
      // Set default expected close date to 30 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      const formattedDefaultDate = defaultDate.toISOString().split('T')[0];
      
      setFormData({
        title: '',
        client_id: '',
        value: 0,
        stage: 'prospecting',
        probability: 25,
        expected_close_date: formattedDefaultDate,
        assigned_to: '',
        description: '',
        products: [],
        competitors: [],
        next_steps: ''
      });
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [opportunity, isOpen]);

  const handleInputChange = (field: keyof Opportunity, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-update probability based on stage
      if (field === 'stage') {
        const probabilityMap = {
          'prospecting': 25,
          'qualification': 40,
          'proposal': 60,
          'negotiation': 80,
          'closed-won': 100,
          'closed-lost': 0
        };
        updated.probability = probabilityMap[value as keyof typeof probabilityMap] || 25;
      }
      
      return updated;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addProduct = () => {
    if (productInput.trim() && !formData.products?.includes(productInput.trim())) {
      setFormData(prev => ({
        ...prev,
        products: [...(prev.products || []), productInput.trim()]
      }));
      setProductInput('');
    }
  };

  const removeProduct = (productToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products?.filter(product => product !== productToRemove) || []
    }));
  };

  const addCompetitor = () => {
    if (competitorInput.trim() && !formData.competitors?.includes(competitorInput.trim())) {
      setFormData(prev => ({
        ...prev,
        competitors: [...(prev.competitors || []), competitorInput.trim()]
      }));
      setCompetitorInput('');
    }
  };

  const removeCompetitor = (competitorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors?.filter(competitor => competitor !== competitorToRemove) || []
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.client_id?.trim()) {
      newErrors.client_id = 'Client is required';
    }
    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0';
    }
    if (!formData.expected_close_date?.trim()) {
      newErrors.expected_close_date = 'Expected close date is required';
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
      const opportunityData = {
        title: formData.title!.trim(),
        client_id: formData.client_id!,
        value: Number(formData.value!),
        stage: formData.stage as Opportunity['stage'],
        probability: Number(formData.probability!),
        expected_close_date: formData.expected_close_date!,
        assigned_to: formData.assigned_to || null,
        description: formData.description!.trim(),
        products: formData.products || [],
        competitors: formData.competitors || [],
        next_steps: formData.next_steps || ''
      };

      const { error } = await onSave(opportunityData);
      
      if (!error) {
        onClose();
      } else {
        setErrors({ submit: error });
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
      setErrors({ submit: 'An error occurred while saving' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (opportunity && onDelete) {
      onDelete(opportunity.id);
      onClose();
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    if (probability >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStageColor = (stage: Opportunity['stage']) => {
    switch (stage) {
      case 'prospecting':
        return 'bg-blue-100 text-blue-800';
      case 'qualification':
        return 'bg-yellow-100 text-yellow-800';
      case 'proposal':
        return 'bg-purple-100 text-purple-800';
      case 'negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'closed-won':
        return 'bg-green-100 text-green-800';
      case 'closed-lost':
        return 'bg-red-100 text-red-800';
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
        title="Delete Opportunity"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{opportunity?.title}"? This action cannot be undone.
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
              Delete Opportunity
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
      title={mode === 'create' ? 'Add New Opportunity' : mode === 'edit' ? 'Edit Opportunity' : 'Opportunity Details'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Actions for View Mode */}
        {mode === 'view' && opportunity && (
          <div className="flex justify-end space-x-2 pb-4 border-b border-gray-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => {
                onEdit?.(opportunity);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Opportunity Details
            </h4>
            
            <Input
              label="Opportunity Title"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={errors.title}
              disabled={isReadOnly}
              leftIcon={<Target className="w-4 h-4 text-gray-400" />}
              placeholder="e.g., Enterprise CRM Implementation"
            />

            <Select
              label="Client"
              value={formData.client_id || ''}
              onChange={(e) => handleInputChange('client_id', e.target.value)}
              options={[{ value: '', label: 'Select Client' }, ...clientOptions]}
              error={errors.client_id}
              disabled={isReadOnly}
            />

            <Input
              label="Opportunity Value"
              type="number"
              value={formData.value || ''}
              onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
              error={errors.value}
              disabled={isReadOnly}
              leftIcon={<DollarSign className="w-4 h-4 text-gray-400" />}
              placeholder="0"
              min="0"
              step="0.01"
            />

            <Input
              label="Expected Close Date"
              type="date"
              value={formData.expected_close_date || ''}
              onChange={(e) => handleInputChange('expected_close_date', e.target.value)}
              error={errors.expected_close_date}
              disabled={isReadOnly}
              leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
            />
          </div>

          {/* Sales Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Sales Information
            </h4>

            <Select
              label="Stage"
              value={formData.stage || 'prospecting'}
              onChange={(e) => handleInputChange('stage', e.target.value)}
              options={stageOptions}
              disabled={isReadOnly}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Probability
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.probability || 25}
                  onChange={(e) => handleInputChange('probability', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span className={`font-medium ${getProbabilityColor(formData.probability || 25)}`}>
                    {formData.probability || 25}%
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <Select
              label="Assigned To"
              value={formData.assigned_to || ''}
              onChange={(e) => handleInputChange('assigned_to', e.target.value)}
              options={[{ value: '', label: 'Select User' }, ...userOptions]}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          error={errors.description}
          disabled={isReadOnly}
          placeholder="Describe the opportunity, requirements, and key details..."
        />

        {/* Products */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Products/Services
          </label>
          {!isReadOnly && (
            <div className="flex space-x-2">
              <Input
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                placeholder="Add a product or service"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
              />
              <Button type="button" onClick={addProduct} variant="outline">
                Add
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.products?.map((product) => (
              <span
                key={product}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                {product}
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeProduct(product)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Competitors */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Competitors
          </label>
          {!isReadOnly && (
            <div className="flex space-x-2">
              <Input
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                placeholder="Add a competitor"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
              />
              <Button type="button" onClick={addCompetitor} variant="outline">
                Add
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.competitors?.map((competitor) => (
              <span
                key={competitor}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
              >
                {competitor}
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeCompetitor(competitor)}
                    className="ml-1 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <Textarea
          label="Next Steps"
          value={formData.next_steps || ''}
          onChange={(e) => handleInputChange('next_steps', e.target.value)}
          rows={3}
          disabled={isReadOnly}
          placeholder="What are the next steps to move this opportunity forward?"
        />

        {/* Stage and Probability Badges for View Mode */}
        {mode === 'view' && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Stage:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(formData.stage!)}`}>
                {formData.stage?.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Probability:</span>
              <span className={`font-medium ${getProbabilityColor(formData.probability || 0)}`}>
                {formData.probability}%
              </span>
            </div>
            {formData.assigned_to && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Assigned to:</span>
                <span className="text-sm text-gray-600">{formData.assigned_to}</span>
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
              {mode === 'create' ? 'Create Opportunity' : 'Update Opportunity'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
}