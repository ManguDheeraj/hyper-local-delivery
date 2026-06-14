import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatsCards from '../components/Dashboard/StatsCards';
import EarningsChart from '../components/Dashboard/EarningsChart';
import LiveMap from '../components/Map/LiveMap';
import { getOrders, getOrderStats, getRiders } from '../services/api';
import useSocket from '../hooks/useSocket';
import {
  HiOutlinePlus,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import './DashboardPage.css';

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  dispatched: 'Dispatched',
  'picked-up': 'Picked Up',
  'in-transit': 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function DashboardPage() {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchData = async () => {
    try {
      const [ordersRes, ridersRes] = await Promise.all([
        getOrders({ limit: 5, sort: '-createdAt' }).catch(() => ({ data: { data: [] } })),
        getRiders().catch(() => ({ data: { data: [] } })),
      ]);

      let statsRes;
      try {
        statsRes = await getOrderStats();
      } catch {
        statsRes = null;
      }

      const ordersData = ordersRes.data?.data || ordersRes.data?.orders || ordersRes.data || [];
      const ridersData = ridersRes.data?.data || ridersRes.data?.riders || ridersRes.data || [];
      const ordersList = Array.isArray(ordersData) ? ordersData : [];
      const ridersList = Array.isArray(ridersData) ? ridersData : [];

      setRecentOrders(ordersList.slice(0, 5));
      setRiders(ridersList);

      if (statsRes?.data) {
        const s = statsRes.data.stats || statsRes.data.data || statsRes.data;
        setStats({
          totalOrders: s.totalOrders ?? ordersList.length,
          activeRiders: s.activeRiders ?? ridersList.filter((r) => r.isOnline || r.isAvailable).length,
          deliveredToday: s.deliveredToday ?? ordersList.filter((o) => o.status === 'delivered').length,
          revenue: s.revenue ?? s.totalRevenue ?? 0,
        });
      } else {
        setStats({
          totalOrders: ordersList.length,
          activeRiders: ridersList.filter((r) => r.isOnline || r.isAvailable).length,
          deliveredToday: ordersList.filter((o) => o.status === 'delivered').length,
          revenue: ordersList.reduce((s, o) => s + (o.totalAmount || o.amount || 0), 0),
        });
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchData();
    socket.on('orderCreated', refresh);
    socket.on('orderUpdated', refresh);
    socket.on('riderLocationUpdate', refresh);
    return () => {
      socket.off('orderCreated', refresh);
      socket.off('orderUpdated', refresh);
      socket.off('riderLocationUpdate', refresh);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="page-container" id="dashboard-page">
      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Quick Actions */}
      <div className="dashboard-actions mt-6">
        <Link to="/orders" className="btn btn-primary" id="dashboard-new-order">
          <HiOutlinePlus size={16} /> New Order
        </Link>
        <Link to="/orders" className="btn btn-secondary" id="dashboard-view-orders">
          View All Orders <HiOutlineArrowRight size={16} />
        </Link>
      </div>

      {/* Two column layout */}
      <div className="dashboard-grid mt-6">
        {/* Recent Orders */}
        <div className="glass-card-static dashboard-orders-panel" id="dashboard-recent-orders">
          <div className="flex items-center justify-between mb-4">
            <h4>Recent Orders</h4>
            <Link to="/orders" className="text-sm text-gradient" style={{ fontWeight: 500 }}>
              View All
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-secondary text-sm text-center p-6">No orders yet.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const statusClass = order.status?.replace(/\s+/g, '-').toLowerCase() || 'pending';
                    return (
                      <tr key={order._id}>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          #{order.orderNumber || order._id?.slice(-6)}
                        </td>
                        <td>{order.customerName || order.customer?.name || '—'}</td>
                        <td>
                          <span className={`badge badge-${statusClass}`}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          ₹{(order.totalAmount || order.amount || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mini Map */}
        <div className="dashboard-map-panel">
          <h4 className="mb-4">Rider Locations</h4>
          <LiveMap riders={riders} height="300px" />
        </div>
      </div>

      {/* Earnings */}
      <div className="mt-6">
        <EarningsChart />
      </div>
    </div>
  );
}
