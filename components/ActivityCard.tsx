import React from 'react';

interface ActivityProps {
  activity: {
    id: string;
    mode: string;
    is_proctored: boolean;
    total_time_ms: number;
    accuracy_percentage: number;
    avg_pin_error_km: number;
    score: number;
    created_at: string;
    proctor_flagged: boolean;
  };
}

export default function ActivityCard({ activity }: ActivityProps) {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-white capitalize">{activity.mode.replace('_', ' ')} Run</h3>
            {activity.is_proctored && (
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                activity.proctor_flagged 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {activity.proctor_flagged ? 'Flagged' : 'Verified Proctored'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">{new Date(activity.created_at).toLocaleDateString()} at {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="text-right">
          <span className="text-amber-400 font-extrabold text-xl">+{activity.score} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-center">
        <div>
          <span className="block text-slate-400 text-xs">Total Time</span>
          <span className="font-mono text-sm font-semibold text-white">{formatTime(activity.total_time_ms)}</span>
        </div>
        <div>
          <span className="block text-slate-400 text-xs">Accuracy</span>
          <span className="font-mono text-sm font-semibold text-emerald-400">{activity.accuracy_percentage}%</span>
        </div>
        <div>
          <span className="block text-slate-400 text-xs">Avg Distance Error</span>
          <span className="font-mono text-sm font-semibold text-sky-400">{activity.avg_pin_error_km} km</span>
        </div>
      </div>
    </div>
  );
}