import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/app/table";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Region {
  id: number;
  name: string;
}

const fetchRegions = async (): Promise<Region[]> => {
  try {
    const response = await axios.get("/api/regions");
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data.regions)) return response.data.regions;
    return [];
  } catch (error) {
    console.error("Error fetching regions:", error);
    throw error;
  }
};

export default function RegionTable({ refreshKey }: { refreshKey?: number }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 7;

  const { data: regions, isLoading, error, isError } = useQuery<Region[], Error>({
    queryKey: ["regions", refreshKey],
    queryFn: fetchRegions,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filteredRegions = useMemo(() => {
    if (!regions) return [];
    if (!searchQuery) return regions;
    const searchTerm = searchQuery.toLowerCase();
    return regions.filter(region =>
      region.name.toLowerCase().includes(searchTerm) ||
      String(region.id).includes(searchTerm)
    );
  }, [regions, searchQuery]);

  const totalPages = Math.ceil(filteredRegions.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRegions.slice(indexOfFirstRow, indexOfLastRow);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500 dark:text-gray-400">Loading regions...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️ Error loading regions</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error instanceof Error ? error.message : "Failed to fetch regions"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-white/[0.05]">
          <input
            type="text"
            placeholder="Search by region name or ID..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        {/* Conditional Rendering for No Data */}
        {!currentRows || currentRows.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">📋 No regions found</div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : "There are no regions to display at the moment."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[400px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Region Name</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {currentRows.map((region: Region) => (
                      <TableRow key={region.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{region.id}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{region.name}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-white/[0.05]">
                <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">Previous</button>
                <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 