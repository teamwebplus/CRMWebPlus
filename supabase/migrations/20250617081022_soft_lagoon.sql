/*
  # Fix profiles table RLS policy for user creation

  1. Security Changes
    - Add policy to allow authenticated users to insert profiles for others
    - This enables admin users to create new user profiles through the interface
    - Maintains existing policies for viewing and updating own profiles

  2. Changes Made
    - Add "Authenticated users can insert profiles" policy for INSERT operations
    - Keep existing policies for SELECT and UPDATE operations intact
*/

-- Drop the existing restrictive insert policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new policy that allows authenticated users to insert profiles
-- This is needed for admin functionality to create new users
CREATE POLICY "Authenticated users can insert profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the existing policies for SELECT and UPDATE are still in place
-- Users can view their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON profiles
      FOR SELECT
      TO public
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      TO public
      USING (auth.uid() = user_id);
  END IF;
END $$;