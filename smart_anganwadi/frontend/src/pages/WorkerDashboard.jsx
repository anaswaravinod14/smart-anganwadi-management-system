import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  dashboardService, 
  foodService, 
  childService 
} from '../services/api';
import StatCard from '../components/StatCard';
import AlertBanner from '../components/AlertBanner';
import {
  Baby,
  CalendarCheck,
  TrendingUp,
  Syringe,
  HeartPulse,
  HeartHandshake,
  UtensilsCrossed,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  CheckCircle2
} from 'lucide-react';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [todayMenu, setTodayMenu] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkerData();
  }, []);

  const loadWorkerData = async () => {
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];

      const [statsData, alertsData, menuData, childrenData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getAlerts(),
        foodService.getMenu({ date: todayStr }),
        childService.list()
      ]);

      setStats(statsData);
      setAlerts(alertsData);
      if (menuData && menuData.length > 0) {
        setTodayMenu(menuData[0]);
      }
      setChildren(childrenData);
    } catch (err) {
      console.error('Error loading worker dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Kendra Dashboard & Attendance Register...
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        marginBottom: '1.75rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.9 }}>
            Anganwadi Worker Portal • {user?.center?.name || "Kendra #12"}
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '1.65rem', margin: '0.35rem 0 0.25rem' }}>
            Namaste, {user?.full_name || user?.username}!
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
            Daily session is active. Attendance, hot-cooked meal, and child monitoring pending review.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/worker/attendance" className="btn btn-secondary btn-sm" style={{ fontWeight: 700 }}>
            <CalendarCheck size={16} /> Mark Today's Attendance
          </Link>
          <Link to="/worker/children" className="btn btn-outline-primary btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            <PlusCircle size={16} /> Register Child
          </Link>
        </div>
      </div>

      {/* Immediate Attention Alerts */}
      {alerts && alerts.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={18} color="var(--danger)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>
              Action Required for Assigned Kendra ({alerts.length})
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {alerts.slice(0, 3).map((a, idx) => (
              <AlertBanner
                key={idx}
                type={a.severity}
                title={a.title}
                message={a.message}
                actionText="View"
                onAction={() => {
                  if (a.child_id) navigate(`/worker/children/${a.child_id}`);
                  else if (a.woman_id) navigate('/worker/pregnant-women');
                  else if (a.stock_id) navigate('/worker/food');
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '1.75rem' }}>
        <StatCard
          title="Center Children"
          value={stats?.total_children}
          icon={Baby}
          color="primary"
          badgeText="Active"
        />
        <StatCard
          title="Present Today"
          value={stats?.present_today}
          icon={CalendarCheck}
          color="success"
          subtitle={`Absent: ${stats?.absent_today || 0}`}
        />
        <StatCard
          title="At-Risk Children"
          value={stats?.at_risk_children}
          icon={TrendingUp}
          color="danger"
          badgeText="Priority Care"
          badgeColor="danger"
        />
        <StatCard
          title="Vaccines Due (14d)"
          value={stats?.upcoming_vaccinations}
          icon={Syringe}
          color="warning"
          subtitle={`Overdue: ${stats?.overdue_vaccinations || 0}`}
        />
      </div>

      {/* 2-Column: Quick Action Links & Today's Nutrition Menu */}
      <div className="grid grid-cols-3" style={{ marginBottom: '1.75rem' }}>
        {/* Left Column: Quick Action Cards (span 2) */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Sparkles size={18} color="var(--primary)" />
                Kendra Daily Operations
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <Link
                to="/worker/attendance"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s',
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--success-bg)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CalendarCheck size={22} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>Daily Attendance</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Mark present/absent with 1-click bulk save
                  </span>
                </div>
              </Link>

              <Link
                to="/worker/growth"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s',
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TrendingUp size={22} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>Growth & BMI</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Log height/weight with auto BMI calculation
                  </span>
                </div>
              </Link>

              <Link
                to="/worker/immunizations"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--warning-bg)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Syringe size={22} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>Vaccine Tracker</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Administer doses & track upcoming immunizations
                  </span>
                </div>
              </Link>

              <Link
                to="/worker/pregnant-women"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--info-bg)',
                  color: 'var(--info)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <HeartHandshake size={22} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>Maternal Care</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Log prenatal checkups, BP, Hb, and TT doses
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Food Menu Card */}
        <div>
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <div className="card-title">
                <UtensilsCrossed size={18} color="var(--primary)" />
                Today's Nutrition Menu
              </div>
              <Link to="/worker/food" className="text-sm font-semibold" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                Stock & Menu
              </Link>
            </div>

            {todayMenu ? (
              <div>
                <div style={{
                  background: 'var(--primary-light)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  border: '1px solid var(--primary-border)'
                }}>
                  <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Today's Meal</span>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: '0.25rem 0' }}>
                    {todayMenu.meal_name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Portion: <strong>{todayMenu.quantity}</strong>
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <div className="text-xs font-semibold text-muted">INGREDIENTS</div>
                  <div className="text-sm" style={{ marginTop: '0.25rem' }}>{todayMenu.ingredients}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted">NUTRITION VALUE</div>
                  <div className="text-sm" style={{ marginTop: '0.25rem' }}>{todayMenu.nutrition_details}</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                <UtensilsCrossed size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p className="text-sm">No specific menu registered for today.</p>
                <Link to="/worker/food" className="btn btn-outline-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                  Add Meal Menu
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children Directory Preview */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Baby size={18} color="var(--primary)" />
            Enrolled Children in Kendra ({children.length})
          </div>
          <Link to="/worker/children" className="btn btn-secondary btn-sm">
            View All Children <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Child ID</th>
                <th>Name</th>
                <th>Gender / Age</th>
                <th>Parent Name & Phone</th>
                <th>Growth Status</th>
                <th>Attendance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {children.slice(0, 5).map(c => (
                <tr key={c.id}>
                  <td><strong>{c.child_id}</strong></td>
                  <td>
                    <Link to={`/worker/children/${c.id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                      {c.name}
                    </Link>
                  </td>
                  <td>{c.gender}</td>
                  <td>
                    <div>{c.parent_name}</div>
                    <div className="text-xs text-muted">{c.parent_phone}</div>
                  </td>
                  <td>
                    {c.latest_growth ? (
                      <span className={`badge ${
                        c.latest_growth.growth_status === 'Normal' ? 'badge-success' :
                        c.latest_growth.growth_status === 'Underweight' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {c.latest_growth.growth_status}
                      </span>
                    ) : (
                      <span className="badge badge-neutral">No log</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {c.attendance_stats?.percentage || 0}% ({c.attendance_stats?.present || 0}/{c.attendance_stats?.total || 0})
                    </span>
                  </td>
                  <td>
                    <Link to={`/worker/children/${c.id}`} className="btn btn-secondary btn-sm">
                      Full Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
