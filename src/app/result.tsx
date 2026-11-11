import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";

import { Button, IconName, Pill, Row, Screen, T } from "@/components/ui";
import {
  analyzeFile,
  Kind,
  Result,
  SignalStatus,
  Verdict,
} from "@/lib/analyze";
import { useLang } from "@/components/i18n";
import { colors, space } from "@/lib/theme";

const NEUTRAL_SOFT = "#EEF0F6";
const HAIRLINE = "#E6E9F2";

const verdictMeta: Record<Verdict, { fg: string; bg: string; icon: IconName }> =
  {
    fake: { fg: colors.fake, bg: colors.fakeSoft, icon: "warning" },
    unsure: { fg: colors.unsure, bg: colors.unsureSoft, icon: "help-circle" },
    ok: { fg: colors.ok, bg: colors.okSoft, icon: "shield-checkmark" },
  };

const statusMeta: Record<
  SignalStatus,
  { fg: string; bg: string; icon: IconName }
> = {
  flag: { fg: colors.fake, bg: colors.fakeSoft, icon: "alert-circle" },
  ok: { fg: colors.ok, bg: colors.okSoft, icon: "checkmark-circle" },
  unknown: { fg: colors.muted, bg: NEUTRAL_SOFT, icon: "help-circle" },
};

// Strings for the optional "source" field. Move these into your i18n file if you prefer.
const sourceCopy = {
  en: {
    label: "Source",
    optional: "Optional",
    placeholder: "Link, username, phone number...",
    hint: "Where did you get this from? A link, account name or phone number helps the authorities trace who made or shared it.",
  },
  ar: {
    label: "المصدر",
    optional: "اختياري",
    placeholder: "رابط، اسم حساب، رقم هاتف...",
    hint: "من أين وصلك هذا؟ الرابط أو اسم الحساب أو رقم الهاتف يساعد الجهات المختصة على الوصول إلى من أنشأه أو نشره.",
  },
} as const;

const kindIcon: Record<Kind, IconName> = {
  image: "image",
  video: "videocam",
  audio: "mic",
};

