import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ABSOLUTE_FILL } from "../constants/layout";
import { AppFontFamily, SeoulMidnightGlass } from "../constants/theme";
import { usePaywall } from "../lib/paywall/PaywallProvider";

const colors = SeoulMidnightGlass.colors;
const fonts = AppFontFamily;

export type ModuleCardProps = {
  title: string;
  subtitle: string;
  href: string;
  accentColor: string;
  icon: string;
  metaLabel: string;
  requiresPremium?: boolean;
  selected?: boolean;
  lockedSubtitle?: string;
  accessibilityContext: string;
  iconScript?: "latin" | "korean";
};

export function ModuleCard({
  title,
  subtitle,
  href,
  accentColor,
  icon,
  metaLabel,
  requiresPremium = false,
  selected = false,
  lockedSubtitle = "Débloquer ce module exclusif",
  accessibilityContext,
  iconScript = "latin",
}: ModuleCardProps) {
  const { hasPremiumAccess } = usePaywall();
  const isLocked = requiresPremium && !hasPremiumAccess;
  const targetHref = isLocked ? "/premium" : href;
  const activeColor = requiresPremium ? colors.premiumGold : accentColor;
  const displayedSubtitle = isLocked ? lockedSubtitle : subtitle;
  const accessLabel = isLocked
    ? "Module premium verrouillé"
    : requiresPremium
      ? "Module premium inclus"
      : "Module gratuit";
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

  return (
    <Link href={targetHref as any} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={actionLabel}
        accessibilityState={selected ? { selected: true } : undefined}
        aria-selected={selected || undefined}
        hitSlop={6}
        style={({ pressed }) => [
          styles.cardPressable,
          selected && styles.selectedCard,
          pressed && styles.pressedCard,
        ]}
      >
        <BlurView
          intensity={40}
          tint="dark"
          style={[
            styles.themeCard,
            requiresPremium && styles.premiumCardBorder,
            selected && styles.selectedThemeCard,
          ]}
        >
          <LinearGradient
            colors={[
              requiresPremium ? colors.premiumSurfaceStrong : `${accentColor}18`,
              "rgba(2,3,6,0.48)",
              "rgba(255,255,255,0.035)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={ABSOLUTE_FILL}
          />

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

              <Text
                style={[
                  styles.cardIcon,
                  iconScript === "korean" && styles.cardIconKorean,
                  {
                    color: activeColor,
                    textShadowColor: activeColor,
                  },
                ]}
              >
                {icon}
              </Text>
            </View>
          </View>

          <View style={styles.cardDividerLine} />

          {requiresPremium && (
            <View style={styles.premiumTag}>
              <Text style={styles.premiumTagText}>PREMIUM</Text>
            </View>
          )}

          <View
            style={[
              styles.cardTextContent,
              requiresPremium && styles.cardTextContentWithTag,
            ]}
          >
            <Text
              style={[
                styles.cardMeta,
                requiresPremium && styles.cardMetaPremium,
              ]}
            >
              {requiresPremium ? "MODULE PREMIUM" : metaLabel}
            </Text>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSub}>{displayedSubtitle}</Text>
          </View>

          <Text style={[styles.cardAction, isLocked && styles.cardActionPremium]}>
            {isLocked ? "Premium" : "Ouvrir"}
          </Text>
        </BlurView>
      </Pressable>
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
  selectedCard: {
    borderColor: colors.selectedBorder,
  },
  pressedCard: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  themeCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SeoulMidnightGlass.spacing.cardPaddingY,
    paddingHorizontal: SeoulMidnightGlass.spacing.cardPaddingX,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    position: "relative",
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
    fontSize: 21,
    fontFamily: fonts.outfit.bold,
    letterSpacing: 0,
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  cardIconKorean: {
    fontFamily: fonts.korean.bold,
  },
  cardDividerLine: {
    width: 1,
    height: 42,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginRight: 12,
  },
  premiumTag: {
    position: "absolute",
    top: 9,
    right: 14,
    minHeight: SeoulMidnightGlass.badge.minHeight,
    borderRadius: SeoulMidnightGlass.radii.pill,
    backgroundColor: colors.premiumGold,
    paddingHorizontal: SeoulMidnightGlass.spacing.badgePaddingX,
    paddingVertical: SeoulMidnightGlass.spacing.badgePaddingY,
    justifyContent: "center",
  },
  premiumTagText: {
    color: colors.premiumInk,
    fontFamily: fonts.outfit.bold,
    fontSize: SeoulMidnightGlass.badge.fontSize,
    letterSpacing: SeoulMidnightGlass.badge.letterSpacing,
  },
  cardTextContent: {
    flex: 1,
    paddingRight: 10,
  },
  cardTextContentWithTag: {
    paddingRight: 76,
  },
  cardMeta: {
    fontSize: 10,
    fontFamily: fonts.outfit.bold,
    color: "rgba(255,255,255,0.44)",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  cardMetaPremium: {
    color: "rgba(253,224,71,0.78)",
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.outfit.bold,
  },
  cardSub: {
    fontSize: 13,
    fontFamily: fonts.outfit.medium,
    color: colors.muted,
    marginTop: 2,
  },
  cardAction: {
    alignSelf: "flex-end",
    color: colors.soft,
    fontSize: SeoulMidnightGlass.cta.fontSize,
    fontFamily: fonts.outfit.bold,
    letterSpacing: SeoulMidnightGlass.cta.letterSpacing,
    opacity: 0.82,
  },
  cardActionPremium: {
    color: colors.premiumGold,
    opacity: 0.95,
  },
});
