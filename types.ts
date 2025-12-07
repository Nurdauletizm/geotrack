export interface Coordinates {
  lat: number;
  lng: number;
  timestamp: number;
  speed: number | null;
  heading: number | null;
  accuracy: number;
}

export interface User {
  id: string;
  name: string;
  isCurrentUser: boolean;
  position: Coordinates;
  path: Coordinates[];
  color: string;
  status: 'ONLINE' | 'OFFLINE' | 'IDLE';
}

export enum TrackingStatus {
  IDLE = 'IDLE',
  TRACKING = 'TRACKING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR'
}

export interface AIAnalysisResult {
  locationName: string;
  description: string;
  funFact: string;
}