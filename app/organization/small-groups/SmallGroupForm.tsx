import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";
import Select from "@/app/components/common/Select";
import { useState, useEffect } from "react";
import axios from "axios";

export default function SmallGroupForm() {
  const [form, setForm] = useState({ name: "", universityId: "", regionId: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allUniversities, setAllUniversities] = useState<{ id: number; name: string; regionId: number }[]>([]);
  const [universityOptions, setUniversityOptions] = useState<{ value: string; label: string }[]>([]);
  const [regionOptions, setRegionOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    // Auto-scope: if scope is university, preselect university and its region.
    const init = async () => {
      try {
        const scopeRes = await axios.get('/api/members/current-user-scope');
        const scope = scopeRes.data;

        // If user scoped to a university
        if (scope?.university?.id) {
          const uniId = String(scope.university.id);
          const regionId = String(scope.university.regionId);
          setForm(prev => ({ ...prev, regionId, universityId: uniId }));
          setRegionOptions([{ value: regionId, label: scope.region?.name || 'Your Region' }]);

          // Limit university dropdown to the scoped university only
          setAllUniversities([{ id: scope.university.id, name: scope.university.name, regionId: scope.university.regionId }]);
          setUniversityOptions([{ value: uniId, label: scope.university.name }]);
          return;
        }

        // Else if user scoped to region
        if (scope?.region?.id) {
          const regionId = String(scope.region.id);
          setForm(prev => ({ ...prev, regionId }));
          setRegionOptions([{ value: regionId, label: scope.region.name }]);

          // Fetch universities within region via RLS endpoint
          const uniRes = await axios.get(`/api/members/universities?regionId=${regionId}`);
          const unis = Array.isArray(uniRes.data) ? uniRes.data : uniRes.data.universities;
          if (Array.isArray(unis)) {
            const uniList = unis.map((u: { id: number; name: string; regionId?: number }) => ({ id: u.id, name: u.name, regionId: scope.region.id }));
            setAllUniversities(uniList);
          }
          return;
        }

        // Fallback: load RLS-filtered lists
        const regionsRes = await axios.get('/api/members/regions');
        const regions = Array.isArray(regionsRes.data) ? regionsRes.data : regionsRes.data.regions;
        if (Array.isArray(regions)) {
          setRegionOptions(regions.map((r: { id: number; name: string }) => ({ value: String(r.id), label: r.name })));
        }
        const uniRes = await axios.get('/api/members/universities');
        const unis = Array.isArray(uniRes.data) ? uniRes.data : uniRes.data.universities;
        if (Array.isArray(unis)) {
          setAllUniversities(unis.map((u: { id: number; name: string; regionId: number }) => ({ id: u.id, name: u.name, regionId: u.regionId })));
        }
      } catch (e) {
        // Silent fallback
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (form.regionId) {
      const filtered = allUniversities
        .filter(u => String(u.regionId) === form.regionId)
        .map(u => ({ value: String(u.id), label: u.name }));
      setUniversityOptions(filtered);
      // If the selected university is not in the filtered list, clear it
      if (!filtered.some(u => u.value === form.universityId)) {
        setForm(f => ({ ...f, universityId: "" }));
      }
    } else {
      setUniversityOptions([]);
      setForm(f => ({ ...f, universityId: "" }));
    }
  }, [form.regionId, allUniversities]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      const res = await fetch("/api/members/small-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 201) {
        setMessage("Small group added successfully!");
        setError(null);
        setForm({ name: "", universityId: "", regionId: "" });
      } else {
        setError(data.error || "Failed to add small group.");
        setMessage(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to add small group.");
      setMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ComponentCard title="Add New Small Group">
      {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Small Group Name</Label>
          <Input name="name" type="text" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="regionId">Region</Label>
          <div className="relative">
            <Select
              options={regionOptions}
              placeholder="Select region"
              value={form.regionId}
              onChange={(v: string) => handleSelect("regionId", v)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="universityId">University</Label>
          <div className="relative">
            <Select
              options={universityOptions}
              placeholder="Select university"
              value={form.universityId}
              onChange={(v: string) => handleSelect("universityId", v)}
            />
          </div>
        </div>
        <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition w-full" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Small Group"}
        </button>
      </form>
    </ComponentCard>
  );
} 