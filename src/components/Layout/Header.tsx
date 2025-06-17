import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import UniversalSearch from './UniversalSearch';
import NotificationPanel from './NotificationPanel';
import UserProfile from './UserProfile';
import ThemeToggle from '../UI/ThemeToggle';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onNavigate?: (section: string, id?: string) => void;
}

export default function Header({ title, subtitle, onNavigate }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchResultClick = (type: string, id: string) => {
    if (onNavigate) {
      onNavigate(type === 'client' ? 'clients' : type === 'lead' ? 'leads' : type === 'opportunity' ? 'opportunities' : 'tasks', id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <UniversalSearch onResultClick={handleSearchResultClick} />
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              )}
            </div>

            <UserProfile onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
}