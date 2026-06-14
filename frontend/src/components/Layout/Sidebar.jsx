import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineMap,
  HiOutlineCurrencyRupee,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
import { useState } from 'react';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/',         icon: HiOutlineViewGrid,       label: 'Dashboard' },
  { to: '/orders',   icon: HiOutlineClipboardList,  label: 'Orders' },
  { to: '/riders',   icon: HiOutlineUserGroup,      label: 'Riders' },
  { to: '/map',      icon: HiOutlineMap,            label: 'Live Map' },
  { to: '/earnings', icon: HiOutlineCurrencyRupee,  label: 'Earnings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-mobile-toggle btn-icon"
        onClick={() => setMobileOpen(true)}
        id="sidebar-mobile-open"
        aria-label="Open menu"
      >
        <HiOutlineMenu size={22} />
      </button>

      {/* Backdrop (mobile) */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}
        id="main-sidebar"
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">⚡</div>
          <span className="sidebar-brand-text">HyperDispatch</span>
          <button
            className="sidebar-close btn-icon"
            onClick={() => setMobileOpen(false)}
            id="sidebar-mobile-close"
            aria-label="Close menu"
          >
            <HiOutlineX size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.filter((item) => user?.role === 'admin' || item.to === '/orders').map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
                onClick={() => setMobileOpen(false)}
                id={`sidebar-link-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {isActive && <div className="sidebar-link-indicator" />}
              </NavLink>
            );
          })}
        </nav>

        {/* User info */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'User'}</span>
              <span className="badge badge-online" style={{ fontSize: '0.65rem' }}>
                {user?.role || 'admin'}
              </span>
            </div>
          </div>
          <button
            className="btn btn-ghost sidebar-logout"
            onClick={logout}
            id="sidebar-logout-btn"
            title="Logout"
          >
            <HiOutlineLogout size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
