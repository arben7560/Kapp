import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ──────────────────────────────────────────────
// DESIGN SYSTEM & ASSETS (Refined)
// ──────────────────────────────────────────────
const BG_DEEP = "#040508";
const BG_NAVY = "#080B16";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.72)";
const SOFT = "rgba(255,255,255,0.45)";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const ORANGE = "#FB923C";

const fonts = {
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  medium: "Outfit_500Medium",
  kr: "NotoSansKR_700Bold",
};

const ASSETS = {
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop",
  metro:
    "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?q=80&w=600&auto=format&fit=crop",
  restaurant:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop",
  cityOverlay:
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop",
};

type ThemeKey = "cafe" | "metro" | "restaurant";

type ThemeConfig = {
  title: string;
  sub: string;
  image: string;
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
    image: ASSETS.cafe,
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
    image: ASSETS.metro,
    accent: CYAN,
    textRoute: "/lesson/metro",
    guidedRoute: "/lesson/metroIA",
  },
  restaurant: {
    title: "Restaurant",
    sub: "Itaewon • Dîner",
    image: ASSETS.restaurant,
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

  const screenEntryScale = useRef(new Animated.Value(1.05)).current;
  const screenEntryOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenEntryOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(screenEntryScale, {
        toValue: 1,
        friction: 9,
        tension: 15,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const openThemeSheet = (theme: ThemeKey) => {
    setSelectedTheme(theme);
    setSheetVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG_DEEP }}>
      {/* City Background Texture - Réinjection de la ville */}
      <Image
        source={{ uri: ASSETS.cityOverlay }}
        style={[StyleSheet.absoluteFill, { opacity: 0.22 }]} // Opacité augmentée pour texture
        blurRadius={12}
      />

      <LinearGradient
        colors={["rgba(4,5,8,0.4)", "rgba(8,11,22,0.85)", BG_DEEP]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View
          style={{
            flex: 1,
            opacity: screenEntryOpacity,
            transform: [{ scale: screenEntryScale }],
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.header}>
              <Text style={styles.headerEyebrow}>SÉOUL IMMERSION</Text>
              <Text style={styles.headerTitle}>Interactions</Text>
            </View>

            <Hero />

            <View style={styles.sectionDivider}>
              <Text style={styles.sectionLabel}>SÉQUENCES DISPONIBLES</Text>
              <View style={styles.dividerLine} />
            </View>

            <Scenes onSelectTheme={openThemeSheet} />
          </ScrollView>
        </Animated.View>

        <ThemeModeSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          selectedTheme={selectedTheme}
        />
      </SafeAreaView>
    </View>
  );
}

// ──────────────────────────────────────────────
// SUB-COMPONENTS
// ──────────────────────────────────────────────

function PulseDot() {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return <Animated.View style={[styles.statusDot, { opacity: pulse }]} />;
}

function Hero() {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [
          {
            translateY: floatAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -8],
            }),
          },
        ],
      }}
    >
      <BlurView intensity={70} tint="dark" style={styles.heroCard}>
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "transparent"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardHeader}>
          <PulseDot />
          <Text style={styles.cardHeaderText}>LIVE FROM HONGDAE</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.krBig}>어서 오세요</Text>
          <View style={styles.speechBubble}>
            <Text style={styles.bubbleText}>
              "Un iced americano, s'il vous plaît."
            </Text>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}

function Scenes({
  onSelectTheme,
}: {
  onSelectTheme: (theme: ThemeKey) => void;
}) {
  return (
    <View style={styles.scenesGrid}>
      {(Object.keys(THEME_CONFIG) as ThemeKey[]).map((key) => (
        <ThemeCard
          key={key}
          config={THEME_CONFIG[key]}
          onPress={() => onSelectTheme(key)}
        />
      ))}
    </View>
  );
}

