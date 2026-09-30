import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const AlertBanner = ({ type = 'info', title, message, actionText, onAction, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertCircle size={20} color="var(--danger)" />;
      case 'warning':
        return <AlertTriangle size={20} color="var(--warning)" />;
      case 'success':
        return <CheckCircle size={20} color="var(--success)" />;
      default:
        return <Info size={20} color="var(--info)" />;
    }
  };

  return (
    <div className={`alert-banner ${type}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ flexShrink: 0 }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1 }}>
        {title && <strong style={{ display: 'block', fontSize: '0.85rem' }}>{title}</strong>}
        <span style={{ fontSize: '0.8rem' }}>{message}</span>
      </div>
      {actionText && (
        <button 
          onClick={onAction} 
          className="btn btn-sm btn-secondary"
          style={{ whiteSpace: 'nowrap' }}
        >
          {actionText}
        </button>
      )}
      {onClose && (
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.2rem' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
