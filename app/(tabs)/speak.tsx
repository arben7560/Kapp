import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const BACKGROUND_SOURCE = require("../../assets/images/seoulbg1.jpg");

const BG_DEEP = "#020306";
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
  cafe: require("../../assets/images/cafeIA.png"),
  metro: require("../../assets/images/metroIA.png"),
  restaurant: require("../../assets/images/restaurantIA.png"),
  airport: require("../../assets/images/airport.png"),
  shopping: require("../../assets/images/shopping.png"),
};
type ThemeKey = "cafe" | "metro" | "restaurant" | "airport" | "shopping";

type ThemeConfig = {
  title: string;
  sub: string;
  image: ImageSourcePropType;
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
    guidedParams: { mode: "guided" },
  },
  restaurant: {
    title: "Restaurant",
    sub: "Itaewon • Dîner",
    image: ASSETS.restaurant,
    accent: ORANGE,
    textRoute: "/lesson/restaurant",
    guidedRoute: "/lesson/restaurantIA",
    guidedParams: { mode: "guided" },
  },
  airport: {
    title: "L’aéroport",
    sub: "Incheon • Arrivée",
    image: ASSETS.airport,
    accent: CYAN,
    textRoute: "/lesson/airport",
    guidedRoute: "/lesson/airportIA",
    guidedParams: { mode: "guided" },
  },
  shopping: {
    title: "Shopping",
    sub: "Jamsil • Boutique",
    image: ASSETS.shopping,
    accent: PINK,
    textRoute: "/lesson/shopping",
    guidedRoute: "/lesson/shoppingIA",
    guidedParams: { mode: "guided" },
  },
};

export default function SpeakScreen() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | null>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);

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
  }, [screenEntryOpacity, screenEntryScale]);

  const openThemeSheet = (theme: ThemeKey) => {
    setSelectedTheme(theme);
    setSheetVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000&auto=format&fit=crop",
        }}
        style={styles.bgImage}
        blurRadius={10}
      >
        <BlurView intensity={55} tint="dark" style={styles.bgBlur} />
        <View style={styles.bgDarkOverlay} />

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
            <View style={styles.heroBlock}>
              <Text style={styles.heroEyebrow}>SÉOUL IMMERSION</Text>

              <View style={styles.heroVisualWrap}>
                <View style={styles.krHeroWrap}>
                  <Text style={[styles.krHero, styles.krHeroGlowOuter]}>
                    대화
                  </Text>
                  <Text style={[styles.krHero, styles.krHeroGlowInner]}>
                    대화
                  </Text>
                  <Text style={styles.krHero}>대화</Text>
                </View>

                <Text style={styles.heroTitle}>Interactions</Text>

                <BlurView intensity={18} tint="dark" style={styles.levelPill}>
                  <Text style={styles.levelText}>IMMERSION ACTIVE</Text>
                </BlurView>

                <Text style={styles.heroQuote}>
                  "Choisir un lieu, vivre une situation, parler coréen."
                </Text>
              </View>
            </View>

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
          onOpenPaywall={() => setPaywallVisible(true)}
        />

        <PaywallModal
          visible={paywallVisible}
          onClose={() => setPaywallVisible(false)}
        />
      </ImageBackground>
    </SafeAreaView>
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
        <Image
          source={config.image}
          style={styles.vignetteImage}
          resizeMode="contain"
        />

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
          <Text style={styles.playIcon}>›</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// MODAL — REFINED
