/*
  # Create sample users for testing

  1. Sample Data
    - Insert sample users with different roles and departments
    - Use INSERT with WHERE NOT EXISTS to avoid duplicates
    - Provide realistic user data for testing

  2. Error Handling
    - Check for existing users before inserting
    - Avoid conflicts without requiring unique constraints
*/

-- Insert sample users for testing (only if they don't already exist)
INSERT INTO profiles (name, email, role, phone, department, avatar_url)
SELECT 'John Smith', 'john.smith@company.com', 'admin', '+1 (555) 123-4567', 'management', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'john.smith@company.com');

INSERT INTO profiles (name, email, role, phone, department, avatar_url)
SELECT 'Sarah Wilson', 'sarah.wilson@company.com', 'manager', '+1 (555) 234-5678', 'sales', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'sarah.wilson@company.com');

INSERT INTO profiles (name, email, role, phone, department, avatar_url)
SELECT 'Mike Johnson', 'mike.johnson@company.com', 'sales', '+1 (555) 345-6789', 'sales', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'mike.johnson@company.com');

INSERT INTO profiles (name, email, role, phone, department, avatar_url)
SELECT 'Emily Rodriguez', 'emily.rodriguez@company.com', 'sales', '+1 (555) 456-7890', 'sales', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'emily.rodriguez@company.com');

INSERT INTO profiles (name, email, role, phone, department, avatar_url)
SELECT 'Tom Davis', 'tom.davis@company.com', 'user', '+1 (555) 567-8901', 'support', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'tom.davis@company.com');

INSERT INTO profiles (name, email, role, phone, department, avatar_url)
SELECT 'Lisa Brown', 'lisa.brown@company.com', 'sales', '+1 (555) 678-9012', 'sales', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'lisa.brown@company.com');

INSERT INTO profiles (name, email, role, phone, department, avatar_url)
SELECT 'David Chen', 'david.chen@company.com', 'manager', '+1 (555) 789-0123', 'marketing', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'david.chen@company.com');

INSERT INTO profiles (name, email, role, phone, department, avatar_url)
SELECT 'Anna Martinez', 'anna.martinez@company.com', 'user', '+1 (555) 890-1234', 'finance', 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'anna.martinez@company.com');

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Sample users created successfully for testing the user management system';
END $$;