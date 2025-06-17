import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Client = Database['public']['Tables']['clients']['Insert'];
type Lead = Database['public']['Tables']['leads']['Insert'];
type Opportunity = Database['public']['Tables']['opportunities']['Insert'];
type Task = Database['public']['Tables']['tasks']['Insert'];
type Activity = Database['public']['Tables']['activities']['Insert'];
type Profile = Database['public']['Tables']['profiles']['Insert'];

interface TestResult {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}

export function useCRUDTest() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  // Test data generators
  const generateTestClient = (): Client => ({
    name: `Test Client ${Date.now()}`,
    email: `test.client.${Date.now()}@example.com`,
    company: `Test Company ${Date.now()}`,
    phone: '+1 (555) 123-4567',
    status: 'lead',
    value: 50000,
    tags: ['test', 'automated'],
    notes: 'This is a test client created by automated testing',
    source: 'automated-test'
  });

  const generateTestLead = (): Lead => ({
    name: `Test Lead ${Date.now()}`,
    email: `test.lead.${Date.now()}@example.com`,
    company: `Test Lead Company ${Date.now()}`,
    phone: '+1 (555) 987-6543',
    source: 'automated-test',
    status: 'new',
    score: 75,
    value: 25000,
    notes: 'This is a test lead created by automated testing',
    industry: 'technology'
  });

  const generateTestOpportunity = (clientId: string): Opportunity => ({
    title: `Test Opportunity ${Date.now()}`,
    client_id: clientId,
    value: 75000,
    stage: 'prospecting',
    probability: 30,
    expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'This is a test opportunity created by automated testing',
    products: ['Test Product A', 'Test Product B'],
    competitors: ['Competitor X', 'Competitor Y'],
    next_steps: 'Schedule discovery call',
    assigned_to: 'Test User'
  });

  const generateTestTask = (): Task => ({
    title: `Test Task ${Date.now()}`,
    description: 'This is a test task created by automated testing',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    status: 'pending'
  });

  const generateTestActivity = (): Activity => ({
    type: 'note',
    title: `Test Activity ${Date.now()}`,
    description: 'This is a test activity created by automated testing',
    completed: false,
    priority: 'medium'
  });

  const generateTestProfile = (): Profile => ({
    user_id: crypto.randomUUID(),
    name: `Test User ${Date.now()}`,
    email: `test.user.${Date.now()}@example.com`,
    role: 'user',
    phone: '+1 (555) 456-7890',
    department: 'testing'
  });

  // CRUD operations for each module
  const testUsers = {
    create: async (): Promise<TestResult> => {
      try {
        const testData = generateTestProfile();
        const { data, error } = await supabase
          .from('profiles')
          .insert([testData])
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Successfully created user profile: ${data.name}`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to create user profile',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    read: async (): Promise<TestResult> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(5);

        if (error) throw error;

        return {
          success: true,
          message: `Successfully read ${data.length} user profiles`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to read user profiles',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    update: async (): Promise<TestResult> => {
      try {
        // First, get a test record
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .ilike('name', '%Test User%')
          .limit(1);

        if (!profiles || profiles.length === 0) {
          throw new Error('No test user found to update');
        }

        const testProfile = profiles[0];
        const updatedData = {
          name: `${testProfile.name} - Updated`,
          department: 'testing-updated'
        };

        const { data, error } = await supabase
          .from('profiles')
          .update(updatedData)
          .eq('id', testProfile.id)
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Successfully updated user profile: ${data.name}`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to update user profile',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    delete: async (): Promise<TestResult> => {
      try {
        // Get a test record to delete
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .ilike('name', '%Test User%')
          .limit(1);

        if (!profiles || profiles.length === 0) {
          throw new Error('No test user found to delete');
        }

        const testProfile = profiles[0];
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', testProfile.id);

        if (error) throw error;

        return {
          success: true,
          message: `Successfully deleted user profile: ${testProfile.name}`,
          data: testProfile
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to delete user profile',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  };

  const testClients = {
    create: async (): Promise<TestResult> => {
      try {
        const testData = generateTestClient();
        const { data, error } = await supabase
          .from('clients')
          .insert([testData])
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Successfully created client: ${data.name}`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to create client',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    read: async (): Promise<TestResult> => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .limit(5);

        if (error) throw error;

        return {
          success: true,
          message: `Successfully read ${data.length} clients`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to read clients',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    update: async (): Promise<TestResult> => {
      try {
        const { data: clients } = await supabase
          .from('clients')
          .select('*')
          .ilike('name', '%Test Client%')
          .limit(1);

        if (!clients || clients.length === 0) {
          throw new Error('No test client found to update');
        }

        const testClient = clients[0];
        const { data, error } = await supabase
          .from('clients')
          .update({ 
            name: `${testClient.name} - Updated`,
            status: 'customer'
          })
          .eq('id', testClient.id)
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Successfully updated client: ${data.name}`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to update client',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    delete: async (): Promise<TestResult> => {
      try {
        const { data: clients } = await supabase
          .from('clients')
          .select('*')
          .ilike('name', '%Test Client%')
          .limit(1);

        if (!clients || clients.length === 0) {
          throw new Error('No test client found to delete');
        }

        const testClient = clients[0];
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', testClient.id);

        if (error) throw error;

        return {
          success: true,
          message: `Successfully deleted client: ${testClient.name}`,
          data: testClient
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to delete client',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  };

  const testLeads = {
    create: async (): Promise<TestResult> => {
      try {
        const testData = generateTestLead();
        const { data, error } = await supabase
          .from('leads')
          .insert([testData])
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Successfully created lead: ${data.name}`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to create lead',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    read: async (): Promise<TestResult> => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .limit(5);

        if (error) throw error;

        return {
          success: true,
          message: `Successfully read ${data.length} leads`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to read leads',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    update: async (): Promise<TestResult> => {
      try {
        const { data: leads } = await supabase
          .from('leads')
          .select('*')
          .ilike('name', '%Test Lead%')
          .limit(1);

        if (!leads || leads.length === 0) {
          throw new Error('No test lead found to update');
        }

        const testLead = leads[0];
        const { data, error } = await supabase
          .from('leads')
          .update({ 
            name: `${testLead.name} - Updated`,
            status: 'qualified',
            score: 85
          })
          .eq('id', testLead.id)
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Successfully updated lead: ${data.name}`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to update lead',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    delete: async (): Promise<TestResult> => {
      try {
        const { data: leads } = await supabase
          .from('leads')
          .select('*')
          .ilike('name', '%Test Lead%')
          .limit(1);

        if (!leads || leads.length === 0) {
          throw new Error('No test lead found to delete');
        }

        const testLead = leads[0];
        const { error } = await supabase
          .from('leads')
          .delete()
          .eq('id', testLead.id);

        if (error) throw error;

        return {
          success: true,
          message: `Successfully deleted lead: ${testLead.name}`,
          data: testLead
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to delete lead',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  };

  const testOpportunities = {
    create: async (): Promise<TestResult> => {
      try {
        // First get a client to associate with
        const { data: clients } = await supabase
          .from('clients')
          .select('id')
          .limit(1);

        if (!clients || clients.length === 0) {
          throw new Error('No clients available to create opportunity');
        }

        const testData = generateTestOpportunity(clients[0].id);
        const { data, error } = await supabase
          .from('opportunities')
          .insert([testData])
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Successfully created opportunity: ${data.title}`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to create opportunity',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    read: async (): Promise<TestResult> => {
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .limit(5);

        if (error) throw error;

        return {
          success: true,
          message: `Successfully read ${data.length} opportunities`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to read opportunities',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    update: async (): Promise<TestResult> => {
      try {
        const { data: opportunities } = await supabase
          .from('opportunities')
          .select('*')
          .ilike('title', '%Test Opportunity%')
          .limit(1);

        if (!opportunities || opportunities.length === 0) {
          throw new Error('No test opportunity found to update');
        }

        const testOpportunity = opportunities[0];
        const { data, error } = await supabase
          .from('opportunities')
          .update({ 
            title: `${testOpportunity.title} - Updated`,
            stage: 'qualification',
            probability: 50
          })
          .eq('id', testOpportunity.id)
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Successfully updated opportunity: ${data.title}`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to update opportunity',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    delete: async (): Promise<TestResult> => {
      try {
        const { data: opportunities } = await supabase
          .from('opportunities')
          .select('*')
          .ilike('title', '%Test Opportunity%')
          .limit(1);

        if (!opportunities || opportunities.length === 0) {
          throw new Error('No test opportunity found to delete');
        }

        const testOpportunity = opportunities[0];
        const { error } = await supabase
          .from('opportunities')
          .delete()
          .eq('id', testOpportunity.id);

        if (error) throw error;

        return {
          success: true,
          message: `Successfully deleted opportunity: ${testOpportunity.title}`,
          data: testOpportunity
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to delete opportunity',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  };

  const testTasks = {
    create: async (): Promise<TestResult> => {
      try {
        const testData = generateTestTask();
        const { data, error } = await supabase
          .from('tasks')
          .insert([testData])
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Successfully created task: ${data.title}`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to create task',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    read: async (): Promise<TestResult> => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .limit(5);

        if (error) throw error;

        return {
          success: true,
          message: `Successfully read ${data.length} tasks`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to read tasks',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    update: async (): Promise<TestResult> => {
      try {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .ilike('title', '%Test Task%')
          .limit(1);

        if (!tasks || tasks.length === 0) {
          throw new Error('No test task found to update');
        }

        const testTask = tasks[0];
        const { data, error } = await supabase
          .from('tasks')
          .update({ 
            title: `${testTask.title} - Updated`,
            status: 'completed',
            priority: 'high'
          })
          .eq('id', testTask.id)
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Successfully updated task: ${data.title}`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to update task',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    delete: async (): Promise<TestResult> => {
      try {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .ilike('title', '%Test Task%')
          .limit(1);

        if (!tasks || tasks.length === 0) {
          throw new Error('No test task found to delete');
        }

        const testTask = tasks[0];
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', testTask.id);

        if (error) throw error;

        return {
          success: true,
          message: `Successfully deleted task: ${testTask.title}`,
          data: testTask
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to delete task',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  };

  const testActivities = {
    create: async (): Promise<TestResult> => {
      try {
        const testData = generateTestActivity();
        const { data, error } = await supabase
          .from('activities')
          .insert([testData])
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Successfully created activity: ${data.title}`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to create activity',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    read: async (): Promise<TestResult> => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .limit(5);

        if (error) throw error;

        return {
          success: true,
          message: `Successfully read ${data.length} activities`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to read activities',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    update: async (): Promise<TestResult> => {
      try {
        const { data: activities } = await supabase
          .from('activities')
          .select('*')
          .ilike('title', '%Test Activity%')
          .limit(1);

        if (!activities || activities.length === 0) {
          throw new Error('No test activity found to update');
        }

        const testActivity = activities[0];
        const { data, error } = await supabase
          .from('activities')
          .update({ 
            title: `${testActivity.title} - Updated`,
            completed: true,
            priority: 'high'
          })
          .eq('id', testActivity.id)
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Successfully updated activity: ${data.title}`,
          data
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to update activity',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    delete: async (): Promise<TestResult> => {
      try {
        const { data: activities } = await supabase
          .from('activities')
          .select('*')
          .ilike('title', '%Test Activity%')
          .limit(1);

        if (!activities || activities.length === 0) {
          throw new Error('No test activity found to delete');
        }

        const testActivity = activities[0];
        const { error } = await supabase
          .from('activities')
          .delete()
          .eq('id', testActivity.id);

        if (error) throw error;

        return {
          success: true,
          message: `Successfully deleted activity: ${testActivity.title}`,
          data: testActivity
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to delete activity',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  };

  const testModules = {
    users: testUsers,
    clients: testClients,
    leads: testLeads,
    opportunities: testOpportunities,
    tasks: testTasks,
    activities: testActivities
  };

  const runTest = async (module: string, operation: string): Promise<TestResult> => {
    const moduleTests = testModules[module as keyof typeof testModules];
    if (!moduleTests) {
      return {
        success: false,
        message: `Unknown module: ${module}`,
        error: 'Module not found'
      };
    }

    const testFunction = moduleTests[operation as keyof typeof moduleTests];
    if (!testFunction) {
      return {
        success: false,
        message: `Unknown operation: ${operation}`,
        error: 'Operation not found'
      };
    }

    const result = await testFunction();
    const testKey = `${module}-${operation}`;
    setTestResults(prev => ({ ...prev, [testKey]: result }));
    
    return result;
  };

  const runAllTests = async (): Promise<Record<string, TestResult>> => {
    const results: Record<string, TestResult> = {};
    
    for (const [moduleName, moduleTests] of Object.entries(testModules)) {
      for (const operation of ['create', 'read', 'update', 'delete']) {
        const result = await runTest(moduleName, operation);
        results[`${moduleName}-${operation}`] = result;
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  };

  const clearResults = () => {
    setTestResults({});
  };

  return {
    testResults,
    runTest,
    runAllTests,
    clearResults
  };
}