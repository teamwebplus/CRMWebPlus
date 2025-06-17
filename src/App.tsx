import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { CRMProvider } from './context/CRMContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthForm from './components/Auth/AuthForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import StatsCard from './components/Dashboard/StatsCard';
import RevenueChart from './components/Dashboard/RevenueChart';
import PipelineChart from './components/Dashboard/PipelineChart';
import RecentActivity from './components/Dashboard/RecentActivity';
import ClientsTable from './components/Clients/ClientsTable';
import LeadsKanban from './components/Leads/LeadsKanban';
import OpportunitiesTable from './components/Opportunities/OpportunitiesTable';
import CalendarView from './components/Calendar/CalendarView';
import ReportsView from './components/Reports/ReportsView';
import TaskList from './components/Tasks/TaskList';
import ActivitiesView from './components/Activities/ActivitiesView';
import SettingsView from './components/Settings/SettingsView';
import DocumentsView from './components/Documents/DocumentsView';
import UsersView from './components/Users/UsersView';
import BackupView from './components/Backup/BackupView';
import CRUDTestView from './components/Testing/CRUDTestView';
import { Users, Target, TrendingUp, DollarSign } from 'lucide-react';
import { useDashboardStats } from './hooks/useDashboardStats';

function AppContent() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { stats, loading: statsLoading } = useDashboardStats();

  const handleNavigate = (section: string, id?: string) => {
    setActiveSection(section);
    // If an ID is provided, you could scroll to or highlight that specific item
    if (id) {
      console.log(`Navigating to ${section} with ID: ${id}`);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Clients"
                value={statsLoading ? '...' : stats.totalClients.toString()}
                change="+12.3%"
                changeType="positive"
                icon={Users}
                color="blue"
              />
              <StatsCard
                title="Active Leads"
                value={statsLoading ? '...' : stats.totalLeads.toString()}
                change="+8.7%"
                changeType="positive"
                icon={Target}
                color="green"
              />
              <StatsCard
                title="Opportunities"
                value={statsLoading ? '...' : stats.totalOpportunities.toString()}
                change="+5.2%"
                changeType="positive"
                icon={TrendingUp}
                color="purple"
              />
              <StatsCard
                title="Total Revenue"
                value={statsLoading ? '...' : `₱${(stats.totalRevenue / 1000000).toFixed(1)}M`}
                change="+15.3%"
                changeType="positive"
                icon={DollarSign}
                color="orange"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart />
              <PipelineChart />
            </div>

            {/* Recent Activity */}
            <RecentActivity onViewAll={() => setActiveSection('activities')} />
          </div>
        );
      
      case 'clients':
        return <ClientsTable />;
      
      case 'leads':
        return <LeadsKanban />;
      
      case 'opportunities':
        return <OpportunitiesTable />;
      
      case 'tasks':
        return <TaskList />;
      
      case 'calendar':
        return <CalendarView />;
      
      case 'reports':
        return <ReportsView />;
      
      case 'activities':
        return <ActivitiesView />;
      
      case 'documents':
        return <DocumentsView />;
      
      case 'users':
        return <UsersView />;
      
      case 'backup':
        return <BackupView />;
      
      case 'testing':
        return <CRUDTestView />;
      
      case 'settings':
        return <SettingsView />;
      
      default:
        return <div>Section not found</div>;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return 'Dashboard';
      case 'clients':
        return 'Clients';
      case 'leads':
        return 'Leads';
      case 'opportunities':
        return 'Opportunities';
      case 'tasks':
        return 'Tasks';
      case 'calendar':
        return 'Calendar';
      case 'reports':
        return 'Reports';
      case 'activities':
        return 'Activities';
      case 'documents':
        return 'Documents';
      case 'users':
        return 'User Management';
      case 'backup':
        return 'Database Backup';
      case 'testing':
        return 'CRUD Testing';
      case 'settings':
        return 'Settings';
      default:
        return 'ModernCRM';
    }
  };

  const getSectionSubtitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return 'Overview of your sales performance and key metrics';
      case 'clients':
        return 'Manage your client relationships and contact information';
      case 'leads':
        return 'Track and nurture potential customers through your sales pipeline';
      case 'opportunities':
        return 'Monitor and manage your sales opportunities';
      case 'tasks':
        return 'Organize and track your tasks and to-dos';
      case 'calendar':
        return 'Schedule and manage your appointments and meetings';
      case 'reports':
        return 'Analyze your sales performance and business metrics';
      case 'activities':
        return 'Track all interactions and activities with your contacts';
      case 'documents':
        return 'Store and manage your business documents';
      case 'users':
        return 'Manage user accounts, roles, and permissions';
      case 'backup':
        return 'Create and manage database backups for data protection';
      case 'testing':
        return 'Test all CRUD operations across CRM modules';
      case 'settings':
        return 'Configure your CRM settings and preferences';
      default:
        return '';
    }
  };

  return (
    <CRMProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title={getSectionTitle()}
            subtitle={getSectionSubtitle()}
            onNavigate={handleNavigate}
          />
          
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </CRMProvider>
  );
}

function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <AuthForm 
          mode={authMode} 
          onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;