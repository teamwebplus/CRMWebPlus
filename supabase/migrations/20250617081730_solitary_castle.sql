/*
  # Fix profiles table RLS policy for user registration

  1. Security Policy Updates
    - Drop the existing restrictive INSERT policy on profiles table
    - Create a new INSERT policy that allows users to create their own profile
    - Ensure the policy checks that auth.uid() matches the user_id being inserted

  2. Changes Made
    - Updated INSERT policy to properly validate user ownership during profile creation
    - This allows authenticated users to create their own profile during registration
*/

-- Drop the existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON profiles;

-- Create a new INSERT policy that allows users to create their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also ensure the SELECT policy allows users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure the UPDATE policy allows users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);