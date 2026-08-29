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

// ----------------------------------------------------------------------------
// STAGE 2: AI BACKEND YOUTUBE SEARCH ENGINE
// ----------------------------------------------------------------------------
const WORLD_CITIES = [
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, clue: "Bustling metropolis in East Asia" },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, clue: "Historic European capital along the Seine" },
  { name: "New York City", country: "USA", lat: 40.7128, lng: -74.0060, clue: "Densely populated coastal city in North America" },
  { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964, clue: "Ancient Mediterranean city built on seven hills" },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.8909, clue: "Famous canal-lined European capital" },
  { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, clue: "Historic capital along the River Thames" },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, clue: "Modern city in the Arabian desert" },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, clue: "Harbor city in the Southern Hemisphere" },
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729, clue: "Coastal city surrounded by mountain peaks" },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, clue: "Sprawling capital near ancient pyramids" }
];

async function fetchDynamicYouTubeWalkthroughs() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const selectedCities = shuffle(WORLD_CITIES).slice(0, 10);

  const videoQuestions = await Promise.all(
    selectedCities.map(async (city, idx) => {
      let youtubeId = "XqZsoesa55w"; // Fallback Paris tour ID

      if (apiKey) {
        try {
          // Construct precise search query
          const query = `${city.name} ${city.country} city walk 4k walkthrough`;
          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&videoDuration=long&maxResults=3&key=${apiKey}`;

          const res = await fetch(searchUrl, { next: { revalidate: 0 } });
          if (res.ok) {
            const data = await res.json();
            if (data.items && data.items.length > 0) {
              // Pick a random result from top 3 matching embeddable videos
              const item = data.items[Math.floor(Math.random() * data.items.length)];
              youtubeId = item.id.videoId;
            }
          }
        } catch (err) {
          console.warn(`YouTube search failed for ${city.name}, using fallback.`);
        }
      }

      return {
        id: `video_dyn_${idx}`,
        locationName: `${city.name}, ${city.country}`,
        country: city.country,
        youtubeId: youtubeId,
        startTime: 120, // Start 2 minutes into video to skip intro screens
        coordinates: { lat: city.lat, lng: city.lng },
        clue: city.clue
      };
    })
  );

  return videoQuestions;
}

// ----------------------------------------------------------------------------
// API ROUTE HANDLER
// ----------------------------------------------------------------------------
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'terrathon_official';

  let photos: any[] = [];
  
  if (mode === 'photoguessr' || mode === 'terrathon_official') {
    photos = await fetchDynamicYouTubeWalkthroughs();
  }

  return NextResponse.json({ capitals: [], photos, trivias: [] });
}