import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Users, MapPin, Calendar as CalendarIcon, Edit, Trash2 } from 'lucide-react';
import EventModal from './EventModal';
import Button from '../UI/Button';
import { useTasks } from '../../hooks/useTasks';
import type { Database } from '../../lib/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];

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

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Product Demo - TechCorp',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'demo',
    attendees: ['Sarah Johnson', 'John Smith'],
    location: 'Conference Room A',
    description: 'Demonstrate our latest CRM features to TechCorp team'
  },
  {
    id: '2',
    title: 'Follow-up Call - StartupFlow',
    date: new Date().toISOString().split('T')[0],
    time: '11:30',
    type: 'followup',
    attendees: ['Michael Chen'],
    description: 'Follow up on proposal discussion'
  },
  {
    id: '3',
    title: 'Client Meeting - Global Retail',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    type: 'meeting',
    attendees: ['Emily Rodriguez', 'Team'],
    location: 'Zoom',
    description: 'Quarterly business review meeting'
  },
  {
    id: '4',
    title: 'Discovery Call - NewTech',
    date: new Date().toISOString().split('T')[0],
    time: '16:00',
    type: 'call',
    attendees: ['Alex Parker'],
    description: 'Initial discovery call to understand requirements'
  }
];

export default function CalendarView() {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [allEvents, setAllEvents] = useState<Event[]>(mockEvents);
  
  // Convert tasks to calendar events
  useEffect(() => {
    const taskEvents: Event[] = tasks.map(task => ({
      id: `task-${task.id}`,
      title: task.title,
      date: new Date(task.due_date).toISOString().split('T')[0],
      time: new Date(task.due_date).toTimeString().slice(0, 5),
      type: 'task',
      attendees: [],
      description: task.description,
      priority: task.priority,
      taskId: task.id
    }));

    setAllEvents([...mockEvents, ...taskEvents]);
  }, [tasks]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleCreateEvent = (date?: string) => {
    setSelectedEvent(undefined);
    setSelectedDate(date || new Date().toISOString().split('T')[0]);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Event) => {
    if (modalMode === 'create') {
      setAllEvents(prev => [...prev, eventData]);
    } else if (modalMode === 'edit') {
      setAllEvents(prev => prev.map(e => e.id === eventData.id ? eventData : e));
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setAllEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);
  const today = new Date();
  
  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    return allEvents.filter(event => event.date === dateStr);
  };

  const getEventTypeColor = (event: Event) => {
    if (event.type === 'task') {
      switch (event.priority) {
        case 'high':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'medium':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low':
          return 'bg-green-100 text-green-800 border-green-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }

    switch (event.type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'call':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'demo':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'followup':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const todaysEvents = getEventsForDate(today.getDate());

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <Button onClick={() => handleCreateEvent()} icon={Plus}>
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const dateStr = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                  .toISOString().split('T')[0] : '';
                
                return (
                  <div
                    key={index}
                    className={`p-2 min-h-[100px] border border-gray-100 rounded-lg transition-colors ${
                      day ? 'hover:bg-gray-50 cursor-pointer' : ''
                    } ${isToday(day) ? 'bg-primary-50 border-primary-200' : ''}`}
                    onClick={() => day && handleCreateEvent(dateStr)}
                  >
                    {day && (
                      <div>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday(day) ? 'text-primary-600' : 'text-gray-900'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-shadow group ${getEventTypeColor(event)}`}
                            >
                              <div className="font-medium truncate">
                                {event.type === 'task' ? '📋 ' : ''}
                                {event.title}
                              </div>
                              <div className="flex items-center text-xs opacity-75">
                                <Clock className="w-3 h-3 mr-1" />
                                {event.time}
                              </div>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Today's Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Today's Events
          </h3>
          <div className="space-y-4">
            {todaysEvents.length > 0 ? (
              todaysEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={`p-4 rounded-lg border cursor-pointer hover:shadow-sm transition-all group ${getEventTypeColor(event)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">
                      {event.type === 'task' ? '📋 ' : ''}
                      {event.title}
                    </h4>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                        className="text-xs p-1 hover:bg-white/50 rounded"
                        title="Edit Event"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this event?')) {
                            handleDeleteEvent(event.id);
                          }
                        }}
                        className="text-xs p-1 hover:bg-white/50 rounded"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs opacity-75 mb-2">
                    <Clock className="w-3 h-3 mr-1" />
                    {event.time}
                  </div>
                  
                  <div className="space-y-1">
                    {event.attendees.length > 0 && (
                      <div className="flex items-center text-xs opacity-75">
                        <Users className="w-3 h-3 mr-1" />
                        {event.attendees.join(', ')}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center text-xs opacity-75">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location}
                      </div>
                    )}
                    {event.priority && event.type === 'task' && (
                      <div className="text-xs opacity-75">
                        Priority: {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No events scheduled for today</p>
                <Button 
                  onClick={() => handleCreateEvent()} 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                >
                  Schedule Event
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        mode={modalMode}
        selectedDate={selectedDate}
        onSave={handleSaveEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}