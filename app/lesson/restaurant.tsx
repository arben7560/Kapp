import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.65)";
const LINE = "rgba(255,255,255,0.12)";
const CARD = "rgba(255,255,255,0.06)";
const CYAN = "rgba(34,211,238,0.50)";
const CYAN_BG = "rgba(34,211,238,0.12)";
const PURPLE = "rgba(124,58,237,0.50)";
const PURPLE_BG = "rgba(124,58,237,0.12)";

type RestaurantTab =
  | "serveur"
  | "client"
  | "connecteurs"
  | "dialogues"
  | "quiz";

function speakKR(text: string) {
  Speech.stop();
  Speech.speak(text, {
    language: "ko-KR",
    rate: 0.92,
    pitch: 1.0,
  });
}

function Pill({
  label,
  active = false,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? CYAN : LINE,
        backgroundColor: active ? CYAN_BG : "rgba(255,255,255,0.04)",
      })}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: CARD,
        borderColor: LINE,
        borderWidth: 1,
        borderRadius: 22,
        padding: 14,
      }}
    >
      {children}
    </View>
  );
}

function AudioButton({ kr }: { kr: string }) {
  return (
    <Pressable
      onPress={() => speakKR(kr)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: PURPLE,
        backgroundColor: PURPLE_BG,
      })}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 12 }}>
        🔊 Écouter
      </Text>
    </Pressable>
  );
}

function VocabRow({
  kr,
  roman,
  fr,
  level = "débutant",
}: {
  kr: string;
  roman: string;
  fr: string;
  level?: string;
}) {
  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.035)",
        borderColor: LINE,
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
            {kr}
          </Text>
          <Text style={{ color: MUTED, marginTop: 4 }}>{roman}</Text>
          <Text style={{ color: MUTED, marginTop: 4 }}>• {level}</Text>
        </View>

        <View style={{ alignItems: "flex-end", gap: 8 }}>
          <Text
            style={{
              color: "rgba(255,255,255,0.75)",
              fontWeight: "800",
              marginTop: 4,
            }}
          >
            {fr}
          </Text>
          <AudioButton kr={kr} />
        </View>
      </View>
    </View>
  );
}

function LineBlock({
  speaker,
  kr,
  fr,
}: {
  speaker: string;
  kr: string;
  fr: string;
}) {
  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.035)",
        borderColor: LINE,
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "rgba(34,211,238,0.9)",
              fontWeight: "900",
              marginBottom: 8,
            }}
          >
            {speaker}
          </Text>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            {kr}
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            {fr}
          </Text>
        </View>
        <AudioButton kr={kr} />
      </View>
    </View>
  );
}

