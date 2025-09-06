import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/app/table";
import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import EditContributionModal from "./EditContributionModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { PencilIcon, TrashIcon } from "@/app/icons";
import Badge from "@/app/components/badge/Badge";
import { getStatusColor, getStatusDisplayName } from "@/app/utils/statusColors";

interface Contribution {
    id: number;
    contributorId: number;
    amount: number;
    method: "mobile_money" | "bank_transfer" | "card" | "worldremit";
    designationId: number | null;
    status: "pending" | "completed" | "failed" | "refunded" | "processing" | "cancelled";
    transactionId: string | null;
    paymentTransactionId: number | null;
    memberId: number | null;
    createdAt: string;
    contributor: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
    };
    contributiondesignation: {
        id: number;
        name: string;
        description: string | null;
    } | null;
    member: {
        id: number;
        firstname: string | null;
        secondname: string | null;
        email: string | null;
    } | null;
    paymenttransaction: {
        id: number;
        externalId: string;
        status: string;
    } | null;
}

const fetchContributions = async (): Promise<Contribution[]> => {
    try {
        const response = await axios.get("/api/contributions");
        if (Array.isArray(response.data)) return response.data;
        return [];
    } catch (error) {
        console.error("Error fetching contributions:", error);
        throw error;
    }
};

export default function ContributionTable({ refreshKey }: { refreshKey?: number }) {
    // --- Hooks ---
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [methodFilter, setMethodFilter] = useState("");
    const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
    const [deletingContribution, setDeletingContribution] = useState<Contribution | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const queryClient = useQueryClient();
    const rowsPerPage = 7;

    const { data: contributions = [], isLoading, error, isError } = useQuery<Contribution[], Error>({
        queryKey: ["contributions", refreshKey],
        queryFn: fetchContributions,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });

    // --- Helper Functions ---
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    const formatMethod = (method: string) => {
        return method.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
    };

    // --- Search and Filter Logic ---
    const filteredContributions = useMemo(() => {
        if (!contributions) return [];
        
        let filtered = contributions;
        
        if (searchQuery) {
            const searchTerm = searchQuery.toLowerCase();
            filtered = filtered.filter((c) => {
                const searchableContent = [
                    c.id,
                    c.contributor.name,
                    c.contributor.email,
                    c.contributor.phone,
                    c.amount.toString(),
                    formatMethod(c.method),
                    c.status,
                    c.contributiondesignation?.name || "",
                    c.transactionId || "",
                    formatDate(c.createdAt),
                    c.member?.firstname || "",
                    c.member?.secondname || "",
                    c.member?.email || ""
                ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

                return searchableContent.includes(searchTerm);
            });
        }
        
        if (statusFilter) {
            filtered = filtered.filter((c) => c.status === statusFilter);
        }
        
        if (methodFilter) {
            filtered = filtered.filter((c) => c.method === methodFilter);
        }
        
        return filtered;
    }, [contributions, searchQuery, statusFilter, methodFilter]);

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
        setCurrentPage(1); // Reset to the first page on a new search
    };

    const handleEdit = (contribution: Contribution) => {
        setEditingContribution(contribution);
        setShowEditModal(true);
    };

    const handleDelete = (contribution: Contribution) => {
        setDeletingContribution(contribution);
        setShowDeleteModal(true);
    };

    const handleEditSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ["contributions"] });
        setShowEditModal(false);
        setEditingContribution(null);
    };

    const handleDeleteSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ["contributions"] });
        setShowDeleteModal(false);
        setDeletingContribution(null);
    };

    // --- Conditional Rendering for States ---
    if (isLoading) {
        return (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-500 dark:text-gray-400">Loading contributions...</span>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="text-red-500 text-lg mb-2">⚠️ Error loading contributions</div>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {error instanceof Error ? error.message : "Failed to fetch contributions"}
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
                        placeholder="Search by contributor, method, status, amount, designation..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                </div>

                {/* Filter Controls */}
                <div className="p-4 border-b border-gray-200 dark:border-white/[0.05] flex flex-col sm:flex-row gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="processing">Processing</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                    </select>
                    <select
                        value={methodFilter}
                        onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">All Methods</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="card">Card</option>
                        <option value="worldremit">WorldRemit</option>
                    </select>
                </div>

                {/* Conditional Rendering for No Data */}
                {!currentRows || currentRows.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="text-gray-400 text-lg mb-2">💰 No contributions found</div>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : "There are no contributions to display at the moment."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[1200px]">
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Contributor</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Amount & Method</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Designation & Status</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Transaction Details</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date & Actions</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {currentRows.map((contribution) => (
                                            <TableRow key={contribution.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                                {/* Contributor Cell */}
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                            <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                                                                {contribution.contributor.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                                {contribution.contributor.name}
                                                            </span>
                                                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                                                ID: {contribution.id}
                                                            </span>
                                                            {contribution.contributor.email && (
                                                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                                                    {contribution.contributor.email}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Amount & Method Cell */}
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    <div>
                                                        <span className="block text-theme-sm font-semibold text-green-600 dark:text-green-400">
                                                            {contribution.amount.toLocaleString()} RWF
                                                        </span>
                                                        <span className="block text-theme-xs text-gray-400 capitalize">
                                                            {formatMethod(contribution.method)}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Designation & Status Cell */}
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    <div>
                                                        <span className="block text-theme-sm">
                                                            {contribution.contributiondesignation?.name || "No designation"}
                                                        </span>
                                                        <Badge size="sm" color={getStatusColor(contribution.status)}>
                                                            {getStatusDisplayName(contribution.status)}
                                                        </Badge>
                                                    </div>
                                                </TableCell>

                                                {/* Transaction Details Cell */}
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    <div>
                                                        {contribution.transactionId && (
                                                            <span className="block text-theme-sm">
                                                                TXN: {contribution.transactionId}
                                                            </span>
                                                        )}
                                                        {contribution.member && (
                                                            <span className="block text-theme-xs text-gray-400">
                                                                Member: {contribution.member.firstname} {contribution.member.secondname}
                                                            </span>
                                                        )}
                                                        {contribution.paymenttransaction && (
                                                            <span className="block text-theme-xs text-gray-400">
                                                                Payment: {contribution.paymenttransaction.externalId}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Date & Actions Cell */}
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="block text-theme-sm">
                                                                {formatDate(contribution.createdAt)}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEdit(contribution)}
                                                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                title="Edit contribution"
                                                            >
                                                                <PencilIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(contribution)}
                                                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                                title="Delete contribution"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
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

            {/* Edit Modal */}
            {showEditModal && editingContribution && (
                <EditContributionModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingContribution(null);
                    }}
                    contribution={editingContribution}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* Delete Modal */}
            {showDeleteModal && deletingContribution && (
                <DeleteConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setDeletingContribution(null);
                    }}
                    contribution={deletingContribution}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </div>
    );
}
