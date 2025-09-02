'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Shield, Users, Settings, Search, Filter, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import ComponentCard from '../../components/common/ComponentCard';
import Badge from '../../components/badge/Badge';
import Label from '../../components/common/Label';
import Select from '../../components/common/Select';
import Input from '../../components/input/InputField';
import { ChevronDownIcon } from '../../icons';

interface Role {
  id: number;
  name: string;
  description: string | null;
  level: string;
  isActive: boolean;
  isSystem: boolean;
  permissionsCount?: number;
  usersCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: number;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  scope: string;
  isActive: boolean;
  isAssigned: boolean;
}

interface PermissionCategory {
  category: string;
  displayName: string;
  permissions: Permission[];
}



export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [updatingPermissions, setUpdatingPermissions] = useState(false);
  const [permissionChanges, setPermissionChanges] = useState<{ [key: number]: boolean }>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: '',
    isActive: true,
    isSystem: false
  });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      const params = new URLSearchParams();
      if (filterLevel) params.append('level', filterLevel);
      if (filterStatus !== 'all') params.append('isActive', filterStatus === 'active' ? 'true' : 'false');
      params.append('includeUserCount', 'true');

      const response = await fetch(`/api/roles?${params}`);
      const result = await response.json();

      if (result.success) {
        setRoles(result.data);
      } else {
        console.error('Failed to fetch roles:', result.error);
        setError('Failed to fetch roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Failed to fetch roles');
    }
  };



  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchRoles();
      setLoading(false);
    };
    loadData();
  }, [filterLevel, filterStatus]);

  const getLevelColor = (level: string) => {
    const colors = {
      'System': 'bg-red-100 text-red-800',
      'National': 'bg-purple-100 text-purple-800',
      'Regional': 'bg-blue-100 text-blue-800',
      'Campus': 'bg-green-100 text-green-800',
      'SmallGroup': 'bg-yellow-100 text-yellow-800',
      'GraduateNetwork': 'bg-indigo-100 text-indigo-800',
      'Department': 'bg-gray-100 text-gray-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Role created successfully!');
        // Don't close modal immediately, let user see the success message
        setFormData({ name: '', description: '', level: '', isActive: true, isSystem: false });
        fetchRoles();
      } else {
        setError(result.error || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      setError('Failed to create role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedRole.id,
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Role updated successfully!');
        // Don't close modal immediately, let user see the success message
        fetchRoles();
      } else {
        setError(result.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      setError('Failed to update role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    setError(null);

    try {
      const response = await fetch(`/api/roles?id=${roleId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Just refresh the roles list without showing a message
        fetchRoles();
      } else {
        setError(result.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      setError('Failed to delete role');
    }
  };



  const handleViewRole = async (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      level: role.level,
      isActive: role.isActive,
      isSystem: role.isSystem,
    });
    setShowViewModal(true);
    
    // Fetch permissions for this role
    await fetchRolePermissions(role.id);
  };

  const fetchRolePermissions = async (roleId: number) => {
    setLoadingPermissions(true);
    try {
      const response = await fetch(`/api/permissions/grouped?roleId=${roleId}`);
      const result = await response.json();

      if (result.success) {
        setPermissionCategories(result.data);
      } else {
        console.error('Failed to fetch permissions:', result.error);
        setError('Failed to fetch role permissions');
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setError('Failed to fetch role permissions');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handlePermissionChange = (permissionId: number, isAssigned: boolean) => {
    // Store the change locally without saving to database yet
    setPermissionChanges(prev => ({
      ...prev,
      [permissionId]: isAssigned
    }));
    setHasChanges(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole || !hasChanges) return;

    setUpdatingPermissions(true);
    try {
      // Convert changes to the format expected by the API
      const permissions = Object.entries(permissionChanges).map(([permissionId, isAssigned]) => ({
        permissionId: parseInt(permissionId),
        isAssigned: isAssigned
      }));

      const response = await fetch('/api/role-permissions/bulk-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: selectedRole.id,
          permissions: permissions
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the local state to reflect the changes
        setPermissionCategories(prevCategories => 
          prevCategories.map(category => ({
            ...category,
            permissions: category.permissions.map(permission => {
              const change = permissionChanges[permission.id];
              if (change !== undefined) {
                return { ...permission, isAssigned: change };
              }
              return permission;
            })
          }))
        );
        
        // Clear the changes
        setPermissionChanges({});
        setHasChanges(false);
        setMessage('Permissions saved successfully!');
      } else {
        setError(result.error || 'Failed to save permissions');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      setError('Failed to save permissions');
    } finally {
      setUpdatingPermissions(false);
    }
  };

  const handleCancelChanges = () => {
    setPermissionChanges({});
    setHasChanges(false);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      level: role.level,
      isActive: role.isActive,
      isSystem: role.isSystem,
    });
    setShowEditModal(true);
  };



  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Messages - Only show errors on main page, success messages are in modals */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Review your members roles and allocate permissions.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Manage Roles</span>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Levels</option>
                <option value="System">System</option>
                <option value="National">National</option>
                <option value="Regional">Regional</option>
                <option value="Campus">Campus</option>
                <option value="SmallGroup">Small Group</option>
                <option value="GraduateNetwork">Graduate Network</option>
                <option value="Department">Department</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{roles.length}</span> roles configured
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div key={role.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            {/* Role Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{role.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Scope:</span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(role.level)}`}>
                    {role.level}
                  </span>
                  {role.isSystem && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      System
                    </span>
                  )}
                </div>
              </div>
                              <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {role.usersCount || 0} Manager{role.usersCount !== 1 ? 's' : ''}
                  </div>
                </div>
            </div>

            {/* Role Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">
              {role.description || 'No description provided'}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 justify-end">
              <button
                onClick={() => handleViewRole(role)}
                className="px-3 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditRole(role)}
                className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
              </button>
              {!role.isSystem && (
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Create New Role Card */}
        <div 
          onClick={() => setShowCreateModal(true)}
          className="bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Create New Role</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Define a new role with specific permissions and scope
          </p>
        </div>
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No roles found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#181f2c] rounded-2xl shadow-xl max-w-2xl w-full p-0 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-8 text-gray-400 hover:text-gray-700 dark:hover:text-white text-4xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition"
              aria-label="Close modal"
            >
              &times;
            </button>
            <ComponentCard title="Create New Role">
              <form onSubmit={handleCreateRole} className="space-y-6">
                {/* Success Message */}
                {message && (
                  <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>{message}</span>
                  </div>
                )}
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}
                <div>
                  <Label htmlFor="name">Role Name</Label>
                  <Input 
                    name="name" 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    rows={3}
                    placeholder="Enter role description"
                  />
                </div>
                <div>
                  <Label>Level</Label>
                  <div className="relative">
                    <Select
                      options={[
                        { value: "System", label: "System" },
                        { value: "National", label: "National" },
                        { value: "Regional", label: "Regional" },
                        { value: "Campus", label: "Campus" },
                        { value: "SmallGroup", label: "Small Group" },
                        { value: "GraduateNetwork", label: "Graduate Network" },
                        { value: "Department", label: "Department" }
                      ]}
                      placeholder="Select level"
                      value={formData.level}
                      onChange={(v: string) => setFormData({ ...formData, level: v })}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="isSystem"
                      checked={formData.isSystem}
                      onChange={(e) => setFormData({ ...formData, isSystem: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isSystem" className="text-sm text-gray-700 dark:text-gray-300">System Role</label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setMessage(null);
                      setError(null);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    disabled={isSubmitting}
                  >
                    {message ? 'Close' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Role'}
                  </button>
                </div>
              </form>
            </ComponentCard>
          </div>
        </div>
      )}

            {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#181f2c] rounded-2xl shadow-xl max-w-2xl w-full p-0 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-8 text-gray-400 hover:text-gray-700 dark:hover:text-white text-4xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition"
              aria-label="Close modal"
            >
              &times;
            </button>
            <ComponentCard title="Edit Role">
              <form onSubmit={handleUpdateRole} className="space-y-6">
                {/* Success Message */}
                {message && (
                  <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>{message}</span>
                  </div>
                )}
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}
                <div>
                  <Label htmlFor="name">Role Name</Label>
                  <Input 
                    name="name" 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Level</Label>
                  <div className="relative">
                    <Select
                      options={[
                        { value: "System", label: "System" },
                        { value: "National", label: "National" },
                        { value: "Regional", label: "Regional" },
                        { value: "Campus", label: "Campus" },
                        { value: "SmallGroup", label: "Small Group" },
                        { value: "GraduateNetwork", label: "Graduate Network" },
                        { value: "Department", label: "Department" }
                      ]}
                      placeholder="Select level"
                      value={formData.level}
                      onChange={(v: string) => setFormData({ ...formData, level: v })}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="editIsActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="editIsActive" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedRole(null);
                      setFormData({ name: '', description: '', level: '', isActive: true, isSystem: false });
                      setMessage(null);
                      setError(null);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    disabled={isSubmitting}
                  >
                    {message ? 'Close' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                    >
                    {isSubmitting ? 'Updating...' : 'Update Role'}
                  </button>
                </div>
              </form>
            </ComponentCard>
          </div>
        </div>
      )}

      {/* View Role Modal */}
      {showViewModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#181f2c] rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">View Role Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRole(null);
                  setMessage(null);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-6">
                {/* Success Message */}
                {message && (
                  <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>{message}</span>
                  </div>
                )}
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}
                {/* Role Information Section */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Role Name</Label>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedRole.name}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Level</Label>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(selectedRole.level)}`}>
                          {selectedRole.level}
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Description</Label>
                      <div className="text-gray-700 dark:text-gray-300">
                        {selectedRole.description || 'No description provided'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status inline with description */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedRole.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedRole.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {selectedRole.isSystem && (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                          System Role
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Permissions Section */}
                <div>
                  <Label>Role Permissions</Label>
                  <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    {loadingPermissions ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading permissions...</span>
                      </div>
                    ) : updatingPermissions ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Updating permissions...</span>
                      </div>
                    ) : permissionCategories.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {permissionCategories.map((category) => (
                          <div key={category.category} className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{category.displayName}</h4>
                            <div className="space-y-2">
                                                             {category.permissions.map((permission) => (
                                 <div key={permission.id} className="flex items-center space-x-2">
                                   <input 
                                     type="checkbox" 
                                     id={`permission-${permission.id}`}
                                     checked={permissionChanges[permission.id] !== undefined ? permissionChanges[permission.id] : permission.isAssigned}
                                     onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                     disabled={updatingPermissions}
                                     className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                                   />
                                   <label 
                                     htmlFor={`permission-${permission.id}`} 
                                     className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                   >
                                     {permission.action.charAt(0).toUpperCase() + permission.action.slice(1)} {permission.resource.charAt(0).toUpperCase() + permission.resource.slice(1)}
                                   </label>
                                 </div>
                               ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <span className="text-gray-600 dark:text-gray-400">No permissions found for this role.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {hasChanges && (
                      <span className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>You have unsaved changes</span>
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    {hasChanges && (
                      <button
                        type="button"
                        onClick={handleCancelChanges}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        disabled={updatingPermissions}
                      >
                        Cancel
                      </button>
                    )}
                    {hasChanges && (
                      <button
                        type="button"
                        onClick={handleSavePermissions}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={updatingPermissions}
                      >
                        {updatingPermissions ? 'Saving...' : 'Save Changes'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowViewModal(false);
                        setSelectedRole(null);
                        setMessage(null);
                        setError(null);
                        setPermissionChanges({});
                        setHasChanges(false);
                      }}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      {message ? 'Close' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
} 