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
  fallbackUrl: string;
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

// ----------------------------------------------------------------------------
// STAGE 1: DYNAMIC CAPITALS (via REST Countries API)
// ----------------------------------------------------------------------------
export async function fetchDynamicCapitals(): Promise<CapitalQuestion[]> {
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,latlng');
    const data = await res.json();
    
    // Filter valid countries that have capitals and coordinates
    const validCountries = data.filter((c: any) => c.capital && c.capital.length > 0 && c.latlng && c.latlng.length === 2);
    const shuffled = shuffle(validCountries);
    const selected = shuffled.slice(0, 10);
    const allCapitals = validCountries.map((c: any) => c.capital[0]);

    return selected.map((c: any, idx: number) => {
      const correctCapital = c.capital[0];
      const distractors = shuffle(allCapitals.filter((cap: string) => cap !== correctCapital)).slice(0, 3);
      return {
        id: `cap_dyn_${idx}`,
        country: c.name.common,
        capital: correctCapital,
        continent: c.region || 'World',
        coordinates: { lat: c.latlng[0], lng: c.latlng[1] },
        options: shuffle([correctCapital, ...distractors]),
      };
    });
  } catch (err) {
    console.error("Failed to fetch capitals dynamically:", err);
    return [];
  }
}

// ----------------------------------------------------------------------------
// STAGE 2: DYNAMIC PHOTOS (via Mapillary Meta API)
// ----------------------------------------------------------------------------
const SEED_LOCATIONS = [
  { name: "Eiffel Tower", country: "France", lat: 48.8584, lng: 2.2945 },
  { name: "Colosseum", country: "Italy", lat: 41.8902, lng: 12.4922 },
  { name: "Taj Mahal", country: "India", lat: 27.1751, lng: 78.0421 },
  { name: "Statue of Liberty", country: "USA", lat: 40.6892, lng: -74.0445 },
  { name: "Sydney Opera House", country: "Australia", lat: -33.8568, lng: 151.2153 },
  { name: "Big Ben", country: "UK", lat: 51.5007, lng: -0.1246 },
  { name: "Brandenburg Gate", country: "Germany", lat: 52.5163, lng: 13.3777 },
  { name: "Sagrada Familia", country: "Spain", lat: 41.4036, lng: 2.1744 },
  { name: "Christ the Redeemer", country: "Brazil", lat: -22.9519, lng: -43.2105 },
  { name: "Burj Khalifa", country: "UAE", lat: 25.1972, lng: 55.2744 },
];

export async function fetchDynamicPhotoQuestions(): Promise<PhotoQuestion[]> {
  const token = process.env.NEXT_PUBLIC_MAPILLARY_CLIENT_TOKEN;
  const pickedLocations = shuffle(SEED_LOCATIONS).slice(0, 10);

  const photoQuestions = await Promise.all(
    pickedLocations.map(async (loc, idx) => {
      try {
        if (!token) throw new Error("Missing Mapillary Token");
        
        // Define a bounding box around coordinates to find street photos
        const bbox = `${loc.lng - 0.005},${loc.lat - 0.005},${loc.lng + 0.005},${loc.lat + 0.005}`;
        const mapillaryUrl = `https://graph.mapillary.com/images?fields=id,thumb_1024_url,geometry&bbox=${bbox}&limit=5&access_token=${token}`;
        
        const res = await fetch(mapillaryUrl);
        const json = await res.json();

        if (json.data && json.data.length > 0) {
          const imgObj = json.data[Math.floor(Math.random() * json.data.length)];
          const coords = imgObj.geometry.coordinates;
          return {
            id: `photo_dyn_${idx}`,
            locationName: loc.name,
            country: loc.country,
            imageUrl: imgObj.thumb_1024_url,
            fallbackUrl: imgObj.thumb_1024_url,
            coordinates: { lat: coords[1], lng: coords[0] },
            clue: `Located in ${loc.country}`
          };
        }
        throw new Error("No image found in bbox");
      } catch (e) {
        // Fallback to static OSM image generator if API token is missing or rate limited
        return {
          id: `photo_dyn_${idx}`,
          locationName: loc.name,
          country: loc.country,
          imageUrl: `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${loc.lng},${loc.lat}&z=14&l=sat&size=600,400`,
          fallbackUrl: `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${loc.lng},${loc.lat}&z=14&l=sat&size=600,400`,
          coordinates: { lat: loc.lat, lng: loc.lng },
          clue: `Located in ${loc.country}`
        };
      }
    })
  );

  return photoQuestions;
}

// ----------------------------------------------------------------------------
// STAGE 3: DYNAMIC TRIVIA (via Open Trivia Database)
// ----------------------------------------------------------------------------
export async function fetchDynamicTriviaQuestions(): Promise<TriviaQuestion[]> {
  try {
    // Category 22 is Geography in Open Trivia DB
    const res = await fetch('https://opentdb.com/api.php?amount=10&category=22&type=multiple');
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      return data.results.map((q: any, idx: number) => {
        const decodedQuestion = decodeHTMLEntities(q.question);
        const decodedCorrect = decodeHTMLEntities(q.correct_answer);
        const decodedIncorrect = q.incorrect_answers.map((ans: string) => decodeHTMLEntities(ans));

        return {
          id: `triv_dyn_${idx}`,
          question: decodedQuestion,
          options: shuffle([decodedCorrect, ...decodedIncorrect]),
          correctAnswer: decodedCorrect,
          category: q.category || 'Geography',
        };
      });
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch trivia dynamically:", err);
    return [];
  }
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}