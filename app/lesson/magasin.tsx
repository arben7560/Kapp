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

type ShopTab = "vendeur" | "client" | "connecteurs" | "dialogues" | "quiz";

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

export default function ShopLesson() {
  const [tab, setTab] = useState<ShopTab>("vendeur");

  const content = useMemo(() => {
    if (tab === "vendeur") {
      return (
        <>
          <Card>
            <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
              🛍️ Ce que dit souvent le vendeur
            </Text>
            <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
              Les phrases fréquentes dans une boutique à Séoul.
            </Text>
          </Card>

          <View style={{ height: 14 }} />

          <LineBlock
            speaker="Vendeur"
            kr="찾으시는 거 있어요?"
            fr="Vous cherchez quelque chose ?"
          />
          <LineBlock
            speaker="Vendeur"
            kr="사이즈 뭐 찾으세요?"
            fr="Quelle taille cherchez-vous ?"
          />
          <LineBlock
            speaker="Vendeur"
            kr="입어보셔도 돼요."
            fr="Vous pouvez l'essayer."
          />
          <LineBlock
            speaker="Vendeur"
            kr="다른 색도 있어요."
            fr="On l'a aussi dans une autre couleur."
          />
          <LineBlock
            speaker="Vendeur"
            kr="택스프리 가능해요."
            fr="Le tax free est possible."
          />
          <LineBlock
            speaker="Vendeur"
            kr="여권 있으세요?"
            fr="Vous avez votre passeport ?"
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
              Les phrases les plus utiles pour demander une taille, essayer et
              parler tax free.
            </Text>
          </Card>

          <View style={{ height: 14 }} />

          <LineBlock
            speaker="Client"
            kr="이거 입어봐도 돼요?"
            fr="Je peux essayer ça ?"
          />
          <LineBlock
            speaker="Client"
            kr="M 사이즈 있어요?"
            fr="Vous avez du M ?"
          />
          <LineBlock
            speaker="Client"
            kr="다른 색도 있어요?"
            fr="Vous l'avez aussi dans une autre couleur ?"
          />
          <LineBlock
            speaker="Client"
            kr="피팅룸이 어디예요?"
            fr="Où est la cabine d'essayage ?"
          />
          <LineBlock
            speaker="Client"
            kr="택스프리 돼요?"
            fr="Tax free possible ?"
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
              Pour enchaîner taille, couleur, essayage et tax free plus
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
              M 사이즈하고 검정색 있어요?
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 4 }}>
              Vous avez du M et en noir ?
            </Text>
            <AudioButton kr="M 사이즈하고 검정색 있어요?" />

            <Text style={{ color: MUTED, marginTop: 12 }}>
              그럼 이거 입어볼게요.
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 4 }}>
              Alors je vais essayer celui-ci.
            </Text>
            <AudioButton kr="그럼 이거 입어볼게요." />

            <Text style={{ color: MUTED, marginTop: 12 }}>
              혹시 택스프리 가능해요?
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 4 }}>
              Est-ce que le tax free est possible ?
            </Text>
            <AudioButton kr="혹시 택스프리 가능해요?" />
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
              De petites scènes réalistes en boutique.
            </Text>
          </Card>

          <View style={{ height: 14 }} />

          <Card>
            <Text style={{ color: "rgba(34,211,238,0.9)", fontWeight: "900" }}>
              Dialogue 1 — taille et essayage
            </Text>

            <View style={{ height: 10 }} />

            <LineBlock
              speaker="Client"
              kr="M 사이즈 있어요?"
              fr="Vous avez du M ?"
            />
            <LineBlock speaker="Vendeur" kr="네, 있어요." fr="Oui, on en a." />
            <LineBlock
              speaker="Client"
              kr="이거 입어봐도 돼요?"
              fr="Je peux essayer ça ?"
            />
            <LineBlock
              speaker="Vendeur"
              kr="네, 피팅룸 저쪽이에요."
              fr="Oui, la cabine est par là."
            />
          </Card>

          <View style={{ height: 12 }} />

          <Card>
            <Text style={{ color: "rgba(34,211,238,0.9)", fontWeight: "900" }}>
              Dialogue 2 — tax free
            </Text>

            <View style={{ height: 10 }} />

            <LineBlock
              speaker="Client"
              kr="택스프리 돼요?"
              fr="Tax free possible ?"
            />
            <LineBlock
              speaker="Vendeur"
              kr="네, 가능해요."
              fr="Oui, c'est possible."
            />
            <LineBlock
              speaker="Vendeur"
              kr="여권 있으세요?"
              fr="Vous avez votre passeport ?"
            />
            <LineBlock speaker="Client" kr="네, 있어요." fr="Oui, je l'ai." />
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
          kr="이거 입어봐도 돼요?"
          roman="igeo ibeobwado dwaeyo?"
          fr="Je peux essayer ça ?"
        />
        <VocabRow
          kr="M 사이즈 있어요?"
          roman="M saijeu isseoyo?"
          fr="Vous avez du M ?"
        />
        <VocabRow
          kr="택스프리 돼요?"
          roman="taekseupeuri dwaeyo?"
          fr="Tax free possible ?"
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
          Magasin — taille, essayage, détaxe
        </Text>

        <Text style={{ color: MUTED, marginTop: 8, lineHeight: 22 }}>
          Vendeur, client, connecteurs naturels, mini-dialogues et petit quiz
          pour gérer une situation réelle en boutique.
        </Text>

        <View style={{ height: 14 }} />

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <Pill label="Magasin" active />
          <Pill label="Shopping" />
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
            Situations fréquentes : 사이즈 • 피팅룸 • 색 • 택스프리
          </Text>
        </View>

        <View style={{ height: 18 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
            🛍️ Mode immersif
          </Text>
          <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
            Apprends comme si tu étais dans une boutique à Séoul : phrases du
            vendeur → réponses client → connecteurs naturels → mini-dialogues →
            mini-quiz.
          </Text>

          <View style={{ height: 14 }} />

          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            <Pill
              label="Vendeur"
              active={tab === "vendeur"}
              onPress={() => setTab("vendeur")}
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
