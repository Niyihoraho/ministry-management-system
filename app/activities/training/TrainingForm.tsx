import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";
import TextArea from "@/app/components/input/TextArea";
import Select from "@/app/components/common/Select";
import { useState, useEffect } from "react";

export default function TrainingForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    startDateTime: "",
    endDateTime: "",
    location: "",
    regionId: "",
    universityId: "",
    smallGroupId: "",
    alumniGroupId: ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regionOptions, setRegionOptions] = useState<{ value: string; label: string }[]>([]);
  const [universityOptions, setUniversityOptions] = useState<{ value: string; label: string }[]>([]);
  const [smallGroupOptions, setSmallGroupOptions] = useState<{ value: string; label: string }[]>([]);
  const [alumniGroupOptions, setAlumniGroupOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    // Fetch regions
    fetch("/api/regions")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.regions)) {
          setRegionOptions(data.regions.map((r: { id: number; name: string }) => ({ value: String(r.id), label: r.name })));
        }
      });

    // Fetch universities
    fetch("/api/universities")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.universities)) {
          setUniversityOptions(data.universities.map((u: { id: number; name: string }) => ({ value: String(u.id), label: u.name })));
        }
      });

    // Fetch small groups
            fetch("/api/members/small-groups")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.smallGroups)) {
          setSmallGroupOptions(data.smallGroups.map((sg: { id: number; name: string }) => ({ value: String(sg.id), label: sg.name })));
        }
      });

    // Fetch alumni groups
    fetch("/api/members/alumni-small-groups")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.alumniSmallGroups)) {
          setAlumniGroupOptions(data.alumniSmallGroups.map((ag: { id: number; name: string }) => ({ value: String(ag.id), label: ag.name })));
        }
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleTextAreaChange = (value: string) => {
    setForm({ ...form, description: value });
  };

  const handleSelect = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (res.status === 201) {
        setMessage("Training program added successfully!");
        setError(null);
        setForm({ 
          name: "", 
          description: "", 
          startDateTime: "",
          endDateTime: "",
          location: "",
          regionId: "",
          universityId: "",
          smallGroupId: "",
          alumniGroupId: ""
        });
        // Don't call onSuccess to stay on the form page
      } else {
        setError(data.error || "Failed to add training program.");
        setMessage(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to add training program.");
      setMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ComponentCard title="Add New Training Program">
      {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Training Name</Label>
          <Input 
            name="name" 
            type="text" 
            value={form.name} 
            onChange={handleInputChange}
            placeholder="e.g., Leadership Development, Bible Study Training"
          />
        </div>
        <div>
          <Label htmlFor="startDateTime">Start Date & Time *</Label>
          <Input 
            name="startDateTime" 
            type="datetime-local" 
            value={form.startDateTime} 
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="endDateTime">End Date & Time (Optional)</Label>
          <Input 
            name="endDateTime" 
            type="datetime-local" 
            value={form.endDateTime} 
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="location">Location (Optional)</Label>
          <Input 
            name="location" 
            type="text" 
            value={form.location} 
            onChange={handleInputChange}
            placeholder="e.g., Main Campus, Room 101"
          />
        </div>
        <div>
          <Label htmlFor="regionId">Region (Optional)</Label>
          <Select
            options={regionOptions}
            placeholder="Select region"
            value={form.regionId}
            onChange={(value) => handleSelect('regionId', value)}
          />
        </div>
        <div>
          <Label htmlFor="universityId">University (Optional)</Label>
          <Select
            options={universityOptions}
            placeholder="Select university"
            value={form.universityId}
            onChange={(value) => handleSelect('universityId', value)}
          />
        </div>
        <div>
          <Label htmlFor="smallGroupId">Small Group (Optional)</Label>
          <Select
            options={smallGroupOptions}
            placeholder="Select small group"
            value={form.smallGroupId}
            onChange={(value) => handleSelect('smallGroupId', value)}
          />
        </div>
        <div>
          <Label htmlFor="alumniGroupId">Alumni Group (Optional)</Label>
          <Select
            options={alumniGroupOptions}
            placeholder="Select alumni group"
            value={form.alumniGroupId}
            onChange={(value) => handleSelect('alumniGroupId', value)}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <TextArea 
            value={form.description} 
            onChange={handleTextAreaChange}
            placeholder="Brief description of the training program..."
            rows={3}
          />
        </div>
        <button 
          type="submit" 
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Training Program"}
        </button>
      </form>
    </ComponentCard>
  );
} 