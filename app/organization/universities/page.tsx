"use client";
import { useState } from "react";
import { useSidebar } from "@/app/context/SidebarContext";
import UniversityForm from "./UniversityForm";
import UniversityTable from "./UniversityTable";

export default function UniversityDirectoryPage() {
  const [view, setView] = useState<'view' | 'add'>('view');
  const [refreshKey, setRefreshKey] = useState(0);
  const { isExpanded, isHovered } = useSidebar();
  const sidebarVisible = isExpanded || isHovered;

  return (
    <div
      className={`flex flex-col min-h-[calc(100vh-120px)] w-full transition-all duration-300 px-2 sm:px-4 md:px-8 ${
        sidebarVisible ? 'lg:px-12 xl:px-16 max-w-[calc(100vw-290px)]' : 'lg:px-4 xl:px-6 max-w-[calc(100vw-90px)]'
      }`}
    >
      {/* Segmented Button Group - right aligned and small */}
      <div className="w-full flex justify-end">
        <div className="flex mb-4 rounded-xl bg-[#181f2c] p-0.5 gap-1 text-sm">
          <button
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors duration-150 focus:outline-none ${view === 'view' ? 'bg-[#232b3b] text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => { setView('view'); setRefreshKey(prev => prev + 1); }}
          >
            View Universities
          </button>
          <button
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors duration-150 focus:outline-none ${view === 'add' ? 'bg-[#232b3b] text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setView('add')}
          >
            Add University
          </button>
        </div>
      </div>
      {/* Responsive container: full width for table, max-w-xl for form */}
      {view === 'add' ? (
        <div className="mx-auto w-full max-w-xl">
          <UniversityForm onSuccess={() => { setView('view'); setRefreshKey(prev => prev + 1); }} />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-7xl transition-all duration-300">
          <UniversityTable refreshKey={refreshKey} />
        </div>
      )}
    </div>
  );
} 