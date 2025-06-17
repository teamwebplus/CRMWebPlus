import { Client, Lead, Opportunity, Activity, DashboardStats } from '../types';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Solutions',
    status: 'customer',
    value: 125000,
    createdAt: '2024-01-15',
    lastContact: '2024-12-01',
    tags: ['enterprise', 'tech'],
    notes: 'Key decision maker for enterprise solutions. Very interested in our premium package.',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@startup.io',
    phone: '+1 (555) 234-5678',
    company: 'StartupFlow Inc',
    status: 'prospect',
    value: 45000,
    createdAt: '2024-02-20',
    lastContact: '2024-11-28',
    tags: ['startup', 'saas'],
    notes: 'Growing startup looking for scalable solutions. Budget conscious but high potential.',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@retail.com',
    phone: '+1 (555) 345-6789',
    company: 'Global Retail Corp',
    status: 'lead',
    value: 89000,
    createdAt: '2024-03-10',
    lastContact: '2024-11-30',
    tags: ['retail', 'enterprise'],
    notes: 'Interested in our CRM solution for their retail operations. Multiple locations to consider.',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'david.thompson@consulting.com',
    phone: '+1 (555) 456-7890',
    company: 'Thompson Consulting',
    status: 'customer',
    value: 67000,
    createdAt: '2024-01-05',
    lastContact: '2024-12-02',
    tags: ['consulting', 'professional'],
    notes: 'Long-term client with multiple projects. Reliable payment history.',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '5',
    name: 'Lisa Wang',
    email: 'lisa.wang@fintech.com',
    phone: '+1 (555) 567-8901',
    company: 'FinTech Innovations',
    status: 'prospect',
    value: 156000,
    createdAt: '2024-02-28',
    lastContact: '2024-11-29',
    tags: ['fintech', 'enterprise'],
    notes: 'High-value prospect in fintech space. Requires compliance-focused solution.',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
];

export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Alex Parker',
    email: 'alex.parker@newtech.com',
    phone: '+1 (555) 111-2222',
    company: 'NewTech Ventures',
    source: 'Website',
    status: 'new',
    score: 85,
    value: 75000,
    createdAt: '2024-12-01',
    assignedTo: 'John Smith',
    notes: 'Downloaded our whitepaper and requested demo'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria.garcia@healthtech.com',
    phone: '+1 (555) 222-3333',
    company: 'HealthTech Solutions',
    source: 'Referral',
    status: 'contacted',
    score: 92,
    value: 120000,
    createdAt: '2024-11-28',
    assignedTo: 'Sarah Wilson',
    notes: 'Referred by existing client. Very interested in enterprise package'
  },
  {
    id: '3',
    name: 'Robert Kim',
    email: 'robert.kim@ecommerce.com',
    phone: '+1 (555) 333-4444',
    company: 'E-Commerce Plus',
    source: 'LinkedIn',
    status: 'qualified',
    score: 78,
    value: 55000,
    createdAt: '2024-11-25',
    assignedTo: 'Mike Johnson',
    notes: 'Qualified lead with clear use case and budget'
  },
  {
    id: '4',
    name: 'Jennifer Lee',
    email: 'jennifer.lee@manufacturing.com',
    phone: '+1 (555) 444-5555',
    company: 'Advanced Manufacturing',
    source: 'Trade Show',
    status: 'new',
    score: 65,
    value: 95000,
    createdAt: '2024-12-02',
    assignedTo: 'Tom Davis',
    notes: 'Met at industry trade show. Interested in integration capabilities'
  },
  {
    id: '5',
    name: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@logistics.com',
    phone: '+1 (555) 555-6666',
    company: 'Global Logistics Inc',
    source: 'Google Ads',
    status: 'contacted',
    score: 73,
    value: 67000,
    createdAt: '2024-11-30',
    assignedTo: 'Lisa Brown',
    notes: 'Responded to our ad campaign. Looking for supply chain solution'
  }
];

export const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Enterprise CRM Implementation',
    clientId: '1',
    clientName: 'TechCorp Solutions',
    value: 125000,
    stage: 'negotiation',
    probability: 80,
    expectedCloseDate: '2024-12-15',
    createdAt: '2024-11-01',
    assignedTo: 'John Smith',
    description: 'Full enterprise CRM implementation with custom integrations'
  },
  {
    id: '2',
    title: 'Startup Package Upgrade',
    clientId: '2',
    clientName: 'StartupFlow Inc',
    value: 45000,
    stage: 'proposal',
    probability: 65,
    expectedCloseDate: '2024-12-20',
    createdAt: '2024-11-15',
    assignedTo: 'Sarah Wilson',
    description: 'Upgrade from basic to professional package with additional features'
  },
  {
    id: '3',
    title: 'Multi-Location Deployment',
    clientId: '3',
    clientName: 'Global Retail Corp',
    value: 89000,
    stage: 'qualification',
    probability: 50,
    expectedCloseDate: '2025-01-10',
    createdAt: '2024-11-20',
    assignedTo: 'Mike Johnson',
    description: 'CRM deployment across multiple retail locations'
  },
  {
    id: '4',
    title: 'Consulting Services Expansion',
    clientId: '4',
    clientName: 'Thompson Consulting',
    value: 67000,
    stage: 'closed-won',
    probability: 100,
    expectedCloseDate: '2024-11-30',
    createdAt: '2024-10-15',
    assignedTo: 'Tom Davis',
    description: 'Additional consulting services and premium support'
  },
  {
    id: '5',
    title: 'FinTech Compliance Solution',
    clientId: '5',
    clientName: 'FinTech Innovations',
    value: 156000,
    stage: 'prospecting',
    probability: 30,
    expectedCloseDate: '2025-02-01',
    createdAt: '2024-11-25',
    assignedTo: 'Lisa Brown',
    description: 'Specialized CRM solution with compliance and reporting features'
  }
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'call',
    title: 'Discovery Call',
    description: 'Initial discovery call to understand requirements',
    clientId: '1',
    createdAt: '2024-12-01T10:00:00Z',
    createdBy: 'John Smith',
    completed: true
  },
  {
    id: '2',
    type: 'email',
    title: 'Proposal Sent',
    description: 'Sent detailed proposal for enterprise package',
    clientId: '2',
    createdAt: '2024-12-01T14:30:00Z',
    createdBy: 'Sarah Wilson',
    completed: true
  },
  {
    id: '3',
    type: 'meeting',
    title: 'Demo Scheduled',
    description: 'Product demonstration meeting',
    leadId: '1',
    createdAt: '2024-12-02T09:00:00Z',
    createdBy: 'Mike Johnson',
    completed: false
  },
  {
    id: '4',
    type: 'task',
    title: 'Follow-up Required',
    description: 'Follow up on proposal status',
    opportunityId: '2',
    createdAt: '2024-12-02T16:00:00Z',
    createdBy: 'Tom Davis',
    completed: false
  }
];

export const mockDashboardStats: DashboardStats = {
  totalClients: 147,
  totalLeads: 23,
  totalOpportunities: 12,
  totalRevenue: 2450000,
  conversionRate: 24.5,
  avgDealSize: 87500,
  activeDeals: 8,
  monthlyGrowth: 12.3
};