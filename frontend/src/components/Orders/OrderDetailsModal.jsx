import { HiOutlineX, HiOutlineLocationMarker, HiOutlineUser, HiOutlineTruck, HiOutlinePhone } from 'react-icons/hi';
import './OrderDetailsModal.css';

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  dispatched: 'Dispatched',
  'picked-up': 'Picked Up',
  'in-transit': 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderDetailsModal({ order, open, onClose }) {
  if (!open || !order) return null;

  const statusClass = order.status?.replace(/\s+/g, '-').toLowerCase() || 'pending';
  const amount = order.totalAmount ?? order.amount ?? 0;

  return (
    <div className="modal-overlay" onClick={onClose} id={`order-details-modal-${order._id}`}>
      <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Order Details</h3>
            <div className="text-sm text-secondary mt-1">
              <span className="order-details-number">#{order.orderNumber || order._id?.slice(-6)}</span>
              <span className={`badge badge-${statusClass} ml-2`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        <div className="order-details-body mt-4">
          <div className="order-details-section">
            <h4>Customer Info</h4>
            <div className="order-details-row">
              <HiOutlineUser className="text-secondary" />
              <span>{order.customerName || order.customer?.name || 'Customer'}</span>
            </div>
            <div className="order-details-row">
              <HiOutlinePhone className="text-secondary" />
              <span>{order.customerPhone || 'N/A'}</span>
            </div>
            <div className="order-details-row align-start">
              <HiOutlineLocationMarker className="text-secondary" style={{ marginTop: 2 }} />
              <span>{order.deliveryAddress || order.address || '—'}</span>
            </div>
          </div>

          <div className="order-details-section mt-4">
            <h4>Items</h4>
            <div className="order-details-items">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="order-details-item">
                    <span>{item.quantity}x {item.name}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-secondary">No items details available</div>
              )}
            </div>
            <div className="order-details-total mt-3">
              <strong>Total Amount:</strong>
              <strong>₹{amount.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {order.notes && (
            <div className="order-details-section mt-4">
              <h4>Notes</h4>
              <p className="text-sm text-secondary p-2 bg-dark rounded">{order.notes}</p>
            </div>
          )}

          {order.rider?.name || order.assignedRider?.name ? (
            <div className="order-details-section mt-4">
              <h4>Assigned Rider</h4>
              <div className="order-details-row">
                <HiOutlineTruck className="text-secondary" />
                <span>{order.rider?.name || order.assignedRider?.name}</span>
              </div>
            </div>
          ) : (
            <div className="order-details-section mt-4">
              <h4>Assigned Rider</h4>
              <div className="text-sm text-secondary">No rider assigned yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
