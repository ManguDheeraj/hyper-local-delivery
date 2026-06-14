import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div className="app-layout" id="app-layout">
      <div className="app-bg-decoration" />
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
