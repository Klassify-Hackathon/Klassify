import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLang } from "@/components/i18n";
import { Row, T } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { Kind } from "@/lib/analyze";
import { colors, FEATURES, radius, space } from "@/lib/theme";

const BLACK = "#151515";

// Simple pastel illustration built from shapes: no image assets needed.
function Art() {
  const sparks = [
    { top: 4, left: 6 },
    { top: 40, right: 0 },
    { bottom: 30, left: 0 },
    { bottom: 6, right: 24 },
  ];
  return (
    <View style={s.art}>
      <View
        style={[
          s.shape,
          {
            backgroundColor: "#C9C6FA",
            width: 240,
            height: 240,
            borderRadius: 120,
            left: 20,
            top: 10,
          },
        ]}
      />
      <View
        style={[
          s.shape,
          {
            backgroundColor: "#F4CFEA",
            width: 210,
            height: 180,
            borderRadius: 95,
            left: 35,
            top: 70,
          },
        ]}
      />
      <View
        style={[
          s.shape,
          {
            backgroundColor: "#9ED9F2",
            width: 130,
            height: 130,
            borderRadius: 40,
            left: 75,
            top: 65,
          },
        ]}
      >
        <Ionicons name="shield-checkmark" size={72} color={BLACK} />
      </View>
      <View style={[s.chip, { top: 28, right: 34 }]}>
        <Ionicons name="videocam" size={24} color={BLACK} />
      </View>
      <View style={[s.chip, { bottom: 34, left: 28 }]}>
        <Ionicons name="mic" size={24} color={BLACK} />
      </View>
      {sparks.map((p, i) => (
        <Text key={i} style={[s.spark, p]}>
          ✦
        </Text>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const { t, toggle } = useLang();
  const { signOut } = useAuth();
  const router = useRouter();

  async function pick(kind: Kind) {
    const res = await DocumentPicker.getDocumentAsync({
      type: kind === "audio" ? ["audio/*"] : ["video/*", "image/*"],
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const file = res.assets[0];
    const detected: Kind = file.mimeType?.startsWith("image") ? "image" : kind;
    router.push({
      pathname: "/result",
      params: {
        uri: file.uri,
        name: file.name,
        kind: detected,
        mime: file.mimeType ?? "",
      },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={s.wrap}>
        <Row style={{ justifyContent: "flex-end" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={() => {
              signOut();
            }}
            style={s.lang}
          >
            <T v="small" bold color={BLACK}>
              {t.signOut}
            </T>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.otherLang}
            onPress={toggle}
            style={s.lang}
          >
            <T v="small" bold color={BLACK}>
              {t.otherLang}
            </T>
          </Pressable>
        </Row>

        <ScrollView contentContainerStyle={s.mid}>
          <Art />
          <T
            v="title"
            style={{ textAlign: "center", fontSize: 34, lineHeight: 40 }}
          >
            {t.tagline}
          </T>
          <T color={colors.muted} style={{ textAlign: "center" }}>
            {t.heroSub}
          </T>
          {FEATURES.shareTip ? (
            <T v="small" color={colors.muted} style={{ textAlign: "center" }}>
              {t.shareTip}
            </T>
          ) : null}
        </ScrollView>

        <View style={{ gap: space.s }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => pick("video")}
            style={[s.btn, { backgroundColor: BLACK }]}
          >
            <T bold color="#FFFFFF" style={{ textAlign: "center" }}>
              {t.pickVisual}
            </T>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => pick("audio")}
            style={[s.btn, { borderWidth: 1.5, borderColor: BLACK }]}
          >
            <T bold color={BLACK} style={{ textAlign: "center" }}>
              {t.pickAudio}
            </T>
          </Pressable>
          <T v="small" color={colors.muted} style={{ textAlign: "center" }}>
            {t.privacy}
          </T>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: space.m,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    gap: space.s,
  },
  mid: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: space.m,
    paddingVertical: space.m,
  },
  lang: {
    minHeight: 44,
    paddingHorizontal: space.m,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: BLACK,
  },
  btn: {
    minHeight: 60,
    borderRadius: radius.pill,
    justifyContent: "center",
    paddingHorizontal: space.l,
  },
  art: { width: 280, height: 260 },
  shape: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  spark: { position: "absolute", fontSize: 26, color: "#D9CFA8" },
});
