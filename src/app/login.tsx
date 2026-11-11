import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

GoogleSignin.configure({
  webClientId:
    "932347897209-3bltg33levk43r9qc10ad5sppfuk5eja.apps.googleusercontent.com",
});

type Lang = "en" | "ar";

const copy = {
  en: {
    title: "Welcome to Klassify",
    subtitle: "Sign in to check if a video, photo or voice message is real.",
    google: "Continue with Google",
    note: "We only use your account to sign you in.",
    toggle: "العربية",
    errGeneric: "Couldn't sign in. Check your connection and try again.",
    errServices: "Update Google Play services, then try again.",
  },
  ar: {
    title: "مرحبًا بك في Klassify",
    subtitle:
      "سجّل الدخول لتتحقق إن كان الفيديو أو الصورة أو الرسالة الصوتية حقيقية.",
    google: "المتابعة باستخدام Google",
    note: "نستخدم حسابك لتسجيل الدخول فقط.",
    toggle: "English",
    errGeneric: "تعذّر تسجيل الدخول. تحقق من اتصالك وحاول مرة أخرى.",
    errServices: "حدّث خدمات Google Play ثم حاول مرة أخرى.",
  },
} as const;

type Copy = (typeof copy)[Lang];

const c = {
  bg: "#F4F6FA",
  ink: "#141B3A",
  muted: "#5B6580",
  black: "#111111",
  lavender: "#C9C4F5",
  pink: "#F0D2E8",
  sky: "#A8D6EE",
  gold: "#D9D0A8",
  danger: "#B3261E",
};

function errorText(e: any, t: Copy) {
  switch (e?.code) {
    case "PLAY_SERVICES_NOT_AVAILABLE":
      return t.errServices;
    default:
      return t.errGeneric;
  }
}

function useFloat(delay = 0) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration: 2400,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay]);
  return v.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
}

function Hero() {
  const floatA = useFloat(0);
  const floatB = useFloat(600);
  return (
    <View style={s.hero}>
      <View style={s.circle} />
      <View style={s.blob} />
      <View style={s.tile}>
        <Ionicons name="shield-checkmark" size={64} color={c.black} />
      </View>

      <Animated.View
        style={[
          s.chip,
          { top: 22, right: 20, transform: [{ translateY: floatA }] },
        ]}
      >
        <Ionicons name="videocam" size={24} color={c.black} />
      </Animated.View>
      <Animated.View
        style={[
          s.chip,
          { bottom: 24, left: 10, transform: [{ translateY: floatB }] },
        ]}
      >
        <Ionicons name="mic" size={22} color={c.black} />
      </Animated.View>

      <MaterialCommunityIcons
        name="star-four-points"
        size={26}
        color={c.gold}
        style={{ position: "absolute", top: 6, left: 4 }}
      />
      <MaterialCommunityIcons
        name="star-four-points"
        size={22}
        color={c.gold}
        style={{ position: "absolute", top: 58, right: -6 }}
      />
      <MaterialCommunityIcons
        name="star-four-points"
        size={22}
        color={c.gold}
        style={{ position: "absolute", bottom: 54, left: -4 }}
      />
      <MaterialCommunityIcons
        name="star-four-points"
        size={24}
        color={c.gold}
        style={{ position: "absolute", bottom: 18, right: 14 }}
      />
    </View>
  );
}

function Btn({
  label,
  onPress,
  disabled,
  busy,
  outline,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  outline?: boolean;
  icon?: React.ReactNode;
}) {
  const off = disabled || busy;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.cta,
        outline && s.ctaOutline,
        disabled && !busy && { opacity: 0.4 },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={outline ? c.black : "#fff"} />
      ) : (
        <>
          {icon}
          <Text style={[s.ctaText, outline && { color: c.black }]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export default function Login() {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState<Lang>("en");
  const [busy, setBusy] = useState<"google" | null>(null);
  const [error, setError] = useState("");

  const t = copy[lang];

  const google = async () => {
    if (busy) return;
    setBusy("google");
    setError("");
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const res = await GoogleSignin.signIn();
      if (res.type === "cancelled") return;
      const idToken = res.data.idToken;
      if (!idToken) throw new Error("No Google token");

      await signInWithCredential(
        getAuth(),
        GoogleAuthProvider.credential(idToken),
      );
    } catch (e: any) {
      if (e?.code === "SIGN_IN_CANCELLED" || e?.code === "IN_PROGRESS") return;
      setError(errorText(e, t));
    } finally {
      setBusy(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={[
        s.screen,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <View style={s.topBar}>
        <Pressable
          onPress={() => setLang(lang === "en" ? "ar" : "en")}
          accessibilityRole="button"
          style={({ pressed }) => [s.langBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={s.langText}>{t.toggle}</Text>
        </Pressable>
      </View>

      {/* Everything below is centered as one group, vertically and horizontally */}
      <View style={s.body}>
        <Hero />
        <Text style={s.title}>{t.title}</Text>
        <Text style={s.subtitle}>{t.subtitle}</Text>

        <View style={s.footer}>
          <Btn
            label={t.google}
            onPress={google}
            busy={busy === "google"}
            disabled={!!busy}
            icon={<AntDesign name="google" size={20} color="#fff" />}
          />
          {!!error ? (
            <Text style={s.error}>{error}</Text>
          ) : (
            <Text style={s.note}>{t.note}</Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const HERO = 300;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg, paddingHorizontal: 24 },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    minHeight: 48,
  },
  langBtn: {
    borderWidth: 2,
    borderColor: c.black,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  langText: { color: c.black, fontSize: 16, fontWeight: "700" },
  body: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: {
    width: HERO,
    height: HERO - 20,
    marginBottom: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: c.lavender,
    top: 0,
  },
  blob: {
    position: "absolute",
    width: 220,
    height: 200,
    borderTopLeftRadius: 110,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 120,
    backgroundColor: c.pink,
    bottom: 6,
    left: 40,
  },
  tile: {
    width: 124,
    height: 124,
    borderRadius: 38,
    backgroundColor: c.sky,
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1B2250",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    color: c.ink,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: c.muted,
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 12,
    maxWidth: 340,
  },
  footer: { width: "100%", gap: 14, marginTop: 36 },
  cta: {
    height: 58,
    borderRadius: 999,
    backgroundColor: c.black,
    borderWidth: 2,
    borderColor: c.black,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  ctaOutline: { backgroundColor: "transparent" },
  ctaText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  note: { color: c.muted, fontSize: 14, textAlign: "center" },
  error: { color: c.danger, fontSize: 14, textAlign: "center" },
});
