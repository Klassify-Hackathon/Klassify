import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Switch,
    View,
} from "react-native";

import { useLang } from "@/components/i18n";
import { Button, Card, IconName, Pill, Row, Screen, T } from "@/components/ui";
import {
    analyzeFile,
    Kind,
    Result,
    SignalStatus,
    Verdict,
} from "@/lib/analyze";
import { colors, IS_MOCK, radius, space } from "@/lib/theme";

const verdictMeta: Record<Verdict, { fg: string; bg: string; icon: IconName }> =
  {
    fake: { fg: colors.fake, bg: colors.fakeSoft, icon: "warning" },
    unsure: { fg: colors.unsure, bg: colors.unsureSoft, icon: "help-circle" },
    ok: { fg: colors.ok, bg: colors.okSoft, icon: "shield-checkmark" },
  };

const statusMeta: Record<SignalStatus, { fg: string; icon: IconName }> = {
  flag: { fg: colors.fake, icon: "alert-circle" },
  ok: { fg: colors.ok, icon: "checkmark-circle" },
  unknown: { fg: colors.muted, icon: "help-circle" },
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

  // Only show the steps that apply to this kind of file.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sigLabel = { meta: t.sigMeta, visual: t.sigVisual, voice: t.sigVoice };
  const sigText = { flag: t.stFlag, ok: t.stOk, unknown: t.stUnknown };

  return (
    <Screen>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.back}
        onPress={() => router.back()}
        style={styles.back}
      >
        <Row>
          <Ionicons
            name="chevron-back"
            size={22}
            color={colors.primary}
            style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
          />
          <T bold color={colors.primary}>
            {t.back}
          </T>
        </Row>
      </Pressable>

      {failed ? (
        <Card>
          <T accessibilityLiveRegion="polite">{t.error}</T>
          <Button label={t.again} onPress={() => router.replace("/")} />
        </Card>
      ) : !result ? (
        <Card>
          <T v="h2" accessibilityLiveRegion="polite">
            {t.analysing}
          </T>
          {steps.map((label, i) => (
            <Row key={label} style={{ opacity: i > step ? 0.4 : 1 }}>
              {i < step ? (
                <Ionicons name="checkmark-circle" size={24} color={colors.ok} />
              ) : i === step ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={{ width: 24, height: 24 }}
                />
              ) : (
                <Ionicons
                  name="ellipse-outline"
                  size={24}
                  color={colors.muted}
                />
              )}
              <T style={{ flex: 1 }}>{label}</T>
            </Row>
          ))}
        </Card>
      ) : (
        <>
          <View
            accessibilityLiveRegion="polite"
            style={[
              styles.verdict,
              { backgroundColor: verdictMeta[result.verdict].bg },
            ]}
          >
            <Row>
              <Ionicons
                name={verdictMeta[result.verdict].icon}
                size={40}
                color={verdictMeta[result.verdict].fg}
              />
              <T
                v="title"
                color={verdictMeta[result.verdict].fg}
                style={{ flex: 1 }}
              >
                {t.verdict[result.verdict]}
              </T>
            </Row>
            <T>{t.explain[result.verdict]}</T>
            {IS_MOCK ? (
              <Pill label={t.demoBadge} fg={colors.primary} bg="#FFFFFF" />
            ) : null}
          </View>

          <Card>
            <T v="h2">{t.foundTitle}</T>
            {result.signals.map((s) => (
              <Row key={s.key} style={{ justifyContent: "space-between" }}>
                <T style={{ flex: 1 }}>{sigLabel[s.key]}</T>
                <Row style={{ gap: 6 }}>
                  <Ionicons
                    name={statusMeta[s.status].icon}
                    size={20}
                    color={statusMeta[s.status].fg}
                  />
                  <T v="small" bold color={statusMeta[s.status].fg}>
                    {sigText[s.status]}
                  </T>
                </Row>
              </Row>
            ))}
          </Card>

          <Card>
            <T v="h2">{t.nextTitle}</T>
            {t.next[result.verdict].map((line, i) => (
              <Row key={i} style={{ alignItems: "flex-start" }}>
                <Ionicons
                  name="arrow-forward-circle"
                  size={22}
                  color={colors.primary}
                />
                <T style={{ flex: 1 }}>{line}</T>
              </Row>
            ))}
          </Card>

          <T v="small" color={colors.muted}>
            {t.limits}
          </T>

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
        </>
      )}

      <ReportSheet open={reportOpen} onClose={() => setReportOpen(false)} />
    </Screen>
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

  function close() {
    onClose();
    setAgreed(false);
    setSent(false);
  }

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <T v="h2">{t.reportTitle}</T>
          <Pill
            label={t.demoBadge}
            fg={colors.primary}
            bg={colors.primarySoft}
          />
          {sent ? (
            <>
              <Row>
                <Ionicons name="checkmark-circle" size={28} color={colors.ok} />
                <T bold style={{ flex: 1 }}>
                  {t.sent}
                </T>
              </Row>
              <Button kind="soft" label={t.close} onPress={close} />
            </>
          ) : (
            <>
              <T color={colors.muted}>{t.reportDemo}</T>
              <Row style={{ justifyContent: "space-between" }}>
                <T style={{ flex: 1 }}>{t.consent}</T>
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
                onPress={() => setSent(true)}
              />
              <Button kind="soft" label={t.close} onPress={close} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  verdict: { borderRadius: radius.l, padding: space.l, gap: space.s },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(20,25,58,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.l,
    borderTopRightRadius: radius.l,
    padding: space.l,
    gap: space.m,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
});
