import React, { useState } from "react";
import ComponentCard from "@/app/components/common/ComponentCard";

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

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    contribution: Contribution;
    onSuccess: () => void;
}

export default function DeleteConfirmModal({ isOpen, onClose, contribution, onSuccess }: DeleteConfirmModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!contribution) return;

        setIsDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/contributions/${contribution.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to delete contribution");
            }
        } catch (err: any) {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const formatMethod = (method: string) => {
        return method.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="w-full max-w-md">
                <ComponentCard title="Delete Contribution">
                    {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
                    
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete this contribution? This action cannot be undone.
                        </p>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Contribution Details:</h4>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                <div><strong>Contributor:</strong> {contribution.contributor.name}</div>
                                <div><strong>Amount:</strong> {contribution.amount.toLocaleString()} RWF</div>
                                <div><strong>Method:</strong> {formatMethod(contribution.method)}</div>
                                <div><strong>Designation:</strong> {contribution.contributiondesignation?.name || "No designation"}</div>
                                <div><strong>Status:</strong> {contribution.status}</div>
                                <div><strong>Date:</strong> {formatDate(contribution.createdAt)}</div>
                                {contribution.transactionId && (
                                    <div><strong>Transaction ID:</strong> {contribution.transactionId}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Contribution"}
                        </button>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}