export default function RestaurantLesson() {
  const [tab, setTab] = useState<RestaurantTab>("serveur");

  const content = useMemo(() => {
    if (tab === "serveur") {
      return (
        <>
          <Card>
            <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
              🍜 Ce que dit souvent le serveur
            </Text>
            <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
              Les phrases fréquentes quand tu commandes au restaurant.
            </Text>
          </Card>

          <View style={{ height: 14 }} />

          <LineBlock speaker="Serveur" kr="어서 오세요!" fr="Bienvenue !" />
          <LineBlock
            speaker="Serveur"
            kr="몇 분이세요?"
            fr="Vous êtes combien ?"
          />
          <LineBlock
            speaker="Serveur"
            kr="주문하시겠어요?"
            fr="Voulez-vous commander ?"
          />
          <LineBlock
            speaker="Serveur"
            kr="맵게 드릴까요?"
            fr="Je vous le fais épicé ?"
          />
          <LineBlock
            speaker="Serveur"
            kr="더 필요하신 거 있어요?"
            fr="Vous avez besoin d'autre chose ?"
          />
          <LineBlock
            speaker="Serveur"
            kr="계산 도와드릴게요."
            fr="Je vous aide pour le paiement."
          />
        </>
      );
    }

    if (tab === "client") {
      return (
        <>
          <Card>
            <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
              🙋 Ce que dit souvent le client
            </Text>
            <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
              Les phrases les plus utiles pour commander naturellement.
            </Text>
          </Card>

          <View style={{ height: 14 }} />

          <LineBlock
            speaker="Client"
            kr="이거 주세요."
            fr="Je prends ça, s'il vous plaît."
          />
          <LineBlock
            speaker="Client"
            kr="물 주세요."
            fr="De l'eau, s'il vous plaît."
          />
          <LineBlock
            speaker="Client"
            kr="안 매운 걸로 주세요."
            fr="Quelque chose de non piquant, s'il vous plaît."
          />
          <LineBlock speaker="Client" kr="이거 뭐예요?" fr="C'est quoi, ça ?" />
          <LineBlock
            speaker="Client"
            kr="계산서 주세요."
            fr="L'addition, s'il vous plaît."
          />
          <LineBlock
            speaker="Client"
            kr="카드로 할게요."
            fr="Je vais payer par carte."
          />
        </>
      );
    }

    if (tab === "connecteurs") {
      return (
        <>
          <Card>
            <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
              🔗 Connecteurs naturels
            </Text>
            <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
              Pour ajouter de l'eau, lier plusieurs plats ou rebondir
              naturellement.
            </Text>
          </Card>

          <View style={{ height: 14 }} />

          <VocabRow kr="하고" roman="hago" fr="et / avec" />
          <VocabRow kr="이랑 / 랑" roman="irang / rang" fr="et / avec (oral)" />
          <VocabRow kr="그리고" roman="geurigo" fr="et puis / et" />
          <VocabRow kr="그럼" roman="geureom" fr="alors / dans ce cas" />
          <VocabRow kr="혹시" roman="hoksi" fr="par hasard / est-ce que..." />

          <View style={{ height: 10 }} />

          <Card>
            <Text style={{ color: TXT, fontWeight: "900", fontSize: 18 }}>
              Exemples utiles
            </Text>

            <Text style={{ color: MUTED, marginTop: 10 }}>
              비빔밥하고 물 주세요.
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 4 }}>
              Un bibimbap et de l'eau, s'il vous plaît.
            </Text>
            <AudioButton kr="비빔밥하고 물 주세요." />

            <Text style={{ color: MUTED, marginTop: 12 }}>
              그럼 안 매운 걸로 주세요.
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 4 }}>
              Alors quelque chose de non piquant, s'il vous plaît.
            </Text>
            <AudioButton kr="그럼 안 매운 걸로 주세요." />

            <Text style={{ color: MUTED, marginTop: 12 }}>
              혹시 추천 메뉴 있어요?
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 4 }}>
              Est-ce que vous avez un plat recommandé ?
            </Text>
            <AudioButton kr="혹시 추천 메뉴 있어요?" />
          </Card>
        </>
      );
    }

    if (tab === "dialogues") {
      return (
        <>
          <Card>
            <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
              💬 Mini-dialogues immersifs
            </Text>
            <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
              De petites scènes réalistes au restaurant.
            </Text>
          </Card>

          <View style={{ height: 14 }} />

          <Card>
            <Text style={{ color: "rgba(34,211,238,0.9)", fontWeight: "900" }}>
              Dialogue 1 — commander un plat
            </Text>

            <View style={{ height: 10 }} />

            <LineBlock
              speaker="Serveur"
              kr="주문하시겠어요?"
              fr="Voulez-vous commander ?"
            />
            <LineBlock
              speaker="Client"
              kr="비빔밥 주세요."
              fr="Un bibimbap, s'il vous plaît."
            />
            <LineBlock
              speaker="Serveur"
              kr="맵게 드릴까요?"
              fr="Je vous le fais épicé ?"
            />
            <LineBlock
              speaker="Client"
              kr="안 매운 걸로 주세요."
              fr="Quelque chose de non piquant, s'il vous plaît."
            />
          </Card>

          <View style={{ height: 12 }} />

          <Card>
            <Text style={{ color: "rgba(34,211,238,0.9)", fontWeight: "900" }}>
              Dialogue 2 — demander l’addition
            </Text>

            <View style={{ height: 10 }} />

            <LineBlock
              speaker="Client"
              kr="계산서 주세요."
              fr="L'addition, s'il vous plaît."
            />
            <LineBlock
              speaker="Serveur"
              kr="카드예요, 현금이에요?"
              fr="Carte ou espèces ?"
            />
            <LineBlock
              speaker="Client"
              kr="카드로 할게요."
              fr="Je vais payer par carte."
            />
          </Card>
        </>
      );
    }

    return (
      <>
        <Card>
          <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
            🧠 Mini-quiz
          </Text>
          <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
            Petites vérifications rapides pour ancrer le contenu.
          </Text>
        </Card>

        <View style={{ height: 14 }} />

        <VocabRow
          kr="주문하시겠어요?"
          roman="jumunhasigesseoyo?"
          fr="Voulez-vous commander ?"
        />
        <VocabRow
          kr="안 매운 걸로 주세요."
          roman="an maeun geollo juseyo"
          fr="Quelque chose de non piquant, s'il vous plaît."
        />
        <VocabRow
          kr="계산서 주세요."
          roman="gyesanseo juseyo"
          fr="L'addition, s'il vous plaît."
        />
      </>
    );
  }, [tab]);

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
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: MUTED, fontWeight: "800" }}>← Retour</Text>
        </Pressable>

        <View style={{ height: 14 }} />

        <Text style={{ color: TXT, fontSize: 32, fontWeight: "900" }}>
          Restaurant — commander un plat
        </Text>

        <Text style={{ color: MUTED, marginTop: 8, lineHeight: 22 }}>
          Serveur, client, connecteurs naturels, mini-dialogues et petit quiz
          pour manger plus naturellement en Corée.
        </Text>

        <View style={{ height: 14 }} />

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <Pill label="Restaurant" active />
          <Pill label="Commande" />
          <Pill label="Séoul réel" />
        </View>

        <View style={{ height: 12 }} />

        <View
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(255,99,132,0.28)",
            backgroundColor: "rgba(255,99,132,0.08)",
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ color: TXT, fontWeight: "800" }}>
            Situations fréquentes : 주문 • 물 • 안 맵게 • 계산
          </Text>
        </View>

        <View style={{ height: 18 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
            🍽️ Mode immersif
          </Text>
          <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
            Apprends comme si tu étais au restaurant à Séoul : phrases du
            serveur → réponses client → connecteurs naturels → mini-dialogues →
            mini-quiz.
          </Text>

          <View style={{ height: 14 }} />

          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            <Pill
              label="Serveur"
              active={tab === "serveur"}
              onPress={() => setTab("serveur")}
            />
            <Pill
              label="Client"
              active={tab === "client"}
              onPress={() => setTab("client")}
            />
            <Pill
              label="Connecteurs"
              active={tab === "connecteurs"}
              onPress={() => setTab("connecteurs")}
            />
            <Pill
              label="Dialogues"
              active={tab === "dialogues"}
              onPress={() => setTab("dialogues")}
            />
            <Pill
              label="Quiz"
              active={tab === "quiz"}
              onPress={() => setTab("quiz")}
            />
          </View>
        </Card>

        <View style={{ height: 16 }} />

        {content}
      </ScrollView>
    </LinearGradient>
  );
}
