import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { childService, attendanceService, centerService } from '../services/api';
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Building2,
  Save,
  Filter,
  Users,
  AlertCircle
} from 'lucide-react';

const AttendancePage = () => {
  const { user } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [children, setChildren] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      setLoading(true);
      const centerList = await centerService.list();
      setCenters(centerList);
      let activeCenterId = '';
      if (user?.center?.id) {
        activeCenterId = user.center.id;
      } else if (centerList.length > 0) {
        activeCenterId = centerList[0].id;
      }
      setSelectedCenter(activeCenterId);
      if (activeCenterId) {
        await loadRegister(activeCenterId, todayStr);
      }
    } catch (err) {
      console.error('Error initializing attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRegister = async (centerId, dateVal) => {
    try {
      setLoading(true);
      setMessage('');
      setError('');
      // 1. Fetch children for the center
      const childList = await childService.list({ center: centerId });
      setChildren(childList);

      // 2. Fetch existing attendance records for this date & center
      const existingRecords = await attendanceService.list({ date: dateVal, center: centerId });
      
      const newAttMap = {};
      const newRemMap = {};

      childList.forEach(c => {
        const found = existingRecords.find(r => r.child === c.id);
        if (found) {
          newAttMap[c.id] = found.status;
          newRemMap[c.id] = found.remarks || '';
        } else {
          // Default to Present for Anganwadi morning roll-call
          newAttMap[c.id] = 'Present';
          newRemMap[c.id] = '';
        }
      });

      setAttendanceMap(newAttMap);
      setRemarksMap(newRemMap);
    } catch (err) {
      console.error('Error loading attendance register:', err);
      setError('Failed to fetch attendance register.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (selectedCenter) {
      loadRegister(selectedCenter, newDate);
    }
  };

  const handleCenterChange = (newCenter) => {
    setSelectedCenter(newCenter);
    loadRegister(newCenter, selectedDate);
  };

  const toggleStatus = (childId) => {
    setAttendanceMap(prev => ({
      ...prev,
      [childId]: prev[childId] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  const setAllStatus = (newStatus) => {
    const updated = {};
    children.forEach(c => {
      updated[c.id] = newStatus;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const records = children.map(c => ({
        child_id: c.id,
        status: attendanceMap[c.id] || 'Present',
        remarks: remarksMap[c.id] || ''
      }));

      await attendanceService.bulkRecord(selectedDate, records);
      setMessage(`Attendance successfully recorded for ${records.length} children on ${selectedDate}!`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to save attendance. Please check network and permissions.');
    } finally {
      setSaving(false);
    }
  };

  const totalCount = children.length;
  const presentCount = Object.values(attendanceMap).filter(s => s === 'Present').length;
  const absentCount = totalCount - presentCount;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Daily Attendance Register</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Roll Call, Supplementary Nutrition Beneficiary Log & Duplicate Prevention
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSaveAttendance}
            className="btn btn-primary btn-lg"
            disabled={saving || children.length === 0}
            style={{ boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)' }}
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Register'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {message && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 1.25rem',
          backgroundColor: 'var(--success-bg)',
          border: '1px solid #a7f3d0',
          color: 'var(--success-text)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={20} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 1.25rem',
          backgroundColor: 'var(--danger-bg)',
          border: '1px solid #fecaca',
          color: 'var(--danger-text)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Date & Center Controls + Bulk Action Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--primary)" />
              <label style={{ fontWeight: 700, fontSize: '0.875rem' }}>Session Date:</label>
              <input
                type="date"
                className="form-control"
                style={{ width: 'auto', fontWeight: 600 }}
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} color="var(--primary)" />
              <label style={{ fontWeight: 700, fontSize: '0.875rem' }}>Anganwadi Center:</label>
              <select
                className="form-select"
                style={{ width: 'auto', fontWeight: 600 }}
                value={selectedCenter}
                onChange={(e) => handleCenterChange(e.target.value)}
              >
                {centers.map(c => (
                  <option key={c.id} value={c.id}>{c.center_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Mark All Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="button" 
              onClick={() => setAllStatus('Present')} 
              className="btn btn-sm btn-secondary"
            >
              <CheckCircle2 size={14} color="var(--success)" /> Mark All Present
            </button>
            <button 
              type="button" 
              onClick={() => setAllStatus('Absent')} 
              className="btn btn-sm btn-secondary"
            >
              <XCircle size={14} color="var(--danger)" /> Mark All Absent
            </button>
          </div>
        </div>

        {/* Live Counters Strip */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.9rem',
          flexWrap: 'wrap'
        }}>
          <div>Total Enrolled: <strong>{totalCount}</strong></div>
          <div style={{ color: 'var(--success-text)' }}>
            Present Today: <strong>{presentCount}</strong>
          </div>
          <div style={{ color: 'var(--danger-text)' }}>
            Absent: <strong>{absentCount}</strong>
          </div>
          <div>
            Attendance Rate: <strong style={{ color: 'var(--primary)' }}>{attendanceRate}%</strong>
          </div>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Roll / ID</th>
                <th>Child Name</th>
                <th>Parent Name & Phone</th>
                <th style={{ textAlign: 'center', width: 220 }}>Status Toggle</th>
                <th>Remarks / Reason if Absent</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading session register...
                  </td>
                </tr>
              ) : children.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No enrolled children found in this Anganwadi center.
                  </td>
                </tr>
              ) : (
                children.map(child => {
                  const isPresent = attendanceMap[child.id] === 'Present';
                  return (
                    <tr key={child.id} style={{ backgroundColor: isPresent ? '#ffffff' : '#fef2f2' }}>
                      <td>
                        <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                          {child.child_id}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.95rem' }}>{child.name}</strong>
                        <div className="text-xs text-muted">Gender: {child.gender}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{child.parent_name}</div>
                        <div className="text-xs text-muted">{child.parent_phone}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <button
                            type="button"
                            onClick={() => setAttendanceMap(prev => ({ ...prev, [child.id]: 'Present' }))}
                            style={{
                              padding: '0.5rem 1.25rem',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              backgroundColor: isPresent ? 'var(--success)' : '#ffffff',
                              color: isPresent ? '#ffffff' : 'var(--text-muted)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            ✓ Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceMap(prev => ({ ...prev, [child.id]: 'Absent' }))}
                            style={{
                              padding: '0.5rem 1.25rem',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              backgroundColor: !isPresent ? 'var(--danger)' : '#ffffff',
                              color: !isPresent ? '#ffffff' : 'var(--text-muted)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            ✗ Absent
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                          placeholder={isPresent ? "Optional notes..." : "e.g. Fever, out of village..."}
                          value={remarksMap[child.id] || ''}
                          onChange={(e) => setRemarksMap({ ...remarksMap, [child.id]: e.target.value })}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
