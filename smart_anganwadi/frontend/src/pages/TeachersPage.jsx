import React, { useState, useEffect } from 'react';
import { userService, centerService } from '../services/api';
import Modal from '../components/Modal';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  Users,
  Award,
  Sparkles
} from 'lucide-react';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [centerFilter, setCenterFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    phone: '',
    email: '',
    center_id: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teachersData, centersData] = await Promise.all([
        userService.list({ role: 'teacher' }),
        centerService.list()
      ]);
      setTeachers(teachersData);
      setCenters(centersData);
    } catch (err) {
      console.error('Error loading teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        password: formData.password,
        phone: formData.phone,
        email: formData.email,
        role: 'teacher',
        center_id: formData.center_id ? parseInt(formData.center_id) : null
      };

      await userService.create(payload);
      setIsModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        username: '',
        password: '',
        phone: '',
        email: '',
        center_id: '',
      });
      loadData();
    } catch (err) {
      console.error('Error creating teacher:', err);
      const errDetail = err.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(' | ')
        : 'Failed to create teacher account. Username may already exist.';
      setSubmitError(errDetail);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered teachers list
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      !search ||
      t.username.toLowerCase().includes(search.toLowerCase()) ||
      `${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(search.toLowerCase())) ||
      (t.phone && t.phone.includes(search));

    const matchesCenter =
      !centerFilter ||
      (t.teaching_center_name && t.teaching_center_name.toLowerCase().includes(centerFilter.toLowerCase()));

    return matchesSearch && matchesCenter;
  });

  const assignedCount = teachers.filter((t) => t.teaching_center_name).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#4338ca', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <GraduationCap size={14} /> Early Childhood Care & Education (ECCE)
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
            ECCE Teachers Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Manage Anganwadi Preschool Educators, Kendra Assignments & ECCE Instruction Staff
          </p>
        </div>

        <button
          onClick={() => {
            setSubmitError('');
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', border: 'none' }}
        >
          <Plus size={18} /> Add New Teacher
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="card stat-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total ECCE Teachers
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#4338ca' }}>
                {loading ? '...' : teachers.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Registered educators
              </div>
            </div>
            <div style={{ background: '#e0e7ff', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <GraduationCap size={24} color="#4338ca" />
            </div>
          </div>
        </div>

        <div className="card stat-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Kendra Assigned
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--success)' }}>
                {loading ? '...' : assignedCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Active in classrooms
              </div>
            </div>
            <div style={{ background: '#dcfce7', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <Building2 size={24} color="#16a34a" />
            </div>
          </div>
        </div>

        <div className="card stat-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Unassigned Teachers
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#f59e0b' }}>
                {loading ? '...' : Math.max(0, teachers.length - assignedCount)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Available for deployment
              </div>
            </div>
            <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <Users size={24} color="#d97706" />
            </div>
          </div>
        </div>

        <div className="card stat-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Kendras
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#0d9488' }}>
                {loading ? '...' : centers.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Anganwadi network
              </div>
            </div>
            <div style={{ background: '#ccfbf1', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <Sparkles size={24} color="#0d9488" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search teacher by name, username, phone or email..."
              style={{ paddingLeft: '2.2rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: 220 }}>
            <select
              className="form-select"
              value={centerFilter}
              onChange={(e) => setCenterFilter(e.target.value)}
            >
              <option value="">All Kendra Centers</option>
              {centers.map((c) => (
                <option key={c.id} value={c.center_name}>
                  {c.center_name}
                </option>
              ))}
            </select>
          </div>

          {(search || centerFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setCenterFilter('');
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Teachers Directory Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Teacher Profile</th>
                <th>Assigned Kendra Center</th>
                <th>Mobile Contact</th>
                <th>Email Address</th>
                <th>Role Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Loading ECCE teachers directory...
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No teachers found matching criteria. Click <strong>"+ Add New Teacher"</strong> above to register a teacher.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}>
                          {(t.first_name?.[0] || t.username?.[0] || 'T').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {t.first_name || t.last_name ? `${t.first_name} ${t.last_name}` : t.username}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            @{t.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      {t.teaching_center_name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Building2 size={14} color="#4f46e5" />
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {t.teaching_center_name}
                          </span>
                        </div>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <Phone size={13} color="var(--text-muted)" />
                        {t.phone || 'N/A'}
                      </span>
                    </td>

                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <Mail size={13} color="var(--text-muted)" />
                        {t.email || 'N/A'}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${t.is_active ? 'badge-success' : 'badge-neutral'}`}>
                        {t.is_active ? 'Active Educator' : 'Inactive'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {t.date_joined ? t.date_joined.split('T')[0] : '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TEACHER MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register ECCE Anganwadi Teacher">
        <form onSubmit={handleCreateTeacher}>
          {submitError && (
            <div style={{
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              border: '1px solid #fecaca',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Meera"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Sharma"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. teacher_meera"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-control"
                placeholder="10-digit mobile"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="teacher@anganwadi.gov.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assign Anganwadi Kendra / Center</label>
            <select
              className="form-select"
              value={formData.center_id}
              onChange={(e) => setFormData({ ...formData, center_id: e.target.value })}
            >
              <option value="">-- Optional: Assign Later --</option>
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.center_name} ({c.center_code})
                </option>
              ))}
            </select>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              Assigning a center will instantly grant the teacher access to the preschool roster and attendance register for that Kendra.
            </small>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', border: 'none' }}
            >
              {submitting ? 'Creating Teacher...' : 'Save & Register Teacher'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeachersPage;

