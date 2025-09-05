import { useState, useEffect } from "react";
import Select from "./Select";
import Label from "./Label";

interface SuperAdminScopeSelectorProps {
  onScopeChange: (scope: {
    regionId?: string;
    universityId?: string;
    smallGroupId?: string;
    alumniGroupId?: string;
  }) => void;
}

export default function SuperAdminScopeSelector({ onScopeChange }: SuperAdminScopeSelectorProps) {
  const [regionId, setRegionId] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [smallGroupId, setSmallGroupId] = useState("");
  const [alumniGroupId, setAlumniGroupId] = useState("");
  
  const [regionOptions, setRegionOptions] = useState<{ value: string; label: string }[]>([]);
  const [universityOptions, setUniversityOptions] = useState<{ value: string; label: string }[]>([]);
  const [smallGroupOptions, setSmallGroupOptions] = useState<{ value: string; label: string }[]>([]);
  const [alumniGroupOptions, setAlumniGroupOptions] = useState<{ value: string; label: string }[]>([]);

  // Load initial data
  useEffect(() => {
    // Fetch regions
    fetch("/api/members/regions")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRegionOptions([{ value: "", label: "All Regions" }, ...data.map((r: any) => ({ value: String(r.id), label: r.name }))]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch regions:", err);
      });

    // Fetch universities
    fetch("/api/members/universities")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUniversityOptions([{ value: "", label: "All Universities" }, ...data.map((u: any) => ({ value: String(u.id), label: u.name }))]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch universities:", err);
      });

    // Fetch small groups
    fetch("/api/members/small-groups")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSmallGroupOptions([{ value: "", label: "All Small Groups" }, ...data.map((sg: any) => ({ value: String(sg.id), label: sg.name }))]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch small groups:", err);
      });

    // Fetch alumni groups
    fetch("/api/members/alumni-small-groups")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAlumniGroupOptions([{ value: "", label: "All Alumni Groups" }, ...data.map((ag: any) => ({ value: String(ag.id), label: ag.name }))]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch alumni groups:", err);
      });
  }, []);

  // Cascading filter logic for universities based on region
  useEffect(() => {
    if (regionId) {
      fetch(`/api/members/universities?regionId=${regionId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setUniversityOptions([{ value: "", label: "All Universities" }, ...data.map((u: any) => ({ value: String(u.id), label: u.name }))]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch universities for region:", err);
        });
      setUniversityId("");
      setSmallGroupId("");
      setAlumniGroupId("");
    } else {
      fetch("/api/members/universities")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setUniversityOptions([{ value: "", label: "All Universities" }, ...data.map((u: any) => ({ value: String(u.id), label: u.name }))]);
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
          if (Array.isArray(data)) {
            setSmallGroupOptions([{ value: "", label: "All Small Groups" }, ...data.map((sg: any) => ({ value: String(sg.id), label: sg.name }))]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch small groups for university:", err);
        });
      setSmallGroupId("");
    } else {
      fetch("/api/members/small-groups")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSmallGroupOptions([{ value: "", label: "All Small Groups" }, ...data.map((sg: any) => ({ value: String(sg.id), label: sg.name }))]);
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
          if (Array.isArray(data)) {
            setAlumniGroupOptions([{ value: "", label: "All Alumni Groups" }, ...data.map((ag: any) => ({ value: String(ag.id), label: ag.name }))]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch alumni groups for region:", err);
        });
    } else {
      fetch("/api/members/alumni-small-groups")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAlumniGroupOptions([{ value: "", label: "All Alumni Groups" }, ...data.map((ag: any) => ({ value: String(ag.id), label: ag.name }))]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch alumni groups:", err);
        });
    }
  }, [regionId]);

  // Notify parent when scope changes
  useEffect(() => {
    onScopeChange({
      regionId: regionId || undefined,
      universityId: universityId || undefined,
      smallGroupId: smallGroupId || undefined,
      alumniGroupId: alumniGroupId || undefined,
    });
  }, [regionId, universityId, smallGroupId, alumniGroupId, onScopeChange]);

  return (
    <div className="bg-[#181f2c] rounded-xl p-4 mb-6">
      <div className="text-white text-sm font-medium mb-3">Super Admin Scope Selection:</div>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px]">
          <Label htmlFor="regionId">Filter by Region</Label>
          <Select
            options={regionOptions}
            placeholder="Select region"
            value={regionId}
            onChange={setRegionId}
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <Label htmlFor="universityId">Filter by University</Label>
          <Select
            options={universityOptions}
            placeholder="Select university"
            value={universityId}
            onChange={setUniversityId}
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <Label htmlFor="smallGroupId">Filter by Small Group</Label>
          <Select
            options={smallGroupOptions}
            placeholder="Select small group"
            value={smallGroupId}
            onChange={setSmallGroupId}
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <Label htmlFor="alumniGroupId">Filter by Alumni Group</Label>
          <Select
            options={alumniGroupOptions}
            placeholder="Select alumni group"
            value={alumniGroupId}
            onChange={setAlumniGroupId}
          />
        </div>
      </div>
    </div>
  );
}
