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

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const checkUser = async (sessionUser: any) => {
      setUser(sessionUser);
      if (sessionUser) {
        // Fetch profile to see if they have a real username set
        const { data } = await supabase.from('profiles').select('username').eq('id', sessionUser.id).single();
        if (!data?.username || data.username.startsWith('Runner_')) {
          setNeedsUsername(true);
        } else {
          setCallsign(data.username);
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => checkUser(session?.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => checkUser(session?.user));

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleAuth = async () => {
    if (!isSupabaseConfigured) return alert('Vercel environment variables missing.');
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };

  const saveUsername = async () => {
    if (usernameInput.trim().length < 3) return alert('Username must be at least 3 characters.');
    await supabase.from('profiles').update({ username: usernameInput }).eq('id', user.id);
    setCallsign(usernameInput);
    setNeedsUsername(false);
  };

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-slate-800 p-10 rounded-3xl text-center max-w-sm w-full shadow-2xl border-4 border-slate-700">
          <div className="text-6xl mb-6">🌍</div>
          <h1 className="text-5xl font-black tracking-tight mb-2">TERRATHON</h1>
          <p className="text-slate-400 font-bold mb-8">The Ultimate Geography Game</p>
          <button
            onClick={handleGoogleAuth}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition text-lg shadow-lg"
          >
            PLAY NOW
          </button>
        </div>
      </main>
    );
  }

  // --- USERNAME SETUP MODAL ---
  if (needsUsername) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-slate-800 p-10 rounded-3xl text-center max-w-md w-full shadow-2xl border-4 border-blue-500">
          <h2 className="text-3xl font-black mb-4">Choose Your Callsign</h2>
          <p className="text-slate-400 font-bold mb-6">How should you appear on the leaderboard?</p>
          <input 
            type="text" 
            placeholder="Enter username..." 
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-bold text-center mb-6 focus:border-blue-500 focus:outline-none"
          />
          <button onClick={saveUsername} className="w-full py-4 bg-blue-600 hover:bg-blue-500 font-black rounded-xl transition text-lg">
            SAVE & ENTER
          </button>
        </div>
      </main>
    );
  }

  // --- MAIN GAME LOBBY ---
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-8">
      
      {/* Top Navbar */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center bg-slate-800 p-4 rounded-3xl mb-8 shadow-lg border-2 border-slate-700">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">🌍</div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">TERRATHON</h1>
            <p className="text-sm text-slate-400 font-bold">Welcome, {callsign}</p>
          </div>
        </div>

        <nav className="flex gap-2 bg-slate-900 p-1 rounded-xl">
          {['hub', 'activity', 'leaderboard'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-lg font-black text-sm uppercase transition ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'hub' && (
          <div className="space-y-8">
            
            {/* Hero Main Game Card */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-800 p-8 rounded-3xl border-4 border-blue-500 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                {/* FIX: Passed dummy function to onSelectMode to satisfy TypeScript */}
                <GlobeCanvas onSelectMode={() => {}} />
              </div>
              <div className="relative z-10 mb-6 md:mb-0 text-center md:text-left">
                <span className="bg-blue-500 text-white font-black px-3 py-1 rounded-lg text-xs tracking-widest uppercase mb-3 inline-block">Official Run</span>
                <h2 className="text-4xl font-black mb-2">The Terrathon</h2>
                <p className="text-slate-300 font-bold max-w-md">The ultimate 30-question gauntlet. Capitals, Map Pinpoints, and Trivia.</p>
              </div>
              <button
                onClick={() => setSelectedMode('terrathon_official')}
                className="relative z-10 px-10 py-5 bg-white text-blue-900 hover:bg-slate-100 font-black rounded-2xl text-xl transition transform hover:scale-105 shadow-xl"
              >
                PLAY NOW
              </button>
            </div>

            {/* Practice Modes */}
            <div>
              <h3 className="text-xl font-black text-slate-400 mb-4 tracking-wide uppercase">Practice Modes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <button onClick={() => setSelectedMode('capital')} className="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 hover:border-blue-500 transition text-left group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏛️</div>
                  <h4 className="text-xl font-black text-white">Capitals</h4>
                  <p className="text-slate-400 text-sm font-bold mt-1">10 quick-fire capital city matches.</p>
                </button>

                <button onClick={() => setSelectedMode('photoguessr')} className="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 hover:border-blue-500 transition text-left group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📍</div>
                  <h4 className="text-xl font-black text-white">MapGuessr</h4>
                  <p className="text-slate-400 text-sm font-bold mt-1">Drop a pin on the map to guess the photo location.</p>
                </button>

                <button onClick={() => setSelectedMode('trivia')} className="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 hover:border-blue-500 transition text-left group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🧠</div>
                  <h4 className="text-xl font-black text-white">Geo Trivia</h4>
                  <p className="text-slate-400 text-sm font-bold mt-1">Test your raw geography knowledge.</p>
                </button>

              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && <ActivityFeed userId={user.id} runnerName={callsign} />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </div>

      {selectedMode && (
        <GameRunner mode={selectedMode} userId={user.id} runnerName={callsign} onClose={() => setSelectedMode(null)} />
      )}
    </main>
  );
}