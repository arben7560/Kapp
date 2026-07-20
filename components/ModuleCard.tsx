import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "./app-text";
import { StatusBadge } from "./ui/status-badge";
import { ABSOLUTE_FILL } from "../constants/layout";
import { SeoulMidnightGlass } from "../constants/theme";
import { usePaywall } from "../lib/paywall/PaywallProvider";

const colors = SeoulMidnightGlass.colors;

type ModuleCardBaseProps = {
  title: string;
  subtitle: string;
  accentColor: string;
  icon: string;
  metaLabel: string;
  requiresPremium?: boolean;
  selected?: boolean;
  lockedSubtitle?: string;
  accessibilityContext: string;
  iconScript?: "latin" | "korean";
  visualVariant?: "default" | "legacyGlass";
};

type ModuleCardLinkInteraction = {
  href: string;
  onPress?: never;
};

type ModuleCardActionInteraction = {
  href?: never;
  onPress: NonNullable<PressableProps["onPress"]>;
};

export type ModuleCardProps = ModuleCardBaseProps &
  (ModuleCardLinkInteraction | ModuleCardActionInteraction);

export function ModuleCard({
  title,
  subtitle,
  href,
  onPress,
  accentColor,
  icon,
  metaLabel,
  requiresPremium = false,
  selected = false,
  lockedSubtitle = "Débloquer avec Premium",
  accessibilityContext,
  iconScript = "latin",
  visualVariant = "default",
}: ModuleCardProps) {
  const { hasPremiumAccess } = usePaywall();
  const isAction = onPress !== undefined;
  const isLegacyGlass = visualVariant === "legacyGlass";
  const isLocked = requiresPremium && !hasPremiumAccess;
  const targetHref = isLocked ? "/premium" : href;
  const activeColor = requiresPremium ? colors.premiumGold : accentColor;
  const displayedSubtitle = isLocked ? lockedSubtitle : subtitle;
  const accessLabel = isLocked
    ? "Accès Premium verrouillé"
    : requiresPremium
      ? "Accès Premium inclus"
      : "Accès gratuit";
  const selectedLabel = selected ? "Sélectionné" : undefined;
  const actionLabel = isLocked
    ? "Ouvre l'écran Premium"
    : `Ouvre ${accessibilityContext}`;
  const accessibilityLabel = [
    title,
    selectedLabel,
    accessLabel,
    displayedSubtitle,
    actionLabel,
  ]
    .filter(Boolean)
    .join(". ");

  const card = (
    <Pressable
      accessibilityRole={isAction ? "button" : "link"}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={actionLabel}
      accessibilityState={selected ? { selected: true } : undefined}
      aria-selected={selected || undefined}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardPressable,
        isLegacyGlass && styles.legacyCardPressable,
        selected && styles.selectedCard,
        pressed && styles.pressedCard,
      ]}
    >
        <BlurView
          intensity={isLegacyGlass ? 30 : 40}
          tint="dark"
          style={[
            styles.themeCard,
            isLegacyGlass && styles.legacyThemeCard,
            requiresPremium &&
              (isLegacyGlass
                ? styles.legacyPremiumCardBorder
                : styles.premiumCardBorder),
            selected && styles.selectedThemeCard,
          ]}
        >
          {isLegacyGlass ? (
            <LinearGradient
              colors={
                requiresPremium
                  ? ["rgba(253,224,71,0.12)", "transparent"]
                  : [`${activeColor}18`, "transparent"]
              }
              style={ABSOLUTE_FILL}
            />
          ) : (
            <LinearGradient
              colors={[
                requiresPremium
                  ? colors.premiumSurfaceStrong
                  : `${accentColor}18`,
                "rgba(2,3,6,0.48)",
                "rgba(255,255,255,0.035)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={ABSOLUTE_FILL}
            />
          )}

          <LinearGradient
            colors={[
              "rgba(255,255,255,0.13)",
              "rgba(255,255,255,0.025)",
              "transparent",
            ]}
            locations={[0, 0.35, 1]}
            style={styles.cardTopReflect}
          />

          <View style={styles.cardRainA} />
          <View
            style={[
              styles.cardRainB,
              { backgroundColor: `${activeColor}14` },
            ]}
          />
          <View style={styles.cardRainC} />
          <View
            style={[styles.cardRainDrop, { backgroundColor: activeColor }]}
          />

          <View
            style={[
              styles.cardAccent,
              isLegacyGlass && styles.legacyCardAccent,
              {
                backgroundColor: activeColor,
                shadowColor: activeColor,
              },
            ]}
          />

          <View style={styles.cardIconZone}>
            <View
              style={[
                styles.cardIconBox,
                {
                  borderColor: `${activeColor}55`,
                  backgroundColor: `${activeColor}12`,
                  shadowColor: activeColor,
                  shadowOpacity: requiresPremium ? 0.28 : 0.22,
                },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0.24)",
                  "rgba(255,255,255,0.05)",
                  "transparent",
                ]}
                locations={[0, 0.45, 1]}
                style={styles.cardIconLight}
              />

              <AppText
                variant="symbol"
                script={iconScript}
                align="center"
                style={[
                  styles.cardIcon,
                  {
                    color: activeColor,
                    textShadowColor: activeColor,
                  },
                ]}
              >
                {icon}
              </AppText>
            </View>
          </View>

          <View style={styles.cardDividerLine} />

          <View style={styles.cardTextContent}>
            <View style={styles.cardHeaderRow}>
              <AppText
                variant="sectionLabel"
                tone={requiresPremium ? "premium" : "soft"}
                style={styles.cardMeta}
              >
                {requiresPremium ? `${metaLabel} · PREMIUM` : metaLabel}
              </AppText>

              {requiresPremium ? (
                <StatusBadge
                  label={isLocked ? "PREMIUM 🔒" : "PREMIUM"}
                  tone="premium"
                  appearance="solid"
                  size="compact"
                  style={[
                    styles.premiumTag,
                    isLegacyGlass && styles.legacyPremiumTag,
                  ]}
                />
              ) : null}
            </View>

            <AppText variant="cardTitle" lineContract="twoLines">
              {title}
            </AppText>
            <AppText
              variant="bodySecondary"
              tone="muted"
              lineContract="threeLines"
              style={styles.cardSub}
            >
              {displayedSubtitle}
            </AppText>
          </View>

          <AppText
            variant={isLegacyGlass ? "symbol" : "caption"}
            tone={
              isLocked || (isLegacyGlass && requiresPremium)
                ? "premium"
                : "soft"
            }
            style={[
              styles.cardAction,
              isLegacyGlass && styles.legacyCardAction,
              (isLocked || (isLegacyGlass && requiresPremium)) &&
                styles.cardActionPremium,
              isLegacyGlass &&
                requiresPremium &&
                styles.legacyCardActionPremium,
            ]}
          >
            {isLegacyGlass
              ? requiresPremium
                ? "✧"
                : "›"
              : isLocked
                ? "Premium"
                : "Ouvrir"}
          </AppText>
        </BlurView>
    </Pressable>
  );

  if (isAction) return card;

  return (
    <Link href={targetHref as any} asChild>
      {card}
    </Link>
  );
}

