import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ──────────────────────────────────────────────
// DESIGN SYSTEM
// ──────────────────────────────────────────────
const BG_DEEP = "#050508";
const BG_NAVY = "#0A0D1A";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.68)";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const ORANGE = "#FB923C";

const fonts = {
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  medium: "Outfit_500Medium",
  kr: "NotoSansKR_700Bold",
};

type ThemeKey = "cafe" | "metro" | "restaurant";

type ThemeConfig = {
  title: string;
  sub: string;
  icon: string;
  accent: string;
  textRoute: string;
  guidedRoute: string;
  guidedParams?: Record<string, string>;
  realRoute?: string;
  realParams?: Record<string, string>;
};

const THEME_CONFIG: Record<ThemeKey, ThemeConfig> = {
  cafe: {
    title: "Le Café",
    sub: "Hongdae • 14:00",
    icon: "☕",
    accent: PINK,
    textRoute: "/lesson/cafe",
    guidedRoute: "/lesson/cafeIA",
    guidedParams: { mode: "guided" },
    realRoute: "/lesson/cafeIA",
    realParams: { mode: "real" },
  },
  metro: {
    title: "Le Métro",
    sub: "Ligne 2 • Gangnam",
    icon: "🚇",
    accent: CYAN,
    textRoute: "/lesson/metro",
    guidedRoute: "/lesson/metroIA",
  },
  restaurant: {
    title: "Restaurant",
    sub: "Itaewon • Dîner",
    icon: "🍽️",
    accent: ORANGE,
    textRoute: "/lesson/restaurant",
    guidedRoute: "/lesson/restaurantIA",
  },
};

// ──────────────────────────────────────────────
// SCREEN
// ──────────────────────────────────────────────
export default function SpeakScreen() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | null>(null);

  const openThemeSheet = (theme: ThemeKey) => {
    setSelectedTheme(theme);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setSelectedTheme(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG_DEEP }}>
      <LinearGradient colors={[BG_DEEP, BG_NAVY]} style={{ flex: 1 }}>
        <View
          style={[
            styles.pageGlow,
            { top: -140, left: -100, backgroundColor: "rgba(168,85,247,0.07)" },
          ]}
        />
        <View
          style={[
            styles.pageGlow,
            {
              bottom: 100,
              right: -90,
              backgroundColor: "rgba(34,211,238,0.05)",
            },
          ]}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Hero />
          <View style={{ height: 48 }} />
          <Scenes onSelectTheme={openThemeSheet} />
        </ScrollView>

        <ThemeModeSheet
          visible={sheetVisible}
          onClose={closeSheet}
          selectedTheme={selectedTheme}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────
// HERO
// ──────────────────────────────────────────────
function Hero() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 850,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fadeAnim, floatAnim, pulseAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });

  return (
    <View style={styles.heroContainer}>
      <Text style={styles.heroEyebrow}>SÉOUL IMMERSION</Text>
      <Text style={styles.heroTitle}>Dialogues</Text>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
        <BlurView intensity={88} tint="dark" style={styles.glassCard}>
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.09)",
              "transparent",
              "rgba(244,114,182,0.07)",
            ]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.cardHeader}>
            <View style={styles.statusDot} />
            <Text style={styles.cardHeaderText}>LIVE FROM HONGDAE</Text>
          </View>

          <View style={styles.cardMainContent}>
            <Animated.Text
              style={[
                styles.krBig,
                {
                  transform: [{ scale: pulseAnim }],
                  textShadowColor: "#F472B6",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 28,
                },
              ]}
            >
              어서 오세요
            </Animated.Text>

            <View style={styles.speechBubble}>
              <Text style={styles.bubbleText}>
                "Un iced americano, s'il vous plaît."
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            {["Réel", "Guidé", "Vrai"].map((t, i) => (
              <View key={i} style={styles.miniTag}>
                <Text style={styles.miniTagText}>{t}</Text>
              </View>
            ))}
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
}

// ──────────────────────────────────────────────
// SCENES
// ──────────────────────────────────────────────
function Scenes({
  onSelectTheme,
}: {
  onSelectTheme: (theme: ThemeKey) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Scènes</Text>

      <ThemeCard
        icon="☕"
        title="Le Café"
        sub="Hongdae • 14:00"
        accent={PINK}
        gradient={[
          "rgba(244, 114, 182, 0.22)",
          "rgba(244, 114, 182, 0.08)",
          "transparent",
        ]}
        onPress={() => onSelectTheme("cafe")}
      />

      <ThemeCard
        icon="🚇"
        title="Le Métro"
        sub="Ligne 2 • Gangnam"
        accent={CYAN}
        gradient={[
          "rgba(34, 211, 238, 0.22)",
          "rgba(34, 211, 238, 0.08)",
          "transparent",
        ]}
        onPress={() => onSelectTheme("metro")}
      />

      <ThemeCard
        icon="🍽️"
        title="Restaurant"
        sub="Itaewon • Dîner"
        accent={ORANGE}
        gradient={[
          "rgba(251, 146, 60, 0.22)",
          "rgba(251, 146, 60, 0.08)",
          "transparent",
        ]}
        onPress={() => onSelectTheme("restaurant")}
      />
    </View>
  );
}

