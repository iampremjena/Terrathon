'use client';

import React from 'react';
import { useActivityFeed } from '@/hooks/useActivityFeed';

interface ActivityFeedProps {
  userId: string | null;
  runnerName: string;
}

export default function ActivityFeed({ userId, runnerName }: ActivityFeedProps) {
  const { activities, loading } = useActivityFeed(userId || undefined);

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins > 0 ? `${mins}m ` : ''}${secs}s`;
  };

  if (!userId) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🏃‍♂️</div>
        <h3 className="text-lg font-bold text-white mb-2">Guest Runner Profile</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Sign in with Google to persist your run history, track geographical pin accuracy, and analyze split times across all practice and official runs.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-1/3 mb-3"></div>
            <div className="h-12 bg-slate-800/60 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">📍</div>
        <h3 className="text-lg font-bold text-white mb-1">No Activity Logs Found</h3>
        <p className="text-slate-400 text-sm">Launch a practice run or official Terrathon challenge to log your first activity!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📊</span> Activity History — <span className="text-amber-400">{runnerName}</span>
        </h2>
        <span className="text-xs font-mono text-slate-400">{activities.length} Total Runs</span>
      </div>

      {activities.map((act) => {
        const isOfficial = act.mode === 'terrathon_official';
        return (
          <div
            key={act.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition shadow-lg"
          >
            {/* Run Card Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-extrabold text-white capitalize">
                    {act.mode.replace('_', ' ')} Run
                  </span>
                  {isOfficial && (
                    <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-mono font-bold text-[10px] rounded uppercase">
                      Official
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {new Date(act.created_at).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono text-xl font-extrabold text-amber-400">+{act.score} XP</span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-center">
              <div>
                <span className="block text-[10px] uppercase font-mono text-slate-500">Duration</span>
                <span className="font-mono text-sm font-bold text-white">{formatTime(act.total_time_ms)}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-mono text-slate-500">Accuracy</span>
                <span className="font-mono text-sm font-bold text-emerald-400">{act.accuracy_percentage}%</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-mono text-slate-500">Avg Pin Error</span>
                <span className="font-mono text-sm font-bold text-sky-400">{act.avg_pin_error_km || 0} km</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}