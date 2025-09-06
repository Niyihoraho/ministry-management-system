import React, { useState, useEffect } from "react";
import { XIcon } from "@/app/icons";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";
import TextArea from "@/app/components/input/TextArea";

interface EditDesignationModalProps {
  isOpen: boolean;
  onClose: () => void;
  designation: {
    id: number;
    name: string;
    description: string | null;
    targetAmount: number | null;
    isActive: boolean;
    regionId: number | null;
    universityId: number | null;
    smallGroupId: number | null;
    region?: { id: number; name: string } | null;
    university?: { id: number; name: string } | null;
    smallgroup?: { id: number; name: string } | null;
  } | null;
  onSuccess: () => void;
}

export default function EditDesignationModal({ isOpen, onClose, designation, onSuccess }: EditDesignationModalProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    targetAmount: "",
    isActive: true,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentScope, setCurrentScope] = useState<{
    region?: string;
    university?: string;
    smallGroup?: string;
  }>({});

  // Auto-dismiss messages
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // Initialize form when designation changes
  useEffect(() => {
    if (designation) {
      setForm({
        name: designation.name,
        description: designation.description || "",
        targetAmount: designation.targetAmount ? designation.targetAmount.toString() : "",
        isActive: designation.isActive,
      });
      
      // Set current scope for display
      setCurrentScope({
        region: designation.region?.name,
        university: designation.university?.name,
        smallGroup: designation.smallgroup?.name,
      });
    }
  }, [designation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleTextAreaChange = (value: string) => {
    setForm(prev => ({ ...prev, description: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designation) return;

    setMessage(null);
    setError(null);
    setIsSubmitting(true);
    
    // Basic validation
    if (!form.name.trim()) {
      setError("Designation name is required.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const payload = {
        name: form.name,
        description: form.description,
        targetAmount: form.targetAmount,
        isActive: form.isActive,
        regionId: designation.regionId || null,
        universityId: designation.universityId || null,
        smallGroupId: designation.smallGroupId || null,
      };
      
      console.log("Frontend sending payload:", JSON.stringify(payload, null, 2));
      
      const res = await fetch(`/api/designations/${designation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (res.status === 200) {
        setMessage("Designation updated successfully!");
        setError(null);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        console.log("API Error Response:", data);
        if (res.status === 409) {
          setError("Designation name already exists. Please choose a different name.");
        } else if (res.status === 400) {
          const errorMsg = data.details ? 
            `Validation Error: ${JSON.stringify(data.details)}` : 
            (data.error || "Invalid data provided. Please check your inputs.");
          setError(errorMsg);
        } else {
          setError(data.error || "Failed to update designation.");
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

  if (!isOpen || !designation) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Designation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XIcon />
          </button>
        </div>

        {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
        {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
        
        {/* Current Scope Display */}
        {(currentScope.region || currentScope.university || currentScope.smallGroup) && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Designation Scope:</h3>
            <div className="flex flex-wrap gap-2">
              {currentScope.region && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  Region: {currentScope.region}
                </span>
              )}
              {currentScope.university && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  University: {currentScope.university}
                </span>
              )}
              {currentScope.smallGroup && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  Small Group: {currentScope.smallGroup}
                </span>
              )}
            </div>
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
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
              id="isActive"
              name="isActive"
              checked={form.isActive}
              onChange={handleInputChange}
              className="mr-2"
            />
            <Label htmlFor="isActive">Active Designation</Label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Designation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
