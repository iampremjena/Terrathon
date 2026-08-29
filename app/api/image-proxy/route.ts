import { NextResponse } from 'next/server';

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
// STAGE 1: Dynamic Capitals (Fetched via Server)
// ----------------------------------------------------------------------------
async function getDynamicCapitals() {
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,latlng', {
      headers: { 'User-Agent': 'TerrathonApp/1.0' },
      next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error('Countries API failed');
    const data = await res.json();
    const valid = data.filter((c: any) => c.capital && c.capital.length > 0 && c.latlng && c.latlng.length === 2);
    const selected = shuffle(valid).slice(0, 10);
    const allCapitals = valid.map((c: any) => c.capital[0]);

    return selected.map((c: any, idx: number) => {
      const correct = c.capital[0];
      const distractors = shuffle(allCapitals.filter((cap: string) => cap !== correct)).slice(0, 3);
      return {
        id: `cap_dyn_${idx}`,
        country: c.name.common,
        capital: correct,
        continent: c.region || 'World',
        coordinates: { lat: c.latlng[0], lng: c.latlng[1] },
        options: shuffle([correct, ...distractors]),
      };
    });
  } catch (e) {
    // High-reliability static fallback if remote server is unreachable
    return [
      { id: 'cap_fb_1', country: 'Japan', capital: 'Tokyo', continent: 'Asia', coordinates: { lat: 35.6762, lng: 139.6503 }, options: shuffle(['Tokyo', 'Kyoto', 'Osaka', 'Seoul']) },
      { id: 'cap_fb_2', country: 'France', capital: 'Paris', continent: 'Europe', coordinates: { lat: 48.8566, lng: 2.3522 }, options: shuffle(['Paris', 'Lyon', 'Marseille', 'Brussels']) },
      { id: 'cap_fb_3', country: 'Brazil', capital: 'Brasília', continent: 'South America', coordinates: { lat: -15.7975, lng: -47.8919 }, options: shuffle(['Brasília', 'Rio de Janeiro', 'São Paulo', 'Buenos Aires']) },
      { id: 'cap_fb_4', country: 'Australia', capital: 'Canberra', continent: 'Oceania', coordinates: { lat: -35.2809, lng: 149.1300 }, options: shuffle(['Canberra', 'Sydney', 'Melbourne', 'Auckland']) },
      { id: 'cap_fb_5', country: 'Egypt', capital: 'Cairo', continent: 'Africa', coordinates: { lat: 30.0444, lng: 31.2357 }, options: shuffle(['Cairo', 'Alexandria', 'Giza', 'Khartoum']) },
    ];
  }
}

