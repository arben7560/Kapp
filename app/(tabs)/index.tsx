import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useStore } from "../../_store";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.64)";
const LINE = "rgba(255,255,255,0.10)";
const CARD = "rgba(255,255,255,0.06)";
const CYAN = "rgba(34,211,238,0.50)";
const CYAN_BG = "rgba(34,211,238,0.12)";
const PURPLE = "rgba(124,58,237,0.50)";
const PURPLE_BG = "rgba(124,58,237,0.12)";

type ModuleCardProps = {
  title: string;
  subtitle?: string;
  imageSource?: any;
  accent?: "cyan" | "purple";
  squareSize: number;
  onPress: () => void;
};

function ModuleCard({
  title,
  subtitle,
  imageSource,
  accent = "cyan",
  squareSize,
  onPress,
}: ModuleCardProps) {
  const borderColor = accent === "purple" ? PURPLE : CYAN;
  const bgAccent = accent === "purple" ? PURPLE_BG : CYAN_BG;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: squareSize,
        minHeight: squareSize,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: LINE,
        backgroundColor: CARD,
        padding: 12,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View
        style={{
          height: squareSize * 0.48,
          borderRadius: 18,
          overflow: "hidden",
          borderWidth: 1,
          borderColor,
          backgroundColor: bgAccent,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            resizeMode="cover"
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Text style={{ color: TXT, fontSize: 30 }}>🇰🇷</Text>
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <Text
          style={{
            color: TXT,
            fontSize: 20,
            fontWeight: "900",
            lineHeight: 24,
          }}
          numberOfLines={2}
        >
          {title}
        </Text>

        {!!subtitle && (
          <Text
            style={{
              color: MUTED,
              marginTop: 6,
              lineHeight: 18,
              fontSize: 13,
            }}
            numberOfLines={3}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

type WideCardProps = {
  title: string;
  subtitle?: string;
  imageSource?: any;
  onPress: () => void;
};

function WideCard({ title, subtitle, imageSource, onPress }: WideCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 26,
        borderWidth: 1,
        borderColor: LINE,
        backgroundColor: CARD,
        padding: 14,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View
        style={{
          height: 120,
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: PURPLE,
          backgroundColor: PURPLE_BG,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            resizeMode="cover"
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Text style={{ color: TXT, fontSize: 34 }}>🌃</Text>
        )}
      </View>

      <View style={{ marginTop: 14 }}>
        <Text
          style={{
            color: TXT,
            fontSize: 24,
            fontWeight: "900",
          }}
        >
          {title}
        </Text>

        {!!subtitle && (
          <Text
            style={{
              color: MUTED,
              marginTop: 8,
              lineHeight: 20,
              fontSize: 14,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function SmallPill({ label }: { label: string }) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.05)",
      }}
    >
      <Text style={{ color: TXT, fontSize: 12, fontWeight: "800" }}>
        {label}
      </Text>
    </View>
  );
}

export default function Home() {
  const { width } = useWindowDimensions();
  const { progress, setTrack } = useStore();
  const track = progress.learningTrack;

  const gap = 12;
  const horizontalPadding = 16;
  const squareSize = (width - horizontalPadding * 2 - gap) / 2;

  const trackLabel =
    track === "hangul"
      ? "Hangul"
      : track === "vocab"
        ? "Vocabulaire"
        : track === "dialogs"
          ? "Dialogues"
          : track === "listen"
            ? "Écoute"
            : track === "immersion"
              ? "Immersion"
              : null;

  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      <View
        pointerEvents="none"
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
        pointerEvents="none"
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

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text
          style={{
            color: TXT,
            fontSize: 28,
            fontWeight: "900",
            marginTop: 8,
          }}
        >
          K-App 🇰🇷
        </Text>

        <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
          Apprends le coréen dans la vraie vie à Séoul.
        </Text>

        <View style={{ height: 10 }} />

        <SmallPill label="café • métro • restaurant • shopping" />

        {trackLabel && (
          <>
            <View style={{ height: 12 }} />
            <SmallPill label={`Parcours actuel : ${trackLabel}`} />
          </>
        )}

        <View style={{ height: 26 }} />

        <Text
          style={{
            color: TXT,
            fontSize: 22,
            fontWeight: "900",
            marginBottom: 8,
          }}
        >
          Choisis ton point de départ
        </Text>

        <Text style={{ color: MUTED, marginBottom: 18 }}>
          Tu peux changer de parcours à tout moment.
        </Text>

        <View style={{ flexDirection: "row", gap }}>
          <ModuleCard
            squareSize={squareSize}
            title="Hangul"
            subtitle="Voyelles, consonnes, syllabes, batchim"
            accent="purple"
            onPress={() => {
              setTrack("hangul");
              router.push("/(tabs)/hangul");
            }}
          />

          <ModuleCard
            squareSize={squareSize}
            title="Vocabulaire"
            subtitle="Mots utiles par lieux et situations"
            accent="cyan"
            onPress={() => {
              setTrack("vocab");
              router.push("/(tabs)/places");
            }}
          />
        </View>

        <View style={{ height: gap }} />

        <View style={{ flexDirection: "row", gap }}>
          <ModuleCard
            squareSize={squareSize}
            title="Dialogues simples"
            subtitle="Parler vite avec des phrases utiles"
            accent="cyan"
            onPress={() => {
              setTrack("dialogs");
              router.push("/(tabs)/speak");
            }}
          />

          <ModuleCard
            squareSize={squareSize}
            title="Écoute / compréhension"
            subtitle="Session audio quotidienne et thèmes du jour"
            accent="cyan"
            onPress={() => {
              setTrack("listen" as any);
              router.push("/(tabs)/listen");
            }}
          />
        </View>

        <View style={{ height: 18 }} />

        <WideCard
          title="Immersion Séoul"
          subtitle="Vis des scènes proches du réel : café, métro, restaurant, boutique… le module le plus immersif de l’app."
          onPress={() => {
            setTrack("immersion");
            router.push("/(tabs)/immersion");
          }}
        />

        <View style={{ height: 18 }} />

        <View
          style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: LINE,
            backgroundColor: "rgba(255,255,255,0.03)",
            padding: 14,
          }}
        >
          <Text
            style={{
              color: "rgba(255,255,255,0.62)",
              lineHeight: 20,
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            Astuce : commence par Hangul si tu ne lis pas encore, puis passe à
            Vocabulaire, Dialogues et Écoute avant Immersion.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/test-audio")}
          style={{
            marginTop: 18,
            alignSelf: "center",
            backgroundColor: "rgba(124,58,237,0.85)",
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: "800",
              letterSpacing: 0.3,
            }}
          >
            🔊 Tester le son (debug)
          </Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}
