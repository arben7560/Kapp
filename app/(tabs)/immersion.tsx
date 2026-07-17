import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

import { AppText } from "../../components/app-text";

const BG0 = "#070812";
const CARD = "rgba(255,255,255,0.06)";
const LINE = "rgba(255,255,255,0.10)";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.60)";

function CapsuleCard({
  emoji,
  title,
  mood,
  tags,
  imageSource,
  href,
}: {
  emoji: string;
  title: string;
  mood: string;
  tags: string[];
  imageSource?: any;
  href?: Href;
}) {
  return (
    <Pressable
      onPress={() => href && router.push(href)}
      disabled={!href}
      style={{
        backgroundColor: CARD,
        borderRadius: 28,
        padding: 22,
        borderWidth: 1,
        borderColor: LINE,
        marginBottom: 26,
        opacity: href ? 1 : 0.9,
      }}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={{
            width: "100%",
            height: 160,
            borderRadius: 18,
            marginBottom: 14,
          }}
          resizeMode="cover"
        />
      ) : (
        <AppText variant="screenTitle">{emoji}</AppText>
      )}

      <AppText
        variant="sectionTitle"
        style={{
          color: TXT,
          marginTop: imageSource ? 0 : 12,
        }}
      >
        {title}
      </AppText>

      <AppText
        variant="body"
        tone="muted"
        style={{
          color: MUTED,
          marginTop: 10,
        }}
      >
        {mood}
      </AppText>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 16,
        }}
      >
        {tags.map((t) => (
          <View
            key={t}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.14)",
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          >
            <AppText variant="caption" tone="muted" style={{ color: MUTED }}>
              {t}
            </AppText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

export default function ImmersionScreen() {
  return (
    <LinearGradient colors={[BG0, "#0b0f22", "#0e132d"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <AppText
          accessibilityRole="header"
          variant="screenTitle"
          style={{
            color: TXT,
            marginTop: 10,
          }}
        >
          Immersion Séoul
        </AppText>

        <AppText
          variant="subtitle"
          tone="muted"
          style={{
            color: MUTED,
            marginTop: 10,
          }}
        >
          Explore la ville comme si tu y étais. Observe les lieux, ressens
          l’ambiance et comprends les codes du réel.
        </AppText>

        <View style={{ height: 36 }} />

        <CapsuleCard
          emoji="🏪"
          imageSource={require("../../assets/immersion/convenience-night.png")}
          title="Convenience store de nuit"
          mood="Lumières froides, silence léger, passages discrets à la caisse."
          tags={["caisse", "snacks", "gestes", "ambiance"]}
          href="/immersion/convenience-night"
        />

        <CapsuleCard
          emoji="🚇"
          imageSource={require("../../assets/immersion/gangnam.png")}
          title="Sortie de métro à Gangnam"
          mood="Flux pressé, panneaux colorés, repères urbains et directions multiples."
          tags={["sorties", "lignes", "panneaux", "foule"]}
          href="/immersion/gangnam"
        />

        <CapsuleCard
          emoji="☕"
          imageSource={require("../../assets/immersion/seongsu.png")}
          title="Café calme à Seongsu"
          mood="Décor posé, commandes simples, conversations basses et temps suspendu."
          tags={["menu", "commande", "ambiance", "gestes"]}
          href="/immersion/seongsu"
        />

        <CapsuleCard
          emoji="🌆"
          imageSource={require("../../assets/immersion/myeongdong.png")}
          title="Rue commerçante de Myeongdong"
          mood="Enseignes lumineuses, promotions vocales et énergie vibrante."
          tags={["enseignes", "promos", "mouvement", "ville"]}
          href="/immersion/myeongdong"
        />

        <CapsuleCard
          emoji="🤝"
          imageSource={require("../../assets/immersion/social.png")}
          title="Codes sociaux du quotidien"
          mood="Politesse discrète, gestes respectueux et interactions implicites."
          tags={["politesse", "gestes", "respect", "habitudes"]}
          href="/immersion/social"
        />
      </ScrollView>
    </LinearGradient>
  );
}
