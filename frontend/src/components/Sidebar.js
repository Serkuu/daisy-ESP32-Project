import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bluetooth, LogOut, BarChart3 } from 'lucide-react';

function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  return (
    <aside className="sidebar-container">
      <div className="hide-on-mobile" style={{ marginBottom: 'var(--spacing-3xl)', padding: '0 var(--spacing-sm)' }}>
        <h2 style={{ color: 'var(--color-ink-deep)', fontSize: '28px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Pally, sans-serif' }}>daisy</span><img src="/daisy.svg" alt="logo" style={{ height: '32px', marginLeft: '6px' }} />
        </h2>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1 }}>
        <NavLink to="/dashboard" className="nav-link">
          <LayoutDashboard size={20} />
          <span>Strona główna</span>
        </NavLink>

        <NavLink to="/history" className="nav-link">
          <BarChart3 size={20} />
          <span>Wykresy i historia</span>
        </NavLink>

        <NavLink to="/hardware" className="nav-link">
          <Bluetooth size={20} />
          <span>Urządzenia</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{ width: '100%', backgroundColor: 'transparent', textAlign: 'left' }}
        >
          <LogOut size={20} />
          <span>Wyloguj</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
