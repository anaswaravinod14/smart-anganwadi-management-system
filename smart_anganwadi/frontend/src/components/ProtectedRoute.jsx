import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--primary)',
        fontSize: '1.1rem',
        fontWeight: 600
      }}>
        Loading Smart Anganwadi System...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const isAllowed = user.role === 'admin' || user.is_superuser || 
      (Array.isArray(allowedRoles) ? allowedRoles.includes(user.role) : user.role === allowedRoles);

    if (!isAllowed) {
      // Redirect to user's appropriate home dashboard
      if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (user.role === 'supervisor') return <Navigate to="/supervisor/dashboard" replace />;
      if (user.role === 'parent') return <Navigate to="/parent/dashboard" replace />;
      return <Navigate to="/worker/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
