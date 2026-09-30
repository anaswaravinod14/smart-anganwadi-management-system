import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  // Auto adjust sidebar based on viewport resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div 
        className="main-content" 
        style={{
          marginLeft: sidebarOpen && window.innerWidth >= 1024 ? 'var(--sidebar-width)' : '0',
          transition: 'margin-left 0.25s ease-in-out',
        }}
      >
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
