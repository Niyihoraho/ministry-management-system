"use client";

import { useState, useEffect, useMemo, useRef } from 'react';

import { useQuery } from '@tanstack/react-query';
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
  LineChart,
  Line,
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
import { useSession } from 'next-auth/react';

// Icons
const TrendingUpIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17,6 23,6 23,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UsersIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const ActivityIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Mock data for demonstration - in real implementation, this would come from APIs
const generateMockEngagementData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  // Use deterministic values based on month index to avoid hydration mismatch
  return months.slice(0, currentMonth + 1).map((month, index) => ({
    month,
    attendance: 120 + (index * 15) + (index % 3) * 20,
    events: 8 + (index * 2) + (index % 2),
    newMembers: 15 + (index * 3) + (index % 4),
    activeMembers: 100 + (index * 20) + (index % 5) * 10,
    engagementScore: 75 + (index * 2) + (index % 3) * 5
  }));
};

const generateEventEngagementData = (category?: string, eventType?: string, trainingType?: string) => {
  const allEvents = [
    { name: 'Bible Study', attendance: 85, engagement: 92, category: 'event', type: 'bible_study' },
    { name: 'Prayer Meeting', attendance: 78, engagement: 88, category: 'event', type: 'prayer_meeting' },
    { name: 'Fellowship', attendance: 95, engagement: 96, category: 'event', type: 'fellowship' },
    { name: 'Discipleship', attendance: 70, engagement: 85, category: 'event', type: 'discipleship' },
    { name: 'Evangelism', attendance: 45, engagement: 75, category: 'event', type: 'evangelism' },
    { name: 'Cell Meeting', attendance: 60, engagement: 80, category: 'event', type: 'cell_meeting' },
    { name: 'Alumni Meeting', attendance: 40, engagement: 70, category: 'event', type: 'alumni_meeting' },
    { name: 'Leadership Training', attendance: 30, engagement: 90, category: 'training', type: 'leadership' },
    { name: 'Ministry Training', attendance: 35, engagement: 88, category: 'training', type: 'ministry' },
    { name: 'Skills Training', attendance: 25, engagement: 82, category: 'training', type: 'skills' },
    { name: 'Spiritual Growth Training', attendance: 28, engagement: 85, category: 'training', type: 'spiritual_growth' },
    { name: 'Biblical Studies Training', attendance: 32, engagement: 87, category: 'training', type: 'biblical_studies' },
    { name: 'Evangelism Training', attendance: 22, engagement: 80, category: 'training', type: 'evangelism_training' },
    { name: 'Discipleship Training', attendance: 26, engagement: 83, category: 'training', type: 'discipleship_training' },
    { name: 'Worship Training', attendance: 20, engagement: 78, category: 'training', type: 'worship_training' }
  ];

  let filteredEvents = allEvents;

  if (category) {
    filteredEvents = filteredEvents.filter(event => event.category === category);
  }

  if (eventType) {
    filteredEvents = filteredEvents.filter(event => event.type === eventType);
  }

  if (trainingType) {
    filteredEvents = filteredEvents.filter(event => event.type === trainingType);
  }

  return filteredEvents.map(({ name, attendance, engagement }) => ({ name, attendance, engagement }));
};

const generateMemberEngagementData = () => [
  { name: 'Highly Engaged', value: 35, color: '#10B981' },
  { name: 'Moderately Engaged', value: 45, color: '#F59E0B' },
  { name: 'Low Engagement', value: 20, color: '#EF4444' }
];

const generateRegionalData = () => [
  { region: 'North', members: 450, events: 25, attendance: 85 },
  { region: 'South', members: 380, events: 22, attendance: 78 },
  { region: 'East', members: 520, events: 30, attendance: 92 },
  { region: 'West', members: 340, events: 18, attendance: 75 },
  { region: 'Central', members: 290, events: 15, attendance: 68 }
];

