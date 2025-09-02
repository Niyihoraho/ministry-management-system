import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";
import Select from "@/app/components/common/Select";
import { useState, useEffect } from "react";
import axios from "axios";

const eventTypes = [
  { value: "bible_study", label: "Bible Study" },
  { value: "discipleship", label: "Discipleship" },
  { value: "evangelism", label: "Evangelism" },
  { value: "cell_meeting", label: "Cell Meeting" },
  { value: "alumni_meeting", label: "Alumni Meeting" },
  { value: "other", label: "Other" },
];

export default function EventForm() {
  const [form, setForm] = useState({
    name: "",
    type: "bible_study",
    regionId: "",
    universityId: "",
    smallGroupId: "",
    alumniGroupId: "",
    isActive: true,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regionOptions, setRegionOptions] = useState<{ value: string; label: string }[]>([]);
  const [allUniversities, setAllUniversities] = useState<{ id: number; name: string; regionId: number }[]>([]);
  const [allSmallGroups, setAllSmallGroups] = useState<{ id: number; name: string; universityId: number }[]>([]);
  const [universityOptions, setUniversityOptions] = useState<{ value: string; label: string }[]>([]);
  const [smallGroupOptions, setSmallGroupOptions] = useState<{ value: string; label: string }[]>([]);
  const [alumniGroupOptions, setAlumniGroupOptions] = useState<{ value: string; label: string }[]>([]);
  const [isUniversityScoped, setIsUniversityScoped] = useState(false);

  useEffect(() => {
    // Detect user scope and auto-scope lists via RLS endpoints
    const init = async () => {
      try {
        const scopeRes = await axios.get('/api/members/current-user-scope');
        const scope = scopeRes.data;

        if (scope?.university?.id) {
          setIsUniversityScoped(true);
          const uniId = String(scope.university.id);
          const regionId = String(scope.university.regionId);
          setForm(prev => ({ ...prev, universityId: uniId, regionId, alumniGroupId: "", smallGroupId: "" }));
          setRegionOptions([{ value: regionId, label: scope.region?.name || 'Your Region' }]);
          setAllUniversities([{ id: scope.university.id, name: scope.university.name, regionId: scope.university.regionId }]);
          setUniversityOptions([{ value: uniId, label: scope.university.name }]);
          // Do not fetch small groups when university scoped (field hidden)
          return;
        }

        if (scope?.region?.id) {
          const regionId = String(scope.region.id);
          setForm(prev => ({ ...prev, regionId }));
          setRegionOptions([{ value: regionId, label: scope.region.name }]);
          const uniRes = await axios.get(`/api/members/universities?regionId=${regionId}`);
          const unis = Array.isArray(uniRes.data) ? uniRes.data : uniRes.data.universities;
          if (Array.isArray(unis)) {
            const uniList = unis.map((u: { id: number; name: string; regionId?: number }) => ({ id: u.id, name: u.name, regionId: scope.region.id }));
            setAllUniversities(uniList);
          }
        } else {
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
        }
      } catch {}
    };
    init();
  }, []);

  // Fetch alumni groups only if not university scoped, using RLS endpoint and region if set
  useEffect(() => {
    if (isUniversityScoped) return;
    const loadAlumniGroups = async () => {
      try {
        const url = form.regionId ? `/api/members/alumni-small-groups?regionId=${form.regionId}` : '/api/members/alumni-small-groups';
        const res = await axios.get(url);
        const list = Array.isArray(res.data) ? res.data : res.data.alumniSmallGroups;
        if (Array.isArray(list)) {
          setAlumniGroupOptions(list.map((ag: { id: number; name: string }) => ({ value: String(ag.id), label: ag.name })));
        }
      } catch {}
    };
    loadAlumniGroups();
  }, [isUniversityScoped, form.regionId]);

  useEffect(() => {
    if (form.regionId) {
      const filtered = allUniversities
        .filter(u => String(u.regionId) === form.regionId)
        .map(u => ({ value: String(u.id), label: u.name }));
      setUniversityOptions(filtered);
      if (!filtered.some(u => u.value === form.universityId)) {
        setForm(f => ({ ...f, universityId: "", smallGroupId: "" }));
      }
    } else {
      setUniversityOptions([]);
      setForm(f => ({ ...f, universityId: "", smallGroupId: "" }));
    }
  }, [form.regionId, allUniversities]);

  useEffect(() => {
    // When university scoped, hide small group and avoid fetching
    if (isUniversityScoped) {
      setSmallGroupOptions([]);
      setForm(f => ({ ...f, smallGroupId: "" }));
      return;
    }
    const loadSmallGroups = async () => {
      if (form.universityId) {
        try {
          const res = await axios.get(`/api/members/small-groups?universityId=${form.universityId}`);
          const list = Array.isArray(res.data) ? res.data : res.data.smallGroups;
          const options = Array.isArray(list) ? list.map((sg: { id: number; name: string }) => ({ value: String(sg.id), label: sg.name })) : [];
          setSmallGroupOptions(options);
          if (!options.some(sg => sg.value === form.smallGroupId)) {
            setForm(f => ({ ...f, smallGroupId: "" }));
          }
        } catch {
          setSmallGroupOptions([]);
          setForm(f => ({ ...f, smallGroupId: "" }));
        }
      } else {
        setSmallGroupOptions([]);
        setForm(f => ({ ...f, smallGroupId: "" }));
      }
    };
    loadSmallGroups();
  }, [form.universityId, isUniversityScoped]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
      const payload = {
        ...form,
        regionId: form.regionId || null,
        universityId: form.universityId || null,
        smallGroupId: form.smallGroupId || null,
        alumniGroupId: form.alumniGroupId || null,
      };
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 201) {
        setMessage("Permanent ministry event added successfully!");
        setError(null);
        setForm({
          name: "",
          type: "bible_study",
          regionId: "",
          universityId: "",
          smallGroupId: "",
          alumniGroupId: "",
          isActive: true,
        });
      } else {
        setError(data.error || "Failed to add event.");
        setMessage(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to add event.");
      setMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ComponentCard title="Add Permanent Ministry Event">
      {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Event Name</Label>
          <Input name="name" type="text" value={form.name} onChange={handleChange} />
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
          </div>
        </div>
        <div>
          <Label htmlFor="regionId">Region</Label>
          <div className="relative">
            <Select
              options={[{ value: "", label: "-- None --" }, ...regionOptions]}
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
              options={[{ value: "", label: "-- None --" }, ...universityOptions]}
              placeholder="Select university"
              value={form.universityId}
              onChange={(v: string) => handleSelect("universityId", v)}
            />
          </div>
        </div>
        {!isUniversityScoped && (
          <div>
            <Label htmlFor="smallGroupId">Small Group</Label>
            <div className="relative">
              <Select
                options={[{ value: "", label: "-- None --" }, ...smallGroupOptions]}
                placeholder="Select small group"
                value={form.smallGroupId}
                onChange={(v: string) => handleSelect("smallGroupId", v)}
              />
            </div>
          </div>
        )}
        {!isUniversityScoped && (
          <div>
            <Label htmlFor="alumniGroupId">Alumni Small Group</Label>
            <div className="relative">
              <Select
                options={[{ value: "", label: "-- None --" }, ...alumniGroupOptions]}
                placeholder="Select alumni small group"
                value={form.alumniGroupId}
                onChange={(v: string) => handleSelect("alumniGroupId", v)}
              />
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition w-full" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Event"}
        </button>
      </form>
    </ComponentCard>
  );
} 