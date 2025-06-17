export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  value: number;
  createdAt: string;
  lastContact: string;
  tags: string[];
  notes: string;
  avatar?: string;
  address?: string;
  website?: string;
  industry?: string;
  employees?: number;
  source?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  score: number;
  value: number;
  createdAt: string;
  assignedTo: string;
  notes: string;
  address?: string;
  website?: string;
  industry?: string;
  lastActivity?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  assignedTo: string;
  description: string;
  products?: string[];
  competitors?: string[];
  nextSteps?: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  title: string;
  description: string;
  clientId?: string;
  leadId?: string;
  opportunityId?: string;
  createdAt: string;
  createdBy: string;
  completed: boolean;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'manager' | 'user';
  avatar?: string;
  phone?: string;
  department?: string;
}

export interface DashboardStats {
  totalClients: number;
  totalLeads: number;
  totalOpportunities: number;
  totalRevenue: number;
  conversionRate: number;
  avgDealSize: number;
  activeDeals: number;
  monthlyGrowth: number;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  clientId?: string;
  leadId?: string;
  opportunityId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  createdBy: string;
  clientId?: string;
  leadId?: string;
  opportunityId?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  clientId?: string;
  leadId?: string;
  opportunityId?: string;
  isPrivate: boolean;
}