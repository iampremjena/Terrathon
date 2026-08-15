'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trophy, Users, Play, ShieldCheck, Flame } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  username: string
  final_score: number
  total_time_ms: number
  completed_at: string
}

export default function Home() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [onlineCount, setOnlineCount] = useState<number>(1)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const channel = supabase.channel('online-players')

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    fetchLeaderboard()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('game_attempts')
      .select('id, total_time_ms, final_score, completed_at, profiles(username)')
      .eq('is_official', true)
      .eq('was_disqualified', false)
      .order('final_score', { ascending: false })
      .limit(10)

    if (!error && data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        username: item.profiles?.username || 'Anonymous',
        final_score: item.final_score,
        total_time_ms: item.total_time_ms,
        completed_at: item.completed_at,
      }))
      setLeaderboard(formatted)
    }
  }

  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    setError('')

    localStorage.setItem('terrathon_username', username.trim())
    router.push('/game')
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start p-6 font-sans">
      <header className="w-full max-w-4xl flex justify-between items-center py-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Flame className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-black tracking-wider text-amber-500 uppercase">Terrathon</h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full text-sm font-semibold">
          <Users className="w-4 h-4 text-emerald-400" />
          <span><strong className="text-emerald-400">{onlineCount}</strong> Athletes Online</span>
        </div>
      </header>

      <div className="w-full max-w-4xl my-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-extrabold leading-tight">
            3 Stages. 208 Countries. <br />
            <span className="text-amber-500">One Global Champ.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Test your global speed across 20 Capitals, Video Pinpoint Geolocation, and World Trivia in a continuous timed sprint.
          </p>

          <form onSubmit={handleStartGame} className="flex flex-col gap-3 mt-2">
            <input
              type="text"
              placeholder="Enter unique athlete handle..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 font-medium"
              required
              minLength={3}
              maxLength={15}
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>{loading ? 'Entering Arena...' : 'START TERRATHON RUN'}</span>
            </button>
          </form>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Proctored Official Mode enforces fullscreen & anti-tab switching.</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold uppercase tracking-wider text-sm">Global Leaderboard</h3>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No official records set yet. Be the first!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between bg-slate-950/50 px-3.5 py-2.5 rounded-lg border border-slate-800/60 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-black w-4 text-right ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-700' : 'text-slate-600'}`}>
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200">{entry.username}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">{formatTime(entry.total_time_ms)}</span>
                    <span className="font-bold text-amber-500">{entry.final_score} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}