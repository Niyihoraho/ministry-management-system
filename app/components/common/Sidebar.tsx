"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../../context/SidebarContext";
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
} from "../../icons/index";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Ecommerce", path: "/", pro: false }],
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
  },
  {
    name: "Forms",
    icon: <ListIcon />,
    subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  {
    name: "Tables",
    icon: <TableIcon />,
    subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
  },
  {
    name: "Pages",
    icon: <PageIcon />,
    subItems: [
      { name: "Blank Page", path: "/blank", pro: false },
      { name: "404 Error", path: "/error-404", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
      { name: "Images", path: "/images", pro: false },
      { name: "Videos", path: "/videos", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Check if any submenu item is active for a parent menu
  const hasActiveSubItem = useCallback((nav: NavItem) => {
    if (!nav.subItems) return false;
    return nav.subItems.some((subItem) => isActive(subItem.path));
  }, [isActive]);

  // Check if parent menu should be highlighted (has active subitem)
  const isParentActive = useCallback((nav: NavItem) => {
    if (nav.path && isActive(nav.path)) return true;
    return hasActiveSubItem(nav);
  }, [isActive, hasActiveSubItem]);

  // Initialize open submenus based on current path
  useEffect(() => {
    const newOpenSubmenus = new Set<string>();
    
    // Check main menu items
    navItems.forEach((nav, index) => {
      if (nav.subItems && hasActiveSubItem(nav)) {
        newOpenSubmenus.add(`main-${index}`);
      }
    });
    
    // Check others menu items
    othersItems.forEach((nav, index) => {
      if (nav.subItems && hasActiveSubItem(nav)) {
        newOpenSubmenus.add(`others-${index}`);
      }
    });
    
    setOpenSubmenus(newOpenSubmenus);
  }, [pathname, hasActiveSubItem]);

  const toggleSubmenu = (menuType: "main" | "others", index: number) => {
    const key = `${menuType}-${index}`;
    setOpenSubmenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const isSubmenuOpen = (menuType: "main" | "others", index: number) => {
    return openSubmenus.has(`${menuType}-${index}`);
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-1">
      {navItems.map((nav, index) => {
        const parentActive = isParentActive(nav);
        const submenuOpen = isSubmenuOpen(menuType, index);
        
        return (
          <li key={nav.name}>
            {/* Parent Menu Item */}
            {nav.subItems ? (
              <button
                onClick={() => toggleSubmenu(menuType, index)}
                className={`group flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${parentActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"}
                  ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}
                `}
              >
                <span
                  className={`text-lg flex-shrink-0 transition-colors duration-200
                    ${parentActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400"}
                  `}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="flex-1 text-left">{nav.name}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200
                        ${submenuOpen ? "rotate-180" : ""}
                        ${parentActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"}
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
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"}
                    ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}
                  `}
                >
                  <span
                    className={`text-lg flex-shrink-0 transition-colors duration-200
                      ${isActive(nav.path)
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400"}
                    `}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="flex-1 text-left">{nav.name}</span>
                  )}
                </Link>
              )
            )}

            {/* Submenu Items */}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  submenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <ul className="mt-2 space-y-1 ml-8 pb-2">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                          ${isActive(subItem.path)
                            ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/10 dark:text-blue-400"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"}
                        `}
                      >
                        <span className="flex-1">{subItem.name}</span>
                        <span className="flex items-center gap-1">
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
    <aside
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out z-50
        ${isExpanded || isMobileOpen
          ? "w-72"
          : isHovered
          ? "w-72"
          : "w-16"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:mt-0 mt-16 px-4`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div
        className={`py-6 flex items-center ${
          !isExpanded && !isHovered && !isMobileOpen ? "justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-2">
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={120}
                height={32}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={120}
                height={32}
              />
            </div>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <nav className="flex-1 space-y-6">
          {/* Main Menu */}
          <div>
            <h2
              className={`mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                !isExpanded && !isHovered && !isMobileOpen
                  ? "flex justify-center"
                  : "px-3"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "MENU"
              ) : (
                <HorizontaLDots className="w-4 h-4" />
              )}
            </h2>
            {renderMenuItems(navItems, "main")}
          </div>

          {/* Others Menu */}
          <div>
            <h2
              className={`mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                !isExpanded && !isHovered && !isMobileOpen
                  ? "flex justify-center"
                  : "px-3"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "OTHERS"
              ) : (
                <HorizontaLDots className="w-4 h-4" />
              )}
            </h2>
            {renderMenuItems(othersItems, "others")}
          </div>
        </nav>

        {/* Sidebar Widget */}
        {(isExpanded || isHovered || isMobileOpen) && (
          <div className="mt-6 pb-4">
            <SidebarWidget />
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;