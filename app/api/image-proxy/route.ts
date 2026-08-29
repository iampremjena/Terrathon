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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'terrathon_official';

  let capitals: any[] = [];
  let photos: any[] = [];
  let trivias: any[] = [];

  // --- 1. CAPITALS (REST Countries) ---
  if (mode === 'capital' || mode === 'terrathon_official') {
    try {
      const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,latlng', {
        headers: { 'User-Agent': 'TerrathonApp/1.0' },
        next: { revalidate: 0 }
      });
      if (res.ok) {
        const data = await res.json();
        const valid = data.filter((c: any) => c.capital && c.capital.length > 0 && c.latlng && c.latlng.length === 2);
        const selected = shuffle(valid).slice(0, 10);
        const allCapitals = valid.map((c: any) => c.capital[0]);

        capitals = selected.map((c: any, idx: number) => {
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
      }
    } catch (e) {
      console.error("Capitals fetch error:", e);
    }
  }

  // --- 2. PHOTOS (Wikidata SPARQL with Unsplash Fallback) ---
  if (mode === 'photoguessr' || mode === 'terrathon_official') {
    try {
      const sparql = `
        SELECT ?item ?itemLabel ?countryLabel ?image ?coord WHERE {
          ?item wdt:P31/wdt:P279* wd:Q570116;
                wdt:P18 ?image;
                wdt:P625 ?coord;
                wdt:P17 ?country.
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        ORDER BY UUID()
        LIMIT 10
      `;
      const url = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(sparql);
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TerrathonApp/1.0 (Contact: admin@terrathon.com)'
        },
        next: { revalidate: 0 }
      });

      if (res.ok) {
        const data = await res.json();
        const results = data.results?.bindings || [];
        photos = results.map((item: any, idx: number) => {
          const pointStr = item.coord.value;
          const match = pointStr.match(/Point\(([-0-9.]+)\s+([-0-9.]+)\)/);
          const lng = match ? parseFloat(match[1]) : 0;
          const lat = match ? parseFloat(match[2]) : 0;
          let rawImgUrl = item.image.value;
          if (rawImgUrl.startsWith('http://')) rawImgUrl = rawImgUrl.replace('http://', 'https://');

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
    } catch (e) {
      console.error("Photos Wikidata error:", e);
    }

    // High-reliability backup if Wikidata times out on server
    if (photos.length < 5) {
      const backupSeeds = [
        { name: "Eiffel Tower", country: "France", lat: 48.8584, lng: 2.2945, img: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1000&q=80" },
        { name: "Taj Mahal", country: "India", lat: 27.1751, lng: 78.0421, img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1000&q=80" },
        { name: "Colosseum", country: "Italy", lat: 41.8902, lng: 12.4922, img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1000&q=80" },
        { name: "Statue of Liberty", country: "USA", lat: 40.6892, lng: -74.0445, img: "https://images.unsplash.com/photo-1605130284535-11dd9ede6523?w=1000&q=80" },
        { name: "Big Ben", country: "UK", lat: 51.5007, lng: -0.1246, img: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1000&q=80" },
      ];
      photos = backupSeeds.map((s, i) => ({
        id: `photo_bkp_${i}`,
        locationName: s.name,
        country: s.country,
        imageUrl: s.img,
        fallbackUrl: s.img,
        coordinates: { lat: s.lat, lng: s.lng },
        clue: `Located in ${s.country}`
      }));
    }
  }

  // --- 3. TRIVIA (Open Trivia DB) ---
  if (mode === 'trivia' || mode === 'terrathon_official') {
    try {
      const res = await fetch('https://opentdb.com/api.php?amount=10&category=22&type=multiple', {
        next: { revalidate: 0 }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          trivias = data.results.map((q: any, idx: number) => {
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
      }
    } catch (e) {
      console.error("Trivia fetch error:", e);
    }
  }

  return NextResponse.json({ capitals, photos, trivias });
}