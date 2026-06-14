import { useState } from 'react';
import { HiOutlineLocationMarker, HiOutlineUser, HiOutlineTruck } from 'react-icons/hi';
import './OrderCard.css';

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  dispatched: 'Dispatched',
  'picked-up': 'Picked Up',
  'in-transit': 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_OPTIONS = ['pending', 'assigned', 'dispatched', 'picked-up', 'in-transit', 'delivered', 'cancelled'];

export default function OrderCard({ order, riders = [], onAssign, onStatusChange }) {
  const [assigning, setAssigning] = useState(false);

  const statusClass = order.status?.replace(/\s+/g, '-').toLowerCase() || 'pending';
  const itemsCount = order.items?.length || 0;
  const amount = order.totalAmount ?? order.amount ?? 0;

  const handleAssign = async (riderId) => {
    if (!riderId || !onAssign) return;
    setAssigning(true);
    try {
      await onAssign(order._id, riderId);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatus = (e) => {
    if (onStatusChange) onStatusChange(order._id, e.target.value);
  };

  return (
    <div className={`order-card glass-card`} id={`order-card-${order._id}`}>
      <div className={`order-card-border order-card-border--${statusClass}`} />

      <div className="order-card-header">
        <div>
          <span className="order-card-number">#{order.orderNumber || order._id?.slice(-6)}</span>
          <span className={`badge badge-${statusClass}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
        <span className="order-card-amount">₹{amount.toLocaleString('en-IN')}</span>
      </div>

      <div className="order-card-body">
        <div className="order-card-row">
          <HiOutlineUser size={15} />
          <span>{order.customerName || order.customer?.name || 'Customer'}</span>
        </div>
        <div className="order-card-row">
          <HiOutlineLocationMarker size={15} />
          <span className="truncate">{order.deliveryAddress || order.address || '—'}</span>
        </div>
        {order.rider?.name && (
          <div className="order-card-row">
            <HiOutlineTruck size={15} />
            <span>{order.rider.name}</span>
          </div>
        )}
      </div>

      <div className="order-card-footer">
        <span className="order-card-items">{itemsCount} item{itemsCount !== 1 ? 's' : ''}</span>

        <div className="order-card-actions">
          {order.status === 'pending' && riders.length > 0 && (
            <select
              className="form-select order-card-select"
              onChange={(e) => handleAssign(e.target.value)}
              disabled={assigning}
              defaultValue=""
              id={`assign-rider-${order._id}`}
            >
              <option value="" disabled>
                {assigning ? 'Assigning…' : 'Assign Rider'}
              </option>
              {riders.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}

          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <select
              className="form-select order-card-select"
              onChange={handleStatus}
              value={order.status}
              id={`update-status-${order._id}`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
