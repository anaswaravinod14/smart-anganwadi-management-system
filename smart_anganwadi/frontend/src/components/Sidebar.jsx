import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Baby,
  CalendarCheck,
  TrendingUp,
  Syringe,
  HeartPulse,
  HeartHandshake,
  UtensilsCrossed,
  Sparkles,
  FileBarChart2,
  Users,
  Building2,
  AlertTriangle,
  GraduationCap,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'worker';

  const getLinks = () => {
    if (role === 'admin') {
      return [
        { label: 'Admin Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Centers Directory', to: '/admin/centers', icon: Building2 },
        { label: 'ECCE Teachers', to: '/admin/teachers', icon: GraduationCap },
        { label: 'Child Registry', to: '/admin/children', icon: Baby },
        { label: 'Attendance Audit', to: '/admin/attendance', icon: CalendarCheck },
        { label: 'Growth Monitoring', to: '/admin/growth', icon: TrendingUp },
        { label: 'Pregnant Women', to: '/admin/pregnant-women', icon: HeartHandshake },
        { label: 'Food & Nutrition', to: '/admin/food', icon: UtensilsCrossed },
        { label: 'Early Activities', to: '/admin/activities', icon: Sparkles },
        { label: 'User Management', to: '/admin/users', icon: Users },
        { label: 'Reports & Export', to: '/admin/reports', icon: FileBarChart2 },
      ];
    } else if (role === 'teacher') {
      return [
        { label: 'Teacher Dashboard', to: '/teacher/dashboard', icon: LayoutDashboard },
        { label: 'Preschool Roster', to: '/teacher/children', icon: Baby },
        { label: 'Daily Roll Call', to: '/teacher/attendance', icon: CalendarCheck },
        { label: 'Early Learning Plan', to: '/teacher/activities', icon: Sparkles },
        { label: 'Growth Monitoring', to: '/teacher/growth', icon: TrendingUp },
        { label: 'Center Reports', to: '/teacher/reports', icon: FileBarChart2 },
      ];
    } else if (role === 'parent') {
      return [
        { label: 'My Child Overview', to: '/parent/dashboard', icon: LayoutDashboard },
        { label: 'Attendance Record', to: '/parent/attendance', icon: CalendarCheck },
        { label: 'Growth Trajectory', to: '/parent/growth', icon: TrendingUp },
        { label: 'Vaccination Schedule', to: '/parent/immunizations', icon: Syringe },
        { label: 'Daily Food Menu', to: '/parent/meals', icon: UtensilsCrossed },
        { label: 'Learning & Play', to: '/parent/activities', icon: Sparkles },
      ];
    } else {
      // Default: Anganwadi Worker
      return [
        { label: 'Worker Dashboard', to: '/worker/dashboard', icon: LayoutDashboard },
        { label: 'Children Registry', to: '/worker/children', icon: Baby },
        { label: 'Daily Attendance', to: '/worker/attendance', icon: CalendarCheck },
        { label: 'Growth Monitoring', to: '/worker/growth', icon: TrendingUp },
        { label: 'Immunization Tracker', to: '/worker/immunizations', icon: Syringe },
        { label: 'Health Records', to: '/worker/health', icon: HeartPulse },
        { label: 'Maternal Care', to: '/worker/pregnant-women', icon: HeartHandshake },
        { label: 'Food Menu & Stock', to: '/worker/food', icon: UtensilsCrossed },
        { label: 'Learning Activities', to: '/worker/activities', icon: Sparkles },
        { label: 'Center Reports', to: '/worker/reports', icon: FileBarChart2 },
      ];
    }
  };

  const navLinks = getLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 45,
            display: 'block'
          }}
        />
      )}

      <aside style={{
        width: 'var(--sidebar-width)',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        transition: 'transform 0.25s ease-in-out',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.1rem'
            }}>
              S
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.1 }}>
                SAMS
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Poshan & Early Child
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div style={{ padding: '1rem 0.75rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ 
            fontSize: '0.725rem', 
            textTransform: 'uppercase', 
            fontWeight: 700, 
            color: 'var(--text-light)', 
            padding: '0 0.75rem 0.5rem',
            letterSpacing: '0.6px'
          }}>
            {role.toUpperCase()} NAVIGATION
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--text-body)',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-app)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>v1.0.0 (ICDS POSHAN)</span>
          <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Online</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