// ----------------------------------------------------------------------------
// STAGE 2: Dynamic Photos (Direct Unsplash/Pexels CDN Links)
// ----------------------------------------------------------------------------
async function getDynamicPhotos() {
  // Diverse pool of 30 global landmarks with direct open CDN images
  const GLOBAL_LANDMARKS_POOL = [
    { name: "Eiffel Tower", country: "France", lat: 48.8584, lng: 2.2945, img: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1000&q=80" },
    { name: "Taj Mahal", country: "India", lat: 27.1751, lng: 78.0421, img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1000&q=80" },
    { name: "Colosseum", country: "Italy", lat: 41.8902, lng: 12.4922, img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1000&q=80" },
    { name: "Statue of Liberty", country: "USA", lat: 40.6892, lng: -74.0445, img: "https://images.unsplash.com/photo-1605130284535-11dd9ede6523?w=1000&q=80" },
    { name: "Big Ben", country: "UK", lat: 51.5007, lng: -0.1246, img: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1000&q=80" },
    { name: "Sydney Opera House", country: "Australia", lat: -33.8568, lng: 151.2153, img: "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=1000&q=80" },
    { name: "Machu Picchu", country: "Peru", lat: -13.1631, lng: -72.5450, img: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1000&q=80" },
    { name: "Burj Khalifa", country: "UAE", lat: 25.1972, lng: 55.2744, img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=80" },
    { name: "Mount Fuji", country: "Japan", lat: 35.3606, lng: 138.7274, img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&q=80" },
    { name: "Pyramids of Giza", country: "Egypt", lat: 29.9792, lng: 31.1342, img: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1000&q=80" },
    { name: "Christ the Redeemer", country: "Brazil", lat: -22.9519, lng: -43.2105, img: "https://images.unsplash.com/photo-1594741158704-5a784b8e59fb?w=1000&q=80" },
    { name: "Sagrada Familia", country: "Spain", lat: 41.4036, lng: 2.1744, img: "https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=1000&q=80" },
    { name: "Golden Gate Bridge", country: "USA", lat: 37.8199, lng: -122.4783, img: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1000&q=80" },
    { name: "Neuschwanstein Castle", country: "Germany", lat: 47.5576, lng: 10.7498, img: "https://images.unsplash.com/photo-1534313314376-a72289b6181e?w=1000&q=80" },
    { name: "Petra", country: "Jordan", lat: 30.3285, lng: 35.4444, img: "https://images.unsplash.com/photo-1579606030136-58a011a6878e?w=1000&q=80" },
  ];

  const selected = shuffle(GLOBAL_LANDMARKS_POOL).slice(0, 10);
  return selected.map((item, idx) => ({
    id: `photo_dyn_${idx}`,
    locationName: item.name,
    country: item.country,
    imageUrl: item.img,
    fallbackUrl: item.img,
    coordinates: { lat: item.lat, lng: item.lng },
    clue: `Located in ${item.country}`
  }));
}

// ----------------------------------------------------------------------------
// STAGE 3: Dynamic Trivia (Open Trivia DB via Server)
// ----------------------------------------------------------------------------
async function getDynamicTrivia() {
  try {
    const res = await fetch('https://opentdb.com/api.php?amount=10&category=22&type=multiple', {
      next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error('Trivia API failed');
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results.map((q: any, idx: number) => {
        const decQ = decodeHTMLEntities(q.question);
        const decC = decodeHTMLEntities(q.correct_answer);
        const decI = q.incorrect_answers.map((ans: string) => decodeHTMLEntities(ans));
        return {
          id: `triv_dyn_${idx}`,
          question: decQ,
          options: shuffle([decC, ...decI]),
          correctAnswer: decC,
          category: q.category || 'Geography',
        };
      });
    }
    throw new Error('No trivia results');
  } catch (e) {
    return [
      { id: 'triv_fb_1', question: 'What is the longest river in the world?', options: shuffle(['Nile', 'Amazon', 'Yangtze', 'Mississippi']), correctAnswer: 'Nile', category: 'Geography' },
      { id: 'triv_fb_2', question: 'Which country has the most natural lakes?', options: shuffle(['Canada', 'Russia', 'USA', 'Finland']), correctAnswer: 'Canada', category: 'Geography' },
      { id: 'triv_fb_3', question: 'What is the smallest independent country in the world?', options: shuffle(['Vatican City', 'Monaco', 'Nauru', 'San Marino']), correctAnswer: 'Vatican City', category: 'Geography' },
      { id: 'triv_fb_4', question: 'Which ocean is the largest by surface area?', options: shuffle(['Pacific', 'Atlantic', 'Indian', 'Arctic']), correctAnswer: 'Pacific', category: 'Geography' },
      { id: 'triv_fb_5', question: 'Mount Everest is located in which mountain range?', options: shuffle(['Himalayas', 'Andes', 'Alps', 'Rockies']), correctAnswer: 'Himalayas', category: 'Geography' },
    ];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'terrathon_official';

  let capitals: any[] = [];
  let photos: any[] = [];
  let trivias: any[] = [];

  if (mode === 'capital' || mode === 'terrathon_official') {
    capitals = await getDynamicCapitals();
  }
  if (mode === 'photoguessr' || mode === 'terrathon_official') {
    photos = await getDynamicPhotos();
  }
  if (mode === 'trivia' || mode === 'terrathon_official') {
    trivias = await getDynamicTrivia();
  }

  return NextResponse.json({ capitals, photos, trivias });
}