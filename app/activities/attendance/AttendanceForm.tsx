import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Select from "@/app/components/common/Select";
import Input from "@/app/components/input/InputField";
import CurrentScopeDisplay from "@/app/components/common/CurrentScopeDisplay";
import SuperAdminScopeSelector from "@/app/components/common/SuperAdminScopeSelector";
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
  const [members, setMembers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{ [memberId: string]: string }>({});
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEventOptions(data.map((ev: any) => ({ value: String(ev.id), label: ev.name })));
        }
      })
      .catch(err => {
        console.error("Failed to fetch events:", err);
      });
  }, []);

  // Handle scope changes from the scope components
  const handleScopeChange = (scope: {
    regionId?: string;
    universityId?: string;
    smallGroupId?: string;
    alumniGroupId?: string;
  }) => {
    setRegionId(scope.regionId || "");
    setUniversityId(scope.universityId || "");
    setSmallGroupId(scope.smallGroupId || "");
    setAlumniGroupId(scope.alumniGroupId || "");
  };

  // Check if user is super admin
  useEffect(() => {
    fetch("/api/members/current-user-scope")
      .then(res => res.json())
      .then(data => {
        if (data.scope) {
          setIsSuperAdmin(data.scope.scope === 'superadmin');
        }
      })
      .catch(err => {
        console.error("Failed to fetch user scope:", err);
      });
  }, []);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => {
        setSubmitMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitMessage]);

  // When eventId changes, fetch the event details
  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      return;
    }
    // Fetch event details
    fetch(`/api/events?id=${eventId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setEvent(data[0]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch event details:", err);
      });
  }, [eventId]);

  // Fetch members based on user's scope and event selection
  useEffect(() => {
    setMembers([]);
    setAttendance({});
    setMemberError(null);
    
    // Only fetch members if an event is selected
    if (!eventId) return;
    
    // Build URL with scope-based filtering
    let url = "/api/members";
    const params = new URLSearchParams();
    
    // For Super Admin users, add explicit filters if they exist
    // For regular users, the API will automatically apply RLS filtering
    if (isSuperAdmin) {
      if (smallGroupId) {
        params.append("smallGroupId", smallGroupId);
      } else if (alumniGroupId) {
        params.append("alumniGroupId", alumniGroupId);
      } else if (universityId) {
        params.append("universityId", universityId);
      } else if (regionId) {
        params.append("regionId", regionId);
      }
    }
    
    // If we have parameters, add them to the URL
    if (params.toString()) {
      url += "?" + params.toString();
    }
    
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
        console.error("Failed to fetch members:", err);
        setMemberError("Failed to load members");
      })
      .finally(() => setIsLoadingMembers(false));
  }, [eventId, regionId, universityId, smallGroupId, alumniGroupId]);

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
        // Create specific success message with event name
        const eventName = event?.name || "the selected event";
        const memberCount = members.length;
        setSubmitMessage(`Attendance for ${memberCount} member(s) at "${eventName}" has been saved successfully!`);
        setSubmitError(null);
        // Clear form after successful submission but keep user on the form
        setAttendance({});
        setMembers([]);
        // Don't call onSuccess to avoid redirecting
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
    <div>
      {/* Show current scope or super admin selector */}
      {isSuperAdmin ? (
        <SuperAdminScopeSelector onScopeChange={handleScopeChange} />
      ) : (
        <CurrentScopeDisplay onScopeChange={handleScopeChange} />
      )}
      
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
          </div>
        {submitMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{submitMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmitMessage(null);
                  setEventId("");
                  setEvent(null);
                }}
                className="ml-4 text-sm font-medium text-green-600 hover:text-green-500 focus:outline-none focus:underline"
              >
                Mark Another Attendance
              </button>
            </div>
          </div>
        )}
        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{submitError}</p>
              </div>
            </div>
          </div>
        )}
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
    </div>
  );
} 