import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import './LiveMap.css';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e1e3f' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a55' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2a2a55' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#06063a' }] },
];

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

const containerStyle = { width: '100%', height: '100%' };

export default function LiveMap({ riders = [], onRiderClick, height = '100%' }) {
  const [selected, setSelected] = useState(null);

  /* ── Google Maps ── */
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  });

  const handleMarkerClick = useCallback(
    (rider) => {
      setSelected(rider);
      if (onRiderClick) onRiderClick(rider);
    },
    [onRiderClick]
  );

  /* ── Fallback when no API key ── */
  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="map-fallback glass-card-static" style={{ height }} id="map-fallback">
        <div className="map-fallback-inner">
          <div className="map-fallback-grid">
            {riders
              .filter((r) => r.isOnline || r.isAvailable)
              .map((rider, i) => {
                const x = 15 + ((i * 137) % 70);
                const y = 10 + ((i * 89) % 75);
                return (
                  <div
                    key={rider._id || i}
                    className="map-fallback-dot"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    title={rider.name}
                  >
                    <span className="map-fallback-dot-pulse" />
                    <span className="map-fallback-dot-label">{rider.name?.split(' ')[0]}</span>
                  </div>
                );
              })}
            {riders.filter((r) => r.isOnline || r.isAvailable).length === 0 && (
              <div className="map-fallback-no-riders">
                <HiOutlineLocationMarker size={32} />
                <p>No online riders</p>
              </div>
            )}
          </div>
          <div className="map-fallback-msg">
            <HiOutlineLocationMarker size={20} />
            <span>Configure <code>VITE_GOOGLE_MAPS_KEY</code> for live tracking</span>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="map-fallback glass-card-static" style={{ height }}>
        <p className="text-danger">Failed to load Google Maps.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-fallback glass-card-static flex items-center justify-center" style={{ height }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="live-map-container" style={{ height }} id="live-map">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={DEFAULT_CENTER}
        zoom={12}
        options={{
          styles: DARK_MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {riders
          .filter((r) => r.location?.coordinates || r.currentLocation)
          .map((rider) => {
            const coords = rider.location?.coordinates || rider.currentLocation?.coordinates;
            if (!coords) return null;
            const pos = { lat: coords[1], lng: coords[0] };
            const isOnline = rider.isOnline || rider.isAvailable;
            return (
              <Marker
                key={rider._id}
                position={pos}
                onClick={() => handleMarkerClick(rider)}
                icon={{
                  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
                  fillColor: isOnline ? '#7c3aed' : '#64748b',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#fff',
                  scale: 1.5,
                  anchor: { x: 12, y: 22 },
                }}
              />
            );
          })}

        {selected && (
          <InfoWindow
            position={{
              lat: (selected.location?.coordinates || selected.currentLocation?.coordinates)?.[1] || 0,
              lng: (selected.location?.coordinates || selected.currentLocation?.coordinates)?.[0] || 0,
            }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="map-infowindow">
              <strong>{selected.name}</strong>
              <p>{selected.isOnline ? '🟢 Online' : '⚫ Offline'}</p>
              {selected.currentOrder && <p>Order: #{selected.currentOrder}</p>}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
