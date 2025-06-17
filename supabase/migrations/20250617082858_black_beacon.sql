/*
  # Fix profiles table RLS policy for user creation

  1. Security Changes
    - Add policy to allow authenticated users to insert profiles for any user
    - This enables admin users to create profiles for new users
    - Maintains existing policies for select and update operations

  2. Changes Made
    - Add "Admin can insert any profile" policy for INSERT operations
    - Keep existing restrictive policies for SELECT and UPDATE operations
*/

-- Add policy to allow authenticated users to insert profiles for any user
-- This is needed for admin functionality to create users
CREATE POLICY "Admin can insert any profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);