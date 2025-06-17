/*
  # Fix foreign key constraint between users and profiles tables

  1. Schema Changes
    - Drop the existing foreign key constraint on profiles table
    - Create a new constraint that references the correct users table
    - Ensure data consistency between User and users tables

  2. Data Migration
    - Copy data from User table to users table if needed
    - Update profiles to reference correct user records

  3. Security
    - Maintain existing RLS policies
    - Ensure no data loss during migration
*/

-- First, let's check if we need to migrate data from User to users table
DO $$
BEGIN
  -- Check if users table exists and is empty while User table has data
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'users' AND table_schema = 'public'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'User' AND table_schema = 'public'
  ) THEN
    
    -- Insert users from User table to users table if they don't exist
    INSERT INTO users (id, email, created_at)
    SELECT u.id, u.email, u."createdAt"
    FROM "User" u
    WHERE NOT EXISTS (
      SELECT 1 FROM users WHERE users.id = u.id
    );
    
  END IF;
END $$;

-- Drop the existing foreign key constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_user_id_fkey;
  END IF;
END $$;

-- Create the users table if it doesn't exist (matching auth.users structure)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can view own record'
  ) THEN
    CREATE POLICY "Users can view own record"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can insert own record'
  ) THEN
    CREATE POLICY "Users can insert own record"
      ON users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can update own record'
  ) THEN
    CREATE POLICY "Users can update own record"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Re-create the foreign key constraint pointing to the correct users table
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create a function to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user record
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();