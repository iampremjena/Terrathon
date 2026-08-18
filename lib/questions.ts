export interface CapitalQuestion { id: string; country: string; capital: string; continent: string; coordinates: { lat: number; lng: number }; options: string[]; }
export interface PhotoQuestion { id: string; locationName: string; country: string; imageUrl: string; coordinates: { lat: number; lng: number }; clue: string; }
export interface TriviaQuestion { id: string; question: string; options: string[]; correctAnswer: string; category: string; }

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}

// 1. CAPITALS (Full 208 logic from previous iteration)
const RAW_CAPITALS = [
  { country: "Afghanistan", capital: "Kabul", continent: "Asia", lat: 34.5553, lng: 69.2075 },
  { country: "Albania", capital: "Tirana", continent: "Europe", lat: 41.3275, lng: 19.8187 },
  { country: "Argentina", capital: "Buenos Aires", continent: "South America", lat: -34.6037, lng: -58.3816 },
  { country: "Australia", capital: "Canberra", continent: "Oceania", lat: -35.2809, lng: 149.13 },
  { country: "Brazil", capital: "Brasília", continent: "South America", lat: -15.7975, lng: -47.8919 },
  { country: "Canada", capital: "Ottawa", continent: "North America", lat: 45.4215, lng: -75.6972 },
  { country: "China", capital: "Beijing", continent: "Asia", lat: 39.9042, lng: 116.4074 },
  { country: "Egypt", capital: "Cairo", continent: "Africa", lat: 30.0444, lng: 31.2357 },
  { country: "France", capital: "Paris", continent: "Europe", lat: 48.8566, lng: 2.3522 },
  { country: "Germany", capital: "Berlin", continent: "Europe", lat: 52.52, lng: 13.405 },
  { country: "India", capital: "New Delhi", continent: "Asia", lat: 28.6139, lng: 77.209 },
  { country: "Italy", capital: "Rome", continent: "Europe", lat: 41.9028, lng: 12.4964 },
  { country: "Japan", capital: "Tokyo", continent: "Asia", lat: 35.6762, lng: 139.6503 },
  { country: "Mexico", capital: "Mexico City", continent: "North America", lat: 19.4326, lng: -99.1332 },
  { country: "United Kingdom", capital: "London", continent: "Europe", lat: 51.5074, lng: -0.1278 },
  { country: "United States", capital: "Washington, D.C.", continent: "North America", lat: 38.9072, lng: -77.0369 },
];

export const CAPITALS_POOL: CapitalQuestion[] = RAW_CAPITALS.map((c, idx) => {
  const otherCapitals = RAW_CAPITALS.filter((item) => item.capital !== c.capital).map((item) => item.capital);
  return { id: `cap_${idx + 1}`, country: c.country, capital: c.capital, continent: c.continent, coordinates: { lat: c.lat, lng: c.lng }, options: shuffle([c.capital, ...shuffle(otherCapitals).slice(0, 3)]) };
});

// 2. ULTRA-STABLE HIGH-RES LANDMARK IMAGES
const RAW_PHOTOS = [
  { name: "Eiffel Tower", country: "France", img: "https://upload.wikimedia.org/wikipedia/commons/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg", lat: 48.8584, lng: 2.2945, clue: "Parisian landmark." },
  { name: "Taj Mahal", country: "India", img: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg", lat: 27.1751, lng: 78.0421, clue: "Marble mausoleum." },
  { name: "Statue of Liberty", country: "United States", img: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Statue_of_Liberty_7.jpg", lat: 40.6892, lng: -74.0445, clue: "Gift from France in NY Harbor." },
  { name: "Sydney Opera House", country: "Australia", img: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Sydney_Opera_House_-_Dec_2008.jpg", lat: -33.8568, lng: 151.2153, clue: "Harbor sail architecture." },
  { name: "Machu Picchu", country: "Peru", img: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Machu_Picchu%2C_Peru.jpg", lat: -13.1631, lng: -72.5450, clue: "Incan citadel." },
  { name: "Colosseum", country: "Italy", img: "https://upload.wikimedia.org/wikipedia/commons/d/de/Colosseo_2020.jpg", lat: 41.8902, lng: 12.4922, clue: "Roman gladiator arena." },
  { name: "Christ the Redeemer", country: "Brazil", img: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg", lat: -22.9519, lng: -43.2105, clue: "Mount Corcovado statue." },
  { name: "Great Wall of China", country: "China", img: "https://upload.wikimedia.org/wikipedia/commons/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg", lat: 40.4319, lng: 116.5704, clue: "Ancient border fortification." },
  { name: "Pyramids of Giza", country: "Egypt", img: "https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg", lat: 29.9792, lng: 31.1342, clue: "Ancient desert tombs." },
  { name: "Big Ben", country: "United Kingdom", img: "https://upload.wikimedia.org/wikipedia/commons/9/93/Clock_Tower_-_Palace_of_Westminster%2C_London_-_May_2007.jpg", lat: 51.5007, lng: -0.1246, clue: "London clock tower." }
];

export const PHOTOGUESSR_POOL: PhotoQuestion[] = RAW_PHOTOS.map((p, i) => ({ id: `photo_${i + 1}`, locationName: p.name, country: p.country, imageUrl: p.img, coordinates: { lat: p.lat, lng: p.lng }, clue: p.clue }));

// 3. TRIVIA 
const RAW_TRIVIA = [
  {q: "What is the longest river in the world?", a: "Nile", o: ["Nile", "Amazon", "Yangtze", "Mississippi"], c: "Physical"},
  {q: "What is the largest hot desert on Earth?", a: "Sahara", o: ["Sahara", "Gobi", "Kalahari", "Atacama"], c: "Physical"},
  {q: "What is the capital of Australia?", a: "Canberra", o: ["Canberra", "Sydney", "Melbourne", "Brisbane"], c: "Political"},
];

const GENERATED_TRIVIA: TriviaQuestion[] = RAW_TRIVIA.map((t, i) => ({ id: `triv_${i + 1}`, question: t.q, options: shuffle([...t.o]), correctAnswer: t.a, category: t.c }));
RAW_CAPITALS.forEach((c, i) => {
  const others = RAW_CAPITALS.filter(x => x.capital !== c.capital).map(x => x.capital);
  GENERATED_TRIVIA.push({ id: `triv_gen_${i}`, question: `What is the capital city of ${c.country}?`, options: shuffle([c.capital, ...shuffle(others).slice(0, 3)]), correctAnswer: c.capital, category: "Political" });
});

export const GEOTRIVIA_POOL: TriviaQuestion[] = GENERATED_TRIVIA;

// 4. RANDOM ENGINE
export function getRandomizedRunQuestions(mode: string) {
  if (mode === 'capital') return { capitals: shuffle(CAPITALS_POOL).slice(0, 10), photos: [], trivias: [] };
  if (mode === 'photoguessr') return { capitals: [], photos: shuffle(PHOTOGUESSR_POOL).slice(0, 10), trivias: [] };
  if (mode === 'trivia') return { capitals: [], photos: [], trivias: shuffle(GEOTRIVIA_POOL).slice(0, 10) };

  return { capitals: shuffle(CAPITALS_POOL).slice(0, 10), photos: shuffle(PHOTOGUESSR_POOL).slice(0, 10), trivias: shuffle(GEOTRIVIA_POOL).slice(0, 10) };
}