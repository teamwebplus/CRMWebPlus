/*
  # Fix Opportunities Schema - Remove UUID constraints for assigned_to and created_by

  1. Changes
    - Change assigned_to from UUID to TEXT to store names directly
    - Change created_by from UUID to TEXT to store names directly
    - Remove foreign key constraints that reference profiles table
    - Clean up any remaining invalid data

  2. Security
    - Maintain existing RLS policies
*/

-- First, drop any foreign key constraints on assigned_to and created_by
DO $$
BEGIN
    -- Drop assigned_to foreign key if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'opportunities_assigned_to_fkey' 
        AND table_name = 'opportunities'
    ) THEN
        ALTER TABLE opportunities DROP CONSTRAINT opportunities_assigned_to_fkey;
    END IF;
    
    -- Drop created_by foreign key if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'opportunities_created_by_fkey' 
        AND table_name = 'opportunities'
    ) THEN
        ALTER TABLE opportunities DROP CONSTRAINT opportunities_created_by_fkey;
    END IF;
END $$;

-- Change assigned_to column from UUID to TEXT
ALTER TABLE opportunities ALTER COLUMN assigned_to TYPE TEXT USING assigned_to::TEXT;

-- Change created_by column from UUID to TEXT  
ALTER TABLE opportunities ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;

-- Clean up any remaining invalid data (just in case)
DELETE FROM opportunities WHERE assigned_to IS NOT NULL AND assigned_to = '';
DELETE FROM opportunities WHERE created_by IS NOT NULL AND created_by = '';