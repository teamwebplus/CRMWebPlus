/*
  # CRM Database Schema

  1. New Tables
    - `profiles` - User profiles linked to auth.users
    - `clients` - Client management
    - `leads` - Lead management with scoring
    - `opportunities` - Sales opportunities with pipeline stages
    - `activities` - Activity tracking (calls, emails, meetings)
    - `tasks` - Task management
    - `notes` - Notes for clients/leads/opportunities
    - `documents` - File attachments
    - `proposals` - Proposal management
    - `invoices` - Billing and invoicing
    - `payments` - Payment tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create custom types
CREATE TYPE client_status AS ENUM ('lead', 'prospect', 'customer', 'inactive');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
CREATE TYPE opportunity_stage AS ENUM ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost');
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'task', 'note');
CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'rejected');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'user',
  avatar_url text,
  phone text,
  department text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text NOT NULL,
  status client_status DEFAULT 'lead',
  value numeric(12,2) DEFAULT 0,
  tags text[] DEFAULT '{}',
  notes text DEFAULT '',
  avatar_url text,
  address text,
  website text,
  industry text,
  employees integer,
  source text,
  assigned_to uuid REFERENCES profiles(id),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_contact timestamptz DEFAULT now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text NOT NULL,
  source text NOT NULL,
  status lead_status DEFAULT 'new',
  score integer DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  value numeric(12,2) DEFAULT 0,
  notes text DEFAULT '',
  address text,
  website text,
  industry text,
  assigned_to uuid REFERENCES profiles(id),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_activity timestamptz
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  value numeric(12,2) NOT NULL,
  stage opportunity_stage DEFAULT 'prospecting',
  probability integer DEFAULT 25 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date date NOT NULL,
  description text NOT NULL,
  products text[] DEFAULT '{}',
  competitors text[] DEFAULT '{}',
  next_steps text DEFAULT '',
  assigned_to uuid REFERENCES profiles(id),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type activity_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  due_date timestamptz,
  priority task_priority DEFAULT 'medium',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  assigned_to uuid REFERENCES profiles(id),
  due_date timestamptz NOT NULL,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  is_private boolean DEFAULT false,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  size bigint NOT NULL,
  url text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content jsonb NOT NULL,
  status proposal_status DEFAULT 'draft',
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  total_amount numeric(12,2) NOT NULL,
  valid_until date,
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  proposal_id uuid REFERENCES proposals(id),
  status invoice_status DEFAULT 'draft',
  subtotal numeric(12,2) NOT NULL,
  tax_amount numeric(12,2) DEFAULT 0,
  total_amount numeric(12,2) NOT NULL,
  due_date date NOT NULL,
  items jsonb NOT NULL,
  notes text DEFAULT '',
  sent_at timestamptz,
  paid_at timestamptz,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method text,
  transaction_id text,
  payment_date timestamptz,
  notes text DEFAULT '',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for clients
CREATE POLICY "Users can view all clients" ON clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert clients" ON clients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update clients" ON clients
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete clients" ON clients
  FOR DELETE TO authenticated USING (true);

-- Create policies for leads
CREATE POLICY "Users can view all leads" ON leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert leads" ON leads
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update leads" ON leads
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete leads" ON leads
  FOR DELETE TO authenticated USING (true);

-- Create policies for opportunities
CREATE POLICY "Users can view all opportunities" ON opportunities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert opportunities" ON opportunities
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update opportunities" ON opportunities
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete opportunities" ON opportunities
  FOR DELETE TO authenticated USING (true);

-- Create policies for activities
CREATE POLICY "Users can view all activities" ON activities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert activities" ON activities
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update activities" ON activities
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete activities" ON activities
  FOR DELETE TO authenticated USING (true);

-- Create policies for tasks
CREATE POLICY "Users can view all tasks" ON tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert tasks" ON tasks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update tasks" ON tasks
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete tasks" ON tasks
  FOR DELETE TO authenticated USING (true);

-- Create policies for notes
CREATE POLICY "Users can view all notes" ON notes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert notes" ON notes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update notes" ON notes
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete notes" ON notes
  FOR DELETE TO authenticated USING (true);

-- Create policies for documents
CREATE POLICY "Users can view all documents" ON documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert documents" ON documents
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can delete documents" ON documents
  FOR DELETE TO authenticated USING (true);

-- Create policies for proposals
CREATE POLICY "Users can view all proposals" ON proposals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert proposals" ON proposals
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update proposals" ON proposals
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete proposals" ON proposals
  FOR DELETE TO authenticated USING (true);

-- Create policies for invoices
CREATE POLICY "Users can view all invoices" ON invoices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert invoices" ON invoices
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update invoices" ON invoices
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete invoices" ON invoices
  FOR DELETE TO authenticated USING (true);

-- Create policies for payments
CREATE POLICY "Users can view all payments" ON payments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert payments" ON payments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update payments" ON payments
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete payments" ON payments
  FOR DELETE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_to ON clients(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_client_id ON opportunities(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();