function ThemeCard({
  icon,
  title,
  sub,
  accent,
  gradient,
  onPress,
}: {
  icon: string;
  title: string;
  sub: string;
  accent: string;
  gradient: string[];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.themeCard,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <BlurView intensity={80} tint="dark" style={styles.themeCardBlur}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0.0, y: 0.5 }}
          end={{ x: 1.0, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.cardAccentLine, { backgroundColor: accent }]} />

        <View
          style={[
            styles.iconBox,
            { backgroundColor: `${accent}22`, borderColor: `${accent}50` },
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.themeTitle}>{title}</Text>
          <Text style={styles.themeSub}>{sub}</Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </BlurView>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// MODAL
// ──────────────────────────────────────────────
function ThemeModeSheet({
  visible,
  onClose,
  selectedTheme,
}: {
  visible: boolean;
  onClose: () => void;
  selectedTheme: ThemeKey | null;
}) {
  const translateY = useRef(new Animated.Value(80)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible && selectedTheme) {
      setMounted(true);
      translateY.setValue(80);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 80,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, selectedTheme, mounted, backdropOpacity, translateY]);

  if (!mounted || !selectedTheme) return null;

  const config = THEME_CONFIG[selectedTheme];

  const go = (pathname: string, params?: Record<string, string>) => {
    onClose();
    requestAnimationFrame(() => {
      router.push({ pathname: pathname as never, params: params as never });
    });
  };

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.sheetRoot}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            styles.sheetBackdrop,
            { opacity: backdropOpacity },
          ]}
        />

        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

        <Animated.View
          style={[
            styles.sheetAnimatedWrap,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <BlurView intensity={92} tint="dark" style={styles.sheetWrap}>
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.045)",
                "transparent",
                "rgba(255,255,255,0.015)",
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <LinearGradient
              colors={[
                `${config.accent}12`,
                `${config.accent}05`,
                "transparent",
              ]}
              start={{ x: 0, y: 0.45 }}
              end={{ x: 1, y: 0.55 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.sheetHandle} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.sheetScrollContent}
            >
              <View style={styles.sheetHeader}>
                <View
                  style={[
                    styles.sheetHeroIcon,
                    {
                      backgroundColor: `${config.accent}14`,
                      borderColor: `${config.accent}30`,
                    },
                  ]}
                >
                  <Text style={styles.sheetHeroIconText}>{config.icon}</Text>
                </View>

                <View style={styles.sheetHeaderTextWrap}>
                  <Text style={styles.sheetTitle}>{config.title}</Text>
                  <Text style={styles.sheetSubtitle}>{config.sub}</Text>
                </View>
              </View>

              <Text style={styles.sheetSectionLabel}>Choisis ton mode</Text>

              <View style={styles.sheetOptions}>
                <SheetOptionCard
                  title="Version texte"
                  subtitle="Lire les phrases et revoir la scène à ton rythme."
                  accent={config.accent}
                  onPress={() => go(config.textRoute)}
                />

                <SheetOptionCard
                  title="Simulation guidée"
                  subtitle="Progressive, plus claire et rassurante."
                  accent={config.accent}
                  onPress={() => go(config.guidedRoute, config.guidedParams)}
                />

                {selectedTheme === "cafe" && config.realRoute && (
                  <SheetOptionCard
                    title="Simulation réelle"
                    subtitle="Plus native, plus directe, plus immersive."
                    accent={config.accent}
                    onPress={() => go(config.realRoute!, config.realParams)}
                  />
                )}
              </View>

              <Pressable onPress={onClose} style={styles.closeButton}>
                <BlurView
                  intensity={24}
                  tint="dark"
                  style={StyleSheet.absoluteFill}
                />
                <LinearGradient
                  colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.02)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.closeButtonText}>Fermer</Text>
              </Pressable>
            </ScrollView>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SheetOptionCard({
  title,
  subtitle,
  accent,
  onPress,
}: {
  title: string;
  subtitle: string;
  accent: string;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.985,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[styles.sheetOptionCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <BlurView intensity={76} tint="dark" style={styles.sheetOptionBlur}>
          <LinearGradient
            colors={[
              `${accent}10`,
              `${accent}04`,
              "rgba(255,255,255,0.015)",
              "transparent",
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />

          <LinearGradient
            colors={["rgba(255,255,255,0.045)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.sheetRow}>
            <View style={styles.sheetTextBlock}>
              <Text style={styles.sheetOptionTitle}>{title}</Text>
              <Text style={styles.sheetOptionSubtitle}>{subtitle}</Text>
            </View>

            <View style={styles.sheetArrowWrap}>
              <Text style={styles.sheetOptionArrow}>›</Text>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140,
  },

  pageGlow: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
  },

  heroContainer: {
    alignItems: "center",
  },

  heroEyebrow: {
    color: PINK,
    fontFamily: fonts.bold,
    fontSize: 13.5,
    letterSpacing: 3.2,
    marginBottom: 8,
  },

  heroTitle: {
    color: TXT,
    fontSize: 46,
    fontFamily: fonts.black,
    letterSpacing: -1.4,
    marginTop: 15,
    marginBottom: 35,
  },

  glassCard: {
    width: 340,
    minHeight: 242,
    borderRadius: 34,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
    padding: 24,
    justifyContent: "space-between",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },

  cardHeaderText: {
    color: MUTED,
    fontSize: 11.5,
    fontFamily: fonts.bold,
    letterSpacing: 1.6,
  },

  cardMainContent: {
    alignItems: "center",
    marginVertical: 12,
  },

  krBig: {
    color: TXT,
    fontSize: 37,
    fontFamily: fonts.kr,
    marginBottom: 16,
  },

  speechBubble: {
    backgroundColor: "rgba(0,0,0,0.48)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  bubbleText: {
    color: MUTED,
    fontSize: 14.5,
    lineHeight: 21,
    fontStyle: "italic",
  },

  cardFooter: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 8,
  },

  miniTag: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.15)",
  },

  miniTagText: {
    color: TXT,
    fontSize: 11.5,
    fontFamily: fonts.medium,
  },

  section: {
    width: "100%",
  },

  sectionTitle: {
    color: TXT,
    fontSize: 23,
    fontFamily: fonts.black,
    letterSpacing: -0.7,
    marginBottom: 20,
  },

  themeCard: {
    marginBottom: 14,
    borderRadius: 26,
    overflow: "hidden",
  },

  themeCardBlur: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    position: "relative",
  },

  cardAccentLine: {
    position: "absolute",
    left: 0,
    top: 18,
    bottom: 18,
    width: 2,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    opacity: 0.9,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },

  icon: {
    fontSize: 28,
  },

  themeTitle: {
    color: TXT,
    fontSize: 19,
    fontFamily: fonts.bold,
    letterSpacing: -0.4,
  },

  themeSub: {
    color: MUTED,
    fontSize: 14,
    marginTop: 4,
  },

  arrow: {
    color: MUTED,
    fontSize: 26,
    fontWeight: "300",
  },

  // Modal
  sheetRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  sheetBackdrop: {
    backgroundColor: "rgba(0,0,0,0.76)",
  },

  sheetAnimatedWrap: {
    justifyContent: "flex-end",
  },

  sheetWrap: {
    overflow: "hidden",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    minHeight: 420,
    maxHeight: "82%",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
    borderLeftColor: "rgba(255,255,255,0.06)",
    borderRightColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(8,10,16,0.72)",
  },

  sheetScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 34,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginTop: 12,
    marginBottom: 24,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  sheetHeaderTextWrap: {
    flex: 1,
  },

  sheetHeroIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },

  sheetHeroIconText: {
    fontSize: 34,
  },

  sheetTitle: {
    fontSize: 28,
    fontFamily: fonts.black,
    color: TXT,
    letterSpacing: -0.8,
  },

  sheetSubtitle: {
    fontSize: 15,
    color: MUTED,
    marginTop: 4,
  },

  sheetSectionLabel: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 12,
    fontFamily: fonts.bold,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    marginBottom: 16,
  },

  sheetOptions: {
    gap: 16,
    marginBottom: 26,
  },

  sheetOptionCard: {
    borderRadius: 24,
  },

  sheetOptionBlur: {
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.025)",
    padding: 20,
  },

  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sheetTextBlock: {
    flex: 1,
    paddingRight: 12,
  },

  sheetOptionTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: TXT,
    marginBottom: 6,
    letterSpacing: -0.2,
  },

  sheetOptionSubtitle: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 22,
  },

  sheetArrowWrap: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 24,
    alignSelf: "stretch",
  },

  sheetOptionArrow: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 24,
    fontWeight: "300",
  },

  closeButton: {
    overflow: "hidden",
    paddingVertical: 17,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.035)",
    position: "relative",
  },

  closeButtonText: {
    color: TXT,
    fontSize: 17,
    fontFamily: fonts.bold,
  },
});
