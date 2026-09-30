import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import {
  AlertTriangle,
  Syringe,
  Package,
  HeartHandshake,
  HeartPulse,
  Filter
} from 'lucide-react';

const AlertsPage = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Surveillance & Risk Mitigation Alerts</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Automated alerts for missed immunizations, malnutrition, hospital referrals & commodity shortages
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ padding: '0.75rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="text-xs font-semibold text-muted" style={{ marginRight: '0.5rem' }}>FILTER BY TYPE:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilterType('vaccine_overdue')}
            className={`btn btn-sm ${filterType === 'vaccine_overdue' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Syringe size={14} /> Overdue Vaccines
          </button>
          <button
            onClick={() => setFilterType('low_stock')}
            className={`btn btn-sm ${filterType === 'low_stock' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Package size={14} /> Low Food Stock
          </button>
          <button
            onClick={() => setFilterType('high_risk_maternal')}
            className={`btn btn-sm ${filterType === 'high_risk_maternal' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <HeartHandshake size={14} /> High-Risk Maternal
          </button>
          <button
            onClick={() => setFilterType('health_referral')}
            className={`btn btn-sm ${filterType === 'health_referral' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <HeartPulse size={14} /> Doctor Referrals
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Scanning clinical and supply chain parameters...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <AlertTriangle size={36} color="var(--success)" style={{ margin: '0 auto 0.5rem' }} />
            <h3>No Active Alerts</h3>
            <p className="text-sm">All child immunizations, nutrition stocks, and maternal checkups are on track.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredAlerts.map((a, idx) => (
              <AlertBanner
                key={idx}
                type={a.severity}
                title={a.title}
                message={`${a.message} • [Center: ${a.center}]`}
                actionText="Take Action"
                onAction={() => {
                  if (a.child_id) navigate(`/worker/children/${a.child_id}`);
                  else if (a.woman_id) navigate('/worker/pregnant-women');
                  else if (a.stock_id) navigate('/worker/food');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
