import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronRight, Sparkles, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
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
import { AppBackButton } from "../../components/ui/app-back-button";
import { HubModuleAccents, SeoulMidnightGlass } from "../../constants/theme";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";

const BACKGROUND_SOURCE = require("../../assets/images/speak.jpg");

const BG_DEEP = SeoulMidnightGlass.colors.bgDeep;
const TXT = SeoulMidnightGlass.colors.text;
const MUTED = "rgba(241,245,249,0.76)";
const SOFT = "rgba(241,245,249,0.54)";

const CONVERSATION = HubModuleAccents.conversation;
const CONVERSATION_ACCENT = CONVERSATION.base;
const CONVERSATION_LIGHT = "#E7A9C1";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const ORANGE = "#FB923C";

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
  korean: string;
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
    korean: "카페",
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
    korean: "지하철",
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
    korean: "식당",
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
    korean: "공항",
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
    korean: "매장",
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
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryTranslateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryOpacity, {
        toValue: 1,
        duration: 560,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(entryTranslateY, {
        toValue: 0,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [entryOpacity, entryTranslateY]);

  const openThemeSheet = (theme: ThemeKey) => {
    setSelectedTheme(theme);
    setSheetVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.background}
        resizeMode="cover"
      >
        <BlurView
          intensity={24}
          tint="dark"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <LinearGradient
          colors={["rgba(2,3,6,0.40)", "rgba(2,3,6,0.61)", "rgba(2,3,6,0.91)"]}
          locations={[0, 0.48, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.ambientGlowTop} pointerEvents="none" />
        <View style={styles.ambientGlowBottom} pointerEvents="none" />

        <Animated.View
          style={[
            styles.screenMotion,
            {
              opacity: entryOpacity,
              transform: [{ translateY: entryTranslateY }],
            },
          ]}
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
                <AppBackButton />
              </View>

              <SpeakHero compact={responsive.isCompact} />

              <ConversationSectionHeader
                title="SCÈNES DISPONIBLES"
                subtitle={`${PUBLIC_THEME_KEYS.length} situations immersives`}
              />

              <Scenes onSelectTheme={openThemeSheet} />
            </View>
          </ScrollView>
        </Animated.View>

        <ThemeModeSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          selectedTheme={selectedTheme}
          backButtonLeft={(responsive.width - responsive.contentWidth) / 2}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

function SpeakHero({ compact }: { compact: boolean }) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroEyebrowRow}>
        <View style={styles.heroDot} />
        <AppText variant="sectionLabel" style={styles.heroEyebrow}>
          IMMERSION · CONVERSATION
        </AppText>
      </View>

      <AppText
        variant="koreanPrimary"
        script="korean"
        lineContract="singleLine"
        style={[styles.heroKorean, compact && styles.heroKoreanCompact]}
      >
        대화
      </AppText>

      <AppText variant="screenTitle" style={styles.heroTitle}>
        Scène guidée
      </AppText>

      <AppText variant="bodySecondary" style={styles.heroSubtitle}>
        Choisis un lieu, vis la situation, parle coréen.
      </AppText>

      <View style={styles.heroMetaRow}>
        <View style={styles.practicePill}>
          <Sparkles size={15} strokeWidth={2} color={CONVERSATION_ACCENT} />
          <AppText
            variant="sectionLabel"
            lineContract="singleLine"
            style={styles.practiceText}
          >
            PRATIQUE ORALE
          </AppText>
        </View>

        <AppText variant="caption" style={styles.heroSceneCount}>
          {PUBLIC_THEME_KEYS.length} scènes
        </AppText>
      </View>
    </View>
  );
}

function ConversationSectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <AppText variant="sectionLabel" style={styles.sectionTitle}>
          {title}
        </AppText>
        <AppText variant="caption" style={styles.sectionSubtitle}>
          {subtitle}
        </AppText>
      </View>

      <View style={styles.sectionLineWrap}>
        <View style={styles.sectionLineBase} />
        <LinearGradient
          colors={["transparent", CONVERSATION_ACCENT, CONVERSATION_LIGHT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sectionLineGlow}
        />
      </View>
    </View>
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

  const gap = 14;
  const cardWidth = Math.min(Math.max(viewportWidth - 62, 278), 590);
  const itemSize = cardWidth + gap;
  const sidePadding = Math.max(0, (viewportWidth - cardWidth) / 2);
  const cardHeight = Math.min(Math.max(cardWidth * 1.16, 372), 520);

  const scrollToIndex = (index: number) => {
    const nextIndex = Math.max(
      0,
      Math.min(index, PUBLIC_THEME_KEYS.length - 1),
    );

    listRef.current?.scrollToOffset({
      offset: nextIndex * itemSize,
      animated: true,
    });
    setActiveIndex(nextIndex);
  };

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (!itemSize) return;

    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / itemSize);
    setActiveIndex(
      Math.max(0, Math.min(nextIndex, PUBLIC_THEME_KEYS.length - 1)),
    );
  };

  const activeKey = PUBLIC_THEME_KEYS[activeIndex] ?? PUBLIC_THEME_KEYS[0];
  const activeConfig = THEME_CONFIG[activeKey];

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
          bounces={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          snapToInterval={itemSize}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: sidePadding,
          }}
          onMomentumScrollEnd={handleMomentumEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
          getItemLayout={(_, index) => ({
            length: itemSize,
            offset: itemSize * index,
            index,
          })}
          renderItem={({ item, index }) => {
            const config = THEME_CONFIG[item];
            const inputRange = [
              (index - 1) * itemSize,
              index * itemSize,
              (index + 1) * itemSize,
            ];

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.92, 1, 0.92],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.48, 1, 0.48],
              extrapolate: "clamp",
            });

            const translateY = scrollX.interpolate({
              inputRange,
              outputRange: [14, 0, 14],
              extrapolate: "clamp",
            });

            return (
              <View style={{ width: itemSize }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${config.title}. ${config.sub}. Ouvrir les options de la scène.`}
                  onPress={() => onSelectTheme(item)}
                  style={({ pressed }) => [
                    styles.scenePressable,
                    pressed && styles.pressablePressed,
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.sceneCardMotion,
                      {
                        width: cardWidth,
                        height: cardHeight,
                        opacity,
                        transform: [{ translateY }, { scale }],
                        shadowColor: config.accent,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.sceneCard,
                        { borderColor: `${config.accent}38` },
                      ]}
                    >
                      <ImageBackground
                        source={config.image}
                        resizeMode="cover"
                        style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
                        imageStyle={styles.sceneImage}
                      />

                      <BlurView
                        intensity={4}
                        tint="dark"
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                      />

                      <LinearGradient
                        colors={[
                          "rgba(2,3,6,0.07)",
                          "rgba(2,3,6,0.17)",
                          "rgba(2,3,6,0.48)",
                          "rgba(2,3,6,0.94)",
                        ]}
                        locations={[0, 0.34, 0.66, 1]}
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                      />

                      <LinearGradient
                        colors={[
                          `${config.accent}21`,
                          "rgba(0,0,0,0)",
                          "rgba(2,3,6,0.18)",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0.92, y: 0.82 }}
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                      />

                      <View style={styles.glassTopHairline} />

                      <View
                        style={[
                          styles.sceneAmbientGlow,
                          { backgroundColor: `${config.accent}22` },
                        ]}
                        pointerEvents="none"
                      />

                      <View style={styles.sceneTopRow}>
                        <View style={styles.sceneKicker}>
                          <View
                            style={[
                              styles.sceneKickerDot,
                              { backgroundColor: config.accent },
                            ]}
                          />
                          <AppText
                            variant="sectionLabel"
                            lineContract="singleLine"
                            style={styles.sceneKickerText}
                          >
                            SCÈNE {String(index + 1).padStart(2, "0")}
                          </AppText>
                        </View>

                        <View
                          style={[
                            styles.sceneImmersionPill,
                            {
                              borderColor: `${config.accent}3D`,
                              backgroundColor: `${config.accent}14`,
                            },
                          ]}
                        >
                          <AppText
                            variant="caption"
                            lineContract="singleLine"
                            style={[
                              styles.sceneImmersionText,
                              { color: config.accent },
                            ]}
                          >
                            IMMERSION
                          </AppText>
                        </View>
                      </View>

                      <View style={styles.sceneContent}>
                        <AppText
                          variant="sectionLabel"
                          script="korean"
                          style={[
                            styles.sceneKorean,
                            { color: `${config.accent}E8` },
                          ]}
                        >
                          {config.korean}
                        </AppText>

                        <AppText
                          variant="featureTitle"
                          style={styles.sceneTitle}
                        >
                          {config.title}
                        </AppText>

                        <AppText
                          variant="bodySecondary"
                          style={styles.sceneSubtitle}
                        >
                          {config.sub}
                        </AppText>

                        <View style={styles.sceneActionRow}>
                          <View style={styles.sceneActionCopy}>
                            <AppText
                              variant="caption"
                              lineContract="singleLine"
                              style={styles.sceneActionLabel}
                            >
                              EXPLORER LA SCÈNE
                            </AppText>

                            <View style={styles.sceneActionLine}>
                              <LinearGradient
                                colors={[
                                  config.accent,
                                  `${config.accent}80`,
                                  "transparent",
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                              />
                            </View>
                          </View>

                          <View
                            style={[
                              styles.sceneArrow,
                              {
                                borderColor: `${config.accent}42`,
                                backgroundColor: `${config.accent}13`,
                              },
                            ]}
                          >
                            <ChevronRight
                              size={19}
                              strokeWidth={2.25}
                              color={config.accent}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                </Pressable>
              </View>
            );
          }}
        />
      ) : null}

      <View style={styles.carouselMetaRow}>
        <View style={styles.carouselActiveCopy}>
          <AppText
            variant="caption"
            lineContract="singleLine"
            style={styles.carouselActiveLabel}
          >
            {activeConfig.title}
          </AppText>
          <AppText
            variant="caption"
            lineContract="singleLine"
            style={styles.carouselActiveSub}
          >
            {activeConfig.sub}
          </AppText>
        </View>

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

        <AppText
          variant="caption"
          lineContract="singleLine"
          style={styles.carouselCount}
        >
          {String(activeIndex + 1).padStart(2, "0")} /{" "}
          {String(PUBLIC_THEME_KEYS.length).padStart(2, "0")}
        </AppText>
      </View>

      <AppText variant="caption" style={styles.carouselHint}>
        Glisse horizontalement pour changer de scène.
      </AppText>
    </View>
  );
}

function ThemeModeSheet({
  visible,
  onClose,
  selectedTheme,
  backButtonLeft,
}: {
  visible: boolean;
  onClose: () => void;
  selectedTheme: ThemeKey | null;
  backButtonLeft: number;
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

  const handleBack = () => {
    onClose();

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour depuis la sélection de scène"
          hitSlop={8}
          onPress={handleBack}
          style={[
            styles.sheetBackHitTarget,
            { top: sheetTopInset + 8, left: backButtonLeft },
          ]}
        />

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
              { width: sheetWidth, maxHeight: sheetMaxHeight },
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
                <ImageBackground
                  source={config.image}
                  style={StyleSheet.absoluteFill}
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

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fermer"
                  onPress={onClose}
                  style={styles.sheetCloseIcon}
                >
                  <X size={18} strokeWidth={2} color={MUTED} />
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
                      SCÈNE IMMERSIVE
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
                    Entre dans la situation ou révise d’abord les expressions
                    utiles.
                  </AppText>
                </View>

                <View style={styles.sheetOptions}>
                  <SheetOptionCard
                    title="Choisis la scène"
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
          <ChevronRight size={17} strokeWidth={2.1} color={accent} />
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
  background: {
    flex: 1,
  },
  ambientGlowTop: {
    position: "absolute",
    top: -120,
    right: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(190,117,145,0.09)",
  },
  ambientGlowBottom: {
    position: "absolute",
    bottom: -180,
    left: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(190,117,145,0.055)",
  },
  screenMotion: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 120,
    alignItems: "center",
  },
  contentFrame: {
    width: "100%",
  },
  navHeader: {
    minHeight: 60,
    justifyContent: "center",
    marginBottom: 12,
  },
  pressablePressed: {
    transform: [{ scale: 0.992 }],
    opacity: 0.84,
  },

  hero: {
    marginTop: 12,
    marginBottom: 30,
  },
  heroEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 9,
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: CONVERSATION_ACCENT,
    shadowColor: CONVERSATION_ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.52,
    shadowRadius: 8,
    elevation: 2,
  },
  heroEyebrow: {
    color: CONVERSATION_LIGHT,
  },
  heroKorean: {
    color: TXT,
    fontSize: 40,
    lineHeight: 48,
    marginBottom: 1,
    textShadowColor: "rgba(190,117,145,0.18)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  heroKoreanCompact: {
    fontSize: 36,
    lineHeight: 44,
  },
  heroTitle: {
    color: TXT,
  },
  heroSubtitle: {
    color: MUTED,
    marginTop: 7,
    maxWidth: 620,
  },
  heroMetaRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 11,
  },
  practicePill: {
    minHeight: 34,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(190,117,145,0.28)",
    backgroundColor: "rgba(190,117,145,0.08)",
  },
  practiceText: {
    color: CONVERSATION_LIGHT,
  },
  heroSceneCount: {
    color: SOFT,
  },

  sectionHeader: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
    marginBottom: 16,
  },
  sectionCopy: {
    flexShrink: 0,
    maxWidth: "70%",
  },
  sectionTitle: {
    color: TXT,
  },
  sectionSubtitle: {
    color: SOFT,
    marginTop: 3,
  },
  sectionLineWrap: {
    flex: 1,
    height: 9,
    justifyContent: "center",
    marginBottom: 7,
    overflow: "hidden",
  },
  sectionLineBase: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  sectionLineGlow: {
    position: "absolute",
    right: 0,
    width: "70%",
    height: 1,
  },

  carouselSection: {
    width: "100%",
    alignItems: "center",
    overflow: "visible",
  },
  scenePressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sceneCardMotion: {
    alignSelf: "center",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 22,
    elevation: 8,
  },
  sceneCard: {
    flex: 1,
    borderRadius: 29,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "rgba(8,10,15,0.96)",
  },
  sceneImage: {
    borderRadius: 29,
  },
  glassTopHairline: {
    position: "absolute",
    top: 0,
    left: 22,
    right: 22,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  sceneAmbientGlow: {
    position: "absolute",
    top: -76,
    right: -52,
    width: 190,
    height: 190,
    borderRadius: 95,
    opacity: 0.5,
  },
  sceneTopRow: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  sceneKicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minHeight: 29,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(3,5,9,0.45)",
  },
  sceneKickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sceneKickerText: {
    color: "rgba(248,250,252,0.82)",
  },
  sceneImmersionPill: {
    minHeight: 29,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: "center",
  },
  sceneImmersionText: {
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1.2,
  },
  sceneContent: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 19,
  },
  sceneKorean: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  sceneTitle: {
    color: TXT,
  },
  sceneSubtitle: {
    color: MUTED,
    marginTop: 3,
  },
  sceneActionRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
  },
  sceneActionCopy: {
    flex: 1,
  },
  sceneActionLabel: {
    color: "rgba(248,250,252,0.76)",
  },
  sceneActionLine: {
    marginTop: 8,
    width: "72%",
    height: 2,
    borderRadius: 2,
    overflow: "hidden",
  },
  sceneArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  carouselMetaRow: {
    width: "100%",
    minHeight: 42,
    marginTop: 14,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  carouselActiveCopy: {
    flex: 1,
    minWidth: 0,
  },
  carouselActiveLabel: {
    color: TXT,
  },
  carouselActiveSub: {
    color: SOFT,
    marginTop: 1,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  paginationHitArea: {
    padding: 4,
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  paginationDotActive: {
    width: 30,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.58,
    shadowRadius: 7,
    elevation: 3,
  },
  carouselCount: {
    minWidth: 42,
    textAlign: "right",
    color: SOFT,
    letterSpacing: 0.8,
  },
  carouselHint: {
    alignSelf: "flex-start",
    color: "rgba(241,245,249,0.42)",
    marginTop: 1,
    paddingHorizontal: 6,
  },

  sheetRoot: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sheetBackdrop: {
    backgroundColor: "rgba(2,3,6,0.80)",
  },
  sheetBackHitTarget: {
    position: "absolute",
    width: 124,
    height: 44,
    zIndex: 20,
    elevation: 20,
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
    backgroundColor: "rgba(10,13,20,0.88)",
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
  sheetCloseIcon: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.42)",
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
    backgroundColor: "rgba(255,255,255,0.035)",
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
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.045)",
  },
});
