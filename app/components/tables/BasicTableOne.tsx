import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/app/table";
import React, { useState } from "react";
import Badge from "../badge/Badge";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Interface for the Member data structure
interface Member {
  id: number;
  firstname: string;
  secondname: string;
  gender: string | null;
  birthdate: string | null;
  placeOfBirthDistrict: string | null;
  placeOfBirthSector: string | null;
  placeOfBirthCell: string | null;
  placeOfBirthVillage: string | null;
  localChurch: string | null;
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

// API function to fetch all members (no pagination)
const fetchMembers = async (): Promise<Member[]> => {
  try {
    // This fetches all members. Pagination will be handled on the client-side.
    const response = await axios.get("/api/members");
    // If the API returns { members: [...] }, extract the array
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data.members)) return response.data.members;
    return [];
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
};

export default function BasicTableOne() {
  // Move all hooks to the top
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;
  const { data: members, isLoading, error, isError } = useQuery<Member[], Error>({
    queryKey: ["members"],
    queryFn: fetchMembers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  // --- Pagination Logic ---
  const totalPages = members ? Math.ceil(members.length / rowsPerPage) : 0;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = members ? members.slice(indexOfFirstRow, indexOfLastRow) : [];
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  // --- End Pagination Logic ---
  // Helper function to format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  // Helper function to format birthplace
  const formatBirthPlace = (member: Member) => {
    const places = [
      member.placeOfBirthDistrict,
      member.placeOfBirthSector,
      member.placeOfBirthCell,
      member.placeOfBirthVillage,
    ].filter(Boolean); // Filter out null/undefined/empty strings
    return places.length > 0 ? places.join(", ") : "N/A";
  };
  // Loading state
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500 dark:text-gray-400">Loading members...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️ Error loading members</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error instanceof Error ? error.message : "Failed to fetch members"}
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

  // No data state
  if (!members || members.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">📋 No members found</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              There are no members to display at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1400px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Member</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Contact</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Birth Info</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Type & Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Church & Groups</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Education</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Personal</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {currentRows.map((member: Member) => (
                  <TableRow key={member.id}>
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
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            ID: {member.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    {/* Contact Cell */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>
                        <span className="block text-theme-sm">{member.email}</span>
                        <span className="block text-theme-xs text-gray-400">{member.phone}</span>
                      </div>
                    </TableCell>
                    {/* Birth Info Cell */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>
                        <span className="block text-theme-sm capitalize">{member.gender || "N/A"}</span>
                        <span className="block text-theme-xs text-gray-400">{formatDate(member.birthdate)}</span>
                        <span className="block text-theme-xs text-gray-400">{formatBirthPlace(member)}</span>
                      </div>
                    </TableCell>
                    {/* Type & Status Cell */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex flex-col gap-1">
                        <span className="capitalize text-theme-sm">{member.type}</span>
                        <Badge
                          size="sm"
                          color={
                            member.status === "active" ? "success"
                            : member.status === "pre_graduate" ? "warning"
                            : member.status === "alumni" ? "info"
                            : "error"
                          }
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </TableCell>
                    {/* Church & Groups Cell */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>
                        <span className="block text-theme-sm">{member.localChurch || "N/A"}</span>
                        <span className="block text-theme-xs text-gray-400">Region: {member.regionId || "N/A"}</span>
                        <span className="block text-theme-xs text-gray-400">Small Group: {member.smallGroupId || "N/A"}</span>
                        {member.alumniGroupId && (
                          <span className="block text-theme-xs text-gray-400">Alumni Group: {member.alumniGroupId}</span>
                        )}
                      </div>
                    </TableCell>
                    {/* Education Cell */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>
                        <span className="block text-theme-sm">University: {member.universityId || "N/A"}</span>
                        <span className="block text-theme-xs text-gray-400">Faculty: {member.faculty || "N/A"}</span>
                        <span className="block text-theme-xs text-gray-400">Graduation: {formatDate(member.graduationDate)}</span>
                      </div>
                    </TableCell>
                    {/* Personal Cell */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>
                        <span className="block text-theme-sm">{member.maritalStatus || "N/A"}</span>
                        <span className="block text-theme-xs text-gray-400">Profession: {member.professionalism || "N/A"}</span>
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
      </div>
    </div>
  );
}
