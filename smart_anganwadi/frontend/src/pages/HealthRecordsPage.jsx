import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { healthService, childService } from '../services/api';
import Modal from '../components/Modal';
import {
  HeartPulse,
  Plus,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Thermometer
} from 'lucide-react';

const HealthRecordsPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [referralFilter, setReferralFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    child: '',
    date: new Date().toISOString().split('T')[0],
    health_issue: '',
    temperature: '98.6',
    symptoms: '',
    treatment: '',
    referral_required: false,
    remarks: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hList, childList] = await Promise.all([
        healthService.list(),
        childService.list()
      ]);
      setRecords(hList);
      setChildren(childList);
      if (childList.length > 0) {
        setFormData(prev => ({ ...prev, child: childList[0].id }));
      }
    } catch (err) {
      console.error('Error fetching health records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (refVal) => {
    setReferralFilter(refVal);
    try {
      setLoading(true);
      const params = {};
      if (refVal !== '') params.referral_required = refVal;
      const data = await healthService.list(params);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await healthService.create(formData);
      setIsModalOpen(false);
      setFormData({
        child: children[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        health_issue: '',
        temperature: '98.6',
        symptoms: '',
        treatment: '',
        referral_required: false,
        remarks: ''
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error saving health record.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Child Health & Clinical Checkups</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Primary Health Surveillance • First Aid & Treatment • Hospital Referral Tracking
          </p>
        </div>

        {user?.role !== 'parent' && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Log Health Check
          </button>
        )}
      </div>

      {/* Health Records Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <HeartPulse size={18} color="var(--primary)" />
            Clinical Records & Diagnoses ({records.length})
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem' }}
              value={referralFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="">All Health Records</option>
              <option value="true">Referral Required (Doctor / CHC)</option>
              <option value="false">Treated Locally</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Child Name</th>
                <th>Child ID</th>
                <th>Diagnosis / Issue</th>
                <th>Temp (°F)</th>
                <th>Symptoms</th>
                <th>Treatment</th>
                <th>Referral Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading clinical records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No health records found matching criteria.
                  </td>
                </tr>
              ) : (
                records.map(rec => (
                  <tr key={rec.id} style={{ backgroundColor: rec.referral_required ? '#fef2f2' : 'inherit' }}>
                    <td><strong>{rec.date}</strong></td>
                    <td>
                      <Link to={`/${user?.role || 'worker'}/children/${rec.child}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        {rec.child_name}
                      </Link>
                    </td>
                    <td><span className="badge badge-neutral">{rec.child_id_code}</span></td>
                    <td><strong>{rec.health_issue}</strong></td>
                    <td>{rec.temperature ? `${rec.temperature}°` : '-'}</td>
                    <td>{rec.symptoms || '-'}</td>
                    <td>{rec.treatment || '-'}</td>
                    <td>
                      {rec.referral_required ? (
                        <span className="badge badge-danger">
                          <AlertTriangle size={12} /> PHC Referral
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Resolved locally
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Health Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Child Health Check">
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

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Checkup Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Health Complaint</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Loose motion, viral fever, skin rashes..."
              value={formData.health_issue}
              onChange={(e) => setFormData({ ...formData, health_issue: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Symptoms & Observations</label>
            <textarea
              className="form-control"
              placeholder="Physical observation details..."
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">First Aid / Treatment Given</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. ORS, Zinc syrup, instructed hydration..."
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="refReqMain"
              checked={formData.referral_required}
              onChange={(e) => setFormData({ ...formData, referral_required: e.target.checked })}
            />
            <label htmlFor="refReqMain" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--danger-text)' }}>
              Doctor Referral Required (Issue PHC slip)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Health Record</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HealthRecordsPage;
