import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// ----------------------------------------------------------------------------
// STAGE 1: Dynamic Capitals (Dual-API Failover)
// ----------------------------------------------------------------------------
async function fetchCapitals() {
  const headers = { 'User-Agent': 'TerrathonApp/1.0', 'Accept': 'application/json' };

  // Primary API: REST Countries
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,latlng', { 
      headers, 
      signal: AbortSignal.timeout(4000) 
    });
    if (res.ok) {
      const data = await res.json();
      const valid: any[] = data.filter((c: any) => c.capital && c.capital.length > 0 && c.latlng && c.latlng.length === 2);
      if (valid.length > 10) {
        const allCapitals = valid.map((c: any) => c.capital[0]);
        const selected = shuffle(valid).slice(0, 10);
        return selected.map((c: any, idx: number) => {
          const correct = c.capital[0];
          const distractors = shuffle(allCapitals.filter((cap: string) => cap !== correct)).slice(0, 3);
          return {
            id: `cap_${idx}`,
            country: c.name.common,
            capital: correct,
            continent: c.region || 'World',
            coordinates: { lat: c.latlng[0], lng: c.latlng[1] },
            options: shuffle([correct, ...distractors]),
          };
        });
      }
    }
  } catch (e) {
    console.warn("Primary Capitals API failed, switching to backup...");
  }

  // Backup API: CountriesNow API
  try {
    const backupRes = await fetch('https://countriesnow.space/api/v0.1/countries/capital', { signal: AbortSignal.timeout(4000) });
    if (backupRes.ok) {
      const json = await backupRes.json();
      const valid = json.data.filter((c: any) => c.capital && c.name);
      const allCapitals = valid.map((c: any) => c.capital);
      const selected = shuffle(valid).slice(0, 10);
      return selected.map((c: any, idx: number) => {
        const correct = c.capital;
        const distractors = shuffle(allCapitals.filter((cap: string) => cap !== correct)).slice(0, 3);
        return {
          id: `cap_bkp_${idx}`,
          country: c.name,
          capital: correct,
          continent: 'World',
          coordinates: { lat: 20.0, lng: 0.0 },
          options: shuffle([correct, ...distractors]),
        };
      });
    }
  } catch (e) {
    console.error("Backup Capitals API failed as well.");
  }

  return [];
}

// ----------------------------------------------------------------------------
// STAGE 2: Dynamic Photos (Unsplash High-Speed Open CDN)
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// STAGE 2: Dynamic Photos (Direct High-Speed Unsplash CDN Links)
// ----------------------------------------------------------------------------
// Replace the Stage 2 Video Walkthrough fetcher in app/api/questions/route.ts:

