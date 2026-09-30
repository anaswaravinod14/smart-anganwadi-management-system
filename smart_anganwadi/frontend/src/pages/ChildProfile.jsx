import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  childService, 
  growthService, 
  immunizationService, 
  healthService,
  activityService
} from '../services/api';
import GrowthChart from '../components/GrowthChart';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import {
  Baby,
  Calendar,
  Phone,
  Building2,
  TrendingUp,
  Syringe,
  HeartPulse,
  Sparkles,
  ArrowLeft,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';

const ChildProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Growth modal state
  const [isGrowthModalOpen, setIsGrowthModalOpen] = useState(false);
  const [growthForm, setGrowthForm] = useState({
    date: new Date().toISOString().split('T')[0],
    height: '',
    weight: '',
    growth_status: 'Normal',
    remarks: ''
  });

  // Vaccine modal state
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [vaccineForm, setVaccineForm] = useState({
    vaccine_name: 'Measles-Rubella (MR) 1',
    vaccine_date: new Date().toISOString().split('T')[0],
    next_due_date: '',
    status: 'Completed',
    remarks: ''
  });

  // Health modal state
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [healthForm, setHealthForm] = useState({
    date: new Date().toISOString().split('T')[0],
    health_issue: '',
    temperature: '98.6',
    symptoms: '',
    treatment: '',
    referral_required: false,
    remarks: ''
  });

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await childService.getFullProfile(id);
      setProfile(data);
    } catch (err) {
      console.error('Error fetching child full profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrowth = async (e) => {
    e.preventDefault();
    try {
      await growthService.create({
        child: id,
        ...growthForm
      });
      setIsGrowthModalOpen(false);
      setGrowthForm({
        date: new Date().toISOString().split('T')[0],
        height: '',
        weight: '',
        growth_status: 'Normal',
        remarks: ''
      });
      loadProfile();
    } catch (err) {
      console.error(err);
      alert('Error recording growth.');
    }
  };

  const handleAddVaccine = async (e) => {
    e.preventDefault();
    try {
      await immunizationService.create({
        child: id,
        ...vaccineForm
      });
      setIsVaccineModalOpen(false);
      loadProfile();
    } catch (err) {
      console.error(err);
      alert('Error saving immunization.');
    }
  };

  const handleAddHealth = async (e) => {
    e.preventDefault();
    try {
      await healthService.create({
        child: id,
        ...healthForm
      });
      setIsHealthModalOpen(false);
      loadProfile();
    } catch (err) {
      console.error(err);
      alert('Error saving health record.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Child Health & Development Records...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h3>Child record not found.</h3>
        <Link to={`/${user?.role || 'worker'}/children`} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Registry
        </Link>
      </div>
    );
  }

  const latestGrowth = profile.latest_growth;
  const isAtRisk = latestGrowth && (latestGrowth.growth_status === 'Underweight' || latestGrowth.growth_status === 'Severely Underweight');

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: '1rem' }}>
        <Link 
          to={`/${user?.role || 'worker'}/children`} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Back to Children Registry
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem', background: '#ffffff', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: profile.gender === 'Female' ? '#fce7f3' : '#e0e7ff',
            color: profile.gender === 'Female' ? '#db2777' : '#4338ca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '2rem',
            border: '3px solid #ffffff',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}>
            {profile.name.charAt(0)}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.65rem', margin: 0, color: 'var(--text-main)' }}>
                {profile.name}
              </h1>
              <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                {profile.child_id}
              </span>
              <span className={`badge ${profile.gender === 'Female' ? 'badge-warning' : 'badge-info'}`}>
                {profile.gender}
              </span>
              <span className={`badge ${
                latestGrowth?.growth_status === 'Normal' ? 'badge-success' :
                latestGrowth?.growth_status === 'Underweight' ? 'badge-warning' : 'badge-danger'
              }`}>
                {latestGrowth?.growth_status || 'Normal'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={15} /> DOB: <strong>{profile.date_of_birth}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={15} /> Kendra: <strong>{profile.center_name}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={15} /> Parent: <strong>{profile.parent_name}</strong> ({profile.parent_phone})
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Attendance Rate</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
              {profile.attendance_stats?.percentage || 0}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {profile.attendance_stats?.present || 0} / {profile.attendance_stats?.total || 0} sessions
            </div>
          </div>
        </div>

        {/* Nutritional Warning Banner if At Risk */}
        {isAtRisk && (
          <div style={{ marginTop: '1.25rem' }}>
            <AlertBanner
              type="danger"
              title={`Nutritional Alert: ${latestGrowth.growth_status}`}
              message={`${profile.name}'s latest recorded BMI is ${latestGrowth.bmi} (${latestGrowth.weight}kg at ${latestGrowth.height}cm). Supplementary nutritional feed and regular weight monitoring advised.`}
            />
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Baby size={18} /> Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'growth' ? 'active' : ''}`}
          onClick={() => setActiveTab('growth')}
        >
          <TrendingUp size={18} /> Growth Trajectory ({profile.growth_history?.length || 0})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vaccines' ? 'active' : ''}`}
          onClick={() => setActiveTab('vaccines')}
        >
          <Syringe size={18} /> Immunizations ({profile.immunizations?.length || 0})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          <HeartPulse size={18} /> Health Logs ({profile.health_records?.length || 0})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          <Sparkles size={18} /> Early Education ({profile.activities?.length || 0})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3">
          {/* Quick Metrics */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-header">
              <div className="card-title">
                <TrendingUp size={18} color="var(--primary)" />
                Latest Growth & Physical Milestones
              </div>
              {user?.role !== 'parent' && (
                <button onClick={() => setIsGrowthModalOpen(true)} className="btn btn-primary btn-sm">
                  <Plus size={14} /> Record Weight & Height
                </button>
              )}
            </div>

            <div className="grid grid-cols-3" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div className="text-xs text-muted">WEIGHT</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {latestGrowth?.weight || '-'} kg
                </div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div className="text-xs text-muted">HEIGHT</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>
                  {latestGrowth?.height || '-'} cm
                </div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div className="text-xs text-muted">BMI (Body Mass Index)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {latestGrowth?.bmi || '-'}
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Growth Trajectory Preview</h4>
              <GrowthChart data={profile.growth_history || []} height={200} />
            </div>
          </div>

          {/* Child & Parent Details Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Baby size={18} color="var(--primary)" />
                Enrollment Details
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div>
                <span className="text-muted">Parent / Guardian:</span>
                <div style={{ fontWeight: 600 }}>{profile.parent_name}</div>
              </div>
              <div>
                <span className="text-muted">Contact Phone:</span>
                <div style={{ fontWeight: 600 }}>{profile.parent_phone}</div>
              </div>
              <div>
                <span className="text-muted">Admission Date:</span>
                <div style={{ fontWeight: 600 }}>{profile.admission_date}</div>
              </div>
              <div>
                <span className="text-muted">Center Location:</span>
                <div style={{ fontWeight: 600 }}>{profile.center_name}</div>
              </div>
              <div>
                <span className="text-muted">Residential Address:</span>
                <div style={{ fontWeight: 600 }}>{profile.address || 'Local ward area'}</div>
              </div>
              <div>
                <span className="text-muted">Status:</span>
                <div>
                  <span className={`badge ${profile.active ? 'badge-success' : 'badge-danger'}`}>
                    {profile.active ? 'Active Enrolled' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GROWTH TRAJECTORY */}
      {activeTab === 'growth' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={18} color="var(--primary)" />
              Longitudinal Growth Chart & Historical Log
            </div>
            {user?.role !== 'parent' && (
              <button onClick={() => setIsGrowthModalOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={14} /> Add Growth Record
              </button>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <GrowthChart data={profile.growth_history || []} height={300} />
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Height (cm)</th>
                  <th>Weight (kg)</th>
                  <th>BMI</th>
                  <th>Status</th>
                  <th>Remarks / Guidance</th>
                </tr>
              </thead>
              <tbody>
                {profile.growth_history?.map(g => (
                  <tr key={g.id}>
                    <td><strong>{g.date}</strong></td>
                    <td>{g.height} cm</td>
                    <td>{g.weight} kg</td>
                    <td>{g.bmi}</td>
                    <td>
                      <span className={`badge ${
                        g.growth_status === 'Normal' ? 'badge-success' :
                        g.growth_status === 'Underweight' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {g.growth_status}
                      </span>
                    </td>
                    <td>{g.remarks || 'Normal development'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: IMMUNIZATION */}
      {activeTab === 'vaccines' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Syringe size={18} color="var(--primary)" />
              Immunization Schedule (Universal Immunization Programme)
            </div>
            {user?.role !== 'parent' && (
              <button onClick={() => setIsVaccineModalOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={14} /> Record Vaccine
              </button>
            )}
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Vaccine Name</th>
                  <th>Administered Date</th>
                  <th>Next Due Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {profile.immunizations?.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.vaccine_name}</strong></td>
                    <td>{v.vaccine_date || 'Pending'}</td>
                    <td>{v.next_due_date || '-'}</td>
                    <td>
                      <span className={`badge ${
                        v.status === 'Completed' ? 'badge-success' :
                        v.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td>{v.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: HEALTH LOGS */}
      {activeTab === 'health' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <HeartPulse size={18} color="var(--primary)" />
              Clinical & General Health Records
            </div>
            {user?.role !== 'parent' && (
              <button onClick={() => setIsHealthModalOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={14} /> Log Health Check
              </button>
            )}
          </div>

          {profile.health_records?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No illness or clinical checkups logged yet. Child is in good health!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Checkup Date</th>
                    <th>Issue / Diagnosis</th>
                    <th>Temperature</th>
                    <th>Symptoms</th>
                    <th>Treatment Provided</th>
                    <th>Doctor Referral</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.health_records?.map(h => (
                    <tr key={h.id}>
                      <td><strong>{h.date}</strong></td>
                      <td><strong>{h.health_issue}</strong></td>
                      <td>{h.temperature ? `${h.temperature}°` : '-'}</td>
                      <td>{h.symptoms || '-'}</td>
                      <td>{h.treatment || '-'}</td>
                      <td>
                        {h.referral_required ? (
                          <span className="badge badge-danger">Referral Needed</span>
                        ) : (
                          <span className="badge badge-success">Resolved locally</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: LEARNING ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Sparkles size={18} color="var(--primary)" />
              Early Childhood Care & Education (ECCE) Participation
            </div>
          </div>

          {profile.activities?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No activities evaluated yet for this child.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Activity Title</th>
                    <th>Type</th>
                    <th>Child Performance</th>
                    <th>Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.activities?.map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.date}</strong></td>
                      <td><strong>{a.activity_title}</strong></td>
                      <td><span className="badge badge-neutral">{a.activity_type}</span></td>
                      <td>
                        <span className={`badge ${
                          a.performance === 'Excellent' ? 'badge-success' :
                          a.performance === 'Good' ? 'badge-info' : 'badge-warning'
                        }`}>
                          {a.performance}
                        </span>
                      </td>
                      <td>{a.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD GROWTH */}
      <Modal isOpen={isGrowthModalOpen} onClose={() => setIsGrowthModalOpen(false)} title="Log Growth Measurement">
        <form onSubmit={handleAddGrowth}>
          <div className="form-group">
            <label className="form-label">Measurement Date</label>
            <input
              type="date"
              className="form-control"
              value={growthForm.date}
              onChange={(e) => setGrowthForm({ ...growthForm, date: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Height (in cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                placeholder="e.g. 95.5"
                value={growthForm.height}
                onChange={(e) => setGrowthForm({ ...growthForm, height: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (in kg)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                placeholder="e.g. 14.5"
                value={growthForm.weight}
                onChange={(e) => setGrowthForm({ ...growthForm, weight: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Remarks / Feeding Advice</label>
            <textarea
              className="form-control"
              placeholder="e.g. Active in play, recommended high protein snack..."
              value={growthForm.remarks}
              onChange={(e) => setGrowthForm({ ...growthForm, remarks: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsGrowthModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Growth Record</button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD VACCINE */}
      <Modal isOpen={isVaccineModalOpen} onClose={() => setIsVaccineModalOpen(false)} title="Record Child Vaccine Dose">
        <form onSubmit={handleAddVaccine}>
          <div className="form-group">
            <label className="form-label">Vaccine Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. DPT Booster 1, OPV 3, Vitamin A..."
              value={vaccineForm.vaccine_name}
              onChange={(e) => setVaccineForm({ ...vaccineForm, vaccine_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Administered Date</label>
              <input
                type="date"
                className="form-control"
                value={vaccineForm.vaccine_date}
                onChange={(e) => setVaccineForm({ ...vaccineForm, vaccine_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Next Due Date (if any)</label>
              <input
                type="date"
                className="form-control"
                value={vaccineForm.next_due_date}
                onChange={(e) => setVaccineForm({ ...vaccineForm, next_due_date: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={vaccineForm.status}
              onChange={(e) => setVaccineForm({ ...vaccineForm, status: e.target.value })}
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsVaccineModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Vaccine Record</button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: LOG HEALTH */}
      <Modal isOpen={isHealthModalOpen} onClose={() => setIsHealthModalOpen(false)} title="Log Clinical Health Check">
        <form onSubmit={handleAddHealth}>
          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Checkup Date</label>
              <input
                type="date"
                className="form-control"
                value={healthForm.date}
                onChange={(e) => setHealthForm({ ...healthForm, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={healthForm.temperature}
                onChange={(e) => setHealthForm({ ...healthForm, temperature: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Primary Health Issue / Complaint</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Mild Cough, Scabies, Diarrhea, Fever..."
              value={healthForm.health_issue}
              onChange={(e) => setHealthForm({ ...healthForm, health_issue: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Symptoms & Observations</label>
            <textarea
              className="form-control"
              placeholder="Describe physical signs..."
              value={healthForm.symptoms}
              onChange={(e) => setHealthForm({ ...healthForm, symptoms: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Treatment Provided</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. ORS packets, Paracetamol syrup, advised rest..."
              value={healthForm.treatment}
              onChange={(e) => setHealthForm({ ...healthForm, treatment: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="refReq"
              checked={healthForm.referral_required}
              onChange={(e) => setHealthForm({ ...healthForm, referral_required: e.target.checked })}
            />
            <label htmlFor="refReq" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--danger-text)' }}>
              Doctor Referral Required (Refer to Primary Health Centre)
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsHealthModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Health Record</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChildProfile;
