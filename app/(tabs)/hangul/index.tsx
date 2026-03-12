import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../../../_store"; // ajuste si besoin

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.65)";
const LINE = "rgba(255,255,255,0.12)";
const CARD = "rgba(255,255,255,0.08)";
const NEON = "rgba(34,211,238,0.55)";
const NEON_BG = "rgba(34,211,238,0.14)";

// Espacements
const SECTION_GAP = 18;
const ITEM_GAP = 14;
const INNER_PAD = 14;

function CardBox({
  children,
  mb = SECTION_GAP,
}: {
  children: React.ReactNode;
  mb?: number;
}) {
  return (
    <View
      style={{
        backgroundColor: CARD,
        borderColor: LINE,
        borderWidth: 1,
        borderRadius: 22,
        padding: INNER_PAD,
        marginBottom: mb,
      }}
    >
      {children}
    </View>
  );
}

function Pill({ label, active }: { label: string; active?: boolean }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? NEON : "rgba(255,255,255,0.70)",
        backgroundColor: active ? NEON_BG : "rgba(255,255,255,0.06)",
      }}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

/**
 * ✅ ModuleCard "béton" :
 * - le style (fond/bordure/radius) est sur un View wrapper (fiable)
 * - Pressable gère seulement le press feedback
 */
function ModuleCard({
  title,
  subtitle,
  href,
  tag,
}: {
  title: string;
  subtitle: string;
  href: string;
  tag?: string;
}) {
  return (
    <Link href={href as any} asChild>
      <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
        <View
          style={{
            backgroundColor: CARD,
            borderColor: LINE,
            borderWidth: 1,
            borderRadius: 22,
            padding: INNER_PAD,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
              <Text
                style={{ color: TXT, fontSize: 18, fontWeight: "900" }}
                numberOfLines={2}
              >
                {title}
              </Text>
            </View>

            {!!tag && <Pill label={tag} active />}
          </View>

          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 19 }}>
            {subtitle}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function HangulHub() {
  const { progress } = useStore();

  const MODULES = [
    {
      title: "Voyelles de base",
      subtitle: "Les 6 voyelles les plus fréquentes + écoute au clic.",
      href: "/(tabs)/hangul/vowels-basic",
      tag: "N1",
    },
    {
      title: "Consonnes de base",
      subtitle: "Romanisation + syllabes exemples (séquencées).",
      href: "/(tabs)/hangul/consonants-basic",
      tag: "N2",
    },
    {
      title: "Voyelles composées",
      subtitle: "ㅐ ㅔ ㅘ ㅝ ㅚ ㅟ ㅢ + écoute au clic.",
      href: "/(tabs)/hangul/vowels-compound",
      tag: "N4",
    },
    {
      title: "Consonnes doubles (tendues)",
      subtitle: "ㄲ ㄸ ㅃ ㅆ ㅉ + exemples audio (séquencés).",
      href: "/(tabs)/hangul/consonants-tense",
      tag: "N5",
    },
    {
      title: "Batchim (cours + exercices)",
      subtitle: "Batchim simple + batchim double + quiz lecture réelle.",
      href: "/(tabs)/hangul/batchim",
      tag: "N6",
    },
  ] as const;

  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      {/* blobs */}
      <View
        style={{
          position: "absolute",
          top: -120,
          left: -90,
          width: 260,
          height: 260,
          borderRadius: 999,
          backgroundColor: "rgba(124,58,237,0.18)",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -150,
          right: -110,
          width: 320,
          height: 320,
          borderRadius: 999,
          backgroundColor: "rgba(34,211,238,0.14)",
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <Text
          style={{ color: TXT, fontSize: 22, fontWeight: "900", marginTop: 8 }}
        >
          Je débute — Hangul
        </Text>

        <View style={{ height: SECTION_GAP }} />

        <CardBox mb={ITEM_GAP}>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            Parcours Hangul (par modules)
          </Text>
          <Text style={{ color: MUTED, marginTop: 6 }}>
            Avancement prototype : Hangul {progress.hangulLevel}/4
          </Text>

          <View style={{ height: 12 }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <Pill label="Moins de scroll" active />
            <Pill label="Ciblé" />
            <Pill label="Audio + exemples" />
          </View>
        </CardBox>
        <Text
          style={{
            color: MUTED,
            marginTop: 30,
            marginBottom: 30,
            lineHeight: 25,
            fontSize: 18,
          }}
        >
          Choisis un sous-module selon ton besoin :
        </Text>

        {MODULES.map((m, idx) => (
          <React.Fragment key={m.href}>
            <ModuleCard
              title={m.title}
              subtitle={m.subtitle}
              href={m.href}
              tag={m.tag}
            />
            {idx < MODULES.length - 1 ? (
              <View style={{ height: ITEM_GAP }} />
            ) : null}
          </React.Fragment>
        ))}

        <View style={{ height: SECTION_GAP }} />

        <CardBox>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            Lecture naturelle
          </Text>
          <Text style={{ color: MUTED, marginTop: 6 }}>
            Les règles d’assimilation (liaisons, nasalisation, tensification…)
            sont dans un module séparé.
          </Text>

          <View style={{ height: 12 }} />
          <Link href={"/assimilation" as any} asChild>
            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <View
                style={{
                  backgroundColor: "rgba(34,211,238,0.14)",
                  borderColor: "rgba(34,211,238,0.55)",
                  borderWidth: 1,
                  paddingVertical: 12,
                  borderRadius: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: TXT, fontWeight: "900" }}>
                  Aller à Assimilation
                </Text>
              </View>
            </Pressable>
          </Link>
        </CardBox>
      </ScrollView>
    </LinearGradient>
  );
}
