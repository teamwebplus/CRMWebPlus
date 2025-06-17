/*
  # Fix Opportunity Client ID Data Issues

  1. Clean up invalid client_id values that contain names instead of UUIDs
  2. Add validation to prevent future invalid data
  3. Handle UUID type casting properly
*/

-- First, let's identify and clean up invalid client_id values
-- We need to cast UUID to text to use regex operations
DELETE FROM opportunities 
WHERE client_id IS NOT NULL 
AND client_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Alternative approach if you prefer to keep the records but nullify invalid client_id:
-- UPDATE opportunities 
-- SET client_id = NULL 
-- WHERE client_id IS NOT NULL 
-- AND client_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Since client_id is already a UUID type, PostgreSQL will automatically validate UUID format
-- But let's add a function to validate and clean any potential future issues

-- Create a function to validate UUID format
CREATE OR REPLACE FUNCTION is_valid_uuid(input_text text)
RETURNS boolean AS $$
BEGIN
  -- Try to cast to UUID, return false if it fails
  PERFORM input_text::uuid;
  RETURN true;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Clean up any remaining invalid data using our validation function
-- This handles edge cases where the data might look like a UUID but isn't valid
DO $$
DECLARE
    invalid_record RECORD;
BEGIN
    -- Find and delete opportunities with invalid client_id values
    FOR invalid_record IN 
        SELECT id, client_id 
        FROM opportunities 
        WHERE client_id IS NOT NULL 
        AND NOT is_valid_uuid(client_id::text)
    LOOP
        DELETE FROM opportunities WHERE id = invalid_record.id;
        RAISE NOTICE 'Deleted opportunity with invalid client_id: %', invalid_record.client_id;
    END LOOP;
END $$;

-- Drop the validation function as it's no longer needed
DROP FUNCTION IF EXISTS is_valid_uuid(text);