import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  ShieldCheck, 
  Building2, 
  Baby, 
  CheckCircle2,
  X
} from 'lucide-react';
import { notificationService } from '../services/api';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.list();
      setNotifications(data);
      const unread = data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setUnreadCount(0);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge badge-danger"><ShieldCheck size={12} /> Admin</span>;
      case 'supervisor':
        return <span className="badge badge-info"><Building2 size={12} /> Supervisor</span>;
      case 'worker':
        return <span className="badge badge-success"><Baby size={12} /> Anganwadi Worker</span>;
      case 'parent':
        return <span className="badge badge-warning"><UserIcon size={12} /> Parent</span>;
      default:
        return <span className="badge badge-neutral">{role}</span>;
    }
  };

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.4rem 0.6rem' }}
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.15rem', letterSpacing: '-0.5px' }}>
              SAMS
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
              | Smart Anganwadi System
            </span>
          </div>
          {user?.center && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Center: <strong style={{ color: 'var(--text-main)' }}>{user.center.name}</strong> ({user.center.code})
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Role Badge */}
        {user && getRoleBadge(user.role)}

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              position: 'relative',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 18,
                height: 18,
                background: 'var(--danger)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifPopover && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '120%',
              width: 320,
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              padding: '0.75rem',
              zIndex: 100,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.85rem' }}>Notifications ({notifications.length})</strong>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: n.is_read ? 'transparent' : 'var(--primary-light)',
                        marginBottom: '0.25rem',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{n.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {user?.full_name || user?.username}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user?.phone || user?.email}
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.45rem 0.75rem' }}
            title="Log out"
          >
            <LogOut size={16} />
            <span style={{ display: 'inline-block' }}>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
