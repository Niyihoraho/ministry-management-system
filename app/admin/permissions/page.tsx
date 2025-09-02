'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Shield, Eye, Key } from 'lucide-react';
import ComponentCard from '../../components/common/ComponentCard';
import Badge from '../../components/badge/Badge';

interface Permission {
  id: number;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  scope: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterScope, setFilterScope] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: '',
    action: '',
    scope: 'global',
    isActive: true
  });

  // Fetch permissions from API
  const fetchPermissions = async () => {
    try {
      const params = new URLSearchParams();
      if (filterResource) params.append('resource', filterResource);
      if (filterAction) params.append('action', filterAction);
      if (filterScope) params.append('scope', filterScope);
      if (filterStatus !== 'all') params.append('isActive', filterStatus === 'active' ? 'true' : 'false');

      const response = await fetch(`/api/permissions?${params}`);
      const result = await response.json();

      if (result.success) {
        setPermissions(result.data);
      } else {
        console.error('Failed to fetch permissions:', result.error);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPermissions();
      setLoading(false);
    };
    loadData();
  }, [filterResource, filterAction, filterScope, filterStatus]);

  const getScopeColor = (scope: string) => {
    const colors = {
      'global': 'bg-purple-100 text-purple-800',
      'regional': 'bg-blue-100 text-blue-800',
      'university': 'bg-green-100 text-green-800',
      'smallgroup': 'bg-yellow-100 text-yellow-800',
      'alumni_group': 'bg-indigo-100 text-indigo-800',
      'personal': 'bg-gray-100 text-gray-800'
    };
    return colors[scope as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getActionColor = (action: string) => {
    const colors = {
      'create': 'bg-green-100 text-green-800',
      'read': 'bg-blue-100 text-blue-800',
      'update': 'bg-yellow-100 text-yellow-800',
      'delete': 'bg-red-100 text-red-800',
      'manage': 'bg-purple-100 text-purple-800',
      'approve': 'bg-indigo-100 text-indigo-800'
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateModal(false);
        setFormData({ name: '', description: '', resource: '', action: '', scope: 'global', isActive: true });
        fetchPermissions();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating permission:', error);
      alert('Failed to create permission');
    }
  };

  const handleUpdatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermission) return;

    try {
      const response = await fetch('/api/permissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedPermission.id,
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowEditModal(false);
        setSelectedPermission(null);
        setFormData({ name: '', description: '', resource: '', action: '', scope: 'global', isActive: true });
        fetchPermissions();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating permission:', error);
      alert('Failed to update permission');
    }
  };

  const handleDeletePermission = async (permissionId: number) => {
    if (!confirm('Are you sure you want to delete this permission? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/permissions?id=${permissionId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        fetchPermissions();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting permission:', error);
      alert('Failed to delete permission');
    }
  };

  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description || '',
      resource: permission.resource,
      action: permission.action,
      scope: permission.scope,
      isActive: permission.isActive,
    });
    setShowEditModal(true);
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.action.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get unique resources and actions for filters
  const uniqueResources = [...new Set(permissions.map(p => p.resource))];
  const uniqueActions = [...new Set(permissions.map(p => p.action))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permissions Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage system permissions and access controls</p>
      </div>

      <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Resources</option>
              {uniqueResources.map(resource => (
                <option key={resource} value={resource}>{resource}</option>
              ))}
            </select>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Scopes</option>
              <option value="global">Global</option>
              <option value="regional">Regional</option>
              <option value="university">University</option>
              <option value="smallgroup">Small Group</option>
              <option value="alumni_group">Alumni Group</option>
              <option value="personal">Personal</option>
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
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{permissions.length}</span> permissions configured
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Permission</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPermissions.map((permission) => (
          <ComponentCard key={permission.id} title={permission.name} className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Key className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex flex-col space-y-1">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getActionColor(permission.action)}`}>
                    {permission.action}
                  </span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getScopeColor(permission.scope)}`}>
                    {permission.scope}
                  </span>
                </div>
              </div>
              <Badge 
                size="sm" 
                color={permission.isActive ? "success" : "error"}
              >
                {permission.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2 dark:text-gray-400">
              {permission.description || 'No description provided'}
            </p>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Resource</label>
              <p className="font-medium mt-1 dark:text-white">{permission.resource}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400">
                Created {new Date(permission.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditPermission(permission)}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  title="Edit Permission"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePermission(permission.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Permission"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </ComponentCard>
        ))}
      </div>

      {filteredPermissions.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No permissions found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Create Permission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Create New Permission</h3>
            <form onSubmit={handleCreatePermission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Permission Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., member:read"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  rows={3}
                  placeholder="Enter permission description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource</label>
                <input
                  type="text"
                  required
                  value={formData.resource}
                  onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., member, training, budget"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
                <select 
                  required
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select action</option>
                  <option value="create">Create</option>
                  <option value="read">Read</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="manage">Manage</option>
                  <option value="approve">Approve</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scope</label>
                <select 
                  required
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="global">Global</option>
                  <option value="regional">Regional</option>
                  <option value="university">University</option>
                  <option value="smallgroup">Small Group</option>
                  <option value="alumni_group">Alumni Group</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
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
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permission Modal */}
      {showEditModal && selectedPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Edit Permission</h3>
            <form onSubmit={handleUpdatePermission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Permission Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource</label>
                <input
                  type="text"
                  required
                  value={formData.resource}
                  onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
                <select 
                  required
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="create">Create</option>
                  <option value="read">Read</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="manage">Manage</option>
                  <option value="approve">Approve</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scope</label>
                <select 
                  required
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="global">Global</option>
                  <option value="regional">Regional</option>
                  <option value="university">University</option>
                  <option value="smallgroup">Small Group</option>
                  <option value="alumni_group">Alumni Group</option>
                  <option value="personal">Personal</option>
                </select>
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
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 