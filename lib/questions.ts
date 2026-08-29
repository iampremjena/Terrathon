export interface CapitalQuestion { id: string; country: string; capital: string; continent: string; coordinates: { lat: number; lng: number }; options: string[]; }
export interface PhotoQuestion { id: string; locationName: string; country: string; imageUrl: string; fallbackUrl: string; coordinates: { lat: number; lng: number }; clue: string; }
export interface TriviaQuestion { id: string; question: string; options: string[]; correctAnswer: string; category: string; }

export async function fetchAllRunQuestions(mode: string) {
  try {
    const res = await fetch(`/api/questions?mode=${encodeURIComponent(mode)}`);
    if (!res.ok) throw new Error('API route failed');
    return await res.json();
  } catch (err) {
    console.error("Failed to load questions via API route:", err);
    return { capitals: [], photos: [], trivias: [] };
  }
}