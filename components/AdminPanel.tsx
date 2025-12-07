import React from 'react';
import { User } from '../types';
import { Activity, Shield, Wifi, User as UserIcon } from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ users, onClose }) => {
  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 z-[1100] flex flex-col shadow-2xl animate-in slide-in-from-right">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
        <div>
          <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
            <Shield size={20} /> АДМИН ПАНЕЛЬ
          </h2>
          <div className="flex items-center gap-2 mt-1">
             <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
             </span>
             <span className="text-xs text-slate-400 uppercase tracking-wider">Система активна</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 p-6 border-b border-slate-700/50">
         <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
            <div className="text-slate-400 text-xs uppercase mb-1">Всего онлайн</div>
            <div className="text-2xl font-mono font-bold text-white">{users.length}</div>
         </div>
         <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
            <div className="text-slate-400 text-xs uppercase mb-1">Активные</div>
            <div className="text-2xl font-mono font-bold text-emerald-400">{users.filter(u => (u.position.speed || 0) > 0.5).length}</div>
         </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase px-2 mb-2">Список подключений</h3>
        {users.map(user => (
          <div key={user.id} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg p-3 transition-all flex items-center gap-3 group">
             <div className="w-2 h-full bg-transparent rounded-l-lg absolute left-0 top-0 bottom-0" style={{backgroundColor: user.color}}></div>
             
             <div className={`p-2 rounded-full ${user.isCurrentUser ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                <UserIcon size={16} />
             </div>
             
             <div className="flex-1">
                <div className="flex justify-between items-center">
                   <span className="font-bold text-sm text-slate-200">{user.name} {user.isCurrentUser && '(Вы)'}</span>
                   <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">{user.status}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                   <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Wifi size={10} /> GPS: OK
                   </span>
                   <span className="text-xs font-mono text-emerald-400">
                      {((user.position.speed || 0) * 3.6).toFixed(1)} km/h
                   </span>
                </div>
                <div className="text-[10px] text-slate-600 mt-1 font-mono">
                    {user.position.lat.toFixed(5)}, {user.position.lng.toFixed(5)}
                </div>
             </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminPanel;
