/*
  # Fix Transaction Foreign Key Constraint

  1. Problem
    - Transaction table has foreign key constraint Transaction_memberId_fkey
    - This constraint prevents deletion of User records when referenced by Transaction
    - Need to add proper ON DELETE behavior

  2. Solution
    - Drop existing foreign key constraint
    - Recreate with appropriate ON DELETE behavior
    - Choose between CASCADE, SET NULL, or RESTRICT based on business logic

  3. Business Logic Decision
    - For transactions, we should preserve transaction history
    - Use SET NULL to keep transaction records but remove user reference
    - This maintains audit trail while allowing user deletion
*/

-- First, let's check what foreign key constraints exist on Transaction table
DO $$
DECLARE
    constraint_exists boolean;
BEGIN
    -- Check if the constraint exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'Transaction' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'memberId'
    ) INTO constraint_exists;

    IF constraint_exists THEN
        RAISE NOTICE 'Found Transaction_memberId_fkey constraint, will update it';
        
        -- Drop the existing foreign key constraint
        ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_memberId_fkey";
        
        -- Recreate the foreign key constraint with SET NULL on delete
        -- This preserves transaction history while allowing user deletion
        ALTER TABLE "Transaction" 
        ADD CONSTRAINT "Transaction_memberId_fkey" 
        FOREIGN KEY ("memberId") 
        REFERENCES "Member"(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
        
        RAISE NOTICE 'Updated Transaction_memberId_fkey constraint with ON DELETE SET NULL';
    ELSE
        RAISE NOTICE 'Transaction_memberId_fkey constraint not found, checking for other patterns';
        
        -- Check if there's a constraint with different naming
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'Transaction' 
            AND tc.constraint_type = 'FOREIGN KEY'
        ) INTO constraint_exists;
        
        IF constraint_exists THEN
            -- List all foreign key constraints on Transaction table for debugging
            RAISE NOTICE 'Found other foreign key constraints on Transaction table:';
            FOR constraint_exists IN 
                SELECT tc.constraint_name
                FROM information_schema.table_constraints tc
                WHERE tc.table_name = 'Transaction' 
                AND tc.constraint_type = 'FOREIGN KEY'
            LOOP
                RAISE NOTICE 'Constraint: %', constraint_exists;
            END LOOP;
        END IF;
    END IF;
END $$;

-- Also check if we need to handle the Member table foreign key to User
DO $$
DECLARE
    constraint_exists boolean;
BEGIN
    -- Check if Member table has foreign key to User table
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'Member' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'userId'
    ) INTO constraint_exists;

    IF constraint_exists THEN
        RAISE NOTICE 'Found Member foreign key to User table';
        
        -- Drop the existing foreign key constraint
        ALTER TABLE "Member" DROP CONSTRAINT IF EXISTS "Member_userId_fkey";
        
        -- Recreate with CASCADE delete - if user is deleted, member should be deleted too
        ALTER TABLE "Member" 
        ADD CONSTRAINT "Member_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "User"(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
        
        RAISE NOTICE 'Updated Member_userId_fkey constraint with ON DELETE CASCADE';
    END IF;
END $$;

-- Create indexes for better performance on foreign key columns
CREATE INDEX IF NOT EXISTS idx_transaction_member_id ON "Transaction"("memberId");
CREATE INDEX IF NOT EXISTS idx_member_user_id ON "Member"("userId");

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Foreign key constraint updates completed successfully';
    RAISE NOTICE 'Transaction records will now preserve history when users are deleted';
    RAISE NOTICE 'Member records will be deleted when their associated user is deleted';
END $$;