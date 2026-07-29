import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, UserMinus, Mail, Crown, Search, Clock } from 'lucide-react';
import api from '../../lib/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEmail, setAssignEmail] = useState('');
  const [assignRole, setAssignRole] = useState('admin');
  const [assignExpiry, setAssignExpiry] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.admin.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await api.admin.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const assignRole = async (e) => {
    e.preventDefault();
    try {
      await api.admin.assignRole({
        email: assignEmail,
        role: assignRole,
        expiresAt: assignExpiry || undefined,
      });

      alert(`Successfully assigned ${assignRole} role to ${assignEmail}`);
      setShowAssignModal(false);
      setAssignEmail('');
      setAssignRole('admin');
      setAssignExpiry('');
      fetchUsers();
      fetchRoles();
    } catch (error) {
      alert('Failed to assign role: ' + error.message);
    }
  };

  const removeRole = async (email) => {
    if (!confirm(`Remove admin role from ${email}?`)) return;

    try {
      await api.admin.removeRole(email);
      alert(`Removed admin role from ${email}`);
      fetchUsers();
      fetchRoles();
    } catch (error) {
      alert('Failed to remove role: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleExpiry = (email) => {
    const role = roles.find(r => r.email === email && r.is_active);
    return role?.expires_at ? new Date(role.expires_at) : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage user roles and permissions</p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
        >
          <UserPlus size={18} />
          Assign Role
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search users by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => {
              const isAdmin = user.role === 'admin' || user.role === 'moderator';
              const expiryDate = getRoleExpiry(user.email);

              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {user.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      isAdmin
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isAdmin ? <Crown size={12} /> : <User size={12} />}
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.is_active
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {expiryDate ? (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {expiryDate.toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Never</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isAdmin ? (
                      <button
                        onClick={() => removeRole(user.email)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <UserMinus size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setAssignEmail(user.email);
                          setShowAssignModal(true);
                        }}
                        className="text-primary hover:text-primary/700 hover:bg-primary/5 p-2 rounded-lg transition-colors"
                      >
                        <Shield size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Assign Role Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Assign Role</h3>

            <form onSubmit={assignRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={assignExpiry}
                  onChange={(e) => setAssignExpiry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty for permanent access</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
