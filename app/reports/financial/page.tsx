"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import ComponentCard from '@/app/components/common/ComponentCard';
import Select from '@/app/components/common/Select';
import Label from '@/app/components/common/Label';
import Input from '@/app/components/input/InputField';
import CurrentScopeDisplay from '@/app/components/common/CurrentScopeDisplay';
import SuperAdminScopeSelector from '@/app/components/common/SuperAdminScopeSelector';
import RoleBasedComponent from '@/app/components/common/RoleBasedComponent';

// Icons
const DollarIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrendingUpIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17,6 23,6 23,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrendingDownIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <polyline points="23,18 13.5,8.5 8.5,13.5 1,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17,18 23,18 23,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PieChartIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 12A10 10 0 0 0 12 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WalletIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 0 2H5a2 2 0 0 0 0 4h14a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function FinancialReportsPage() {
  const { data: session } = useSession();
  const [dateRange, setDateRange] = useState('6months');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Mock data generators
  const generateFinancialTrendsData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => ({
      month,
      income: 15000 + (index * 2000) + (index % 3) * 1500,
      expenses: 8000 + (index * 1200) + (index % 2) * 800,
      netProfit: 7000 + (index * 800) + (index % 3) * 700,
      budget: 12000 + (index * 1500) + (index % 4) * 1000,
      contributions: 12000 + (index * 1800) + (index % 3) * 1200
    }));
  };

  const generateIncomeSourcesData = () => [
    { name: 'Member Contributions', value: 45, color: '#3B82F6', amount: 45000 },
    { name: 'Alumni Donations', value: 25, color: '#10B981', amount: 25000 },
    { name: 'Event Fees', value: 15, color: '#F59E0B', amount: 15000 },
    { name: 'Training Fees', value: 10, color: '#8B5CF6', amount: 10000 },
    { name: 'Other Income', value: 5, color: '#EF4444', amount: 5000 }
  ];

  const generateExpenseCategoriesData = () => [
    { name: 'Staff Salaries', value: 35, color: '#3B82F6', amount: 35000 },
    { name: 'Event Costs', value: 25, color: '#10B981', amount: 25000 },
    { name: 'Training Materials', value: 15, color: '#F59E0B', amount: 15000 },
    { name: 'Facility Rent', value: 15, color: '#8B5CF6', amount: 15000 },
    { name: 'Administrative', value: 10, color: '#EF4444', amount: 10000 }
  ];

  const generateDesignationData = () => [
    { designation: 'General Fund', target: 50000, current: 45000, percentage: 90 },
    { designation: 'Building Fund', target: 30000, current: 28000, percentage: 93 },
    { designation: 'Mission Fund', target: 20000, current: 15000, percentage: 75 },
    { designation: 'Training Fund', target: 15000, current: 12000, percentage: 80 },
    { designation: 'Emergency Fund', target: 10000, current: 8500, percentage: 85 }
  ];

  const generateRegionalFinancialData = () => [
    { region: 'North', income: 45000, expenses: 30000, profit: 15000, contributors: 120 },
    { region: 'South', income: 38000, expenses: 25000, profit: 13000, contributors: 95 },
    { region: 'East', income: 52000, expenses: 35000, profit: 17000, contributors: 140 },
    { region: 'West', income: 34000, expenses: 22000, profit: 12000, contributors: 85 },
    { region: 'Central', income: 29000, expenses: 18000, profit: 11000, contributors: 75 }
  ];

  const generatePaymentMethodData = () => [
    { method: 'Mobile Money', count: 45, amount: 45000, color: '#3B82F6' },
    { method: 'Bank Transfer', count: 30, amount: 30000, color: '#10B981' },
    { method: 'Card Payment', count: 20, amount: 20000, color: '#F59E0B' },
    { method: 'WorldRemit', count: 5, amount: 5000, color: '#8B5CF6' }
  ];

  // State for data
  const [financialTrendsData, setFinancialTrendsData] = useState<any[]>([]);
  const [incomeSourcesData, setIncomeSourcesData] = useState<any[]>([]);
  const [expenseCategoriesData, setExpenseCategoriesData] = useState<any[]>([]);
  const [designationData, setDesignationData] = useState<any[]>([]);
  const [regionalFinancialData, setRegionalFinancialData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);

  // Initialize data on client side
  useEffect(() => {
    setIsClient(true);
    setFinancialTrendsData(generateFinancialTrendsData());
    setIncomeSourcesData(generateIncomeSourcesData());
    setExpenseCategoriesData(generateExpenseCategoriesData());
    setDesignationData(generateDesignationData());
    setRegionalFinancialData(generateRegionalFinancialData());
    setPaymentMethodData(generatePaymentMethodData());
  }, []);

  // Check if user is super admin
  useEffect(() => {
    fetch("/api/members/current-user-scope")
      .then(res => res.json())
      .then(data => {
        if (data.scope) {
          setIsSuperAdmin(data.scope.scope === 'superadmin');
        }
      })
      .catch(err => {
        console.error("Failed to fetch user scope:", err);
      });
  }, []);

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    const latest = financialTrendsData[financialTrendsData.length - 1];
    const previous = financialTrendsData[financialTrendsData.length - 2];
    
    const totalIncome = incomeSourcesData.reduce((sum, source) => sum + source.amount, 0);
    const totalExpenses = expenseCategoriesData.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    
    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      monthlyIncome: latest?.income || 0,
      monthlyExpenses: latest?.expenses || 0,
      monthlyProfit: latest?.netProfit || 0,
      incomeGrowth: previous ? ((latest?.income - previous.income) / previous.income * 100) : 0,
      expenseGrowth: previous ? ((latest?.expenses - previous.expenses) / previous.expenses * 100) : 0
    };
  }, [financialTrendsData, incomeSourcesData, expenseCategoriesData]);

  const dateRangeOptions = [
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' },
    { value: 'all', label: 'All Time' }
  ];

  const regionOptions = [
    { value: '', label: 'All Regions' },
    { value: 'north', label: 'North Region' },
    { value: 'south', label: 'South Region' },
    { value: 'east', label: 'East Region' },
    { value: 'west', label: 'West Region' },
    { value: 'central', label: 'Central Region' }
  ];

  const designationOptions = [
    { value: '', label: 'All Designations' },
    { value: 'general', label: 'General Fund' },
    { value: 'building', label: 'Building Fund' },
    { value: 'mission', label: 'Mission Fund' },
    { value: 'training', label: 'Training Fund' },
    { value: 'emergency', label: 'Emergency Fund' }
  ];

  // PDF Export Function
  const exportToPDF = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Ministry Management System', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Financial Reports & Analytics', pageWidth / 2, 30, { align: 'center' });
      
      // Add report metadata
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      pdf.text(`Report Period: ${dateRangeOptions.find(opt => opt.value === dateRange)?.label || 'Custom'}`, 20, 50);
      if (selectedRegion) {
        pdf.text(`Region: ${regionOptions.find(opt => opt.value === selectedRegion)?.label || selectedRegion}`, 20, 55);
      }
      if (selectedDesignation) {
        pdf.text(`Designation: ${designationOptions.find(opt => opt.value === selectedDesignation)?.label || selectedDesignation}`, 20, 60);
      }
      
      // Add key metrics summary
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', 20, 75);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Income: RWF ${keyMetrics.totalIncome.toLocaleString()}`, 20, 85);
      pdf.text(`Total Expenses: RWF ${keyMetrics.totalExpenses.toLocaleString()}`, 20, 90);
      pdf.text(`Net Profit: RWF ${keyMetrics.netProfit.toLocaleString()}`, 20, 95);
      pdf.text(`Profit Margin: ${keyMetrics.profitMargin.toFixed(1)}%`, 20, 100);
      pdf.text(`Monthly Income: RWF ${keyMetrics.monthlyIncome.toLocaleString()}`, 20, 105);
      pdf.text(`Monthly Expenses: RWF ${keyMetrics.monthlyExpenses.toLocaleString()}`, 20, 110);
      pdf.text(`Monthly Profit: RWF ${keyMetrics.monthlyProfit.toLocaleString()}`, 20, 115);
      pdf.text(`Income Growth: ${keyMetrics.incomeGrowth > 0 ? '+' : ''}${keyMetrics.incomeGrowth.toFixed(1)}%`, 20, 120);
      
      // Save the PDF
      const fileName = `Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Show loading state until client-side data is ready
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={reportRef}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Financial Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive analysis of income, expenses, contributions, and financial health
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export PDF Report</span>
                </>
              )}
            </button>
            <div className="flex items-center space-x-2">
              <DollarIcon className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Financial Analytics
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Selector */}
      {isSuperAdmin ? (
        <SuperAdminScopeSelector onScopeChange={() => {}} />
      ) : (
        <CurrentScopeDisplay onScopeChange={() => {}} />
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[180px]">
            <Label htmlFor="dateRange">Time Period</Label>
            <Select
              options={dateRangeOptions}
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
          <div className="min-w-[150px]">
            <Label htmlFor="dateFrom">From Date</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="min-w-[150px]">
            <Label htmlFor="dateTo">To Date</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
            />
          </div>
          <RoleBasedComponent requiredRole="superadmin">
            <div className="min-w-[180px]">
              <Label htmlFor="region">Region</Label>
              <Select
                options={regionOptions}
                value={selectedRegion}
                onChange={setSelectedRegion}
              />
            </div>
          </RoleBasedComponent>
          <div className="min-w-[180px]">
            <Label htmlFor="designation">Designation</Label>
            <Select
              options={designationOptions}
              value={selectedDesignation}
              onChange={setSelectedDesignation}
            />
          </div>
          <div className="flex-1"></div>
          <button
            onClick={() => {
              setDateRange('6months');
              setSelectedRegion('');
              setSelectedDesignation('');
              setDateFrom('');
              setDateTo('');
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <ComponentCard title="Total Income">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">RWF {keyMetrics.totalIncome.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {keyMetrics.incomeGrowth > 0 ? '+' : ''}{keyMetrics.incomeGrowth.toFixed(1)}% from last period
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <TrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Expenses">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">RWF {keyMetrics.totalExpenses.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {keyMetrics.expenseGrowth > 0 ? '+' : ''}{keyMetrics.expenseGrowth.toFixed(1)}% from last period
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <TrendingDownIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Net Profit">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${keyMetrics.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                RWF {keyMetrics.netProfit.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">This period</p>
            </div>
            <div className={`p-3 rounded-full ${keyMetrics.netProfit >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              {keyMetrics.netProfit >= 0 ? (
                <TrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDownIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Profit Margin">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${keyMetrics.profitMargin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {keyMetrics.profitMargin.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Margin percentage</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <PieChartIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Monthly Profit">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${keyMetrics.monthlyProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                RWF {keyMetrics.monthlyProfit.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">This month</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <WalletIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Charts Row 1 - Financial Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Financial Trends Over Time" desc="Monthly income, expenses, and profit trends">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                  name="Income"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="2" 
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.6}
                  name="Expenses"
                />
                <Area 
                  type="monotone" 
                  dataKey="netProfit" 
                  stackId="3" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6}
                  name="Net Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>

        <ComponentCard title="Income Sources Distribution" desc="Breakdown of income by source">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeSourcesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeSourcesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>
      </div>

      {/* Charts Row 2 - Expenses and Designations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Expense Categories" desc="Breakdown of expenses by category">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseCategoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>

        <ComponentCard title="Designation Progress" desc="Progress towards designation targets">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={designationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="designation" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="current" fill="#3B82F6" name="Current Amount" />
                <Bar dataKey="target" fill="#10B981" name="Target Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>
      </div>

      {/* Charts Row 3 - Regional and Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Regional Financial Performance" desc="Income, expenses, and profit by region">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalFinancialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                <Bar dataKey="profit" fill="#3B82F6" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>

        <ComponentCard title="Payment Methods Distribution" desc="Contributions by payment method">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, percent }) => `${method} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>
      </div>

      {/* AI-Powered Insights */}
      <ComponentCard title="AI-Powered Financial Insights & Analysis" desc="Intelligent analysis and data-driven insights based on your financial data">
        <div className="space-y-6">
          {/* Key Insights */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Key Financial Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Strong Financial Health</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Net profit margin of {keyMetrics.profitMargin.toFixed(1)}% indicates healthy financial management.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Member Contributions Lead</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">45% of income comes from member contributions, showing strong community support.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Regional Variations</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">East region shows highest profitability with $17,000 profit this period.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Designation Progress</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Building Fund leads with 93% of target achieved, showing strong donor commitment.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Payment Preferences</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mobile Money dominates with 45% of transactions, reflecting local payment trends.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Expense Management</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Staff salaries represent 35% of expenses, indicating investment in human resources.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Metrics & KPIs */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Financial KPIs & Targets</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">25%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Target Profit Margin</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Current: {keyMetrics.profitMargin.toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">RWF 150M</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Annual Income Target</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Current: RWF {keyMetrics.totalIncome.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">90%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Designation Completion</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Average: 85%</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">15%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Income Growth Target</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Current: {keyMetrics.incomeGrowth.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
} 
