'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check for error parameters in URL query string or hash fragment
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      const error = urlParams.get('error') || hashParams.get('error');
      const errorDesc =
        urlParams.get('error_description') || hashParams.get('error_description');

      if (error || errorDesc) {
        setErrorMessage(
          errorDesc || error || 'An unexpected error occurred during Google authentication.'
        );
        return;
      }
    }

    // 2. Verify established auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/');
      }
    });

    // 3. Listen for active session state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-slate-900/80 border border-rose-500/40 rounded-3xl p-8 max-w-md w-full text-center backdrop-blur-xl shadow-[0_0_50px_rgba(244,63,94,0.15)]">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-2xl mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-black text-rose-400 mb-2 uppercase tracking-wide">
            Authentication Error
          </h2>
          <p className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 text-left break-words">
            {errorMessage}
          </p>
          <a
            href="/"
            className="inline-block w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-2xl transition text-xs font-mono tracking-wider shadow-lg"
          >
            RETURN TO HUB LOGIN →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-mono text-xs">
      <div className="w-10 h-10 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mb-4" />
      <p className="text-amber-400 font-bold animate-pulse uppercase tracking-widest">
        AUTHENTICATING ORBITAL CALLSIGN...
      </p>
      <p className="text-slate-500 text-[10px] mt-2">Syncing session tokens with Terrathon Matrix</p>
    </div>
  );
}