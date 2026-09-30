import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, centerService, reportService } from '../services/api';
import StatCard from '../components/StatCard';
import AlertBanner from '../components/AlertBanner';
import {
  Building2,
  Baby,
  CalendarCheck,
  TrendingDown,
  HeartHandshake,
  Syringe,
  UtensilsCrossed,
  Download,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

const SupervisorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupervisorData();
  }, []);

  const loadSupervisorData = async () => {
    try {
      setLoading(true);
      const [statsData, chartsData, alertsData, centersData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getCharts(),
        dashboardService.getAlerts(),
        centerService.list()
      ]);
      setStats(statsData);
      setCharts(chartsData);
      setAlerts(alertsData);
      setCenters(centersData);
    } catch (err) {
      console.error('Error loading supervisor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Multi-Center Surveillance Dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Supervisor Surveillance & Monitoring</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Oversight of Assigned Anganwadi Kendras, Nutrition Compliance & Risk Mitigation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href={reportService.getExportUrl('attendance')}
            download="attendance_report.csv"
            className="btn btn-secondary btn-sm"
          >
            <Download size={16} /> Export Attendance CSV
          </a>
          <Link to="/supervisor/alerts" className="btn btn-primary btn-sm">
            <AlertTriangle size={16} /> View All Risk Alerts ({alerts.length})
          </Link>
        </div>
      </div>

      {/* Critical Center Alerts Banner */}
      {alerts && alerts.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={18} color="var(--danger)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>
              Active Supervisory Alerts Across Kendras ({alerts.length})
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {alerts.slice(0, 3).map((a, idx) => (
              <AlertBanner
                key={idx}
                type={a.severity}
                title={a.title}
                message={`${a.message} • [${a.center}]`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Supervisory Stat Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Supervised Centers"
          value={centers.length}
          icon={Building2}
          color="info"
          badgeText="Active Audits"
          badgeColor="info"
        />
        <StatCard
          title="Children Monitored"
          value={stats?.total_children}
          icon={Baby}
          color="primary"
          subtitle={`Present: ${stats?.present_today || 0}`}
        />
        <StatCard
          title="Severe Malnutrition"
          value={stats?.at_risk_children}
          icon={TrendingDown}
          color="danger"
          badgeText="NRC Followup"
          badgeColor="danger"
        />
        <StatCard
          title="High-Risk Maternal"
          value={stats?.high_risk_pregnant}
          icon={HeartHandshake}
          color="warning"
          subtitle={`Total: ${stats?.total_pregnant_women || 0}`}
        />
      </div>

      {/* Center-Wise Monitoring Table */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Building2 size={18} color="var(--primary)" />
            Assigned Anganwadi Centers - Real-Time Status
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Center Code</th>
                <th>Center Name</th>
                <th>Assigned Worker</th>
                <th>Enrolled Children</th>
                <th>Pregnant Women</th>
                <th>Location / Ward</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {centers.map(cen => (
                <tr key={cen.id}>
                  <td><span className="badge badge-neutral">{cen.center_code}</span></td>
                  <td><strong>{cen.center_name}</strong></td>
                  <td>{cen.worker_name || <span className="text-muted">Unassigned</span>}</td>
                  <td><span className="badge badge-info">{cen.total_children} Children</span></td>
                  <td>{cen.total_pregnant} Women</td>
                  <td><span className="text-xs text-muted">{cen.location}</span></td>
                  <td>
                    <Link to={`/supervisor/centers`} className="btn btn-secondary btn-sm">
                      Inspect Kendra
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparative Charts: Center Comparison */}
      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <CalendarCheck size={18} color="var(--primary)" />
              Center-Wise Enrollment & Today's Attendance
            </div>
          </div>
          <div style={{ height: 260 }}>
            {charts?.center_stats && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.center_stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="center_name" fontSize={11} stroke="#64748b" tickFormatter={(val) => val.split(' ')[0]} />
                  <YAxis fontSize={11} stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="children" name="Enrolled Children" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="present_today" name="Present Today" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pregnant" name="Pregnant Women" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Syringe size={18} color="var(--secondary)" />
              District Immunization Coverage Status
            </div>
          </div>
          <div style={{ height: 260 }}>
            {charts?.immunization_coverage && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.immunization_coverage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} stroke="#64748b" />
                  <YAxis fontSize={11} stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" name="Doses" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
