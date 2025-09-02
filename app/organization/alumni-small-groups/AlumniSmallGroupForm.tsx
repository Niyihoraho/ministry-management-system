import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";
import Select from "@/app/components/common/Select";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AlumniSmallGroupForm() {
  const [form, setForm] = useState({ name: "", regionId: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regionOptions, setRegionOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    // Auto-scope region via current user's role and use RLS regions endpoint
    const init = async () => {
      try {
        const scopeRes = await axios.get('/api/members/current-user-scope');
        const scope = scopeRes.data;
        if (scope?.region?.id) {
          const regionId = String(scope.region.id);
          setForm(prev => ({ ...prev, regionId }));
          setRegionOptions([{ value: regionId, label: scope.region.name }]);
        } else {
          const regionsRes = await axios.get('/api/members/regions');
          const regions = Array.isArray(regionsRes.data) ? regionsRes.data : regionsRes.data.regions;
          if (Array.isArray(regions)) {
            setRegionOptions(regions.map((r: { id: number; name: string }) => ({ value: String(r.id), label: r.name })));
          }
        }
      } catch (e) {
        const regionsRes = await axios.get('/api/members/regions');
        const regions = Array.isArray(regionsRes.data) ? regionsRes.data : regionsRes.data.regions;
        if (Array.isArray(regions)) {
          setRegionOptions(regions.map((r: { id: number; name: string }) => ({ value: String(r.id), label: r.name })));
        }
      }
    };
    init();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSelect = (value: string) => {
    setForm({ ...form, regionId: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/members/alumni-small-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 201) {
        setMessage("Alumni small group added successfully!");
        setError(null);
        setForm({ name: "", regionId: "" });
      } else {
        setError(data.error || "Failed to add alumni small group.");
        setMessage(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to add alumni small group.");
      setMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ComponentCard title="Add New Alumni Small Group">
      {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Alumni Small Group Name</Label>
          <Input name="name" type="text" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="regionId">Region</Label>
          <div className="relative">
            <Select
              options={regionOptions}
              placeholder="Select region"
              value={form.regionId}
              onChange={handleSelect}
            />
          </div>
        </div>
        <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition w-full" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Alumni Small Group"}
        </button>
      </form>
    </ComponentCard>
  );
} 