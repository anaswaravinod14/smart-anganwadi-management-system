import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService, childService, foodService, notificationService } from '../services/api';
import StatCard from '../components/StatCard';
import GrowthChart from '../components/GrowthChart';
import {
  Baby,
  CalendarCheck,
  TrendingUp,
  Syringe,
  UtensilsCrossed,
  Sparkles,
  Heart,
  Bell,
  CheckCircle2,
  Calendar,
  Building2
} from 'lucide-react';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [parentStats, setParentStats] = useState(null);
  const [childProfile, setChildProfile] = useState(null);
  const [todayMenu, setTodayMenu] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParentData();
  }, []);

  const loadParentData = async () => {
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];

      const [statsData, notifsData, menuData] = await Promise.all([
        dashboardService.getStats(),
        notificationService.list(),
        foodService.getMenu({ date: todayStr })
      ]);

      setParentStats(statsData);
      setNotifications(notifsData);
      if (menuData && menuData.length > 0) {
        setTodayMenu(menuData[0]);
      }

      // If user has linked child, fetch detailed profile
      if (user?.linked_child?.id) {
        const fullProf = await childService.getFullProfile(user.linked_child.id);
        setChildProfile(fullProf);
      }
    } catch (err) {
      console.error('Error loading parent dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading your child's health & Anganwadi records...
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0369a1 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#ffffff',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '2rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
          }}>
            {parentStats?.child_name ? parentStats.child_name.charAt(0) : 'C'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ color: '#ffffff', fontSize: '1.75rem', margin: 0 }}>
                {parentStats?.child_name || user?.linked_child?.name || "Child Profile"}
              </h1>
              <span className="badge badge-success" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                ID: {parentStats?.child_id || "CHD-101"}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.6rem', fontSize: '0.875rem', opacity: 0.95, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={16} /> {parentStats?.center_name || "Asha Kiran Anganwadi Kendra"}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={16} /> DOB: {parentStats?.date_of_birth || "2023-05-27"}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Heart size={16} /> Status: {parentStats?.growth_status || "Normal"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Attendance Rate"
          value={`${parentStats?.attendance_rate || 0}%`}
          icon={CalendarCheck}
          color="success"
          subtitle={`${parentStats?.present_days || 0} / ${parentStats?.total_attendance_days || 0} sessions`}
        />
        <StatCard
          title="Latest Weight"
          value={`${parentStats?.latest_weight || '-'} kg`}
          icon={TrendingUp}
          color="primary"
          badgeText={parentStats?.growth_status || "Normal"}
          badgeColor="success"
        />
        <StatCard
          title="Latest Height"
          value={`${parentStats?.latest_height || '-'} cm`}
          icon={TrendingUp}
          color="secondary"
          subtitle={`BMI: ${parentStats?.latest_bmi || '-'}`}
        />
        <StatCard
          title="Pending Vaccines"
          value={parentStats?.pending_vaccines || 0}
          icon={Syringe}
          color="warning"
          badgeText={parentStats?.pending_vaccines > 0 ? "Upcoming Due" : "All Complete"}
          badgeColor={parentStats?.pending_vaccines > 0 ? "warning" : "success"}
        />
      </div>

      {/* 2-Column: Growth Trajectory & Today's Meals */}
      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        {/* Growth Trajectory Chart (2 cols) */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <TrendingUp size={18} color="var(--primary)" />
                Child Growth Milestones (Height & Weight)
              </div>
              <span className="badge badge-success">Healthy Development</span>
            </div>
            <div>
              <GrowthChart data={childProfile?.growth_history || []} height={260} />
            </div>
          </div>
        </div>

        {/* Today's Meal Menu */}
        <div>
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <div className="card-title">
                <UtensilsCrossed size={18} color="var(--primary)" />
                Today's Center Meal
              </div>
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
                  <span className="badge badge-success" style={{ marginBottom: '0.4rem' }}>Nutrition Plan</span>
                  <h4 style={{ margin: '0.25rem 0', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    {todayMenu.meal_name}
                  </h4>
                  <div className="text-xs text-muted">
                    Portion: <strong>{todayMenu.quantity}</strong>
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <div className="text-xs font-semibold text-muted">INGREDIENTS</div>
                  <div className="text-sm" style={{ marginTop: '0.2rem' }}>{todayMenu.ingredients}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted">NUTRITIONAL BENEFIT</div>
                  <div className="text-sm" style={{ marginTop: '0.2rem' }}>{todayMenu.nutrition_details}</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                <UtensilsCrossed size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p className="text-sm">Regular supplementary nutrition served today.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column: Immunization Schedule & Notifications */}
      <div className="grid grid-cols-2">
        {/* Immunization History */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Syringe size={18} color="var(--primary)" />
              Vaccine Records & Upcoming Doses
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Vaccine</th>
                  <th>Date / Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {childProfile?.immunizations?.slice(0, 5).map(imm => (
                  <tr key={imm.id}>
                    <td><strong>{imm.vaccine_name}</strong></td>
                    <td>{imm.vaccine_date || imm.next_due_date || 'Scheduled'}</td>
                    <td>
                      <span className={`badge ${
                        imm.status === 'Completed' ? 'badge-success' :
                        imm.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {imm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications & Kendra Notices */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Bell size={18} color="var(--primary)" />
              Notifications & Anganwadi Notices
            </div>
          </div>

          <div>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No notifications right now. Everything is up to date!
              </div>
            ) : (
              notifications.slice(0, 4).map(n => (
                <div 
                  key={n.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: n.is_read ? 'var(--bg-app)' : 'var(--primary-light)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{n.title}</strong>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{n.notification_type}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-body)', marginTop: '0.25rem' }}>
                    {n.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
