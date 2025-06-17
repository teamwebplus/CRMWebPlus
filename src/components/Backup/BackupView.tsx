import React, { useState, useEffect } from 'react';
import { Download, Upload, Database, Clock, Shield, AlertTriangle, CheckCircle, RefreshCw, Trash2, Eye } from 'lucide-react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Select from '../UI/Select';
import { useBackup } from '../../hooks/useBackup';
import { formatFileSize, formatDateTime } from '../../utils/format';

interface BackupFile {
  id: string;
  name: string;
  size: number;
  created_at: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'in_progress' | 'failed';
  tables_included: string[];
  description?: string;
}

export default function BackupView() {
  const { 
    backups, 
    loading, 
    createBackup, 
    restoreBackup, 
    deleteBackup, 
    downloadBackup,
    getBackupStatus 
  } = useBackup();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupFile | null>(null);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);

  const availableTables = [
    'users',
    'profiles', 
    'clients',
    'leads',
    'opportunities',
    'activities',
    'tasks',
    'notes',
    'documents',
    'proposals',
    'invoices',
    'payments'
  ];

  const handleCreateBackup = async () => {
    if (!backupName.trim()) return;
    
    setBackupInProgress(true);
    try {
      await createBackup({
        name: backupName,
        description: backupDescription,
        tables: selectedTables.length > 0 ? selectedTables : availableTables,
        type: 'manual'
      });
      setIsCreateModalOpen(false);
      setBackupName('');
      setBackupDescription('');
      setSelectedTables([]);
    } catch (error) {
      console.error('Backup creation failed:', error);
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreFile && !selectedBackup) return;
    
    setRestoreInProgress(true);
    try {
      if (restoreFile) {
        await restoreBackup({ file: restoreFile });
      } else if (selectedBackup) {
        await restoreBackup({ backupId: selectedBackup.id });
      }
      setIsRestoreModalOpen(false);
      setRestoreFile(null);
      setSelectedBackup(null);
    } catch (error) {
      console.error('Restore failed:', error);
    } finally {
      setRestoreInProgress(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      await deleteBackup(backupId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Database Backup</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage database backups and restore points</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsRestoreModalOpen(true)}
            icon={Upload}
          >
            Restore
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            icon={Database}
          >
            Create Backup
          </Button>
        </div>
      </div>

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Backups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{backups.length}</p>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {backups.filter(b => b.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Size</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatFileSize(backups.reduce((sum, b) => sum + b.size, 0))}
              </p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Backup</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {backups.length > 0 ? formatDateTime(backups[0].created_at).date : 'Never'}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Backup List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Backup History</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : backups.length > 0 ? (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(backup.status)}`}>
                      {getStatusIcon(backup.status)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{backup.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatDateTime(backup.created_at).date}</span>
                        <span>{formatFileSize(backup.size)}</span>
                        <span className="capitalize">{backup.type}</span>
                        <span>{backup.tables_included.length} tables</span>
                      </div>
                      {backup.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{backup.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadBackup(backup.id)}
                      icon={Download}
                      title="Download Backup"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedBackup(backup);
                        setIsRestoreModalOpen(true);
                      }}
                      icon={Upload}
                      title="Restore from Backup"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBackup(backup.id)}
                      icon={Trash2}
                      title="Delete Backup"
                      className="text-red-600 hover:text-red-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No backups found</p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="mt-4"
                icon={Database}
              >
                Create Your First Backup
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Backup Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Database Backup"
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="Backup Name"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            placeholder="e.g., Pre-migration backup"
            required
          />
          
          <Input
            label="Description (Optional)"
            value={backupDescription}
            onChange={(e) => setBackupDescription(e.target.value)}
            placeholder="Describe the purpose of this backup"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tables to Include
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedTables(availableTables)}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedTables([])}
              >
                Clear All
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {availableTables.map((table) => (
                <label key={table} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTables.includes(table)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTables([...selectedTables, table]);
                      } else {
                        setSelectedTables(selectedTables.filter(t => t !== table));
                      }
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{table}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateBackup}
              loading={backupInProgress}
              disabled={!backupName.trim()}
            >
              Create Backup
            </Button>
          </div>
        </div>
      </Modal>

      {/* Restore Modal */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Restore Database"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Warning</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Restoring a backup will overwrite all current data. This action cannot be undone.
                  Make sure to create a backup of the current state before proceeding.
                </p>
              </div>
            </div>
          </div>
          
          {selectedBackup ? (
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white">Selected Backup</h4>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Name:</strong> {selectedBackup.name}</p>
                <p><strong>Created:</strong> {formatDateTime(selectedBackup.created_at).date}</p>
                <p><strong>Size:</strong> {formatFileSize(selectedBackup.size)}</p>
                <p><strong>Tables:</strong> {selectedBackup.tables_included.join(', ')}</p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Backup File
              </label>
              <input
                type="file"
                accept=".sql,.backup"
                onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsRestoreModalOpen(false);
                setSelectedBackup(null);
                setRestoreFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleRestoreBackup}
              loading={restoreInProgress}
              disabled={!selectedBackup && !restoreFile}
            >
              Restore Database
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}