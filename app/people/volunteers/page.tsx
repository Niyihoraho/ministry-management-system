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

const typeOptions = [
  { value: "student", label: "Student" },
  { value: "graduate", label: "Graduate" },
  { value: "volunteer", label: "Volunteer" },
];
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "alumni", label: "Alumni" },
  { value: "inactive", label: "Inactive" },
];
const smallGroupOptions = [
  { value: "1", label: "Small Group 1" },
  { value: "2", label: "Small Group 2" },
];
const universityOptions = [
  { value: "1", label: "University 1" },
  { value: "2", label: "University 2" },
];
const commitmentOptions = [
  { value: "part-time", label: "Part-time" },
  { value: "full-time", label: "Full-time" },
];

export default function VolunteersPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "volunteer",
    status: "active",
    smallGroupId: "",
    universityId: "",
    graduationDate: "",
    skills: "",
    hours: 0,
    commitmentLevel: "",
    onboardingDate: "",
    exitDate: "",
    notes: "",
  });
  const [view, setView] = useState<'view' | 'add'>('view');
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Mock search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // TODO: Replace with real API call
    if (e.target.value.length > 1) {
      setSearchResults([
        { id: 1, name: "Jane Doe", email: "jane@example.com", phone: "1234567890" },
        { id: 2, name: "John Smith", email: "john@example.com", phone: "0987654321" },
      ]);
    } else {
      setSearchResults([]);
    }
  };

  const selectMember = (member: any) => {
    setForm({
      ...form,
      name: member.name,
      email: member.email,
      phone: member.phone,
      // Optionally populate other fields if available
    });
    setSearchResults([]);
    setSearch(member.name);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSelect = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };
  const handleDate = (dates: any, currentDateString: string, name?: string) => {
    if (name) {
      setForm({ ...form, [name]: currentDateString });
    } else {
      setForm({ ...form, graduationDate: currentDateString });
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit logic
    alert(JSON.stringify(form, null, 2));
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] w-full transition-all duration-300 px-2 sm:px-4 md:px-8">
      {/* Search input for existing members */}
      <div className="mb-4 max-w-xl mx-auto relative">
        <Input
          name="search"
          type="text"
          placeholder="Search member by name, email, or phone"
          value={search}
          onChange={handleSearchChange}
          className="pl-10 py-2 h-9 text-sm"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {/* Inline SVG for search icon */}
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </span>
        {searchResults.length > 0 && (
          <ul className="bg-white border rounded shadow mt-2">
            {searchResults.map(member => (
              <li
                key={member.id}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => selectMember(member)}
              >
                {member.name} ({member.email}, {member.phone})
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Segmented Button Group - right aligned and small */}
      <div className="w-full flex justify-end">
        <div className="flex mb-4 rounded-xl bg-[#181f2c] p-0.5 gap-1 text-sm">
          <button
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors duration-150 focus:outline-none ${view === 'view' ? 'bg-[#232b3b] text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setView('view')}
          >
            View Volunteers
          </button>
          <button
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors duration-150 focus:outline-none ${view === 'add' ? 'bg-[#232b3b] text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setView('add')}
          >
            Add Volunteer
          </button>
        </div>
      </div>
      {view === 'add' ? (
        <div className="mx-auto w-full max-w-xl">
          <ComponentCard title="Add New Volunteer">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input name="name" type="text" value={form.name} onChange={handleChange}/>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input name="phone" type="text" value={form.phone} onChange={handleChange} />
              </div>
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
                <Label>Small Group</Label>
                <div className="relative">
                  <Select
                    options={smallGroupOptions}
                    placeholder="Select small group"
                    value={form.smallGroupId}
                    onChange={(v: string) => handleSelect("smallGroupId", v)}
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
              <div>
                <DatePicker
                  id="graduation-date"
                  label="Graduation Date"
                  placeholder="Select graduation date"
                  onChange={(date, str) => handleDate(date, str)}
                />
              </div>
              <div>
                <Label htmlFor="skills">Skills</Label>
                <Input name="skills" type="text" value={form.skills} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="hours">Hours</Label>
                <Input name="hours" type="number" value={form.hours} onChange={handleChange} />
              </div>
              <div>
                <Label>Commitment Level</Label>
                <div className="relative">
                  <Select
                    options={commitmentOptions}
                    placeholder="Select commitment level"
                    value={form.commitmentLevel}
                    onChange={(v: string) => handleSelect("commitmentLevel", v)}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
              <div>
                <DatePicker
                  id="onboarding-date"
                  label="Onboarding Date"
                  placeholder="Select onboarding date"
                  onChange={(date, str) => handleDate(date, str, "onboardingDate")}
                />
              </div>
              <div>
                <DatePicker
                  id="exit-date"
                  label="Exit Date"
                  placeholder="Select exit date"
                  onChange={(date, str) => handleDate(date, str, "exitDate")}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              </div>
              <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition w-full">
                Add Volunteer
              </button>
            </form>
          </ComponentCard>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-7xl transition-all duration-300">
          <ComponentCard title="Volunteers Directory">
            <div className="mb-6">
              <BasicTableOne />
            </div>
            <div className="flex justify-end">
              <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
            </div>
          </ComponentCard>
        </div>
      )}
    </div>
  );
} 