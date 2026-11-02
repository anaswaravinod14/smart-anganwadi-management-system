import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Baby, 
  CalendarCheck, 
  Sparkles, 
  BookOpen, 
  Award, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Users,
  GraduationCap
} from 'lucide-react';
import api from '../services/api';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      const [statsRes, actRes, childRes] = await Promise.all([
        api.get('/dashboard/stats/'),
        api.get('/learning-activities/'),
        api.get('/children/')
      ]);
      setStats(statsRes.data);
      setActivities(actRes.data.results || actRes.data || []);
      setChildren(childRes.data.results || childRes.data || []);
    } catch (err) {
      console.error('Error loading teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const centerName = user?.center?.name || 'Asha Kiran Anganwadi Kendra #12';
  const totalKids = stats?.total_children || children.length || 0;
  const presentKids = stats?.present_today || 0;
  const attendanceRate = totalKids > 0 ? Math.round((presentKids / totalKids) * 100) : 0;

  return (
    <div>
      {/* Teacher Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        color: '#ffffff',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <GraduationCap size={14} /> Early Childhood Care & Education (ECCE)
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Welcome back, Teacher {user?.first_name || user?.username}!
            </h1>
            <p style={{ opacity: 0.9, marginTop: '0.35rem', fontSize: '0.95rem' }}>
              Assigned Center: <strong>{centerName}</strong> • Today: {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/teacher/attendance" className="btn" style={{ background: '#ffffff', color: '#4f46e5', fontWeight: 700 }}>
              <CalendarCheck size={16} /> Mark Roll Call
            </Link>
            <Link to="/teacher/activities" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 600 }}>
              <Sparkles size={16} /> Early Learning Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-4" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card stat-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Preschool Roster
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {loading ? '...' : totalKids}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Children enrolled in Kendra
              </div>
            </div>
            <div style={{ background: '#e0e7ff', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <Baby size={24} color="#4f46e5" />
            </div>
          </div>
        </div>

        <div className="card stat-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Today's Attendance
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--success)' }}>
                {loading ? '...' : `${presentKids} / ${totalKids}`}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {attendanceRate}% Present today
              </div>
            </div>
            <div style={{ background: '#dcfce7', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <CalendarCheck size={24} color="#16a34a" />
            </div>
          </div>
        </div>

        <div className="card stat-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                ECCE Activities
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: '#8b5cf6' }}>
                {loading ? '...' : activities.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Active learning modules
              </div>
            </div>
            <div style={{ background: '#f3e8ff', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <Sparkles size={24} color="#8b5cf6" />
            </div>
          </div>
        </div>

        <div className="card stat-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Classroom Progress
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: '#f59e0b' }}>
                100%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                All children evaluated
              </div>
            </div>
            <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <Award size={24} color="#d97706" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Classroom Grid */}
      <div className="grid grid-cols-3" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left 2 Cols: Early Learning Modules */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} color="#6366f1" /> Classroom Early Learning & Play (ECCE)
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.2rem' }}>
                  Daily rhymes, sensory exploration, number games, and gross motor skills
                </p>
              </div>
              <Link to="/teacher/activities" className="btn btn-secondary btn-sm">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Loading classroom activities...
              </div>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No activities planned yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activities.slice(0, 4).map((act) => (
                  <div
                    key={act.id}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-app)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-info">{act.category || 'Preschool Play'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Age: {act.target_age_group || '3-6 Years'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {act.description || 'Interactive cognitive session with rhymes and hand gestures.'}
                      </div>
                    </div>

                    <Link to="/teacher/activities" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                      Conduct Activity
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Classroom Actions & Roll Call Ring */}
        <div>
          <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="#4f46e5" /> Quick Teacher Actions
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Link
                to="/teacher/attendance"
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
              >
                <CalendarCheck size={18} color="#16a34a" />
                <div style={{ textAlign: 'left', marginLeft: '0.5rem' }}>
                  <div style={{ fontWeight: 700 }}>Record Daily Attendance</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick 1-click morning roll call</div>
                </div>
              </Link>

              <Link
                to="/teacher/activities"
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
              >
                <Sparkles size={18} color="#8b5cf6" />
                <div style={{ textAlign: 'left', marginLeft: '0.5rem' }}>
                  <div style={{ fontWeight: 700 }}>ECCE Lesson Tracker</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Log child responses & participation</div>
                </div>
              </Link>

              <Link
                to="/teacher/children"
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
              >
                <Users size={18} color="#0d9488" />
                <div style={{ textAlign: 'left', marginLeft: '0.5rem' }}>
                  <div style={{ fontWeight: 700 }}>Preschool Roster</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Child background & parent details</div>
                </div>
              </Link>

              <Link
                to="/teacher/growth"
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
              >
                <Award size={18} color="#f59e0b" />
                <div style={{ textAlign: 'left', marginLeft: '0.5rem' }}>
                  <div style={{ fontWeight: 700 }}>Milestone Tracker</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Growth & development metrics</div>
                </div>
              </Link>
            </div>

            {/* Attendance Progress Box */}
            <div style={{
              background: 'var(--bg-app)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Daily Presence Rate</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{attendanceRate}%</span>
              </div>
              <div style={{
                height: 8,
                background: '#e2e8f0',
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${attendanceRate}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  borderRadius: 4,
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={12} color="#16a34a" /> {presentKids} present of {totalKids} registered
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Preschool Classroom Roster Preview */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Baby size={20} color="#0d9488" /> Classroom Students Roster
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.2rem' }}>
              Preschoolers enrolled in your Anganwadi learning group
            </p>
          </div>
          <Link to="/teacher/children" className="btn btn-primary btn-sm">
            View All Children <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Child Name</th>
                <th>Gender</th>
                <th>Age / DOB</th>
                <th>Parent Name</th>
                <th>Parent Phone</th>
                <th>Status</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading students roster...
                  </td>
                </tr>
              ) : children.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No students currently registered.
                  </td>
                </tr>
              ) : (
                children.slice(0, 6).map((c) => (
                  <tr key={c.id}>
                    <td><span className="badge badge-neutral">{c.child_id}</span></td>
                    <td><strong>{c.name}</strong></td>
                    <td>
                      <span className={`badge ${c.gender === 'Male' ? 'badge-info' : 'badge-warning'}`}>
                        {c.gender}
                      </span>
                    </td>
                    <td>{c.date_of_birth}</td>
                    <td>{c.parent_name}</td>
                    <td>{c.parent_phone}</td>
                    <td>
                      <span className="badge badge-success">Enrolled</span>
                    </td>
                    <td>
                      <Link to={`/teacher/children/${c.id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.6rem' }}>
                        View
                      </Link>
                    </td>
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

export default TeacherDashboard;
