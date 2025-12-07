import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Coordinates, User } from '../types';

// Custom icons
const createIcon = (color: string, isPulse: boolean) => new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:${color}; width:14px; height:14px; border-radius:50%; border:2px solid white; position:relative; box-shadow: 0 0 10px ${color};">
    ${isPulse ? '<div class="pulse-ring" style="border-color:' + color + '"></div>' : ''}
  </div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

interface TrackerMapProps {
  currentUser: User | null;
  otherUsers: User[];
  isAdminMode: boolean;
}

const MapController: React.FC<{ center: Coordinates | null, isAdmin: boolean }> = ({ center, isAdmin }) => {
  const map = useMap();
  const firstRender = useRef(true);

  useEffect(() => {
    if (center && !isAdmin) {
      if (firstRender.current) {
        map.setView([center.lat, center.lng], 16);
        firstRender.current = false;
      } else {
        map.panTo([center.lat, center.lng]);
      }
    }
  }, [center, map, isAdmin]);

  return null;
};

const TrackerMap: React.FC<TrackerMapProps> = ({ currentUser, otherUsers, isAdminMode }) => {
  // Combine all for rendering
  const allUsers = currentUser ? [currentUser, ...otherUsers] : otherUsers;

  // Default view
  const centerPos: [number, number] = currentUser?.position 
    ? [currentUser.position.lat, currentUser.position.lng] 
    : [55.7558, 37.6173];

  return (
    <MapContainer 
      center={centerPos} 
      zoom={14} 
      zoomControl={false} 
      className="h-full w-full outline-none"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      <MapController center={currentUser?.position || null} isAdmin={isAdminMode} />

      {allUsers.map((user) => (
        <React.Fragment key={user.id}>
          {/* Path */}
          {user.path.length > 1 && (
            <Polyline 
                positions={user.path.map(p => [p.lat, p.lng])} 
                pathOptions={{ 
                  color: user.color, 
                  weight: 3, 
                  opacity: user.isCurrentUser ? 0.8 : 0.5,
                  dashArray: user.isCurrentUser ? undefined : '5, 10'
                }} 
            />
          )}

          {/* Current Position Marker */}
          <Marker 
            position={[user.position.lat, user.position.lng]} 
            icon={createIcon(user.color, user.isCurrentUser)}
          >
             <Popup>
                <div className="text-slate-900">
                  <strong>{user.name}</strong><br/>
                  Speed: {(user.position.speed || 0 * 3.6).toFixed(1)} km/h<br/>
                  {user.isCurrentUser ? '(Это вы)' : '(Отслеживается)'}
                </div>
             </Popup>
          </Marker>

          {/* Accuracy Circle only for current user */}
          {user.isCurrentUser && (
            <Circle 
                center={[user.position.lat, user.position.lng]} 
                radius={user.position.accuracy || 20} 
                pathOptions={{ fillColor: user.color, fillOpacity: 0.1, stroke: false }} 
            />
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

export default TrackerMap;
