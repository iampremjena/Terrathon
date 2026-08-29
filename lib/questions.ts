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
// STAGE 1: DYNAMIC CAPITALS (REST Countries API)
// ----------------------------------------------------------------------------
export async function fetchDynamicCapitals(): Promise<CapitalQuestion[]> {
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,latlng');
    const data = await res.json();
    
    const validCountries = data.filter((c: any) => c.capital && c.capital.length > 0 && c.latlng && c.latlng.length === 2);
    const selected = shuffle(validCountries).slice(0, 10);
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
// STAGE 2: DYNAMIC PHOTOS (Wikidata SPARQL API - 10,000+ World Landmarks)
// ----------------------------------------------------------------------------
export async function fetchDynamicPhotoQuestions(): Promise<PhotoQuestion[]> {
  try {
    // SPARQL Query: Fetches human settlement landmarks or tourist attractions with images and coordinates
    const sparqlQuery = `
      SELECT ?item ?itemLabel ?countryLabel ?image ?coord WHERE {
        ?item wdt:P31/wdt:P279* wd:Q570116;  # Tourist attraction or landmark
              wdt:P18 ?image;               # Has photo
              wdt:P625 ?coord;             # Has coordinates
              wdt:P17 ?country.             # Belongs to country
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      ORDER BY UUID()                      # Randomize pool of 100+ landmarks dynamically
      LIMIT 10
    `;

    const endpointUrl = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(sparqlQuery);
    
    const res = await fetch(endpointUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TerrathonApp/1.0 (Contact: admin@terrathon.com)'
      }
    });

    const data = await res.json();
    const results = data.results?.bindings || [];

    if (results.length > 0) {
      return results.map((item: any, idx: number) => {
        // Parse Point(lng lat) string into raw numbers
        const pointStr = item.coord.value; // e.g. "Point(2.2945 48.8584)"
        const coordsMatch = pointStr.match(/Point\(([-0-9.]+)\s+([-0-9.]+)\)/);
        const lng = coordsMatch ? parseFloat(coordsMatch[1]) : 0;
        const lat = coordsMatch ? parseFloat(coordsMatch[2]) : 0;

        // Convert Wikimedia Commons File URL to direct image stream
        let rawImgUrl = item.image.value;
        if (rawImgUrl.startsWith('http://')) {
          rawImgUrl = rawImgUrl.replace('http://', 'https://');
        }

        return {
          id: `photo_dyn_${idx}`,
          locationName: item.itemLabel?.value || 'Famous World Landmark',
          country: item.countryLabel?.value || 'Earth',
          imageUrl: rawImgUrl,
          fallbackUrl: rawImgUrl,
          coordinates: { lat, lng },
          clue: `Located in ${item.countryLabel?.value || 'Earth'}`
        };
      });
    }
    
    throw new Error("Wikidata query returned no rows");
  } catch (err) {
    console.error("Wikidata fetch error, using unsplash fallback:", err);
    
    // Emergency random fallback if Wikidata query times out
    return Array.from({ length: 10 }).map((_, idx) => ({
      id: `photo_fallback_${idx}`,
      locationName: "World Landmark",
      country: "Global",
      imageUrl: `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&q=80`,
      fallbackUrl: `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&q=80`,
      coordinates: { lat: 48.8584, lng: 2.2945 },
      clue: "Famous European Landmark"
    }));
  }
}

// ----------------------------------------------------------------------------
// STAGE 3: DYNAMIC TRIVIA (Open Trivia Database)
// ----------------------------------------------------------------------------
export async function fetchDynamicTriviaQuestions(): Promise<TriviaQuestion[]> {
  try {
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