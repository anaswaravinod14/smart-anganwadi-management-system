import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import Modal from '../components/Modal';
import {
  Users,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Baby,
  User as UserIcon,
  Phone,
  Mail
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'worker',
    phone: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.list();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFilter = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const data = await userService.list(params);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userService.create(formData);
      setIsModalOpen(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'worker',
        phone: '',
      });
      loadUsers();
    } catch (err) {
      console.error(err);
      alert('Error creating user. Username might already exist.');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return <span className="badge badge-danger"><ShieldCheck size={12} /> Admin</span>;
      case 'supervisor': return <span className="badge badge-info"><Building2 size={12} /> Supervisor</span>;
      case 'worker': return <span className="badge badge-success"><Baby size={12} /> Worker</span>;
      default: return <span className="badge badge-warning"><UserIcon size={12} /> Parent</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>User & Staff Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            System Access Roles • Anganwadi Workers • Supervisors • Parent Accounts
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Create Staff / User
        </button>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by username, name or email..."
              style={{ paddingLeft: '2.2rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchFilter()}
            />
          </div>

          <div style={{ minWidth: 180 }}>
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Access Roles</option>
              <option value="admin">Administrators</option>
              <option value="worker">Anganwadi Workers</option>
              <option value="supervisor">Supervisors</option>
              <option value="parent">Parents</option>
            </select>
          </div>

          <button onClick={handleSearchFilter} className="btn btn-secondary btn-sm">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Assigned Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading user accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.first_name} {u.last_name}</td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      <span className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Mail size={12} /> {u.email || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Phone size={12} /> {u.phone || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-neutral'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-muted">{u.date_joined?.split('T')[0] || '-'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New System User">
        <form onSubmit={handleCreateUser}>
          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="worker">Anganwadi Worker</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrator</option>
                <option value="parent">Parent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="10-digit mobile"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Create User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
