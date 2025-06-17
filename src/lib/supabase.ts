import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          role: string;
          avatar_url: string | null;
          phone: string | null;
          department: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          role?: string;
          avatar_url?: string | null;
          phone?: string | null;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          role?: string;
          avatar_url?: string | null;
          phone?: string | null;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string;
          status: 'lead' | 'prospect' | 'customer' | 'inactive';
          value: number;
          tags: string[];
          notes: string;
          avatar_url: string | null;
          address: string | null;
          website: string | null;
          industry: string | null;
          employees: number | null;
          source: string | null;
          assigned_to: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          last_contact: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          company: string;
          status?: 'lead' | 'prospect' | 'customer' | 'inactive';
          value?: number;
          tags?: string[];
          notes?: string;
          avatar_url?: string | null;
          address?: string | null;
          website?: string | null;
          industry?: string | null;
          employees?: number | null;
          source?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          last_contact?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string;
          status?: 'lead' | 'prospect' | 'customer' | 'inactive';
          value?: number;
          tags?: string[];
          notes?: string;
          avatar_url?: string | null;
          address?: string | null;
          website?: string | null;
          industry?: string | null;
          employees?: number | null;
          source?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          last_contact?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string;
          source: string;
          status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
          score: number;
          value: number;
          notes: string;
          address: string | null;
          website: string | null;
          industry: string | null;
          assigned_to: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          last_activity: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          company: string;
          source: string;
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
          score?: number;
          value?: number;
          notes?: string;
          address?: string | null;
          website?: string | null;
          industry?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          last_activity?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string;
          source?: string;
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
          score?: number;
          value?: number;
          notes?: string;
          address?: string | null;
          website?: string | null;
          industry?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          last_activity?: string | null;
        };
      };
      opportunities: {
        Row: {
          id: string;
          title: string;
          client_id: string;
          value: number;
          stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
          probability: number;
          expected_close_date: string;
          description: string;
          products: string[];
          competitors: string[];
          next_steps: string;
          assigned_to: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          client_id: string;
          value: number;
          stage?: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
          probability?: number;
          expected_close_date: string;
          description: string;
          products?: string[];
          competitors?: string[];
          next_steps?: string;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          client_id?: string;
          value?: number;
          stage?: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
          probability?: number;
          expected_close_date?: string;
          description?: string;
          products?: string[];
          competitors?: string[];
          next_steps?: string;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          assigned_to: string | null;
          due_date: string;
          priority: 'low' | 'medium' | 'high';
          status: 'pending' | 'in-progress' | 'completed';
          client_id: string | null;
          lead_id: string | null;
          opportunity_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          assigned_to?: string | null;
          due_date: string;
          priority?: 'low' | 'medium' | 'high';
          status?: 'pending' | 'in-progress' | 'completed';
          client_id?: string | null;
          lead_id?: string | null;
          opportunity_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          assigned_to?: string | null;
          due_date?: string;
          priority?: 'low' | 'medium' | 'high';
          status?: 'pending' | 'in-progress' | 'completed';
          client_id?: string | null;
          lead_id?: string | null;
          opportunity_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          type: 'call' | 'email' | 'meeting' | 'task' | 'note';
          title: string;
          description: string;
          client_id: string | null;
          lead_id: string | null;
          opportunity_id: string | null;
          completed: boolean;
          due_date: string | null;
          priority: 'low' | 'medium' | 'high' | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: 'call' | 'email' | 'meeting' | 'task' | 'note';
          title: string;
          description: string;
          client_id?: string | null;
          lead_id?: string | null;
          opportunity_id?: string | null;
          completed?: boolean;
          due_date?: string | null;
          priority?: 'low' | 'medium' | 'high' | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: 'call' | 'email' | 'meeting' | 'task' | 'note';
          title?: string;
          description?: string;
          client_id?: string | null;
          lead_id?: string | null;
          opportunity_id?: string | null;
          completed?: boolean;
          due_date?: string | null;
          priority?: 'low' | 'medium' | 'high' | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}