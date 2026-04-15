import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Animated,
  Easing,
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

type ListenTheme = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  route:
    | "/listen/CafeListen"
    | "/listen/MetroListen"
    | "/listen/RestaurantListen";
};

const THEMES: ListenTheme[] = [
  {
    id: "cafe",
    title: "Café",
    subtitle: "Commander et payer",
    icon: "☕",
    accent: PINK,
    route: "/listen/CafeListen",
  },
  {
    id: "metro",
    title: "Métro",
    subtitle: "Directions et sorties",
    icon: "🚇",
    accent: CYAN,
    route: "/listen/MetroListen",
  },
  {
    id: "restaurant",
    title: "Restaurant",
    subtitle: "Commander et interagir",
    icon: "🍽️",
    accent: ORANGE,
    route: "/listen/RestaurantListen",
  },
];

// ──────────────────────────────────────────────
// SCREEN
// ──────────────────────────────────────────────
export default function ListenIndexScreen() {
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
          <ListenHero />
          <View style={{ height: 48 }} />
          <ThemesSection />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────
// HERO
// ──────────────────────────────────────────────
function ListenHero() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const floatAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
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
      <Text style={styles.heroTitle}>Écoute</Text>

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
            <Text style={styles.cardHeaderText}>ÉCOUTE RÉELLE</Text>
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
              듣기
            </Animated.Text>

            <View style={styles.speechBubble}>
              <Text style={styles.bubbleText}>
                &quot;Entraîne ton oreille avec des scènes concrètes.&quot;
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Pressable
              onPress={() => router.push("/listen/CafeListen")}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <View style={styles.miniTag}>
                <Text style={styles.miniTagText}>Commencer</Text>
              </View>
            </Pressable>

            <View style={styles.miniTag}>
              <Text style={styles.miniTagText}>Oreille</Text>
            </View>

            <View style={styles.miniTag}>
              <Text style={styles.miniTagText}>Scènes</Text>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
}

// ──────────────────────────────────────────────
// THEMES
// ──────────────────────────────────────────────
function ThemesSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thèmes</Text>

      {THEMES.map((theme) => (
        <View key={theme.id} style={styles.themeCardSpacing}>
          <ThemeRow
            title={theme.title}
            subtitle={theme.subtitle}
            icon={theme.icon}
            accent={theme.accent}
            onPress={() => router.push(theme.route)}
          />
        </View>
      ))}
    </View>
  );
}

function ThemeRow({
  title,
  subtitle,
  icon,
  accent,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <BlurView intensity={78} tint="dark" style={styles.themeCardBlur}>
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.045)",
            "rgba(255,255,255,0.02)",
            "rgba(255,255,255,0.01)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={[
            `${accent}30`,
            `${accent}14`,
            "rgba(0,0,0,0.02)",
            "transparent",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.themeCardLeftGlow}
        />

        <LinearGradient
          colors={[
            "rgba(255,255,255,0.06)",
            "rgba(255,255,255,0.02)",
            "transparent",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: `${accent}12`,
              borderColor: `${accent}1E`,
            },
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.themeTextWrap}>
          <Text style={styles.themeTitle}>{title}</Text>
          <Text style={styles.themeSub}>{subtitle}</Text>
        </View>

        <View style={styles.arrowWrap}>
          <Text style={styles.arrow}>›</Text>
        </View>
      </BlurView>
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
    backgroundColor: PINK,
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
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  bubbleText: {
    color: MUTED,
    fontSize: 14.5,
    lineHeight: 21,
    fontStyle: "italic",
    fontFamily: fonts.medium,
    textAlign: "center",
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
    fontSize: 22,
    fontFamily: fonts.black,
    letterSpacing: -0.6,
    marginBottom: 18,
  },

  themeCardSpacing: {
    marginBottom: 14,
  },

  themeCardBlur: {
    minHeight: 96,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(9,10,16,0.50)",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    paddingRight: 18,
    paddingVertical: 16,
    position: "relative",
  },

  themeCardLeftGlow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "58%",
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 0.8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  icon: {
    fontSize: 27,
  },

  themeTextWrap: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 10,
  },

  themeTitle: {
    color: TXT,
    fontSize: 18,
    fontFamily: fonts.bold,
    letterSpacing: -0.35,
  },

  themeSub: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 14,
    marginTop: 4,
    fontFamily: fonts.medium,
  },

  arrowWrap: {
    width: 28,
    alignItems: "flex-end",
    justifyContent: "center",
    alignSelf: "stretch",
  },

  arrow: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 24,
    fontWeight: "300",
    marginRight: 2,
  },
});