export default function EngagementReportsPage() {
  const { data: session } = useSession();
  const [dateRange, setDateRange] = useState('6months');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [selectedTrainingType, setSelectedTrainingType] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Mock data - only generate on client side to avoid hydration mismatch
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [eventEngagementData, setEventEngagementData] = useState<any[]>([]);
  const [memberEngagementData, setMemberEngagementData] = useState<any[]>([]);
  const [regionalData, setRegionalData] = useState<any[]>([]);

  // Initialize data on client side
  useEffect(() => {
    setIsClient(true);
    setEngagementData(generateMockEngagementData());
    setEventEngagementData(generateEventEngagementData());
    setMemberEngagementData(generateMemberEngagementData());
    setRegionalData(generateRegionalData());
  }, []);

  // Update event engagement data when filters change
  useEffect(() => {
    if (isClient) {
      setEventEngagementData(generateEventEngagementData(selectedCategory, selectedEventType, selectedTrainingType));
    }
  }, [selectedCategory, selectedEventType, selectedTrainingType, isClient]);

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
    const latest = engagementData[engagementData.length - 1];
    const previous = engagementData[engagementData.length - 2];
    
    return {
      totalMembers: latest?.activeMembers || 0,
      totalEvents: latest?.events || 0,
      avgAttendance: latest?.attendance || 0,
      engagementScore: latest?.engagementScore || 0,
      memberGrowth: previous ? ((latest.activeMembers - previous.activeMembers) / previous.activeMembers * 100) : 0,
      attendanceGrowth: previous ? ((latest.attendance - previous.attendance) / previous.attendance * 100) : 0
    };
  }, [engagementData]);

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

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'event', label: 'Events' },
    { value: 'training', label: 'Training' }
  ];

  const eventTypeOptions = [
    { value: '', label: 'All Event Types' },
    { value: 'bible_study', label: 'Bible Study' },
    { value: 'prayer_meeting', label: 'Prayer Meeting' },
    { value: 'fellowship', label: 'Fellowship' },
    { value: 'discipleship', label: 'Discipleship' },
    { value: 'evangelism', label: 'Evangelism' },
    { value: 'cell_meeting', label: 'Cell Meeting' },
    { value: 'alumni_meeting', label: 'Alumni Meeting' },
    { value: 'other', label: 'Other' }
  ];

  const trainingTypeOptions = [
    { value: '', label: 'All Training Types' },
    { value: 'leadership', label: 'Leadership Training' },
    { value: 'ministry', label: 'Ministry Training' },
    { value: 'skills', label: 'Skills Training' },
    { value: 'spiritual_growth', label: 'Spiritual Growth' },
    { value: 'biblical_studies', label: 'Biblical Studies' },
    { value: 'evangelism_training', label: 'Evangelism Training' },
    { value: 'discipleship_training', label: 'Discipleship Training' },
    { value: 'worship_training', label: 'Worship Training' },
    { value: 'other', label: 'Other' }
  ];

  // PDF Export Function
  const exportToPDF = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Ministry Management System', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Engagement Reports & Analytics', pageWidth / 2, 30, { align: 'center' });
      
      // Add report metadata
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      pdf.text(`Report Period: ${dateRangeOptions.find(opt => opt.value === dateRange)?.label || 'Custom'}`, 20, 50);
      if (selectedCategory) {
        pdf.text(`Category: ${categoryOptions.find(opt => opt.value === selectedCategory)?.label || selectedCategory}`, 20, 55);
      }
      if (selectedEventType) {
        pdf.text(`Event Type: ${eventTypeOptions.find(opt => opt.value === selectedEventType)?.label || selectedEventType}`, 20, 60);
      }
      if (selectedTrainingType) {
        pdf.text(`Training Type: ${trainingTypeOptions.find(opt => opt.value === selectedTrainingType)?.label || selectedTrainingType}`, 20, 60);
      }
      if (selectedRegion) {
        const yPosition = selectedEventType || selectedTrainingType ? 65 : 55;
        pdf.text(`Region: ${regionOptions.find(opt => opt.value === selectedRegion)?.label || selectedRegion}`, 20, yPosition);
      }
      
      // Add key metrics summary
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', 20, 70);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Active Members: ${keyMetrics.totalMembers}`, 20, 80);
      pdf.text(`Total Events: ${keyMetrics.totalEvents}`, 20, 85);
      pdf.text(`Average Attendance: ${keyMetrics.avgAttendance}`, 20, 90);
      pdf.text(`Engagement Score: ${keyMetrics.engagementScore}%`, 20, 95);
      pdf.text(`Member Growth: ${keyMetrics.memberGrowth > 0 ? '+' : ''}${keyMetrics.memberGrowth.toFixed(1)}%`, 20, 100);
      pdf.text(`Attendance Growth: ${keyMetrics.attendanceGrowth > 0 ? '+' : ''}${keyMetrics.attendanceGrowth.toFixed(1)}%`, 20, 105);
      
      // Add insights section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Insights', 20, 120);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const insights = [
        '• Member engagement has increased by 15% over the last 3 months',
        '• Tuesday and Thursday evenings show 40% higher engagement rates',
        '• East region leads with 92% attendance rate',
        '• Fellowship events achieve 96% engagement rate',
        '• 20% of members show low engagement - opportunity for improvement',
        '• 45% of highly engaged members show leadership potential'
      ];
      
      let yPosition = 130;
      insights.forEach(insight => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(insight, 20, yPosition);
        yPosition += 8;
      });
      
      
      // Add footer
      // Note: Footer functionality can be added later with proper jsPDF version
      
      // Save the PDF
      const fileName = `Engagement_Report_${new Date().toISOString().split('T')[0]}.pdf`;
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
          <p className="text-gray-500 dark:text-gray-400">Loading engagement data...</p>
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
              Engagement Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive analysis of member engagement, attendance patterns, and activity trends
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
              <ActivityIcon className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Analytics Dashboard
              </span>
              {(selectedCategory || selectedEventType || selectedTrainingType || selectedRegion) && (
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Filters:</span>
                  {selectedCategory && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      {categoryOptions.find(opt => opt.value === selectedCategory)?.label}
                    </span>
                  )}
                  {selectedEventType && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                      {eventTypeOptions.find(opt => opt.value === selectedEventType)?.label}
                    </span>
                  )}
                  {selectedTrainingType && (
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full">
                      {trainingTypeOptions.find(opt => opt.value === selectedTrainingType)?.label}
                    </span>
                  )}
                  {selectedRegion && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                      {regionOptions.find(opt => opt.value === selectedRegion)?.label}
                    </span>
                  )}
                </div>
              )}
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
          <div className="min-w-[180px]">
            <Label htmlFor="category">Category</Label>
            <Select
              options={categoryOptions}
              value={selectedCategory}
              onChange={(value) => {
                setSelectedCategory(value);
                setSelectedEventType(''); // Reset event type when category changes
                setSelectedTrainingType(''); // Reset training type when category changes
              }}
            />
          </div>
          {selectedCategory === 'event' && (
            <div className="min-w-[180px]">
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                options={eventTypeOptions}
                value={selectedEventType}
                onChange={setSelectedEventType}
              />
            </div>
          )}
          {selectedCategory === 'training' && (
            <div className="min-w-[180px]">
              <Label htmlFor="trainingType">Training Type</Label>
              <Select
                options={trainingTypeOptions}
                value={selectedTrainingType}
                onChange={setSelectedTrainingType}
              />
            </div>
          )}
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
              setSelectedUniversity('');
              setSelectedCategory('');
              setSelectedEventType('');
              setSelectedTrainingType('');
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Filter Summary */}
      {(selectedCategory || selectedEventType || selectedTrainingType || selectedRegion) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Showing data for: 
              {selectedCategory && ` ${categoryOptions.find(opt => opt.value === selectedCategory)?.label}`}
              {selectedEventType && ` > ${eventTypeOptions.find(opt => opt.value === selectedEventType)?.label}`}
              {selectedTrainingType && ` > ${trainingTypeOptions.find(opt => opt.value === selectedTrainingType)?.label}`}
              {selectedRegion && ` in ${regionOptions.find(opt => opt.value === selectedRegion)?.label}`}
            </span>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ComponentCard title="Total Active Members">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.totalMembers}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {keyMetrics.memberGrowth > 0 ? '+' : ''}{keyMetrics.memberGrowth.toFixed(1)}% from last period
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Events">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.totalEvents}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">This period</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <CalendarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Average Attendance">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.avgAttendance}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {keyMetrics.attendanceGrowth > 0 ? '+' : ''}{keyMetrics.attendanceGrowth.toFixed(1)}% from last period
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <TrendingUpIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Engagement Score">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.engagementScore}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall engagement</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <ActivityIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Engagement Trends Over Time" desc="Monthly engagement metrics and attendance patterns">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="attendance" 
                  stackId="1" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="activeMembers" 
                  stackId="2" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>

        <ComponentCard 
          title={selectedCategory === 'training' ? 'Training Engagement Analysis' : selectedCategory === 'event' ? 'Event Engagement Analysis' : 'Event & Training Engagement Analysis'} 
          desc={selectedCategory ? `Attendance and engagement rates by ${selectedCategory} type` : 'Attendance and engagement rates by event and training type'}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventEngagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#3B82F6" name="Attendance" />
                <Bar dataKey="engagement" fill="#10B981" name="Engagement %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Member Engagement Distribution" desc="Breakdown of member engagement levels">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberEngagementData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {memberEngagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>

        <ComponentCard title="Regional Performance Comparison" desc="Member count and event activity by region">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="members" fill="#8B5CF6" name="Members" />
                <Bar dataKey="events" fill="#F59E0B" name="Events" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>
      </div>

      {/* Detailed Analytics */}
      <ComponentCard title="Detailed Engagement Analytics" desc="Comprehensive breakdown of engagement metrics">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Peak Engagement Times</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Tuesday: 7:00 PM - 9:00 PM</li>
                <li>• Thursday: 6:30 PM - 8:30 PM</li>
                <li>• Sunday: 10:00 AM - 12:00 PM</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Top Performing Events</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Fellowship Events: 96% engagement</li>
                <li>• Bible Study: 92% engagement</li>
                <li>• Prayer Meetings: 88% engagement</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Growth Indicators</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• New Member Retention: 78%</li>
                <li>• Event Attendance Growth: +12%</li>
                <li>• Leadership Development: +8%</li>
              </ul>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* AI-Powered Insights */}
      <ComponentCard title="AI-Powered Insights & Analysis" desc="Intelligent analysis and data-driven insights based on your engagement data">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Member engagement has increased by 15% over the last 3 months, indicating effective community building strategies.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Peak Performance Times</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tuesday and Thursday evenings show 40% higher engagement rates than other days.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Regional Variations</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">East region leads with 92% attendance rate, while Central region needs attention at 68%.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Event Type Success</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fellowship events achieve 96% engagement, suggesting social connection drives participation.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Retention Opportunity</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">20% of members show low engagement - targeted outreach could improve retention.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Leadership Pipeline</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">45% of highly engaged members show leadership potential for development programs.</p>
                  </div>
                </div>
                {selectedCategory === 'event' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Event-Specific Insights</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedEventType === 'bible_study' ? 'Bible Study sessions show 92% engagement rate with consistent attendance patterns.' :
                         selectedEventType === 'fellowship' ? 'Fellowship events achieve the highest engagement at 96% due to social connection focus.' :
                         selectedEventType === 'prayer_meeting' ? 'Prayer meetings maintain 88% engagement with strong spiritual participation.' :
                         'Event-based activities show varying engagement levels based on member interests and scheduling.'}
                      </p>
                    </div>
                  </div>
                )}
                {selectedCategory === 'training' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Training-Specific Insights</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedTrainingType === 'leadership' ? 'Leadership Training shows 90% engagement with strong development outcomes.' :
                         selectedTrainingType === 'ministry' ? 'Ministry Training maintains 88% engagement with practical skill building.' :
                         selectedTrainingType === 'skills' ? 'Skills Training achieves 82% engagement with hands-on learning focus.' :
                         selectedTrainingType === 'spiritual_growth' ? 'Spiritual Growth Training shows 85% engagement with deep personal development.' :
                         selectedTrainingType === 'biblical_studies' ? 'Biblical Studies Training maintains 87% engagement with theological depth.' :
                         selectedTrainingType === 'evangelism_training' ? 'Evangelism Training shows 80% engagement with outreach focus.' :
                         selectedTrainingType === 'discipleship_training' ? 'Discipleship Training achieves 83% engagement with mentoring focus.' :
                         selectedTrainingType === 'worship_training' ? 'Worship Training shows 78% engagement with creative expression focus.' :
                         'Training programs show high engagement rates (78-90%) with focused skill development outcomes.'}
                      </p>
                    </div>
                  </div>
                )}
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
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">85%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Target Overall Engagement</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Current: {keyMetrics.engagementScore}%</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">90%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Target Attendance Rate</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Current: {Math.round((keyMetrics.avgAttendance / keyMetrics.totalMembers) * 100)}%</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">25%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Target New Member Retention</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Current: 78%</div>
              </div>
            </div>
          </div>

        </div>
      </ComponentCard>
    </div>
  );
} 