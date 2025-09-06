import React, { useState, useEffect } from "react";
import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";

interface Contributor {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    memberId: number | null;
    member?: {
        id: number;
        firstname: string | null;
        secondname: string | null;
        email: string | null;
    } | null;
}

interface Designation {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
}

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

interface EditContributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    contribution: Contribution;
    onSuccess: () => void;
}

export default function EditContributionModal({ isOpen, onClose, contribution, onSuccess }: EditContributionModalProps) {
    const [form, setForm] = useState({
        contributorId: contribution.contributorId.toString(),
        amount: contribution.amount.toString(),
        method: contribution.method,
        designationId: contribution.designationId?.toString() || "",
        status: contribution.status,
        transactionId: contribution.transactionId || "",
        memberId: contribution.memberId?.toString() || "",
    });
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contributors, setContributors] = useState<Contributor[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch contributors and designations on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contributorsRes, designationsRes] = await Promise.all([
                    fetch("/api/contributors"),
                    fetch("/api/designations")
                ]);
                
                if (contributorsRes.ok) {
                    const contributorsData = await contributorsRes.json();
                    setContributors(contributorsData);
                }
                
                if (designationsRes.ok) {
                    const designationsData = await designationsRes.json();
                    setDesignations(designationsData.filter((d: Designation) => d.isActive));
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load form data");
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    // Update form when contribution changes
    useEffect(() => {
        if (contribution) {
            setForm({
                contributorId: contribution.contributorId.toString(),
                amount: contribution.amount.toString(),
                method: contribution.method,
                designationId: contribution.designationId?.toString() || "",
                status: contribution.status,
                transactionId: contribution.transactionId || "",
                memberId: contribution.memberId?.toString() || "",
            });
        }
    }, [contribution]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ 
            ...form, 
            [name]: value 
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contribution) return;

        setMessage(null);
        setError(null);
        setIsSubmitting(true);
        
        // Basic validation
        if (!form.contributorId || !form.amount) {
            setError("Contributor and amount are required.");
            setIsSubmitting(false);
            return;
        }
        
        try {
            const payload = {
                contributorId: parseInt(form.contributorId),
                amount: parseFloat(form.amount),
                method: form.method,
                designationId: form.designationId ? parseInt(form.designationId) : null,
                status: form.status,
                transactionId: form.transactionId || null,
                memberId: form.memberId ? parseInt(form.memberId) : null,
            };
            
            console.log("Frontend sending payload:", JSON.stringify(payload, null, 2));
            
            const res = await fetch(`/api/contributions/${contribution.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            
            const data = await res.json();
            
            if (res.status === 200) {
                setMessage("Contribution updated successfully!");
                setError(null);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1000);
            } else {
                console.log("API Error Response:", data);
                if (res.status === 409) {
                    setError("Transaction ID already exists. Please choose a different transaction ID.");
                } else if (res.status === 400) {
                    const errorMsg = data.details ? 
                        `Validation Error: ${JSON.stringify(data.details)}` : 
                        (data.error || "Invalid data provided. Please check your inputs.");
                    setError(errorMsg);
                } else {
                    setError(data.error || "Failed to update contribution.");
                }
                setMessage(null);
            }
        } catch (err: any) {
            setError("Network error. Please check your connection and try again.");
            setMessage(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
                    <div className="text-center">Loading form data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <ComponentCard title="Edit Contribution">
                    {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
                    {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="contributorId">Contributor <span className="text-red-500">*</span></Label>
                            <select
                                name="contributorId"
                                value={form.contributorId}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                required
                            >
                                <option value="">Select a contributor</option>
                                {contributors.map((contributor) => (
                                    <option key={contributor.id} value={contributor.id}>
                                        {contributor.name} {contributor.email && `(${contributor.email})`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="amount">Amount (RWF) <span className="text-red-500">*</span></Label>
                            <Input 
                                name="amount" 
                                type="number" 
                                step="0.01"
                                value={form.amount} 
                                onChange={handleInputChange}
                                placeholder="e.g., 10000"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="method">Payment Method <span className="text-red-500">*</span></Label>
                            <select
                                name="method"
                                value={form.method}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                required
                            >
                                <option value="mobile_money">Mobile Money</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="card">Card</option>
                                <option value="worldremit">WorldRemit</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="designationId">Designation (Optional)</Label>
                            <select
                                name="designationId"
                                value={form.designationId}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Select a designation (optional)</option>
                                {designations.map((designation) => (
                                    <option key={designation.id} value={designation.id}>
                                        {designation.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="processing">Processing</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                            <Input 
                                name="transactionId" 
                                type="text" 
                                value={form.transactionId} 
                                onChange={handleInputChange}
                                placeholder="External transaction reference"
                            />
                        </div>

                        <div>
                            <Label htmlFor="memberId">Member ID (Optional)</Label>
                            <Input 
                                name="memberId" 
                                type="number" 
                                value={form.memberId} 
                                onChange={handleInputChange}
                                placeholder="Member ID if contributor is a member"
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Updating..." : "Update Contribution"}
                            </button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
}
