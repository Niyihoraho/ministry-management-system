import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/app/table";
import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import EditEventModal from "./EditEventModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { PencilIcon, TrashIcon } from "@/app/icons";

interface PermanentMinistryEvent {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  regionId: number | null;
  universityId: number | null;
  smallGroupId: number | null;
  alumniGroupId: number | null;
  region: { id: number; name: string } | null;
  university: { id: number; name: string } | null;
  smallGroup: { id: number; name: string } | null;
  alumniGroup: { id: number; name: string } | null;
}

const fetchEvents = async (): Promise<PermanentMinistryEvent[]> => {
  try {
    // The API already implements RLS filtering based on user's scope
    // It automatically applies scope-based filtering from userrole table
    const response = await axios.get("/api/events");
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data.events)) return response.data.events;
    return [];
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export default function EventTable({ refreshKey }: { refreshKey?: number }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEvent, setEditingEvent] = useState<PermanentMinistryEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<PermanentMinistryEvent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const rowsPerPage = 7;
  const queryClient = useQueryClient();

  const { data: events, isLoading, error, isError } = useQuery<PermanentMinistryEvent[], Error>({
    queryKey: ["permanentMinistryEvents", refreshKey],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (!searchQuery) return events;
    const searchTerm = searchQuery.toLowerCase();
    return events.filter(e =>
      e.name.toLowerCase().includes(searchTerm) ||
      String(e.id).includes(searchTerm) ||
      e.type.toLowerCase().includes(searchTerm) ||
      (e.region?.name?.toLowerCase().includes(searchTerm) ?? false) ||
      (e.university?.name?.toLowerCase().includes(searchTerm) ?? false) ||
      (e.smallGroup?.name?.toLowerCase().includes(searchTerm) ?? false) ||
      (e.alumniGroup?.name?.toLowerCase().includes(searchTerm) ?? false)
    );
  }, [events, searchQuery]);

  const totalPages = Math.ceil(filteredEvents.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredEvents.slice(indexOfFirstRow, indexOfLastRow);

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

  const handleEdit = (event: PermanentMinistryEvent) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleDelete = (event: PermanentMinistryEvent) => {
    setDeletingEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/events/${deletingEvent.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the events list
        queryClient.invalidateQueries({ queryKey: ["permanentMinistryEvents"] });
        setIsDeleteModalOpen(false);
        setDeletingEvent(null);
        // You can add a success toast here if you have a toast system
      } else {
        const errorData = await response.json();
        alert(`Failed to delete event: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingEvent(null);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["permanentMinistryEvents"] });
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500 dark:text-gray-400">Loading events...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️ Error loading events</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error instanceof Error ? error.message : "Failed to fetch events"}
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
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        onSuccess={handleEditSuccess}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        eventName={deletingEvent?.name || ""}
        isDeleting={isDeleting}
      />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-white/[0.05]">
          <input
            type="text"
            placeholder="Search by event name, type, group, or ID..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        {/* Conditional Rendering for No Data */}
        {!currentRows || currentRows.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">📋 No events found</div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : "There are no events to display at the moment."}
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
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Event Name</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Type</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Active</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Region</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">University</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Small Group</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Alumni Small Group</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {currentRows.map((event: PermanentMinistryEvent) => (
                      <TableRow key={event.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{event.id}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{event.name}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{event.type}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${event.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{event.isActive ? 'Active' : 'Inactive'}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{event.region?.name || "N/A"}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{event.university?.name || "N/A"}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{event.smallGroup?.name || "N/A"}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{event.alumniGroup?.name || "N/A"}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(event)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                              title="Edit event"
                            >
                              <PencilIcon />
                            </button>
                            <button
                              onClick={() => handleDelete(event)}
                              disabled={isDeleting}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                              title="Delete event"
                            >
                              <TrashIcon />
                            </button>
                          </div>
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