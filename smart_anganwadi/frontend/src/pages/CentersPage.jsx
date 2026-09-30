import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { centerService, userService } from '../services/api';
import Modal from '../components/Modal';
import {
  Building2,
  Plus,
  Baby,
  HeartHandshake,
  MapPin,
  Phone,
  UserCheck
} from 'lucide-react';

const CentersPage = () => {
  const { user } = useAuth();
  const [centers, setCenters] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    center_name: '',
    center_code: '',
    location: '',
    address: '',
    worker: '',
    supervisor: '',
    contact_number: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cList, wList, sList] = await Promise.all([
        centerService.list(),
        userService.list({ role: 'worker' }),
        userService.list({ role: 'supervisor' })
      ]);
      setCenters(cList);
      setWorkers(wList);
      setSupervisors(sList);
    } catch (err) {
      console.error('Error loading centers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCenter = async (e) => {
    e.preventDefault();
    try {
      await centerService.create(formData);
      setIsModalOpen(false);
      setFormData({
        center_name: '',
        center_code: '',
        location: '',
        address: '',
        worker: '',
        supervisor: '',
        contact_number: ''
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error creating Anganwadi Center.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Anganwadi Centers Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Infrastructure Network • Kendra Details • Assigned Staff & Beneficiary Stats
          </p>
        </div>

        {user?.role === 'admin' && (
          <button 
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                center_code: `AW-${Math.floor(100 + Math.random() * 900)}`
              }));
              setIsModalOpen(true);
            }} 
            className="btn btn-primary"
          >
            <Plus size={18} /> Add New Center
          </button>
        )}
      </div>

      {/* Centers Grid Cards */}
      <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
        {centers.map(c => (
          <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0 }}>
                      {c.center_name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Code: <strong>{c.center_code}</strong>
                    </div>
                  </div>
                </div>

                <span className="badge badge-success">Operational</span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span>{c.address} ({c.location})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={14} color="var(--text-muted)" />
                  <span>Contact: {c.contact_number || 'N/A'}</span>
                </div>
              </div>

              {/* Staff Assignments */}
              <div style={{
                background: 'var(--bg-app)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                fontSize: '0.8rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <span className="text-muted">Assigned Worker:</span>
                  <div style={{ fontWeight: 600 }}>{c.worker_name || 'Unassigned'}</div>
                </div>
                <div>
                  <span className="text-muted">Supervisor:</span>
                  <div style={{ fontWeight: 600 }}>{c.supervisor_name || 'Unassigned'}</div>
                </div>
              </div>
            </div>

            {/* Beneficiary Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.85rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Baby size={16} color="var(--primary)" />
                <span>Children: <strong>{c.total_children || 0}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HeartHandshake size={16} color="var(--secondary)" />
                <span>Pregnant Women: <strong>{c.total_pregnant || 0}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE CENTER MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Anganwadi Center">
        <form onSubmit={handleCreateCenter}>
          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Center Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Navodaya Kendra #45"
                value={formData.center_name}
                onChange={(e) => setFormData({ ...formData, center_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Center Code (Unique)</label>
              <input
                type="text"
                className="form-control"
                value={formData.center_code}
                onChange={(e) => setFormData({ ...formData, center_code: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Location / Ward</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Sector 9, North Zone"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Landline or mobile"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Address</label>
            <textarea
              className="form-control"
              placeholder="Building, street, landmark..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Assign Worker</label>
              <select
                className="form-select"
                value={formData.worker}
                onChange={(e) => setFormData({ ...formData, worker: e.target.value })}
              >
                <option value="">-- Select Worker --</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.first_name} {w.last_name} ({w.username})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assign Supervisor</label>
              <select
                className="form-select"
                value={formData.supervisor}
                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
              >
                <option value="">-- Select Supervisor --</option>
                {supervisors.map(s => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.username})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Anganwadi Center</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CentersPage;
