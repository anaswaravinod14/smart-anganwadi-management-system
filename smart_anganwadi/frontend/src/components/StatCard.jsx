import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle, badgeText, badgeColor = 'success' }) => {
  const colorMap = {
    primary: { bg: 'var(--primary-light)', text: 'var(--primary)', border: 'var(--primary-border)' },
    secondary: { bg: 'var(--secondary-light)', text: 'var(--secondary)', border: '#c7d2fe' },
    warning: { bg: 'var(--warning-bg)', text: 'var(--warning)', border: '#fde68a' },
    danger: { bg: 'var(--danger-bg)', text: 'var(--danger)', border: '#fecaca' },
    info: { bg: 'var(--info-bg)', text: 'var(--info)', border: '#bae6fd' },
    success: { bg: 'var(--success-bg)', text: 'var(--success)', border: '#a7f3d0' },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="stat-card" style={{ borderColor: scheme.border }}>
      <div className="stat-icon-wrapper" style={{ backgroundColor: scheme.bg, color: scheme.text }}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value !== undefined && value !== null ? value : '-'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
          {badgeText && (
            <span className={`badge badge-${badgeColor}`} style={{ fontSize: '0.7rem' }}>
              {badgeText}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
