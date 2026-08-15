import { supabase } from '@/lib/supabase';

export interface SplitMetric {
  questionNumber: number;
  questionType: 'capital' | 'videoguessr' | 'trivia';
  timeTakenMs: number;
  distanceErrorKm?: number;
  isCorrect: boolean;
}

export interface RunActivityPayload {
  userId: string;
  mode: 'capital' | 'videoguessr' | 'trivia' | 'marathon_practice' | 'terrathon_official';
  isProctored: boolean;
  totalTimeMs: number;
  accuracyPercentage: number;
  avgPinErrorKm?: number;
  score: number;
  proctorFlagged?: boolean;
  splits: SplitMetric[];
}

/**
 * Log a completed run activity to Supabase
 */
export async function recordRunActivity(payload: RunActivityPayload) {
  const { data, error } = await supabase
    .from('run_activities')
    .insert([
      {
        user_id: payload.userId,
        mode: payload.mode,
        is_proctored: payload.isProctored,
        total_time_ms: payload.totalTimeMs,
        accuracy_percentage: payload.accuracyPercentage,
        avg_pin_error_km: payload.avgPinErrorKm || 0.0,
        score: payload.score,
        proctor_flagged: payload.proctorFlagged || false,
        splits: payload.splits,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error logging run activity:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch Strava-style activity history feed for a given user
 */
export async function getUserActivityFeed(userId: string) {
  const { data, error } = await supabase
    .from('run_activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user activity feed:', error);
    throw error;
  }

  return data;
}