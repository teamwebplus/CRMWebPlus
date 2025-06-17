/*
  # Remove Unnecessary Tables from CRM Database

  1. Tables to Remove
    - All cooperative/financial institution specific tables that don't belong in a CRM:
      - User (duplicate of users table)
      - Member (not needed for CRM)
      - Account (financial accounts, not CRM accounts)
      - Transaction (financial transactions, not CRM activities)
      - Loan (not needed for CRM)
      - LoanApplication (not needed for CRM)
      - LoanPayment (not needed for CRM)
      - DividendPayment (not needed for CRM)
      - PatronageRefund (not needed for CRM)
      - Meeting (can use calendar/activities instead)
      - Vote (not needed for CRM)
      - Proposal (we have proposals table for sales proposals)
      - CoopService (not needed for CRM)

  2. Keep CRM-relevant tables
    - users (auth users)
    - profiles (user profiles)
    - clients (CRM clients)
    - leads (sales leads)
    - opportunities (sales opportunities)
    - activities (CRM activities)
    - tasks (task management)
    - notes (notes system)
    - documents (document management)
    - proposals (sales proposals)
    - invoices (billing)
    - payments (payment tracking)

  3. Safety
    - Drop tables in correct order to handle foreign key dependencies
    - Use IF EXISTS to prevent errors
*/

-- Drop tables in dependency order (child tables first, then parent tables)

-- Drop financial/loan related tables
DROP TABLE IF EXISTS "LoanPayment" CASCADE;
DROP TABLE IF EXISTS "DividendPayment" CASCADE;
DROP TABLE IF EXISTS "PatronageRefund" CASCADE;
DROP TABLE IF EXISTS "LoanApplication" CASCADE;
DROP TABLE IF EXISTS "Loan" CASCADE;

-- Drop transaction and account tables
DROP TABLE IF EXISTS "Transaction" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;

-- Drop cooperative-specific tables
DROP TABLE IF EXISTS "Vote" CASCADE;
DROP TABLE IF EXISTS "Meeting" CASCADE;
DROP TABLE IF EXISTS "CoopService" CASCADE;

-- Drop member table (not needed for CRM)
DROP TABLE IF EXISTS "Member" CASCADE;

-- Drop the old User table (we use users table instead)
DROP TABLE IF EXISTS "User" CASCADE;

-- Drop the old Proposal table if it exists (we have proposals table)
DROP TABLE IF EXISTS "Proposal" CASCADE;

-- Drop custom types that are no longer needed
DROP TYPE IF EXISTS "LoanStatus" CASCADE;
DROP TYPE IF EXISTS "LoanApplicationStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "MembershipStatus" CASCADE;
DROP TYPE IF EXISTS "KYCStatus" CASCADE;
DROP TYPE IF EXISTS "AccountType" CASCADE;
DROP TYPE IF EXISTS "TransactionType" CASCADE;
DROP TYPE IF EXISTS "TransactionStatus" CASCADE;
DROP TYPE IF EXISTS "LoanType" CASCADE;
DROP TYPE IF EXISTS "ProposalType" CASCADE;
DROP TYPE IF EXISTS "ProposalStatus" CASCADE;
DROP TYPE IF EXISTS "VoteChoice" CASCADE;
DROP TYPE IF EXISTS "MeetingType" CASCADE;
DROP TYPE IF EXISTS "MeetingStatus" CASCADE;
DROP TYPE IF EXISTS "ServiceType" CASCADE;

-- Drop any functions related to removed tables
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Recreate the handle_new_user function for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    'user'
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Clean up any orphaned indexes that might reference dropped tables
-- (PostgreSQL should handle this automatically with CASCADE, but just to be safe)

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Successfully removed unnecessary tables from CRM database';
    RAISE NOTICE 'Remaining tables are CRM-focused: users, profiles, clients, leads, opportunities, activities, tasks, notes, documents, proposals, invoices, payments';
    RAISE NOTICE 'Database is now optimized for CRM functionality';
END $$;