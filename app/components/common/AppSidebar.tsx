'use client';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSidebar } from '@/app/context/SidebarContext';
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from '../../icons/index';
import SidebarWidget from './SidebarWidget';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Extend the session user type to include role
interface ExtendedSession {
  user: {
    id?: string;
    role?: string;
  } & any;
}

const AppSidebar: React.FC = () => {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: 'main' | 'others';
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [userScopedRole, setUserScopedRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(false);

  // Get user role from session (will be 'superadmin' for all authenticated users)
  const userRole = session?.user?.role;

  // Fetch user's scoped role from userrole table
  useEffect(() => {
    const fetchUserScopedRole = async () => {
      if (session?.user?.id) {
        setIsLoadingRole(true);
        try {
          console.log('Fetching scoped role for user:', session.user.id);
          const response = await fetch('/api/user-roles');
          console.log('API response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('API response data:', data);
            setUserScopedRole(data.role);
          } else {
            console.error('API response not ok:', response.status, response.statusText);
            const errorData = await response.json().catch(() => ({}));
            console.error('API error data:', errorData);
          }
        } catch (error) {
          console.error('Error fetching user scoped role:', error);
        } finally {
          setIsLoadingRole(false);
        }
      } else {
        console.log('No session user ID available');
        setUserScopedRole(null);
      }
    };

    fetchUserScopedRole();
  }, [session?.user?.id]);

  // Debug logging
  useEffect(() => {
    console.log('Current session role:', userRole);
    console.log('Current scoped role:', userScopedRole);
    console.log('Is loading role:', isLoadingRole);
  }, [userRole, userScopedRole, isLoadingRole]);

  

  // Define navigation items with role-based filtering
  const navItems = useMemo((): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        icon: <GridIcon />,
        name: 'Home',
        path: '/dashboard',
      },
      {
        icon: <UserCircleIcon />,
        name: 'People Management',
        subItems: [
          { name: 'Member Directory', path: '/people/members', pro: false },
          { name: 'Member Import', path: '/people/import', pro: false },
        ],
      },
  {
    icon: <BoxCubeIcon />,
    name: 'Organization',
    subItems: [
      { name: 'Regions', path: '/organization/regions', pro: false },
      { name: 'Universities', path: '/organization/universities', pro: false },
      { name: 'Small Groups', path: '/organization/small-groups', pro: false },
      { name: 'Alumni Small Groups', path: '/organization/alumni-small-groups', pro: false },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: 'Activities',
    subItems: [
      { name: 'Attendance Tracking', path: '/activities/attendance', pro: false },
      { name: 'Events', path: '/activities/events', pro: false },
      { name: 'Training Programs', path: '/activities/training', pro: false },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: 'Financial Management',
    subItems: [
      { name: 'Contributions', path: '/financial/contributions', pro: false },
      { name: 'Budget Management', path: '/financial/budget', pro: false },
      { name: 'Designations', path: '/financial/designations', pro: false },
      { name: 'Financial Reports', path: '/financial/reports', pro: false },
    ],
  },
  {
    icon: <TableIcon />,
    name: 'Reports & Analytics',
    subItems: [
      { name: 'Membership Reports', path: '/reports/membership', pro: false },
      { name: 'Financial Reports', path: '/reports/financial', pro: false },
      { name: 'Engagement Reports', path: '/reports/engagement', pro: false },
    ],
  },
    ];

    // Only show System Administration for users with superadmin scoped role
    if (userScopedRole === 'superadmin' || (isLoadingRole && userRole === 'superadmin')) {
      baseItems.push({
        icon: <PlugInIcon />,
        name: 'System Administration',
        subItems: [
          { name: 'User Management', path: '/admin/user-management', pro: false },
          { name: 'Role Requests', path: '/admin/roles', pro: false },
          { name: 'Emergency Access', path: '/admin/emergency', pro: false },
        ],
      });
    }

    return baseItems;
    // Dependency array ensures this only recalculates when these values change
  }, [userScopedRole, isLoadingRole, userRole]);

  const othersItems: NavItem[] = [
  {
    icon: <UserCircleIcon />,
    name: 'User Profile',
    path: '/profile',
  },
  {
    icon: <CalenderIcon />,
    name: 'Calendar',
    path: '/calendar',
  },
  {
    icon: <PlugInIcon />,
    name: 'Authentication',
    subItems: [
      { name: 'Sign In', path: '/signin', pro: false },
      { name: 'Sign Up', path: '/signup', pro: false },
    ],
  },
];

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const isParentActive = useCallback(
    (nav: NavItem) => {
      if (nav.path && isActive(nav.path)) return true;
      if (nav.subItems) {
        return nav.subItems.some(sub => isActive(sub.path));
      }
      return false;
    },
    [isActive]
  );

  const getOpenSubmenu = useCallback(() => {
    for (const menuType of ['main', 'others'] as const) {
      const items = menuType === 'main' ? navItems : othersItems;
      for (let index = 0; index < items.length; index++) {
        const nav = items[index];
        if (nav.subItems && nav.subItems.some(sub => isActive(sub.path))) {
          return { type: menuType, index };
        }
      }
    }
    return null;
  }, [isActive, navItems]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen, setIsMobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  // Always keep the correct parent menu open if any subitem is active
  useEffect(() => {
    const open = getOpenSubmenu();
    setOpenSubmenu(open);
  }, [pathname, getOpenSubmenu]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight(prevHeights => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: 'main' | 'others') => {
    setOpenSubmenu(prevOpenSubmenu => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (navItems: NavItem[], menuType: 'main' | 'others') => (
    <ul className="space-y-1">
      {navItems.map((nav, index) => {
        const parentActive = isParentActive(nav);
        const isSubmenuOpen = openSubmenu?.type === menuType && openSubmenu?.index === index;
        
        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`group flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${parentActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}
                  ${!isExpanded && !isHovered && !isMobileOpen ? 'lg:justify-center' : 'justify-start'}
                `}
              >
                <span
                  className={`text-lg flex-shrink-0 transition-colors duration-200
                    ${parentActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400'}
                  `}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="flex-1 text-left truncate">{nav.name}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200
                        ${isSubmenuOpen ? 'rotate-180' : ''}
                        ${parentActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}
                      `}
                    />
                  </>
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`group flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive(nav.path)
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}
                    ${!isExpanded && !isHovered && !isMobileOpen ? 'lg:justify-center' : 'justify-start'}
                  `}
                >
                  <span
                    className={`text-lg flex-shrink-0 transition-colors duration-200
                      ${isActive(nav.path)
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400'}
                    `}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="flex-1 text-left truncate">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            
            {/* Submenu */}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={el => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  height: isSubmenuOpen ? `${subMenuHeight[`${menuType}-${index}`]}px` : '0px',
                }}
              >
                <ul className="mt-1 space-y-1 ml-8 pb-2">
                  {nav.subItems.map(subItem => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                          ${isActive(subItem.path)
                            ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/10 dark:text-blue-400'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'}
                        `}
                      >
                        <span className="flex-1 truncate">{subItem.name}</span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                          {subItem.new && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-400">
                              NEW
                            </span>
                          )}
                          {subItem.pro && (
                            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-orange-900/30 dark:text-orange-400">
                              PRO
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed lg:relative top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out z-50 flex flex-col
          ${isExpanded || isMobileOpen
            ? 'w-72'
            : isHovered
            ? 'w-72'
            : 'w-16'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        onMouseEnter={() => !isExpanded && !isMobileOpen && setIsHovered(true)}
        onMouseLeave={() => !isMobileOpen && setIsHovered(false)}
      >
        {/* Logo Section */}
        <div
          className={`flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0
            ${!isExpanded && !isHovered && !isMobileOpen ? 'justify-center' : 'justify-start'}
          `}
        >
          <Link href="/" className="flex items-center">
            {isExpanded || isHovered || isMobileOpen ? (
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-r.png"
                  alt="Company Logo"
                  width={40}
                  height={40}
                  className="object-contain flex-shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    Ministry
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Management System
                  </span>
                </div>
              </div>
            ) : (
              <Image
                src="/logo.png"
                alt="Company Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            )}
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-none">
          <nav className="space-y-8">
            {/* Main Menu */}
            <div>
              <h2
                className={`mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider
                  ${!isExpanded && !isHovered && !isMobileOpen
                    ? 'flex justify-center'
                    : 'px-3'}
                `}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  'MENU'
                ) : (
                  <HorizontaLDots className="w-4 h-4" />
                )}
              </h2>
              {renderMenuItems(navItems, 'main')}
            </div>

            {/* Others Menu */}
            <div>
              <h2
                className={`mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider
                  ${!isExpanded && !isHovered && !isMobileOpen
                    ? 'flex justify-center'
                    : 'px-3'}
                `}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  'OTHERS'
                ) : (
                  <HorizontaLDots className="w-4 h-4" />
                )}
              </h2>
              {renderMenuItems(othersItems, 'others')}
            </div>
          </nav>
        </div>

        {/* Sidebar Widget */}
        {(isExpanded || isHovered || isMobileOpen) && (
          <div className="px-4 pb-4 flex-shrink-0">
            <SidebarWidget />
          </div>
        )}
      </aside>
    </>
  );
};

export default AppSidebar;