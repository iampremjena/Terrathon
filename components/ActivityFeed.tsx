'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ActivityItem {
  id: string;
  runner_name: string;
  mode: string;
  score: number;
  accuracy_percentage: number;
  created_at: string;
}

export default function ActivityFeed({ userId, runnerName }: { userId: string | null; runnerName: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const { data, error } = await supabase
          .from('run_activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          setActivities(data as ActivityItem[]);
        }
      } catch (err) {
        console.error('Failed to load Strava activity feed:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-slate-400 font-mono text-xs animate-pulse text-center">
        FETCHING STRAVA TELEMETRY FEED...
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Strava Activity Feed</h2>
          <p className="text-xs text-slate-400 font-mono">Live telemetry stream for {runnerName || 'Athletes'}</p>
        </div>
        <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-[10px] font-bold uppercase rounded-md">
          ● Live Feed
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-mono text-xs">
          No activities recorded yet. Complete an official run or practice simulation to generate telemetry.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-lg font-bold font-mono">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-white text-sm">{item.runner_name || 'Athlete'}</h4>
                    <span className="px-2 py-0.5 bg-slate-800 text-cyan-400 font-mono text-[10px] rounded uppercase font-bold">
                      {item.mode}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-right w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-900">
                <div>
                  <span className="text-slate-500 text-[10px] block">ACCURACY</span>
                  <span className="text-cyan-400 font-bold text-sm">{item.accuracy_percentage}%</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">XP GAINED</span>
                  <span className="text-amber-400 font-black text-base">+{item.score} XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}