const styles = StyleSheet.create({
  cardPressable: {
    borderRadius: SeoulMidnightGlass.radii.card,
    overflow: "hidden",
    backgroundColor: colors.glassSurface,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  legacyCardPressable: {
    borderRadius: 20,
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  selectedCard: {
    borderColor: colors.selectedBorder,
  },
  pressedCard: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  themeCard: {
    borderRadius: SeoulMidnightGlass.radii.card,
    overflow: "hidden",
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SeoulMidnightGlass.spacing.cardPaddingY,
    paddingHorizontal: SeoulMidnightGlass.spacing.cardPaddingX,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    position: "relative",
  },
  legacyThemeCard: {
    borderRadius: 20,
    minHeight: 90,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderColor: "rgba(255,255,255,0.08)",
  },
  selectedThemeCard: {
    borderColor: colors.selectedBorder,
  },
  cardTopReflect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    opacity: 0.55,
  },
  premiumCardBorder: {
    borderColor: colors.lockedBorder,
  },
  legacyPremiumCardBorder: {
    borderColor: "rgba(253,224,71,0.25)",
  },
  cardRainA: {
    position: "absolute",
    top: 0,
    left: "18%",
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  cardRainB: {
    position: "absolute",
    top: 0,
    left: "54%",
    width: 1,
    height: "100%",
  },
  cardRainC: {
    position: "absolute",
    top: 0,
    right: "18%",
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  cardRainDrop: {
    position: "absolute",
    top: 14,
    right: 18,
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.65,
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 14,
    bottom: 14,
    width: 4,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    shadowOpacity: 0.75,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  legacyCardAccent: {
    width: 3,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  cardIconZone: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    marginRight: 10,
    position: "relative",
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: SeoulMidnightGlass.radii.icon,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  cardIconLight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "58%",
    borderRadius: SeoulMidnightGlass.radii.icon,
  },
  cardIcon: {
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  cardDividerLine: {
    width: 1,
    height: 42,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginRight: 12,
  },
  premiumTag: {
    flexShrink: 0,
  },
  legacyPremiumTag: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  cardTextContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  cardMeta: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 76,
  },
  cardSub: {
    marginTop: 2,
  },
  cardAction: {
    alignSelf: "flex-end",
    flexShrink: 0,
    marginLeft: 6,
    opacity: 0.82,
  },
  legacyCardAction: {
    opacity: 0.3,
    marginLeft: 8,
  },
  cardActionPremium: {
    color: colors.premiumGold,
    opacity: 0.95,
  },
  legacyCardActionPremium: {
    opacity: 0.8,
  },
});