export default function ResultScreen() {
  const { t, isRTL } = useLang();
  const router = useRouter();
  const p = useLocalSearchParams<{
    uri: string;
    name: string;
    kind: string;
    mime: string;
  }>();
  const kind = p.kind as Kind;

  const [result, setResult] = useState<Result | null>(null);
  const [failed, setFailed] = useState(false);
  const [step, setStep] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);

  const steps = useMemo(
    () => [
      t.stepMeta,
      ...(kind !== "audio" ? [t.stepVisual] : []),
      ...(kind !== "image" ? [t.stepVoice] : []),
      t.stepCombine,
    ],
    [t, kind],
  );

  useEffect(() => {
    let live = true;
    const timer = setInterval(
      () => setStep((s) => Math.min(s + 1, steps.length - 1)),
      900,
    );
    analyzeFile({ uri: p.uri, name: p.name, mimeType: p.mime }, kind)
      .then((r) => live && setResult(r))
      .catch(() => live && setFailed(true))
      .finally(() => clearInterval(timer));
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [kind, p.mime, p.name, p.uri, steps.length]);

  const sigLabel = { meta: t.sigMeta, visual: t.sigVisual, voice: t.sigVoice };
  const sigText = { flag: t.stFlag, ok: t.stOk, unknown: t.stUnknown };

  const scanning = !result && !failed;

  return (
    <Screen>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.back}
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}
      >
        <Row style={{ gap: 4 }}>
          <Ionicons
            name="chevron-back"
            size={20}
            color={colors.primary}
            style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
          />
          <T bold color={colors.primary}>
            {t.back}
          </T>
        </Row>
      </Pressable>

      {/* Verdict sits above the preview once the result is in. The preview below
          keeps the same position in the tree, so the video player is never remounted. */}
      {result ? (
        <View
          accessibilityLiveRegion="polite"
          style={[
            styles.verdict,
            { backgroundColor: verdictMeta[result.verdict].bg },
          ]}
        >
          {/* soft decorative shapes */}
          <View
            pointerEvents="none"
            style={[
              styles.decoA,
              { backgroundColor: verdictMeta[result.verdict].fg },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.decoB,
              { backgroundColor: verdictMeta[result.verdict].fg },
            ]}
          />

          <View style={styles.verdictRing}>
            <View style={styles.verdictIcon}>
              <Ionicons
                name={verdictMeta[result.verdict].icon}
                size={44}
                color={verdictMeta[result.verdict].fg}
              />
            </View>
          </View>

          <T
            v="title"
            color={verdictMeta[result.verdict].fg}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={styles.verdictTitle}
          >
            {t.verdict[result.verdict]}
          </T>
          <T style={styles.verdictText}>{t.explain[result.verdict]}</T>
        </View>
      ) : null}

      {!failed ? (
        <MediaPreview
          uri={p.uri}
          kind={kind}
          name={p.name}
          height={result ? 200 : 240}
          scanning={scanning}
        />
      ) : null}

      {failed ? (
        <Surface>
          <View style={styles.failIcon}>
            <Ionicons name="cloud-offline" size={32} color={colors.fake} />
          </View>
          <T
            accessibilityLiveRegion="polite"
            style={{ textAlign: "center", fontSize: 17, lineHeight: 25 }}
          >
            {t.error}
          </T>
          <Button label={t.again} onPress={() => router.replace("/")} />
        </Surface>
      ) : !result ? (
        <Surface>
          <T v="h2" accessibilityLiveRegion="polite">
            {t.analysing}
          </T>
          <Progress value={(step + 1) / steps.length} />
          <View style={{ gap: space.m }}>
            {steps.map((label, i) => (
              <Row key={label} style={{ opacity: i > step ? 0.4 : 1, gap: 12 }}>
                <View style={styles.stepMark}>
                  {i < step ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={26}
                      color={colors.ok}
                    />
                  ) : i === step ? (
                    <ActivityIndicator
                      color={colors.primary}
                      style={{ width: 26, height: 26 }}
                    />
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={26}
                      color={colors.muted}
                    />
                  )}
                </View>
                <T style={styles.flexText}>{label}</T>
              </Row>
            ))}
          </View>
        </Surface>
      ) : (
        <>
          <Surface>
            <T v="h2" style={{ marginBottom: 4 }}>
              {t.foundTitle}
            </T>
            <View style={{ gap: 14 }}>
              {result.signals.map((s) => (
                <View key={s.key} style={styles.signalCard}>
                  <View
                    style={[
                      styles.signalChip,
                      { backgroundColor: statusMeta[s.status].bg },
                    ]}
                  >
                    <Ionicons
                      name={statusMeta[s.status].icon}
                      size={24}
                      color={statusMeta[s.status].fg}
                    />
                  </View>
                  <View style={styles.signalBody}>
                    <T bold style={styles.signalLabel}>
                      {sigLabel[s.key]}
                    </T>
                    <View style={styles.signalPill}>
                      <Pill
                        label={sigText[s.status]}
                        fg={statusMeta[s.status].fg}
                        bg={statusMeta[s.status].bg}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Surface>

          <Surface>
            <T v="h2">{t.nextTitle}</T>
            <View style={{ gap: space.m }}>
              {t.next[result.verdict].map((line, i) => (
                <View key={i} style={styles.stepRow}>
                  <View
                    style={[
                      styles.chip,
                      { backgroundColor: colors.primarySoft },
                    ]}
                  >
                    <T bold color={colors.primary}>
                      {i + 1}
                    </T>
                  </View>
                  <T style={[styles.flexText, { paddingTop: 5 }]}>{line}</T>
                </View>
              ))}
            </View>
          </Surface>

          <T
            v="small"
            color={colors.muted}
            style={{ paddingHorizontal: 4, lineHeight: 20 }}
          >
            {t.limits}
          </T>

          <View style={{ gap: space.s }}>
            <Button
              kind={result.verdict === "ok" ? "soft" : "danger"}
              icon="flag"
              label={t.report}
              onPress={() => setReportOpen(true)}
            />
            <Button
              icon="refresh"
              label={t.again}
              onPress={() => router.replace("/")}
            />
          </View>
        </>
      )}

      <ReportSheet open={reportOpen} onClose={() => setReportOpen(false)} />
    </Screen>
  );
}

function Surface({ children }: { children: React.ReactNode }) {
  return <View style={styles.surface}>{children}</View>;
}

function Progress({ value }: { value: number }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, {
      toValue: value,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [v, value]);
  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: v.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
}

function VideoBox({ uri, height }: { uri: string; height: number }) {
  const player = useVideoPlayer(uri);
  return (
    <VideoView
      player={player}
      style={{ width: "100%", height }}
      contentFit="contain"
      nativeControls
    />
  );
}

const BARS = [14, 28, 18, 36, 22, 30, 12, 26, 34, 16, 24, 30, 18, 28];

// Shows the file being checked, so people can confirm it is the right one.
function MediaPreview({
  uri,
  kind,
  name,
  height,
  scanning,
}: {
  uri: string;
  kind: Kind;
  name: string;
  height: number;
  scanning?: boolean;
}) {
  const [sweep] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!scanning) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          toValue: 0,
          duration: 1300,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scanning, sweep]);

  return (
    <View style={{ gap: space.s }}>
      <View
        style={[
          styles.media,
          {
            height,
            backgroundColor: kind === "audio" ? colors.primarySoft : "#14193A",
          },
          scanning && { borderWidth: 0 },
        ]}
      >
        {kind === "image" ? (
          <Image
            source={{ uri }}
            accessibilityLabel={name}
            style={{ width: "100%", height }}
            resizeMode="contain"
          />
        ) : kind === "video" ? (
          <VideoBox uri={uri} height={height} />
        ) : (
          <Row style={{ justifyContent: "center", gap: 5 }}>
            <Ionicons name="mic" size={28} color={colors.primary} />
            {BARS.map((h, i) => (
              <View
                key={i}
                style={{
                  width: 5,
                  height: h,
                  borderRadius: 3,
                  backgroundColor: colors.primary,
                }}
              />
            ))}
          </Row>
        )}
        {scanning ? (
          <>
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: "#8F85FF",
                shadowColor: "#8F85FF",
                shadowOpacity: 0.9,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 0 },
                elevation: 6,
                transform: [
                  {
                    translateY: sweep.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, height - 3],
                    }),
                  },
                ],
              }}
            />
          </>
        ) : null}
      </View>
      <Row style={{ gap: 6, paddingHorizontal: 4 }}>
        <Ionicons name={kindIcon[kind]} size={16} color={colors.muted} />
        <T v="small" color={colors.muted} numberOfLines={1} style={{ flex: 1 }}>
          {name}
        </T>
      </Row>
    </View>
  );
}

