'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import GameRunner from '@/components/GameRunner';
import ActivityFeed from '@/components/ActivityFeed';
import Leaderboard from '@/components/Leaderboard';
import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';

const GlobeCanvas = dynamic(() => import('@/components/GlobeCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] bg-slate-950/90 rounded-3xl border border-cyan-500/20 flex flex-col items-center justify-center text-cyan-400 font-mono text-xs gap-3 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
      <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      <span className="tracking-widest uppercase animate-pulse">Initializing 3D Orbital Projection...</span>
    </div>
  ),
});

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [callsign, setCallsign] = useState<string>('');
  const [onlineAthletes, setOnlineAthletes] = useState<number>(1428);
  const [activeTab, setActiveTab] = useState<'hub' | 'activity' | 'leaderboard'>('hub');
  const [selectedMode, setSelectedMode] = useState<
    'capital' | 'videoguessr' | 'trivia' | 'marathon_practice' | 'terrathon_official' | null
  >(null);

  // Dynamic Online Athlete Counter Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineAthletes((prev) => prev + Math.floor(Math.random() * 7) - 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Strict Supabase Google Auth Session Enforcement
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const savedName =
          session.user.user_metadata?.full_name ||
          session.user.email?.split('@')[0] ||
          '';
        setCallsign(savedName);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const savedName =
          session.user.user_metadata?.full_name ||
          session.user.email?.split('@')[0] ||
          '';
        setCallsign(savedName);
      } else {
        setUser(null);
        setCallsign('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleAuth = async () => {
    if (!isSupabaseConfigured) {
      alert('Vercel environment variables are missing or invalid.');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        alert(`Auth Error: ${error.message}`);
      }
    } catch (err: any) {
      alert(`Initialization Error: ${err?.message || 'OAuth failure'}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCallsign('');
  };

  // --- GATEWAY 1: MANDATORY AUTHENTICATION WALL ---
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Background Grid & Ambient Glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-[0_0_80px_rgba(0,0,0,0.8)] text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-full text-amber-300 text-xs font-mono font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Authentication Required
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent mb-2">
            TERRATHON
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-mono uppercase tracking-wider mb-8">
            Global Competitive Geography Matrix
          </p>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl mb-6 text-left space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>ACTIVE SYSTEM RADAR:</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>ONLINE ATHLETES:</span>
              <span className="text-cyan-400 font-bold">{onlineAthletes.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white hover:bg-slate-100 text-slate-950 font-extrabold rounded-2xl transition shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Authenticate with Google
          </button>

          {/* LIVE VERCEL ENVIRONMENT DIAGNOSTIC */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-left text-[10px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>URL:</span>
              <span className="text-cyan-400 font-bold truncate max-w-[200px]">
                {supabaseUrl ? supabaseUrl : 'NOT SET'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ANON KEY:</span>
              <span className="text-amber-400 font-bold truncate max-w-[200px]">
                {supabaseAnonKey ? `${supabaseAnonKey.slice(0, 10)}...` : 'NOT SET'}
              </span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- STAGE 2: FUTURISTIC 3D HUB ---
  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 max-w-7xl mx-auto relative overflow-hidden font-sans">
      {/* Background Tech Mesh */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

      {/* Header HUD */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-4 sm:p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-slate-950 text-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">TERRATHON</h1>
              <span className="px-2 py-0.5 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-mono text-[10px] uppercase font-bold rounded">
                v2.4 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              CALLSIGN: <span className="text-cyan-400 font-bold">{callsign || 'Athlete'}</span>
            </p>
          </div>
        </div>

        {/* Live Athlete Telemetry Banner */}
        <div className="flex items-center gap-6 bg-slate-950/80 border border-slate-800/80 px-4 py-2 rounded-2xl font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className="text-slate-400 uppercase">Live Athletes:</span>
            <span className="text-amber-400 font-bold text-sm">{onlineAthletes.toLocaleString()}</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <nav className="flex gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('hub')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition ${
                activeTab === 'hub'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3D HUB
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition ${
                activeTab === 'activity'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              STRAVA LOGS
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              RANKINGS
            </button>
          </nav>

          <button
            onClick={handleSignOut}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-2xl text-xs font-mono font-bold transition"
          >
            DISCONNECT
          </button>
        </div>
      </header>

      {/* HUB TAB VIEW */}
      {activeTab === 'hub' && (
        <>
          {/* Official Terrathon Championship Banner */}
          <div className="mb-6 p-6 bg-gradient-to-r from-amber-500/20 via-slate-900 to-cyan-500/10 border border-amber-400/40 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.1)]">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-slate-950 text-[10px] font-mono font-black rounded-md uppercase tracking-widest mb-2 shadow-lg">
                🏆 Sanctioned World Event
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Real Terrathon Championship Run</h2>
              <p className="text-slate-300 text-xs font-sans mt-0.5">
                Official 3-stage timed challenge. Complete all stages to register your score on global leaderboard.
              </p>
            </div>
            <button
              onClick={() => setSelectedMode('terrathon_official')}
              className="relative z-10 px-8 py-4 bg-amber-400 text-slate-950 font-black text-sm rounded-2xl hover:bg-amber-300 transition shadow-[0_0_30px_rgba(245,158,11,0.4)] whitespace-nowrap hover:scale-105 active:scale-95"
            >
              LAUNCH TERRATHON →
            </button>
          </div>

          {/* 3D Earth Globe Viewport */}
          <section className="mb-8 relative z-10">
            <GlobeCanvas onSelectMode={(mode: any) => setSelectedMode(mode)} />
          </section>

          {/* Practice Modes Grid */}
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Timed Practice Simulations
          </h2>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 relative z-10">
            <button
              onClick={() => setSelectedMode('capital')}
              className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl hover:border-amber-400/60 text-left transition duration-300 group hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-xl"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xl mb-3 group-hover:scale-110 transition">
                🏛️
              </div>
              <h3 className="font-extrabold text-lg text-white group-hover:text-amber-400 transition">Capital Match</h3>
              <p className="text-slate-400 text-xs mt-1">Timed matching of world capitals to geographical positions.</p>
            </button>

            <button
              onClick={() => setSelectedMode('videoguessr')}
              className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl hover:border-cyan-400/60 text-left transition duration-300 group hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-xl"
            >
              <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 text-xl mb-3 group-hover:scale-110 transition">
                🎥
              </div>
              <h3 className="font-extrabold text-lg text-white group-hover:text-cyan-400 transition">VideoGuessr</h3>
              <p className="text-slate-400 text-xs mt-1">Identify precise world locations from visual footage clips.</p>
            </button>

            <button
              onClick={() => setSelectedMode('trivia')}
              className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl hover:border-emerald-400/60 text-left transition duration-300 group hover:shadow-[0_0_30px_rgba(52,211,153,0.15)] backdrop-blur-xl"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 text-xl mb-3 group-hover:scale-110 transition">
                🧭
              </div>
              <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-400 transition">GeoTrivia</h3>
              <p className="text-slate-400 text-xs mt-1">Culture, physical landmarks, and environmental trivia.</p>
            </button>

            <button
              onClick={() => setSelectedMode('marathon_practice')}
              className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl hover:border-purple-400/60 text-left transition duration-300 group hover:shadow-[0_0_30px_rgba(192,132,252,0.15)] backdrop-blur-xl"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-400/10 border border-purple-400/30 flex items-center justify-center text-purple-400 text-xl mb-3 group-hover:scale-110 transition">
                ⚡
              </div>
              <h3 className="font-extrabold text-lg text-white group-hover:text-purple-400 transition">3-in-1 Marathon</h3>
              <p className="text-slate-400 text-xs mt-1">Practice endurance run through all three stages at once.</p>
            </button>
          </section>
        </>
      )}

      {/* STRAVA ACTIVITY TAB VIEW */}
      {activeTab === 'activity' && <ActivityFeed userId={user.id} runnerName={callsign} />}

      {/* LEADERBOARD TAB VIEW */}
      {activeTab === 'leaderboard' && <Leaderboard />}

      {/* ACTIVE TIMED GAME OVERLAY */}
      {selectedMode && (
        <GameRunner
          mode={selectedMode}
          userId={user.id}
          runnerName={callsign}
          onClose={() => setSelectedMode(null)}
        />
      )}
    </main>
  );
}