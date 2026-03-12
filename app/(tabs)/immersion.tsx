import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

const BG0 = "#070812";
const CARD = "rgba(255,255,255,0.06)";
const LINE = "rgba(255,255,255,0.10)";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.60)";
const CYAN = "rgba(34,211,238,0.55)";
const CYAN_BG = "rgba(34,211,238,0.12)";
const PURPLE = "rgba(124,58,237,0.55)";
const PURPLE_BG = "rgba(124,58,237,0.12)";

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
        <Text style={{ fontSize: 34 }}>{emoji}</Text>
      )}

      <Text
        style={{
          color: TXT,
          fontSize: 22,
          fontWeight: "800",
          marginTop: imageSource ? 0 : 12,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: MUTED,
          marginTop: 10,
          fontSize: 15,
          lineHeight: 22,
        }}
      >
        {mood}
      </Text>

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
            <Text style={{ color: MUTED, fontSize: 12, fontWeight: "700" }}>
              {t}
            </Text>
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
        <Text
          style={{
            color: TXT,
            fontSize: 34,
            fontWeight: "900",
            marginTop: 10,
          }}
        >
          Immersion Séoul
        </Text>

        <Text
          style={{
            color: MUTED,
            marginTop: 10,
            fontSize: 16,
            lineHeight: 24,
          }}
        >
          Explore la ville comme si tu y étais. Observe les lieux, ressens
          l’ambiance et comprends les codes du réel.
        </Text>

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
