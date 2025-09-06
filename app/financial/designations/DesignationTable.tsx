import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/app/table";
import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import EditDesignationModal from "./EditDesignationModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { PencilIcon, TrashIcon } from "@/app/icons";

interface Designation {
  id: number;
  name: string;
  description: string | null;
  targetAmount: number | null;
  currentAmount: number;
  isActive: boolean;
  regionId: number | null;
  universityId: number | null;
  smallGroupId: number | null;
  region?: { id: number; name: string } | null;
  university?: { id: number; name: string } | null;
  smallgroup?: { id: number; name: string } | null;
  createdAt: string;
}

const fetchDesignations = async (): Promise<Designation[]> => {
  try {
    const response = await axios.get("/api/designations");
    if (Array.isArray(response.data)) return response.data;
    return [];
  } catch (error) {
    console.error("Error fetching designations:", error);
    throw error;
  }
};

export default function DesignationTable({ refreshKey }: { refreshKey?: number }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingDesignation, setDeletingDesignation] = useState<Designation | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const rowsPerPage = 7;
  const queryClient = useQueryClient();

  const { data: designations, isLoading, error, isError } = useQuery<Designation[], Error>({
    queryKey: ["designations", refreshKey],
    queryFn: fetchDesignations,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filteredDesignations = useMemo(() => {
    if (!designations) return [];
    if (!searchQuery) return designations;
    const searchTerm = searchQuery.toLowerCase();
    return designations.filter(d =>
      d.name.toLowerCase().includes(searchTerm) ||
      String(d.id).includes(searchTerm) ||
      (d.description?.toLowerCase().includes(searchTerm) ?? false)
    );
  }, [designations, searchQuery]);

  const totalPages = Math.ceil(filteredDesignations.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredDesignations.slice(indexOfFirstRow, indexOfLastRow);

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

  const handleEdit = (designation: Designation) => {
    setEditingDesignation(designation);
    setIsEditModalOpen(true);
  };

  const handleDelete = (designation: Designation) => {
    setDeletingDesignation(designation);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDesignation) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/designations/${deletingDesignation.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the designations list
        queryClient.invalidateQueries({ queryKey: ["designations"] });
        setIsDeleteModalOpen(false);
        setDeletingDesignation(null);
        // You can add a success toast here if you have a toast system
      } else {
        const errorData = await response.json();
        alert(`Failed to delete designation: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting designation:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingDesignation(null);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["designations"] });
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500 dark:text-gray-400">Loading designations...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️ Error loading designations</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error instanceof Error ? error.message : "Failed to fetch designations"}
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
      <EditDesignationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDesignation(null);
        }}
        designation={editingDesignation}
        onSuccess={handleEditSuccess}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        designationName={deletingDesignation?.name || ""}
        isDeleting={isDeleting}
      />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-white/[0.05]">
          <input
            type="text"
            placeholder="Search by designation name or description..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        {/* Conditional Rendering for No Data */}
        {!currentRows || currentRows.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">📋 No designations found</div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : "There are no designations to display at the moment."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Designation Name</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Description</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Target Amount</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {currentRows.map((designation: Designation) => (
                      <TableRow key={designation.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{designation.id}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{designation.name}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block text-gray-600 text-theme-sm dark:text-gray-400 max-w-xs truncate">
                            {designation.description || "No description"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block text-gray-600 text-theme-sm dark:text-gray-400">
                            {designation.targetAmount ? `RWF ${designation.targetAmount.toLocaleString()}` : "Not set"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            designation.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {designation.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(designation)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                              title="Edit designation"
                            >
                              <PencilIcon />
                            </button>
                            <button
                              onClick={() => handleDelete(designation)}
                              disabled={isDeleting}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                              title="Delete designation"
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