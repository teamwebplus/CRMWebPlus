import React, { useState } from 'react';
import { ArrowRight, CheckCircle, XCircle, Star } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Textarea from '../UI/Textarea';
import Input from '../UI/Input';
import { useLeadWorkflow } from '../../hooks/useLeadWorkflow';
import type { Database } from '../../lib/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];

interface LeadWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  action: 'convert' | 'qualify' | 'lost';
  onSuccess: () => void;
}

export default function LeadWorkflowModal({ 
  isOpen, 
  onClose, 
  lead, 
  action, 
  onSuccess 
}: LeadWorkflowModalProps) {
  const { convertLeadToClient, qualifyLead, markLeadAsLost, loading } = useLeadWorkflow();
  const [notes, setNotes] = useState('');
  const [score, setScore] = useState(lead.score || 50);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let result;
    
    switch (action) {
      case 'convert':
        result = await convertLeadToClient(lead);
        break;
      case 'qualify':
        result = await qualifyLead(lead.id, score, notes);
        break;
      case 'lost':
        result = await markLeadAsLost(lead.id, reason);
        break;
      default:
        return;
    }

    if (result.success) {
      onSuccess();
      onClose();
    }
  };

  const getTitle = () => {
    switch (action) {
      case 'convert':
        return 'Convert Lead to Client';
      case 'qualify':
        return 'Qualify Lead';
      case 'lost':
        return 'Mark Lead as Lost';
      default:
        return 'Lead Action';
    }
  };

  const getDescription = () => {
    switch (action) {
      case 'convert':
        return `Convert ${lead.name} from ${lead.company} to a client. This will create a new client record and update the lead status.`;
      case 'qualify':
        return `Mark ${lead.name} as a qualified lead with updated scoring and notes.`;
      case 'lost':
        return `Mark ${lead.name} as lost and provide a reason for future reference.`;
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (action) {
      case 'convert':
        return <ArrowRight className="w-6 h-6 text-green-600" />;
      case 'qualify':
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      case 'lost':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  const getButtonText = () => {
    switch (action) {
      case 'convert':
        return 'Convert to Client';
      case 'qualify':
        return 'Qualify Lead';
      case 'lost':
        return 'Mark as Lost';
      default:
        return 'Submit';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{getTitle()}</h4>
            <p className="text-sm text-gray-600">{getDescription()}</p>
          </div>
        </div>

        {action === 'qualify' && (
          <>
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
                  value={score}
                  onChange={(e) => setScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span className="font-medium text-blue-600">{score}</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            <Textarea
              label="Qualification Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes about why this lead is qualified..."
              required
            />
          </>
        )}

        {action === 'lost' && (
          <Textarea
            label="Reason for Loss"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Explain why this lead was lost (e.g., budget constraints, chose competitor, timing issues)..."
            required
          />
        )}

        {action === 'convert' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-900 mb-2">What happens next:</h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• A new client record will be created</li>
              <li>• Lead status will be updated to "Converted"</li>
              <li>• An activity will be logged for tracking</li>
              <li>• All lead data will be transferred to the client</li>
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={loading}
            variant={action === 'lost' ? 'danger' : 'primary'}
          >
            {getButtonText()}
          </Button>
        </div>
      </form>
    </Modal>
  );
}