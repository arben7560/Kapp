import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  Check,
  ChevronRight,
  LockKeyhole,
  Mic2,
  Sparkles,
} from "lucide-react-native";
import React from "react";
import {
  ImageBackground,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppText } from "../app-text";
import { SeoulMidnightGlass } from "../../constants/theme";
import type { ImmersionMission } from "../../lib/immersion/missions";

const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(241,245,249,0.82)";
const PREMIUM_GOLD = SeoulMidnightGlass.colors.premiumGold;
const PREMIUM_LIGHT = "#FFF1A8";
const PREMIUM_SOFT = "#D8C89A";
const ACTIVE_PEARL = "#E8E3D8";
const VOCAL_VIOLET = "#A78BFA";

type MissionCollectionCardProps = {
  mission: ImmersionMission;
  order: number;
  hasPremiumAccess: boolean;
  accent: string;
  background: ImageSourcePropType;
  onPress: () => void;
  isVocal?: boolean;
  isComingSoon?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function MissionCollectionCard({
  mission,
  order,
  hasPremiumAccess,
  accent,
  background,
  onPress,
  isVocal = false,
  isComingSoon = false,
  compact = false,
  style,
}: MissionCollectionCardProps) {
  const isPremium = mission.access === "premium";
  const premiumLocked = isPremium && !hasPremiumAccess && !isComingSoon;
  const premiumActive = isPremium && hasPremiumAccess && !isComingSoon;
  const actionAccent = isVocal && !isPremium ? VOCAL_VIOLET : accent;

  const accessLabel = isComingSoon
    ? "PROCHAINEMENT"
    : premiumLocked
      ? "À DÉBLOQUER"
      : premiumActive
        ? "ACCÈS ACTIF"
        : isVocal
          ? "VOCAL"
          : "INCLUSE";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${mission.title}. ${
        isComingSoon
          ? "Mission prochainement disponible"
          : premiumLocked
            ? "Mission premium verrouillée"
            : premiumActive
              ? "Mission premium incluse"
              : isVocal
                ? "Mission vocale incluse"
                : "Mission incluse"
      }. ${mission.subtitle}`}
      accessibilityHint={
        isComingSoon
          ? "Cette mission sera disponible prochainement"
          : premiumLocked
            ? "Ouvre l'offre Premium"
            : "Prépare le lancement de cette mission"
      }
      accessibilityState={{ disabled: isComingSoon }}
      aria-disabled={isComingSoon}
      disabled={isComingSoon}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        premiumLocked && styles.wrapPremiumLocked,
        premiumActive && styles.wrapPremiumActive,
        isComingSoon && styles.wrapComingSoon,
        style,
        pressed && !isComingSoon && styles.pressed,
      ]}
    >
      <View style={[styles.card, compact && styles.cardCompact]}>
        <ImageBackground
          source={background}
          resizeMode="cover"
          style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
          imageStyle={styles.image}
        />

        <BlurView
          intensity={7}
          tint="dark"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <LinearGradient
          colors={[
            "rgba(2,4,7,0.30)",
            "rgba(2,4,7,0.50)",
            "rgba(2,3,6,0.78)",
          ]}
          locations={[0, 0.52, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <LinearGradient
          colors={
            isComingSoon
              ? ["rgba(255,255,255,0.025)", "rgba(0,0,0,0)", "rgba(2,3,6,0.24)"]
              : premiumLocked
                ? [
                    "rgba(253,224,71,0.075)",
                    "rgba(0,0,0,0)",
                    "rgba(2,3,6,0.18)",
                  ]
                : premiumActive
                  ? [
                      "rgba(216,200,154,0.045)",
                      "rgba(0,0,0,0)",
                      "rgba(2,3,6,0.16)",
                    ]
                  : [`${actionAccent}14`, "rgba(0,0,0,0)", "rgba(2,3,6,0.16)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View
          pointerEvents="none"
          style={[
            styles.topHairline,
            premiumLocked && styles.topHairlinePremiumLocked,
            premiumActive && styles.topHairlinePremiumActive,
          ]}
        />

        <View
          pointerEvents="none"
          style={[
            styles.ambientGlow,
            { backgroundColor: actionAccent },
            premiumLocked && styles.ambientGlowPremiumLocked,
            premiumActive && styles.ambientGlowPremiumActive,
          ]}
        />

        {isPremium ? (
          <View
            pointerEvents="none"
            style={[
              styles.premiumRail,
              premiumLocked && styles.premiumRailLocked,
              premiumActive && styles.premiumRailActive,
            ]}
          />
        ) : null}

        <View style={styles.topRow}>
          <View style={styles.identity}>
            <AppText
              variant="sectionLabel"
              lineContract="singleLine"
              style={[
                styles.index,
                premiumLocked && styles.indexPremiumLocked,
                premiumActive && styles.indexPremiumActive,
              ]}
            >
              MISSION {String(order).padStart(2, "0")}
            </AppText>

            {isPremium || isVocal ? (
              <View style={styles.missionBadgesRow}>
                {isPremium ? (
                  <View
                    style={[
                      styles.missionBadge,
                      styles.missionBadgePremium,
                      premiumLocked && styles.missionBadgePremiumLocked,
                    ]}
                  >
                    <Sparkles
                      size={10}
                      strokeWidth={2.2}
                      color={premiumLocked ? PREMIUM_GOLD : PREMIUM_LIGHT}
                    />
                    <AppText
                      variant="caption"
                      lineContract="singleLine"
                      style={[
                        styles.missionBadgeText,
                        styles.missionBadgeTextPremium,
                        premiumLocked && styles.missionBadgeTextPremiumLocked,
                      ]}
                    >
                      PREMIUM
                    </AppText>
                  </View>
                ) : null}

                {isVocal ? (
                  <View style={[styles.missionBadge, styles.missionBadgeVocal]}>
                    <Mic2 size={10} strokeWidth={2.2} color={VOCAL_VIOLET} />
                    <AppText
                      variant="caption"
                      lineContract="singleLine"
                      style={[styles.missionBadgeText, styles.missionBadgeTextVocal]}
                    >
                      VOCAL
                    </AppText>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.accessBadge,
              premiumLocked && styles.accessBadgePremiumLocked,
              premiumActive && styles.accessBadgePremiumActive,
              isComingSoon && styles.accessBadgeComingSoon,
              isVocal && !isPremium && styles.accessBadgeVocal,
            ]}
          >
            {isComingSoon ? null : premiumLocked ? (
              <LockKeyhole size={10} strokeWidth={2} color={PREMIUM_GOLD} />
            ) : premiumActive ? (
              <Check size={10} strokeWidth={2.5} color={ACTIVE_PEARL} />
            ) : isVocal ? (
              <Mic2 size={10} strokeWidth={2.2} color={VOCAL_VIOLET} />
            ) : (
              <View style={[styles.statusDot, { backgroundColor: accent }]} />
            )}

            <AppText
              variant="caption"
              lineContract="singleLine"
              style={[
                styles.accessBadgeText,
                premiumLocked && styles.accessBadgeTextPremiumLocked,
                premiumActive && styles.accessBadgeTextPremiumActive,
                isComingSoon && styles.accessBadgeTextComingSoon,
                isVocal && !isPremium && styles.accessBadgeTextVocal,
              ]}
            >
              {accessLabel}
            </AppText>
          </View>
        </View>

        <View style={styles.copy}>
          <AppText
            variant="cardTitle"
            style={[styles.title, isComingSoon && styles.comingSoonCopy]}
          >
            {mission.title}
          </AppText>

          <AppText
            variant="bodySecondary"
            tone="muted"
            style={[styles.subtitle, isComingSoon && styles.comingSoonCopy]}
          >
            {mission.subtitle}
          </AppText>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLine} />

          <View
            style={[
              styles.arrow,
              { borderColor: `${accent}38`, backgroundColor: `${accent}13` },
              premiumLocked && styles.arrowPremiumLocked,
              premiumActive && styles.arrowPremiumActive,
              isComingSoon && styles.arrowComingSoon,
            ]}
          >
            {premiumLocked ? (
              <LockKeyhole size={15} strokeWidth={2} color={PREMIUM_GOLD} />
            ) : isComingSoon ? (
              <LockKeyhole
                size={14}
                strokeWidth={2}
                color="rgba(255,255,255,0.46)"
              />
            ) : (
              <ChevronRight
                size={17}
                strokeWidth={2.2}
                color={premiumActive ? PREMIUM_SOFT : actionAccent}
              />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

type MissionCollectionSectionHeaderProps = {
  title: string;
  subtitle: string;
  accent: string;
  premium?: boolean;
  premiumActive?: boolean;
  first?: boolean;
};

export function MissionCollectionSectionHeader({
  title,
  subtitle,
  accent,
  premium = false,
  premiumActive = false,
  first = false,
}: MissionCollectionSectionHeaderProps) {
  const headerAccent = premiumActive ? PREMIUM_SOFT : PREMIUM_GOLD;

  return (
    <View style={[styles.sectionHeader, first && styles.sectionHeaderFirst]}>
      <View style={styles.sectionCopy}>
        <View style={styles.sectionTitleRow}>
          {premium ? (
            <Sparkles size={15} strokeWidth={2} color={headerAccent} />
          ) : null}

          <AppText
            variant="sectionLabel"
            style={[
              styles.sectionTitle,
              premium && styles.sectionTitlePremium,
              premiumActive && styles.sectionTitlePremiumActive,
            ]}
          >
            {title}
          </AppText>
        </View>

        <AppText
          variant="caption"
          style={[
            styles.sectionSubtitle,
            premium && styles.sectionSubtitlePremium,
            premiumActive && styles.sectionSubtitlePremiumActive,
          ]}
        >
          {subtitle}
        </AppText>
      </View>

      <View style={styles.sectionLineWrap}>
        <View style={styles.sectionLineBase} />
        <LinearGradient
          colors={
            premium
              ? premiumActive
                ? ["transparent", "rgba(216,200,154,0.24)", PREMIUM_SOFT]
                : ["transparent", "rgba(253,224,71,0.46)", PREMIUM_GOLD]
              : ["transparent", `${accent}8A`, accent]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sectionLineGlow}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 178,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    backgroundColor: "rgba(2,3,6,0.50)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 24,
    elevation: 5,
  },
  wrapPremiumLocked: {
    borderColor: "rgba(253,224,71,0.20)",
    backgroundColor: "rgba(10,9,5,0.56)",
  },
  wrapPremiumActive: {
    borderColor: "rgba(216,200,154,0.13)",
    backgroundColor: "rgba(5,6,7,0.58)",
  },
  wrapComingSoon: {
    borderColor: "rgba(255,255,255,0.10)",
    opacity: 0.78,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.992 }],
  },
  card: {
    flex: 1,
    minHeight: 178,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  cardCompact: {
    minHeight: 164,
  },
  image: {
    borderRadius: 24,
  },
  topHairline: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    opacity: 0.62,
  },
  topHairlinePremiumLocked: {
    backgroundColor: "rgba(253,224,71,0.28)",
    opacity: 0.72,
  },
  topHairlinePremiumActive: {
    backgroundColor: "rgba(216,200,154,0.14)",
    opacity: 0.58,
  },
  premiumRail: {
    position: "absolute",
    top: 18,
    bottom: 18,
    left: 0,
    width: 3,
    borderRadius: 2,
  },
  premiumRailLocked: {
    backgroundColor: PREMIUM_GOLD,
    opacity: 0.84,
  },
  premiumRailActive: {
    backgroundColor: PREMIUM_SOFT,
    opacity: 0.5,
  },
  ambientGlow: {
    position: "absolute",
    top: -60,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.04,
  },
  ambientGlowPremiumLocked: {
    backgroundColor: PREMIUM_GOLD,
    opacity: 0.04,
  },
  ambientGlowPremiumActive: {
    backgroundColor: PREMIUM_SOFT,
    opacity: 0.018,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  identity: {
    flex: 1,
    minWidth: 0,
  },
  index: {
    color: "rgba(241,245,249,0.62)",
    letterSpacing: 0.95,
  },
  indexPremiumLocked: {
    color: "rgba(255,241,168,0.62)",
  },
  indexPremiumActive: {
    color: "rgba(216,200,154,0.58)",
  },
  missionBadgesRow: {
    marginTop: 6,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  missionBadge: {
    minHeight: 23,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  missionBadgePremium: {
    borderColor: "rgba(255,241,168,0.44)",
    backgroundColor: "rgba(69,55,13,0.72)",
    shadowColor: PREMIUM_GOLD,
  },
  missionBadgePremiumLocked: {
    borderColor: "rgba(253,224,71,0.62)",
    backgroundColor: "rgba(82,65,10,0.82)",
  },
  missionBadgeVocal: {
    borderColor: "rgba(167,139,250,0.56)",
    backgroundColor: "rgba(61,42,108,0.72)",
    shadowColor: VOCAL_VIOLET,
  },
  missionBadgeText: {
    fontSize: 9,
    letterSpacing: 0.75,
  },
  missionBadgeTextPremium: {
    color: PREMIUM_LIGHT,
  },
  missionBadgeTextPremiumLocked: {
    color: "#FFF5B8",
  },
  missionBadgeTextVocal: {
    color: "#E2D8FF",
  },
  accessBadge: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(5,7,10,0.74)",
  },
  accessBadgePremiumLocked: {
    borderColor: "rgba(253,224,71,0.28)",
    backgroundColor: "rgba(25,21,7,0.76)",
  },
  accessBadgePremiumActive: {
    borderColor: "rgba(232,227,216,0.18)",
    backgroundColor: "rgba(16,16,15,0.76)",
  },
  accessBadgeComingSoon: {
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(5,5,8,0.78)",
  },
  accessBadgeVocal: {
    borderColor: "rgba(167,139,250,0.30)",
    backgroundColor: "rgba(61,42,108,0.26)",
  },
  accessBadgeText: {
    color: "rgba(241,245,249,0.78)",
    letterSpacing: 0.32,
  },
  accessBadgeTextPremiumLocked: {
    color: PREMIUM_LIGHT,
  },
  accessBadgeTextPremiumActive: {
    color: "rgba(232,227,216,0.88)",
  },
  accessBadgeTextComingSoon: {
    color: "rgba(255,255,255,0.54)",
  },
  accessBadgeTextVocal: {
    color: "rgba(215,203,255,0.94)",
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  copy: {
    marginTop: 20,
    paddingRight: 8,
  },
  title: {
    color: TXT,
    textShadowColor: "rgba(0,0,0,0.68)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    marginTop: 5,
    color: MUTED,
    maxWidth: 560,
    textShadowColor: "rgba(0,0,0,0.74)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  comingSoonCopy: {
    opacity: 0.7,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  arrowPremiumLocked: {
    borderColor: "rgba(253,224,71,0.24)",
    backgroundColor: "rgba(25,21,7,0.78)",
  },
  arrowPremiumActive: {
    borderColor: "rgba(216,200,154,0.17)",
    backgroundColor: "rgba(16,16,15,0.78)",
  },
  arrowComingSoon: {
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(5,5,8,0.78)",
  },
  sectionHeader: {
    marginTop: 34,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
  },
  sectionHeaderFirst: {
    marginTop: 8,
  },
  sectionCopy: {
    flexShrink: 0,
    maxWidth: "78%",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  sectionTitle: {
    color: "rgba(241,245,249,0.68)",
    letterSpacing: 1.15,
  },
  sectionTitlePremium: {
    color: PREMIUM_LIGHT,
  },
  sectionTitlePremiumActive: {
    color: "rgba(216,200,154,0.84)",
  },
  sectionSubtitle: {
    marginTop: 3,
    color: "rgba(241,245,249,0.48)",
  },
  sectionSubtitlePremium: {
    color: "rgba(255,241,168,0.58)",
  },
  sectionSubtitlePremiumActive: {
    color: "rgba(216,200,154,0.54)",
  },
  sectionLineWrap: {
    flex: 1,
    height: 10,
    position: "relative",
    justifyContent: "center",
    marginBottom: 2,
  },
  sectionLineBase: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  sectionLineGlow: {
    position: "absolute",
    right: 0,
    width: 96,
    height: 1,
    opacity: 0.82,
  },
});