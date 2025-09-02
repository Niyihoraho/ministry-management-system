"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Link from "next/link";
import { FaFacebookF, FaTimes, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import MemberForm from "../MemberForm";
import Select from "@/app/components/common/Select";

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-[#181f2c] rounded-2xl shadow-xl max-w-2xl w-full p-0 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-8 text-gray-400 hover:text-gray-700 dark:hover:text-white text-4xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition"
          aria-label="Close modal"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default function MemberDetailPage() {
  const params = useParams();
  const id = params.id;
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [regions, setRegions] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [smallGroups, setSmallGroups] = useState<any[]>([]);
  const [alumniGroups, setAlumniGroups] = useState<any[]>([]);
  const [showCreateSmallGroup, setShowCreateSmallGroup] = useState(false);
  const [showCreateAlumniGroup, setShowCreateAlumniGroup] = useState(false);
  const [newSmallGroupName, setNewSmallGroupName] = useState("");
  const [newAlumniGroupName, setNewAlumniGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Fetch regions and universities
  useEffect(() => {
    fetch('/api/members/regions')
      .then(res => res.json())
      .then(data => setRegions(data))
      .catch(() => setRegions([]));
    fetch('/api/members/universities')
      .then(res => res.json())
      .then(data => setUniversities(data))
      .catch(() => setUniversities([]));
  }, []);

  const fetchMember = () => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/members/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setMember(data);
        } else {
          setError("Member not found");
        }
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch member details");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  // Fetch small groups for university and alumni groups for region
  useEffect(() => {
    if (member?.universityId) {
      fetch(`/api/members/small-groups?universityId=${member.universityId}`)
        .then(res => res.json())
        .then(data => setSmallGroups(Array.isArray(data) ? data : []))
        .catch(() => setSmallGroups([]));
    }
    if (member?.regionId) {
      fetch(`/api/members/alumni-small-groups?regionId=${member.regionId}`)
        .then(res => res.json())
        .then(data => setAlumniGroups(Array.isArray(data) ? data : []))
        .catch(() => setAlumniGroups([]));
    }
  }, [member?.universityId, member?.regionId]);

  // Assign group handler
  const handleAssignGroup = async (groupId: string, type: 'small' | 'alumni') => {
    if (!member?.id || !groupId) return;
    const body = type === 'small' ? { smallGroupId: groupId } : { alumniGroupId: groupId };
    await fetch(`/api/members/${member.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...member, ...body }),
    });
    fetchMember(); // Refresh member data
  };

  // Add group creation handlers
  const handleCreateSmallGroup = async () => {
    if (!newSmallGroupName || !member.universityId || !member.regionId) return;
    setCreatingGroup(true);
    await fetch("/api/members/small-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSmallGroupName, universityId: member.universityId, regionId: member.regionId })
    });
    setNewSmallGroupName("");
    setShowCreateSmallGroup(false);
    setCreatingGroup(false);
    // Refresh small groups
    fetch(`/api/members/small-groups?universityId=${member.universityId}`)
      .then(res => res.json())
      .then(data => setSmallGroups(Array.isArray(data) ? data : []))
      .catch(() => setSmallGroups([]));
  };
  const handleCreateAlumniGroup = async () => {
    if (!newAlumniGroupName || !member.regionId) return;
    setCreatingGroup(true);
    await fetch("/api/members/alumni-small-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newAlumniGroupName, regionId: member.regionId })
    });
    setNewAlumniGroupName("");
    setShowCreateAlumniGroup(false);
    setCreatingGroup(false);
    // Refresh alumni groups
    fetch(`/api/members/alumni-small-groups?regionId=${member.regionId}`)
      .then(res => res.json())
      .then(data => setAlumniGroups(Array.isArray(data) ? data : []))
      .catch(() => setAlumniGroups([]));
  };

  if (loading) return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500 dark:text-gray-400">Loading members...</span>
      </div>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!member) return <div className="p-8 text-center">No member found.</div>;

  // Helper to get region/university name
  const getRegionName = (id: any) => regions.find(r => String(r.id) === String(id))?.name || 'N/A';
  const getUniversityName = (id: any) => universities.find(u => String(u.id) === String(id))?.name || 'N/A';
  const getSmallGroupName = (id: any) => smallGroups.find(g => String(g.id) === String(id))?.name || 'N/A';
  const getAlumniGroupName = (id: any) => alumniGroups.find(g => String(g.id) === String(id))?.name || 'N/A';

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 sm:px-4 md:px-8">
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditSection(null); }}>
        <MemberForm initialData={member} section={editSection || undefined} onClose={() => { setModalOpen(false); setEditSection(null); }} onSuccess={fetchMember} />
      </Modal>
      <ComponentCard title="Profile" className="mb-8 bg-[#181f2c] border-none">
        <div className="flex flex-col gap-6">
          {/* Profile Card */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 p-6 rounded-xl bg-[#1e2636]">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                <span className="text-3xl text-white font-bold">
                  {member.firstname?.charAt(0)}{member.secondname?.charAt(0)}
                </span>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{member.firstname} {member.secondname}</div>
                <div className="text-base text-gray-400 font-medium">{member.type ? member.type.charAt(0).toUpperCase() + member.type.slice(1) : ""}</div>
                <div className="text-sm text-gray-500 mt-1">{member.placeOfBirthDistrict || "-"}{member.placeOfBirthDistrict && member.placeOfBirthSector ? ", " : ""}{member.placeOfBirthSector || ""}</div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="p-6 rounded-xl bg-[#1e2636] mb-4 relative">
            <div className="flex justify-between items-center mb-6">
              <div className="text-lg font-bold text-white">Personal Information</div>
              <button onClick={() => { setModalOpen(true); setEditSection('personal'); }} className="px-5 py-2 rounded-full border border-gray-600 text-gray-200 hover:bg-[#232b3b] transition flex items-center gap-2 text-sm font-medium"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20v-8m0 0V4m0 8H4m8 0h8"/></svg> Edit</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div><Label>First Name</Label><div className="text-white font-semibold text-base">{member.firstname}</div></div>
              <div><Label>Last Name</Label><div className="text-white font-semibold text-base">{member.secondname}</div></div>
              <div><Label>Gender</Label><div className="text-white font-semibold text-base capitalize">{member.gender || "N/A"}</div></div>
              <div><Label>Birthdate</Label><div className="text-white font-semibold text-base">{member.birthdate ? new Date(member.birthdate).toLocaleDateString() : "N/A"}</div></div>
              <div><Label>Email address</Label><div className="text-white font-semibold text-base">{member.email || "N/A"}</div></div>
              <div><Label>Phone</Label><div className="text-white font-semibold text-base">{member.phone || "N/A"}</div></div>
              <div className="md:col-span-2"><Label>Marital Status</Label><div className="text-white font-semibold text-base">{member.maritalStatus || "N/A"}</div></div>
            </div>
          </div>

          {/* Address Section */}
          <div className="p-6 rounded-xl bg-[#1e2636] relative">
            <div className="flex justify-between items-center mb-6">
              <div className="text-lg font-bold text-white">Address</div>
              <button onClick={() => { setModalOpen(true); setEditSection('address'); }} className="px-5 py-2 rounded-full border border-gray-600 text-gray-200 hover:bg-[#232b3b] transition flex items-center gap-2 text-sm font-medium"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20v-8m0 0V4m0 8H4m8 0h8"/></svg> Edit</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div><Label>District</Label><div className="text-white font-semibold text-base">{member.placeOfBirthDistrict || "N/A"}</div></div>
              <div><Label>Sector</Label><div className="text-white font-semibold text-base">{member.placeOfBirthSector || "N/A"}</div></div>
              <div><Label>Cell</Label><div className="text-white font-semibold text-base">{member.placeOfBirthCell || "N/A"}</div></div>
              <div><Label>Village</Label><div className="text-white font-semibold text-base">{member.placeOfBirthVillage || "N/A"}</div></div>
            </div>
          </div>

          {/* Education & Groups Section */}
          <div className="p-6 rounded-xl bg-[#1e2636] relative">
            <div className="flex justify-between items-center mb-6">
              <div className="text-lg font-bold text-white">Education & Groups</div>
              <button onClick={() => { setModalOpen(true); setEditSection('education'); }} className="px-5 py-2 rounded-full border border-gray-600 text-gray-200 hover:bg-[#232b3b] transition flex items-center gap-2 text-sm font-medium"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20v-8m0 0V4m0 8H4m8 0h8"/></svg> Edit</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div><Label>Type</Label><div className="text-white font-semibold text-base capitalize">{member.type || "N/A"}</div></div>
              <div><Label>Status</Label><div className="text-white font-semibold text-base capitalize">{member.status || "N/A"}</div></div>
              <div><Label>Region</Label><div className="text-white font-semibold text-base">{getRegionName(member.regionId)}</div></div>
              <div><Label>University</Label><div className="text-white font-semibold text-base">{getUniversityName(member.universityId)}</div></div>
              
              {/* === MODIFIED SECTION: STUDENT SMALL GROUP === */}
              {member.type === 'student' && (
                <div>
                  <Label>Small Group</Label>
                  {member.smallGroupId ? (
                    <div className="text-white font-semibold text-base">{getSmallGroupName(member.smallGroupId)}</div>
                  ) : smallGroups.length > 0 ? (
                    <Select
                      options={[{ value: '', label: 'Assign Small Group' }, ...smallGroups.map((g: any) => ({ value: String(g.id), label: g.name }))]}
                      value={''}
                      onChange={(v: string) => handleAssignGroup(v, 'small')}
                    />
                  ) : (
                    <div className="text-white font-semibold text-base">N/A</div>
                  )}
                </div>
              )}
              
              {/* === MODIFIED SECTION: ALUMNI/GRADUATE GROUP === */}
              {(member.type === 'graduate' || member.type === 'alumni') && (
                <div>
                  <Label>Alumni Group</Label>
                  {member.alumniGroupId ? (
                     <div className="text-white font-semibold text-base">{getAlumniGroupName(member.alumniGroupId)}</div>
                  ) : alumniGroups.length > 0 ? (
                    <Select
                      options={[{ value: '', label: 'Assign Alumni Group' }, ...alumniGroups.map((g: any) => ({ value: String(g.id), label: g.name }))]}
                      value={''}
                      onChange={(v: string) => handleAssignGroup(v, 'alumni')}
                    />
                  ) : (
                    <div className="text-white font-semibold text-base">N/A</div>
                  )}
                </div>
              )}

              <div><Label>Graduation Date</Label><div className="text-white font-semibold text-base">{member.graduationDate ? new Date(member.graduationDate).toLocaleDateString() : "N/A"}</div></div>
              <div><Label>Faculty</Label><div className="text-white font-semibold text-base">{member.faculty || "N/A"}</div></div>
              <div><Label>Professionalism</Label><div className="text-white font-semibold text-base">{member.professionalism || "N/A"}</div></div>
              <div><Label>Local Church</Label><div className="text-white font-semibold text-base">{member.localChurch || "N/A"}</div></div>
            </div>
          </div>

          {/* System Info Section */}
          <div className="p-6 rounded-xl bg-[#1e2636] relative">
            <div className="flex justify-between items-center mb-6">
              <div className="text-lg font-bold text-white">System Info</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div><Label>ID</Label><div className="text-white font-semibold text-base">{member.id}</div></div>
              <div><Label>Created At</Label><div className="text-white font-semibold text-base">{member.createdAt ? new Date(member.createdAt).toLocaleString() : "N/A"}</div></div>
              <div><Label>Updated At</Label><div className="text-white font-semibold text-base">{member.updatedAt ? new Date(member.updatedAt).toLocaleString() : "N/A"}</div></div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
} 