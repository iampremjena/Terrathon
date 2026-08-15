'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url?: string;
  total_xp: number;
  total_runs: number;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, total_xp, total_runs')
          .order('total_xp', { ascending: false })
          .limit(10);

        if (!error && data) {
          setLeaders(data as LeaderboardUser[]);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400 font-mono text-sm animate-pulse text-center">
        Fetching global standings...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white">Global Terrathon Leaderboard</h2>
          <p className="text-xs text-slate-400">Ranked by total accumulated run XP</p>
        </div>
        <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold rounded-full">
          Season 1 Active
        </span>
      </div>

      {leaders.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6">
          No ranked runners yet. Complete official runs to claim rank #1!
        </p>
      ) : (
        <div className="space-y-2">
          {leaders.map((runner, index) => {
            const isTop3 = index < 3;
            const badgeColor =
              index === 0
                ? 'bg-amber-400 text-slate-950'
                : index === 1
                ? 'bg-slate-300 text-slate-950'
                : index === 2
                ? 'bg-amber-700 text-white'
                : 'bg-slate-800 text-slate-400';

            return (
              <div
                key={runner.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition ${
                  isTop3 ? 'bg-slate-950/80 border-slate-700' : 'bg-slate-950/40 border-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-7 h-7 flex items-center justify-center font-mono font-bold text-xs rounded-lg ${badgeColor}`}>
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">{runner.username}</h4>
                    <span className="text-xs text-slate-500 font-mono">{runner.total_runs} Completed Runs</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-amber-400 font-extrabold text-base">{runner.total_xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}