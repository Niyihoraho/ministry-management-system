import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/app/table";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Badge from "@/app/components/badge/Badge";
import { getStatusColor, getStatusDisplayName } from "@/app/utils/statusColors";
import Pagination from "@/app/components/tables/Pagination";
import UserRoleForm from "./UserRoleForm";

interface User {
  id: string;
  name: string;
  email: string;
  contact?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// API function to fetch users (follows RegionTable axios pattern)
const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get("/api/all-users");
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data.users)) return response.data.users;
    return [];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export default function UserTable({ refreshKey }: { refreshKey?: number }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const rowsPerPage = 7;

  const { data: users, isLoading, error, isError } = useQuery<User[], Error>({
    queryKey: ["users", refreshKey],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery) return users;
    const searchTerm = searchQuery.toLowerCase();
    return users.filter(user =>
      (user.name || "").toLowerCase().includes(searchTerm) ||
      (user.email || "").toLowerCase().includes(searchTerm) ||
      String(user.id).toLowerCase().includes(searchTerm) ||
      (user.contact?.toLowerCase().includes(searchTerm) ?? false) ||
      user.status.toLowerCase().includes(searchTerm)
    );
  }, [users, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser({ id: user.id, name: user.name });
    setShowRoleForm(true);
  };

  const handleRoleFormSuccess = () => {
    setShowRoleForm(false);
    setSelectedUser(null);
  };

  const handleRoleFormCancel = () => {
    setShowRoleForm(false);
    setSelectedUser(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500 dark:text-gray-400">Loading users...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️ Error loading users</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error instanceof Error ? error.message : "Failed to fetch users"}
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

  if (showRoleForm && selectedUser) {
    return (
      <div className="space-y-4">
        <UserRoleForm
          userId={selectedUser.id}
          userName={selectedUser.name}
          onSuccess={handleRoleFormSuccess}
          onCancel={handleRoleFormCancel}
        />
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
            placeholder="Search by name, email, contact, status, or ID..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        {/* Conditional Rendering for No Data */}
        {!currentRows || currentRows.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">👥 No users found</div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : "There are no users to display at the moment."}
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
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>

                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {currentRows.map((user: User) => (
                      <TableRow key={user.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => handleUserClick(user)}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{user.id}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{user.name}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block text-gray-600 text-theme-sm dark:text-gray-400">{user.email}</span>
                        </TableCell>
  
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-white/[0.05]">
              <Pagination
                itemCount={filteredUsers.length}
                pageSize={rowsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}