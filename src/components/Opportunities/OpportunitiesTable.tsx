import React, { useState, useMemo } from 'react';
import { User, Calendar, TrendingUp, DollarSign, Target, Search, Download, Plus, Edit, Eye, Trash2 } from 'lucide-react';
import OpportunityModal from './OpportunityModal';
import OpportunityTestButton from './OpportunityTestButton';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import { useOpportunities } from '../../hooks/useOpportunities';
import { formatCurrency } from '../../utils/currency';
import type { Database } from '../../lib/supabase';

type Opportunity = Database['public']['Tables']['opportunities']['Row'];

export default function OpportunitiesTable() {
  const { opportunities, loading, createOpportunity, updateOpportunity, deleteOpportunity } = useOpportunities();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Opportunity>('expected_close_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);

  const filteredAndSortedOpportunities = useMemo(() => {
    let filtered = opportunities.filter(opportunity => {
      const matchesSearch = 
        opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = !stageFilter || opportunity.stage === stageFilter;
      
      return matchesSearch && matchesStage;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [opportunities, searchTerm, stageFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Opportunity) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateOpportunity = () => {
    setSelectedOpportunity(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      await deleteOpportunity(opportunityId);
    }
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Stage', 'Value', 'Probability', 'Expected Close', 'Assigned To'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedOpportunities.map(opp => [
        opp.title,
        opp.stage,
        opp.value,
        opp.probability,
        new Date(opp.expected_close_date).toLocaleDateString(),
        opp.assigned_to || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'opportunities.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    if (probability >= 25) return 'text-orange-600';
    return 'text-red-600';
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
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            className="sm:w-80"
          />
          <Select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            options={[
              { value: '', label: 'All Stages' },
              { value: 'prospecting', label: 'Prospecting' },
              { value: 'qualification', label: 'Qualification' },
              { value: 'proposal', label: 'Proposal' },
              { value: 'negotiation', label: 'Negotiation' },
              { value: 'closed-won', label: 'Closed Won' },
              { value: 'closed-lost', label: 'Closed Lost' }
            ]}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowTestPanel(!showTestPanel)} 
            size="sm"
          >
            {showTestPanel ? 'Hide Test' : 'Show Test'}
          </Button>
          <Button variant="outline" onClick={exportToCSV} icon={Download}>
            Export
          </Button>
          <Button onClick={handleCreateOpportunity} icon={Plus}>
            Add Opportunity
          </Button>
        </div>
      </div>

      {/* Test Panel */}
      {showTestPanel && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">🧪 CRUD Testing Panel</h3>
              <p className="text-xs text-yellow-700 mb-3">
                Use this panel to test the Create, Read, Update, Delete functionality for opportunities.
                The test will create a new opportunity using the first available client.
              </p>
            </div>
            <OpportunityTestButton />
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredAndSortedOpportunities.length} of {opportunities.length} opportunities
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Opportunity</span>
                    {sortField === 'title' && (
                      <span className="text-primary-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('stage')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Stage</span>
                    {sortField === 'stage' && (
                      <span className="text-primary-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Value</span>
                    {sortField === 'value' && (
                      <span className="text-primary-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probability
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('expected_close_date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Expected Close</span>
                    {sortField === 'expected_close_date' && (
                      <span className="text-primary-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedOpportunities.map((opportunity) => (
                <tr 
                  key={opportunity.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewOpportunity(opportunity)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{opportunity.title}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {opportunity.description.substring(0, 50)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(opportunity.stage)}`}>
                      {opportunity.stage.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                      {formatCurrency(opportunity.value)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Target className={`w-4 h-4 mr-2 ${getProbabilityColor(opportunity.probability)}`} />
                      <span className={`text-sm font-medium ${getProbabilityColor(opportunity.probability)}`}>
                        {opportunity.probability}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(opportunity.expected_close_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      {opportunity.assigned_to || 'Unassigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewOpportunity(opportunity);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="View Opportunity"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOpportunity(opportunity);
                        }}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit Opportunity"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOpportunity(opportunity.id);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Opportunity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedOpportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm || stageFilter ? 'No opportunities match your filters' : 'No opportunities found'}
            </div>
            {!searchTerm && !stageFilter && (
              <Button onClick={handleCreateOpportunity} className="mt-4" icon={Plus}>
                Add Your First Opportunity
              </Button>
            )}
          </div>
        )}
      </div>

      <OpportunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        opportunity={selectedOpportunity}
        mode={modalMode}
        onSave={modalMode === 'create' ? createOpportunity : (data) => updateOpportunity(selectedOpportunity!.id, data)}
        onEdit={handleEditOpportunity}
        onDelete={handleDeleteOpportunity}
      />
    </div>
  );
}