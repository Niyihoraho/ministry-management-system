"use client";
import { usePathname } from 'next/navigation';
import { SidebarProvider } from "../../context/SidebarContext";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import MainContentWrapper from './MainContentWrapper';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/signin') || pathname?.startsWith('/signup');

  if (isAuthPage) {
    // Auth pages - no sidebar/header
    return <>{children}</>;
  }

  // Main app pages - with sidebar/header
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <MainContentWrapper>
          <AppHeader />
          <main className="flex-1 overflow-y-auto bg-white dark:bg-[#111827] p-4 sm:p-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </MainContentWrapper>
      </div>
    </SidebarProvider>
  );
}
