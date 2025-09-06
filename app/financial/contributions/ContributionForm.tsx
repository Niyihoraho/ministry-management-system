import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";
import { useState, useEffect } from "react";

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

export default function ContributionForm({ onSuccess }: { onSuccess?: () => void }) {
    const [form, setForm] = useState({ 
        contributorId: "",
        amount: "",
        method: "mobile_money" as "mobile_money" | "bank_transfer" | "card" | "worldremit",
        designationId: "",
        status: "pending" as "pending" | "completed" | "failed" | "refunded" | "processing" | "cancelled",
        transactionId: "",
        memberId: ""
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

        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ 
            ...form, 
            [name]: value 
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setIsSubmitting(true);
        
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
            
            const res = await fetch("/api/contributions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            
            if (res.status === 201) {
                setMessage("Contribution added successfully!");
                setError(null);
                setForm({ 
                    contributorId: "",
                    amount: "",
                    method: "mobile_money",
                    designationId: "",
                    status: "pending",
                    transactionId: "",
                    memberId: ""
                });
                // Don't call onSuccess to stay on the form page
            } else {
                setError(data.error || "Failed to add contribution.");
                setMessage(null);
            }
        } catch (err: any) {
            setError(err.message || "Failed to add contribution.");
            setMessage(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <ComponentCard title="Add New Contribution">
                <div className="text-center py-8">Loading form data...</div>
            </ComponentCard>
        );
    }

    return (
        <ComponentCard title="Add New Contribution">
            {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
            {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
            <form className="space-y-6" onSubmit={handleSubmit}>
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

                <button 
                    type="submit" 
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition w-full" 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Adding..." : "Add Contribution"}
                </button>
            </form>
        </ComponentCard>
    );
}
