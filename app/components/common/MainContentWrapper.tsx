"use client";

import { useSidebar } from "@/app/context/SidebarContext";
import { ReactNode } from "react";

interface MainContentWrapperProps {
  children: ReactNode;
}

export default function MainContentWrapper({ children }: MainContentWrapperProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  
  // On mobile, always take full width
  // On desktop, adjust based on sidebar state
  const shouldAdjustForSidebar = isExpanded || isHovered;
  
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-[#111827] transition-all duration-300 ease-in-out">
      {children}
    </div>
  );
}