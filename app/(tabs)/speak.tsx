import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppText } from "../../components/app-text";
import { HubHero } from "../../components/hub/HubHero";
import { SectionHeader } from "../../components/hub/SectionHeader";
import { AppBackButton } from "../../components/ui/app-back-button";
import { ABSOLUTE_FILL } from "../../constants/layout";
import { HubModuleAccents } from "../../constants/theme";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";

const BACKGROUND_SOURCE = require("../../assets/images/speak.jpg");
const SPEAK_BACKGROUND_DARKNESS = 0.72;

const BG_DEEP = "#020306";
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const ORANGE = "#FB923C";
const CONVERSATION_ACCENT = HubModuleAccents.conversation;

const ASSETS = {
  cafe: require("../../assets/images/cafeIA.jpg"),
  metro: require("../../assets/images/metroIA.jpg"),
  restaurant: require("../../assets/images/restaurantIA.jpg"),
  airport: require("../../assets/images/airport.jpg"),
  shopping: require("../../assets/images/shopping.jpg"),
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
    title: "Café",
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
    title: "Métro",
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
    title: "Aéroport",
    sub: "Incheon • Arrivée",
    icon: "ICN",
    image: ASSETS.airport,
    accent: CYAN,
    textRoute: "/lesson/airport",
    guidedRoute: "/lesson/aeroportMissions",
    guidedParams: { mode: "guided" },
  },
  shopping: {
    title: "Magasin",
    sub: "Jamsil • Boutique",
    icon: "SH",
    image: ASSETS.shopping,
    accent: PINK,
    textRoute: "/lesson/magasin",
  },
};

const PUBLIC_THEME_KEYS: readonly ThemeKey[] = [
  "cafe",
  "metro",
  "restaurant",
  "airport",
];

