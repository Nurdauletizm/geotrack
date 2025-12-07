import React, { useState } from 'react';
import { Coordinates, TrackingStatus } from '../types';
import { formatDistance, formatDuration } from '../utils/geoUtils';
import { Navigation, Clock, Activity, Play, Pause, ShieldCheck } from 'lucide-react';

interface InfoPanelProps {
  status: TrackingStatus;
  distance: number;
  duration: number;
  currentPos: Coordinates | null;
  onToggleTracking: () => void;
  onOpenAdmin: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  status, 
  distance, 
  duration, 
  currentPos, 
  onToggleTracking,
  onOpenAdmin
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute bottom-6 left-4 right-4 md:left-8 md:w-96 md:bottom-8 z-[1000] flex flex-col gap-3">
      
      {/* Main Stats Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-5 shadow-2xl text-white relative overflow-hidden">
        {/* Admin Secret Button (top right) */}
        <button 
            onClick={onOpenAdmin}
            className="absolute top-4 right-4 text-slate-600 hover:text-red-400 transition-colors"
            title="Войти как администратор"
        >
            <ShieldCheck size={18} />
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              GeoTracker
            </h1>
            <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${status === TrackingStatus.TRACKING ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    {status === TrackingStatus.TRACKING ? 'Запись маршрута' : 'Ожидание'}
                </span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden text-slate-400 mr-8"
          >
             {isExpanded ? '▼' : '▲'}
          </button>
        </div>

        {isExpanded && (
            <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center p-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <Navigation size={20} className="text-blue-400 mb-1" />
                    <span className="text-xl font-mono font-bold">{formatDistance(distance)}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Пройдено</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <Clock size={20} className="text-purple-400 mb-1" />
                    <span className="text-xl font-mono font-bold">{formatDuration(duration)}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Время</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <Activity size={20} className="text-emerald-400 mb-1" />
                    <span className="text-xl font-mono font-bold">
                        {currentPos?.speed ? (currentPos.speed * 3.6).toFixed(1) : '0.0'}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">км/ч</span>
                </div>
                </div>

                <div className="w-full">
                    <button
                        onClick={onToggleTracking}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                            status === TrackingStatus.TRACKING 
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50' 
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                        }`}
                    >
                        {status === TrackingStatus.TRACKING ? (
                            <><Pause size={18} /> Остановить запись</>
                        ) : (
                            <><Play size={18} /> Начать запись</>
                        )}
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;