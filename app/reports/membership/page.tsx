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
const UsersIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrendingUpIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17,6 23,6 23,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GraduationCapIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MembershipReportsPage() {
  const { data: session } = useSession();
  const [dateRange, setDateRange] = useState('6months');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Mock data generators
  const generateMembershipGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const newMembers = 20 + (index * 5) + (index % 3) * 10;
      const graduatedMembers = 5 + (index * 2) + (index % 2) * 3;
      const inactiveMembers = 2 + (index % 4);
      const transferredIn = 3 + (index % 2);
      const transferredOut = 1 + (index % 3);
      const netGrowth = newMembers + transferredIn - graduatedMembers - inactiveMembers - transferredOut;
      const totalMembers = 500 + (index * 35) + (index % 3) * 20;
      
      return {
        month,
        newMembers,
        graduatedMembers,
        inactiveMembers,
        transferredIn,
        transferredOut,
        netGrowth,
        totalMembers,
        growthRate: index > 0 ? ((netGrowth / (totalMembers - netGrowth)) * 100) : 0
      };
    });
  };

  const generateMemberTypeData = () => [
    { name: 'Students', value: 65, color: '#3B82F6', count: 1250 },
    { name: 'Graduates', value: 20, color: '#10B981', count: 385 },
    { name: 'Alumni', value: 10, color: '#F59E0B', count: 192 },
    { name: 'Staff', value: 3, color: '#8B5CF6', count: 58 },
    { name: 'Volunteers', value: 2, color: '#EF4444', count: 38 }
  ];

  const generateRegionalData = () => [
    { region: 'North', members: 450, growth: 12, universities: 8 },
    { region: 'South', members: 380, growth: 8, universities: 6 },
    { region: 'East', members: 520, growth: 15, universities: 10 },
    { region: 'West', members: 340, growth: 5, universities: 5 },
    { region: 'Central', members: 290, growth: 3, universities: 4 }
  ];

  const generateGenderData = () => [
    { name: 'Male', value: 55, color: '#3B82F6', count: 1056 },
    { name: 'Female', value: 45, color: '#EC4899', count: 864 }
  ];

  const generateMemberFlowData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => ({
      month,
      increase: 25 + (index * 3) + (index % 2) * 8,
      decrease: 8 + (index * 1) + (index % 3) * 2,
      netChange: (25 + (index * 3) + (index % 2) * 8) - (8 + (index * 1) + (index % 3) * 2),
      cumulativeGrowth: 500 + (index * 20) + (index % 4) * 15
    }));
  };

  // State for data
  const [membershipGrowthData, setMembershipGrowthData] = useState<any[]>([]);
  const [memberTypeData, setMemberTypeData] = useState<any[]>([]);
  const [regionalData, setRegionalData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [memberFlowData, setMemberFlowData] = useState<any[]>([]);

  // Initialize data on client side
  useEffect(() => {
    setIsClient(true);
    setMembershipGrowthData(generateMembershipGrowthData());
    setMemberTypeData(generateMemberTypeData());
    setRegionalData(generateRegionalData());
    setGenderData(generateGenderData());
    setMemberFlowData(generateMemberFlowData());
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
    const latest = membershipGrowthData[membershipGrowthData.length - 1];
    const previous = membershipGrowthData[membershipGrowthData.length - 2];
    const latestFlow = memberFlowData[memberFlowData.length - 1];
    
    const totalMembers = memberTypeData.reduce((sum, type) => sum + type.count, 0);
    const newMembersThisMonth = latest?.newMembers || 0;
    const graduatedMembersThisMonth = latest?.graduatedMembers || 0;
    const netGrowth = latest?.netGrowth || 0;
    const memberIncrease = latestFlow?.increase || 0;
    const memberDecrease = latestFlow?.decrease || 0;
    const netChange = latestFlow?.netChange || 0;
    
    return {
      totalMembers,
      newMembersThisMonth,
      graduatedMembersThisMonth,
      netGrowth,
      memberIncrease,
      memberDecrease,
      netChange,
      growthRate: previous ? ((latest?.totalMembers - previous.totalMembers) / previous.totalMembers * 100) : 0,
      retentionRate: 85
    };
  }, [membershipGrowthData, memberTypeData, memberFlowData]);

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
      pdf.text('Membership Reports & Analytics', pageWidth / 2, 30, { align: 'center' });
      
      // Add report metadata
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      pdf.text(`Report Period: ${dateRangeOptions.find(opt => opt.value === dateRange)?.label || 'Custom'}`, 20, 50);
      if (selectedRegion) {
        pdf.text(`Region: ${regionOptions.find(opt => opt.value === selectedRegion)?.label || selectedRegion}`, 20, 55);
      }
      
      // Add key metrics summary
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', 20, 70);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Members: ${keyMetrics.totalMembers.toLocaleString()}`, 20, 80);
      pdf.text(`New Members This Month: ${keyMetrics.newMembersThisMonth}`, 20, 85);
      pdf.text(`Graduated Members: ${keyMetrics.graduatedMembersThisMonth}`, 20, 90);
      pdf.text(`Net Growth: ${keyMetrics.netGrowth}`, 20, 95);
      pdf.text(`Member Increase: ${keyMetrics.memberIncrease}`, 20, 100);
      pdf.text(`Member Decrease: ${keyMetrics.memberDecrease}`, 20, 105);
      pdf.text(`Net Change: ${keyMetrics.netChange >= 0 ? '+' : ''}${keyMetrics.netChange}`, 20, 110);
      pdf.text(`Growth Rate: ${keyMetrics.growthRate > 0 ? '+' : ''}${keyMetrics.growthRate.toFixed(1)}%`, 20, 115);
      pdf.text(`Retention Rate: ${keyMetrics.retentionRate}%`, 20, 120);
      
      // Save the PDF
      const fileName = `Membership_Report_${new Date().toISOString().split('T')[0]}.pdf`;
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
          <p className="text-gray-500 dark:text-gray-400">Loading membership data...</p>
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
              Membership Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive analysis of member demographics, growth trends, and distribution patterns
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
              <UsersIcon className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Membership Analytics
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
          <div className="flex-1"></div>
          <button
            onClick={() => {
              setDateRange('6months');
              setSelectedRegion('');
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
        <ComponentCard title="Total Members">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.totalMembers.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {keyMetrics.growthRate > 0 ? '+' : ''}{keyMetrics.growthRate.toFixed(1)}% from last period
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="New Members This Month">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.newMembersThisMonth}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">New registrations</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <TrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Graduated Members">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.graduatedMembersThisMonth}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">This month</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <GraduationCapIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Retention Rate">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.retentionRate}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Member retention</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <TrendingUpIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Net Change This Month">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${keyMetrics.netChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {keyMetrics.netChange >= 0 ? '+' : ''}{keyMetrics.netChange}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {keyMetrics.memberIncrease} new, {keyMetrics.memberDecrease} left
              </p>
            </div>
            <div className={`p-3 rounded-full ${keyMetrics.netChange >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              {keyMetrics.netChange >= 0 ? (
                <TrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="23,18 13.5,8.5 8.5,13.5 1,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="17,18 23,18 23,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Charts Row 1 - Growth Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Membership Growth Trends" desc="Monthly new members, graduations, and net growth">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={membershipGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="newMembers" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                  name="New Members"
                />
                <Area 
                  type="monotone" 
                  dataKey="graduatedMembers" 
                  stackId="2" 
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.6}
                  name="Graduated"
                />
                <Area 
                  type="monotone" 
                  dataKey="netGrowth" 
                  stackId="3" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6}
                  name="Net Growth"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>

        <ComponentCard title="Member Type Distribution" desc="Breakdown of members by type and status">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {memberTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>
      </div>

      {/* Charts Row 2 - Member Flow Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Member Increase/Decrease Trends" desc="Monthly member additions and departures with net change">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="increase" fill="#10B981" name="New Members" />
                <Bar dataKey="decrease" fill="#EF4444" name="Departed Members" />
                <Bar dataKey="netChange" fill="#3B82F6" name="Net Change" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>

        <ComponentCard title="Cumulative Growth Trend" desc="Total membership growth over time">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memberFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="cumulativeGrowth" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.6}
                  name="Total Members"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>
      </div>

      {/* Charts Row 3 - Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Regional Distribution" desc="Member count and growth by region">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="members" fill="#8B5CF6" name="Members" />
                <Bar dataKey="growth" fill="#F59E0B" name="Growth %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>

        <ComponentCard title="Gender Distribution" desc="Male vs Female member breakdown">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
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
      <ComponentCard title="AI-Powered Insights & Analysis" desc="Intelligent analysis and data-driven insights based on your membership data">
        <div className="space-y-6">
          {/* Key Insights */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Key Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Strong Growth Trend</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total membership has grown by 15% over the last 6 months, indicating healthy expansion.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Student Dominance</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Students represent 65% of total membership, showing strong campus engagement.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Regional Variations</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">East region leads with 15% growth, while Central region needs attention at 3%.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Age Distribution</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">21-23 age group represents 37% of members, indicating strong young adult engagement.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Gender Balance</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">55% male, 45% female distribution shows good gender representation.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">University Concentration</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">University of Rwanda has the highest member concentration with 180 members.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Member Flow Analysis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Net change of {keyMetrics.netChange >= 0 ? '+' : ''}{keyMetrics.netChange} members this month with {keyMetrics.memberIncrease} additions and {keyMetrics.memberDecrease} departures.</p>
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
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Success Metrics & KPIs to Track</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">2,500</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Target Total Members</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Current: {keyMetrics.totalMembers.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">90%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Target Retention Rate</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Current: {keyMetrics.retentionRate}%</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">20%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Target Annual Growth</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Current: {keyMetrics.growthRate.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
