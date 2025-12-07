import { User, Coordinates } from '../types';

const NAMES = ['Agent Alpha', 'User 402', 'Explorer X', 'Delivery 09', 'Patrol 1', 'User 773', 'Guest 55'];
const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Generate a random user near a center point
export const generateSimulatedUser = (center: Coordinates, id: string): User => {
  const latOffset = (Math.random() - 0.5) * 0.01; // Approx 1km range
  const lngOffset = (Math.random() - 0.5) * 0.01;

  const startPos: Coordinates = {
    lat: center.lat + latOffset,
    lng: center.lng + lngOffset,
    timestamp: Date.now(),
    speed: Math.random() * 5 + 1, // 1-6 m/s
    heading: Math.random() * 360,
    accuracy: 10
  };

  return {
    id,
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    isCurrentUser: false,
    position: startPos,
    path: [startPos],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    status: 'ONLINE'
  };
};

// Move a user based on their speed and heading
export const moveSimulatedUser = (user: User): User => {
  // Simple physics: move in direction of heading
  // 1 degree lat/lng is approx 111km. 
  // speed (m/s) * 1sec / 111000 = change in degrees
  const moveDist = (user.position.speed || 0) / 111000; 
  
  // Randomly change heading slightly
  const headingChange = (Math.random() - 0.5) * 20; 
  const newHeading = ((user.position.heading || 0) + headingChange + 360) % 360;
  
  const rads = (newHeading * Math.PI) / 180;
  
  const newLat = user.position.lat + (moveDist * Math.cos(rads));
  const newLng = user.position.lng + (moveDist * Math.sin(rads));

  const newPos: Coordinates = {
    lat: newLat,
    lng: newLng,
    timestamp: Date.now(),
    speed: Math.max(0, (user.position.speed || 0) + (Math.random() - 0.5)), // Speed fluctuates
    heading: newHeading,
    accuracy: 10
  };

  // Keep path limited to last 50 points to save memory
  const newPath = [...user.path, newPos].slice(-50);

  return {
    ...user,
    position: newPos,
    path: newPath
  };
};
