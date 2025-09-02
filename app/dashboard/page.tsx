"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSidebar } from '@/app/context/SidebarContext';
import ComponentCard from '@/app/components/common/ComponentCard';
import { 
  UserCircleIcon, 
  CalenderIcon, 
  PieChartIcon, 
  TableIcon,
  BoxCubeIcon,
  PlugInIcon,
  GridIcon,
  ChevronDownIcon
} from '@/app/icons';

// Simple icon components for missing icons
const ShieldIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

const BookOpenIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckCircleIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DollarSignIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrendingUpIcon = (props: any) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17,6 23,6 23,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function DashboardPage() {
  const { isExpanded, isHovered } = useSidebar();
  const { data: session, status } = useSession();
  const sidebarVisible = isExpanded || isHovered;

  // Scoped role state from API
  const [scopedRole, setScopedRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState<boolean>(false);

  useEffect(() => {
    const loadRole = async () => {
      if (!session?.user?.id) return;
      setLoadingRole(true);
      try {
        const res = await fetch('/api/user-roles');
        if (res.ok) {
          const data = await res.json();
          setScopedRole(data.role ?? null);
        } else {
          setScopedRole(null);
        }
      } catch {
        setScopedRole(null);
      } finally {
        setLoadingRole(false);
      }
    };
    loadRole();
  }, [session?.user?.id]);

  // Helpers
  const getDashboardTitle = () => "Ministry Management Dashboard";

  const mapScopeToRoleName = (scope?: string | null) => {
    switch (scope) {
      case 'superadmin':
        return 'System Administrator';
      case 'national':
        return 'National Administrator';
      case 'region':
        return 'Regional Administrator';
      case 'university':
        return 'University Administrator';
      case 'smallgroup':
        return 'Small Group Administrator';
      case 'alumnismallgroup':
        return 'Alumni Small Group Admin';
      default:
        return 'User';
    }
  };

  const userName = session?.user?.name || session?.user?.email || 'User';
  const roleDisplayName = mapScopeToRoleName(scopedRole);

  // Mock stats data (keep existing visuals)
  const stats = {
    totalMembers: "1,234",
    totalEvents: "45",
    totalTrainings: "12",
    totalAttendanceRecords: "8,567",
    totalContributions: "45,678",
    activeSmallGroups: "24",
    pendingApprovals: "7"
  };

  const hasScope = Boolean(scopedRole);

  return (
    <div
      className={`flex flex-col min-h-[calc(100vh-120px)] w-full transition-all duration-300 px-2 sm:px-4 md:px-8 ${
        sidebarVisible ? 'lg:px-12 xl:px-16 max-w-[calc(100vw-290px)]' : 'lg:px-4 xl:px-6 max-w-[calc(100vw-90px)]'
      }`}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getDashboardTitle()}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {status === 'loading' ? (
                  'Loading session...'
                ) : (
                  <>
                    Welcome back, {userName} • {loadingRole ? 'Loading role...' : roleDisplayName}
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldIcon className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Role-Based Access
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ComponentCard title="Members">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMembers}</p>
                {hasScope && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Filtered by scope</p>
                )}
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Events">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEvents}</p>
                {hasScope && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Filtered by scope</p>
                )}
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CalenderIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Trainings">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trainings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTrainings}</p>
                {hasScope && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Filtered by scope</p>
                )}
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <BookOpenIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Attendance Records">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAttendanceRecords}</p>
                {hasScope && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Filtered by scope</p>
                )}
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Contributions">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contributions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalContributions}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <DollarSignIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Active Groups">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Groups</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeSmallGroups}</p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <TrendingUpIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Pending Approvals">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingApprovals}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <ShieldIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Access Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComponentCard title="Your Access Scope">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Role Name:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {loadingRole ? 'Loading...' : roleDisplayName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Scope:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {hasScope ? scopedRole : 'Global'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Data Access:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {hasScope ? 'Scoped Data' : 'All Data'}
                </span>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Available Features">
            <div className="space-y-2">
              {['Member Management','Event Planning','Training Programs','Attendance Tracking','Financial Reports','System Administration'].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
