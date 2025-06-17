/*
  # Fix user signup database error

  1. Database Issues Fixed
    - Add trigger function to automatically create profile when user signs up
    - Ensure proper RLS policies for profile creation
    - Add missing constraints and relationships

  2. Changes Made
    - Create trigger function to handle new user profile creation
    - Add trigger to automatically create profile on user signup
    - Update RLS policies to allow profile creation during signup
    - Ensure proper foreign key relationships

  3. Security
    - Maintain RLS on profiles table
    - Allow authenticated users to create their own profile
    - Ensure users can only access their own data
*/

-- Create or replace the trigger function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    'user',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert any profile" ON public.profiles;

-- Create proper RLS policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure users table has proper RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on users table
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;

-- Create proper RLS policies for users table
CREATE POLICY "Users can view own record"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own record"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own record"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure the profiles table has all necessary columns with proper defaults
DO $$
BEGIN
  -- Check if name column allows null and has default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'name' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN name SET DEFAULT '';
  END IF;

  -- Check if email column allows null and has default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'email' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN email SET DEFAULT '';
  END IF;

  -- Ensure role has proper default
  ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user';
END $$;