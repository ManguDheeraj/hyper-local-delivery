import OrderCard from './OrderCard';
import { HiOutlineClipboardList } from 'react-icons/hi';

export default function OrderList({ orders = [], riders = [], onAssign, onStatusChange, onCardClick }) {
  if (!orders.length) {
    return (
      <div className="empty-state" id="orders-empty">
        <div className="empty-state-icon">
          <HiOutlineClipboardList />
        </div>
        <h4>No Orders Found</h4>
        <p>Create your first order or adjust filters to see results here.</p>
      </div>
    );
  }

  return (
    <div className="order-list" id="order-list">
      {orders.map((order, i) => (
        <div key={order._id || i} style={{ animationDelay: `${i * 60}ms` }}>
          <OrderCard
            order={order}
            riders={riders}
            onAssign={onAssign}
            onStatusChange={onStatusChange}
            onCardClick={onCardClick}
          />
        </div>
      ))}
    </div>
  );
}
