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
async function fetchPhotos() {
  // Diverse seed locations spanning continents to generate live photo targets
  const LANDMARKS = [
    { name: "Eiffel Tower", country: "France", lat: 48.8584, lng: 2.2945, query: "eiffel-tower" },
    { name: "Taj Mahal", country: "India", lat: 27.1751, lng: 78.0421, query: "taj-mahal" },
    { name: "Colosseum", country: "Italy", lat: 41.8902, lng: 12.4922, query: "colosseum-rome" },
    { name: "Statue of Liberty", country: "USA", lat: 40.6892, lng: -74.0445, query: "statue-of-liberty" },
    { name: "Big Ben", country: "UK", lat: 51.5007, lng: -0.1246, query: "big-ben-london" },
    { name: "Sydney Opera House", country: "Australia", lat: -33.8568, lng: 151.2153, query: "sydney-opera-house" },
    { name: "Machu Picchu", country: "Peru", lat: -13.1631, lng: -72.5450, query: "machu-picchu" },
    { name: "Burj Khalifa", country: "UAE", lat: 25.1972, lng: 55.2744, query: "burj-khalifa" },
    { name: "Mount Fuji", country: "Japan", lat: 35.3606, lng: 138.7274, query: "mount-fuji" },
    { name: "Pyramids of Giza", country: "Egypt", lat: 29.9792, lng: 31.1342, query: "pyramids-giza" },
    { name: "Christ the Redeemer", country: "Brazil", lat: -22.9519, lng: -43.2105, query: "christ-the-redeemer" },
    { name: "Sagrada Familia", country: "Spain", lat: 41.4036, lng: 2.1744, query: "sagrada-familia" },
    { name: "Golden Gate Bridge", country: "USA", lat: 37.8199, lng: -122.4783, query: "golden-gate-bridge" },
    { name: "Neuschwanstein Castle", country: "Germany", lat: 47.5576, lng: 10.7498, query: "neuschwanstein" },
    { name: "Petra", country: "Jordan", lat: 30.3285, lng: 35.4444, query: "petra-jordan" },
    { name: "Acropolis of Athens", country: "Greece", lat: 37.9715, lng: 23.7257, query: "acropolis-athens" },
    { name: "Chichen Itza", country: "Mexico", lat: 20.6843, lng: -88.5678, query: "chichen-itza" },
    { name: "Bran Castle", country: "Romania", lat: 45.5149, lng: 25.3672, query: "bran-castle" }
  ];

  const selected = shuffle(LANDMARKS).slice(0, 10);

  return selected.map((item, idx) => {
    // Unsplash Source CDN URL generates fresh high-res photo dynamically per query
    const imgUrl = `https://source.unsplash.com/featured/1200x800/?${encodeURIComponent(item.query)}`;
    return {
      id: `photo_${idx}`,
      locationName: item.name,
      country: item.country,
      imageUrl: imgUrl,
      fallbackUrl: imgUrl,
      coordinates: { lat: item.lat, lng: item.lng },
      clue: `Located in ${item.country}`
    };
  });
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