import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Database, Settings, Save, Play, Pause } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Modal from '../UI/Modal';

interface BackupSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  tables: string[];
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
}

interface BackupSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BackupScheduler({ isOpen, onClose }: BackupSchedulerProps) {
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<BackupSchedule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'daily' as const,
    time: '02:00',
    dayOfWeek: 0,
    dayOfMonth: 1,
    tables: [] as string[],
    enabled: true
  });

  const availableTables = [
    'users', 'profiles', 'clients', 'leads', 'opportunities',
    'activities', 'tasks', 'notes', 'documents', 'proposals',
    'invoices', 'payments'
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const dayOfWeekOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  // Mock initial schedules
  useEffect(() => {
    setSchedules([
      {
        id: '1',
        name: 'Daily Full Backup',
        frequency: 'daily',
        time: '02:00',
        tables: availableTables,
        enabled: true,
        lastRun: '2024-12-17T02:00:00Z',
        nextRun: '2024-12-18T02:00:00Z'
      },
      {
        id: '2',
        name: 'Weekly Client Data Backup',
        frequency: 'weekly',
        time: '01:00',
        dayOfWeek: 0, // Sunday
        tables: ['clients', 'leads', 'opportunities'],
        enabled: true,
        lastRun: '2024-12-15T01:00:00Z',
        nextRun: '2024-12-22T01:00:00Z'
      }
    ]);
  }, []);

  const calculateNextRun = (frequency: string, time: string, dayOfWeek?: number, dayOfMonth?: number) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    switch (frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + ((dayOfWeek! - nextRun.getDay() + 7) % 7));
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;
      case 'monthly':
        nextRun.setDate(dayOfMonth!);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
    }
    
    return nextRun.toISOString();
  };

  const handleSaveSchedule = () => {
    const nextRun = calculateNextRun(
      formData.frequency,
      formData.time,
      formData.dayOfWeek,
      formData.dayOfMonth
    );

    const schedule: BackupSchedule = {
      id: editingSchedule?.id || Date.now().toString(),
      name: formData.name,
      frequency: formData.frequency,
      time: formData.time,
      dayOfWeek: formData.frequency === 'weekly' ? formData.dayOfWeek : undefined,
      dayOfMonth: formData.frequency === 'monthly' ? formData.dayOfMonth : undefined,
      tables: formData.tables.length > 0 ? formData.tables : availableTables,
      enabled: formData.enabled,
      lastRun: editingSchedule?.lastRun,
      nextRun
    };

    if (editingSchedule) {
      setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? schedule : s));
    } else {
      setSchedules(prev => [...prev, schedule]);
    }

    setIsCreateModalOpen(false);
    setEditingSchedule(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      frequency: 'daily',
      time: '02:00',
      dayOfWeek: 0,
      dayOfMonth: 1,
      tables: [],
      enabled: true
    });
  };

  const handleEditSchedule = (schedule: BackupSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      frequency: schedule.frequency,
      time: schedule.time,
      dayOfWeek: schedule.dayOfWeek || 0,
      dayOfMonth: schedule.dayOfMonth || 1,
      tables: schedule.tables,
      enabled: schedule.enabled
    });
    setIsCreateModalOpen(true);
  };

  const toggleSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.map(s => 
      s.id === scheduleId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const deleteSchedule = (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this backup schedule?')) {
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Backup Scheduler" size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">
            Configure automated backup schedules for your database
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            icon={Calendar}
            size="sm"
          >
            Add Schedule
          </Button>
        </div>

        {/* Schedules List */}
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {schedule.name}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      schedule.enabled 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {schedule.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} at {schedule.time}
                      </span>
                      {schedule.frequency === 'weekly' && (
                        <span>on {dayOfWeekOptions.find(d => d.value === schedule.dayOfWeek)?.label}</span>
                      )}
                      {schedule.frequency === 'monthly' && (
                        <span>on day {schedule.dayOfMonth}</span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span>Tables: {schedule.tables.length} selected</span>
                      {schedule.lastRun && (
                        <span className="ml-4">
                          Last run: {new Date(schedule.lastRun).toLocaleDateString()}
                        </span>
                      )}
                      <span className="ml-4">
                        Next run: {new Date(schedule.nextRun).toLocaleDateString()} at {new Date(schedule.nextRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSchedule(schedule.id)}
                    icon={schedule.enabled ? Pause : Play}
                    title={schedule.enabled ? 'Disable' : 'Enable'}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSchedule(schedule)}
                    icon={Settings}
                    title="Edit"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSchedule(schedule.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    ×
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {schedules.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No backup schedules configured</p>
            </div>
          )}
        </div>

        {/* Create/Edit Schedule Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingSchedule(null);
            resetForm();
          }}
          title={editingSchedule ? 'Edit Backup Schedule' : 'Create Backup Schedule'}
          size="lg"
        >
          <div className="space-y-6">
            <Input
              label="Schedule Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Daily Full Backup"
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Frequency"
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                options={frequencyOptions}
              />
              
              <Input
                label="Time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
            
            {formData.frequency === 'weekly' && (
              <Select
                label="Day of Week"
                value={formData.dayOfWeek.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                options={dayOfWeekOptions.map(d => ({ value: d.value.toString(), label: d.label }))}
              />
            )}
            
            {formData.frequency === 'monthly' && (
              <Input
                label="Day of Month"
                type="number"
                min="1"
                max="31"
                value={formData.dayOfMonth}
                onChange={(e) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
              />
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tables to Backup
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, tables: availableTables }))}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, tables: [] }))}
                >
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableTables.map((table) => (
                  <label key={table} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.tables.includes(table)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, tables: [...prev.tables, table] }));
                        } else {
                          setFormData(prev => ({ ...prev, tables: prev.tables.filter(t => t !== table) }));
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{table}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable this schedule</span>
            </label>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingSchedule(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveSchedule}
                disabled={!formData.name.trim()}
                icon={Save}
              >
                {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Modal>
  );
}