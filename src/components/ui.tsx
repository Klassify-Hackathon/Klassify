import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, ReactNode } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextProps,
    View,
    ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLang } from "@/components/i18n";
import { colors, radius, space } from "@/lib/theme";

export type IconName = ComponentProps<typeof Ionicons>["name"];

const sizes = { title: 30, h2: 21, body: 17, small: 14 } as const;

// Text that follows the current language direction. Sizes are large on purpose.
export function T({
  v = "body",
  color = colors.ink,
  bold,
  style,
  ...rest
}: TextProps & { v?: keyof typeof sizes; color?: string; bold?: boolean }) {
  const { isRTL } = useLang();
  return (
    <Text
      {...rest}
      style={[
        {
          fontSize: sizes[v],
          lineHeight: sizes[v] * 1.4,
          color,
          fontWeight: bold || v === "title" || v === "h2" ? "700" : "400",
          textAlign: isRTL ? "right" : "left",
          writingDirection: isRTL ? "rtl" : "ltr",
        },
        style,
      ]}
    />
  );
}

// A horizontal row that flips in Arabic.
export function Row({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  const { isRTL } = useLang();
  return (
    <View
      style={[
        {
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          gap: space.s,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: space.m, paddingBottom: space.xl }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 560,
            alignSelf: "center",
            gap: space.m,
          }}
        >
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ButtonKind = "primary" | "light" | "soft" | "danger";
const buttonColors: Record<ButtonKind, { bg: string; fg: string }> = {
  primary: { bg: colors.primary, fg: "#FFFFFF" },
  light: { bg: "#FFFFFF", fg: colors.primary },
  soft: { bg: colors.primarySoft, fg: colors.primary },
  danger: { bg: colors.fake, fg: "#FFFFFF" },
};

// 60dp tall: easy to hit for older users.
export function Button({
  label,
  onPress,
  icon,
  kind = "primary",
  disabled,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  kind?: ButtonKind;
  disabled?: boolean;
}) {
  const { bg, fg } = buttonColors[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
      ]}
    >
      <Row style={{ justifyContent: "center" }}>
        {icon ? <Ionicons name={icon} size={26} color={fg} /> : null}
        <T bold color={fg} style={{ flexShrink: 1 }}>
          {label}
        </T>
      </Row>
    </Pressable>
  );
}

export function Pill({
  label,
  fg,
  bg,
}: {
  label: string;
  fg: string;
  bg: string;
}) {
  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: space.s,
        paddingVertical: 4,
        borderRadius: radius.pill,
        alignSelf: "flex-start",
      }}
    >
      <T v="small" bold color={fg}>
        {label}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.m,
    gap: space.s,
  },
  button: {
    minHeight: 60,
    borderRadius: radius.m,
    paddingHorizontal: space.m,
    paddingVertical: space.s,
    justifyContent: "center",
  },
});
