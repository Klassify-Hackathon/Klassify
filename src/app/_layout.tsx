import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import type { Kind } from '@/lib/analyze';
import { LangProvider } from '@/components/i18n';
import { colors } from '@/lib/theme';

// Opens the scan screen whenever a file is shared into the app (cold start or already open).
function ShareHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const router = useRouter();
  const navReady = !!useRootNavigationState()?.key; // don't navigate before the navigator exists

  useEffect(() => {
    if (!navReady || !hasShareIntent) return;
    const file = shareIntent.files?.[0]; // first file only; text or links are ignored
    if (file) {
      const mime = file.mimeType ?? '';
      const kind: Kind = mime.startsWith('audio') ? 'audio' : mime.startsWith('image') ? 'image' : 'video';
      const uri = file.path.includes('://') ? file.path : `file://${file.path}`;
      router.push({ pathname: '/result', params: { uri, name: file.fileName ?? 'shared-file', kind, mime } });
    }
    resetShareIntent();
  }, [navReady, hasShareIntent, shareIntent]);

  return null;
}

export default function RootLayout() {
  return (
    // ShareIntentProvider must wrap everything else.
    <ShareIntentProvider>
      <LangProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
        <ShareHandler />
      </LangProvider>
    </ShareIntentProvider>
  );
}