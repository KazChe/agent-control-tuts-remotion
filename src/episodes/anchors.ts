// Anchor screen beats to spoken words. audio.json carries per-word timings
// from the narration generator; a beat asks for the moment a phrase starts.
// Without timings (the Mac draft voice) the fallback fraction of the clip is used.

export type Timing = { value: string; start: number; end: number };
export type Clip = { seconds: number; timings: Timing[] };

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

const find = (clip: Clip, phrase: string): [number, number] | null => {
  const want = phrase.split(/\s+/).map(norm).filter(Boolean);
  const words = clip.timings;
  for (let i = 0; i + want.length <= words.length; i++) {
    let ok = true;
    for (let j = 0; j < want.length; j++) {
      if (norm(words[i + j].value) !== want[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return [words[i].start, words[i + want.length - 1].end];
  }
  return null;
};

/** Seconds into the clip when the phrase begins. */
export const said = (clip: Clip, phrase: string, fallbackFraction: number): number => {
  const hit = find(clip, phrase);
  if (hit) return hit[0];
  if (clip.timings.length > 0) {
    throw new Error(`narration anchor not found: "${phrase}"`);
  }
  return fallbackFraction * clip.seconds;
};

/** Seconds into the clip when the phrase ends. */
export const saidEnd = (clip: Clip, phrase: string, fallbackFraction: number): number => {
  const hit = find(clip, phrase);
  if (hit) return hit[1];
  if (clip.timings.length > 0) {
    throw new Error(`narration anchor not found: "${phrase}"`);
  }
  return fallbackFraction * clip.seconds;
};
