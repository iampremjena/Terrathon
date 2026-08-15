import { useEffect, useState } from 'react';
import { getUserActivityFeed } from '@/lib/telemetry';

export function useActivityFeed(userId?: string) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Guard clause: do not attempt to fetch feed if userId is missing
    if (!userId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    async function loadFeed(id: string) {
      try {
        const feed = await getUserActivityFeed(id);
        setActivities(feed || []);
      } catch (err) {
        console.error('Failed to load activity feed:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFeed(userId);
  }, [userId]);

  return { activities, loading };
}