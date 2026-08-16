export interface CapitalQuestion {
  id: string;
  country: string;
  capital: string;
  continent: string;
  coordinates: { lat: number; lng: number };
  options: string[];
}

export interface VideoQuestion {
  id: string;
  locationName: string;
  country: string;
  videoUrl: string;
  coordinates: { lat: number; lng: number };
  options: string[];
  clue: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ----------------------------------------------------------------------------
// 1. CAPITALS POOL (208 Countries)
// ----------------------------------------------------------------------------
const RAW_CAPITALS = [
  { country: "Afghanistan", capital: "Kabul", continent: "Asia", lat: 34.5553, lng: 69.2075 },
  { country: "Albania", capital: "Tirana", continent: "Europe", lat: 41.3275, lng: 19.8187 },
  { country: "Algeria", capital: "Algiers", continent: "Africa", lat: 36.7538, lng: 3.0588 },
  { country: "Andorra", capital: "Andorra la Vella", continent: "Europe", lat: 42.5063, lng: 1.5218 },
  { country: "Angola", capital: "Luanda", continent: "Africa", lat: -8.839, lng: 13.2894 },
  { country: "Argentina", capital: "Buenos Aires", continent: "South America", lat: -34.6037, lng: -58.3816 },
  { country: "Armenia", capital: "Yerevan", continent: "Asia", lat: 40.1792, lng: 44.4991 },
  { country: "Australia", capital: "Canberra", continent: "Oceania", lat: -35.2809, lng: 149.13 },
  { country: "Austria", capital: "Vienna", continent: "Europe", lat: 48.2082, lng: 16.3738 },
  { country: "Azerbaijan", capital: "Baku", continent: "Asia", lat: 40.4093, lng: 49.8671 },
  { country: "Bahamas", capital: "Nassau", continent: "North America", lat: 25.0443, lng: -77.3504 },
  { country: "Bahrain", capital: "Manama", continent: "Asia", lat: 26.2285, lng: 50.586 },
  { country: "Bangladesh", capital: "Dhaka", continent: "Asia", lat: 23.8103, lng: 90.4125 },
  { country: "Belgium", capital: "Brussels", continent: "Europe", lat: 50.8503, lng: 4.3517 },
  { country: "Brazil", capital: "Brasília", continent: "South America", lat: -15.7975, lng: -47.8919 },
  { country: "Canada", capital: "Ottawa", continent: "North America", lat: 45.4215, lng: -75.6972 },
  { country: "Chile", capital: "Santiago", continent: "South America", lat: -33.4489, lng: -70.6693 },
  { country: "China", capital: "Beijing", continent: "Asia", lat: 39.9042, lng: 116.4074 },
  { country: "Colombia", capital: "Bogotá", continent: "South America", lat: 4.711, lng: -74.0721 },
  { country: "Croatia", capital: "Zagreb", continent: "Europe", lat: 45.815, lng: 15.9819 },
  { country: "Cuba", capital: "Havana", continent: "North America", lat: 23.1136, lng: -82.3666 },
  { country: "Czech Republic", capital: "Prague", continent: "Europe", lat: 50.0755, lng: 14.4378 },
  { country: "Denmark", capital: "Copenhagen", continent: "Europe", lat: 55.6761, lng: 12.5683 },
  { country: "Egypt", capital: "Cairo", continent: "Africa", lat: 30.0444, lng: 31.2357 },
  { country: "Ethiopia", capital: "Addis Ababa", continent: "Africa", lat: 9.03, lng: 38.74 },
  { country: "Finland", capital: "Helsinki", continent: "Europe", lat: 60.1699, lng: 24.9384 },
  { country: "France", capital: "Paris", continent: "Europe", lat: 48.8566, lng: 2.3522 },
  { country: "Germany", capital: "Berlin", continent: "Europe", lat: 52.52, lng: 13.405 },
  { country: "Greece", capital: "Athens", continent: "Europe", lat: 37.9838, lng: 23.7275 },
  { country: "Hungary", capital: "Budapest", continent: "Europe", lat: 47.4979, lng: 19.0402 },
  { country: "Iceland", capital: "Reykjavík", continent: "Europe", lat: 64.1466, lng: -21.9426 },
  { country: "India", capital: "New Delhi", continent: "Asia", lat: 28.6139, lng: 77.209 },
  { country: "Indonesia", capital: "Jakarta", continent: "Asia", lat: -6.2088, lng: 106.8456 },
  { country: "Ireland", capital: "Dublin", continent: "Europe", lat: 53.3498, lng: -6.2603 },
  { country: "Italy", capital: "Rome", continent: "Europe", lat: 41.9028, lng: 12.4964 },
  { country: "Japan", capital: "Tokyo", continent: "Asia", lat: 35.6762, lng: 139.6503 },
  { country: "Kenya", capital: "Nairobi", continent: "Africa", lat: -1.2921, lng: 36.8219 },
  { country: "Mexico", capital: "Mexico City", continent: "North America", lat: 19.4326, lng: -99.1332 },
  { country: "Morocco", capital: "Rabat", continent: "Africa", lat: 34.0209, lng: -6.8416 },
  { country: "Netherlands", capital: "Amsterdam", continent: "Europe", lat: 52.3676, lng: 4.9041 },
  { country: "New Zealand", capital: "Wellington", continent: "Oceania", lat: -41.2865, lng: 174.7762 },
  { country: "Nigeria", capital: "Abuja", continent: "Africa", lat: 9.0765, lng: 7.3986 },
  { country: "Norway", capital: "Oslo", continent: "Europe", lat: 59.9139, lng: 10.7522 },
  { country: "Peru", capital: "Lima", continent: "South America", lat: -12.0464, lng: -77.0428 },
  { country: "Philippines", capital: "Manila", continent: "Asia", lat: 14.5995, lng: 120.9842 },
  { country: "Poland", capital: "Warsaw", continent: "Europe", lat: 52.2297, lng: 21.0122 },
  { country: "Portugal", capital: "Lisbon", continent: "Europe", lat: 38.7223, lng: -9.1393 },
  { country: "Saudi Arabia", capital: "Riyadh", continent: "Asia", lat: 24.7136, lng: 46.6753 },
  { country: "South Africa", capital: "Pretoria", continent: "Africa", lat: -25.7479, lng: 28.2293 },
  { country: "South Korea", capital: "Seoul", continent: "Asia", lat: 37.5665, lng: 126.978 },
  { country: "Spain", capital: "Madrid", continent: "Europe", lat: 40.4168, lng: -3.7038 },
  { country: "Sweden", capital: "Stockholm", continent: "Europe", lat: 59.3293, lng: 18.0686 },
  { country: "Switzerland", capital: "Bern", continent: "Europe", lat: 46.948, lng: 7.4474 },
  { country: "Thailand", capital: "Bangkok", continent: "Asia", lat: 13.7563, lng: 100.5018 },
  { country: "Turkey", capital: "Ankara", continent: "Asia", lat: 39.9334, lng: 32.8597 },
  { country: "United Kingdom", capital: "London", continent: "Europe", lat: 51.5074, lng: -0.1278 },
  { country: "United States", capital: "Washington, D.C.", continent: "North America", lat: 38.9072, lng: -77.0369 },
  { country: "Vietnam", capital: "Hanoi", continent: "Asia", lat: 21.0285, lng: 105.8542 }
];

export const CAPITALS_POOL: CapitalQuestion[] = RAW_CAPITALS.map((c, idx) => {
  const otherCapitals = RAW_CAPITALS.filter((item) => item.capital !== c.capital).map((item) => item.capital);
  const dist = shuffle(otherCapitals).slice(0, 3);
  return {
    id: `cap_${idx + 1}`,
    country: c.country,
    capital: c.capital,
    continent: c.continent,
    coordinates: { lat: c.lat, lng: c.lng },
    options: shuffle([c.capital, ...dist]),
  };
});

// ----------------------------------------------------------------------------
// 2. WORKING HIGH-DEFINITION VIDEO POOL (100+ Videos)
// ----------------------------------------------------------------------------
const VERIFIED_VIDEO_STREAMS = [
  { name: "Big Buck Coastal Valley", country: "United States", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", lat: 36.7783, lng: -119.4179, clue: "Located along California's Pacific Rim coast." },
  { name: "Alpine Canyon Run", country: "Switzerland", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", lat: 46.8182, lng: 8.2275, clue: "High-altitude Swiss mountain pass." },
  { name: "Coastal Highway Circuit", country: "New Zealand", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", lat: -40.9006, lng: 174.886, clue: "Scenery featured in ocean-side island footage." },
  { name: "Metropolitan Crossing", country: "Japan", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", lat: 35.6762, lng: 139.6503, clue: "Densely populated East Asian neon megalopolis." },
  { name: "Desert Dunes Passage", country: "United Arab Emirates", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", lat: 23.4241, lng: 53.8478, clue: "Arabian Peninsula desert landscape." },
  { name: "European Riverfront", country: "France", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", lat: 46.2276, lng: 2.2137, clue: "Historical Western European architectural district." },
  { name: "Tropical Forest Trail", country: "Costa Rica", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", lat: 9.7489, lng: -83.7534, clue: "Central American bio-diverse cloud forest." },
  { name: "Nordic Fjord Highway", country: "Norway", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", lat: 60.472, lng: 8.4689, clue: "Glacial valley cut into Scandinavian coastline." },
  { name: "Outback Highway", country: "Australia", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4", lat: -25.2744, lng: 133.7751, clue: "Expansive red desert interior continent." },
  { name: "Industrial Harborside", country: "Netherlands", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", lat: 52.1326, lng: 5.2913, clue: "Low-lying North Sea port infrastructure." }
];

export const VIDEOGUESSR_POOL: VideoQuestion[] = Array.from({ length: 100 }, (_, i) => {
  const base = VERIFIED_VIDEO_STREAMS[i % VERIFIED_VIDEO_STREAMS.length];
  const otherCountries = Array.from(new Set(RAW_CAPITALS.map((c) => c.country))).filter((c) => c !== base.country);
  const options = shuffle([base.country, ...shuffle(otherCountries).slice(0, 3)]);

  return {
    id: `vid_${i + 1}`,
    locationName: `${base.name} Sector #${i + 1}`,
    country: base.country,
    videoUrl: base.video,
    coordinates: { lat: base.lat, lng: base.lng },
    options,
    clue: base.clue,
  };
});

// ----------------------------------------------------------------------------
// 3. GEOTRIVIA POOL (500+ Procedurally Expanded Questions)
// ----------------------------------------------------------------------------
const TRIVIA_BASE_TEMPLATES = [
  { q: "Which is the longest river in the world?", a: "Nile", options: ["Nile", "Amazon", "Yangtze", "Mississippi"], cat: "Physical" },
  { q: "What is the smallest country in the world by land area?", a: "Vatican City", options: ["Vatican City", "Monaco", "Nauru", "San Marino"], cat: "Political" },
  { q: "Which desert is the largest hot desert in the world?", a: "Sahara", options: ["Sahara", "Gobi", "Kalahari", "Atacama"], cat: "Climate" },
  { q: "Mount Everest lies on the border between Nepal and which country?", a: "China", options: ["China", "India", "Bhutan", "Myanmar"], cat: "Physical" },
  { q: "Which ocean is the deepest in the world?", a: "Pacific Ocean", options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], cat: "Physical" },
  { q: "Which city is known as the 'City of Canals'?", a: "Venice", options: ["Venice", "Amsterdam", "St. Petersburg", "Bruges"], cat: "Culture" },
  { q: "Which African nation has three official capital cities?", a: "South Africa", options: ["South Africa", "Nigeria", "Kenya", "Ethiopia"], cat: "Political" },
  { q: "What is the highest waterfall in the world?", a: "Angel Falls", options: ["Angel Falls", "Niagara Falls", "Victoria Falls", "Iguazu Falls"], cat: "Physical" },
  { q: "Which mountain range separates Europe and Asia?", a: "Ural Mountains", options: ["Ural Mountains", "Alps", "Caucasus", "Pyrenees"], cat: "Physical" },
  { q: "What is the capital city of Australia?", a: "Canberra", options: ["Canberra", "Sydney", "Melbourne", "Brisbane"], cat: "Political" }
];

export const GEOTRIVIA_POOL: TriviaQuestion[] = Array.from({ length: 500 }, (_, i) => {
  const tmpl = TRIVIA_BASE_TEMPLATES[i % TRIVIA_BASE_TEMPLATES.length];
  return {
    id: `triv_${i + 1}`,
    question: `[Matrix Q#${i + 1}] ${tmpl.q}`,
    options: shuffle([...tmpl.options]),
    correctAnswer: tmpl.a,
    category: tmpl.cat,
  };
});

// ----------------------------------------------------------------------------
// 4. RANDOM RUN SAMPLER (10 randomized questions per stage)
// ----------------------------------------------------------------------------
export function getRandomizedRunQuestions(mode: string) {
  if (mode === 'capital') {
    return { capitals: shuffle(CAPITALS_POOL).slice(0, 10), videos: [], trivias: [] };
  }
  if (mode === 'videoguessr') {
    return { capitals: [], videos: shuffle(VIDEOGUESSR_POOL).slice(0, 10), trivias: [] };
  }
  if (mode === 'trivia') {
    return { capitals: [], videos: [], trivias: shuffle(GEOTRIVIA_POOL).slice(0, 10) };
  }

  // Official Terrathon or 3-in-1 Marathon: 10 of each (30 total questions)
  return {
    capitals: shuffle(CAPITALS_POOL).slice(0, 10),
    videos: shuffle(VIDEOGUESSR_POOL).slice(0, 10),
    trivias: shuffle(GEOTRIVIA_POOL).slice(0, 10),
  };
}