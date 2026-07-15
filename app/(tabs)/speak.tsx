import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../../components/app-text";
import { ModuleCard } from "../../components/ModuleCard";
import { StatusBadge } from "../../components/ui/status-badge";
import { ABSOLUTE_FILL } from "../../constants/layout";

const BACKGROUND_SOURCE = require("../../assets/images/speak.png");
const SPEAK_BACKGROUND_DARKNESS = 0.72;

const BG_DEEP = "#020306";
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const ORANGE = "#FB923C";

const ASSETS = {
  cafe: require("../../assets/images/cafeIA.png"),
  metro: require("../../assets/images/metroIA.png"),
  restaurant: require("../../assets/images/restaurantIA.png"),
  airport: require("../../assets/images/airport.png"),
  shopping: require("../../assets/images/shopping.png"),
};
type ThemeKey = "cafe" | "metro" | "restaurant" | "airport" | "shopping";
type TextLessonRoute =
  | "/lesson/cafe"
  | "/lesson/metro"
  | "/lesson/restaurant"
  | "/lesson/airport"
  | "/lesson/magasin";
type GuidedLessonRoute =
  | "/lesson/cafeMissions"
  | "/lesson/metroMissions"
  | "/lesson/restaurantMissions"
  | "/lesson/aeroportMissions";

type ThemeConfig = {
  title: string;
  sub: string;
  icon: string;
  image: ImageSourcePropType;
  accent: string;
  textRoute: TextLessonRoute;
  guidedRoute?: GuidedLessonRoute;
  guidedParams?: Record<string, string>;
  realRoute?: string;
  realParams?: Record<string, string>;
};

const THEME_CONFIG: Record<ThemeKey, ThemeConfig> = {
  cafe: {
    title: "Le Café",
    sub: "Hongdae • 14:00",
    icon: "CF",
    image: ASSETS.cafe,
    accent: PINK,
    textRoute: "/lesson/cafe",
    guidedRoute: "/lesson/cafeMissions",
    guidedParams: { mode: "guided" },
    realRoute: "/lesson/cafeMissions",
    realParams: { mode: "real" },
  },
  metro: {
    title: "Le Métro",
    sub: "Ligne 2 • Gangnam",
    icon: "M2",
    image: ASSETS.metro,
    accent: CYAN,
    textRoute: "/lesson/metro",
    guidedRoute: "/lesson/metroMissions",
    guidedParams: { mode: "guided" },
  },
  restaurant: {
    title: "Restaurant",
    sub: "Itaewon • Dîner",
    icon: "RS",
    image: ASSETS.restaurant,
    accent: ORANGE,
    textRoute: "/lesson/restaurant",
    guidedRoute: "/lesson/restaurantMissions",
    guidedParams: { mode: "guided" },
  },
  airport: {
    title: "L’aéroport",
    sub: "Incheon • Arrivée",
    icon: "ICN",
    image: ASSETS.airport,
    accent: CYAN,
    textRoute: "/lesson/airport",
    guidedRoute: "/lesson/aeroportMissions",
    guidedParams: { mode: "guided" },
  },
  shopping: {
    title: "Shopping",
    sub: "Jamsil • Boutique",
    icon: "SH",
    image: ASSETS.shopping,
    accent: PINK,
    textRoute: "/lesson/magasin",
  },
};

