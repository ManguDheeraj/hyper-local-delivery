import {
  HiOutlinePhone,
  HiOutlineStar,
  HiOutlineTruck,
  HiOutlineCurrencyRupee,
} from 'react-icons/hi';
import { FaMotorcycle, FaBicycle, FaCar } from 'react-icons/fa';
import './RiderCard.css';

const VEHICLE_ICONS = {
  motorcycle: FaMotorcycle,
  bike: FaBicycle,
  bicycle: FaBicycle,
  car: FaCar,
};

export default function RiderCard({ rider, onToggleOnline }) {
  const isOnline = rider.isOnline || rider.isAvailable;
  const VehicleIcon = VEHICLE_ICONS[rider.vehicleType?.toLowerCase()] || FaMotorcycle;
  const initials = rider.name
    ? rider.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'R';

  const rating = rider.rating ?? 4.5;
  const fullStars = Math.floor(rating);

  return (
    <div className="rider-card glass-card" id={`rider-card-${rider._id}`}>
      <div className="rider-card-top">
        <div className="rider-card-avatar-wrap">
          <div className="avatar avatar-lg">{initials}</div>
          <span className={`status-dot ${isOnline ? 'online' : 'offline'} rider-card-dot`} />
        </div>
        <div className="rider-card-info">
          <h5 className="rider-card-name">{rider.name}</h5>
          <div className="rider-card-vehicle">
            <VehicleIcon size={14} />
            <span>{rider.vehicleType || 'Motorcycle'}</span>
          </div>
        </div>
        <span className={`badge ${isOnline ? 'badge-online' : 'badge-offline'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="rider-card-stats">
        <div className="rider-card-stat">
          <HiOutlineTruck size={16} />
          <span>{rider.totalDeliveries ?? 0}</span>
          <small>Deliveries</small>
        </div>
        <div className="rider-card-stat">
          <HiOutlineCurrencyRupee size={16} />
          <span>₹{(rider.totalEarnings ?? 0).toLocaleString('en-IN')}</span>
          <small>Earnings</small>
        </div>
        <div className="rider-card-stat">
          <HiOutlineStar size={16} />
          <span>{rating.toFixed(1)}</span>
          <small>Rating</small>
        </div>
      </div>

      {rider.phone && (
        <div className="rider-card-phone">
          <HiOutlinePhone size={14} />
          <span>{rider.phone}</span>
        </div>
      )}

      <div className="rider-card-footer">
        <div className="rider-card-rating-stars">
          {[...Array(5)].map((_, i) => (
            <HiOutlineStar
              key={i}
              size={14}
              className={i < fullStars ? 'star-filled' : 'star-empty'}
            />
          ))}
        </div>
        {onToggleOnline && (
          <button
            className={`btn btn-sm ${isOnline ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => onToggleOnline(rider._id)}
            id={`toggle-rider-${rider._id}`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        )}
      </div>
    </div>
  );
}
