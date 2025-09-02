import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";
import Select from "@/app/components/common/Select";
import { useState, useEffect } from "react";
import axios from "axios";

interface UserRoleFormProps {
  userId: string;
  userName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Region {
  id: number;
  name: string;
}

interface University {
  id: number;
  name: string;
  regionId: number;
}

interface SmallGroup {
  id: number;
  name: string;
  regionId: number;
  universityId: number;
}

interface AlumniSmallGroup {
  id: number;
  name: string;
  regionId: number;
}

export default function UserRoleForm({ userId, userName, onSuccess, onCancel }: UserRoleFormProps) {
  const [form, setForm] = useState({
    scope: "superadmin",
    regionId: "",
    universityId: "",
    smallGroupId: "",
    alumniGroupId: ""
  });

  const handleSelect = (name: string, value: string) => {
    // Clear dependent fields when scope changes
    if (name === "scope") {
      setForm({
        ...form,
        scope: value,
        regionId: "",
        universityId: "",
        smallGroupId: "",
        alumniGroupId: ""
      });
      // Reset all data to show all options
      fetchData();
    } else if (name === "regionId") {
      setForm({
        ...form,
        regionId: value,
        universityId: "",
        smallGroupId: "",
        alumniGroupId: ""
      });
      // Fetch filtered data based on selected region
      if (value) {
        fetchUniversitiesByRegion(value);
        fetchSmallGroupsByFilters(value);
        fetchAlumniGroupsByRegion(value);
      } else {
        // If no region selected, show all data
        fetchData();
      }
    } else if (name === "universityId") {
      setForm({
        ...form,
        universityId: value,
        smallGroupId: "",
        alumniGroupId: ""
      });
      // Fetch small groups filtered by selected university and region
      if (value) {
        fetchSmallGroupsByFilters(form.regionId, value);      
      } else if (form.regionId) {
        // If no university selected but region is, filter by region only
        fetchSmallGroupsByFilters(form.regionId);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([]);
  const [alumniGroups, setAlumniGroups] = useState<AlumniSmallGroup[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const scopeOptions = [
    { value: "superadmin", label: "Super Admin" },
    { value: "national", label: "National" },
    { value: "region", label: "Region" },
    { value: "university", label: "University" },
    { value: "smallgroup", label: "Small Group" },
    { value: "alumnismallgroup", label: "Alumni Small Group" }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch regions
      const regionsResponse = await axios.get("/api/regions");
      if (regionsResponse.data?.regions && Array.isArray(regionsResponse.data.regions)) {
        setRegions(regionsResponse.data.regions);
      }

      // Fetch all universities (will be filtered by selected region)
      const universitiesResponse = await axios.get("/api/universities");
      if (universitiesResponse.data && Array.isArray(universitiesResponse.data)) {
        setUniversities(universitiesResponse.data);
      }

      // Fetch all small groups (will be filtered by selected region/university)
      const smallGroupsResponse = await axios.get("/api/members/small-groups");
      if (smallGroupsResponse.data && Array.isArray(smallGroupsResponse.data)) {
        setSmallGroups(smallGroupsResponse.data);
      }

      // Fetch all alumni small groups (will be filtered by selected region)
      const alumniGroupsResponse = await axios.get("/api/members/alumni-small-groups");
      if (alumniGroupsResponse.data && Array.isArray(alumniGroupsResponse.data)) {
        setAlumniGroups(alumniGroupsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load form data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch universities filtered by region
  const fetchUniversitiesByRegion = async (regionId: string) => {
    try {
      const response = await axios.get(`/api/universities?regionId=${regionId}`);
      if (response.data && Array.isArray(response.data)) {
        setUniversities(response.data);
      }
    } catch (error) {
      console.error("Error fetching universities by region:", error);
    }
  };

  // Fetch small groups filtered by region and/or university
  const fetchSmallGroupsByFilters = async (regionId?: string, universityId?: string) => {
    try {
      let url = "/api/members/small-groups";
      const params = new URLSearchParams();
      if (regionId) params.append("regionId", regionId);
      if (universityId) params.append("universityId", universityId);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(url);
      if (response.data && Array.isArray(response.data)) {
        setSmallGroups(response.data);
      }
    } catch (error) {
      console.error("Error fetching small groups by filters:", error);
    }
  };

  // Fetch alumni small groups filtered by region
  const fetchAlumniGroupsByRegion = async (regionId: string) => {
    try {
      const response = await axios.get(`/api/members/alumni-small-groups?regionId=${regionId}`);
      if (response.data && Array.isArray(response.data)) {
        setAlumniGroups(response.data);
      }
    } catch (error) {
      console.error("Error fetching alumni groups by region:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.scope) {
      setError("Scope is required");
      return false;
    }

    // Validate that appropriate entity is selected based on scope
    if (form.scope === "region" && !form.regionId) {
      setError("Region is required for region scope");
      return false;
    }
    if (form.scope === "university" && !form.universityId) {
      setError("University is required for university scope");
      return false;
    }
    if (form.scope === "smallgroup" && !form.smallGroupId) {
      setError("Small Group is required for small group scope");
      return false;
    }
    if (form.scope === "alumnismallgroup" && !form.alumniGroupId) {
      setError("Alumni Small Group is required for alumni small group scope");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/user-roles", {
        userId,
        regionId: form.regionId ? parseInt(form.regionId) : null,
        universityId: form.universityId ? parseInt(form.universityId) : null,
        smallGroupId: form.smallGroupId ? parseInt(form.smallGroupId) : null,
        alumniGroupId: form.alumniGroupId ? parseInt(form.alumniGroupId) : null,
        scope: form.scope,

      });

      if (response.status === 201) {
        setMessage("Role assigned successfully!");
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error assigning role:", err);
      setError(err.response?.data?.error || "Failed to assign role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScopeDescription = (scope: string) => {
    const descriptions: Record<string, string> = {
      superadmin: "Full system access across all entities",
      national: "National level access and management",
      region: "Access limited to specific region",
      university: "Access limited to specific university",
      smallgroup: "Access limited to specific small group",
      alumnismallgroup: "Access limited to specific alumni small group"
    };
    return descriptions[scope] || "";
  };

  const getSelectedEntityName = () => {
    if (form.scope === "region" && form.regionId) {
      return regions.find(r => r.id.toString() === form.regionId)?.name;
    }
    if (form.scope === "university" && form.universityId) {
      return universities.find(u => u.id.toString() === form.universityId)?.name;
    }
    if (form.scope === "smallgroup" && form.smallGroupId) {
      return smallGroups.find(sg => sg.id.toString() === form.smallGroupId)?.name;
    }
    if (form.scope === "alumnismallgroup" && form.alumniGroupId) {
      return alumniGroups.find(ag => ag.id.toString() === form.alumniGroupId)?.name;
    }
    return null;
  };



  return (
    <ComponentCard title={`Assign Role to ${userName}`}>
      {message && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">{error}</div>}
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* User Information Display */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">User Information</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Name:</strong> {userName}</p>
            <p><strong>User ID:</strong> {userId}</p>
          </div>
        </div>

        {/* Role Scope Selection */}
             {/* Role Scope Selection */}
             <div>
          <Label htmlFor="scope">Role Scope *</Label>
          <Select
            value={form.scope}
            onChange={(value) => handleSelect("scope", value)}
            options={scopeOptions}
            placeholder="Select role scope"
          />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {getScopeDescription(form.scope)}
          </p>
        </div>

        {/* Region (for region, university, smallgroup, alumnismallgroup scopes) */}
        {(form.scope === "region" || form.scope === "university" || form.scope === "smallgroup" || form.scope === "alumnismallgroup") && (
          <div>
            <Label htmlFor="regionId">Region{form.scope === "region" ? " *" : ""}</Label>
            <Select
              value={form.regionId}
              onChange={(value) => handleSelect("regionId", value)}
              options={regions.map(r => ({ value: r.id.toString(), label: r.name }))}
              placeholder="Select region"
            />
          </div>
        )}

        {/* University (required for university scope; shown for smallgroup scope) */}
        {(form.scope === "university" || form.scope === "smallgroup") && (
          <div>
            <Label htmlFor="universityId">University{form.scope === "university" ? " *" : ""}</Label>
            <Select
              value={form.universityId}
              onChange={(value) => handleSelect("universityId", value)}
              options={universities.map(u => ({ value: u.id.toString(), label: u.name }))}
              placeholder="Select university"
            />
          </div>
        )}

        {/* Small Group (only for smallgroup scope) */}
        {form.scope === "smallgroup" && (
          <div>
            <Label htmlFor="smallGroupId">Small Group *</Label>
            <Select
              value={form.smallGroupId}
              onChange={(value) => handleSelect("smallGroupId", value)}
              options={smallGroups.map(sg => ({ value: sg.id.toString(), label: sg.name }))}
              placeholder="Select small group"
            />
          </div>
        )}

        {/* Alumni Small Group (only for alumnismallgroup scope; above level only shows Region) */}
        {form.scope === "alumnismallgroup" && (
          <div>
            <Label htmlFor="alumniGroupId">Alumni Small Group *</Label>
            <Select
              value={form.alumniGroupId}
              onChange={(value) => handleSelect("alumniGroupId", value)}
              options={alumniGroups.map(ag => ({ value: ag.id.toString(), label: ag.name }))}
              placeholder="Select alumni small group"
            />
          </div>
        )}
  
        {/* Role Summary */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Role Summary</h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p><strong>User:</strong> {userName}</p>
            <p><strong>Scope:</strong> {scopeOptions.find(opt => opt.value === form.scope)?.label}</p>
            {getSelectedEntityName() && <p><strong>Entity:</strong> {getSelectedEntityName()}</p>}
            
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Assigning..." : "Assign Role"}
          </button>
        </div>
      </form>
    </ComponentCard>
  );
}