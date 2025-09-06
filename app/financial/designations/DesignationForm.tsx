import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";
import TextArea from "@/app/components/input/TextArea";
import { useState } from "react";

export default function DesignationForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    targetAmount: "",
    isActive: true 
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    });
  };

  const handleTextAreaChange = (value: string) => {
    setForm({ ...form, description: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/designations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (res.status === 201) {
        setMessage("Designation added successfully!");
        setError(null);
        setForm({ name: "", description: "", targetAmount: "", isActive: true });
        // Don't call onSuccess to stay on the form page
      } else {
        setError(data.error || "Failed to add designation.");
        setMessage(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to add designation.");
      setMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ComponentCard title="Add New Designation">
      {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Designation Name</Label>
          <Input 
            name="name" 
            type="text" 
            value={form.name} 
            onChange={handleInputChange}
            placeholder="e.g., General Fund, Building Fund, Missions"
          />
        </div>
        <div>
          <Label htmlFor="targetAmount">Target Amount (Optional)</Label>
          <Input 
            name="targetAmount" 
            type="number" 
            value={form.targetAmount} 
            onChange={handleInputChange}
            placeholder="e.g., 10000000 (RWF)"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <TextArea 
            value={form.description} 
            onChange={handleTextAreaChange}
            placeholder="Brief description of what this designation is used for..."
            rows={3}
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <Label htmlFor="isActive" className="ml-2">
            Active Designation
          </Label>
        </div>
        <button 
          type="submit" 
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Designation"}
        </button>
      </form>
    </ComponentCard>
  );
} 