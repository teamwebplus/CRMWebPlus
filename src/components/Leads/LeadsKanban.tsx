import React, { useState } from 'react';
import { Mail, Phone, Building2, User, TrendingUp, Calendar, Plus, Search, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import LeadModal from './LeadModal';
import LeadWorkflowModal from './LeadWorkflowModal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { useLeads } from '../../hooks/useLeads';
import { formatCurrency } from '../../utils/currency';
import type { Database } from '../../lib/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];

const statusColumns = [
  { id: 'new', title: 'New Leads', color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' },
  { id: 'contacted', title: 'Contacted', color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' },
  { id: 'qualified', title: 'Qualified', color: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' },
  { id: 'converted', title: 'Converted', color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' },
  { id: 'lost', title: 'Lost', color: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' }
];

export default function LeadsKanban() {
  const { leads, loading, createLead, updateLead, deleteLead } = useLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowAction, setWorkflowAction] = useState<'convert' | 'qualify' | 'lost'>('convert');
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateLead = () => {
    setSelectedLead(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLead(lead);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteLead = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this lead?')) {
      await deleteLead(leadId);
    }
  };

  const handleWorkflowAction = (lead: Lead, action: 'convert' | 'qualify' | 'lost', e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLead(lead);
    setWorkflowAction(action);
    setWorkflowModalOpen(true);
  };

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      await updateLead(leadId, { status: newStatus });
    }
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Lead['status']) => {
    e.preventDefault();
    if (draggedLead && draggedLead.status !== newStatus) {
      await handleStatusChange(draggedLead.id, newStatus);
    }
    setDraggedLead(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Input
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-gray-400" />}
          className="sm:w-80"
        />
        <Button onClick={handleCreateLead} icon={Plus}>
          Add Lead
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {statusColumns.map((column) => {
          const columnLeads = filteredLeads.filter(lead => lead.status === column.id);
          
          return (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className={`rounded-lg border-2 border-dashed ${column.color} p-4 mb-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-sm font-medium">
                    {columnLeads.length}
                  </span>
                </div>
              </div>
              
              <div 
                className="space-y-4 max-h-screen overflow-y-auto min-h-[200px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id as Lead['status'])}
              >
                {columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => handleLeadClick(lead)}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all cursor-pointer group"
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {lead.name}
                        </h4>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Building2 className="w-4 h-4 mr-1" />
                          {lead.company}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {formatCurrency(lead.value)}
                      </div>
                      {lead.assigned_to && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <User className="w-4 h-4 mr-1" />
                          <span className="truncate">{lead.assigned_to}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-600">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>Source: {lead.source}</span>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Workflow Actions */}
                      <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => handleEditLead(lead, e)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => handleDeleteLead(lead.id, e)}
                            className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                        
                        <div className="flex space-x-1">
                          {lead.status === 'new' && (
                            <button
                              onClick={(e) => handleWorkflowAction(lead, 'qualify', e)}
                              className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                              title="Qualify Lead"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </button>
                          )}
                          {(lead.status === 'qualified' || lead.status === 'contacted') && (
                            <button
                              onClick={(e) => handleWorkflowAction(lead, 'convert', e)}
                              className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                              title="Convert to Client"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {lead.status !== 'lost' && lead.status !== 'converted' && (
                            <button
                              onClick={(e) => handleWorkflowAction(lead, 'lost', e)}
                              className="text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                              title="Mark as Lost"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {columnLeads.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No leads in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lead={selectedLead}
        mode={modalMode}
        onSave={modalMode === 'create' ? createLead : (data) => updateLead(selectedLead!.id, data)}
      />

      {selectedLead && (
        <LeadWorkflowModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          lead={selectedLead}
          action={workflowAction}
          onSuccess={() => {
            // Refresh leads or show success message
            console.log('Workflow action completed');
          }}
        />
      )}
    </div>
  );
}