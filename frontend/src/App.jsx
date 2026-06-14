import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import RidersPage from './pages/RidersPage';
import MapPage from './pages/MapPage';
import EarningsPage from './pages/EarningsPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="riders" element={<RidersPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="earnings" element={<EarningsPage />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </AuthProvider>
  );
}
