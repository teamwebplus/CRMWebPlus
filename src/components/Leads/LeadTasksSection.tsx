import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Flag, CheckCircle, Edit, Trash2 } from 'lucide-react';
import Button from '../UI/Button';
import TaskModal from '../Tasks/TaskModal';
import { useTasks } from '../../hooks/useTasks';
import type { Database } from '../../lib/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];

interface LeadTasksSectionProps {
  leadId: string;
  leadName: string;
}

export default function LeadTasksSection({ leadId, leadName }: LeadTasksSectionProps) {
  const { tasks, createTask, updateTask, deleteTask } = useTasks();
  const [leadTasks, setLeadTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLeadTasks(tasks.filter(task => task.lead_id === leadId));
  }, [tasks, leadId]);

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

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
        <Button onClick={handleCreateTask} size="sm" icon={Plus}>
          Add Task
        </Button>
      </div>

      <div className="space-y-3">
        {leadTasks.length > 0 ? (
          leadTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                task.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {task.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                    </button>
                    <h4
                      className={`font-medium cursor-pointer hover:text-primary-600 ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                      onClick={() => handleViewTask(task)}
                    >
                      {task.title}
                    </h4>
                    <Flag className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className={`flex items-center ${isOverdue(task.due_date) ? 'text-red-600' : ''}`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(task.due_date).toLocaleDateString()} at{' '}
                      {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isOverdue(task.due_date) && ' (Overdue)'}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit Task"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No tasks for this lead</p>
            <Button onClick={handleCreateTask} variant="outline" size="sm" className="mt-3">
              Create First Task
            </Button>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        mode={modalMode}
        leadId={leadId}
        onSave={modalMode === 'create' ? createTask : (data) => updateTask(selectedTask!.id, data)}
      />
    </div>
  );
}