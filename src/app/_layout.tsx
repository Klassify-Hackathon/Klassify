import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { LangProvider } from "@/components/i18n";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  return (
    <LangProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </LangProvider>
  );
}
