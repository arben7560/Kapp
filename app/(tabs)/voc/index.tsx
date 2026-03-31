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

const BG0 = "#070812";
const BG1 = "#0B0B1D";
const BG2 = "#0B0F22";

const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.74)";
const SOFT = "rgba(255,255,255,0.56)";
const FAINT = "rgba(255,255,255,0.42)";

const CARD = "rgba(255,255,255,0.065)";
const CARD_SOFT = "rgba(255,255,255,0.045)";
const LINE = "rgba(255,255,255,0.11)";
const LINE_STRONG = "rgba(255,255,255,0.16)";

const CYAN = "#22D3EE";
const CYAN_SOFT = "rgba(34,211,238,0.16)";
const PINK = "#F472B6";
const PINK_SOFT = "rgba(244,114,182,0.16)";
const VIOLET = "#8B5CF6";
const VIOLET_SOFT = "rgba(139,92,246,0.18)";
const ORANGE = "#FB923C";
const ORANGE_SOFT = "rgba(251,146,60,0.16)";
const TEAL = "#14B8A6";
const TEAL_SOFT = "rgba(20,184,166,0.16)";

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
  tint,
  tintBg,
}: {
  label: string;
  tint: string;
  tintBg: string;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: tint,
        backgroundColor: tintBg,
      }}
    >
      <Text
        style={{
          color: TXT,
          fontSize: 13,
          fontWeight: "800",
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
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <LinearGradient
        colors={["#7C3AED", "#8B5CF6", "#38BDF8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          minWidth: 230,
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "900",
          }}
        >
          ▶ Explorer les thèmes
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

function ThemeCard({
  title,
  subtitle,
  href,
  icon,
  accent,
  accentBg,
}: {
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  accent: string;
  accentBg: string;
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
            minHeight: 108,
            overflow: "hidden",
            flexDirection: "row",
            alignItems: "center",
            paddingRight: 14,
          }}
        >
          <View
            style={{
              width: 6,
              alignSelf: "stretch",
              backgroundColor: accent,
              borderTopRightRadius: 999,
              borderBottomRightRadius: 999,
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
            <Text style={{ fontSize: 28 }}>{icon}</Text>
          </View>

          <View style={{ flex: 1, minWidth: 0, paddingVertical: 16 }}>
            <Text
              style={{
                color: TXT,
                fontSize: 18,
                fontWeight: "800",
                marginBottom: 4,
              }}
              numberOfLines={2}
            >
              {title}
            </Text>

            <Text
              style={{
                color: MUTED,
                fontSize: 15,
                lineHeight: 22,
              }}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          </View>

          <Text
            style={{
              color: SOFT,
              fontSize: 30,
              fontWeight: "400",
              marginLeft: 10,
            }}
          >
            ›
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function VocabularyHub() {
  const scrollRef = useRef<ScrollView>(null);
  const [themesY, setThemesY] = useState(0);

  const handleThemesLayout = (e: LayoutChangeEvent) => {
    setThemesY(e.nativeEvent.layout.y);
  };

  const handleExplorePress = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(themesY - 14, 0),
      animated: true,
    });
  };

  const THEMES = [
    {
      title: "Météo",
      subtitle: "Temps, saisons, température, phrases utiles.",
      href: "/voc/meteo",
      icon: "🌦️",
      accent: CYAN,
      accentBg: CYAN_SOFT,
    },
    {
      title: "Objets du quotidien",
      subtitle: "Maison, bureau, sac, tech… les noms les plus utiles.",
      href: "/voc/objets",
      icon: "👜",
      accent: ORANGE,
      accentBg: ORANGE_SOFT,
    },
    {
      title: "Animaux",
      subtitle: "Animaux courants et vocabulaire simple du quotidien.",
      href: "/voc/animals",
      icon: "🐾",
      accent: PINK,
      accentBg: PINK_SOFT,
    },
    {
      title: "Voyage",
      subtitle: "Aéroport, hôtel, transports, imprévus utiles.",
      href: "/voc/voyage",
      icon: "✈️",
      accent: CYAN,
      accentBg: CYAN_SOFT,
    },
    {
      title: "Lieux & bâtiments",
      subtitle: "Repères, étages, bâtiments, orientation simple.",
      href: "/voc/lieux",
      icon: "🏢",
      accent: VIOLET,
      accentBg: VIOLET_SOFT,
    },
    {
      title: "Santé & corps humain",
      subtitle: "Corps, symptômes simples, pharmacie, urgences légères.",
      href: "/voc/health",
      icon: "🩺",
      accent: TEAL,
      accentBg: TEAL_SOFT,
    },
  ] as const;

  return (
    <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
      <HeroOrb size={260} color="rgba(124,58,237,0.18)" top={-120} left={-90} />
      <HeroOrb
        size={340}
        color="rgba(34,211,238,0.14)"
        bottom={-165}
        right={-110}
      />
      <HeroOrb size={180} color="rgba(236,72,153,0.08)" top={120} right={-70} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 140,
        }}
      >
        {/* HERO */}
        <View
          style={{
            backgroundColor: CARD,
            borderColor: LINE,
            borderWidth: 1,
            borderRadius: 30,
            padding: 16,
            marginBottom: 22,
            overflow: "hidden",
            marginTop: 30,
          }}
        >
          <HeroOrb
            size={210}
            color="rgba(139,92,246,0.12)"
            top={-68}
            left={-22}
          />
          <HeroOrb
            size={150}
            color="rgba(139,92,246,0.12)"
            top={34}
            left={92}
          />
          <HeroOrb
            size={104}
            color="rgba(139,92,246,0.18)"
            top={74}
            left={118}
          />
          <HeroOrb
            size={170}
            color="rgba(244,114,182,0.10)"
            top={78}
            right={-46}
          />
          <HeroOrb
            size={180}
            color="rgba(34,211,238,0.14)"
            bottom={-78}
            right={-34}
          />

          <View
            style={{
              borderRadius: 30,
              borderWidth: 2,
              borderColor: VIOLET,
              backgroundColor: "rgba(139,92,246,0.10)",
              height: 158,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 26,
            }}
          >
            <View
              style={{
                width: 118,
                height: 118,
                borderRadius: 999,
                backgroundColor: "rgba(139,92,246,0.14)",
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
                말
              </Text>
            </View>
          </View>

          <Text
            style={{
              color: FAINT,
              fontSize: 12,
              fontWeight: "800",
              letterSpacing: 2.6,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            VOCABULAIRE
          </Text>

          <Text
            style={{
              color: TXT,
              fontSize: 34,
              lineHeight: 40,
              fontWeight: "300",
              textAlign: "center",
              marginBottom: 14,
            }}
          >
            Mots & situations
          </Text>

          <Text
            style={{
              color: MUTED,
              textAlign: "center",
              fontSize: 16,
              lineHeight: 30,
              paddingHorizontal: 14,
              marginBottom: 24,
            }}
          >
            Apprends les mots essentiels par thème, avec exemples courts et
            utiles dans la vraie vie. Les dialogues plus longs sont dans{" "}
            <Text style={{ color: TXT, fontWeight: "800" }}>Parler</Text>.
          </Text>

          <View style={{ alignItems: "center", marginBottom: 18 }}>
            <CTAButton
              label="Explorer les thèmes"
              onPress={handleExplorePress}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <Pill label="Quotidien" tint={CYAN} tintBg={CYAN_SOFT} />
            <Pill
              label="Situations"
              tint={"rgba(255,255,255,0.24)"}
              tintBg={"rgba(255,255,255,0.04)"}
            />
            <Pill
              label="Oral naturel"
              tint={"#A3A33A"}
              tintBg={"rgba(163,163,58,0.12)"}
            />
          </View>
        </View>

        {/* THEMES */}
        <View
          onLayout={handleThemesLayout}
          style={{
            backgroundColor: CARD,
            borderColor: LINE,
            borderWidth: 1,
            borderRadius: 30,
            padding: 16,
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              color: FAINT,
              fontSize: 12,
              fontWeight: "800",
              letterSpacing: 2.2,
              marginBottom: 8,
            }}
          >
            THÈMES
          </Text>

          <Text
            style={{
              color: TXT,
              fontSize: 22,
              lineHeight: 28,
              fontWeight: "400",
              marginBottom: 8,
            }}
          >
            Choisis un thème
          </Text>

          <Text
            style={{
              color: MUTED,
              fontSize: 16,
              lineHeight: 27,
              marginBottom: 18,
            }}
          >
            Sélectionne directement le vocabulaire que tu veux travailler.
          </Text>

          <View style={{ gap: 14 }}>
            {THEMES.map((theme) => (
              <ThemeCard
                key={theme.href}
                title={theme.title}
                subtitle={theme.subtitle}
                href={theme.href}
                icon={theme.icon}
                accent={theme.accent}
                accentBg={theme.accentBg}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