async function fetchPhotos() {
  const VIDEO_WALKTHROUGHS = [
    { 
      name: "Shibuya Crossing, Tokyo", 
      country: "Japan", 
      lat: 35.6595, 
      lng: 139.7004, 
      youtubeId: "h1sK6j0N4_Y", 
      startTime: 30,
      clue: "Massive neon-lit pedestrian intersection in Asia" 
    },
    { 
      name: "Eiffel Tower Promenade, Paris", 
      country: "France", 
      lat: 48.8584, 
      lng: 2.2945, 
      youtubeId: "XqZsoesa55w", 
      startTime: 45,
      clue: "Iconic iron lattice landmark along the Seine River" 
    },
    { 
      name: "Times Square, New York City", 
      country: "USA", 
      lat: 40.7580, 
      lng: -73.9855, 
      youtubeId: "mRe-514tGMg", 
      startTime: 15,
      clue: "Major commercial intersection in Midtown Manhattan" 
    },
    { 
      name: "Venice Canals & St. Mark's Square", 
      country: "Italy", 
      lat: 45.4342, 
      lng: 12.3385, 
      youtubeId: "kRcAaqX4U1Y", 
      startTime: 60,
      clue: "Historic island city connected by grand canals" 
    },
    { 
      name: "Amsterdam Canal Belt", 
      country: "Netherlands", 
      lat: 52.3676, 
      lng: 4.8909, 
      youtubeId: "1-J_08U6S64", 
      startTime: 20,
      clue: "Capital city famous for narrow gabled houses and bicycle paths" 
    },
    { 
      name: "Piccadilly Circus, London", 
      country: "UK", 
      lat: 51.5100, 
      lng: -0.1342, 
      youtubeId: "H4v7gWd5_jE", 
      startTime: 40,
      clue: "Historic junction connecting Regent Street and Shaftesbury Avenue" 
    },
    { 
      name: "Santorini Oia Walkway", 
      country: "Greece", 
      lat: 36.4618, 
      lng: 25.3753, 
      youtubeId: "8x8X1dG-S_M", 
      startTime: 10,
      clue: "Whitewashed Aegean village built into volcanic cliffs" 
    },
    { 
      name: "Dubai Marina Promenade", 
      country: "UAE", 
      lat: 25.0772, 
      lng: 55.1390, 
      youtubeId: "q1k8xO9bXyE", 
      startTime: 50,
      clue: "Ultra-modern waterfront district surrounded by skyscrapers" 
    }
  ];

  const selected = shuffle(VIDEO_WALKTHROUGHS).slice(0, 10);

  return selected.map((item, idx) => ({
    id: `video_${idx}`,
    locationName: item.name,
    country: item.country,
    youtubeId: item.youtubeId,
    startTime: item.startTime,
    coordinates: { lat: item.lat, lng: item.lng },
    clue: item.clue
  }));
}

// ----------------------------------------------------------------------------
// STAGE 3: Dynamic Trivia (OpenTDB + Trivia API Failover)
// ----------------------------------------------------------------------------
async function fetchTrivia() {
  const headers = { 'User-Agent': 'TerrathonApp/1.0' };

  try {
    const tdbRes = await fetch('https://opentdb.com/api.php?amount=10&category=22&type=multiple', { headers, signal: AbortSignal.timeout(4000) });
    if (tdbRes.ok) {
      const tdbData = await tdbRes.json();
      if (tdbData.results && tdbData.results.length > 0) {
        return tdbData.results.map((q: any, idx: number) => {
          const decQ = decodeHTMLEntities(q.question);
          const decC = decodeHTMLEntities(q.correct_answer);
          const decI = q.incorrect_answers.map((ans: string) => decodeHTMLEntities(ans));
          return {
            id: `triv_${idx}`,
            question: decQ,
            options: shuffle([decC, ...decI]),
            correctAnswer: decC,
            category: 'Geography',
          };
        });
      }
    }
  } catch (e) {
    console.warn("Primary Trivia API failed, switching to backup...");
  }

  try {
    const backupRes = await fetch('https://the-trivia-api.com/v2/questions?categories=geography&limit=10', { headers, signal: AbortSignal.timeout(4000) });
    if (backupRes.ok) {
      const backupData = await backupRes.json();
      return backupData.map((q: any, idx: number) => ({
        id: `triv_bkp_${idx}`,
        question: q.question.text,
        options: shuffle([q.correctAnswer, ...q.incorrectAnswers]),
        correctAnswer: q.correctAnswer,
        category: 'Geography',
      }));
    }
  } catch (e) {
    console.error("Backup Trivia API failed.");
  }

  return [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'terrathon_official';

  let capitals: any[] = [];
  let photos: any[] = [];
  let trivias: any[] = [];

  if (mode === 'capital' || mode === 'terrathon_official') {
    capitals = await fetchCapitals();
  }
  if (mode === 'photoguessr' || mode === 'terrathon_official') {
    photos = await fetchPhotos();
  }
  if (mode === 'trivia' || mode === 'terrathon_official') {
    trivias = await fetchTrivia();
  }

  return NextResponse.json({ capitals, photos, trivias });
}