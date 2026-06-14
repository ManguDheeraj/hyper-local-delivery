import { useState, useEffect, useCallback } from 'react';
import OrderList from '../components/Orders/OrderList';
import CreateOrderModal from '../components/Orders/CreateOrderModal';
import OrderDetailsModal from '../components/Orders/OrderDetailsModal';
import { getOrders, getRiders, createOrder, assignRider, updateOrderStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import { HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi';
import './OrdersPage.css';

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'in-transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const socket = useSocket();

  const fetchOrders = useCallback(async () => {
    try {
      const params = {};
      if (activeTab) params.status = activeTab;
      const res = await getOrders(params);
      const data = res.data?.data || res.data?.orders || res.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchRiders = useCallback(async () => {
    if (user?.role === 'rider') return;
    try {
      const res = await getRiders();
      const data = res.data?.data || res.data?.riders || res.data || [];
      setRiders(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
    fetchRiders();
  }, [fetchOrders, fetchRiders]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchOrders();
    socket.on('orderCreated', refresh);
    socket.on('orderUpdated', refresh);
    return () => {
      socket.off('orderCreated', refresh);
      socket.off('orderUpdated', refresh);
    };
  }, [socket, fetchOrders]);

  const handleCreate = async (data) => {
    await createOrder(data);
    fetchOrders();
  };

  const handleAssign = async (orderId, riderId) => {
    await assignRider(orderId, riderId);
    fetchOrders();
  };

  const handleStatusChange = async (orderId, status) => {
    await updateOrderStatus(orderId, status);
    fetchOrders();
  };

  const handleCardClick = (order) => {
    setSelectedOrderId(order._id);
    setDetailsModalOpen(true);
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (o.customerName || o.customer?.name || '').toLowerCase().includes(q) ||
      (o.orderNumber || o._id || '').toLowerCase().includes(q)
    );
  });

  const selectedOrder = selectedOrderId ? orders.find(o => o._id === selectedOrderId) : null;

  return (
    <div className="page-container" id="orders-page">
      {/* Header */}
      <div className="orders-page-header">
        <div>
          <h3>Orders</h3>
          <p className="text-secondary text-sm">{orders.length} total orders</p>
        </div>
        {user?.role !== 'rider' && (
          <button
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
            id="create-order-btn"
          >
            <HiOutlinePlus size={16} /> New Order
          </button>
        )}
      </div>

      {/* Search + Tabs */}
      <div className="orders-page-filters mt-4">
        <div className="orders-page-search">
          <HiOutlineSearch className="orders-page-search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by customer or order #…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="orders-search-input"
            style={{ paddingLeft: 36 }}
          />
        </div>

        <div className="tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              id={`orders-tab-${tab.key || 'all'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="spinner" />
          </div>
        ) : (
          <OrderList
            orders={filtered}
            riders={riders}
            userRole={user?.role}
            onAssign={handleAssign}
            onStatusChange={handleStatusChange}
            onCardClick={handleCardClick}
          />
        )}
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal 
        open={detailsModalOpen} 
        order={selectedOrder} 
        onClose={() => setDetailsModalOpen(false)} 
      />
    </div>
  );
}
