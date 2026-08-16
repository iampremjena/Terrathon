'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if session is already established
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/');
      }
    });

    // Listen for the PKCE code exchange to complete in browser storage
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

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