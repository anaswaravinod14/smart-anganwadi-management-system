import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { immunizationService, childService } from '../services/api';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import {
  Syringe,
  Plus,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Baby
} from 'lucide-react';

const ImmunizationTracker = () => {
  const { user } = useAuth();
  const [immunizations, setImmunizations] = useState([]);
  const [children, setChildren] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    child: '',
    vaccine_name: 'DPT Booster 1',
    vaccine_date: new Date().toISOString().split('T')[0],
    next_due_date: '',
    status: 'Completed',
    remarks: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [immList, childList] = await Promise.all([
        immunizationService.list(),
        childService.list()
      ]);
      setImmunizations(immList);
      setChildren(childList);
      if (childList.length > 0) {
        setFormData(prev => ({ ...prev, child: childList[0].id }));
      }
    } catch (err) {
      console.error('Error loading immunizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (st) => {
    setStatusFilter(st);
    try {
      setLoading(true);
      const params = {};
      if (st) params.status = st;
      const data = await immunizationService.list(params);
      setImmunizations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await immunizationService.create(formData);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error saving immunization.');
    }
  };

  const completedCount = immunizations.filter(i => i.status === 'Completed').length;
  const pendingCount = immunizations.filter(i => i.status === 'Pending').length;
  const overdueCount = immunizations.filter(i => i.status === 'Overdue' || i.is_overdue).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Immunization & Vaccine Registry</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Universal Immunization Programme (UIP) • Dose Scheduling • Overdue Surveillance
          </p>
        </div>

        {user?.role !== 'parent' && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Administer / Record Dose
          </button>
        )}
      </div>

      {/* Overdue Warning Alert */}
      {overdueCount > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AlertBanner
            type="danger"
            title={`Surveillance Alert: ${overdueCount} Immunizations Overdue`}
            message="Children who missed required UIP doses have been flagged. Anganwadi worker home visit or PHC coordination required."
          />
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--success)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-xs text-muted font-semibold">DOSES ADMINISTERED</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{completedCount}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="text-xs text-muted font-semibold">UPCOMING SCHEDULED</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{pendingCount}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-xs text-muted font-semibold">MISSED / OVERDUE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)' }}>{overdueCount}</div>
          </div>
        </div>
      </div>

      {/* Immunizations Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Syringe size={18} color="var(--primary)" />
            Vaccine Records ({immunizations.length})
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending (Upcoming)</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Child Name</th>
                <th>Child ID</th>
                <th>Vaccine Name</th>
                <th>Vaccine Date</th>
                <th>Next Due Date</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading vaccine schedule...
                  </td>
                </tr>
              ) : immunizations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No immunization records found matching criteria.
                  </td>
                </tr>
              ) : (
                immunizations.map(imm => {
                  const isOver = imm.status === 'Overdue' || imm.is_overdue;
                  return (
                    <tr key={imm.id} style={{ backgroundColor: isOver ? '#fff1f2' : 'inherit' }}>
                      <td>
                        <Link to={`/${user?.role || 'worker'}/children/${imm.child}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                          {imm.child_name}
                        </Link>
                      </td>
                      <td><span className="badge badge-neutral">{imm.child_id_code}</span></td>
                      <td><strong>{imm.vaccine_name}</strong></td>
                      <td>{imm.vaccine_date || '-'}</td>
                      <td>{imm.next_due_date || '-'}</td>
                      <td>
                        <span className={`badge ${
                          imm.status === 'Completed' ? 'badge-success' :
                          isOver ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {isOver ? 'Overdue' : imm.status}
                        </span>
                      </td>
                      <td>{imm.remarks || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Vaccine Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record UIP Vaccination Dose">
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Enrolled Child</label>
            <select
              className="form-select"
              value={formData.child}
              onChange={(e) => setFormData({ ...formData, child: e.target.value })}
              required
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.child_id})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Vaccine Name</label>
            <select
              className="form-select"
              value={formData.vaccine_name}
              onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
              required
            >
              <option value="BCG">BCG (At Birth)</option>
              <option value="OPV 1">OPV 1 (6 Weeks)</option>
              <option value="Pentavalent 1">Pentavalent 1 (6 Weeks)</option>
              <option value="Rotavirus 1">Rotavirus 1 (6 Weeks)</option>
              <option value="OPV 2">OPV 2 (10 Weeks)</option>
              <option value="Pentavalent 2">Pentavalent 2 (10 Weeks)</option>
              <option value="OPV 3">OPV 3 (14 Weeks)</option>
              <option value="Pentavalent 3">Pentavalent 3 (14 Weeks)</option>
              <option value="Measles-Rubella (MR) 1">Measles-Rubella (MR) 1 (9-12 Months)</option>
              <option value="Vitamin A (1st Dose)">Vitamin A (1st Dose) (9 Months)</option>
              <option value="DPT Booster 1">DPT Booster 1 (16-24 Months)</option>
              <option value="MR 2 / Vitamin A 2">MR 2 / Vitamin A 2 (16-24 Months)</option>
            </select>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Administered Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.vaccine_date}
                onChange={(e) => setFormData({ ...formData, vaccine_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Next Due Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.next_due_date}
                onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Vaccination Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Completed">Completed (Administered)</option>
              <option value="Pending">Pending (Upcoming)</option>
              <option value="Overdue">Overdue (Missed Date)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Administered at Kendra / PHC batch..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Dose Record</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ImmunizationTracker;
