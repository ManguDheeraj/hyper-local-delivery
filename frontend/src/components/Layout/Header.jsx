import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineBell, HiOutlineSearch } from 'react-icons/hi';
import { toggleRiderOnline } from '../../services/api';
import './Header.css';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/orders': 'Orders',
  '/riders': 'Riders',
  '/map': 'Live Map',
  '/earnings': 'Earnings',
};

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggleOnline = async () => {
    if (!user?.riderId) return;
    setToggling(true);
    try {
      const res = await toggleRiderOnline(user.riderId);
      updateUser({ isOnline: res.data?.data?.isOnline ?? res.data?.rider?.isOnline ?? !user.isOnline });
    } catch {
      /* ignore */
    } finally {
      setToggling(false);
    }
  };

  const title =
    PAGE_TITLES[pathname] ||
    Object.entries(PAGE_TITLES).find(([k]) => k !== '/' && pathname.startsWith(k))?.[1] ||
    'Dashboard';

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleProfileClick = () => {
    navigate('/');
  };

  return (
    <header className="header" id="main-header">
      <div className="header-left">
        <h2 className="header-title">{title}</h2>
      </div>

      <div className="header-right">
        <div className="header-search">
          <HiOutlineSearch className="header-search-icon" />
          <input
            type="text"
            placeholder="Search…"
            className="header-search-input"
            id="header-search-input"
          />
        </div>

        {user?.role === 'rider' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
            <span className={`badge ${user.isOnline ? 'badge-online' : 'badge-offline'}`}>
              {user.isOnline ? 'Online' : 'Offline'}
            </span>
            <button
              className="btn btn-sm"
              onClick={handleToggleOnline}
              disabled={toggling}
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            >
              {toggling ? '...' : (user.isOnline ? 'Go Offline' : 'Go Online')}
            </button>
          </div>
        )}

        <div className="header-notif-wrapper" style={{ position: 'relative' }}>
          <button 
            className="header-notif btn-icon" 
            id="header-notif-btn" 
            aria-label="Notifications"
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <HiOutlineBell size={20} />
            <span className="header-notif-badge">3</span>
          </button>

          {showNotifs && (
            <div className="notif-dropdown">
              <h4>Recent Notifications</h4>
              <ul>
                <li><strong>New Order</strong> #ORD-00040 just arrived</li>
                <li><strong>Rider Amit</strong> is now online</li>
                <li><strong>Order Delivered</strong> #ORD-10020 delivered</li>
              </ul>
            </div>
          )}
        </div>

        <div 
          className="avatar" 
          title={user?.name || 'User'} 
          onClick={handleProfileClick} 
          style={{ cursor: 'pointer' }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
