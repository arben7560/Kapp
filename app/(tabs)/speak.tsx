import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BG = "#060816";
const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.7)";
const CARD = "rgba(255,255,255,0.06)";
const LINE = "rgba(255,255,255,0.1)";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const PURPLE = "#8B5CF6";
const ORANGE = "#FB923C";

const fonts = {
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  medium: "Outfit_500Medium",
  kr: "NotoSansKR_700Bold",
};

type ThemeKey = "cafe" | "metro" | "restaurant";

function go(pathname: string, params?: Record<string, string>) {
  requestAnimationFrame(() =>
    router.push({
      pathname: pathname as never,
      params: params as never,
    }),
  );
}

export default function SpeakScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [themesY, setThemesY] = useState(0);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | null>(null);

  const scrollToThemes = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(themesY - 12, 0),
      animated: true,
    });
  };

  const openThemeSheet = (theme: ThemeKey) => {
    setSelectedTheme(theme);
    setSheetVisible(true);
  };

  const closeThemeSheet = () => {
    setSheetVisible(false);
  };

  const getThemeConfig = (theme: ThemeKey | null) => {
    switch (theme) {
      case "cafe":
        return {
          icon: "☕",
          title: "Café",
          accent: PINK,
          accentBg: "rgba(244,114,182,0.12)",
          textRoute: "/lesson/cafe",
          iaRoute: "/lesson/cafeIA",
          iaRouteParams: { mode: "guided" },
          iaRealRoute: "/lesson/cafeIA",
          iaRealRouteParams: { mode: "real" },
        };
      case "metro":
        return {
          icon: "🚇",
          title: "Métro",
          accent: CYAN,
          accentBg: "rgba(34,211,238,0.12)",
          textRoute: "/lesson/metro",
          iaRoute: "/lesson/metroIA",
          iaRouteParams: undefined,
          iaRealRoute: null,
          iaRealRouteParams: undefined,
        };

      case "restaurant":
        return {
          icon: "🍽️",
          title: "Restaurant",
          accent: ORANGE,
          accentBg: "rgba(251,146,60,0.12)",
          textRoute: "/lesson/restaurant",
          iaRoute: "/lesson/restaurantIA",
          iaRouteParams: undefined,
          iaRealRoute: null,
          iaRealRouteParams: undefined,
        };
      default:
        return null;
    }
  };

  const themeConfig = getThemeConfig(selectedTheme);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <LinearGradient colors={[BG, "#090D1D", "#0B1123"]} style={{ flex: 1 }}>
        <View pointerEvents="none" style={styles.pageGlowTopLeft} />
        <View pointerEvents="none" style={styles.pageGlowBottomRight} />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        >
          <Hero onStart={scrollToThemes} />

          <View style={{ height: 20 }} />

          <Modes />

          <View style={{ height: 20 }} />

          <Themes onLayoutY={setThemesY} onSelectTheme={openThemeSheet} />
        </ScrollView>

        <ThemeModeSheet
          visible={sheetVisible}
          onClose={closeThemeSheet}
          themeConfig={themeConfig}
          selectedTheme={selectedTheme}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <View style={styles.hero}>
      <View pointerEvents="none" style={styles.glow1} />
      <View pointerEvents="none" style={styles.glow2} />

      <DialogueVisual width={260} height={140} />

      <View style={{ height: 18 }} />

      <Text style={styles.heroEyebrow}>DIALOGUES RÉELS</Text>

      <Text style={styles.title}>Dialogues</Text>

      <Text style={styles.subtitle}>
        Entre dans des scènes réelles et choisis le thème que tu veux explorer.
      </Text>

      <Pressable
        onPress={onStart}
        style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.92 : 1 }]}
      >
        <LinearGradient
          colors={["#7C3AED", "#8B5CF6", "#22D3EE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaInner}
        >
          <Text style={styles.ctaText}>▶ Commencer</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function DialogueVisual({ width, height }: { width: number; height: number }) {
  return (
    <View
      style={[
        styles.dialogueVisual,
        {
          width,
          height,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: width * 0.55,
          height: width * 0.55,
          borderRadius: 999,
          backgroundColor: "rgba(244,114,182,0.10)",
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: width * 0.28,
          height: width * 0.28,
          borderRadius: 999,
          backgroundColor: "rgba(244,114,182,0.16)",
        }}
      />

      <Text
        style={{
          color: TXT,
          fontSize: width * 0.18,
          fontFamily: fonts.kr,
        }}
      >
        회
      </Text>
    </View>
  );
}

function Modes() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionEyebrow}>MODES</Text>
      <Text style={styles.sectionTitle}>3 façons d’apprendre</Text>
      <Text style={styles.sectionSubtitle}>
        Choisis une porte d’entrée selon ton envie du moment.
      </Text>

      <View style={{ height: 14 }} />

      <ModeCard
        title="Simulation IA"
        subtitle="Parle et répond en temps réel dans une scène guidée."
        color={PURPLE}
        onPress={() => go("/lesson/cafeIA")}
      />

      <ModeCard
        title="Voyage réel"
        subtitle="Découvre des situations concrètes comme si tu étais à Séoul."
        color={CYAN}
        onPress={() => go("/lesson/gangnamRainRun")}
      />

      <ModeCard
        title="Bases utiles"
        subtitle="Révisions rapides pour installer les réflexes essentiels."
        color={ORANGE}
        onPress={() => go("/lesson/dialoguesBasics")}
      />
    </View>
  );
}

