/*
  # Fix UUID validation with proper casting
  
  This migration fixes the UUID validation error by casting UUID columns to text
  before applying regex operations.
*/

-- First, let's see what invalid data we have
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    -- Check for non-UUID values in opportunities.client_id (cast to text first)
    SELECT COUNT(*) INTO invalid_count
    FROM opportunities 
    WHERE client_id IS NOT NULL 
    AND NOT (client_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
    
    RAISE NOTICE 'Found % opportunities with invalid client_id values', invalid_count;
END $$;

-- Clean up opportunities table
UPDATE opportunities 
SET client_id = NULL 
WHERE client_id IS NOT NULL 
AND NOT (client_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE opportunities 
SET assigned_to = NULL 
WHERE assigned_to IS NOT NULL 
AND NOT (assigned_to::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE opportunities 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND NOT (created_by::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Clean up clients table
UPDATE clients 
SET assigned_to = NULL 
WHERE assigned_to IS NOT NULL 
AND NOT (assigned_to::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE clients 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND NOT (created_by::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Clean up leads table
UPDATE leads 
SET assigned_to = NULL 
WHERE assigned_to IS NOT NULL 
AND NOT (assigned_to::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE leads 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND NOT (created_by::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Clean up activities table
UPDATE activities 
SET client_id = NULL 
WHERE client_id IS NOT NULL 
AND NOT (client_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE activities 
SET lead_id = NULL 
WHERE lead_id IS NOT NULL 
AND NOT (lead_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE activities 
SET opportunity_id = NULL 
WHERE opportunity_id IS NOT NULL 
AND NOT (opportunity_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE activities 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND NOT (created_by::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Clean up tasks table
UPDATE tasks 
SET assigned_to = NULL 
WHERE assigned_to IS NOT NULL 
AND NOT (assigned_to::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE tasks 
SET client_id = NULL 
WHERE client_id IS NOT NULL 
AND NOT (client_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE tasks 
SET lead_id = NULL 
WHERE lead_id IS NOT NULL 
AND NOT (lead_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE tasks 
SET opportunity_id = NULL 
WHERE opportunity_id IS NOT NULL 
AND NOT (opportunity_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE tasks 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND NOT (created_by::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Clean up notes table
UPDATE notes 
SET client_id = NULL 
WHERE client_id IS NOT NULL 
AND NOT (client_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE notes 
SET lead_id = NULL 
WHERE lead_id IS NOT NULL 
AND NOT (lead_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE notes 
SET opportunity_id = NULL 
WHERE opportunity_id IS NOT NULL 
AND NOT (opportunity_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE notes 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND NOT (created_by::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Clean up documents table
UPDATE documents 
SET client_id = NULL 
WHERE client_id IS NOT NULL 
AND NOT (client_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE documents 
SET lead_id = NULL 
WHERE lead_id IS NOT NULL 
AND NOT (lead_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE documents 
SET opportunity_id = NULL 
WHERE opportunity_id IS NOT NULL 
AND NOT (opportunity_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE documents 
SET uploaded_by = NULL 
WHERE uploaded_by IS NOT NULL 
AND NOT (uploaded_by::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Clean up proposals table
UPDATE proposals 
SET client_id = NULL 
WHERE client_id IS NOT NULL 
AND NOT (client_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE proposals 
SET opportunity_id = NULL 
WHERE opportunity_id IS NOT NULL 
AND NOT (opportunity_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE proposals 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND NOT (created_by::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Clean up invoices table
UPDATE invoices 
SET client_id = NULL 
WHERE client_id IS NOT NULL 
AND NOT (client_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE invoices 
SET proposal_id = NULL 
WHERE proposal_id IS NOT NULL 
AND NOT (proposal_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE invoices 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND NOT (created_by::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Clean up payments table
UPDATE payments 
SET invoice_id = NULL 
WHERE invoice_id IS NOT NULL 
AND NOT (invoice_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

UPDATE payments 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND NOT (created_by::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Database cleanup completed successfully - all invalid UUID references have been set to NULL';
END $$;