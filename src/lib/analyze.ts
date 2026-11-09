export type Kind = 'video' | 'image' | 'audio';
export type Verdict = 'fake' | 'unsure' | 'ok';
export type SignalStatus = 'flag' | 'ok' | 'unknown';
export type Signal = { key: 'meta' | 'visual' | 'voice'; status: SignalStatus };
export type Result = { verdict: Verdict; signals: Signal[] };
export type PickedFile = { uri: string; name: string; mimeType?: string };

// Your FastAPI server. On a real phone, use your computer's LAN IP or a deployed URL, not localhost.
export const API_URL = 'http://YOUR-SERVER:8000';

// DEMO ONLY: cycles through the three outcomes so you can show every screen in the pitch.
// Replace the body of analyzeFile with the real call below once the backend exists.
const OUTCOMES: Result[] = [
  { verdict: 'fake', signals: [{ key: 'meta', status: 'unknown' }, { key: 'visual', status: 'flag' }, { key: 'voice', status: 'flag' }] },
  { verdict: 'unsure', signals: [{ key: 'meta', status: 'unknown' }, { key: 'visual', status: 'ok' }, { key: 'voice', status: 'flag' }] },
  { verdict: 'ok', signals: [{ key: 'meta', status: 'ok' }, { key: 'visual', status: 'ok' }, { key: 'voice', status: 'ok' }] },
];
let next = 0;

export async function analyzeFile(file: PickedFile, kind: Kind): Promise<Result> {
  // Real version (the server returns the same shape: { verdict, signals }):
  //
  // const form = new FormData();
  // form.append('file', { uri: file.uri, name: file.name, type: file.mimeType ?? 'application/octet-stream' } as any);
  // const res = await fetch(`${API_URL}/analyze`, { method: 'POST', body: form });
  // if (!res.ok) throw new Error('analyze failed');
  // return (await res.json()) as Result;

  await new Promise((r) => setTimeout(r, 3600));
  const base = OUTCOMES[next++ % OUTCOMES.length];
  return {
    verdict: base.verdict,
    signals: base.signals.filter((s) => (kind === 'audio' ? s.key !== 'visual' : kind === 'image' ? s.key !== 'voice' : true)),
  };
}