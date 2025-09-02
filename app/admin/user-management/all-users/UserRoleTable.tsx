'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";

interface UserRole {
  id: number;
  userId: string;
  scope: string;
  regionId?: number;
  universityId?: number;
  smallGroupId?: number;
  alumniGroupId?: number;
  assignedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  region?: {
    id: number;
    name: string;
  };
  university?: {
    id: number;
    name: string;
  };
  smallgroup?: {
    id: number;
    name: string;
  };
  alumnismallgroup?: {
    id: number;
    name: string;
  };
}

export default function UserRoleTable({ refreshKey }: { refreshKey?: number }) {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user-roles?all=true');
      if (response.data.roles) {
        setUserRoles(response.data.roles);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch user roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [refreshKey]);

  const getScopeLabel = (scope: string) => {
    const scopeLabels: { [key: string]: string } = {
      superadmin: 'Super Admin',
      national: 'National',
      region: 'Region',
      university: 'University',
      smallgroup: 'Small Group',
      alumnismallgroup: 'Alumni Small Group'
    };
    return scopeLabels[scope] || scope;
  };

  const getEntityName = (role: UserRole) => {
    if (role.scope === 'region' && role.region) {
      return role.region.name;
    }
    if (role.scope === 'university' && role.university) {
      return role.university.name;
    }
    if (role.scope === 'smallgroup' && role.smallgroup) {
      return role.smallgroup.name;
    }
    if (role.scope === 'alumnismallgroup' && role.alumnismallgroup) {
      return role.alumnismallgroup.name;
    }
    return 'N/A';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">Loading...</div>
              <p className="text-gray-500 dark:text-gray-400">Fetching user roles...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-400 text-lg mb-2">Error</div>
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={fetchUserRoles}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.05]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Roles</h3>
        </div>
        
        {userRoles.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">No user roles found</div>
              <p className="text-gray-500 dark:text-gray-400">No user roles have been assigned yet.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Scope
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assigned Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-white/[0.03] divide-y divide-gray-200 dark:divide-white/[0.05]">
                {userRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {role.user.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {role.user.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {getScopeLabel(role.scope)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {getEntityName(role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(role.assignedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
