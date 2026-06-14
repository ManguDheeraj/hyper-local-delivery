import RiderCard from './RiderCard';
import { HiOutlineUserGroup } from 'react-icons/hi';

export default function RiderList({ riders = [], onToggleOnline }) {
  if (!riders.length) {
    return (
      <div className="empty-state" id="riders-empty">
        <div className="empty-state-icon">
          <HiOutlineUserGroup />
        </div>
        <h4>No Riders Found</h4>
        <p>Add your first delivery rider to get started.</p>
      </div>
    );
  }

  return (
    <div className="rider-grid" id="rider-list">
      {riders.map((rider, i) => (
        <div key={rider._id || i} style={{ animationDelay: `${i * 60}ms` }}>
          <RiderCard rider={rider} onToggleOnline={onToggleOnline} />
        </div>
      ))}
    </div>
  );
}
