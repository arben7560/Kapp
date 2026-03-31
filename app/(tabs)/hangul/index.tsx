import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React, { useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useStore } from "../../../_store";

const BG0 = "#070812";
const BG1 = "#0B0B1D";
const BG2 = "#0B0F22";

const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.74)";
const SOFT = "rgba(255,255,255,0.56)";
const FAINT = "rgba(255,255,255,0.42)";

const CARD = "rgba(255,255,255,0.065)";
const CARD_SOFT = "rgba(255,255,255,0.045)";
const CARD_DEEP = "rgba(14,18,36,0.92)";
const LINE = "rgba(255,255,255,0.11)";
const LINE_STRONG = "rgba(255,255,255,0.16)";

const CYAN = "#22D3EE";
const CYAN_SOFT = "rgba(34,211,238,0.18)";
const PINK = "#F472B6";
const PINK_SOFT = "rgba(244,114,182,0.16)";
const VIOLET = "#8B5CF6";
const VIOLET_SOFT = "rgba(139,92,246,0.18)";
const ORANGE = "#FB923C";
const ORANGE_SOFT = "rgba(251,146,60,0.16)";
const TEAL = "#14B8A6";
const TEAL_SOFT = "rgba(20,184,166,0.16)";

const SECTION_GAP = 18;
const ITEM_GAP = 14;
const INNER_PAD = 16;

function SectionEyebrow({ label }: { label: string }) {
  return (
    <Text
      style={{
        color: FAINT,
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 2.2,
        marginBottom: 8,
      }}
    >
      {label}
    </Text>
  );
}

function GlassCard({
  children,
  mb = SECTION_GAP,
  padding = INNER_PAD,
}: {
  children: React.ReactNode;
  mb?: number;
  padding?: number;
}) {
  return (
    <View
      style={{
        backgroundColor: CARD,
        borderColor: LINE,
        borderWidth: 1,
        borderRadius: 28,
        padding,
        marginBottom: mb,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );
}

function HeroOrb({
  size,
  color,
  top,
  left,
  right,
  bottom,
  opacity = 1,
}: {
  size: number;
  color: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
}) {
  return (
    <View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: 999,
        backgroundColor: color,
        top,
        left,
        right,
        bottom,
        opacity,
      }}
    />
  );
}