export default function SpeakScreen() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | null>(null);

  const [screenEntryScale] = useState(() => new Animated.Value(1.05));
  const [screenEntryOpacity] = useState(() => new Animated.Value(0));

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
        imageStyle={styles.bgImageAsset}
        resizeMode="cover"
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
              <AppText
                variant="sectionLabel"
                tone="brand"
                align="center"
                lineContract="singleLine"
                style={styles.heroEyebrow}
              >
                SÉOUL IMMERSION
              </AppText>

              <View style={styles.heroVisualWrap}>
                <View style={styles.krHeroWrap}>
                  <AppText
                    accessible={false}
                    variant="koreanHero"
                    script="korean"
                    align="center"
                    style={[styles.krHero, styles.krHeroGlowOuter]}
                  >
                    대화
                  </AppText>
                  <AppText
                    accessible={false}
                    variant="koreanHero"
                    script="korean"
                    align="center"
                    style={[styles.krHero, styles.krHeroGlowInner]}
                  >
                    대화
                  </AppText>
                  <AppText
                    accessibilityLanguage="ko-KR"
                    variant="koreanHero"
                    script="korean"
                    align="center"
                    style={styles.krHero}
                  >
                    대화
                  </AppText>
                </View>

                <BlurView intensity={18} tint="dark" style={styles.levelPill}>
                  <AppText
                    variant="label"
                    tone="muted"
                    align="center"
                    lineContract="singleLine"
                  >
                    IMMERSION ACTIVE
                  </AppText>
                </BlurView>

                <AppText
                  variant="subtitle"
                  tone="muted"
                  align="center"
                  style={styles.heroQuote}
                >
                  Choisir un lieu, vivre une situation, parler coréen.
                </AppText>
              </View>
            </View>

            <View style={styles.sectionDivider}>
              <AppText
                variant="sectionLabel"
                tone="soft"
                style={styles.sectionDividerLabel}
              >
                SÉQUENCES DISPONIBLES
              </AppText>
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
        <ModuleCard
          key={key}
          title={THEME_CONFIG[key].title}
          subtitle={THEME_CONFIG[key].sub}
          icon={THEME_CONFIG[key].icon}
          accentColor={THEME_CONFIG[key].accent}
          metaLabel="SCÈNE IMMERSIVE"
          accessibilityContext={`les options de la scène ${THEME_CONFIG[key].title}`}
          onPress={() => onSelectTheme(key)}
        />
      ))}
    </View>
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
  const [translateY] = useState(() => new Animated.Value(80));
  const [backdropOpacity] = useState(() => new Animated.Value(0));
  const [mounted, setMounted] = useState(visible);
  const { height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    if (visible && selectedTheme) {
      let stopEntryAnimation = () => {};
      const mountTimer = setTimeout(() => {
        setMounted(true);
        translateY.setValue(80);
        backdropOpacity.setValue(0);

        const entryAnimation = Animated.parallel([
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
        ]);

        stopEntryAnimation = () => entryAnimation.stop();
        entryAnimation.start();
      }, 0);

      return () => {
        clearTimeout(mountTimer);
        stopEntryAnimation();
      };
    }

    const closeAnimation = Animated.parallel([
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
    ]);

    closeAnimation.start(({ finished }) => {
      if (finished) setMounted(false);
    });

    return () => closeAnimation.stop();
  }, [visible, selectedTheme, translateY, backdropOpacity]);

  if (!mounted || !selectedTheme) return null;

  const config = THEME_CONFIG[selectedTheme];

  const goToText = () => {
    onClose();
    router.push(config.textRoute);
  };

  const goToImmersive = () => {
    if (!config.guidedRoute) return;

    onClose();

    if (config.guidedParams) {
      router.push({
        pathname: config.guidedRoute,
        params: config.guidedParams,
      });
      return;
    }

    router.push(config.guidedRoute);
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

          <BlurView
            intensity={94}
            tint="dark"
            style={[styles.sheetWrap, { maxHeight: Math.max(280, windowHeight - 24) }]}
          >
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

            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
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
                <AppText
                  variant="sectionTitle"
                  tone="muted"
                  align="center"
                  accessibilityLabel="Fermer"
                >
                  ×
                </AppText>
              </Pressable>

              <View style={styles.sheetHeroCopy}>
                <View style={styles.sheetKickerRow}>
                  <View
                    style={[
                      styles.sheetStatusDot,
                      { backgroundColor: config.accent },
                    ]}
                  />
                  <AppText
                    variant="sectionLabel"
                    tone="muted"
                  >
                    SCÈNE IMMERSIVE
                  </AppText>
                </View>

                <AppText
                  variant="sceneTitle"
                  tone="strong"
                >
                  {config.title}
                </AppText>
                <AppText
                  variant="subtitle"
                  tone="muted"
                  style={styles.sheetSub}
                >
                  {config.sub}
                </AppText>
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
                  <AppText
                    variant="caption"
                    tone="muted"
                    align="center"
                  >
                    {label}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.sheetBody}>
              <View style={styles.sheetModeHeader}>
                <AppText variant="sectionTitle" tone="strong">
                  Choisis ton expérience
                </AppText>
                <AppText
                  variant="bodySecondary"
                  tone="soft"
                  style={styles.sheetSectionHint}
                >
                  Une scène courte, claire, pensée pour passer à l’action.
                </AppText>
              </View>

              <View style={styles.sheetOptions}>
                <SheetOptionCard
                  title={
                    config.guidedRoute
                      ? "Scène guidée"
                      : "Scène guidée — bientôt"
                  }
                  subtitle={
                    config.guidedRoute
                      ? "Entre dans la situation, écoute et réponds comme sur place."
                      : "Le mémo Shopping reste disponible pendant la préparation de cette scène."
                  }
                  icon="IA"
                  accent={config.accent}
                  disabled={!config.guidedRoute}
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

            <Pressable onPress={onClose} style={styles.sheetCloseButton}>
              <AppText variant="button" tone="soft" align="center">
                Fermer
              </AppText>
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
  icon,
  accent,
  disabled,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const [scaleAnim] = useState(() => new Animated.Value(1));

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
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View
        style={[
          styles.optionCard,
          disabled && styles.optionCardDisabled,
          { transform: [{ scale: scaleAnim }] },
        ]}
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
            <AppText
              variant="label"
              tone="strong"
              align="center"
              lineContract="singleLine"
            >
              {icon}
            </AppText>
          </View>

          <View style={styles.optionTextBlock}>
            <View style={styles.optionTitleRow}>
              <AppText
                variant="cardTitle"
                tone="strong"
                lineContract="twoLines"
              >
                {title}
              </AppText>

              {disabled ? (
                <StatusBadge
                  label="BIENTÔT"
                  size="compact"
                  appearance="glass"
                />
              ) : null}
            </View>

            <AppText
              variant="bodySecondary"
              tone="muted"
              lineContract="twoLines"
            >
              {subtitle}
            </AppText>
          </View>

          <View style={styles.optionArrowWrap}>
            <AppText variant="sectionTitle" tone="soft" align="end">
              ›
            </AppText>
          </View>
        </BlurView>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_DEEP },
  bgImage: { flex: 1, overflow: "hidden" },
  bgImageAsset: { width: "100%", height: "100%" },

  scrollContent: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 100 },
  heroBlock: {
    marginTop: 34,
    alignItems: "center",
  },

  heroEyebrow: {
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

  levelPill: {
    marginTop: 18,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  heroQuote: {
    marginTop: 30,
    maxWidth: "82%",
    fontStyle: "italic",
  },

  bgDarkOverlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: `rgba(0,0,0,${SPEAK_BACKGROUND_DARKNESS})`,
  },

  bgBlur: {
    ...ABSOLUTE_FILL,
  },

  sectionDivider: {
    marginTop: -30,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 35,
    gap: 15,
  },

  sectionDividerLabel: {
    flexShrink: 1,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  scenesGrid: { gap: 20 },

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

  sheetScroll: {
    flexShrink: 1,
  },

  sheetScrollContent: {
    paddingBottom: 2,
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
    minHeight: 218,
    borderRadius: 32,
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
    minHeight: 218,
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    paddingTop: 82,
    paddingBottom: 18,
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

  sheetMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 2,
  },

  sheetMetaPill: {
    flexGrow: 1,
    flexBasis: 120,
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
  },

  sheetBody: {
    paddingHorizontal: 6,
    paddingTop: 18,
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

  sheetSub: {
    marginTop: 2,
  },

  sheetModeHeader: {
    marginBottom: 15,
  },

  sheetSectionHint: {
    marginTop: 4,
  },

  sheetOptions: {
    gap: 12,
  },

  optionCard: {
    borderRadius: 30,
    overflow: "hidden",
  },

  optionCardDisabled: {
    opacity: 0.5,
  },

  optionBlur: {
    minHeight: 88,
    borderRadius: 30,
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
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
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

  optionArrowWrap: {
    width: 24,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  sheetCloseButton: {
    marginTop: 18,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
  },

});
