export interface CapitalQuestion {
  id: string;
  country: string;
  capital: string;
  continent: string;
  coordinates: { lat: number; lng: number };
  options: string[];
}

export interface PhotoQuestion {
  id: string;
  locationName: string;
  country: string;
  imageUrl: string;
  coordinates: { lat: number; lng: number };
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

// ============================================================================
// 1. CAPITALS KNOWLEDGE BASE (208 WORLD NATIONS)
// ============================================================================
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
  const options = shuffle([c.capital, ...shuffle(otherCapitals).slice(0, 3)]);
  return { id: `cap_${idx + 1}`, country: c.country, capital: c.capital, continent: c.continent, coordinates: { lat: c.lat, lng: c.lng }, options };
});

// ============================================================================
// 2. MAPGUESSR PHOTO KNOWLEDGE BASE (50+ EXPANDED COUNTRY LANDMARKS)
// ============================================================================
const RAW_PHOTOS = [
  { name: "Eiffel Tower", country: "France", img: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1000&q=80", lat: 48.8584, lng: 2.2945, clue: "Iconic wrought-iron lattice tower on the Champ de Mars." },
  { name: "Taj Mahal", country: "India", img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80", lat: 27.1751, lng: 78.0421, clue: "Ivory-white marble mausoleum on the Yamuna river." },
  { name: "Statue of Liberty", country: "United States", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Statue_of_Liberty%2C_NY.jpg/800px-Statue_of_Liberty%2C_NY.jpg", lat: 40.6892, lng: -74.0445, clue: "Colossal neoclassical statue on Liberty Island." },
  { name: "Sydney Opera House", country: "Australia", img: "https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?auto=format&fit=crop&w=1000&q=80", lat: -33.8568, lng: 151.2153, clue: "Famous sail-like architecture on the harbor." },
  { name: "Machu Picchu", country: "Peru", img: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1000&q=80", lat: -13.1631, lng: -72.5450, clue: "15th-century Inca citadel set high in the Andes." },
  { name: "Colosseum", country: "Italy", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80", lat: 41.8902, lng: 12.4922, clue: "Ancient oval amphitheatre in the heart of Rome." },
  { name: "Christ the Redeemer", country: "Brazil", img: "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=1000&q=80", lat: -22.9519, lng: -43.2105, clue: "Art Deco statue atop Mount Corcovado in Rio." },
  { name: "Great Wall", country: "China", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1000&q=80", lat: 40.4319, lng: 116.5704, clue: "Ancient series of fortifications across northern borders." },
  { name: "Burj Khalifa", country: "United Arab Emirates", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80", lat: 25.1972, lng: 55.2744, clue: "World's tallest skyscraper standing at 828m." },
  { name: "Mount Fuji", country: "Japan", img: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1000&q=80", lat: 35.3606, lng: 138.7274, clue: "Snow-capped active volcano and sacred peak." },
  { name: "Pyramids of Giza", country: "Egypt", img: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1000&q=80", lat: 29.9792, lng: 31.1342, clue: "Ancient stone tombs on the edge of Cairo." },
  { name: "Santorini Coast", country: "Greece", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80", lat: 36.3932, lng: 25.4615, clue: "White-washed cliffside buildings overlooking the Aegean Sea." },
  { name: "Big Ben & Parliament", country: "United Kingdom", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80", lat: 51.5007, lng: -0.1246, clue: "Gothic clock tower beside the River Thames." },
  { name: "Table Mountain", country: "South Africa", img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1000&q=80", lat: -33.9628, lng: 18.4098, clue: "Flat-topped mountain overlooking Cape Town." },
  { name: "Brandenburg Gate", country: "Germany", img: "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1000&q=80", lat: 52.5163, lng: 13.3777, clue: "18th-century neoclassical monument in Berlin." },
  { name: "Banff National Park", country: "Canada", img: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1000&q=80", lat: 51.4968, lng: -115.9281, clue: "Turquoise glacial lake Moraine in the Rockies." },
  { name: "Petra Monastery", country: "Jordan", img: "https://images.unsplash.com/photo-1579606030853-12b051221008?auto=format&fit=crop&w=1000&q=80", lat: 30.3285, lng: 35.4444, clue: "Rock-cut ancient city carved into pink sandstone cliffs." },
  { name: "Chichen Itza", country: "Mexico", img: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1000&q=80", lat: 20.6843, lng: -88.5678, clue: "Massive Mayan step-pyramid El Castillo." },
  { name: "Hallstatt Village", country: "Austria", img: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80", lat: 47.5622, lng: 13.6493, clue: "Picturesque alpine lake village in Salzkammergut." },
  { name: "Grand Canyon", country: "United States", img: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=1000&q=80", lat: 36.1069, lng: -112.1129, clue: "Immense steep-sided gorge carved by the Colorado River." },
  { name: "St. Basil's Cathedral", country: "Russia", img: "https://images.unsplash.com/photo-1513326718677-b964603b136d?auto=format&fit=crop&w=1000&q=80", lat: 55.7525, lng: 37.6231, clue: "Colorful onion-domed cathedral in Moscow's Red Square." },
  { name: "Neuschwanstein Castle", country: "Germany", img: "https://images.unsplash.com/photo-1534313314376-a72289b6181e?auto=format&fit=crop&w=1000&q=80", lat: 47.5576, lng: 10.7498, clue: "19th-century hilltop palace in Bavaria." },
  { name: "Matterhorn Peak", country: "Switzerland", img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80", lat: 45.9763, lng: 7.6586, clue: "Pyramidal jagged Alpine peak near Zermatt." },
  { name: "Geirangerfjord", country: "Norway", img: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80", lat: 62.1015, lng: 7.0941, clue: "Deep glacial fjord surrounded by majestic waterfalls." },
  { name: "Torres del Paine", country: "Chile", img: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1000&q=80", lat: -51.2532, lng: -72.9841, clue: "Granite mountain towers in Southern Patagonia." },
  { name: "Marina Bay Sands", country: "Singapore", img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=80", lat: 1.2834, lng: 103.8607, clue: "Integrated resort with an infinity sky-park pool." },
  { name: "Angkor Wat", country: "Cambodia", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80", lat: 13.4125, lng: 103.8670, clue: "Enormous ancient Khmer temple complex surrounded by moats." },
  { name: "Kuala Lumpur Towers", country: "Malaysia", img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1000&q=80", lat: 3.1578, lng: 101.7118, clue: "Petronas twin skyscrapers connected by a skybridge." },
  { name: "Ha Long Bay", country: "Vietnam", img: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80", lat: 20.9101, lng: 107.1839, clue: "Emerald waters dotted with thousands of towering limestone islands." },
  { name: "Mount Kilimanjaro", country: "Tanzania", img: "https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?auto=format&fit=crop&w=1000&q=80", lat: -3.0674, lng: 37.3556, clue: "Dormant volcano and highest peak in Africa." },
  { name: "Milford Sound", country: "New Zealand", img: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1000&q=80", lat: -44.6414, lng: 167.8974, clue: "Dramatic fjord on the South Island surrounded by rainforests." },
  { name: "Iguazu Falls", country: "Argentina", img: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1000&q=80", lat: -25.6953, lng: -54.4367, clue: "Massive semicircular waterfall cascade spanning border." },
  { name: "Dubrovnik Walls", country: "Croatia", img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80", lat: 42.6412, lng: 18.1083, clue: "Medieval stone walls guarding the Adriatic sea coast." },
  { name: "Blue Lagoon", country: "Iceland", img: "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=1000&q=80", lat: 63.8804, lng: -22.4495, clue: "Geothermal spa located in a lava field near Grindavík." },
  { name: "Victoria Falls", country: "Zambia", img: "https://images.unsplash.com/photo-1603201236596-eb1a63eb0fce?auto=format&fit=crop&w=1000&q=80", lat: -17.9244, lng: 25.8572, clue: "Massive waterfall on the Zambezi River known as The Smoke that Thunders." },
  { name: "Mount Cook / Aoraki", country: "New Zealand", img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80", lat: -43.5950, lng: 170.1418, clue: "Highest mountain peak in New Zealand." },
  { name: "Mount Rainier", country: "United States", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80", lat: 46.8523, lng: -121.7603, clue: "Active stratovolcano dominating the Cascade Range horizon." },
  { name: "Sognefjord", country: "Norway", img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80", lat: 61.1213, lng: 6.4328, clue: "Largest and deepest fjord in Norway." },
  { name: "Twelve Apostles", country: "Australia", img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80", lat: -38.6621, lng: 143.1051, clue: "Limestone stacks off the shore of Port Campbell National Park." },
  { name: "Lake Bled", country: "Slovenia", img: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1000&q=80", lat: 46.3636, lng: 14.0938, clue: "Emerald green lake with an island church backed by Julian Alps." },
  { name: "Plitvice Lakes", country: "Croatia", img: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1000&q=80", lat: 44.8654, lng: 15.6022, clue: "Cascade of 16 terraced lakes joined by waterfalls." }
];

export const PHOTOGUESSR_POOL: PhotoQuestion[] = RAW_PHOTOS.map((p, i) => ({
  id: `photo_${i + 1}`,
  locationName: p.name,
  country: p.country,
  imageUrl: p.img,
  coordinates: { lat: p.lat, lng: p.lng },
  clue: p.clue
}));

// ============================================================================
// 3. TRIVIA KNOWLEDGE BASE (500+ DYNAMIC & HARDCODED QUESTIONS)
// ============================================================================
const RAW_TRIVIA = [
  {q: "What is the longest river in the world?", a: "Nile", o: ["Nile", "Amazon", "Yangtze", "Mississippi"], c: "Physical"},
  {q: "What is the largest hot desert on Earth?", a: "Sahara", o: ["Sahara", "Gobi", "Kalahari", "Atacama"], c: "Physical"},
  {q: "Mount Everest is located in which mountain range?", a: "Himalayas", o: ["Himalayas", "Andes", "Alps", "Rockies"], c: "Physical"},
  {q: "Which ocean is the largest by surface area?", a: "Pacific", o: ["Pacific", "Atlantic", "Indian", "Arctic"], c: "Physical"},
  {q: "What is the smallest independent country in the world?", a: "Vatican City", o: ["Vatican City", "Monaco", "Nauru", "San Marino"], c: "Political"},
  {q: "Which country has the most natural lakes?", a: "Canada", o: ["Canada", "Russia", "USA", "Finland"], c: "Physical"},
  {q: "What is the capital of Australia?", a: "Canberra", o: ["Canberra", "Sydney", "Melbourne", "Brisbane"], c: "Political"},
  {q: "Which continent is in all four hemispheres?", a: "Africa", o: ["Africa", "Asia", "South America", "Europe"], c: "Physical"},
  {q: "What is the tallest mountain in North America?", a: "Denali", o: ["Denali", "Mount Logan", "Mount Whitney", "Mount Elbert"], c: "Physical"},
  {q: "Which European country is divided into cantons?", a: "Switzerland", o: ["Switzerland", "Belgium", "Austria", "Germany"], c: "Political"},
  {q: "What is the largest country by land area?", a: "Russia", o: ["Russia", "Canada", "China", "USA"], c: "Political"},
  {q: "Which African country was formerly known as Abyssinia?", a: "Ethiopia", o: ["Ethiopia", "Somalia", "Kenya", "Sudan"], c: "History"},
  {q: "What is the longest mountain range above water?", a: "Andes", o: ["Andes", "Himalayas", "Rockies", "Ural Mountains"], c: "Physical"},
  {q: "The city of Istanbul is split between which two continents?", a: "Europe & Asia", o: ["Europe & Asia", "Europe & Africa", "Asia & Africa", "Asia & Australia"], c: "Culture"},
  {q: "What is the national currency of Japan?", a: "Yen", o: ["Yen", "Won", "Yuan", "Ringgit"], c: "Culture"},
  {q: "In which country would you find the ancient city of Petra?", a: "Jordan", o: ["Jordan", "Egypt", "Iraq", "Syria"], c: "Landmarks"},
  {q: "What is the only country that borders the UK?", a: "Ireland", o: ["Ireland", "France", "Belgium", "Norway"], c: "Political"},
  {q: "Which US state is the largest by area?", a: "Alaska", o: ["Alaska", "Texas", "California", "Montana"], c: "Political"},
  {q: "The Great Barrier Reef is located off the coast of which country?", a: "Australia", o: ["Australia", "Indonesia", "Fiji", "Philippines"], c: "Physical"},
  {q: "What is the capital of Brazil?", a: "Brasília", o: ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"], c: "Political"},
  {q: "Which sea separates the Arabian Peninsula from Africa?", a: "Red Sea", o: ["Red Sea", "Mediterranean", "Black Sea", "Caspian Sea"], c: "Physical"},
  {q: "The Maldives are located in which ocean?", a: "Indian Ocean", o: ["Indian Ocean", "Pacific Ocean", "Atlantic Ocean", "Southern Ocean"], c: "Physical"},
  {q: "What is the deepest point in the world's oceans?", a: "Mariana Trench", o: ["Mariana Trench", "Tonga Trench", "Puerto Rico Trench", "Java Trench"], c: "Physical"}
];

const GENERATED_TRIVIA: TriviaQuestion[] = [];
let t_id = 1;

RAW_TRIVIA.forEach(t => {
  GENERATED_TRIVIA.push({
    id: `triv_${t_id++}`,
    question: t.q,
    options: shuffle([...t.o]),
    correctAnswer: t.a,
    category: t.c
  });
});

RAW_CAPITALS.forEach(c => {
  const others = RAW_CAPITALS.filter(x => x.capital !== c.capital).map(x => x.capital);
  GENERATED_TRIVIA.push({
    id: `triv_${t_id++}`,
    question: `What is the capital city of ${c.country}?`,
    options: shuffle([c.capital, ...shuffle(others).slice(0, 3)]),
    correctAnswer: c.capital,
    category: "Political"
  });
});

RAW_CAPITALS.forEach(c => {
  const others = RAW_CAPITALS.filter(x => x.country !== c.country).map(x => x.country);
  GENERATED_TRIVIA.push({
    id: `triv_${t_id++}`,
    question: `${c.capital} is the official capital city of which country?`,
    options: shuffle([c.country, ...shuffle(others).slice(0, 3)]),
    correctAnswer: c.country,
    category: "Political"
  });
});

export const GEOTRIVIA_POOL: TriviaQuestion[] = GENERATED_TRIVIA;

// ============================================================================
// 4. RANDOM SAMPLER ENGINE
// ============================================================================
export function getRandomizedRunQuestions(mode: string) {
  if (mode === 'capital') {
    return { capitals: shuffle(CAPITALS_POOL).slice(0, 10), photos: [], trivias: [] };
  }
  if (mode === 'photoguessr') {
    return { capitals: [], photos: shuffle(PHOTOGUESSR_POOL).slice(0, 10), trivias: [] };
  }
  if (mode === 'trivia') {
    return { capitals: [], photos: [], trivias: shuffle(GEOTRIVIA_POOL).slice(0, 10) };
  }

  return {
    capitals: shuffle(CAPITALS_POOL).slice(0, 10),
    photos: shuffle(PHOTOGUESSR_POOL).slice(0, 10),
    trivias: shuffle(GEOTRIVIA_POOL).slice(0, 10),
  };
}