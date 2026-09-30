import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pregnantService, centerService } from '../services/api';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import {
  HeartHandshake,
  Plus,
  Calendar,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Syringe,
  Activity,
  User
} from 'lucide-react';

const PregnantWomenPage = () => {
  const { user } = useAuth();
  const [women, setWomen] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWoman, setSelectedWoman] = useState(null);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);

  // Forms
  const [regForm, setRegForm] = useState({
    name: '',
    age: '24',
    phone: '',
    address: '',
    pregnancy_start_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    anganwadi_center: '',
    risk_status: 'Normal',
    remarks: ''
  });

  const [checkupForm, setCheckupForm] = useState({
    pregnant_woman: '',
    checkup_date: new Date().toISOString().split('T')[0],
    weight: '52.0',
    blood_pressure: '120/80',
    hemoglobin: '11.5',
    health_status: 'Good',
    doctor_advice: '',
    next_checkup_date: ''
  });

  const [maternalVacForm, setMaternalVacForm] = useState({
    pregnant_woman: '',
    vaccine_name: 'Tetanus Toxoid (TT 1)',
    vaccination_date: new Date().toISOString().split('T')[0],
    next_due_date: '',
    status: 'Completed'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [wList, cList] = await Promise.all([
        pregnantService.list(),
        centerService.list()
      ]);
      setWomen(wList);
      setCenters(cList);
      if (cList.length > 0) {
        setRegForm(prev => ({ ...prev, anganwadi_center: cList[0].id }));
      }
    } catch (err) {
      console.error('Error fetching pregnant women:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await pregnantService.create(regForm);
      setIsRegisterModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error registering pregnant woman.');
    }
  };

  const handleAddCheckup = async (e) => {
    e.preventDefault();
    try {
      await pregnantService.addCheckup(checkupForm);
      setIsCheckupModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error saving prenatal checkup.');
    }
  };

  const handleAddVaccine = async (e) => {
    e.preventDefault();
    try {
      await pregnantService.addVaccination(maternalVacForm);
      setIsVaccineModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error recording maternal vaccine.');
    }
  };

  const highRiskCount = women.filter(w => w.risk_status === 'High Risk').length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Maternal & Prenatal Care</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Poshan Abhiyaan • EDD Tracking • Blood Pressure, Hemoglobin & Maternal Immunization
          </p>
        </div>

        {user?.role !== 'parent' && (
          <button onClick={() => setIsRegisterModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Register Pregnant Woman
          </button>
        )}
      </div>

      {highRiskCount > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AlertBanner
            type="danger"
            title={`High-Risk Maternal Alert: ${highRiskCount} Women Monitored`}
            message="High-risk pregnancies require strict blood pressure and hemoglobin monitoring, IFA supplementation, and hospital delivery coordination."
          />
        </div>
      )}

      {/* Pregnant Women Cards / Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <HeartHandshake size={18} color="var(--primary)" />
            Registered Pregnant Beneficiaries ({women.length})
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Mother's Name</th>
                <th>Age</th>
                <th>Contact</th>
                <th>Center</th>
                <th>EDD (Delivery Date)</th>
                <th>Risk Category</th>
                <th>Latest Hb / BP</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading maternal records...
                  </td>
                </tr>
              ) : women.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No pregnant women registered yet.
                  </td>
                </tr>
              ) : (
                women.map(w => {
                  const isHigh = w.risk_status === 'High Risk';
                  const latest = w.latest_health;
                  return (
                    <tr key={w.id} style={{ backgroundColor: isHigh ? '#fff1f2' : 'inherit' }}>
                      <td>
                        <strong style={{ fontSize: '0.95rem' }}>{w.name}</strong>
                        <div className="text-xs text-muted">LMP: {w.pregnancy_start_date}</div>
                      </td>
                      <td>{w.age} yrs</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                          <Phone size={12} /> {w.phone}
                        </div>
                      </td>
                      <td>{w.center_name}</td>
                      <td>
                        <strong>{w.expected_delivery_date}</strong>
                      </td>
                      <td>
                        <span className={`badge ${
                          w.risk_status === 'Normal' ? 'badge-success' :
                          w.risk_status === 'Moderate Risk' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {w.risk_status}
                        </span>
                      </td>
                      <td>
                        {latest ? (
                          <div style={{ fontSize: '0.85rem' }}>
                            <div>Hb: <strong>{latest.hemoglobin} g/dL</strong></div>
                            <div className="text-xs text-muted">BP: {latest.blood_pressure}</div>
                          </div>
                        ) : (
                          <span className="badge badge-neutral">No checkup</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {user?.role !== 'parent' && (
                            <>
                              <button
                                onClick={() => {
                                  setCheckupForm(prev => ({ ...prev, pregnant_woman: w.id }));
                                  setIsCheckupModalOpen(true);
                                }}
                                className="btn btn-secondary btn-sm"
                                title="Log Prenatal Checkup"
                              >
                                <Activity size={14} /> Checkup
                              </button>
                              <button
                                onClick={() => {
                                  setMaternalVacForm(prev => ({ ...prev, pregnant_woman: w.id }));
                                  setIsVaccineModalOpen(true);
                                }}
                                className="btn btn-secondary btn-sm"
                                title="Record TT Vaccine"
                              >
                                <Syringe size={14} /> TT Dose
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REGISTER PREGNANT WOMAN */}
      <Modal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} title="Register Pregnant Woman">
        <form onSubmit={handleRegister}>
          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                className="form-control"
                value={regForm.age}
                onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-control"
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Anganwadi Center</label>
              <select
                className="form-select"
                value={regForm.anganwadi_center}
                onChange={(e) => setRegForm({ ...regForm, anganwadi_center: e.target.value })}
                required
              >
                {centers.map(c => (
                  <option key={c.id} value={c.id}>{c.center_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Pregnancy Start Date (LMP)</label>
              <input
                type="date"
                className="form-control"
                value={regForm.pregnancy_start_date}
                onChange={(e) => {
                  const lmp = new Date(e.target.value);
                  const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  setRegForm({ ...regForm, pregnancy_start_date: e.target.value, expected_delivery_date: edd });
                }}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Delivery Date (EDD)</label>
              <input
                type="date"
                className="form-control"
                value={regForm.expected_delivery_date}
                onChange={(e) => setRegForm({ ...regForm, expected_delivery_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Risk Category</label>
              <select
                className="form-select"
                value={regForm.risk_status}
                onChange={(e) => setRegForm({ ...regForm, risk_status: e.target.value })}
              >
                <option value="Normal">Normal</option>
                <option value="Moderate Risk">Moderate Risk</option>
                <option value="High Risk">High Risk</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                value={regForm.address}
                onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Register Beneficiary</button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: LOG CHECKUP */}
      <Modal isOpen={isCheckupModalOpen} onClose={() => setIsCheckupModalOpen(false)} title="Log Prenatal Health Checkup">
        <form onSubmit={handleAddCheckup}>
          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Checkup Date</label>
              <input
                type="date"
                className="form-control"
                value={checkupForm.checkup_date}
                onChange={(e) => setCheckupForm({ ...checkupForm, checkup_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={checkupForm.weight}
                onChange={(e) => setCheckupForm({ ...checkupForm, weight: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Blood Pressure (BP)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 120/80"
                value={checkupForm.blood_pressure}
                onChange={(e) => setCheckupForm({ ...checkupForm, blood_pressure: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hemoglobin (g/dL)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                placeholder="e.g. 11.5"
                value={checkupForm.hemoglobin}
                onChange={(e) => setCheckupForm({ ...checkupForm, hemoglobin: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Doctor / ANM Advice & Medication</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Continue IFA tablets, Calcium, nutritious diet..."
              value={checkupForm.doctor_advice}
              onChange={(e) => setCheckupForm({ ...checkupForm, doctor_advice: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsCheckupModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Checkup</button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: LOG TT VACCINE */}
      <Modal isOpen={isVaccineModalOpen} onClose={() => setIsVaccineModalOpen(false)} title="Record Maternal TT Vaccine Dose">
        <form onSubmit={handleAddVaccine}>
          <div className="form-group">
            <label className="form-label">Vaccine</label>
            <select
              className="form-select"
              value={maternalVacForm.vaccine_name}
              onChange={(e) => setMaternalVacForm({ ...maternalVacForm, vaccine_name: e.target.value })}
              required
            >
              <option value="Tetanus Toxoid (TT 1)">Tetanus Toxoid (TT 1)</option>
              <option value="Tetanus Toxoid (TT 2)">Tetanus Toxoid (TT 2)</option>
              <option value="Tetanus Toxoid (TT Booster)">Tetanus Toxoid (TT Booster)</option>
            </select>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Vaccination Date</label>
              <input
                type="date"
                className="form-control"
                value={maternalVacForm.vaccination_date}
                onChange={(e) => setMaternalVacForm({ ...maternalVacForm, vaccination_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Next Due Date</label>
              <input
                type="date"
                className="form-control"
                value={maternalVacForm.next_due_date}
                onChange={(e) => setMaternalVacForm({ ...maternalVacForm, next_due_date: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsVaccineModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Vaccine Record</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PregnantWomenPage;
