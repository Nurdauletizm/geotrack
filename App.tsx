import React, { useState, useEffect, useRef, useCallback } from 'react';
import TrackerMap from './components/TrackerMap';
import InfoPanel from './components/InfoPanel';
import AdminPanel from './components/AdminPanel';
import { User, Coordinates, TrackingStatus } from './types';
import { calculateDistance } from './utils/geoUtils';
import { generateSimulatedUser, moveSimulatedUser } from './utils/simulation';
import { AlertTriangle, Satellite, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Current User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  
  // Other Users State (Simulation)
  const [otherUsers, setOtherUsers] = useState<User[]>([]);
  
  // App State
  const [status, setStatus] = useState<TrackingStatus>(TrackingStatus.IDLE);
  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const simTimerRef = useRef<number | null>(null);

  // Timer effect for duration
  useEffect(() => {
    if (status === TrackingStatus.TRACKING && startTime) {
      timerRef.current = window.setInterval(() => {
        setDuration(Date.now() - startTime);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, startTime]);

  // Simulation Loop for "Other Users"
  useEffect(() => {
    // Only start simulation once we have a location to spawn them around
    if (currentUser && otherUsers.length === 0) {
      const bots = Array.from({ length: 5 }).map((_, i) => 
        generateSimulatedUser(currentUser.position, `bot-${i}`)
      );
      setOtherUsers(bots);
    }

    if (otherUsers.length > 0) {
      simTimerRef.current = window.setInterval(() => {
        setOtherUsers(prevUsers => prevUsers.map(moveSimulatedUser));
      }, 1000);
    }

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [currentUser?.position.lat, currentUser?.position.lng]);

  // Initial Geolocation Fetch
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: Coordinates = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: pos.timestamp,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            accuracy: pos.coords.accuracy
          };
          
          setCurrentUser({
            id: 'me',
            name: 'Вы (User)',
            isCurrentUser: true,
            position: coords,
            path: [coords],
            color: '#3b82f6',
            status: 'ONLINE'
          });
          setIsLocating(false);
        },
        (err) => {
          console.warn("Initial location fetch failed", err);
          setErrorMsg("Не удалось определить местоположение. Разрешите доступ к геопозиции.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      setErrorMsg("Ваш браузер не поддерживает GPS.");
      setIsLocating(false);
    }
  }, []);

  const startTracking = useCallback(() => {
    setStatus(TrackingStatus.TRACKING);
    setStartTime(Date.now());
    setDistance(0);
    setDuration(0);

    if (currentUser) {
        // Reset path on new start
        setCurrentUser(prev => prev ? ({...prev, path: [prev.position]}) : null);
    }

    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPoint: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: pos.timestamp,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          accuracy: pos.coords.accuracy
        };

        setCurrentUser(prevUser => {
          if (!prevUser) return null;
          
          const lastPoint = prevUser.path[prevUser.path.length - 1];
          const dist = calculateDistance(lastPoint.lat, lastPoint.lng, newPoint.lat, newPoint.lng);
          
          let newPath = prevUser.path;
          // Only add point if moved slightly or first point
          if (dist > 3) {
            setDistance(d => d + dist);
            newPath = [...prevUser.path, newPoint];
          }

          return {
            ...prevUser,
            position: newPoint,
            path: newPath
          };
        });
      },
      (err) => {
        setErrorMsg(`Ошибка GPS: ${err.message}`);
        setStatus(TrackingStatus.ERROR);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [currentUser?.id]);

  const stopTracking = useCallback(() => {
    setStatus(TrackingStatus.PAUSED);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const toggleTracking = () => {
    if (status === TrackingStatus.TRACKING) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const allUsers = currentUser ? [currentUser, ...otherUsers] : otherUsers;

  // LOADING SCREEN
  if (isLocating) {
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-emerald-500 relative overflow-hidden font-mono">
        <div className="scan-line"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
             <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
             <Satellite size={64} className="relative z-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold tracking-widest uppercase">Инициализация GPS</h2>
          <div className="flex items-center gap-2 text-sm text-emerald-500/70">
            <Loader2 className="animate-spin" size={16} />
            <span>Установка связи со спутниками...</span>
          </div>
          <div className="mt-8 text-xs text-slate-500 max-w-xs text-center">
            Пожалуйста, разрешите доступ к геопозиции в настройках браузера.
          </div>
        </div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{
               backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }}>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-900 text-white font-sans overflow-hidden">
      
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <TrackerMap 
            currentUser={currentUser} 
            otherUsers={otherUsers}
            isAdminMode={isAdminMode}
        />
      </div>

      {/* Error Toast */}
      {errorMsg && (
        <div className="absolute top-4 left-4 right-4 z-[2000] bg-red-500/90 text-white p-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
            <AlertTriangle size={20} />
            <span className="text-sm font-medium">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="ml-auto text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Interface Layer */}
      {isAdminMode ? (
        <AdminPanel 
            users={allUsers} 
            onClose={() => setIsAdminMode(false)} 
        />
      ) : (
        <InfoPanel 
            status={status}
            distance={distance}
            duration={duration}
            currentPos={currentUser?.position || null}
            onToggleTracking={toggleTracking}
            onOpenAdmin={() => setIsAdminMode(true)}
            showGhostTrails={false} 
            onToggleGhostTrails={() => {}} 
        />
      )}

    </div>
  );
};

export default App;
