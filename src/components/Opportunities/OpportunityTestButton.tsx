import React, { useState } from 'react';
import { TestTube, CheckCircle, XCircle, Loader } from 'lucide-react';
import Button from '../UI/Button';
import { useOpportunities } from '../../hooks/useOpportunities';
import { useClients } from '../../hooks/useClients';

export default function OpportunityTestButton() {
  const { createOpportunity } = useOpportunities();
  const { clients } = useClients();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const runCRUDTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Check if we have clients to test with
      if (clients.length === 0) {
        throw new Error('No clients available. Please add a client first to test opportunities.');
      }

      // Use the first available client for testing
      const testClient = clients[0];

      // Create test opportunity
      const testOpportunity = {
        title: `Test Opportunity - ${new Date().toLocaleTimeString()}`,
        client_id: testClient.id,
        value: 75000,
        stage: 'prospecting' as const,
        probability: 30,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        description: 'This is a test opportunity created by the automated CRUD test to verify functionality.',
        products: ['CRM Software', 'Training Services'],
        competitors: ['Competitor X', 'Competitor Y'],
        next_steps: 'Schedule initial discovery call with stakeholders'
      };

      console.log('🧪 Testing opportunity creation with data:', testOpportunity);

      // Test CREATE operation
      const result = await createOpportunity(testOpportunity);

      if (result.error) {
        throw new Error(`Create failed: ${result.error}`);
      }

      if (!result.data) {
        throw new Error('Create succeeded but no data returned');
      }

      console.log('✅ Opportunity created successfully:', result.data);

      setTestResult({
        success: true,
        message: `✅ CRUD Test Passed! Created opportunity "${result.data.title}" for client "${testClient.name}"`
      });

    } catch (error) {
      console.error('❌ CRUD Test failed:', error);
      setTestResult({
        success: false,
        message: `❌ CRUD Test Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">CRUD Test</h3>
      
      <Button
        onClick={runCRUDTest}
        loading={testing}
        icon={testing ? Loader : TestTube}
        size="sm"
        variant="outline"
        disabled={testing}
      >
        {testing ? 'Testing...' : 'Test Create Opportunity'}
      </Button>

      {testResult && (
        <div className={`flex items-center space-x-2 text-sm p-2 rounded ${
          testResult.success 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {testResult.success ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span className="text-xs">{testResult.message}</span>
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>This test will create a new opportunity</p>
        <p>using the first available client.</p>
      </div>
    </div>
  );
}