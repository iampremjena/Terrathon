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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'terrathon_official';

  let capitals: any[] = [];
  let photos: any[] = [];
  let trivias: any[] = [];

  const headers = { 
    'User-Agent': 'TerrathonApp/1.0 (Contact: admin@terrathon.com)',
    'Accept': 'application/json'
  };

  // 1. DYNAMIC CAPITALS
  if (mode === 'capital' || mode === 'terrathon_official') {
    try {
      const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,latlng', { headers });
      if (res.ok) {
        const data = await res.json();
        const validCountries: any[] = data.filter((c: any) => c.capital && c.capital.length > 0 && c.latlng && c.latlng.length === 2);
        const allCapitalsList = validCountries.map((c: any) => c.capital[0]);
        const selectedCaps = shuffle(validCountries).slice(0, 10);

        capitals = selectedCaps.map((c: any, idx: number) => {
          const distractors = shuffle(allCapitalsList.filter((cap: string) => cap !== c.capital[0])).slice(0, 3);
          return {
            id: `cap_${idx}`,
            country: c.name.common,
            capital: c.capital[0],
            continent: c.region,
            coordinates: { lat: c.latlng[0], lng: c.latlng[1] },
            options: shuffle([c.capital[0], ...distractors]),
          };
        });
      }
    } catch (e) {
      console.error("Capitals dynamic fetch error:", e);
    }
  }

  // 2. DYNAMIC PHOTOS
  if (mode === 'photoguessr' || mode === 'terrathon_official') {
    try {
      const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,latlng', { headers });
      if (res.ok) {
        const data = await res.json();
        const validCountries: any[] = data.filter((c: any) => c.capital && c.capital.length > 0 && c.latlng && c.latlng.length === 2);
        const shuffledForPhotos: any[] = shuffle(validCountries);

        for (const country of shuffledForPhotos) {
          if (photos.length >= 10) break;
          try {
            const capitalName = country.capital[0];
            const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(capitalName)}&prop=pageimages&format=json&pithumbsize=1000`, { headers });
            if (wikiRes.ok) {
              const wikiData = await wikiRes.json();
              const pages = wikiData.query?.pages;
              if (pages) {
                const pageId = Object.keys(pages)[0];
                const imgUrl = pages[pageId]?.thumbnail?.source;
                if (imgUrl && !imgUrl.toLowerCase().includes('map') && !imgUrl.toLowerCase().includes('flag')) {
                  photos.push({
                    id: `photo_${photos.length}`,
                    locationName: capitalName,
                    country: country.name.common,
                    imageUrl: imgUrl,
                    fallbackUrl: imgUrl,
                    coordinates: { lat: country.latlng[0], lng: country.latlng[1] },
                    clue: `Capital city located in ${country.region}`
                  });
                }
              }
            }
          } catch (e) {
            continue;
          }
        }
      }
    } catch (e) {
      console.error("Photos dynamic fetch error:", e);
    }
  }

  // 3. DYNAMIC TRIVIA
  if (mode === 'trivia' || mode === 'terrathon_official') {
    try {
      const tdbRes = await fetch('https://opentdb.com/api.php?amount=10&category=22&type=multiple', { headers });
      if (tdbRes.ok) {
        const tdbData = await tdbRes.json();
        if (tdbData.results && tdbData.results.length > 0) {
          trivias = tdbData.results.map((q: any, idx: number) => {
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
    } catch (err) {
      try {
        const backupRes = await fetch('https://the-trivia-api.com/v2/questions?categories=geography&limit=10', { headers });
        if (backupRes.ok) {
          const backupData = await backupRes.json();
          trivias = backupData.map((q: any, idx: number) => ({
            id: `triv_bkp_${idx}`,
            question: q.question.text,
            options: shuffle([q.correctAnswer, ...q.incorrectAnswers]),
            correctAnswer: q.correctAnswer,
            category: 'Geography',
          }));
        }
      } catch (e) {
        console.error("Trivia backup fetch error:", e);
      }
    }
  }

  // ALWAYS return 200 OK with whatever arrays were successfully built
  return NextResponse.json({ capitals, photos, trivias });
}