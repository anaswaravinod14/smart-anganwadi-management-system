import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  dashboardService, 
  reportService 
} from '../services/api';
import StatCard from '../components/StatCard';
import AlertBanner from '../components/AlertBanner';
import {
  Baby,
  Building2,
  CalendarCheck,
  TrendingDown,
  HeartHandshake,
  Syringe,
  UtensilsCrossed,
  HeartPulse,
  Download,
  Users,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#3b82f6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, chartsData, alertsData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getCharts(),
        dashboardService.getAlerts()
      ]);
      setStats(statsData);
      setCharts(chartsData);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Admin Analytics & Center Overview...
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Admin Mission Control</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Integrated Child Development Services (ICDS) District Overview
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href={reportService.getExportUrl('children')}
            download="children_report.csv"
            className="btn btn-secondary btn-sm"
          >
            <Download size={16} /> Export Children CSV
          </a>
          <Link to="/admin/centers" className="btn btn-primary btn-sm">
            <Building2 size={16} /> Manage Centers
          </Link>
        </div>
      </div>

      {/* High-Priority Alerts (if any) */}
      {alerts && alerts.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={18} color="var(--danger)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>
              District Real-Time Alerts ({alerts.length})
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {alerts.slice(0, 3).map((alert, idx) => (
              <AlertBanner
                key={idx}
                type={alert.severity}
                title={alert.title}
                message={`${alert.message} [${alert.center}]`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 8 Primary Key Metrics Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Children"
          value={stats?.total_children}
          icon={Baby}
          color="primary"
          badgeText="Active enrolled"
          badgeColor="success"
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
          icon={TrendingDown}
          color="danger"
          badgeText="Needs Nutrition Care"
          badgeColor="danger"
        />
        <StatCard
          title="Pregnant Women"
          value={stats?.total_pregnant_women}
          icon={HeartHandshake}
          color="info"
          subtitle={`High Risk: ${stats?.high_risk_pregnant || 0}`}
        />
        <StatCard
          title="Anganwadi Centers"
          value={stats?.total_centers}
          icon={Building2}
          color="secondary"
          badgeText="All Operational"
          badgeColor="info"
        />
        <StatCard
          title="Upcoming Vaccines"
          value={stats?.upcoming_vaccinations}
          icon={Syringe}
          color="warning"
          subtitle={`Overdue: ${stats?.overdue_vaccinations || 0}`}
        />
        <StatCard
          title="Low Food Stock"
          value={stats?.low_food_stock}
          icon={UtensilsCrossed}
          color="danger"
          badgeText={stats?.low_food_stock > 0 ? "Indent Required" : "Stock Normal"}
          badgeColor={stats?.low_food_stock > 0 ? "danger" : "success"}
        />
        <StatCard
          title="Medical Referrals"
          value={stats?.pending_health_checks}
          icon={HeartPulse}
          color="warning"
          badgeText="Doctor Consult"
          badgeColor="warning"
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        {/* Attendance Trend Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <CalendarCheck size={18} color="var(--primary)" />
              Daily Attendance Trend
            </div>
            <span className="text-muted text-xs">Past 10 Session Days</span>
          </div>
          <div style={{ height: 260 }}>
            {charts?.attendance_trend && charts.attendance_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.attendance_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" fontSize={11} stroke="#64748b" />
                  <YAxis fontSize={11} stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Bar dataKey="present" fill="#0d9488" name="Present" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No attendance trend data</div>
            )}
          </div>
        </div>

        {/* Nutritional & Growth Distribution Pie Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingDown size={18} color="var(--warning)" />
              Nutrition / Growth Classification (WHO / ICDS)
            </div>
          </div>
          <div style={{ height: 260 }}>
            {charts?.growth_distribution && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.growth_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.growth_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Center-Wise Statistics Table & Quick Links */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Building2 size={18} color="var(--secondary)" />
            Anganwadi Center-Wise Operational Comparison
          </div>
          <Link to="/admin/centers" className="btn btn-secondary btn-sm">
            View All Centers <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Center Name</th>
                <th>Enrolled Children</th>
                <th>Present Today</th>
                <th>Registered Pregnant Women</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {charts?.center_stats?.map((cen, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{cen.center_name}</strong>
                  </td>
                  <td>{cen.children}</td>
                  <td>
                    <span className="badge badge-success">{cen.present_today} Present</span>
                  </td>
                  <td>{cen.pregnant}</td>
                  <td>
                    <span className="badge badge-info">Operational</span>
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

export default AdminDashboard;
