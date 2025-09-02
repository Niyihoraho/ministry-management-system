import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/app/table";
import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Select from "@/app/components/common/Select";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";

interface AttendanceRecord {
  id: number;
  member: { 
    id: number; 
    firstname: string; 
    secondname: string;
    regionId?: number;
    universityId?: number;
    smallGroupId?: number;
    alumniGroupId?: number;
  } | null;
  permanentministryevent: { id: number; name: string } | null;
  trainings: { id: number; name: string } | null;
  status: string;
  recordedAt: string;
}

const fetchAttendance = async (): Promise<AttendanceRecord[]> => {
  try {
    const response = await axios.get("/api/attendance");
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data.attendance)) return response.data.attendance;
    return [];
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    throw error;
  }
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString();
};

const attendanceStatuses = [
  { value: "", label: "All Statuses" },
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
];

export default function AttendanceTable({ refreshKey }: { refreshKey?: number }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 10;
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [eventId, setEventId] = useState("");
  const [eventOptions, setEventOptions] = useState<{ value: string; label: string }[]>([]);
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [regionId, setRegionId] = useState("");
  const [regionOptions, setRegionOptions] = useState<{ value: string; label: string }[]>([]);
  const [universityId, setUniversityId] = useState("");
  const [universityOptions, setUniversityOptions] = useState<{ value: string; label: string }[]>([]);
  const [smallGroupId, setSmallGroupId] = useState("");
  const [smallGroupOptions, setSmallGroupOptions] = useState<{ value: string; label: string }[]>([]);
  const [alumniGroupId, setAlumniGroupId] = useState("");
  const [alumniGroupOptions, setAlumniGroupOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    // Fetch events
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.events)) {
          setEventOptions([{ value: "", label: "All Events" }, ...data.events.map((ev: any) => ({ value: String(ev.id), label: ev.name }))]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch events:", err);
      });

    // Fetch regions
    fetch("/api/regions")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.regions)) {
          setRegionOptions([{ value: "", label: "All Regions" }, ...data.regions.map((r: any) => ({ value: String(r.id), label: r.name }))]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch regions:", err);
      });

    // Fetch universities
    fetch("/api/universities")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.universities)) {
          setUniversityOptions([{ value: "", label: "All Universities" }, ...data.universities.map((u: any) => ({ value: String(u.id), label: u.name }))]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch universities:", err);
      });

    // Fetch small groups
    fetch("/api/members/small-groups")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.smallGroups)) {
          setSmallGroupOptions([{ value: "", label: "All Small Groups" }, ...data.smallGroups.map((sg: any) => ({ value: String(sg.id), label: sg.name }))]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch small groups:", err);
      });

    // Fetch alumni groups
    fetch("/api/members/alumni-small-groups")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.alumniSmallGroups)) {
          setAlumniGroupOptions([{ value: "", label: "All Alumni Groups" }, ...data.alumniSmallGroups.map((ag: any) => ({ value: String(ag.id), label: ag.name }))]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch alumni groups:", err);
      });
  }, []);

  // Cascading filter logic for universities based on region
  useEffect(() => {
    if (regionId) {
      fetch(`/api/universities?regionId=${regionId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.universities)) {
            setUniversityOptions([{ value: "", label: "All Universities" }, ...data.universities.map((u: any) => ({ value: String(u.id), label: u.name }))]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch universities for region:", err);
        });
      // Reset child filters when region changes
      setUniversityId("");
      setSmallGroupId("");
      setAlumniGroupId("");
    } else {
      // Reset to all universities when no region is selected
      fetch("/api/universities")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.universities)) {
            setUniversityOptions([{ value: "", label: "All Universities" }, ...data.universities.map((u: any) => ({ value: String(u.id), label: u.name }))]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch universities:", err);
        });
    }
  }, [regionId]);

  // Cascading filter logic for small groups based on university
  useEffect(() => {
    if (universityId) {
      fetch(`/api/members/small-groups?universityId=${universityId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.smallGroups)) {
            setSmallGroupOptions([{ value: "", label: "All Small Groups" }, ...data.smallGroups.map((sg: any) => ({ value: String(sg.id), label: sg.name }))]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch small groups for university:", err);
        });
      // Reset child filter when university changes
      setSmallGroupId("");
    } else {
      // Reset to all small groups when no university is selected
      fetch("/api/members/small-groups")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.smallGroups)) {
            setSmallGroupOptions([{ value: "", label: "All Small Groups" }, ...data.smallGroups.map((sg: any) => ({ value: String(sg.id), label: sg.name }))]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch small groups:", err);
        });
    }
  }, [universityId]);

  // Cascading filter logic for alumni groups based on region
  useEffect(() => {
    if (regionId) {
      fetch(`/api/members/alumni-small-groups?regionId=${regionId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.alumniSmallGroups)) {
            setAlumniGroupOptions([{ value: "", label: "All Alumni Groups" }, ...data.alumniSmallGroups.map((ag: any) => ({ value: String(ag.id), label: ag.name }))]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch alumni groups for region:", err);
        });
    } else {
      // Reset to all alumni groups when no region is selected
      fetch("/api/members/alumni-small-groups")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.alumniSmallGroups)) {
            setAlumniGroupOptions([{ value: "", label: "All Alumni Groups" }, ...data.alumniSmallGroups.map((ag: any) => ({ value: String(ag.id), label: ag.name }))]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch alumni groups:", err);
        });
    }
  }, [regionId]);

  // Fetch attendance with filters
  const { data: attendance, isLoading, error, isError, refetch } = useQuery<AttendanceRecord[], Error>({
    queryKey: ["attendanceRecords", refreshKey, eventId, status, dateFrom, dateTo, regionId, universityId, smallGroupId, alumniGroupId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (eventId && eventId !== "") params.append("eventId", eventId);
      if (status && status !== "") params.append("status", status);
      if (dateFrom && dateFrom !== "") params.append("dateFrom", dateFrom);
      if (dateTo && dateTo !== "") params.append("dateTo", dateTo);
      if (regionId && regionId !== "") params.append("regionId", regionId);
      if (universityId && universityId !== "") params.append("universityId", universityId);
      if (smallGroupId && smallGroupId !== "") params.append("smallGroupId", smallGroupId);
      if (alumniGroupId && alumniGroupId !== "") params.append("alumniGroupId", alumniGroupId);
      
      const response = await axios.get(`/api/attendance?${params.toString()}`);
      if (Array.isArray(response.data)) return response.data;
      if (Array.isArray(response.data.attendance)) return response.data.attendance;
      return [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filteredAttendance = useMemo(() => {
    if (!attendance) return [];
    if (!searchQuery) return attendance;
    const searchTerm = searchQuery.toLowerCase();
    return attendance.filter(a =>
      (a.member?.firstname?.toLowerCase().includes(searchTerm) ?? false) ||
      (a.member?.secondname?.toLowerCase().includes(searchTerm) ?? false) ||
      (a.permanentministryevent?.name?.toLowerCase().includes(searchTerm) ?? false) ||
      (a.trainings?.name?.toLowerCase().includes(searchTerm) ?? false)
    );
  }, [attendance, searchQuery]);

  const totalPages = Math.ceil(filteredAttendance.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAttendance.slice(indexOfFirstRow, indexOfLastRow);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setEditStatus(record.status);
    setEditMessage(null);
    setEditError(null);
  };
  const handleCancel = () => {
    setEditingId(null);
    setEditStatus("");
    setEditMessage(null);
    setEditError(null);
  };
  const handleSave = async (record: AttendanceRecord) => {
    setEditMessage(null);
    setEditError(null);
    try {
      const res = await fetch(`/api/attendance/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus }),
      });
      if (res.status === 200) {
        setEditMessage("Attendance updated successfully!");
        setEditingId(null);
        setEditStatus("");
        // Refetch attendance records
        refetch();
      } else {
        const data = await res.json();
        setEditError(data.error || "Failed to update attendance.");
      }
    } catch (err: any) {
      setEditError("Failed to update attendance. " + (err.message || ""));
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500 dark:text-gray-400">Loading attendance records...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️ Error loading attendance records</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error instanceof Error ? error.message : "Failed to fetch attendance records"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 p-4 border-b border-gray-200 dark:border-white/[0.05] items-end">
          <div className="min-w-[180px]">
            <Label htmlFor="eventId">Event</Label>
            <Select
              options={eventOptions}
              value={eventId}
              onChange={setEventId}
            />
          </div>
          <div className="min-w-[150px]">
            <Label htmlFor="status">Status</Label>
            <Select
              options={attendanceStatuses}
              value={status}
              onChange={setStatus}
            />
          </div>
          <div className="min-w-[150px]">
            <Label htmlFor="dateFrom">From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="min-w-[150px]">
            <Label htmlFor="dateTo">To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
            />
          </div>
          <div className="min-w-[150px]">
            <Label htmlFor="regionId">Region</Label>
            <Select
              options={regionOptions}
              value={regionId}
              onChange={setRegionId}
            />
          </div>
          <div className="min-w-[150px]">
            <Label htmlFor="universityId">University</Label>
            <Select
              options={universityOptions}
              value={universityId}
              onChange={setUniversityId}
            />
          </div>
          <div className="min-w-[150px]">
            <Label htmlFor="smallGroupId">Small Group</Label>
            <Select
              options={smallGroupOptions}
              value={smallGroupId}
              onChange={setSmallGroupId}
            />
          </div>
          <div className="min-w-[150px]">
            <Label htmlFor="alumniGroupId">Alumni Group</Label>
            <Select
              options={alumniGroupOptions}
              value={alumniGroupId}
              onChange={setAlumniGroupId}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="search">Search</Label>
            <input
              type="text"
              placeholder="Search by member or event name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setEventId("");
                setStatus("");
                setDateFrom("");
                setDateTo("");
                setRegionId("");
                setUniversityId("");
                setSmallGroupId("");
                setAlumniGroupId("");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
        {editMessage && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{editMessage}</div>}
        {editError && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{editError}</div>}
        {/* Conditional Rendering for No Data */}
        {!currentRows || currentRows.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">📋 No attendance records found</div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : "There are no attendance records to display at the moment."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Member</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Event</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {currentRows.map((record: AttendanceRecord) => (
                      <TableRow key={record.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-semibold text-gray-00 text-base dark:text-white/90">
                            {record.member ? `${record.member.firstname} ${record.member.secondname}` : "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {record.permanentministryevent?.name || record.trainings?.name || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          {editingId === record.id ? (
                            <div className="flex gap-2">
                              {attendanceStatuses.slice(1).map((statusOpt) => (
                                <button
                                  key={statusOpt.value}
                                  type="button"
                                  className={`px-4 py-1 rounded-full font-semibold text-xs border-2 transition-all duration-200 focus:outline-none
                                    ${editStatus === statusOpt.value
                                      ? statusOpt.value === 'present'
                                        ? 'bg-green-500 text-white border-green-500 shadow-md'
                                        : statusOpt.value === 'excused'
                                          ? 'bg-yellow-500 text-white border-yellow-500 shadow-md'
                                          : 'bg-red-500 text-white border-red-500 shadow-md'
                                      : statusOpt.value === 'present'
                                        ? 'bg-transparent text-green-700 border-green-400 hover:bg-green-100'
                                        : statusOpt.value === 'excused'
                                          ? 'bg-transparent text-yellow-700 border-yellow-400 hover:bg-yellow-100'
                                          : 'bg-transparent text-red-700 border-red-400 hover:bg-red-100'}
                                    `}
                                  onClick={() => setEditStatus(statusOpt.value)}
                                >
                                  {statusOpt.label}
                                </button>
                              ))}
                              <button
                                type="button"
                                className="ml-2 px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                                onClick={() => handleSave(record)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1 rounded bg-gray-300 text-gray-800 text-xs font-semibold hover:bg-gray-400"
                                onClick={handleCancel}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`px-4 py-1 rounded-full font-semibold text-xs
                                ${record.status === 'present'
                                  ? 'bg-green-500 text-white shadow-md'
                                  : record.status === 'excused'
                                    ? 'bg-yellow-500 text-white shadow-md'
                                    : 'bg-red-500 text-white shadow-md'}
                              `}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                              <button
                                type="button"
                                className="ml-2 px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                                onClick={() => handleEdit(record)}
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{formatDate(record.recordedAt)}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-white/[0.05]">
                <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">Previous</button>
                <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 