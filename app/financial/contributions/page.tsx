"use client";

import React, { useState, useMemo } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/app/table";
import Badge from "@/app/components/badge/Badge";
import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";
import { getStatusColor, getStatusDisplayName } from "@/app/utils/statusColors";

// Mock data for contributions
const mockContributions = [
  {
    id: 1,
    contributor: "John Doe",
    amount: 100,
    method: "mobile_money",
    status: "completed",
    date: "2024-07-24",
    designation: "Building Fund",
  },
  {
    id: 2,
    contributor: "Jane Smith",
    amount: 50,
    method: "bank_transfer",
    status: "pending",
    date: "2024-07-23",
    designation: "Scholarship",
  },
  {
    id: 3,
    contributor: "Alice Johnson",
    amount: 75,
    method: "card",
    status: "failed",
    date: "2024-07-22",
    designation: "Building Fund",
  },
  {
    id: 4,
    contributor: "Bob Lee",
    amount: 200,
    method: "worldremit",
    status: "completed",
    date: "2024-07-21",
    designation: "Medical Aid",
  },
];

const allDesignations = [
  "Building Fund",
  "Scholarship",
  "Medical Aid",
];

// Using standardized status colors from utils

export default function ContributionsPage() {
  // --- Hooks ---
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDesignationModal, setShowDesignationModal] = useState(false);
  const [designationName, setDesignationName] = useState("");
  const [designationDescription, setDesignationDescription] = useState("");
  const [designationTarget, setDesignationTarget] = useState("");
  const [designations, setDesignations] = useState(allDesignations);

  const rowsPerPage = 7;

  // --- Search and Filter Logic ---
  const filteredContributions = useMemo(() => {
    let filtered = mockContributions;
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter((c) =>
        [c.contributor, c.method, c.status, c.date, c.amount.toString(), c.designation]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm)
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    if (designationFilter) {
      filtered = filtered.filter((c) => c.designation === designationFilter);
    }
    return filtered;
  }, [searchQuery, statusFilter, designationFilter]);

  // Add Designation handler
  const handleAddDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designationName.trim()) return;
    if (designations.includes(designationName.trim())) return;
    setDesignations((prev) => [...prev, designationName.trim()]);
    setDesignationName("");
    setDesignationDescription("");
    setDesignationTarget("");
    setShowDesignationModal(false);
  };

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredContributions.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredContributions.slice(indexOfFirstRow, indexOfLastRow);

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

  // --- Main Component JSX ---
  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Add Contribution
            </button>
            <button
              onClick={() => setShowDesignationModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              + Add Designation
            </button>
          </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-white/[0.05] flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by contributor, method, status, date, amount, designation..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={designationFilter}
            onChange={(e) => { setDesignationFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Designations</option>
            {designations.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        {/* Table */}
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Contributor</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Amount</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Method</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Designation</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {currentRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                      No contributions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRows.map((c) => (
                    <TableRow key={c.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                      <TableCell className="px-5 py-4 sm:px-6 text-gray-800 font-medium text-theme-sm dark:text-white/90 text-start">{c.contributor}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-gray-500 text-start text-theme-sm dark:text-gray-400">{c.amount} RWF</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-gray-500 text-start text-theme-sm dark:text-gray-400 capitalize">{c.method.replace("_", " ")}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-gray-500 text-start text-theme-sm dark:text-gray-400">{c.designation}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge size="sm" color={getStatusColor(c.status)}>{getStatusDisplayName(c.status)}</Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-gray-500 text-start text-theme-sm dark:text-gray-400">{c.date}</TableCell>
                    </TableRow>
                  ))
                )}
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
      </div>
      {/* Modal placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Contribution</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Form coming soon...</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Add Designation Modal */}
      {showDesignationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="w-full max-w-md">
            <ComponentCard title="Add Contribution Designation">
              <form onSubmit={handleAddDesignation} className="space-y-6">
                <div>
                  <Label htmlFor="designationName">Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="designationName"
                    name="designationName"
                    type="text"
                    value={designationName}
                    onChange={(e) => setDesignationName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="designationDescription">Description</Label>
                  <Input
                    id="designationDescription"
                    name="designationDescription"
                    type="text"
                    value={designationDescription}
                    onChange={(e) => setDesignationDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="designationTarget">Target Amount</Label>
                  <Input
                    id="designationTarget"
                    name="designationTarget"
                    type="text"
                    value={designationTarget}
                    onChange={(e) => setDesignationTarget(e.target.value)}
                    placeholder="Enter target amount"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowDesignationModal(false)}
                    className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              </form>
            </ComponentCard>
          </div>
        </div>
      )}
    </div>
  );
} 