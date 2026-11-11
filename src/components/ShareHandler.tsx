import { useRootNavigationState, useRouter } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { useEffect } from "react";

import type { Kind } from "@/lib/analyze";
import { useAuth } from "@/lib/auth";

export function ShareHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent } =
    useShareIntentContext();
  const { user, loading } = useAuth();
  const router = useRouter();
  const navReady = !!useRootNavigationState()?.key;

  useEffect(() => {
    if (!navReady || loading || !user || !hasShareIntent) return;

    const file = shareIntent.files?.[0];
    if (file) {
      const mime = file.mimeType ?? "";
      const kind: Kind = mime.startsWith("audio")
        ? "audio"
        : mime.startsWith("image")
          ? "image"
          : "video";

      const uri = file.path.includes("://") ? file.path : `file://${file.path}`;
      router.push({
        pathname: "/result",
        params: { uri, name: file.fileName ?? "shared-file", kind, mime },
      });
    }
    resetShareIntent();
  }, [
    navReady,
    loading,
    user,
    hasShareIntent,
    shareIntent,
    resetShareIntent,
    router,
  ]);

  return null;
}