export default function SpeakScreen() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | null>(null);
  const responsive = useResponsiveLayout({ maxWidth: 920 });
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
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: responsive.horizontalPadding },
            ]}
          >
            <View
              style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}
            >
              <View style={styles.navHeader}>
                <View style={styles.backBtn}>
                  <AppBackButton />
                </View>
              </View>

              <HubHero
                korean="대화"
                title="Scène guidée"
                subtitle="Choisir un lieu, vivre une situation, parler coréen."
                badgeLabel="CONVERSATION"
                accentColor={CONVERSATION_ACCENT.base}
                accentBadge
                layeredGlow={false}
                badgeBlurIntensity={50}
                badgeBorderColor={CONVERSATION_ACCENT.cardBorder}
                badgeBackgroundColor={CONVERSATION_ACCENT.iconSurface}
                badgeTextColor={CONVERSATION_ACCENT.base}
                reserveTitleSpaceWhenEmpty
                style={styles.hero}
                koreanStyle={styles.heroKorean}
              />

              <SectionHeader
                title="SCÈNES DISPONIBLES"
                accentColor={CONVERSATION_ACCENT.base}
              />

              <Scenes onSelectTheme={openThemeSheet} />
            </View>
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
  const listRef = useRef<Animated.FlatList<ThemeKey>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [viewportWidth, setViewportWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardWidth = Math.min(Math.max(viewportWidth - 48, 260), 620);
  const cardSpacing = (viewportWidth - cardWidth) / 2;
  const mediaHeight = Math.min(Math.max(cardWidth * 1.05, 300), 460);

  const scrollToIndex = (index: number) => {
    const nextIndex =
      (index + PUBLIC_THEME_KEYS.length) % PUBLIC_THEME_KEYS.length;

    listRef.current?.scrollToOffset({
      offset: nextIndex * cardWidth,
      animated: true,
    });
    setActiveIndex(nextIndex);
  };

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (!cardWidth) return;

    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    setActiveIndex(
      Math.max(0, Math.min(nextIndex, PUBLIC_THEME_KEYS.length - 1)),
    );
  };

  return (
    <View
      style={styles.carouselSection}
      onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}
    >
      {viewportWidth > 0 ? (
        <Animated.FlatList
          ref={listRef}
          data={PUBLIC_THEME_KEYS}
          keyExtractor={(item) => item}
          horizontal
          snapToInterval={cardWidth}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          overScrollMode="never"
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: cardSpacing,
          }}
          onMomentumScrollEnd={handleMomentumEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
          getItemLayout={(_, index) => ({
            length: cardWidth,
            offset: cardWidth * index,
            index,
          })}
          renderItem={({ item, index }) => {
            const config = THEME_CONFIG[item];
            const inputRange = [
              (index - 1) * cardWidth,
              index * cardWidth,
              (index + 1) * cardWidth,
            ];
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.93, 1, 0.93],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.55, 1, 0.55],
              extrapolate: "clamp",
            });

            return (
              <View style={{ width: cardWidth }}>
                <Animated.View
                  style={[
                    styles.sceneCardMotion,
                    {
                      width: cardWidth - 12,
                      alignSelf: "center",
                      opacity,
                      transform: [{ scale }],
                      shadowColor: config.accent,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.sceneCard,
                      { borderColor: `${config.accent}40` },
                    ]}
                  >
                    <View style={[styles.sceneMedia, { height: mediaHeight }]}>
                      <Image
                        source={config.image}
                        resizeMode="cover"
                        style={styles.sceneImage}
                      />

                      <LinearGradient
                        colors={[
                          "rgba(2,3,6,0.1)",
                          "rgba(2,3,6,0.2)",
                          "rgba(2,3,6,0.75)",
                        ]}
                        locations={[0, 0.5, 1]}
                        style={StyleSheet.absoluteFill}
                      />

                      <LinearGradient
                        colors={[`${config.accent}20`, "transparent"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0.9, y: 0.7 }}
                        style={StyleSheet.absoluteFill}
                      />

                      <View style={styles.sceneTopRow}>
                        <View
                          style={[
                            styles.sceneBadge,
                            {
                              borderColor: `${config.accent}52`,
                              backgroundColor: `${config.accent}1C`,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.sceneBadgeDot,
                              { backgroundColor: config.accent },
                            ]}
                          />
                          <AppText
                            variant="sectionLabel"
                            tone="strong"
                            lineContract="singleLine"
                          >
                            IMMERSION
                          </AppText>
                        </View>
                      </View>
                    </View>

                    <BlurView
                      intensity={82}
                      tint="dark"
                      style={styles.sceneDock}
                    >
                      <LinearGradient
                        colors={[
                          `${config.accent}17`,
                          "rgba(10,12,18,0.9)",
                          "rgba(5,7,11,0.97)",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />

                      <View
                        pointerEvents="none"
                        style={[
                          styles.sceneDockAccent,
                          { backgroundColor: config.accent },
                        ]}
                      >
                        <View
                          style={[
                            styles.sceneDockAccentGlow,
                            { backgroundColor: config.accent },
                          ]}
                        />
                      </View>

                      <View style={styles.sceneDockHeader}>
                        <View style={styles.sceneDockCopy}>
                          <AppText
                            variant="sceneTitle"
                            tone="strong"
                            lineContract="singleLine"
                          >
                            {config.title}
                          </AppText>
                          <AppText
                            variant="subtitle"
                            tone="muted"
                            lineContract="singleLine"
                            style={styles.sceneSubtitle}
                          >
                            {config.sub}
                          </AppText>
                        </View>
                      </View>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Ouvrir les options de la scène ${config.title}`}
                        onPress={() => onSelectTheme(item)}
                        style={({ pressed }) => [
                          styles.sceneAction,
                          {
                            borderColor: `${config.accent}42`,
                            backgroundColor: pressed
                              ? `${config.accent}26`
                              : `${config.accent}14`,
                            transform: [{ scale: pressed ? 0.985 : 1 }],
                          },
                        ]}
                      >
                        <AppText variant="button" tone="strong">
                          Explorer la scène
                        </AppText>

                        <View
                          style={[
                            styles.sceneActionArrow,
                            {
                              borderColor: `${config.accent}48`,
                              backgroundColor: `${config.accent}16`,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.inlineChevron,
                              {
                                borderColor: config.accent,
                                transform: [{ rotate: "45deg" }],
                              },
                            ]}
                          />
                        </View>
                      </Pressable>
                    </BlurView>
                  </View>
                </Animated.View>
              </View>
            );
          }}
        />
      ) : null}

      <View
        style={styles.pagination}
        accessibilityRole="tablist"
        accessibilityLabel="Sélection des scènes"
      >
        {PUBLIC_THEME_KEYS.map((key, index) => {
          const active = index === activeIndex;
          const accent = THEME_CONFIG[key].accent;

          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityLabel={THEME_CONFIG[key].title}
              accessibilityState={{ selected: active }}
              onPress={() => scrollToIndex(index)}
              hitSlop={8}
              style={styles.paginationHitArea}
            >
              <View
                style={[
                  styles.paginationDot,
                  active && styles.paginationDotActive,
                  active && {
                    backgroundColor: accent,
                    shadowColor: accent,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const sheetWidth = Math.min(Math.max(windowWidth - 32, 0), 520);
  const sheetTopInset = Math.max(12, insets.top + 8);
  const sheetBottomInset = Math.max(16, insets.bottom + 12);
  const availableSheetHeight = Math.max(
    300,
    windowHeight - sheetTopInset - sheetBottomInset,
  );
  const sheetMaxHeight = Math.min(
    Math.max(300, availableSheetHeight * (windowHeight < 600 ? 0.94 : 0.9)),
    availableSheetHeight,
    680,
  );
  const heroHeight = windowHeight < 500 ? 104 : windowHeight < 700 ? 128 : 152;

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
          style={[
            styles.sheetAnimatedWrap,
            {
              paddingBottom: sheetBottomInset,
              transform: [{ translateY }],
            },
          ]}
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
            style={[
              styles.sheetWrap,
              {
                width: sheetWidth,
                maxHeight: sheetMaxHeight,
              },
            ]}
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
              contentContainerStyle={[
                styles.sheetScrollContent,
                { paddingBottom: insets.bottom > 0 ? 8 : 2 },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={[
                  styles.sheetHeroFrame,
                  {
                    height: heroHeight,
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
                      lineContract="singleLine"
                    >
                      SCÈNE
                    </AppText>
                  </View>

                  <AppText
                    variant="sceneTitle"
                    tone="strong"
                    lineContract="singleLine"
                  >
                    {config.title}
                  </AppText>
                  <AppText
                    variant="subtitle"
                    tone="muted"
                    lineContract="singleLine"
                    style={styles.sheetSub}
                  >
                    {config.sub}
                  </AppText>
                </View>
              </View>

              <View style={styles.sheetMetaRow}>
                {["Guidé", "Interactif"].map((label) => (
                  <View
                    key={label}
                    style={[
                      styles.sheetMetaPill,
                      { borderColor: `${config.accent}26` },
                    ]}
                  >
                    <AppText variant="caption" tone="muted" align="center">
                      {label}
                    </AppText>
                  </View>
                ))}
              </View>

              <View style={styles.sheetBody}>
                <View style={styles.sheetModeHeader}>
                  <AppText variant="sectionTitle" tone="strong">
                    Choisis ton approche
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
                    title="Choisi la scène"
                    subtitle="Entre dans la situation, écoute et réponds comme sur place."
                    icon="IA"
                    accent={config.accent}
                    onPress={goToImmersive}
                  />
                  <SheetOptionCard
                    title="Expressions utiles"
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
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
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
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View
        style={[
          styles.sheetOptionCard,
          {
            borderColor: `${accent}33`,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.sheetOptionIconBox,
            {
              borderColor: `${accent}40`,
              backgroundColor: `${accent}14`,
            },
          ]}
        >
          <AppText variant="label" tone="strong" align="center">
            {icon}
          </AppText>
        </View>

        <View style={styles.sheetOptionText}>
          <AppText variant="button" tone="strong">
            {title}
          </AppText>
          <AppText variant="caption" tone="soft" style={styles.sheetOptionSub}>
            {subtitle}
          </AppText>
        </View>

        <View
          style={[
            styles.sheetOptionChevron,
            {
              borderColor: `${accent}48`,
              backgroundColor: `${accent}12`,
            },
          ]}
        >
          <View
            style={[
              styles.inlineChevron,
              {
                borderColor: accent,
                transform: [{ rotate: "45deg" }],
              },
            ]}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG_DEEP,
  },
  bgImage: {
    flex: 1,
  },
  bgImageAsset: {
    opacity: 0.38,
  },
  bgBlur: {
    ...ABSOLUTE_FILL,
  },
  bgDarkOverlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: `rgba(2, 3, 6, ${SPEAK_BACKGROUND_DARKNESS})`,
  },
  scrollContent: {
    paddingVertical: 16,
    alignItems: "center",
  },
  contentFrame: {
    width: "100%",
  },
  navHeader: {
    marginBottom: 8,
  },
  backBtn: {
    alignSelf: "flex-start",
  },
  hero: {
    marginBottom: 20,
  },
  heroKorean: {
    fontSize: 32,
  },

  // Carousel Layout & Styling
  carouselSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  sceneCardMotion: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  sceneCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "#080B11",
  },
  sceneMedia: {
    width: "100%",
    position: "relative",
    justifyContent: "flex-end",
  },
  sceneImage: {
    ...ABSOLUTE_FILL,
    width: "100%",
    height: "100%",
  },
  sceneTopRow: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sceneBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  sceneBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sceneModePillTop: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },

  // Scene Dock Bottom Area
  sceneDock: {
    padding: 16,
    position: "relative",
    overflow: "hidden",
  },
  sceneDockAccent: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    height: 2,
    borderRadius: 1,
  },
  sceneDockAccentGlow: {
    ...ABSOLUTE_FILL,
    opacity: 0.6,
    transform: [{ scaleY: 3 }],
  },
  sceneDockHeader: {
    marginBottom: 14,
  },
  sceneDockCopy: {
    width: "100%",
  },
  sceneSubtitle: {
    marginTop: 2,
  },
  sceneAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  sceneActionArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineChevron: {
    width: 7,
    height: 7,
    borderTopWidth: 2,
    borderRightWidth: 2,
    marginRight: 2,
  },

  // Pagination
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    marginBottom: 8,
  },
  paginationHitArea: {
    padding: 4,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  paginationDotActive: {
    width: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },

  // Modal Sheet
  sheetRoot: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sheetBackdrop: {
    backgroundColor: "rgba(2,3,6,0.78)",
  },
  sheetAnimatedWrap: {
    width: "100%",
    alignItems: "center",
  },
  sheetAmbientGlow: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 240,
    borderRadius: 120,
    transform: [{ scaleX: 1.5 }],
    opacity: 0.8,
  },
  sheetWrap: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    backgroundColor: "rgba(10,13,20,0.85)",
  },
  sheetTopSpecular: {
    position: "absolute",
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  sheetScroll: {
    width: "100%",
  },
  sheetScrollContent: {
    padding: 16,
  },
  sheetHeroFrame: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    justifyContent: "flex-end",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  sheetHeroImg: {
    ...ABSOLUTE_FILL,
    width: "100%",
    height: "100%",
  },
  sheetCloseIcon: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  sheetHeroCopy: {
    padding: 14,
  },
  sheetKickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  sheetStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sheetSub: {
    marginTop: 1,
  },
  sheetMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  sheetMetaPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  sheetBody: {
    gap: 12,
  },
  sheetModeHeader: {
    gap: 2,
  },
  sheetSectionHint: {
    marginTop: 2,
  },
  sheetOptions: {
    gap: 10,
    marginTop: 8,
  },
  sheetOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    gap: 12,
  },
  sheetOptionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetOptionText: {
    flex: 1,
  },
  sheetOptionSub: {
    marginTop: 2,
  },
  sheetOptionChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
