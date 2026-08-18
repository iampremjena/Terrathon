'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import GameRunner from '@/components/GameRunner';
import ActivityFeed from '@/components/ActivityFeed';
import Leaderboard from '@/components/Leaderboard';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const GlobeCanvas = dynamic(() => import('@/components/GlobeCanvas'), { ssr: false });

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [callsign, setCallsign] = useState<string>('');
  const [needsUsername, setNeedsUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  
  const [activeTab, setActiveTab] = useState<'hub' | 'activity' | 'leaderboard'>('hub');
  const [selectedMode, setSelectedMode] = useState<'capital' | 'photoguessr' | 'trivia' | 'terrathon_official' | null>(null);
  
  const [timeStr, setTimeStr] = useState<string>('');
  const [onlineCount, setOnlineCount] = useState<number>(1);

  // 1. Clock Tracker
  useEffect(() => {
    const timer = setInterval(() => setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Auth Session Loader
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const checkUser = async (sessionUser: any) => {
      setUser(sessionUser);
      if (sessionUser) {
        const { data } = await supabase.from('profiles').select('username').eq('id', sessionUser.id).single();
        if (!data?.username || data.username.startsWith('Runner_')) setNeedsUsername(true);
        else setCallsign(data.username);
      }
    };
    supabase.auth.getSession().then(({ data: { session } }) => checkUser(session?.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => checkUser(session?.user));
    return () => subscription.unsubscribe();
  }, []);

  // 3. Live Presence Tracker (Players Online)
  useEffect(() => {
    if (!callsign) return;
    const room = supabase.channel('global_lobby');
    room.on('presence', { event: 'sync' }, () => {
      const state = room.presenceState();
      let count = 0;
      for (let id in state) count += state[id].length;
      setOnlineCount(count > 0 ? count : 1);
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await room.track({ user: callsign, online_at: new Date().toISOString() });
    });
    return () => { supabase.removeChannel(room); };
  }, [callsign]);

  const handleGoogleAuth = async () => {
    if (!isSupabaseConfigured) return alert('Vercel environment variables missing.');
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };

  const saveUsername = async () => {
    if (usernameInput.trim().length < 3) return alert('Username must be at least 3 characters.');
    
    // Check global uniqueness
    const { data: existingUser } = await supabase.from('profiles').select('id').eq('username', usernameInput).maybeSingle();
    if (existingUser && existingUser.id !== user.id) {
      return alert('This callsign is already taken by another player. Please choose another.');
    }

    await supabase.from('profiles').update({ username: usernameInput }).eq('id', user.id);
    setCallsign(usernameInput);
    setNeedsUsername(false);
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); setUser(null); setCallsign(''); };

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none" />
        <div className="relative z-10 bg-slate-800 p-8 sm:p-10 rounded-3xl text-center max-w-md w-full shadow-2xl border-4 border-slate-700">
          <div className="text-6xl mb-4">🌍</div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">TERRATHON</h1>
          <p className="text-slate-400 font-bold text-sm mb-6">Competitive Global Geography Platform</p>
          <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-wider mb-1"><span>🔒 Account Notice</span></div>
            <p className="text-xs font-semibold text-slate-300 leading-relaxed">A <strong>Google Account</strong> is required to save your progress, track your runs on the Strava activity feed, and rank on the world leaderboard.</p>
          </div>
          <button onClick={handleGoogleAuth} className="w-full py-4 px-6 bg-white hover:bg-slate-100 text-slate-900 font-black rounded-2xl transition text-base shadow-xl flex items-center justify-center gap-3 border-2 border-slate-200">
            Sign Up / Log In with Google
          </button>
        </div>
      </main>
    );
  }

  if (needsUsername) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-slate-800 p-8 sm:p-10 rounded-3xl text-center max-w-md w-full shadow-2xl border-4 border-blue-500">
          <div className="text-5xl mb-4">🎖️</div>
          <h2 className="text-3xl font-black mb-2">Claim Your Callsign</h2>
          <p className="text-slate-400 font-bold text-sm mb-6">Choose a globally unique name for the leaderboard.</p>
          <input type="text" placeholder="e.g. GeoMaster99" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full p-4 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-bold text-center mb-6 focus:border-blue-500 focus:outline-none" />
          <button onClick={saveUsername} className="w-full py-4 bg-blue-600 hover:bg-blue-500 font-black rounded-xl transition text-lg shadow-lg">ENTER GAME LOBBY →</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-8">
      {/* Top Navbar */}
      <header className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-center bg-slate-800 p-4 rounded-3xl mb-8 shadow-lg border-2 border-slate-700 gap-4">
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">🌍</div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">TERRATHON</h1>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {onlineCount} Player{onlineCount !== 1 ? 's' : ''} Online
              </div>
            </div>
          </div>
          {/* Time & User Button (Mobile View) */}
          <div className="flex lg:hidden bg-slate-900 rounded-xl p-2 border border-slate-700 text-xs font-black text-slate-300 items-center gap-2">
            <span>🕒 {timeStr}</span> <span className="text-slate-600">|</span> <span className="text-blue-400">{callsign}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <nav className="flex w-full sm:w-auto gap-2 bg-slate-900 p-1 rounded-xl">
            {['hub', 'activity', 'leaderboard'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 sm:flex-none px-5 py-2 rounded-lg font-black text-sm uppercase transition ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>{tab}</button>
            ))}
          </nav>

          <div className="flex w-full sm:w-auto items-center gap-3">
             {/* Time & User Button (Desktop View) */}
            <div className="hidden lg:flex bg-slate-900 rounded-xl px-4 py-2 border border-slate-700 text-sm font-black text-slate-300 items-center gap-3">
              <span>🕒 {timeStr}</span>
              <span className="text-slate-600">|</span>
              <span className="text-blue-400">{callsign}</span>
            </div>
            
            <button onClick={handleSignOut} className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-bold transition border border-slate-700">Sign Out</button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'hub' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-900 to-slate-800 p-8 rounded-3xl border-4 border-blue-500 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none"><GlobeCanvas onSelectMode={() => {}} /></div>
              <div className="relative z-10 mb-6 md:mb-0 text-center md:text-left">
                <span className="bg-blue-500 text-white font-black px-3 py-1 rounded-lg text-xs tracking-widest uppercase mb-3 inline-block">Official Event</span>
                <h2 className="text-4xl font-black mb-2">The Terrathon</h2>
                <p className="text-slate-300 font-bold max-w-md">The ultimate 30-question gauntlet. Capitals, Map Pinpoints, and Geography Trivia.</p>
              </div>
              <button onClick={() => setSelectedMode('terrathon_official')} className="relative z-10 px-10 py-5 bg-white text-blue-900 hover:bg-slate-100 font-black rounded-2xl text-xl transition transform hover:scale-105 shadow-xl">PLAY NOW</button>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-400 mb-4 tracking-wide uppercase">Practice Modes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => setSelectedMode('capital')} className="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 hover:border-blue-500 transition text-left group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏛️</div><h4 className="text-xl font-black text-white">Capitals</h4><p className="text-slate-400 text-sm font-bold mt-1">10 quick-fire capital city matches from 208 nations.</p>
                </button>
                <button onClick={() => setSelectedMode('photoguessr')} className="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 hover:border-blue-500 transition text-left group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📍</div><h4 className="text-xl font-black text-white">MapGuessr</h4><p className="text-slate-400 text-sm font-bold mt-1">Drop a pin on the world map to pinpoint 500 landmark sectors.</p>
                </button>
                <button onClick={() => setSelectedMode('trivia')} className="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 hover:border-blue-500 transition text-left group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🧠</div><h4 className="text-xl font-black text-white">Geo Trivia</h4><p className="text-slate-400 text-sm font-bold mt-1">Test your knowledge against 500 geographic questions.</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && <ActivityFeed userId={user.id} runnerName={callsign} />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </div>

      {selectedMode && <GameRunner mode={selectedMode} userId={user.id} runnerName={callsign} onClose={() => setSelectedMode(null)} />}
    </main>
  );
}