function ThemeCard({
  config,
  onPress,
}: {
  config: ThemeConfig;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.themeCard,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <View style={styles.cinemaVignette}>
        <Image source={{ uri: config.image }} style={styles.vignetteImage} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.vignetteContent}>
          <View
            style={[styles.vignetteAccent, { backgroundColor: config.accent }]}
          />
          <View>
            <Text style={styles.vignetteTitle}>{config.title}</Text>
            <Text style={styles.vignetteSub}>{config.sub}</Text>
          </View>
        </View>
        <View style={styles.vignettePlay}>
          <Text style={{ color: "white", fontSize: 18 }}>›</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// MODAL (Maintained and harmonized)
// ──────────────────────────────────────────────
function ThemeModeSheet({ visible, onClose, selectedTheme }: any) {
  if (!visible || !selectedTheme) return null;
  const config = THEME_CONFIG[selectedTheme as ThemeKey];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheetRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <BlurView intensity={90} tint="dark" style={styles.sheetWrap}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Image source={{ uri: config.image }} style={styles.sheetHeroImg} />
            <View style={styles.sheetHeaderInfo}>
              <Text style={styles.sheetTitle}>{config.title}</Text>
              <Text style={styles.sheetSub}>{config.sub}</Text>
            </View>
          </View>
          <View style={styles.sheetOptions}>
            <SheetOptionCard
              title="Version texte"
              subtitle="Lecture et révision calme."
              accent={config.accent}
              onPress={onClose}
            />
            <SheetOptionCard
              title="Simulation guidée"
              subtitle="IA interactive avec aide."
              accent={config.accent}
              onPress={onClose}
            />
            <SheetOptionCard
              title="Simulation réelle"
              subtitle="Immersion totale sans filet."
              accent={config.accent}
              onPress={onClose}
            />
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

function SheetOptionCard({ title, subtitle, accent, onPress }: any) {
  return (
    <Pressable onPress={onPress} style={styles.optionCard}>
      <View style={[styles.optionAccent, { backgroundColor: accent }]} />
      <View>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSub}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 100 },
  header: { alignItems: "center", marginBottom: 30 },
  headerEyebrow: {
    color: PINK,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 3,
    opacity: 0.8,
  },
  headerTitle: {
    color: TXT,
    fontSize: 42,
    fontFamily: fonts.black,
    letterSpacing: -1,
  },

  heroCard: {
    borderRadius: 32,
    padding: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowRadius: 6,
    shadowOpacity: 0.5,
  },
  cardHeaderText: {
    color: MUTED,
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 1.5,
  },
  cardContent: { alignItems: "center" },
  krBig: {
    color: TXT,
    fontSize: 38,
    fontFamily: fonts.kr,
    marginBottom: 15,
    textShadowColor: PINK,
    textShadowRadius: 20,
  },
  speechBubble: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  bubbleText: {
    color: MUTED,
    fontSize: 15,
    fontStyle: "italic",
    textAlign: "center",
  },

  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 35,
    gap: 15,
  },
  sectionLabel: {
    color: SOFT,
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 2,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.1)" },

  scenesGrid: { gap: 20 },
  themeCard: { borderRadius: 28, overflow: "hidden" },
  cinemaVignette: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  vignetteImage: { ...StyleSheet.absoluteFillObject, opacity: 0.8 },
  vignetteContent: {
    position: "absolute",
    bottom: 18,
    left: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vignetteAccent: { width: 4, height: 32, borderRadius: 2 },
  vignetteTitle: { color: "white", fontSize: 22, fontFamily: fonts.bold },
  vignetteSub: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  vignettePlay: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  sheetRoot: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  sheetWrap: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetHeader: { flexDirection: "row", gap: 15, marginBottom: 30 },
  sheetHeroImg: { width: 100, height: 60, borderRadius: 15 },
  sheetHeaderInfo: { justifyContent: "center" },
  sheetTitle: { color: "white", fontSize: 24, fontFamily: fonts.bold },
  sheetSub: { color: MUTED, fontSize: 14 },
  sheetOptions: { gap: 15 },
  optionCard: {
    flexDirection: "row",
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 22,
    alignItems: "center",
    gap: 15,
  },
  optionAccent: { width: 4, height: "100%", borderRadius: 2 },
  optionTitle: { color: "white", fontSize: 17, fontFamily: fonts.bold },
  optionSub: { color: SOFT, fontSize: 13 },
});
