import { useState, useEffect } from "react";

interface CurrentScopeDisplayProps {
  onScopeChange?: (scope: {
    regionId?: string;
    universityId?: string;
    smallGroupId?: string;
    alumniGroupId?: string;
  }) => void;
}

interface UserScope {
  scope: string;
  regionId?: number;
  universityId?: number;
  smallGroupId?: number;
  alumniGroupId?: number;
  regionName?: string;
  universityName?: string;
  smallGroupName?: string;
  alumniGroupName?: string;
}

export default function CurrentScopeDisplay({ onScopeChange }: CurrentScopeDisplayProps) {
  const [userScope, setUserScope] = useState<UserScope | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // Fetch user's current scope
    fetch("/api/members/current-user-scope")
      .then(res => res.json())
      .then(data => {
        if (data.scope) {
          setUserScope(data.scope);
          setIsSuperAdmin(data.scope.scope === 'superadmin');
          
          // Notify parent component of current scope
          onScopeChange?.({
            regionId: data.scope.regionId?.toString(),
            universityId: data.scope.universityId?.toString(),
            smallGroupId: data.scope.smallGroupId?.toString(),
            alumniGroupId: data.scope.alumniGroupId?.toString(),
          });
        }
      })
      .catch(err => {
        console.error("Failed to fetch user scope:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [onScopeChange]);

  if (isLoading) {
    return (
      <div className="bg-[#181f2c] rounded-xl p-4 mb-6">
        <div className="text-white text-sm font-medium mb-3">Your Current Scope:</div>
        <div className="flex flex-wrap gap-2">
          <div className="bg-[#232b3b] text-gray-400 px-3 py-1.5 rounded-lg text-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!userScope) {
    return (
      <div className="bg-[#181f2c] rounded-xl p-4 mb-6">
        <div className="text-white text-sm font-medium mb-3">Your Current Scope:</div>
        <div className="flex flex-wrap gap-2">
          <div className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-sm">
            No scope assigned
          </div>
        </div>
      </div>
    );
  }

  const scopeItems = [];

  // Add scope items based on user's role
  if (userScope.regionName) {
    scopeItems.push({
      label: `Region: ${userScope.regionName}`,
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    });
  }

  if (userScope.universityName) {
    scopeItems.push({
      label: `University: ${userScope.universityName}`,
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    });
  }

  if (userScope.smallGroupName) {
    scopeItems.push({
      label: `Small Group: ${userScope.smallGroupName}`,
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    });
  }

  if (userScope.alumniGroupName) {
    scopeItems.push({
      label: `Alumni Group: ${userScope.alumniGroupName}`,
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    });
  }

  // For superadmin, show special indicator
  if (isSuperAdmin) {
    scopeItems.push({
      label: 'Super Admin',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400'
    });
  }

  return (
    <div className="bg-[#181f2c] rounded-xl p-4 mb-6">
      <div className="text-white text-sm font-medium mb-3">Your Current Scope:</div>
      <div className="flex flex-wrap gap-2">
        {scopeItems.map((item, index) => (
          <div
            key={index}
            className={`${item.bgColor} ${item.textColor} px-3 py-1.5 rounded-lg text-sm font-medium`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
