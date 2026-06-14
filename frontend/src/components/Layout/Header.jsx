import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineBell, HiOutlineSearch } from 'react-icons/hi';
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
  const { user } = useAuth();

  const title =
    PAGE_TITLES[pathname] ||
    Object.entries(PAGE_TITLES).find(([k]) => k !== '/' && pathname.startsWith(k))?.[1] ||
    'Dashboard';

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

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

        <button className="header-notif btn-icon" id="header-notif-btn" aria-label="Notifications">
          <HiOutlineBell size={20} />
          <span className="header-notif-badge">3</span>
        </button>

        <div className="avatar" title={user?.name || 'User'}>
          {initials}
        </div>
      </div>
    </header>
  );
}
