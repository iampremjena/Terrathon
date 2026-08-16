import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useOnlinePresence(userId?: string, username?: string) {
  const [onlineCount, setOnlineCount] = useState<number>(1);

  useEffect(() => {
    const channel = supabase.channel('online-athletes', {
      config: {
        presence: {
          key: userId || `guest_${Math.random().toString(36).substring(7)}`,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count > 0 ? count : 1);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            username: username || 'Athlete',
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, username]);

  return onlineCount;
}