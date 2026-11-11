import { Stack } from "expo-router";
import { ShareIntentProvider } from "expo-share-intent";
import { StatusBar } from "expo-status-bar";

import { AuthGate } from "@/components/AuthGate";
import { LangProvider } from "@/components/i18n";
import { ShareHandler } from "@/components/ShareHandler";
import { AuthProvider } from "@/lib/auth";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  return (
    <ShareIntentProvider>
      <AuthProvider>
        <LangProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          />
          <AuthGate loginRoute="/login" />
          <ShareHandler />
        </LangProvider>
      </AuthProvider>
    </ShareIntentProvider>
  );
}
