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
// STAGE 1: CAPITALS (Remote Fetch with Guaranteed Fallback)
// ----------------------------------------------------------------------------
async function fetchCapitals() {
  const headers = { 'User-Agent': 'TerrathonApp/1.0', 'Accept': 'application/json' };

  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,latlng', { 
      headers, 
      signal: AbortSignal.timeout(3000) 
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
    console.warn("RestCountries API connection dropped, using fallback pool.");
  }

  // Backup Pool if API drops connection
  const FALLBACK_CAPITALS = [
    { country: 'Japan', capital: 'Tokyo', region: 'Asia', lat: 35.6762, lng: 139.6503 },
    { country: 'France', capital: 'Paris', region: 'Europe', lat: 48.8566, lng: 2.3522 },
    { country: 'Brazil', capital: 'Brasília', region: 'South America', lat: -15.7975, lng: -47.8919 },
    { country: 'Australia', capital: 'Canberra', region: 'Oceania', lat: -35.2809, lng: 149.1300 },
    { country: 'Egypt', capital: 'Cairo', region: 'Africa', lat: 30.0444, lng: 31.2357 },
    { country: 'Canada', capital: 'Ottawa', region: 'North America', lat: 45.4215, lng: -75.6972 },
    { country: 'Germany', capital: 'Berlin', region: 'Europe', lat: 52.5200, lng: 13.4050 },
    { country: 'India', capital: 'New Delhi', region: 'Asia', lat: 28.6139, lng: 77.2090 },
    { country: 'Italy', capital: 'Rome', region: 'Europe', lat: 41.9028, lng: 12.4964 },
    { country: 'Argentina', capital: 'Buenos Aires', region: 'South America', lat: -34.6037, lng: -58.3816 }
  ];

  const allCap = FALLBACK_CAPITALS.map(c => c.capital);
  return shuffle(FALLBACK_CAPITALS).map((c, idx) => ({
    id: `cap_fb_${idx}`,
    country: c.country,
    capital: c.capital,
    continent: c.region,
    coordinates: { lat: c.lat, lng: c.lng },
    options: shuffle([c.capital, ...shuffle(allCap.filter(cap => cap !== c.capital)).slice(0, 3)])
  }));
}

// ----------------------------------------------------------------------------
// STAGE 2: DYNAMIC YOUTUBE WALKTHROUGHS
// ----------------------------------------------------------------------------
const WORLD_CITIES = [
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, clue: "Bustling metropolis in East Asia" },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, clue: "Historic European capital along the Seine" },
  { name: "New York City", country: "USA", lat: 40.7128, lng: -74.0060, clue: "Densely populated coastal city in North America" },
  { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964, clue: "Ancient Mediterranean city built on seven hills" },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.8909, clue: "Famous canal-lined European capital" },
  { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, clue: "Historic capital along the River Thames" },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, clue: "Modern city in the Arabian desert" },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, clue: "Harbor city in the Southern Hemisphere" }
];

async function fetchPhotos() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const selectedCities = shuffle(WORLD_CITIES).slice(0, 10);

  return Promise.all(
    selectedCities.map(async (city, idx) => {
      let youtubeId = "XqZsoesa55w"; 

      if (apiKey) {
        try {
          const query = `${city.name} ${city.country} city walk 4k walkthrough`;
          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&videoDuration=long&maxResults=3&key=${apiKey}`;
          const res = await fetch(searchUrl, { signal: AbortSignal.timeout(3000) });
          if (res.ok) {
            const data = await res.json();
            if (data.items && data.items.length > 0) {
              const item = data.items[Math.floor(Math.random() * data.items.length)];
              youtubeId = item.id.videoId;
            }
          }
        } catch (err) {
          console.warn(`YouTube search failed for ${city.name}`);
        }
      }

      return {
        id: `video_dyn_${idx}`,
        locationName: `${city.name}, ${city.country}`,
        country: city.country,
        youtubeId: youtubeId,
        startTime: 120,
        coordinates: { lat: city.lat, lng: city.lng },
        clue: city.clue
      };
    })
  );
}

// ----------------------------------------------------------------------------
// STAGE 3: TRIVIA (Remote Fetch with Guaranteed Fallback)
// ----------------------------------------------------------------------------
async function fetchTrivia() {
  const headers = { 'User-Agent': 'TerrathonApp/1.0' };

  try {
    const tdbRes = await fetch('https://opentdb.com/api.php?amount=10&category=22&type=multiple', { 
      headers, 
      signal: AbortSignal.timeout(3000) 
    });
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
    console.warn("Trivia API connection dropped, using fallback pool.");
  }

  // Fallback Trivia Pool
  const FALLBACK_TRIVIA = [
    { question: "What is the longest river in the world?", options: ["Nile", "Amazon", "Yangtze", "Mississippi"], correctAnswer: "Nile" },
    { question: "Which country has the most natural lakes?", options: ["Canada", "Russia", "USA", "Finland"], correctAnswer: "Canada" },
    { question: "What is the smallest independent country in the world?", options: ["Vatican City", "Monaco", "Nauru", "San Marino"], correctAnswer: "Vatican City" },
    { question: "Which ocean is the largest by surface area?", options: ["Pacific", "Atlantic", "Indian", "Arctic"], correctAnswer: "Pacific" },
    { question: "Mount Everest is located in which mountain range?", options: ["Himalayas", "Andes", "Alps", "Rockies"], correctAnswer: "Himalayas" }
  ];

  return FALLBACK_TRIVIA.map((t, idx) => ({
    id: `triv_fb_${idx}`,
    question: t.question,
    options: shuffle([...t.options]),
    correctAnswer: t.correctAnswer,
    category: 'Geography'
  }));
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