import React, { useState, useEffect } from "react";
import { XIcon } from "@/app/icons";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";
import Select from "@/app/components/common/Select";
import { ChevronDownIcon } from "@/app/icons";
import axios from "axios";

const eventTypes = [
  { value: "bible_study", label: "Bible Study" },
  { value: "discipleship", label: "Discipleship" },
  { value: "evangelism", label: "Evangelism" },
  { value: "cell_meeting", label: "Cell Meeting" },
  { value: "alumni_meeting", label: "Alumni Meeting" },
  { value: "other", label: "Other" },
];

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: number;
    name: string;
    type: string;
    isActive: boolean;
    regionId: number | null;
    universityId: number | null;
    smallGroupId: number | null;
    alumniGroupId: number | null;
    region?: { id: number; name: string } | null;
    university?: { id: number; name: string } | null;
    smallGroup?: { id: number; name: string } | null;
    alumniGroup?: { id: number; name: string } | null;
  } | null;
  onSuccess: () => void;
}

export default function EditEventModal({ isOpen, onClose, event, onSuccess }: EditEventModalProps) {
  const [form, setForm] = useState({
    name: "",
    type: "bible_study",
    isActive: true,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentScope, setCurrentScope] = useState<{
    region?: string;
    university?: string;
    smallGroup?: string;
    alumniGroup?: string;
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

  // Initialize form when event changes
  useEffect(() => {
    if (event) {
      setForm({
        name: event.name,
        type: event.type,
        isActive: event.isActive,
      });
      
      // Set current scope for display
      setCurrentScope({
        region: event.region?.name,
        university: event.university?.name,
        smallGroup: event.smallGroup?.name,
        alumniGroup: event.alumniGroup?.name,
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSelect = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setMessage(null);
    setError(null);
    setIsSubmitting(true);
    
    // Basic validation
    if (!form.name.trim()) {
      setError("Event name is required.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const payload = {
        ...form,
        regionId: event.regionId,
        universityId: event.universityId,
        smallGroupId: event.smallGroupId,
        alumniGroupId: event.alumniGroupId,
      };
      
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (res.status === 200) {
        setMessage("Event updated successfully!");
        setError(null);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        if (res.status === 409) {
          setError("Event name already exists. Please choose a different name.");
        } else if (res.status === 400) {
          setError(data.error || "Invalid data provided. Please check your inputs.");
        } else if (res.status === 403) {
          setError("You don't have permission to update this event.");
        } else {
          setError(data.error || "Failed to update event.");
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

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Event</h2>
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
        {(currentScope.region || currentScope.university || currentScope.smallGroup || currentScope.alumniGroup) && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Event Scope:</h3>
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
              {currentScope.alumniGroup && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  Alumni Group: {currentScope.alumniGroup}
                </span>
              )}
            </div>
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">Event Name</Label>
            <Input 
              name="name" 
              type="text" 
              value={form.name} 
              onChange={handleChange} 
            />
          </div>
          
          <div>
            <Label htmlFor="type">Event Type</Label>
            <div className="relative">
              <Select
                options={eventTypes}
                placeholder="Select event type"
                value={form.type}
                onChange={(v: string) => handleSelect("type", v)}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            <Label htmlFor="isActive">Active</Label>
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
              {isSubmitting ? "Updating..." : "Update Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