// Simulated: nothing is sent anywhere. Replace onSend with a real call when a channel exists.
function ReportSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t, isRTL } = useLang();
  const [agreed, setAgreed] = useState(false);
  const [sent, setSent] = useState(false);
  const [source, setSource] = useState("");
  const sc = sourceCopy[isRTL ? "ar" : "en"];

  function close() {
    onClose();
    setAgreed(false);
    setSent(false);
    setSource("");
  }

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <T v="h2">{t.reportTitle}</T>
          {sent ? (
            <>
              <Row style={{ gap: 12 }}>
                <Ionicons name="checkmark-circle" size={30} color={colors.ok} />
                <T bold style={styles.flexText}>
                  {t.sent}
                </T>
              </Row>
              <Button kind="soft" label={t.close} onPress={close} />
            </>
          ) : (
            <>
              <T color={colors.muted} style={{ lineHeight: 24 }}>
                {t.reportDemo}
              </T>

              <View style={{ gap: 8 }}>
                <Row style={{ justifyContent: "space-between", gap: 12 }}>
                  <T bold style={{ fontSize: 17 }}>
                    {sc.label}
                  </T>
                  <Pill
                    label={sc.optional}
                    fg={colors.muted}
                    bg={NEUTRAL_SOFT}
                  />
                </Row>
                <TextInput
                  value={source}
                  onChangeText={setSource}
                  placeholder={sc.placeholder}
                  placeholderTextColor={colors.muted}
                  accessibilityLabel={`${sc.label} (${sc.optional})`}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  style={[
                    styles.input,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                />
                <T v="small" color={colors.muted} style={{ lineHeight: 20 }}>
                  {sc.hint}
                </T>
              </View>

              <Row style={{ justifyContent: "space-between", gap: 12 }}>
                <T style={styles.flexText}>{t.consent}</T>
                <Switch
                  value={agreed}
                  onValueChange={setAgreed}
                  accessibilityLabel={t.consent}
                  trackColor={{ true: colors.primary }}
                  style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                />
              </Row>
              <Button
                icon="send"
                label={t.send}
                disabled={!agreed}
                onPress={() => {
                  // `source` is optional and may be an empty string.
                  // Include it in the real report payload when a channel exists.
                  setSent(true);
                }}
              />
              <Button kind="soft" label={t.close} onPress={close} />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Text that must wrap inside a row instead of running off screen
  flexText: { flex: 1, flexShrink: 1, fontSize: 17, lineHeight: 24 },

  back: {
    minHeight: 44,
    justifyContent: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    shadowColor: "#1B2250",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  verdict: {
    borderRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    gap: 12,
    alignItems: "center",
    overflow: "hidden",
  },
  decoA: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -90,
    right: -70,
    opacity: 0.1,
  },
  decoB: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -60,
    left: -50,
    opacity: 0.08,
  },
  verdictRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  verdictIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1B2250",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  verdictTitle: {
    textAlign: "center",
    fontSize: 30,
    lineHeight: 37,
    fontWeight: "800",
    letterSpacing: -0.4,
    alignSelf: "stretch",
  },
  verdictText: {
    textAlign: "center",
    fontSize: 17,
    lineHeight: 25,
    alignSelf: "stretch",
  },

  failIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.fakeSoft,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  media: {
    borderRadius: 30,
    overflow: "hidden",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HAIRLINE,
  },

  surface: {
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 22,
    gap: space.m,
    shadowColor: "#1B2250",
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: NEUTRAL_SOFT,
    overflow: "hidden",
  },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  stepMark: { width: 26, height: 26 },

  signalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: "#F7F8FC",
    minHeight: 84,
  },
  signalChip: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  signalBody: { flex: 1, gap: 8, alignItems: "flex-start" },
  signalLabel: { fontSize: 17, lineHeight: 24, alignSelf: "stretch" },
  signalPill: { alignSelf: "flex-start" },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  chip: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(20,25,58,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: space.l,
    gap: space.m,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: "#F7F8FC",
    paddingHorizontal: 16,
    fontSize: 17,
    color: "#141B3A",
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D9DEEA",
    alignSelf: "center",
  },
});
