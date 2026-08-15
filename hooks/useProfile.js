import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error) setProfile(data);
      setLoading(false);
    }

    fetchProfile();
  }, [userId]);

  return { profile, loading };
}