function Pill({
  label,
  active,
  tint = CYAN,
  tintBg = CYAN_SOFT,
}: {
  label: string;
  active?: boolean;
  tint?: string;
  tintBg?: string;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? tint : "rgba(255,255,255,0.35)",
        backgroundColor: active ? tintBg : "rgba(255,255,255,0.05)",
      }}
    >
      <Text
        style={{
          color: TXT,
          fontWeight: "800",
          fontSize: 12,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function CTAButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <LinearGradient
        colors={["#7C3AED", "#8B5CF6", "#38BDF8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingVertical: 15,
          paddingHorizontal: 22,
          borderRadius: 18,
          alignSelf: "flex-start",
          minWidth: 170,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "900",
            fontSize: 15,
          }}
        >
          ▶ {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

function ModeCard({
  title,
  subtitle,
  borderColor,
  glowColor,
}: {
  title: string;
  subtitle: string;
  borderColor: string;
  glowColor: string;
}) {
  return (
    <View
      style={{
        backgroundColor: CARD_SOFT,
        borderColor,
        borderWidth: 1.2,
        borderRadius: 24,
        padding: 18,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          right: -8,
          top: -10,
          width: 92,
          height: 92,
          borderRadius: 999,
          backgroundColor: glowColor,
        }}
      />
      <Text
        style={{
          color: TXT,
          fontSize: 17,
          fontWeight: "800",
          marginBottom: 6,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: MUTED,
          fontSize: 14,
          lineHeight: 22,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

function ModuleCard({
  title,
  subtitle,
  href,
  tag,
  accent,
  accentBg,
  icon,
}: {
  title: string;
  subtitle: string;
  href: string;
  tag?: string;
  accent: string;
  accentBg: string;
  icon: string;
}) {
  return (
    <Link href={href as any} asChild>
      <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
        <View
          style={{
            backgroundColor: CARD,
            borderColor: LINE,
            borderWidth: 1,
            borderRadius: 24,
            padding: 14,
            overflow: "hidden",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 14,
              bottom: 14,
              width: 5,
              borderTopRightRadius: 999,
              borderBottomRightRadius: 999,
              backgroundColor: accent,
            }}
          />

          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              borderWidth: 1.3,
              borderColor: accent,
              backgroundColor: accentBg,
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 14,
              marginRight: 14,
            }}
          >
            <Text style={{ fontSize: 27 }}>{icon}</Text>
          </View>

          <View style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
            <Text
              style={{
                color: TXT,
                fontSize: 18,
                fontWeight: "900",
              }}
              numberOfLines={2}
            >
              {title}
            </Text>

            <Text
              style={{
                color: MUTED,
                marginTop: 5,
                lineHeight: 21,
                fontSize: 14,
              }}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
            {!!tag && (
              <View
                style={{
                  paddingHorizontal: 11,
                  paddingVertical: 7,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: accent,
                  backgroundColor: accentBg,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: TXT,
                    fontWeight: "900",
                    fontSize: 12,
                  }}
                >
                  {tag}
                </Text>
              </View>
            )}

            <Text
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: 28,
                fontWeight: "500",
                marginTop: tag ? 0 : 2,
              }}
            >
              ›
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export default function HangulHub() {
  const { progress } = useStore();

  const scrollRef = useRef<ScrollView>(null);
  const [modulesY, setModulesY] = useState(0);

  const handleModulesLayout = (e: LayoutChangeEvent) => {
    setModulesY(e.nativeEvent.layout.y);
  };

  const handleStartPress = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(modulesY - 12, 0),
      animated: true,
    });
  };

  const MODULES = [
    {
      title: "Voyelles de base",
      subtitle: "Les 6 voyelles essentielles pour commencer à lire.",
      href: "/(tabs)/hangul/vowels-basic",
      tag: "ÉTAPE 1",
      accent: PINK,
      accentBg: PINK_SOFT,
      icon: "ㅏ",
    },
    {
      title: "Consonnes de base",
      subtitle: "Les consonnes clés avec syllabes et repères de lecture.",
      href: "/(tabs)/hangul/consonants-basic",
      tag: "ÉTAPE 2",
      accent: CYAN,
      accentBg: CYAN_SOFT,
      icon: "ㄱ",
    },
    {
      title: "Voyelles composées",
      subtitle: "Découvre les combinaisons fréquentes et leur prononciation.",
      href: "/(tabs)/hangul/vowels-compound",
      tag: "ÉTAPE 3",
      accent: VIOLET,
      accentBg: VIOLET_SOFT,
      icon: "ㅘ",
    },
    {
      title: "Consonnes doubles",
      subtitle: "Travaille les sons tendus avec écoute et répétition.",
      href: "/(tabs)/hangul/consonants-tense",
      tag: "ÉTAPE 4",
      accent: ORANGE,
      accentBg: ORANGE_SOFT,
      icon: "ㄲ",
    },
    {
      title: "Batchim",
      subtitle: "Comprends les consonnes finales et entraîne ta lecture.",
      href: "/(tabs)/hangul/batchim",
      tag: "ÉTAPE 5",
      accent: TEAL,
      accentBg: TEAL_SOFT,
      icon: "각",
    },
  ] as const;

  const displayLevel = Math.max(1, progress.hangulLevel ?? 1);

  return (
    <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
      {/* blobs globaux */}
      <HeroOrb size={260} color="rgba(124,58,237,0.18)" top={-120} left={-90} />
      <HeroOrb
        size={340}
        color="rgba(34,211,238,0.14)"
        bottom={-165}
        right={-110}
      />
      <HeroOrb size={180} color="rgba(236,72,153,0.09)" top={120} right={-70} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
      >
        {/* HERO */}
        <GlassCard mb={22} padding={0}>
          <View
            style={{
              padding: 16,
              overflow: "hidden",
              borderRadius: 28,
            }}
          >
            <HeroOrb
              size={210}
              color="rgba(244,114,182,0.10)"
              top={-70}
              left={-40}
            />
            <HeroOrb
              size={148}
              color="rgba(139,92,246,0.16)"
              top={18}
              left={58}
            />
            <HeroOrb
              size={92}
              color="rgba(244,114,182,0.18)"
              top={62}
              left={104}
            />
            <HeroOrb
              size={170}
              color="rgba(34,211,238,0.14)"
              bottom={-70}
              right={-44}
            />

            <View
              style={{
                borderRadius: 30,
                borderWidth: 2,
                borderColor: PINK,
                backgroundColor: "rgba(244,114,182,0.10)",
                height: 168,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <View
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 999,
                  backgroundColor: "rgba(244,114,182,0.13)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: TXT,
                    fontSize: 58,
                    fontWeight: "700",
                  }}
                >
                  회
                </Text>
              </View>
            </View>

            <Text
              style={{
                color: FAINT,
                fontSize: 12,
                fontWeight: "800",
                letterSpacing: 2.4,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              FONDATIONS
            </Text>

            <Text
              style={{
                color: TXT,
                fontSize: 34,
                lineHeight: 40,
                fontWeight: "300",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Hangul
            </Text>

            <Text
              style={{
                color: MUTED,
                textAlign: "center",
                fontSize: 16,
                lineHeight: 28,
                paddingHorizontal: 10,
                marginBottom: 18,
              }}
            >
              Apprends l’alphabet coréen pas à pas, avec lecture, écoute et
              progression guidée.
            </Text>

            <View style={{ alignItems: "center", marginBottom: 14 }}>
              <CTAButton label="Commencer" onPress={handleStartPress} />
            </View>

            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <Pill
                label={`Progression ${displayLevel}/5`}
                active
                tint={PINK}
                tintBg={PINK_SOFT}
              />
              <Pill label="Lecture guidée" />
              <Pill label="Audio + exemples" />
            </View>
          </View>
        </GlassCard>

        {/* MODULES */}
        <View onLayout={handleModulesLayout}>
          <GlassCard mb={22}>
            <SectionEyebrow label="MODULES" />
            <Text
              style={{
                color: TXT,
                fontSize: 22,
                lineHeight: 28,
                fontWeight: "400",
                marginBottom: 8,
              }}
            >
              Choisis une étape
            </Text>

            <Text
              style={{
                color: MUTED,
                fontSize: 16,
                lineHeight: 27,
                marginBottom: 18,
              }}
            >
              Sélectionne directement la base que tu veux travailler.
            </Text>

            <View style={{ gap: ITEM_GAP }}>
              {MODULES.map((m) => (
                <ModuleCard
                  key={m.href}
                  title={m.title}
                  subtitle={m.subtitle}
                  href={m.href}
                  tag={m.tag}
                  accent={m.accent}
                  accentBg={m.accentBg}
                  icon={m.icon}
                />
              ))}
            </View>
          </GlassCard>
        </View>

        {/* ASSIMILATION */}
        <GlassCard mb={0}>
          <View
            style={{
              backgroundColor: "rgba(34,211,238,0.10)",
              borderColor: "rgba(34,211,238,0.32)",
              borderWidth: 1,
              borderRadius: 22,
              padding: 16,
              overflow: "hidden",
            }}
          >
            <HeroOrb
              size={140}
              color="rgba(34,211,238,0.10)"
              top={-45}
              right={-28}
            />
            <SectionEyebrow label="LECTURE NATURELLE" />

            <Text
              style={{
                color: TXT,
                fontSize: 21,
                lineHeight: 27,
                fontWeight: "800",
                marginBottom: 8,
              }}
            >
              Prêt pour une lecture plus réelle ?
            </Text>

            <Text
              style={{
                color: MUTED,
                fontSize: 15,
                lineHeight: 24,
                marginBottom: 16,
              }}
            >
              Les règles d’assimilation, liaisons, nasalisation et tensification
              sont regroupées dans un module séparé.
            </Text>

            <Link href={"/assimilation" as any} asChild>
              <Pressable
                style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
              >
                <View
                  style={{
                    backgroundColor: "rgba(34,211,238,0.14)",
                    borderColor: "rgba(34,211,238,0.55)",
                    borderWidth: 1,
                    paddingVertical: 14,
                    borderRadius: 18,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: TXT,
                      fontWeight: "900",
                      fontSize: 15,
                    }}
                  >
                    Aller à Assimilation
                  </Text>
                </View>
              </Pressable>
            </Link>
          </View>
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}
