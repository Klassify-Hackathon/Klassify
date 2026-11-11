import { getToken } from "@/lib/auth";
import { IS_MOCK } from "./theme";

export type Kind = "video" | "image" | "audio";
export type Verdict = "fake" | "unsure" | "ok";
export type SignalStatus = "flag" | "ok" | "unknown";
export type Signal = { key: "meta" | "visual" | "voice"; status: SignalStatus };
export type Result = { verdict: Verdict; signals: Signal[] };
export type PickedFile = { uri: string; name: string; mimeType?: string };

export const API_URL = "https://amusing-crummy-antirust.ngrok-free.dev";

const OUTCOMES: Result[] = [
  {
    verdict: "fake",
    signals: [
      { key: "meta", status: "unknown" },
      { key: "visual", status: "flag" },
      { key: "voice", status: "flag" },
    ],
  },
  {
    verdict: "unsure",
    signals: [
      { key: "meta", status: "unknown" },
      { key: "visual", status: "ok" },
      { key: "voice", status: "flag" },
    ],
  },
  {
    verdict: "ok",
    signals: [
      { key: "meta", status: "ok" },
      { key: "visual", status: "ok" },
      { key: "voice", status: "ok" },
    ],
  },
];

let next = 0;

export async function analyzeFile(
  file: PickedFile,
  kind: Kind,
): Promise<Result> {
  const form = new FormData();
  form.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? "application/octet-stream",
  } as any);

  form.append("kind", kind);

  console.log(IS_MOCK);

  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 3600));
    const base = OUTCOMES[next++ % OUTCOMES.length];
    return {
      verdict: base.verdict,
      signals: base.signals.filter((s) =>
        kind === "audio"
          ? s.key !== "visual"
          : kind === "image"
            ? s.key !== "voice"
            : true,
      ),
    };
  } else {
    // Model infe rence can be slow, so use a generous timeout.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    try {
      // Backend requires a bearer token (current_user). Only attach it when
      // logged in so the demo/mock flow still works without Firebase.
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      console.log(`${API_URL}/analyze_multimodal`, {
        method: "POST",
        body: form,
        headers,
        signal: controller.signal,
      });

      // Don't set Content-Type manually; fetch adds the multipart boundary.
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: form,
        headers,
        signal: controller.signal,
      });

      console.log(res);

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`analyze failed (${res.status}): ${detail}`);
      }

      const json = (await res.json()) as Result;
      return {
        verdict: json.verdict,
        signals: json.signals.filter((s) =>
          kind === "audio"
            ? s.key !== "visual"
            : kind === "image"
              ? s.key !== "voice"
              : true,
        ),
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
