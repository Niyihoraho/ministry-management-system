import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";
import Select from "@/app/components/common/Select";
import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDownIcon } from "@/app/icons";

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
  const [isSmallGroupScoped, setIsSmallGroupScoped] = useState(false);
  const [isAlumniGroupScoped, setIsAlumniGroupScoped] = useState(false);
  const [currentScope, setCurrentScope] = useState<{
    region?: string;
    university?: string;
    smallGroup?: string;
    alumniGroup?: string;
  }>({});
  const [showCreateSmallGroup, setShowCreateSmallGroup] = useState(false);
  const [showCreateAlumniGroup, setShowCreateAlumniGroup] = useState(false);
  const [newSmallGroupName, setNewSmallGroupName] = useState("");
  const [newAlumniGroupName, setNewAlumniGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

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

  useEffect(() => {
    // Detect user scope and auto-scope lists via RLS endpoints
    const init = async () => {
      try {
        const scopeRes = await axios.get('/api/members/current-user-scope');
        const scope = scopeRes.data;

        // Handle small group scope - auto-populate small group (check most specific scope first)
        if (scope?.smallGroup?.id) {
          setIsSmallGroupScoped(true);
          const sgId = String(scope.smallGroup.id);
          const uniId = String(scope.smallGroup.universityId);
          const regionId = String(scope.smallGroup.regionId);
          setForm(prev => ({ 
            ...prev, 
            smallGroupId: sgId, 
            universityId: uniId, 
            regionId, 
            alumniGroupId: "" 
          }));
          setRegionOptions([{ value: regionId, label: scope.region?.name || 'Your Region' }]);
          setAllUniversities([{ id: scope.smallGroup.universityId, name: scope.university?.name || 'Your University', regionId: scope.smallGroup.regionId }]);
          setUniversityOptions([{ value: uniId, label: scope.university?.name || 'Your University' }]);
          setSmallGroupOptions([{ value: sgId, label: scope.smallGroup.name }]);
          setCurrentScope({
            region: scope.region?.name,
            university: scope.university?.name,
            smallGroup: scope.smallGroup.name
          });
          // Do not fetch small groups when small group scoped (field hidden)
          return;
        }

        // Handle university scope - auto-populate university
        if (scope?.university?.id) {
          setIsUniversityScoped(true);
          const uniId = String(scope.university.id);
          const regionId = String(scope.university.regionId);
          setForm(prev => ({ ...prev, universityId: uniId, regionId, alumniGroupId: "", smallGroupId: "" }));
          setRegionOptions([{ value: regionId, label: scope.region?.name || 'Your Region' }]);
          setAllUniversities([{ id: scope.university.id, name: scope.university.name, regionId: scope.university.regionId }]);
          setUniversityOptions([{ value: uniId, label: scope.university.name }]);
          setCurrentScope({
            region: scope.region?.name,
            university: scope.university.name
            // Don't show small group for university scope - only show relevant levels
          });
          // Do not fetch small groups when university scoped (field hidden)
          return;
        }

        // Handle alumni small group scope - auto-populate alumni group
        if (scope?.alumniGroup?.id) {
          setIsAlumniGroupScoped(true);
          const agId = String(scope.alumniGroup.id);
          const regionId = String(scope.alumniGroup.regionId);
          setForm(prev => ({ 
            ...prev, 
            alumniGroupId: agId, 
            regionId, 
            universityId: "", 
            smallGroupId: "" 
          }));
          setRegionOptions([{ value: regionId, label: scope.region?.name || 'Your Region' }]);
          setAlumniGroupOptions([{ value: agId, label: scope.alumniGroup.name }]);
          setCurrentScope({
            region: scope.region?.name,
            alumniGroup: scope.alumniGroup.name
          });
          return;
        }

        if (scope?.region?.id) {
          const regionId = String(scope.region.id);
          setForm(prev => ({ ...prev, regionId }));
          setRegionOptions([{ value: regionId, label: scope.region.name }]);
          setCurrentScope({
            region: scope.region.name
          });
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

  // Fetch alumni groups using RLS endpoint and region if set
  useEffect(() => {
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
  }, [form.regionId]);

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
  }, [form.universityId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };
  const handleSelect = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  // Create new small group
  const handleCreateSmallGroup = async () => {
    if (!newSmallGroupName || !form.universityId || !form.regionId) return;
    setCreatingGroup(true);
    try {
      const res = await fetch("/api/members/small-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newSmallGroupName, 
          universityId: form.universityId, 
          regionId: form.regionId 
        })
      });
      const data = await res.json();
      if (res.status === 201) {
        setNewSmallGroupName("");
        setShowCreateSmallGroup(false);
        // Refresh small groups list
        const sgRes = await axios.get(`/api/members/small-groups?universityId=${form.universityId}`);
        const sgList = Array.isArray(sgRes.data) ? sgRes.data : sgRes.data.smallGroups;
        if (Array.isArray(sgList)) {
          setSmallGroupOptions(sgList.map((sg: { id: number; name: string }) => ({ value: String(sg.id), label: sg.name })));
        }
        // Auto-select the newly created group
        setForm(prev => ({ ...prev, smallGroupId: String(data.id) }));
        setMessage("Small group created successfully!");
      } else {
        setError(data.error || "Failed to create small group");
      }
    } catch (error) {
      setError("Failed to create small group");
    } finally {
      setCreatingGroup(false);
    }
  };

  // Create new alumni group
  const handleCreateAlumniGroup = async () => {
    if (!newAlumniGroupName || !form.regionId) return;
    setCreatingGroup(true);
    try {
      const res = await fetch("/api/members/alumni-small-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newAlumniGroupName, 
          regionId: form.regionId 
        })
      });
      const data = await res.json();
      if (res.status === 201) {
        setNewAlumniGroupName("");
        setShowCreateAlumniGroup(false);
        // Refresh alumni groups list
        const agRes = await axios.get(`/api/members/alumni-small-groups?regionId=${form.regionId}`);
        const agList = Array.isArray(agRes.data) ? agRes.data : agRes.data.alumniSmallGroups;
        if (Array.isArray(agList)) {
          setAlumniGroupOptions(agList.map((ag: { id: number; name: string }) => ({ value: String(ag.id), label: ag.name })));
        }
        // Auto-select the newly created group
        setForm(prev => ({ ...prev, alumniGroupId: String(data.id) }));
        setMessage("Alumni group created successfully!");
      } else {
        setError(data.error || "Failed to create alumni group");
      }
    } catch (error) {
      setError("Failed to create alumni group");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        // Reset form but preserve user's scope
        const currentRegionId = form.regionId;
        const currentUniversityId = form.universityId;
        const currentSmallGroupId = form.smallGroupId;
        const currentAlumniGroupId = form.alumniGroupId;
        setForm({
          name: "",
          type: "bible_study",
          regionId: currentRegionId, // Preserve user's region
          universityId: currentUniversityId, // Preserve user's university if scoped
          smallGroupId: currentSmallGroupId, // Preserve user's small group if scoped
          alumniGroupId: currentAlumniGroupId, // Preserve user's alumni group if scoped
          isActive: true,
        });
      } else {
        // Handle different error types
        if (res.status === 409) {
          setError("Event name already exists. Please choose a different name.");
        } else if (res.status === 400) {
          setError(data.error || "Invalid data provided. Please check your selections.");
        } else if (res.status === 403) {
          setError("You don't have permission to create events in this scope.");
        } else {
          setError(data.error || "Failed to add event.");
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

  return (
    <ComponentCard title="Add Permanent Ministry Event">
      {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
      
      {/* Current Scope Display */}
      {(currentScope.region || currentScope.university || currentScope.smallGroup || currentScope.alumniGroup) && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Your Current Scope:</h3>
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
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition w-full" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Event"}
        </button>
      </form>
    </ComponentCard>
  );
} 