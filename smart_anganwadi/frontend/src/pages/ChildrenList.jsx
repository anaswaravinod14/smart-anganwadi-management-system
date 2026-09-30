import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { childService, centerService } from '../services/api';
import Modal from '../components/Modal';
import {
  Baby,
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  Calendar,
  Phone,
  User,
  AlertCircle
} from 'lucide-react';

const ChildrenList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    child_id: '',
    name: '',
    date_of_birth: '',
    gender: 'Male',
    parent_name: '',
    parent_phone: '',
    address: '',
    admission_date: new Date().toISOString().split('T')[0],
    anganwadi_center: '',
    active: true
  });
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [childList, centerList] = await Promise.all([
        childService.list(),
        centerService.list()
      ]);
      setChildren(childList);
      setCenters(centerList);
      if (centerList.length > 0) {
        setFormData(prev => ({ ...prev, anganwadi_center: centerList[0].id }));
      }
    } catch (err) {
      console.error('Error fetching children:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFilter = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedGender) params.gender = selectedGender;
      if (selectedCenter) params.center = selectedCenter;
      const data = await childService.list(params);
      setChildren(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChild = async (e) => {
    e.preventDefault();
    setModalError('');
    setSaving(true);
    try {
      await childService.create(formData);
      setIsModalOpen(false);
      setFormData({
        child_id: `CHD-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        date_of_birth: '',
        gender: 'Male',
        parent_name: '',
        parent_phone: '',
        address: '',
        admission_date: new Date().toISOString().split('T')[0],
        anganwadi_center: centers[0]?.id || '',
        active: true
      });
      loadData();
    } catch (err) {
      console.error(err);
      setModalError(
        err.response?.data?.child_id?.[0] || 
        err.response?.data?.detail || 
        'Failed to register child. Please check required fields.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChild = async (id, name) => {
    if (window.confirm(`Are you sure you want to deactivate or remove ${name}?`)) {
      try {
        await childService.delete(id);
        loadData();
      } catch (err) {
        console.error(err);
        alert('Could not delete record. Check permissions.');
      }
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Children Registry</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Comprehensive Enrollment, Demographics & Child Tracking
          </p>
        </div>

        {user?.role !== 'parent' && (
          <button 
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                child_id: `CHD-${Math.floor(100 + Math.random() * 900)}`
              }));
              setIsModalOpen(true);
            }} 
            className="btn btn-primary"
          >
            <Plus size={18} /> Register New Child
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by Child Name, ID or Parent..."
              style={{ paddingLeft: '2.2rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchFilter()}
            />
          </div>

          <div style={{ minWidth: 150 }}>
            <select
              className="form-select"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="Male">Boys (Male)</option>
              <option value="Female">Girls (Female)</option>
            </select>
          </div>

          <div style={{ minWidth: 180 }}>
            <select
              className="form-select"
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
            >
              <option value="">All Anganwadi Centers</option>
              {centers.map(c => (
                <option key={c.id} value={c.id}>{c.center_name}</option>
              ))}
            </select>
          </div>

          <button onClick={handleSearchFilter} className="btn btn-secondary btn-sm">
            <Filter size={16} /> Apply Filters
          </button>
        </div>
      </div>

      {/* Children Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Child ID</th>
                <th>Name</th>
                <th>DOB / Age</th>
                <th>Gender</th>
                <th>Parent & Contact</th>
                <th>Center</th>
                <th>Growth Status</th>
                <th>Attendance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading children records...
                  </td>
                </tr>
              ) : children.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No children found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                children.map(child => (
                  <tr key={child.id}>
                    <td>
                      <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                        {child.child_id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: child.gender === 'Female' ? '#fce7f3' : '#e0e7ff',
                          color: child.gender === 'Female' ? '#db2777' : '#4338ca',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}>
                          {child.name.charAt(0)}
                        </div>
                        <div>
                          <Link 
                            to={`/${user?.role || 'worker'}/children/${child.id}`}
                            style={{ fontWeight: 700, color: 'var(--text-main)', textDecoration: 'none' }}
                          >
                            {child.name}
                          </Link>
                          <div className="text-xs text-muted">Adm: {child.admission_date}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{child.date_of_birth}</div>
                    </td>
                    <td>
                      <span className={`badge ${child.gender === 'Female' ? 'badge-warning' : 'badge-info'}`}>
                        {child.gender}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{child.parent_name}</div>
                      <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Phone size={11} /> {child.parent_phone}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-semibold">{child.center_name || 'Center'}</span>
                    </td>
                    <td>
                      {child.latest_growth ? (
                        <span className={`badge ${
                          child.latest_growth.growth_status === 'Normal' ? 'badge-success' :
                          child.latest_growth.growth_status === 'Underweight' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {child.latest_growth.growth_status}
                        </span>
                      ) : (
                        <span className="badge badge-neutral">Not recorded</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {child.attendance_stats?.percentage || 0}%
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link 
                          to={`/${user?.role || 'worker'}/children/${child.id}`}
                          className="btn btn-secondary btn-sm"
                          title="View Full Profile"
                        >
                          <Eye size={14} /> Profile
                        </Link>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteChild(child.id, child.name)}
                            className="btn btn-sm btn-secondary"
                            style={{ color: 'var(--danger)' }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Child Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Register New Child in Anganwadi"
      >
        {modalError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger-text)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleCreateChild}>
          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Child ID (Unique)</label>
              <input
                type="text"
                className="form-control"
                value={formData.child_id}
                onChange={(e) => setFormData({ ...formData, child_id: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Aarav Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Parent / Guardian Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.parent_name}
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Parent Contact Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="10 digit phone"
                value={formData.parent_phone}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Anganwadi Center</label>
              <select
                className="form-select"
                value={formData.anganwadi_center}
                onChange={(e) => setFormData({ ...formData, anganwadi_center: e.target.value })}
                required
              >
                {centers.map(c => (
                  <option key={c.id} value={c.id}>{c.center_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Admission Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <textarea
              className="form-control"
              placeholder="House, street, locality..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Registering...' : 'Save Child Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChildrenList;
