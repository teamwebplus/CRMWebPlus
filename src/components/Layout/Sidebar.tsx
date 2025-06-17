import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  TrendingUp, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Activity,
  UserCog,
  Database,
  TestTube
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'leads', label: 'Leads', icon: Target },
  { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'users', label: 'Users', icon: UserCog },
  { id: 'backup', label: 'Backup', icon: Database },
  { id: 'testing', label: 'Testing', icon: TestTube },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeSection, onSectionChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col h-full`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">ModernCRM</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <img
              src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">John Smith</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sales Manager</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}