/*
  # Fix profiles table RLS policies for user management

  1. Security Updates
    - Update INSERT policy to allow authenticated users to create profiles
    - Update existing policies to be more permissive for user management
    - Ensure admins can manage all user profiles
    - Allow users to create profiles during onboarding

  2. Changes
    - Drop existing restrictive INSERT policy
    - Create new INSERT policy that allows authenticated users to create profiles
    - Update SELECT policy to allow viewing all profiles for authenticated users
    - Update UPDATE and DELETE policies for proper user management
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;

-- Create new policies that allow proper user management
CREATE POLICY "Authenticated users can insert profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (true);