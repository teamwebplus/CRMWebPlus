import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Calendar, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useClients } from '../../hooks/useClients';
import { useLeads } from '../../hooks/useLeads';
import { useOpportunities } from '../../hooks/useOpportunities';
import { useTasks } from '../../hooks/useTasks';
import Button from '../UI/Button';

export default function ReportsView() {
  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { clients } = useClients();
  const { leads } = useLeads();
  const { opportunities } = useOpportunities();
  const { tasks } = useTasks();
  const [refreshing, setRefreshing] = useState(false);

  // Generate monthly performance data from actual data
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const monthOpportunities = opportunities.filter(opp => {
        const oppDate = new Date(opp.created_at);
        return oppDate.getMonth() === index && opp.stage === 'closed-won';
      });
      
      const monthLeads = leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate.getMonth() === index;
      });

      const monthConversions = leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate.getMonth() === index && lead.status === 'converted';
      });

      return {
        month,
        revenue: monthOpportunities.reduce((sum, opp) => sum + opp.value, 0),
        leads: monthLeads.length,
        conversions: monthConversions.length
      };
    });
  };

  // Generate conversion data by source
  const generateConversionData = () => {
    const sourceMap = new Map();
    
    leads.forEach(lead => {
      if (!sourceMap.has(lead.source)) {
        sourceMap.set(lead.source, { leads: 0, conversions: 0 });
      }
      sourceMap.get(lead.source).leads++;
      if (lead.status === 'converted') {
        sourceMap.get(lead.source).conversions++;
      }
    });

    return Array.from(sourceMap.entries()).map(([source, data]) => ({
      source,
      leads: data.leads,
      conversions: data.conversions,
      rate: data.leads > 0 ? ((data.conversions / data.leads) * 100).toFixed(1) : 0
    }));
  };

  // Generate pipeline data
  const generatePipelineData = () => {
    const stageMap = new Map();
    
    opportunities.forEach(opp => {
      if (!stageMap.has(opp.stage)) {
        stageMap.set(opp.stage, { count: 0, value: 0 });
      }
      stageMap.get(opp.stage).count++;
      stageMap.get(opp.stage).value += opp.value;
    });

    const colors = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#F472B6'];
    
    return Array.from(stageMap.entries()).map(([stage, data], index) => ({
      name: stage.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value: data.count,
      amount: data.value,
      color: colors[index % colors.length]
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const monthlyData = generateMonthlyData();
  const conversionData = generateConversionData();
  const pipelineData = generatePipelineData();

  const formatCurrencyShort = (value: number) => `₱${(value / 1000).toFixed(0)}k`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.name.includes('Revenue') 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Real-time insights from your CRM data</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          icon={RefreshCw}
          loading={refreshing}
        >
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 ml-1">+12.3%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-500 ml-1">+8.2%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads.length > 0 ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1) : 0}%
              </p>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500 ml-1">-2.1%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(opportunities.length > 0 ? opportunities.reduce((sum, opp) => sum + opp.value, 0) / opportunities.length : 0)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 ml-1">+5.7%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Performance (PHP)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={formatCurrencyShort} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pipeline Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lead Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Generation & Conversion Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="New Leads"
              />
              <Line 
                type="monotone" 
                dataKey="conversions" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Conversions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Rates by Source */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Conversion by Source</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Total Leads</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Conversions</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
              </tr>
            </thead>
            <tbody>
              {conversionData.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{item.source}</td>
                  <td className="py-3 px-4 text-gray-600">{item.leads}</td>
                  <td className="py-3 px-4 text-gray-600">{item.conversions}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${
                      parseFloat(item.rate.toString()) >= 25 ? 'text-green-600' : 
                      parseFloat(item.rate.toString()) >= 15 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {item.rate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          parseFloat(item.rate.toString()) >= 25 ? 'bg-green-500' : 
                          parseFloat(item.rate.toString()) >= 15 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(parseFloat(item.rate.toString()), 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Task Completion</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {tasks.length > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-600">
              {stats.completedTasks} of {stats.totalTasks} tasks completed
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Overdue Tasks</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {stats.overdueTasks}
            </div>
            <p className="text-sm text-gray-600">
              Tasks past due date
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Active Clients</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {clients.filter(c => c.status === 'customer').length}
            </div>
            <p className="text-sm text-gray-600">
              Current active clients
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}