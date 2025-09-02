import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Select from "@/app/components/common/Select";
import DatePicker from "@/app/components/form/date-picker";
import { ChevronDownIcon } from "@/app/icons";
import Input from "@/app/components/input/InputField";
import { useState, useEffect } from "react";
import axios from "axios";

const sexOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];
const typeOptions = [
  { value: "student", label: "Student" },
  { value: "graduate", label: "Graduate" },
  { value: "alumni", label: "Alumni" },
];
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "pre_graduate", label: "Pre-Graduate" },
  { value: "graduate", label: "Graduate" },
  { value: "alumni", label: "Alumni" },
  { value: "inactive", label: "Inactive" },
];
const maritalStatusOptions = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
];

export default function MemberForm({ initialData, onClose, section, onSuccess }: { initialData?: any, onClose?: () => void, section?: string, onSuccess?: () => void }) {
  const [form, setForm] = useState({
    firstname: initialData?.firstname || "",
    secondname: initialData?.secondname || "",
    gender: initialData?.gender || "",
    birthdate: initialData?.birthdate ? initialData.birthdate.slice(0, 10) : "",
    placeOfBirthDistrict: initialData?.placeOfBirthDistrict || "",
    placeOfBirthSector: initialData?.placeOfBirthSector || "",
    placeOfBirthCell: initialData?.placeOfBirthCell || "",
    placeOfBirthVillage: initialData?.placeOfBirthVillage || "",
    localChurch: initialData?.localChurch || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    type: initialData?.type || "student",
    status: initialData?.status || "active",
    regionId: initialData?.regionId ? String(initialData.regionId) : "",
    universityId: initialData?.universityId ? String(initialData.universityId) : "",
    graduationDate: initialData?.graduationDate ? initialData.graduationDate.slice(0, 10) : "",
    faculty: initialData?.faculty || "",
    professionalism: initialData?.professionalism || "",
    maritalStatus: initialData?.maritalStatus || "",
    smallGroupId: initialData?.smallGroupId || "",
    alumniGroupId: initialData?.alumniGroupId || "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universityOptions, setUniversityOptions] = useState<{ value: string; label: string }[]>([]);
  const [regionOptions, setRegionOptions] = useState<{ value: string; label: string }[]>([]);
  const [smallGroupOptions, setSmallGroupOptions] = useState<{ value: string; label: string }[]>([]);
  const [alumniGroupOptions, setAlumniGroupOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    // Get user's current scope and set region automatically
    const fetchUserScope = async () => {
      try {
        const response = await axios.get('/api/members/current-user-scope');
        const userScope = response.data;
        
        // Set region based on user's scope
        if (userScope.region) {
          setForm(prev => ({ ...prev, regionId: String(userScope.region.id) }));
          setRegionOptions([{ value: String(userScope.region.id), label: userScope.region.name }]);
        } else {
          // If user doesn't have a specific region, fetch all regions they have access to
          const regionsResponse = await axios.get('/api/members/regions');
          setRegionOptions(regionsResponse.data.map((r: { id: number; name: string }) => ({ value: String(r.id), label: r.name })));
        }
      } catch (error) {
        console.error('Error fetching user scope:', error);
        // Fallback to fetching all regions
        axios.get('/api/members/regions').then(res => {
          setRegionOptions(res.data.map((r: { id: number; name: string }) => ({ value: String(r.id), label: r.name })));
        });
      }
    };
    
    fetchUserScope();
  }, []);

  // Fetch universities when region changes
  useEffect(() => {
    if (form.regionId) {
      // Use RLS-filtered API that respects user's scope
      axios.get(`/api/members/universities?regionId=${form.regionId}`).then(res => {
        setUniversityOptions(res.data.map((u: { id: number; name: string }) => ({ value: String(u.id), label: u.name })));
      }).catch(error => {
        console.error('Error fetching universities:', error);
        setUniversityOptions([]);
      });
      // Reset universityId when region changes
      setForm(f => ({ ...f, universityId: "" }));
    } else {
      setUniversityOptions([]);
      setForm(f => ({ ...f, universityId: "" }));
    }
  }, [form.regionId]);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // Fetch small groups when university changes
  useEffect(() => {
    if (form.universityId) {
      // Use RLS-filtered API that respects user's scope
      axios.get(`/api/members/small-groups?universityId=${form.universityId}`).then(res => {
        setSmallGroupOptions(res.data.map((g: { id: number; name: string }) => ({ value: String(g.id), label: g.name })));
      }).catch(error => {
        console.error('Error fetching small groups:', error);
        setSmallGroupOptions([]);
      });
      // Reset smallGroupId when university changes
      setForm(f => ({ ...f, smallGroupId: "" }));
    } else {
      setSmallGroupOptions([]);
      setForm(f => ({ ...f, smallGroupId: "" }));
    }
  }, [form.universityId]);

  // Fetch alumni groups when region changes
  useEffect(() => {
    if (form.regionId) {
      // Use RLS-filtered API that respects user's scope
      axios.get(`/api/members/alumni-small-groups?regionId=${form.regionId}`).then(res => {
        setAlumniGroupOptions(res.data.map((g: { id: number; name: string }) => ({ value: String(g.id), label: g.name })));
      }).catch(error => {
        console.error('Error fetching alumni groups:', error);
        setAlumniGroupOptions([]);
      });
    } else {
      setAlumniGroupOptions([]);
    }
  }, [form.regionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSelect = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };
  const handleDate = (dates: any, currentDateString: string) => {
    setForm({ ...form, graduationDate: currentDateString });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);
    try {
      // Convert date fields to ISO string if filled
      const birthdate = form.birthdate ? new Date(form.birthdate).toISOString() : "";
      const graduationDate = form.graduationDate ? new Date(form.graduationDate).toISOString() : "";
      // Ensure the member is created with the correct region based on user's scope
      const body = {
        ...form,
        birthdate,
        graduationDate,
        // The regionId should already be set based on user's scope from the form initialization
      };
      // If editing, use PUT or PATCH, else POST
      let res, data;
      if (initialData && initialData.id) {
        res = await fetch(`/api/members/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      data = await res.json();
      if (res.status === 201 || res.status === 200) {
        setMessage(initialData ? "Member updated successfully!" : "Member added successfully!");
        setError(null);
        if (!initialData) {
          // Reset form but maintain the user's region
          const currentRegionId = form.regionId;
          setForm({
            firstname: "",
            secondname: "",
            gender: "",
            birthdate: "",
            placeOfBirthDistrict: "",
            placeOfBirthSector: "",
            placeOfBirthCell: "",
            placeOfBirthVillage: "",
            localChurch: "",
            email: "",
            phone: "",
            type: "student",
            status: "active",
            regionId: currentRegionId, // Maintain user's region
            universityId: "",
            graduationDate: "",
            faculty: "",
            professionalism: "",
            maritalStatus: "",
            smallGroupId: "",
            alumniGroupId: "",
          });
        }
        if (onClose) onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || "Failed to save member.");
        setMessage(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save member.");
      setMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ComponentCard title={initialData ? "Edit Member" : "Add New Member"}>
      {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PERSONAL SECTION */}
          {(section === 'personal' || !section) && <>
            <div>
              <Label htmlFor="firstname">First Name</Label>
              <Input name="firstname" type="text" value={form.firstname} onChange={handleChange}/>
            </div>
            <div>
              <Label htmlFor="secondname">Second Name</Label>
              <Input name="secondname" type="text" value={form.secondname} onChange={handleChange}/>
            </div>
            <div>
              <Label>Gender</Label>
              <div className="relative">
                <Select
                  options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]}
                  placeholder="Select gender"
                  value={form.gender}
                  onChange={(v: string) => handleSelect("gender", v)}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="birthdate">Birthdate</Label>
              <Input name="birthdate" type="date" value={form.birthdate} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input name="phone" type="text" value={form.phone} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <div className="relative">
                <Select
                  options={maritalStatusOptions}
                  placeholder="Select marital status"
                  value={form.maritalStatus}
                  onChange={(v: string) => handleSelect("maritalStatus", v)}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
          </>}

          {/* ADDRESS SECTION */}
          {(section === 'address' || !section) && <>
            <div>
              <Label htmlFor="placeOfBirthDistrict">Place of Birth - District</Label>
              <Input name="placeOfBirthDistrict" type="text" value={form.placeOfBirthDistrict} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="placeOfBirthSector">Place of Birth - Sector</Label>
              <Input name="placeOfBirthSector" type="text" value={form.placeOfBirthSector} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="placeOfBirthCell">Place of Birth - Cell</Label>
              <Input name="placeOfBirthCell" type="text" value={form.placeOfBirthCell} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="placeOfBirthVillage">Place of Birth - Village</Label>
              <Input name="placeOfBirthVillage" type="text" value={form.placeOfBirthVillage} onChange={handleChange} />
            </div>
          </>}

          {/* EDUCATION SECTION */}
          {(section === 'education' || !section) && <>
            <div>
              <Label>Type</Label>
              <div className="relative">
                <Select
                  options={typeOptions}
                  placeholder="Select type"
                  value={form.type}
                  onChange={(v: string) => handleSelect("type", v)}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <div className="relative">
                <Select
                  options={statusOptions}
                  placeholder="Select status"
                  value={form.status}
                  onChange={(v: string) => handleSelect("status", v)}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div>
              <Label>Region</Label>
              <div className="relative">
                <Select
                  options={regionOptions}
                  placeholder="Select region"
                  value={form.regionId}
                  onChange={(v: string) => handleSelect("regionId", v)}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div>
              <Label>University</Label>
              <div className="relative">
                <Select
                  options={universityOptions}
                  placeholder="Select university"
                  value={form.universityId}
                  onChange={(v: string) => handleSelect("universityId", v)}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            {/* Small Group for student/graduate */}
            {(form.type === 'student' || form.type === 'graduate') && form.universityId && (
              <div>
                <Label>Small Group</Label>
                <div className="relative">
                  <Select
                    options={[{ value: '', label: 'None' }, ...smallGroupOptions]}
                    placeholder="Assign Small Group"
                    value={form.smallGroupId}
                    onChange={(v: string) => handleSelect("smallGroupId", v)}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            )}
            {/* Alumni Group for alumni/graduate */}
            {(form.type === 'alumni' || form.type === 'graduate') && (
              <div>
                <Label>Alumni Group</Label>
                <div className="relative">
                  <Select
                    options={[{ value: '', label: 'None' }, ...alumniGroupOptions]}
                    placeholder="Assign Alumni Group"
                    value={form.alumniGroupId}
                    onChange={(v: string) => handleSelect("alumniGroupId", v)}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="graduationDate">Graduation Date</Label>
              <Input name="graduationDate" type="date" value={form.graduationDate} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="faculty">Faculty</Label>
              <Input name="faculty" type="text" value={form.faculty} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="professionalism">Professionalism</Label>
              <Input name="professionalism" type="text" value={form.professionalism} onChange={handleChange} />
            </div>
            <div>
              <Label>Local Church</Label>
              <Input name="localChurch" type="text" value={form.localChurch} onChange={handleChange} />
            </div>
          </>}
        </div>
        <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition w-full" disabled={isSubmitting}>
          {isSubmitting ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Member" : "Add Member")}
        </button>
      </form>
    </ComponentCard>
  );
} 