// ──────────────────────────────────────────────
function ThemeModeSheet({
  visible,
  onClose,
  selectedTheme,
  onOpenPaywall,
}: {
  visible: boolean;
  onClose: () => void;
  selectedTheme: ThemeKey | null;
  onOpenPaywall: () => void;
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
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 10,
          tension: 58,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 80,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, selectedTheme, mounted, translateY, backdropOpacity]);

  if (!mounted || !selectedTheme) return null;

  const config = THEME_CONFIG[selectedTheme];

  const goToText = () => {
    onClose();
    router.push(config.textRoute as any);
  };

  const goToImmersive = () => {
    onClose();

    if (config.guidedParams) {
      router.push({
        pathname: config.guidedRoute as any,
        params: config.guidedParams,
      });
      return;
    }

    router.push(config.guidedRoute as any);
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
          style={[styles.sheetAnimatedWrap, { transform: [{ translateY }] }]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.sheetAmbientGlow,
              { backgroundColor: `${config.accent}18` },
            ]}
          />

          <BlurView intensity={94} tint="dark" style={styles.sheetWrap}>
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.07)",
                "rgba(255,255,255,0.02)",
                "transparent",
              ]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.85, y: 0.75 }}
              style={StyleSheet.absoluteFill}
            />

            <LinearGradient
              colors={[
                `${config.accent}16`,
                `${config.accent}07`,
                "transparent",
              ]}
              start={{ x: 0, y: 0.3 }}
              end={{ x: 1, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.sheetTopSpecular} />
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View
                style={[
                  styles.sheetImageFrame,
                  { borderColor: `${config.accent}40` },
                ]}
              >
                <Image
                  source={config.image}
                  style={styles.sheetHeroImg}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.38)"]}
                  style={StyleSheet.absoluteFill}
                />
              </View>

              <View style={styles.sheetHeaderInfo}>
                <View style={styles.sheetKickerRow}>
                  <View
                    style={[
                      styles.sheetStatusDot,
                      { backgroundColor: config.accent },
                    ]}
                  />
                  <Text style={styles.sheetKicker}>SCÈNE ACTIVE</Text>
                </View>

                <Text style={styles.sheetTitle}>{config.title}</Text>
                <Text style={styles.sheetSub}>{config.sub}</Text>
              </View>
            </View>

            <View style={styles.sheetModeHeader}>
              <Text style={styles.sheetSectionTitle}>Choisis ton mode</Text>
              <Text style={styles.sheetSectionHint}>
                Sélectionne ton niveau d’immersion.
              </Text>
            </View>

            <View style={styles.sheetOptions}>
              <SheetOptionCard
                title="Version texte"
                subtitle="Lire, revoir et mémoriser à ton rythme."
                icon="Aa"
                accent={config.accent}
                onPress={goToText}
              />

              <SheetOptionCard
                title="Simulation immersive"
                subtitle="Parler dans une vraie situation coréenne interactive."
                icon="IA"
                accent={config.accent}
                recommended
                locked
                onPress={goToImmersive}
              />
            </View>

            <Pressable onPress={onClose} style={styles.sheetCloseButton}>
              <Text style={styles.sheetCloseText}>Fermer</Text>
            </Pressable>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SheetOptionCard({
  title,
  subtitle,
  icon,
  accent,
  recommended,
  locked,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  recommended?: boolean;
  locked?: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.985,
      useNativeDriver: true,
      speed: 32,
      bounciness: 4,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 32,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View
        style={[styles.optionCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <BlurView intensity={76} tint="dark" style={styles.optionBlur}>
          <LinearGradient
            colors={[
              `${accent}14`,
              `${accent}06`,
              "rgba(255,255,255,0.018)",
              "transparent",
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />

          <LinearGradient
            colors={["rgba(255,255,255,0.05)", "transparent"]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.optionAccent, { backgroundColor: accent }]} />

          <View
            style={[
              styles.optionIconBox,
              {
                borderColor: `${accent}38`,
                backgroundColor: `${accent}13`,
              },
            ]}
          >
            <Text style={styles.optionIconText}>{icon}</Text>
          </View>

          <View style={styles.optionTextBlock}>
            <View style={styles.optionTitleRow}>
              <Text style={styles.optionTitle}>{title}</Text>

              {recommended ? (
                <View
                  style={[
                    styles.recommendedBadge,
                    { borderColor: `${accent}40` },
                  ]}
                >
                  <Text style={styles.recommendedText}>RECOMMANDÉ</Text>
                </View>
              ) : null}

              {locked ? (
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedText}>PREMIUM</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.optionSub}>{subtitle}</Text>
          </View>

          <View style={styles.optionArrowWrap}>
            <Text style={styles.optionArrow}>›</Text>
          </View>
        </BlurView>
      </Animated.View>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// PAYWALL
// ──────────────────────────────────────────────
function PaywallModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.paywallRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <BlurView intensity={95} tint="dark" style={styles.paywallWrap}>
          <View style={styles.sheetHandle} />

          <View style={styles.paywallHero}>
            <Text style={styles.paywallTitle}>IMMERSION RÉELLE</Text>
            <Text style={styles.paywallSubtitle}>
              Accède aux situations complètes de Séoul{"\n"}
              et parle sans réfléchir.
            </Text>
          </View>

          <View style={styles.paywallFeatures}>
            <PaywallItem text="Dialogues dynamiques en temps réel" />
            <PaywallItem text="Réponses naturelles sans assistance" />
            <PaywallItem text="Scènes complètes : café, métro, restaurant" />
            <PaywallItem text="Progression immersive continue" />
          </View>

          <Pressable style={styles.paywallCTA}>
            <LinearGradient
              colors={[PINK, CYAN]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.paywallCTAText}>Continuer l’immersion</Text>
          </Pressable>

          <Pressable onPress={onClose}>
            <Text style={styles.paywallClose}>Plus tard</Text>
          </Pressable>
        </BlurView>
      </View>
    </Modal>
  );
}

function PaywallItem({ text }: { text: string }) {
  return (
    <View style={styles.paywallItem}>
      <View style={styles.paywallDot} />
      <Text style={styles.paywallItemText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_DEEP },
  bgImage: { flex: 1 },

  scrollContent: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 100 },
  heroBlock: {
    marginTop: 34,
    alignItems: "center",
  },

  heroEyebrow: {
    color: PINK,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 5.5,
    textAlign: "center",
    marginBottom: 28,
    opacity: 0.9,
  },

  heroVisualWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 340,
    position: "relative",
  },

  krHeroWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  krHero: {
    fontSize: 74,
    fontFamily: fonts.kr,
    color: "rgba(245,252,255,0.98)",
    textShadowColor: "rgba(56,189,248,0.92)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
    marginBottom: 2,
  },

  krHeroGlowOuter: {
    position: "absolute",
    color: "rgba(56,189,248,0.18)",
    textShadowColor: "rgba(56,189,248,1)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 42,
  },

  krHeroGlowInner: {
    position: "absolute",
    color: "rgba(180,238,255,0.36)",
    textShadowColor: "rgba(103,232,249,0.95)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },

  heroTitle: {
    marginTop: 4,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.96)",
    letterSpacing: -0.7,
    textAlign: "center",
  },

  levelPill: {
    marginTop: 18,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  levelText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 3,
  },

  heroQuote: {
    marginTop: 30,
    maxWidth: "82%",
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    fontStyle: "italic",
  },

  bgDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
  },

  bgBlur: {
    ...StyleSheet.absoluteFillObject,
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

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  scenesGrid: { gap: 20 },
  themeCard: { borderRadius: 28, overflow: "hidden" },

  cinemaVignette: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#050508",
  },

  vignetteImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },

  vignetteContent: {
    position: "absolute",
    bottom: 18,
    left: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  vignetteAccent: { width: 4, height: 32, borderRadius: 2 },

  vignetteTitle: {
    color: "white",
    fontSize: 22,
    fontFamily: fonts.bold,
  },

  vignetteSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },

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

  playIcon: {
    color: "white",
    fontSize: 18,
    lineHeight: 20,
  },

  // ──────────────────────────────────────────────
  // REFINED SHEET
  // ──────────────────────────────────────────────
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

  sheetAmbientGlow: {
    position: "absolute",
    bottom: 275,
    alignSelf: "center",
    width: 260,
    height: 160,
    borderRadius: 999,
    opacity: 0.62,
  },

  sheetWrap: {
    overflow: "hidden",
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopColor: "rgba(255,255,255,0.16)",
    borderLeftColor: "rgba(255,255,255,0.07)",
    borderRightColor: "rgba(255,255,255,0.07)",
    backgroundColor: "rgba(7,9,14,0.76)",
  },

  sheetTopSpecular: {
    position: "absolute",
    top: 0,
    left: 46,
    right: 46,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.22)",
    opacity: 0.7,
  },

  sheetHandle: {
    width: 42,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 20,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  sheetImageFrame: {
    width: 82,
    height: 62,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    marginRight: 16,
  },

  sheetHeroImg: {
    width: "100%",
    height: "100%",
  },

  sheetHeaderInfo: {
    flex: 1,
    justifyContent: "center",
  },

  sheetKickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 5,
  },

  sheetStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },

  sheetKicker: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 10.5,
    fontFamily: fonts.bold,
    letterSpacing: 1.9,
  },

  sheetTitle: {
    color: TXT,
    fontSize: 27,
    fontFamily: fonts.black,
    letterSpacing: -0.7,
  },

  sheetSub: {
    color: MUTED,
    fontSize: 14.5,
    marginTop: 2,
    fontFamily: fonts.medium,
  },

  sheetModeHeader: {
    marginBottom: 14,
  },

  sheetSectionTitle: {
    color: TXT,
    fontSize: 17,
    fontFamily: fonts.bold,
    letterSpacing: -0.2,
  },

  sheetSectionHint: {
    color: SOFT,
    fontSize: 13.5,
    marginTop: 4,
    fontFamily: fonts.medium,
  },

  sheetOptions: {
    gap: 12,
  },

  optionCard: {
    borderRadius: 24,
    overflow: "hidden",
  },

  optionBlur: {
    minHeight: 84,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    backgroundColor: "rgba(255,255,255,0.026)",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingLeft: 18,
    paddingRight: 15,
    position: "relative",
  },

  optionAccent: {
    position: "absolute",
    left: 0,
    top: 18,
    bottom: 18,
    width: 3.5,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },

  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  optionIconText: {
    color: TXT,
    fontSize: 13,
    fontFamily: fonts.bold,
    letterSpacing: 0.2,
  },

  optionTextBlock: {
    flex: 1,
    paddingRight: 10,
  },

  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 5,
  },

  optionTitle: {
    color: TXT,
    fontSize: 17,
    fontFamily: fonts.bold,
    letterSpacing: -0.25,
  },

  optionSub: {
    color: MUTED,
    fontSize: 13.5,
    lineHeight: 19,
    fontFamily: fonts.medium,
  },

  optionArrowWrap: {
    width: 24,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  optionArrow: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 27,
    fontWeight: "300",
  },

  recommendedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.035)",
  },

  recommendedText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 8.8,
    fontFamily: fonts.bold,
    letterSpacing: 0.9,
  },

  lockedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.035)",
  },

  lockedText: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 8.8,
    fontFamily: fonts.bold,
    letterSpacing: 0.9,
  },

  sheetCloseButton: {
    marginTop: 18,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
  },

  sheetCloseText: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 13.5,
    fontFamily: fonts.bold,
    letterSpacing: 0.2,
  },

  // ──────────────────────────────────────────────
  // PAYWALL
  // ──────────────────────────────────────────────
  paywallRoot: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
  },

  paywallWrap: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },

  paywallHero: {
    alignItems: "center",
    marginBottom: 30,
  },

  paywallTitle: {
    color: "white",
    fontSize: 22,
    fontFamily: fonts.bold,
    letterSpacing: 1,
  },

  paywallSubtitle: {
    color: MUTED,
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },

  paywallFeatures: {
    gap: 14,
    marginBottom: 30,
  },

  paywallItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  paywallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PINK,
  },

  paywallItemText: {
    color: TXT,
    fontSize: 14,
  },

  paywallCTA: {
    height: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 14,
  },

  paywallCTAText: {
    color: "white",
    fontSize: 15,
    fontFamily: fonts.bold,
  },

  paywallClose: {
    textAlign: "center",
    color: SOFT,
    fontSize: 13,
  },
});