function ModeCard({
  title,
  subtitle,
  color,
  onPress,
}: {
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.mode,
        {
          borderColor: color,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.modeGlow,
          {
            backgroundColor:
              color === PURPLE
                ? "rgba(139,92,246,0.12)"
                : color === CYAN
                  ? "rgba(34,211,238,0.12)"
                  : "rgba(251,146,60,0.12)",
          },
        ]}
      />

      <Text style={styles.modeTitle}>{title}</Text>
      <Text style={styles.modeSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

function Themes({
  onLayoutY,
  onSelectTheme,
}: {
  onLayoutY: (y: number) => void;
  onSelectTheme: (theme: ThemeKey) => void;
}) {
  const handleLayout = (e: LayoutChangeEvent) => {
    onLayoutY(e.nativeEvent.layout.y);
  };

  return (
    <View onLayout={handleLayout} style={styles.section}>
      <Text style={styles.sectionEyebrow}>THÈMES</Text>
      <Text style={styles.sectionTitle}>Choisis un thème</Text>
      <Text style={styles.sectionSubtitle}>
        Sélectionne directement la scène que tu veux travailler.
      </Text>

      <View style={{ height: 14 }} />

      <ThemeCard
        icon="☕"
        title="Café"
        subtitle="Commander et payer"
        accentColor={PINK}
        onPress={() => onSelectTheme("cafe")}
      />

      <ThemeCard
        icon="🚇"
        title="Métro"
        subtitle="Directions et sorties"
        accentColor={CYAN}
        onPress={() => onSelectTheme("metro")}
      />

      <ThemeCard
        icon="🍽️"
        title="Restaurant"
        subtitle="Commander et interagir"
        accentColor={ORANGE}
        onPress={() => onSelectTheme("restaurant")}
      />
    </View>
  );
}

function ThemeCard({
  icon,
  title,
  subtitle,
  accentColor,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  accentColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.theme,
        {
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.themeAccentBar,
          {
            backgroundColor: accentColor,
          },
        ]}
      />

      <View
        style={[
          styles.themeIconWrap,
          {
            borderColor: accentColor,
            backgroundColor:
              accentColor === PINK
                ? "rgba(244,114,182,0.12)"
                : accentColor === CYAN
                  ? "rgba(34,211,238,0.12)"
                  : "rgba(251,146,60,0.12)",
          },
        ]}
      >
        <Text style={styles.themeIcon}>{icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.themeTitle}>{title}</Text>
        <Text style={styles.themeSubtitle}>{subtitle}</Text>
      </View>

      <Text style={styles.themeArrow}>›</Text>
    </Pressable>
  );
}

function ThemeModeSheet({
  visible,
  onClose,
  themeConfig,
  selectedTheme,
}: {
  visible: boolean;
  onClose: () => void;
  selectedTheme: ThemeKey | null;
  themeConfig: {
    icon: string;
    title: string;
    accent: string;
    accentBg: string;
    textRoute: string;
    iaRoute: string;
    iaRouteParams?: Record<string, string>;
    iaRealRoute: string | null;
    iaRealRouteParams?: Record<string, string>;
  } | null;
}) {
  const isCafe = selectedTheme === "cafe";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />

        <View style={styles.sheetWrap}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetCard}>
            <View style={styles.sheetHeader}>
              <View
                style={[
                  styles.sheetThemeIconWrap,
                  {
                    borderColor: themeConfig?.accent ?? PINK,
                    backgroundColor:
                      themeConfig?.accentBg ?? "rgba(255,255,255,0.08)",
                  },
                ]}
              >
                <Text style={styles.sheetThemeIcon}>
                  {themeConfig?.icon ?? "✨"}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>
                  {themeConfig?.title ?? "Thème"}
                </Text>
                <Text style={styles.sheetSubtitle}>
                  {isCafe
                    ? "Choisis ton style d’apprentissage"
                    : "Choisis ton mode d’apprentissage"}
                </Text>
              </View>
            </View>

            <View style={{ height: 14 }} />

            <SheetOptionCard
              title="Version textuelle"
              subtitle="Lire, comprendre et réviser les phrases du thème."
              accentColor={themeConfig?.accent ?? PINK}
              onPress={() => {
                if (!themeConfig) return;
                onClose();
                go(themeConfig.textRoute);
              }}
            />

            <SheetOptionCard
              title="Simulation IA — guidée"
              subtitle="Dialogue clair, progressif et plus pédagogique."
              accentColor={themeConfig?.accent ?? PINK}
              onPress={() => {
                if (!themeConfig) return;
                onClose();
                go(themeConfig.iaRoute, themeConfig.iaRouteParams);
              }}
            />

            {isCafe && themeConfig?.iaRealRoute ? (
              <SheetOptionCard
                title="Simulation IA — café réel"
                subtitle="Répliques plus directes, plus natives et plus immersives."
                accentColor={themeConfig.accent}
                onPress={() => {
                  if (!themeConfig?.iaRealRoute) return;
                  onClose();
                  go(themeConfig.iaRealRoute, themeConfig.iaRealRouteParams);
                }}
              />
            ) : null}

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.sheetCloseButton,
                { opacity: pressed ? 0.92 : 1 },
              ]}
            >
              <Text style={styles.sheetCloseText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SheetOptionCard({
  title,
  subtitle,
  accentColor,
  onPress,
}: {
  title: string;
  subtitle: string;
  accentColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sheetOption,
        {
          borderColor: accentColor,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.sheetOptionGlow,
          {
            backgroundColor:
              accentColor === PINK
                ? "rgba(244,114,182,0.10)"
                : accentColor === CYAN
                  ? "rgba(34,211,238,0.10)"
                  : "rgba(251,146,60,0.10)",
          },
        ]}
      />

      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.sheetOptionTitle}>{title}</Text>
        <Text style={styles.sheetOptionSubtitle}>{subtitle}</Text>
      </View>

      <Text style={styles.sheetOptionArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pageGlowTopLeft: {
    position: "absolute",
    top: -120,
    left: -110,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(139,92,246,0.10)",
  },

  pageGlowBottomRight: {
    position: "absolute",
    bottom: -150,
    right: -120,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(34,211,238,0.10)",
  },

  hero: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: CARD,
    padding: 20,
    alignItems: "center",
    overflow: "hidden",
  },

  glow1: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(139,92,246,0.12)",
  },

  glow2: {
    position: "absolute",
    bottom: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(34,211,238,0.12)",
  },

  dialogueVisual: {
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: PINK,
    backgroundColor: "rgba(244,114,182,0.13)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  heroEyebrow: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 11,
    letterSpacing: 1.3,
    fontFamily: fonts.black,
    marginBottom: 8,
  },

  title: {
    color: TXT,
    fontSize: 34,
    fontFamily: fonts.black,
  },

  subtitle: {
    color: MUTED,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
    fontFamily: fonts.medium,
    lineHeight: 21,
    maxWidth: 300,
  },

  cta: {
    borderRadius: 14,
    overflow: "hidden",
  },

  ctaInner: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },

  ctaText: {
    color: "white",
    fontFamily: fonts.bold,
    fontSize: 14,
  },

  section: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: CARD,
    padding: 16,
    overflow: "hidden",
  },

  sectionEyebrow: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 11,
    letterSpacing: 1.2,
    fontFamily: fonts.black,
    marginBottom: 6,
  },

  sectionTitle: {
    color: TXT,
    fontSize: 20,
    fontFamily: fonts.black,
  },

  sectionSubtitle: {
    color: MUTED,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
    fontFamily: fonts.medium,
  },

  mode: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    overflow: "hidden",
  },

  modeGlow: {
    position: "absolute",
    top: -14,
    right: -12,
    width: 72,
    height: 72,
    borderRadius: 999,
  },

  modeTitle: {
    color: TXT,
    fontSize: 16,
    fontFamily: fonts.bold,
  },

  modeSubtitle: {
    color: MUTED,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
    fontFamily: fonts.medium,
  },

  theme: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  themeAccentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },

  themeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  themeIcon: {
    fontSize: 18,
  },

  themeTitle: {
    color: TXT,
    fontSize: 16,
    fontFamily: fonts.bold,
  },

  themeSubtitle: {
    color: MUTED,
    fontSize: 13,
    marginTop: 4,
    fontFamily: fonts.medium,
  },

  themeArrow: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 28,
    fontFamily: fonts.medium,
    marginLeft: 8,
    marginTop: -2,
  },

  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.40)",
  },

  sheetBackdrop: {
    flex: 1,
  },

  sheetWrap: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.24)",
    marginBottom: 10,
  },

  sheetCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "#0B1123",
    padding: 16,
    overflow: "hidden",
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  sheetThemeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  sheetThemeIcon: {
    fontSize: 22,
  },

  sheetTitle: {
    color: TXT,
    fontSize: 21,
    fontFamily: fonts.black,
  },

  sheetSubtitle: {
    color: MUTED,
    fontSize: 14,
    fontFamily: fonts.medium,
    marginTop: 4,
  },

  sheetOption: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  sheetOptionGlow: {
    position: "absolute",
    top: -18,
    right: -12,
    width: 84,
    height: 84,
    borderRadius: 999,
  },

  sheetOptionTitle: {
    color: TXT,
    fontSize: 16,
    fontFamily: fonts.bold,
    marginBottom: 4,
  },

  sheetOptionSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
  },

  sheetOptionArrow: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 28,
    fontFamily: fonts.medium,
    marginLeft: 8,
    marginTop: -2,
  },

  sheetCloseButton: {
    marginTop: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  sheetCloseText: {
    color: TXT,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
});
