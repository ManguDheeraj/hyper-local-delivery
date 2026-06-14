import { useState, useEffect, useCallback } from 'react';
import LiveMap from '../components/Map/LiveMap';
import { getRiders } from '../services/api';
import useSocket from '../hooks/useSocket';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import './MapPage.css';

export default function MapPage() {
  const [riders, setRiders] = useState([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedRider, setSelectedRider] = useState(null);
  const socket = useSocket();

  const fetchRiders = useCallback(async () => {
    try {
      const res = await getRiders();
      const data = res.data?.data || res.data?.riders || res.data || [];
      setRiders(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  useEffect(() => {
    if (!socket) return;
    const handleLocationUpdate = (data) => {
      setRiders((prev) =>
        prev.map((r) =>
          r._id === data.riderId
            ? { ...r, location: data.location, currentLocation: data.location }
            : r
        )
      );
    };
    socket.on('riderLocationUpdate', handleLocationUpdate);
    return () => socket.off('riderLocationUpdate', handleLocationUpdate);
  }, [socket]);

  const onlineRiders = riders.filter((r) => r.isOnline || r.isAvailable);

  return (
    <div className="map-page" id="map-page">
      <div className="map-page-map">
        <LiveMap
          riders={riders}
          onRiderClick={(r) => setSelectedRider(r)}
          height="100%"
        />
      </div>

      {/* Side Panel */}
      <div className={`map-page-panel glass-card-static ${panelOpen ? 'open' : ''}`} id="map-panel">
        <div className="map-page-panel-header">
          <h4>
            <HiOutlineLocationMarker size={18} /> Online Riders
          </h4>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPanelOpen(!panelOpen)}
            id="map-panel-toggle"
          >
            {panelOpen ? '✕' : '☰'}
          </button>
        </div>

        {panelOpen && (
          <div className="map-page-panel-list">
            {onlineRiders.length === 0 ? (
              <p className="text-secondary text-sm text-center p-4">No riders online</p>
            ) : (
              onlineRiders.map((rider) => {
                const initials = rider.name
                  ? rider.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                  : 'R';
                return (
                  <button
                    key={rider._id}
                    className={`map-page-rider-item ${
                      selectedRider?._id === rider._id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedRider(rider)}
                    id={`map-rider-${rider._id}`}
                  >
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                      {initials}
                    </div>
                    <div className="map-page-rider-info">
                      <span className="map-page-rider-name">{rider.name}</span>
                      <span className="text-xs text-tertiary">{rider.vehicleType || 'Motorcycle'}</span>
                    </div>
                    <span className="status-dot online" />
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
