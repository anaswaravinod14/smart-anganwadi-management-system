import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Baby, 
  Building2, 
  User as UserIcon, 
  Lock, 
  LogIn, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e, u = username, p = password) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(u, p);
      // Route based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'supervisor') {
        navigate('/supervisor/dashboard');
      } else if (user.role === 'parent') {
        navigate('/parent/dashboard');
      } else {
        navigate('/worker/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail || 
        'Invalid username or password. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (u, p) => {
    setUsername(u);
    setPassword(p);
    handleLoginSubmit(null, u, p);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '2rem 1rem',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(13, 148, 136, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(79, 70, 229, 0.08) 0px, transparent 50%)',
    }}>
      <div style={{
        maxWidth: 480,
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        padding: '2.5rem 2rem',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'var(--primary-gradient)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 16px rgba(13, 148, 136, 0.25)'
          }}>
            <Baby size={32} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Smart Anganwadi
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Integrated Child Development Services (SAMS)
          </p>
        </div>

        {/* 1-Click Demo Accounts Bar */}
        <div style={{
          backgroundColor: 'var(--primary-light)',
          border: '1px solid var(--primary-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.775rem',
            fontWeight: 700,
            color: 'var(--primary-hover)',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <Sparkles size={14} /> Quick Demo Access (1-Click Login)
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.5rem',
          }}>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleDemoClick('admin', 'admin123')}
            >
              <ShieldCheck size={16} color="#ef4444" />
              <div>
                <strong>Admin</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>admin / admin123</div>
              </div>
            </button>

            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleDemoClick('worker_priya', 'worker123')}
            >
              <Baby size={16} color="#0d9488" />
              <div>
                <strong>Worker</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>worker_priya</div>
              </div>
            </button>

            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleDemoClick('supervisor_anita', 'supervisor123')}
            >
              <Building2 size={16} color="#3b82f6" />
              <div>
                <strong>Supervisor</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>supervisor_anita</div>
              </div>
            </button>

            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleDemoClick('parent_rajesh', 'parent123')}
            >
              <UserIcon size={16} color="#f59e0b" />
              <div>
                <strong>Parent</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>parent_rajesh</div>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid #fecaca',
            color: 'var(--danger-text)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '1.75rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
