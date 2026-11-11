import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";


export function AuthGate({ loginRoute }: { loginRoute: string }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navReady = !!useRootNavigationState()?.key;

  useEffect(() => {
    if (!navReady || loading) return;
    const onAuthScreen = segments[0]?.startsWith("login") ?? false;
    if (!user && !onAuthScreen) router.replace(loginRoute as any);
    if (user && onAuthScreen) router.replace("/");
  }, [user, loading, segments, navReady, loginRoute, router]);

  if (loading) {
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.bg, justifyContent: "center" },
        ]}
      >
        <ActivityIndicator />
      </View>
    );
  }
  return null;
}
