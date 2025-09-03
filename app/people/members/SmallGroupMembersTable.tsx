import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/app/table";
import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Interface for the Member data structure
interface Member {
  id: number;
  firstname: string;
  secondname: string;
  gender: string | null;
  birthdate: string | null;
  email: string;
  phone: string;
  type: string;
  status: string;
  regionId: number | null;
  universityId: number | null;
  smallGroupId: number | null;
  alumniGroupId: number | null;
  graduationDate: string | null;
  faculty: string | null;
  professionalism: string | null;
  maritalStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

// API function to fetch small group members
const fetchSmallGroupMembers = async (): Promise<Member[]> => {
  try {
    const response = await axios.get("/api/members");
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data.members)) return response.data.members;
    return [];
  } catch (error) {
    console.error("Error fetching small group members:", error);
    throw error;
  }
};

export default function SmallGroupTable({ refreshKey }: { refreshKey?: number }) {
  // --- Hooks ---
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const rowsPerPage = 7;

  // --- Data Fetching & Side Effects ---
  const { data: members, isLoading, error, isError } = useQuery<Member[], Error>({
    queryKey: ["smallGroupTable", refreshKey],
    queryFn: fetchSmallGroupMembers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // --- Helper Functions ---
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };



  // --- Search and Filter Logic ---
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (!searchQuery) return members;

    const searchTerm = searchQuery.toLowerCase();

    return members.filter(member => {
      const searchableContent = [
        member.firstname,
        member.secondname,
        member.email,
        member.phone,
        formatDate(member.birthdate),
        member.gender
      ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

      return searchableContent.includes(searchTerm);
    });
  }, [members, searchQuery]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredMembers.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredMembers.slice(indexOfFirstRow, indexOfLastRow);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to the first page on a new search
  };

  // --- Conditional Rendering for States ---
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                     <span className="ml-3 text-gray-500 dark:text-gray-400">Loading small group table...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
                         <div className="text-red-500 text-lg mb-2">⚠️ Error loading small group table</div>
             <p className="text-gray-500 dark:text-gray-400 mb-4">
               {error instanceof Error ? error.message : "Failed to fetch small group table"}
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

  // --- Main Component JSX ---
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-white/[0.05]">
          <input
            type="text"
                         placeholder="Search by name, email, phone, gender..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Conditional Rendering for No Data */}
        {!currentRows || currentRows.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
                             <div className="text-gray-400 text-lg mb-2">👥 No small group table found</div>
               <p className="text-gray-500 dark:text-gray-400 mb-4">
                 {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : "There are no small group table to display at the moment."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Member</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Contact Information</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Birth Information</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {currentRows.map((member: Member) => (
                      <TableRow
                        key={member.id}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        onClick={() => router.push(`/people/members/${member.id}`)}
                      >
                        {/* Member Cell */}
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                                {member.firstname?.charAt(0) || ''}{member.secondname?.charAt(0) || ''}
                              </span>
                            </div>
                                                         <div>
                               <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                 {member.firstname} {member.secondname}
                               </span>
                             </div>
                          </div>
                        </TableCell>

                        {/* Contact Information Cell */}
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div>
                            <span className="block text-theme-sm font-medium text-gray-800 dark:text-white">
                              {member.email || "N/A"}
                            </span>
                            <span className="block text-theme-xs text-gray-400 mt-1">
                              {member.phone || "No phone number"}
                            </span>
                          </div>
                        </TableCell>

                                                 {/* Birth Information Cell */}
                         <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                           <div>
                             <span className="block text-theme-sm font-medium text-gray-800 dark:text-white">
                               {formatDate(member.birthdate)}
                             </span>
                             {member.gender && (
                               <span className="block text-theme-xs text-gray-400 mt-1 capitalize">
                                 {member.gender}
                               </span>
                             )}
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
                <button 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
