import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Select from "@/app/components/common/Select";
import Input from "@/app/components/input/InputField";
import { useState, useEffect } from "react";

const attendanceStatuses = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
];

interface AttendanceFormProps {
  onSuccess?: () => void;
}

export default function AttendanceForm({ onSuccess }: AttendanceFormProps) {
  const [eventId, setEventId] = useState("");
  const [eventOptions, setEventOptions] = useState<{ value: string; label: string }[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [regionId, setRegionId] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [smallGroupId, setSmallGroupId] = useState("");
  const [alumniGroupId, setAlumniGroupId] = useState("");
  const [regionOptions, setRegionOptions] = useState<{ value: string; label: string }[]>([]);
  const [allUniversities, setAllUniversities] = useState<{ id: number; name: string; regionId: number }[]>([]);
  const [universityOptions, setUniversityOptions] = useState<{ value: string; label: string }[]>([]);
  const [allSmallGroups, setAllSmallGroups] = useState<{ id: number; name: string; universityId: number }[]>([]);
  const [smallGroupOptions, setSmallGroupOptions] = useState<{ value: string; label: string }[]>([]);
  const [allAlumniGroups, setAllAlumniGroups] = useState<{ id: number; name: string; regionId: number }[]>([]);
  const [alumniGroupOptions, setAlumniGroupOptions] = useState<{ value: string; label: string }[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{ [memberId: string]: string }>({});
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.events)) {
          setEventOptions(data.events.map((ev: any) => ({ value: String(ev.id), label: ev.name })));
        }
      })
      .catch(err => {
        console.error("Failed to fetch events:", err);
      });
    fetch("/api/regions")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.regions)) {
          setRegionOptions(data.regions.map((r: { id: number; name: string }) => ({ value: String(r.id), label: r.name })));
        }
      });
    fetch("/api/universities")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.universities)) {
          setAllUniversities(data.universities);
        }
      });
            fetch("/api/members/small-groups")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.smallGroups)) {
          setAllSmallGroups(data.smallGroups);
        }
      });
            fetch("/api/members/alumni-small-groups")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.alumniSmallGroups)) {
          setAllAlumniGroups(data.alumniSmallGroups);
        }
      });
  }, []);

  // When eventId changes, fetch the event details (or find from options if already loaded)
  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      setRegionId("");
      setUniversityId("");
      setSmallGroupId("");
      setAlumniGroupId("");
      return;
    }
    // Fetch event details
    fetch(`/api/events?id=${eventId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.events && Array.isArray(data.events)) {
          setEvent(data.events[0]);
          setRegionId("");
          setUniversityId("");
          setSmallGroupId("");
          setAlumniGroupId("");
        }
      })
      .catch(err => {
        console.error("Failed to fetch event details:", err);
      });
  }, [eventId]);

  useEffect(() => {
    if (regionId) {
      const filtered = allUniversities
        .filter(u => String(u.regionId) === regionId)
        .map(u => ({ value: String(u.id), label: u.name }));
      setUniversityOptions(filtered);
      if (!filtered.some(u => u.value === universityId)) {
        setUniversityId("");
        setSmallGroupId("");
        setAlumniGroupId("");
      }
      // Filter alumni groups by region
      const alumniFiltered = allAlumniGroups
        .filter(ag => String(ag.regionId) === regionId)
        .map(ag => ({ value: String(ag.id), label: ag.name }));
      setAlumniGroupOptions(alumniFiltered);
      if (!alumniFiltered.some(ag => ag.value === alumniGroupId)) {
        setAlumniGroupId("");
      }
    } else {
      setUniversityOptions([]);
      setAlumniGroupOptions([]);
      setUniversityId("");
      setSmallGroupId("");
      setAlumniGroupId("");
    }
  }, [regionId, allUniversities, allAlumniGroups]);

  useEffect(() => {
    if (universityId) {
      const filtered = allSmallGroups
        .filter(sg => String(sg.universityId) === universityId)
        .map(sg => ({ value: String(sg.id), label: sg.name }));
      setSmallGroupOptions(filtered);
      if (!filtered.some(sg => sg.value === smallGroupId)) {
        setSmallGroupId("");
      }
    } else {
      setSmallGroupOptions([]);
      setSmallGroupId("");
    }
  }, [universityId, allSmallGroups]);

  // Fetch members after all required selections
  useEffect(() => {
    setMembers([]);
    setAttendance({});
    setMemberError(null);
    if (!regionId || !universityId) return;
    let url = "";
    if (smallGroupId) {
      url = `/api/members?smallGroupId=${smallGroupId}`;
    } else if (alumniGroupId) {
      url = `/api/members?alumniGroupId=${alumniGroupId}`;
    } else if (event && event.smallGroupId && smallGroupId) {
      url = `/api/members?smallGroupId=${smallGroupId}`;
    } else if (event && event.alumniGroupId && alumniGroupId) {
      url = `/api/members?alumniGroupId=${alumniGroupId}`;
    } else if (universityId) {
      url = `/api/members?universityId=${universityId}`;
    } else if (regionId) {
      url = `/api/members?regionId=${regionId}`;
    }
    if (!url) return;
    setIsLoadingMembers(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.members)) {
          setMembers(data.members);
          // Default all to present
          const initialAttendance: { [memberId: string]: string } = {};
          data.members.forEach((m: any) => {
            initialAttendance[m.id] = "present";
          });
          setAttendance(initialAttendance);
        } else {
          setMembers([]);
        }
      })
      .catch(err => {
        setMemberError("Failed to fetch members");
      })
      .finally(() => setIsLoadingMembers(false));
  }, [event, regionId, universityId, smallGroupId, alumniGroupId]);

  const handleAttendanceChange = (memberId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [memberId]: status }));
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);
    setSubmitError(null);
    
    // Validate that we have the required selections
    if (!eventId) {
      setSubmitError("Please select an event to mark attendance for.");
      return;
    }
    
    if (members.length === 0) {
      setSubmitError("No members found for the selected criteria.");
      return;
    }
    
    const attendanceRecords = members.map(m => {
      const record: any = {
        memberId: parseInt(m.id),
        status: attendance[m.id] || "present",
      };
      
      // Only use permanentEventId for attendance records
      if (eventId && event?.id) {
        record.permanentEventId = parseInt(event.id);
      }
      
      return record;
    });
    
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceRecords),
      });
      const data = await res.json();
      
      if (res.status === 201 && data.results && data.results.every((r: any) => r.success)) {
        setSubmitMessage("Attendance saved successfully!");
        setSubmitError(null);
        // Clear form after successful submission
        setAttendance({});
        setMembers([]);
        onSuccess?.();
      } else {
        const errorMessages = data.results
          ?.filter((r: any) => !r.success)
          ?.map((r: any) => {
            if (typeof r.error === 'object') {
              return Object.values(r.error).flat().join(", ");
            }
            return r.error;
          })
          ?.join(", ") || "Some attendance records could not be saved.";
        setSubmitError(errorMessages);
        setSubmitMessage(null);
      }
    } catch (err: any) {
      setSubmitError("Failed to save attendance. " + (err.message || ""));
      setSubmitMessage(null);
    }
  };

  return (
    <ComponentCard title="Mark Attendance">
      <form className="space-y-6" onSubmit={handleAttendanceSubmit}>
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div className="flex-1 min-w-[180px]">
            <Label htmlFor="eventId">Event *</Label>
            <div className="relative">
              <Select
                options={[{ value: "", label: "-- Select Event --" }, ...eventOptions]}
                placeholder="Select event"
                value={eventId}
                onChange={setEventId}
              />
            </div>
          </div>
          <div className="flex-1 min-w-[180px]">
            <Label htmlFor="regionId">Filter by Region</Label>
            <div className="relative">
              <Select
                options={[{ value: "", label: "-- All Regions --" }, ...regionOptions]}
                placeholder="Select region"
                value={regionId}
                onChange={setRegionId}
              />
            </div>
          </div>
          <div className="flex-1 min-w-[180px]">
            <Label htmlFor="universityId">Filter by University</Label>
            <div className="relative">
              <Select
                options={[{ value: "", label: "-- All Universities --" }, ...universityOptions]}
                placeholder="Select university"
                value={universityId}
                onChange={setUniversityId}
              />
            </div>
          </div>
          <div className="flex-1 min-w-[180px]">
            <Label htmlFor="smallGroupId">Filter by Small Group</Label>
            <div className="relative">
              <Select
                options={[{ value: "", label: "-- All Small Groups --" }, ...smallGroupOptions]}
                placeholder="Select small group"
                value={smallGroupId}
                onChange={setSmallGroupId}
              />
            </div>
          </div>
          <div className="flex-1 min-w-[180px]">
            <Label htmlFor="alumniGroupId">Filter by Alumni Group</Label>
            <div className="relative">
              <Select
                options={[{ value: "", label: "-- All Alumni Groups --" }, ...alumniGroupOptions]}
                placeholder="Select alumni small group"
                value={alumniGroupId}
                onChange={setAlumniGroupId}
              />
            </div>
          </div>
        </div>
        {submitMessage && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{submitMessage}</div>}
        {submitError && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{submitError}</div>}
        {/* Members Attendance Table */}
        {isLoadingMembers ? (
          <div className="mt-8 p-4 bg-gray-50 border rounded text-gray-500 text-center">Loading members...</div>
        ) : memberError ? (
          <div className="mt-8 p-4 bg-red-100 border border-red-300 rounded text-red-700 text-center">{memberError}</div>
        ) : members.length > 0 ? (
          <div className="overflow-x-auto mt-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map(member => (
                  <tr key={member.id}>
                    <td className="px-4 py-2 text-gray-800 dark:text-white/90">{member.firstname} {member.secondname}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        {attendanceStatuses.map(status => (
                          <button
                            key={status.value}
                            type="button"
                            className={`px-3 py-1 rounded font-semibold text-xs transition
                              ${attendance[member.id] === status.value
                                ? status.value === 'present'
                                  ? 'bg-green-100 text-green-800'
                                  : status.value === 'excused'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                : status.value === 'present'
                                  ? 'border border-green-400 text-green-700 bg-transparent'
                                  : status.value === 'excused'
                                    ? 'border border-yellow-400 text-yellow-700 bg-transparent'
                                    : 'border border-red-400 text-red-700 bg-transparent'}
                            `}
                            onClick={() => handleAttendanceChange(member.id, status.value)}
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 text-right">
              <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
                Save Attendance
              </button>
            </div>
          </div>
        ) : (
          eventId ? (
            <div className="mt-8 p-4 bg-gray-50 border rounded text-gray-500 text-center">
              No members found for the selected criteria.
            </div>
          ) : (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded text-blue-600 text-center">
              Please select an event to mark attendance for.
            </div>
          )
        )}
      </form>
    </ComponentCard>
  );
} 