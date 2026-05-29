import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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

const BACKGROUND_SOURCE = require("../../assets/images/speak.png");

const BG_DEEP = "#020306";
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
        source={BACKGROUND_SOURCE}
        style={styles.bgImage}
        blurRadius={2}
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

                {/* <Text style={styles.heroTitle}>Interactions</Text> */}

                <BlurView intensity={18} tint="dark" style={styles.levelPill}>
                  <Text style={styles.levelText}>IMMERSION ACTIVE</Text>
                </BlurView>

                <Text style={styles.heroQuote}>
                  Choisir un lieu, vivre une situation, parler coréen.
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
        {
          shadowColor: config.accent,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.cinemaVignette}>
        <Image
          source={config.image}
          style={styles.vignetteImage}
          resizeMode="contain"
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
                "rgba(255,255,255,0.12)",
                "rgba(255,255,255,0.035)",
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

            <View
              style={[
                styles.sheetHeroFrame,
                {
                  borderColor: `${config.accent}48`,
                  shadowColor: config.accent,
                },
              ]}
            >
              <Image
                source={config.image}
                style={styles.sheetHeroImg}
                resizeMode="cover"
              />

              <LinearGradient
                colors={[
                  "rgba(0,0,0,0.05)",
                  "rgba(0,0,0,0.28)",
                  "rgba(0,0,0,0.82)",
                ]}
                locations={[0, 0.48, 1]}
                style={StyleSheet.absoluteFill}
              />

              <LinearGradient
                colors={[`${config.accent}22`, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.65 }}
                style={StyleSheet.absoluteFill}
              />

              <Pressable onPress={onClose} style={styles.sheetCloseIcon}>
                <Text style={styles.sheetCloseIconText}>×</Text>
              </Pressable>

              <View style={styles.sheetHeroCopy}>
                <View style={styles.sheetKickerRow}>
                  <View
                    style={[
                      styles.sheetStatusDot,
                      { backgroundColor: config.accent },
                    ]}
                  />
                  <Text style={styles.sheetKicker}>SCÈNE IMMERSIVE</Text>
                </View>

                <Text style={styles.sheetTitle}>{config.title}</Text>
                <Text style={styles.sheetSub}>{config.sub}</Text>
              </View>
            </View>

            <View style={styles.sheetMetaRow}>
              {["Guidé", "Interactif", "Coréen réel"].map((label) => (
                <View
                  key={label}
                  style={[
                    styles.sheetMetaPill,
                    { borderColor: `${config.accent}26` },
                  ]}
                >
                  <Text style={styles.sheetMetaText}>{label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sheetBody}>
              <View style={styles.sheetModeHeader}>
                <Text style={styles.sheetSectionTitle}>
                  Choisis ton expérience
                </Text>
                <Text style={styles.sheetSectionHint}>
                  Une scène courte, claire, pensée pour passer à l’action.
                </Text>
              </View>

              <View style={styles.sheetOptions}>
                <SheetOptionCard
                  title="Scène guidée "
                  subtitle="Entre dans la situation, écoute et réponds comme sur place."
                  icon="IA"
                  accent={config.accent}
                  recommended
                  onPress={goToImmersive}
                />
                <SheetOptionCard
                  title="Mémo utile"
                  subtitle="Revois les mots et expressions utilisés couramment."
                  icon="Aa"
                  accent={config.accent}
                  onPress={goToText}
                />
              </View>
            </View>

            {/* Ancien header de modale conservé pendant la refonte :
            <View style={styles.sheetHeader}>
              <View style={[styles.sheetImageFrame, { borderColor: `${config.accent}40` }]}>
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
            */}

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
    marginBottom: 48,
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
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  bgBlur: {
    ...StyleSheet.absoluteFillObject,
  },

  sectionDivider: {
    marginTop: -30,
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
  themeCard: {
    borderRadius: 28,
    overflow: "visible",
    position: "relative",

    // Ombre portée externe dirigée vers la droite et le bas.
    // La couleur est injectée dynamiquement depuis config.accent,
    // donc elle reprend le même ton que le trait vertical de chaque card.
    shadowOffset: { width: 12, height: 13 },
    shadowOpacity: 0.56,
    shadowRadius: 8,
    elevation: 12,
  },

  cinemaVignette: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#050508",
    position: "relative",
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
    paddingHorizontal: 10,
    paddingBottom: 8,
  },

  sheetAmbientGlow: {
    position: "absolute",
    bottom: 305,
    alignSelf: "center",
    width: 300,
    height: 190,
    borderRadius: 999,
    opacity: 0.72,
  },

  sheetWrap: {
    overflow: "hidden",
    borderRadius: 36,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopColor: "rgba(255,255,255,0.16)",
    borderLeftColor: "rgba(255,255,255,0.07)",
    borderRightColor: "rgba(255,255,255,0.07)",
    borderBottomColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(7,9,14,0.78)",
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
    marginBottom: 14,
  },

  sheetHeroFrame: {
    height: 218,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },

  sheetHeroImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  sheetHeroCopy: {
    position: "absolute",
    left: 18,
    right: 74,
    bottom: 18,
  },

  sheetCloseIcon: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8,10,16,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  sheetCloseIconText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 20,
    lineHeight: 22,
    fontFamily: fonts.medium,
  },

  sheetMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 2,
  },

  sheetMetaPill: {
    flex: 1,
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
  },

  sheetMetaText: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 11.5,
    fontFamily: fonts.bold,
    letterSpacing: 0.2,
  },

  sheetBody: {
    paddingHorizontal: 6,
    paddingTop: 18,
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
    color: "rgba(255,255,255,0.68)",
    fontSize: 10.5,
    fontFamily: fonts.bold,
    letterSpacing: 1.9,
  },

  sheetTitle: {
    color: TXT,
    fontSize: 34,
    fontFamily: fonts.black,
    letterSpacing: -0.9,
  },

  sheetSub: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 14.5,
    marginTop: 2,
    fontFamily: fonts.medium,
  },

  sheetModeHeader: {
    marginBottom: 15,
  },

  sheetSectionTitle: {
    color: TXT,
    fontSize: 19,
    fontFamily: fonts.black,
    letterSpacing: -0.45,
  },

  sheetSectionHint: {
    color: SOFT,
    fontSize: 13.8,
    marginTop: 4,
    fontFamily: fonts.medium,
  },

  sheetOptions: {
    gap: 12,
  },

  optionCard: {
    borderRadius: 26,
    overflow: "hidden",
  },

  optionBlur: {
    minHeight: 88,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.035)",
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
