import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/Admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Atirath <span>Admin</span></h2>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <i className="fas fa-chart-pie"></i> Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <i className="fas fa-box"></i> Products
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <i className="fas fa-users"></i> Users
          </NavLink>
        </nav>
        <div className="admin-logout-container">
          <button onClick={handleLogout} className="admin-logout-btn">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <header className="admin-header">
          <div className="admin-header-title">
            <h3>Admin Control Panel</h3>
          </div>
          <div className="admin-header-profile">
            <div className="admin-avatar">
              <i className="fas fa-user-shield"></i>
            </div>
            <span>Administrator</span>
          </div>
        </header>
        <div className="admin-content-wrapper">
          <Outlet /> {/* This will render the nested route components */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
