import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../components/app-text";
import { useDailyStreak } from "../lib/DailyStreakProvider";
import {
  STREAK_BADGE_MILESTONES,
  getStreakDateKey,
  type DailyStreakState,
} from "../lib/dailyStreak";

const COLORS = {
  bg: "#020306",
  card: "rgba(2,3,6,0.34)",
  cyan: "#67E8F9",
  gold: "#FDE047",
  line: "rgba(255,255,255,0.10)",
  muted: "rgba(241,245,249,0.62)",
  pink: "#F472B6",
  soft: "rgba(241,245,249,0.44)",
  text: "#F1F5F9",
};

const CALENDAR_DAYS = 35;
const BACKGROUND_SOURCE = require("../assets/images/seoulhub.png");
const ABSOLUTE_FILL = {
  position: "absolute" as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export default function StreakScreen() {
  const { applyFreeze, isLoading, streak } = useDailyStreak();
  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;
  const isTodayCompleted = streak?.isTodayCompleted ?? false;

  return (
    <ImageBackground
      source={BACKGROUND_SOURCE}
      style={styles.screen}
      resizeMode="cover"
    >
      <BlurView intensity={18} tint="dark" style={styles.bgBlur} />
      <View style={styles.hubDarkOverlay} />
      <View style={styles.topFade} />
      <View style={styles.bottomFade} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>
          <AppText
            variant="sectionLabel"
            tone="strong"
            align="center"
            style={styles.headerTitle}
          >
            Série
          </AppText>
          <View style={styles.iconButtonGhost} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <BlurView intensity={54} tint="dark" style={styles.heroCard}>
            <LinearGradient
              colors={[
                "rgba(103,232,249,0.18)",
                "rgba(244,114,182,0.09)",
                "rgba(2,3,6,0.16)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroAccent} />
            <AppText variant="sectionLabel" tone="accent" style={styles.kicker}>
              HABITUDE QUOTIDIENNE
            </AppText>
            <AppText
              variant="numericValue"
              tone="strong"
              style={styles.bigNumber}
            >
              {currentStreak}
            </AppText>
            <AppText
              variant="sectionTitle"
              tone="strong"
              style={styles.heroTitle}
            >
              {currentStreak > 1 ? "jours de suite" : "jour de suite"}
            </AppText>
            <AppText variant="body" tone="muted" style={styles.heroText}>
              {isTodayCompleted
                ? "Jour valide. Ta série est conservée."
                : "Une petite activité suffit pour conserver ta série."}
            </AppText>
          </BlurView>

          <View style={styles.statsGrid}>
            <StatCard label="Record" value={`${longestStreak} j`} />
            <StatCard
              label="Aujourd'hui"
              value={isTodayCompleted ? "Valide" : "À faire"}
            />
            <StatCard
              label="Protection de série"
              value={`${streak?.freezesAvailable ?? 0}`}
            />
          </View>

          <BlurView intensity={42} tint="dark" style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText
                variant="bodyStrong"
                tone="strong"
                style={styles.sectionTitle}
              >
                Calendrier
              </AppText>
              <AppText
                variant="caption"
                tone="soft"
                style={styles.sectionCaption}
              >
                Derniers {CALENDAR_DAYS} jours
              </AppText>
            </View>
            <CalendarGrid streak={streak} />
          </BlurView>

          <BlurView intensity={42} tint="dark" style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText
                variant="bodyStrong"
                tone="strong"
                style={styles.sectionTitle}
              >
                Protection de série
              </AppText>
              <AppText
                variant="caption"
                tone="soft"
                style={styles.sectionCaption}
              >
                Protection douce
              </AppText>
            </View>
            <AppText variant="body" tone="muted" style={styles.bodyText}>
              Une protection de série couvre une journée manquée. Si tu rates
              une seule journée, elle peut conserver ta série.
            </AppText>
            <View style={styles.actionRow}>
              <Pressable
                disabled={isLoading || (streak?.freezesAvailable ?? 0) <= 0}
                onPress={() => {
                  Vibration.vibrate(8);
                  void applyFreeze();
                }}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.buttonPressed,
                  (streak?.freezesAvailable ?? 0) <= 0 && styles.buttonDisabled,
                ]}
              >
                <AppText variant="button" tone="inverse" style={styles.actionText}>
                  Utiliser une protection
                </AppText>
              </Pressable>
            </View>
          </BlurView>

          <BlurView intensity={42} tint="dark" style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText
                variant="bodyStrong"
                tone="strong"
                style={styles.sectionTitle}
              >
                Badges
              </AppText>
              <AppText
                variant="caption"
                tone="soft"
                style={styles.sectionCaption}
              >
                Paliers non punitifs
              </AppText>
            </View>
            <View style={styles.badgeGrid}>
              {STREAK_BADGE_MILESTONES.map((milestone) => {
                const unlocked = !!streak?.badges[milestone];
                return (
                  <View
                    key={milestone}
                    style={[styles.badgeCard, unlocked && styles.badgeUnlocked]}
                  >
                    <AppText
                      variant="sectionTitle"
                      tone={unlocked ? "premium" : "muted"}
                      align="center"
                      style={[
                        styles.badgeValue,
                        unlocked && styles.badgeValueUnlocked,
                      ]}
                    >
                      {milestone}
                    </AppText>
                    <AppText
                      variant="caption"
                      tone="muted"
                      align="center"
                      style={styles.badgeLabel}
                    >
                      jours
                    </AppText>
                  </View>
                );
              })}
            </View>
          </BlurView>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <BlurView intensity={34} tint="dark" style={styles.statCard}>
      <AppText
        variant="sectionTitle"
        tone="strong"
        align="center"
        style={styles.statValue}
      >
        {value}
      </AppText>
      <AppText
        variant="caption"
        tone="soft"
        align="center"
        style={styles.statLabel}
      >
        {label}
      </AppText>
    </BlurView>
  );
}

function CalendarGrid({ streak }: { streak: DailyStreakState | null }) {
  const days = React.useMemo(() => {
    const today = new Date();
    return Array.from({ length: CALENDAR_DAYS }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (CALENDAR_DAYS - 1 - index));
      return getStreakDateKey(date);
    });
  }, []);

  return (
    <View style={styles.calendarGrid}>
      {days.map((date) => {
        const completed = !!streak?.completedDates[date];
        const frozen = !!streak?.freezeDates[date];
        const isToday = date === streak?.todayDate;

        return (
          <View
            key={date}
            style={[
              styles.calendarDay,
              completed && styles.calendarCompleted,
              frozen && styles.calendarFrozen,
              isToday && styles.calendarToday,
            ]}
          >
            <AppText
              variant="caption"
              tone={completed || frozen ? "strong" : "soft"}
              align="center"
              style={[
                styles.calendarText,
                (completed || frozen) && styles.calendarTextActive,
              ]}
            >
              {date.slice(-2)}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  bgBlur: {
    ...ABSOLUTE_FILL,
  },
  hubDarkOverlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(2,3,6,0.70)",
  },
  topFade: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(0,0,0,0.07)",
  },
  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 240,
    backgroundColor: "rgba(2,3,6,0.46)",
  },
  safe: { flex: 1 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.13)",
    borderRadius: 23,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    width: 46,
  },
  iconButtonGhost: { height: 46, width: 46 },
  headerTitle: {
    color: COLORS.text,
  },
  content: { padding: 20, paddingBottom: 42 },
  heroCard: {
    backgroundColor: "rgba(2,3,6,0.24)",
    borderColor: "rgba(103,232,249,0.22)",
    borderRadius: 26,
    borderWidth: 1,
    overflow: "hidden",
    padding: 22,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  heroAccent: {
    position: "absolute",
    left: 0,
    top: 18,
    bottom: 18,
    width: 3,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: COLORS.cyan,
    opacity: 0.9,
  },
  kicker: {
    color: COLORS.cyan,
    textShadowColor: "rgba(103,232,249,0.38)",
    textShadowRadius: 12,
  },
  bigNumber: {
    color: COLORS.text,
    marginTop: 8,
    textShadowColor: "rgba(103,232,249,0.18)",
    textShadowRadius: 18,
  },
  heroTitle: { color: COLORS.text},
  heroText: { color: COLORS.muted, marginTop: 8 },
  statsGrid: { flexDirection: "row", gap: 10, marginTop: 14 },
  statCard: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: COLORS.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    overflow: "hidden",
    padding: 14,
  },
  statValue: { color: COLORS.text},
  statLabel: { color: COLORS.soft, marginTop: 4 },
  section: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.line,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 14,
    overflow: "hidden",
    padding: 16,
  },
  sectionHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { color: COLORS.text},
  sectionCaption: { color: COLORS.soft},
  bodyText: { color: COLORS.muted},
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  calendarDay: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 34,
    paddingVertical: 5,
    justifyContent: "center",
    width: "11.5%",
  },
  calendarCompleted: {
    backgroundColor: "rgba(103,232,249,0.18)",
    borderColor: "rgba(103,232,249,0.58)",
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  calendarFrozen: {
    backgroundColor: "rgba(244,114,182,0.15)",
    borderColor: "rgba(244,114,182,0.48)",
  },
  calendarToday: {
    borderColor: COLORS.gold,
    borderWidth: 1.5,
  },
  calendarText: { color: "rgba(241,245,249,0.42)"},
  calendarTextActive: { color: COLORS.text },
  actionRow: { gap: 10, marginTop: 14 },
  actionButton: {
    alignItems: "center",
    backgroundColor: "rgba(103,232,249,0.92)",
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.26,
    shadowRadius: 16,
  },
  actionText: { color: "#020306"},
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.45 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: COLORS.line,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    width: "30.8%",
  },
  badgeUnlocked: {
    backgroundColor: "rgba(253,224,71,0.14)",
    borderColor: "rgba(253,224,71,0.52)",
    shadowColor: COLORS.gold,
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  badgeValue: { color: COLORS.muted},
  badgeValueUnlocked: { color: COLORS.gold },
  badgeLabel: { color: COLORS.muted, marginTop: 2 },
});
