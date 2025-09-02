import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/app/table";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Badge from "@/app/components/badge/Badge";
import { getStatusColor, getStatusDisplayName } from "@/app/utils/statusColors";

interface Training {
  id: number;
  name: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string | null;
  location: string | null;
  regionId: number | null;
  universityId: number | null;
  smallGroupId: number | null;
  alumniGroupId: number | null;
  createdById: number;
  region?: { id: number; name: string } | null;
  university?: { id: number; name: string } | null;
  smallGroup?: { id: number; name: string } | null;
  alumniGroup?: { id: number; name: string } | null;
  createdBy?: { id: number; name: string } | null;
  createdAt: string;
}

const fetchTrainings = async (): Promise<Training[]> => {
  try {
    const response = await axios.get("/api/trainings");
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data.trainings)) return response.data.trainings;
    return [];
  } catch (error) {
    console.error("Error fetching trainings:", error);
    throw error;
  }
};

export default function TrainingTable({ refreshKey }: { refreshKey?: number }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 7;

  const { data: trainings, isLoading, error, isError } = useQuery<Training[], Error>({
    queryKey: ["trainings", refreshKey],
    queryFn: fetchTrainings,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filteredTrainings = useMemo(() => {
    if (!trainings) return [];
    if (!searchQuery) return trainings;
    const searchTerm = searchQuery.toLowerCase();
    return trainings.filter(t =>
      t.name.toLowerCase().includes(searchTerm) ||
      String(t.id).includes(searchTerm) ||
      (t.description?.toLowerCase().includes(searchTerm) ?? false) ||
      (t.location?.toLowerCase().includes(searchTerm) ?? false)
    );
  }, [trainings, searchQuery]);

  const totalPages = Math.ceil(filteredTrainings.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredTrainings.slice(indexOfFirstRow, indexOfLastRow);

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

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrainingStatus = (startDateTime: string, endDateTime: string | null) => {
    const now = new Date();
    const start = new Date(startDateTime);
    const end = endDateTime ? new Date(endDateTime) : null;
    
    if (now < start) {
      return 'upcoming';
    } else if (end && now > end) {
      return 'completed';
    } else {
      return 'ongoing';
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500 dark:text-gray-400">Loading training programs...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️ Error loading training programs</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error instanceof Error ? error.message : "Failed to fetch training programs"}
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
            placeholder="Search by training name, description, or location..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        {/* Conditional Rendering for No Data */}
        {!currentRows || currentRows.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">📋 No training programs found</div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : "There are no training programs to display at the moment."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1000px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Training Name</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Start Date</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Location</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {currentRows.map((training: Training) => (
                      <TableRow key={training.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{training.id}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{training.name}</span>
                            {training.description && (
                              <span className="block text-gray-500 text-xs dark:text-gray-400 max-w-xs truncate">
                                {training.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block text-gray-600 text-theme-sm dark:text-gray-400">
                            {formatDateTime(training.startDateTime)}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block text-gray-600 text-theme-sm dark:text-gray-400">
                            {training.location || "Not specified"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <Badge 
                            size="sm" 
                            color={getStatusColor(getTrainingStatus(training.startDateTime, training.endDateTime))}
                          >
                            {getStatusDisplayName(getTrainingStatus(training.startDateTime, training.endDateTime))}
                          </Badge>
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