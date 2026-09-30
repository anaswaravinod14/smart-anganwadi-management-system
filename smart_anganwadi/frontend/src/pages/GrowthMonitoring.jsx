import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { growthService, childService } from '../services/api';
import Modal from '../components/Modal';
import {
  TrendingUp,
  Calculator,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Baby,
  Calendar
} from 'lucide-react';

const GrowthMonitoring = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Interactive Calculator & Form State
  const [calcChildId, setCalcChildId] = useState('');
  const [calcDate, setCalcDate] = useState(new Date().toISOString().split('T')[0]);
  const [calcHeight, setCalcHeight] = useState('');
  const [calcWeight, setCalcWeight] = useState('');
  const [calcBmi, setCalcBmi] = useState('');
  const [calcStatus, setCalcStatus] = useState('Normal');
  const [calcRemarks, setCalcRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [growthList, childList] = await Promise.all([
        growthService.list(),
        childService.list()
      ]);
      setRecords(growthList);
      setChildren(childList);
      if (childList.length > 0) {
        setCalcChildId(childList[0].id);
      }
    } catch (err) {
      console.error('Error loading growth records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (st) => {
    setStatusFilter(st);
    try {
      setLoading(true);
      const params = {};
      if (st) params.growth_status = st;
      const data = await growthService.list(params);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time BMI & Growth status auto calculation
  const handleHeightWeightChange = (hVal, wVal) => {
    setCalcHeight(hVal);
    setCalcWeight(wVal);

    const h = parseFloat(hVal);
    const w = parseFloat(wVal);

    if (h > 0 && w > 0) {
      const h_m = h / 100.0;
      const bmiVal = (w / (h_m * h_m)).toFixed(2);
      setCalcBmi(bmiVal);

      // Pediatric WHO simplified ranges
      const numBmi = parseFloat(bmiVal);
      if (numBmi < 13.5) {
        setCalcStatus('Severely Underweight');
      } else if (numBmi < 15.0) {
        setCalcStatus('Underweight');
      } else if (numBmi > 19.0) {
        setCalcStatus('Overweight');
      } else {
        setCalcStatus('Normal');
      }
    } else {
      setCalcBmi('');
      setCalcStatus('Normal');
    }
  };

  const handleSaveGrowth = async (e) => {
    e.preventDefault();
    if (!calcChildId || !calcHeight || !calcWeight) return;

    setSaving(true);
    setSaveSuccess('');
    try {
      await growthService.create({
        child: calcChildId,
        date: calcDate,
        height: calcHeight,
        weight: calcWeight,
        growth_status: calcStatus,
        remarks: calcRemarks
      });
      setSaveSuccess('Growth measurement recorded successfully!');
      setCalcHeight('');
      setCalcWeight('');
      setCalcBmi('');
      setCalcRemarks('');
      loadData();
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save growth record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Growth & Nutrition Monitoring</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            WHO Growth Standards • BMI Calculation • Early Detection of Malnutrition
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 1.25rem',
          backgroundColor: 'var(--success-bg)',
          color: 'var(--success-text)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={20} />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* 2-Column: Live Interactive Growth Calculator Form + WHO Guidelines Summary */}
      {user?.role !== 'parent' && (
        <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
          {/* Growth Logger Form (2 cols) */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-header">
              <div className="card-title">
                <Calculator size={18} color="var(--primary)" />
                Direct Child Growth Entry & Auto-BMI Calculator
              </div>
            </div>

            <form onSubmit={handleSaveGrowth}>
              <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Select Enrolled Child</label>
                  <select
                    className="form-select"
                    value={calcChildId}
                    onChange={(e) => setCalcChildId(e.target.value)}
                    required
                  >
                    {children.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.child_id}) - {c.gender}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Measurement Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={calcDate}
                    onChange={(e) => setCalcDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="e.g. 96.0"
                    value={calcHeight}
                    onChange={(e) => handleHeightWeightChange(e.target.value, calcWeight)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="e.g. 14.2"
                    value={calcWeight}
                    onChange={(e) => handleHeightWeightChange(calcHeight, e.target.value)}
                    required
                  />
                </div>

                {/* Auto Calculated BMI display */}
                <div style={{
                  background: 'var(--bg-app)',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                  <div className="text-xs text-muted font-semibold">CALCULATED BMI</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1 }}>
                    {calcBmi || '--'}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.2rem' }}>
                    Status: <span className={`badge ${
                      calcStatus === 'Normal' ? 'badge-success' :
                      calcStatus === 'Underweight' ? 'badge-warning' : 'badge-danger'
                    }`}>{calcStatus}</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nutrition Notes / Observations</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Good dietary intake, taking IFA syrup, active..."
                  value={calcRemarks}
                  onChange={(e) => setCalcRemarks(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={saving || !calcHeight || !calcWeight}
              >
                <TrendingUp size={18} /> {saving ? 'Recording...' : 'Save Growth Measurement'}
              </button>
            </form>
          </div>

          {/* WHO Reference Guide Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Baby size={18} color="var(--primary)" />
                WHO Growth Guidelines
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', border: '1px solid #a7f3d0' }}>
                <strong style={{ color: 'var(--success-text)' }}>Normal Range</strong>
                <p className="text-xs" style={{ marginTop: '0.2rem' }}>
                  BMI between 15.0 - 18.5. Child shows regular weight gain and normal motor activity.
                </p>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', border: '1px solid #fde68a' }}>
                <strong style={{ color: 'var(--warning-text)' }}>Moderate Underweight</strong>
                <p className="text-xs" style={{ marginTop: '0.2rem' }}>
                  BMI 13.5 - 15.0. Supplementary nutrition ration to be increased; parent counseling recommended.
                </p>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', border: '1px solid #fecaca' }}>
                <strong style={{ color: 'var(--danger-text)' }}>Severely Underweight (SAM)</strong>
                <p className="text-xs" style={{ marginTop: '0.2rem' }}>
                  BMI below 13.5. Urgent doctor visit, Nutrition Rehabilitation Centre (NRC) referral.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Growth Records Table with Filters */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <TrendingUp size={18} color="var(--primary)" />
            Recorded Growth Measurements ({records.length})
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="">All Growth Categories</option>
              <option value="Normal">Normal</option>
              <option value="Underweight">Underweight</option>
              <option value="Severely Underweight">Severely Underweight</option>
              <option value="Overweight">Overweight</option>
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
                <th>Height</th>
                <th>Weight</th>
                <th>BMI</th>
                <th>Status Classification</th>
                <th>Remarks / Advice</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading growth logs...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No growth records found matching this category.
                  </td>
                </tr>
              ) : (
                records.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.date}</strong></td>
                    <td>
                      <Link to={`/${user?.role || 'worker'}/children/${r.child}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        {r.child_name}
                      </Link>
                    </td>
                    <td><span className="badge badge-neutral">{r.child_id_code}</span></td>
                    <td>{r.height} cm</td>
                    <td>{r.weight} kg</td>
                    <td><strong>{r.bmi}</strong></td>
                    <td>
                      <span className={`badge ${
                        r.growth_status === 'Normal' ? 'badge-success' :
                        r.growth_status === 'Underweight' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {r.growth_status}
                      </span>
                    </td>
                    <td>{r.remarks || 'Standard follow up'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GrowthMonitoring;
