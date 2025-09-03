"use client";
import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Select from "@/app/components/common/Select";
import DatePicker from "@/app/components/form/date-picker";
import { ChevronDownIcon } from "@/app/icons";
import Input from "@/app/components/input/InputField";
import { useState } from "react";
import BasicTableOne from "@/app/components/tables/BasicTableOne";
import Pagination from "@/app/components/tables/Pagination";
import { useSidebar } from "@/app/context/SidebarContext";
import MemberForm from "./MemberForm";
import MemberTable from "./MemberTable";
import SmallGroupTable from "./SmallGroupMembersTable";
import { DenyOnly, AllowOnly } from "@/app/components/common/RoleBasedAccess";


const typeOptions = [
  { value: "student", label: "Student" },
  { value: "graduate", label: "Graduate" },
];
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "alumni", label: "Alumni" },
  { value: "inactive", label: "Inactive" },
];
// Placeholder options for small groups and universities
const smallGroupOptions = [
  { value: "1", label: "Small Group 1" },
  { value: "2", label: "Small Group 2" },
];
const universityOptions = [
  { value: "1", label: "University 1" },
  { value: "2", label: "University 2" },
];
const regionOptions = [
  { value: "1", label: "Region 1" },
  { value: "2", label: "Region 2" },
];
const alumniGroupOptions = [
  { value: "1", label: "Alumni Group 1" },
  { value: "2", label: "Alumni Group 2" },
];

export default function MemberDirectoryPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "student",
    status: "active",
    regionId: "",
    smallGroupId: "",
    universityId: "",
    alumniGroupId: "",
    graduationDate: "",
  });
  const [view, setView] = useState<'view' | 'add'>('view');
  const [refreshKey, setRefreshKey] = useState(0);
  const { isExpanded, isHovered } = useSidebar();
  const sidebarVisible = isExpanded || isHovered;
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Member added successfully!");
        setForm({
          name: "",
          email: "",
          phone: "",
          type: "student",
          status: "active",
          regionId: "",
          smallGroupId: "",
          universityId: "",
          alumniGroupId: "",
          graduationDate: "",
        });
        setView('view');
        setRefreshKey(prev => prev + 1);
      } else {
        setError(data.error || "Failed to add member.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to add member.");
    }
  };

  return (
    <div
      className={`flex flex-col min-h-[calc(100vh-120px)] w-full transition-all duration-300 px-2 sm:px-4 md:px-8 ${
        sidebarVisible ? 'lg:px-12 xl:px-16 max-w-[calc(100vw-290px)]' : 'lg:px-4 xl:px-6 max-w-[calc(100vw-90px)]'
      }`}
    >
      {/* Segmented Button Group - right aligned and small */}
      <div className="w-full flex justify-end">
        <div className="flex mb-4 rounded-xl bg-[#181f2c] p-0.5 gap-1 text-sm">
          <button
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors duration-150 focus:outline-none ${view === 'view' ? 'bg-[#232b3b] text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => { setView('view'); setRefreshKey(prev => prev + 1); }}
          >
            View Members
          </button>
        <DenyOnly scopes={['smallgroup', 'alumnismallgroup']}>
            <button
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors duration-150 focus:outline-none ${view === 'add' ? 'bg-[#232b3b] text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setView('add')}
            >
              Add Member
            </button>
            </DenyOnly>
        </div>
      </div>
      {/* Responsive container: full width for table, max-w-xl for form */}
      {view === 'add' ? (
        <DenyOnly scopes={['smallgroup', 'alumnismallgroup']} fallback={
          <div className="mx-auto w-full max-w-7xl transition-all duration-300">
            <div className="text-center py-8">
              <p className="text-gray-400">You don't have permission to add members.</p>
            </div>
          </div>
        }>
          <div className="mx-auto w-full max-w-xl">
            <MemberForm />
          </div>
        </DenyOnly>
      ) : (
        <div className="mx-auto w-full max-w-7xl transition-all duration-300">
          {/* Small Group Table - Only visible to smallgroup scope users */}
          <AllowOnly scopes="smallgroup">
            <SmallGroupTable refreshKey={refreshKey} />
          </AllowOnly>
          
          {/* Member Table - Visible to all users except smallgroup */}
          <DenyOnly scopes="smallgroup">
            <MemberTable refreshKey={refreshKey} />
          </DenyOnly>
        </div>
      )}
    </div>
  );
} 