'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  username: string;
  total_xp: number;
  total_runs: number;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, total_xp, total_runs')
        .order('total_xp', { ascending: false })
        .limit(10); // TOP 10 WORLDWIDE

      if (!error && data) {
        setLeaders(data);
      }
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="text-center p-10 text-slate-400 font-bold animate-pulse">Loading Global Rankings...</div>;
  }

  return (
    <div className="bg-slate-800 p-8 rounded-3xl shadow-xl border-2 border-slate-700">
      <h2 className="text-2xl font-black text-white mb-2">Top 10 Global Leaderboard</h2>
      <p className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Ranked by Total Lifetime XP</p>
      
      <div className="space-y-3">
        {leaders.map((leader, index) => (
          <div key={leader.id} className={`flex justify-between items-center p-5 rounded-2xl ${index === 0 ? 'bg-amber-500 text-slate-900 shadow-lg scale-[1.02]' : index === 1 ? 'bg-slate-300 text-slate-900' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-900 text-white border border-slate-700'}`}>
            <div className="flex items-center gap-4">
              <span className="font-black text-xl w-6">{index + 1}</span>
              <div>
                <h3 className="font-black text-lg">{leader.username}</h3>
                <p className={`text-xs font-bold ${index < 3 ? 'opacity-80' : 'text-slate-400'}`}>{leader.total_runs} Runs Completed</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-2xl">{leader.total_xp.toLocaleString()}</span>
              <span className={`text-xs block font-bold uppercase tracking-wider ${index < 3 ? 'opacity-80' : 'text-blue-400'}`}>XP</span>
            </div>
          </div>
        ))}

        {leaders.length === 0 && (
          <div className="text-center py-10 text-slate-500 font-bold">No athletes ranked yet. Be the first!</div>
        )}
      </div>
    </div>
  );
}