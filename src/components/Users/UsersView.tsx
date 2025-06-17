import React, { useState, useMemo } from 'react';
import { User, Mail, Phone, Shield, Edit, Trash2, Eye, Search, Download, Plus, Building2 } from 'lucide-react';
import UserModal from './UserModal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import { useUsers } from '../../hooks/useUsers';
import type { Database } from '../../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function UsersView() {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Profile>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<Profile | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = !roleFilter || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });

    return filtered;
  }, [users, searchTerm, roleFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Profile) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewUser = (user: Profile) => {
    setSelectedUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      await deleteUser(userId);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Department', 'Phone', 'Created'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.department || '',
        user.phone || '',
        new Date(user.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      case 'sales':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'manager':
        return '👔';
      case 'sales':
        return '💼';
      case 'user':
        return '👤';
      default:
        return '👤';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            className="sm:w-80"
          />
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'manager', label: 'Manager' },
              { value: 'sales', label: 'Sales' },
              { value: 'user', label: 'User' }
            ]}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} icon={Download}>
            Export
          </Button>
          <Button onClick={handleCreateUser} icon={Plus}>
            Add User
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredAndSortedUsers.length} of {users.length} users
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => handleViewUser(user)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  className="h-12 w-12 rounded-full"
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3B82F6&color=fff`}
                  alt={user.name}
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{user.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditUser(user);
                  }}
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                  title="Edit User"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteUser(user.id);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Delete User"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                  <span className="mr-1">{getRoleIcon(user.role)}</span>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <Shield className="w-4 h-4 text-gray-400" />
              </div>

              {user.department && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Building2 className="w-4 h-4 mr-2" />
                  {user.department}
                </div>
              )}

              {user.phone && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-2" />
                  {user.phone}
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 dark:border-gray-600">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <div className="text-gray-500 dark:text-gray-400">
            {searchTerm || roleFilter ? 'No users match your filters' : 'No users found'}
          </div>
          {!searchTerm && !roleFilter && (
            <Button onClick={handleCreateUser} className="mt-4" icon={Plus}>
              Add Your First User
            </Button>
          )}
        </div>
      )}

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        mode={modalMode}
        onSave={modalMode === 'create' ? createUser : (data) => updateUser(selectedUser!.id, data)}
      />
    </div>
  );
}