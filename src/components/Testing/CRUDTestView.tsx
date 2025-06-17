import React, { useState, useEffect } from 'react';
import { TestTube, Play, CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Users, Target, TrendingUp, CheckSquare, Activity, FileText, User } from 'lucide-react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import { useCRUDTest } from '../../hooks/useCRUDTest';

interface TestResult {
  id: string;
  module: string;
  operation: 'create' | 'read' | 'update' | 'delete';
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  duration?: number;
  error?: string;
  data?: any;
}

interface TestSuite {
  name: string;
  icon: React.ComponentType<any>;
  tests: TestResult[];
  enabled: boolean;
}

export default function CRUDTestView() {
  const { runTest, runAllTests, clearResults } = useCRUDTest();
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Initialize test suites
  useEffect(() => {
    const suites: TestSuite[] = [
      {
        name: 'Users & Profiles',
        icon: Users,
        enabled: true,
        tests: [
          { id: 'users-create', module: 'users', operation: 'create', status: 'pending', message: 'Create user profile' },
          { id: 'users-read', module: 'users', operation: 'read', status: 'pending', message: 'Read user profiles' },
          { id: 'users-update', module: 'users', operation: 'update', status: 'pending', message: 'Update user profile' },
          { id: 'users-delete', module: 'users', operation: 'delete', status: 'pending', message: 'Delete user profile' },
        ]
      },
      {
        name: 'Clients',
        icon: User,
        enabled: true,
        tests: [
          { id: 'clients-create', module: 'clients', operation: 'create', status: 'pending', message: 'Create client record' },
          { id: 'clients-read', module: 'clients', operation: 'read', status: 'pending', message: 'Read client records' },
          { id: 'clients-update', module: 'clients', operation: 'update', status: 'pending', message: 'Update client record' },
          { id: 'clients-delete', module: 'clients', operation: 'delete', status: 'pending', message: 'Delete client record' },
        ]
      },
      {
        name: 'Leads',
        icon: Target,
        enabled: true,
        tests: [
          { id: 'leads-create', module: 'leads', operation: 'create', status: 'pending', message: 'Create lead record' },
          { id: 'leads-read', module: 'leads', operation: 'read', status: 'pending', message: 'Read lead records' },
          { id: 'leads-update', module: 'leads', operation: 'update', status: 'pending', message: 'Update lead record' },
          { id: 'leads-delete', module: 'leads', operation: 'delete', status: 'pending', message: 'Delete lead record' },
        ]
      },
      {
        name: 'Opportunities',
        icon: TrendingUp,
        enabled: true,
        tests: [
          { id: 'opportunities-create', module: 'opportunities', operation: 'create', status: 'pending', message: 'Create opportunity record' },
          { id: 'opportunities-read', module: 'opportunities', operation: 'read', status: 'pending', message: 'Read opportunity records' },
          { id: 'opportunities-update', module: 'opportunities', operation: 'update', status: 'pending', message: 'Update opportunity record' },
          { id: 'opportunities-delete', module: 'opportunities', operation: 'delete', status: 'pending', message: 'Delete opportunity record' },
        ]
      },
      {
        name: 'Tasks',
        icon: CheckSquare,
        enabled: true,
        tests: [
          { id: 'tasks-create', module: 'tasks', operation: 'create', status: 'pending', message: 'Create task record' },
          { id: 'tasks-read', module: 'tasks', operation: 'read', status: 'pending', message: 'Read task records' },
          { id: 'tasks-update', module: 'tasks', operation: 'update', status: 'pending', message: 'Update task record' },
          { id: 'tasks-delete', module: 'tasks', operation: 'delete', status: 'pending', message: 'Delete task record' },
        ]
      },
      {
        name: 'Activities',
        icon: Activity,
        enabled: true,
        tests: [
          { id: 'activities-create', module: 'activities', operation: 'create', status: 'pending', message: 'Create activity record' },
          { id: 'activities-read', module: 'activities', operation: 'read', status: 'pending', message: 'Read activity records' },
          { id: 'activities-update', module: 'activities', operation: 'update', status: 'pending', message: 'Update activity record' },
          { id: 'activities-delete', module: 'activities', operation: 'delete', status: 'pending', message: 'Delete activity record' },
        ]
      }
    ];
    
    setTestSuites(suites);
    setTestResults(suites.flatMap(suite => suite.tests));
  }, []);

  const runSingleTest = async (testId: string) => {
    const test = testResults.find(t => t.id === testId);
    if (!test) return;

    // Update test status to running
    setTestResults(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'running' } : t
    ));

    try {
      const startTime = Date.now();
      const result = await runTest(test.module, test.operation);
      const duration = Date.now() - startTime;

      setTestResults(prev => prev.map(t => 
        t.id === testId ? {
          ...t,
          status: result.success ? 'passed' : 'failed',
          message: result.message,
          duration,
          error: result.error,
          data: result.data
        } : t
      ));
    } catch (error) {
      setTestResults(prev => prev.map(t => 
        t.id === testId ? {
          ...t,
          status: 'failed',
          message: 'Test execution failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        } : t
      ));
    }
  };

  const runSuiteTests = async (suiteName: string) => {
    const suite = testSuites.find(s => s.name === suiteName);
    if (!suite) return;

    setIsRunning(true);
    
    for (const test of suite.tests) {
      await runSingleTest(test.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
  };

  const runAllTestSuites = async () => {
    setIsRunning(true);
    
    for (const suite of testSuites.filter(s => s.enabled)) {
      await runSuiteTests(suite.name);
    }
    
    setIsRunning(false);
  };

  const resetAllTests = () => {
    setTestResults(prev => prev.map(test => ({
      ...test,
      status: 'pending',
      message: test.message.split(' - ')[0], // Reset to original message
      duration: undefined,
      error: undefined,
      data: undefined
    })));
    clearResults();
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'passed':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getSuiteStats = (suiteName: string) => {
    const suite = testSuites.find(s => s.name === suiteName);
    if (!suite) return { total: 0, passed: 0, failed: 0, pending: 0 };

    const suiteTests = testResults.filter(t => 
      suite.tests.some(st => st.id === t.id)
    );

    return {
      total: suiteTests.length,
      passed: suiteTests.filter(t => t.status === 'passed').length,
      failed: suiteTests.filter(t => t.status === 'failed').length,
      pending: suiteTests.filter(t => t.status === 'pending').length,
      running: suiteTests.filter(t => t.status === 'running').length
    };
  };

  const overallStats = {
    total: testResults.length,
    passed: testResults.filter(t => t.status === 'passed').length,
    failed: testResults.filter(t => t.status === 'failed').length,
    pending: testResults.filter(t => t.status === 'pending').length,
    running: testResults.filter(t => t.status === 'running').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CRUD Testing Suite</h2>
          <p className="text-gray-600 dark:text-gray-400">Test all database operations across CRM modules</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetAllTests}
            icon={RefreshCw}
            disabled={isRunning}
          >
            Reset Tests
          </Button>
          <Button
            onClick={runAllTestSuites}
            loading={isRunning}
            icon={Play}
          >
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.total}</p>
            </div>
            <TestTube className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Passed</p>
              <p className="text-2xl font-bold text-green-600">{overallStats.passed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-600">{overallStats.failed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Running</p>
              <p className="text-2xl font-bold text-blue-600">{overallStats.running}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-600">{overallStats.pending}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Test Suites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testSuites.map((suite) => {
          const Icon = suite.icon;
          const stats = getSuiteStats(suite.name);
          const suiteTests = testResults.filter(t => 
            suite.tests.some(st => st.id === t.id)
          );
          
          return (
            <div key={suite.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{suite.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stats.passed}/{stats.total} tests passed
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSuiteTests(suite.name)}
                    disabled={isRunning}
                    icon={Play}
                  >
                    Run Suite
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((stats.passed / stats.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(stats.passed / stats.total) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Test Results */}
                <div className="space-y-2">
                  {suiteTests.map((test) => (
                    <div
                      key={test.id}
                      className={`p-3 rounded-lg border transition-all ${getStatusColor(test.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {test.operation.toUpperCase()} Operation
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {test.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {test.duration && (
                            <span className="text-xs text-gray-500">
                              {test.duration}ms
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => runSingleTest(test.id)}
                            disabled={isRunning}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {test.error && (
                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400">
                          {test.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Test Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Test Results Details"
        size="lg"
      >
        <div className="space-y-4">
          {testResults.filter(t => t.status !== 'pending').map((test) => (
            <div key={test.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {test.module} - {test.operation}
                </h4>
                {getStatusIcon(test.status)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{test.message}</p>
              {test.duration && (
                <p className="text-xs text-gray-500">Duration: {test.duration}ms</p>
              )}
              {test.error && (
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400">
                  {test.error}
                </div>
              )}
              {test.data && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer">View Data</summary>
                  <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}