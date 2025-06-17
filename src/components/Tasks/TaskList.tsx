import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Flag, CheckCircle, Edit, Trash2, Eye, Search, Filter, Download, Plus, User } from 'lucide-react';
import TaskModal from './TaskModal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import { useTasks } from '../../hooks/useTasks';
import type { Database } from '../../lib/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];

export default function TaskList() {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Task>('due_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      return 0;
    });

    return filtered;
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(task.id, { status: newStatus });
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'Created'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedTasks.map(task => [
        task.title,
        task.description,
        task.status,
        task.priority,
        new Date(task.due_date).toLocaleDateString(),
        new Date(task.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority: Task['priority']) => {
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

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
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
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            className="sm:w-80"
          />
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' }
              ]}
            />
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
              ]}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} icon={Download}>
            Export
          </Button>
          <Button onClick={handleCreateTask} icon={Plus}>
            Add Task
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedTasks.map((task) => {
          const { date, time } = formatDateTime(task.due_date);
          const overdue = isOverdue(task.due_date);
          
          return (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                task.status === 'completed' 
                  ? 'bg-green-50 border-green-200' 
                  : overdue 
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200'
              }`}
              onClick={() => handleViewTask(task)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 flex-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(task);
                    }}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                  </button>
                  <h3 className={`font-medium text-sm ${
                    task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTask(task);
                    }}
                    className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                    title="Edit Task"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
              )}

              <div className="space-y-2">
                <div className={`flex items-center text-xs ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {date} at {time}
                  {overdue && task.status !== 'completed' && (
                    <span className="ml-1 font-medium">(Overdue)</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                    <Flag className="w-3 h-3 mr-1" />
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAndSortedTasks.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <div className="text-gray-500">
            {searchTerm || statusFilter || priorityFilter ? 'No tasks match your filters' : 'No tasks found'}
          </div>
          {!searchTerm && !statusFilter && !priorityFilter && (
            <Button onClick={handleCreateTask} className="mt-4" icon={Plus}>
              Create Your First Task
            </Button>
          )}
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        mode={modalMode}
        onSave={modalMode === 'create' ? createTask : (data) => updateTask(selectedTask!.id, data)}
      />
    </div>
  );
}