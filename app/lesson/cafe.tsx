import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

type CafeTab = "serveur" | "client" | "connecteurs" | "dialogues" | "quiz";

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

        <Text
          style={{
            color: "rgba(255,255,255,0.75)",
            fontWeight: "800",
            marginTop: 4,
          }}
        >
          {fr}
        </Text>
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
      <Text
        style={{
          color: "rgba(34,211,238,0.9)",
          fontWeight: "900",
          marginBottom: 8,
        }}
      >
        {speaker}
      </Text>
      <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>{kr}</Text>
      <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>{fr}</Text>
    </View>
  );
}

export default function CafeLesson() {
  const [tab, setTab] = useState<CafeTab>("serveur");

  const content = useMemo(() => {
    if (tab === "serveur") {
      return (
        <>
          <Card>
            <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
              ☕ Ce que dit souvent le serveur
            </Text>
            <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
              Les phrases les plus fréquentes quand tu commandes dans un café à
              Séoul.
            </Text>
          </Card>

          <View style={{ height: 14 }} />

          <LineBlock speaker="Serveur" kr="어서 오세요!" fr="Bienvenue !" />
          <LineBlock
            speaker="Serveur"
            kr="무엇을 드릴까요?"
            fr="Que puis-je vous servir ?"
          />
          <LineBlock
            speaker="Serveur"
            kr="주문하시겠어요?"
            fr="Voulez-vous commander ?"
          />
          <LineBlock
            speaker="Serveur"
            kr="매장에서 드세요, 가져가세요?"
            fr="Sur place ou à emporter ?"
          />
          <LineBlock
            speaker="Serveur"
            kr="카드예요, 현금이에요?"
            fr="Carte ou espèces ?"
          />
          <LineBlock
            speaker="Serveur"
            kr="주문하신 음료 나왔습니다."
            fr="Votre boisson est prête."
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
            kr="아메리카노 하나 주세요."
            fr="Un americano, s'il vous plaît."
          />
          <LineBlock
            speaker="Client"
            kr="라떼 하나 주세요."
            fr="Un latte, s'il vous plaît."
          />
          <LineBlock
            speaker="Client"
            kr="아이스로 주세요."
            fr="En version glacée, s'il vous plaît."
          />
          <LineBlock
            speaker="Client"
            kr="매장에서 마실게요."
            fr="Je vais le boire sur place."
          />
          <LineBlock
            speaker="Client"
            kr="포장해 주세요."
            fr="À emporter, s'il vous plaît."
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
              Pour lier plusieurs éléments dans une commande et parler plus
              naturellement.
            </Text>
          </Card>

          <View style={{ height: 14 }} />

          <VocabRow kr="하고" roman="hago" fr="et / avec" level="débutant" />
          <VocabRow
            kr="이랑 / 랑"
            roman="irang / rang"
            fr="et / avec (plus oral)"
            level="débutant"
          />
          <VocabRow
            kr="그리고"
            roman="geurigo"
            fr="et puis / et"
            level="débutant"
          />
          <VocabRow
            kr="그럼"
            roman="geureom"
            fr="alors / dans ce cas"
            level="débutant"
          />
          <VocabRow
            kr="혹시"
            roman="hoksi"
            fr="par hasard / est-ce que par hasard"
            level="intermédiaire"
          />

          <View style={{ height: 10 }} />

          <Card>
            <Text style={{ color: TXT, fontWeight: "900", fontSize: 18 }}>
              Exemples utiles
            </Text>

            <Text style={{ color: MUTED, marginTop: 10, lineHeight: 20 }}>
              아메리카노하고 쿠키 하나 주세요.
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 4 }}>
              Un americano et un cookie, s'il vous plaît.
            </Text>

            <Text style={{ color: MUTED, marginTop: 12, lineHeight: 20 }}>
              라떼랑 케이크 주세요.
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 4 }}>
              Un latte et un gâteau, s'il vous plaît.
            </Text>

            <Text style={{ color: MUTED, marginTop: 12, lineHeight: 20 }}>
              그럼 아이스로 주세요.
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 4 }}>
              Alors en glacé, s'il vous plaît.
            </Text>

            <Text style={{ color: MUTED, marginTop: 12, lineHeight: 20 }}>
              혹시 덜 달게 가능해요?
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 4 }}>
              Est-ce possible un peu moins sucré ?
            </Text>
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
              De petites scènes réalistes pour sentir le rythme naturel d’un
              café coréen.
            </Text>
          </Card>

          <View style={{ height: 14 }} />

          <Card>
            <Text style={{ color: "rgba(34,211,238,0.9)", fontWeight: "900" }}>
              Dialogue 1 — commande simple
            </Text>

            <Text style={{ color: TXT, marginTop: 10, fontWeight: "900" }}>
              Serveur
            </Text>
            <Text style={{ color: MUTED, marginTop: 4 }}>무엇을 드릴까요?</Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 2 }}>
              Que puis-je vous servir ?
            </Text>

            <Text style={{ color: TXT, marginTop: 12, fontWeight: "900" }}>
              Client
            </Text>
            <Text style={{ color: MUTED, marginTop: 4 }}>
              아메리카노 하나 주세요.
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 2 }}>
              Un americano, s'il vous plaît.
            </Text>

            <Text style={{ color: TXT, marginTop: 12, fontWeight: "900" }}>
              Serveur
            </Text>
            <Text style={{ color: MUTED, marginTop: 4 }}>
              매장에서 드세요, 가져가세요?
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 2 }}>
              Sur place ou à emporter ?
            </Text>

            <Text style={{ color: TXT, marginTop: 12, fontWeight: "900" }}>
              Client
            </Text>
            <Text style={{ color: MUTED, marginTop: 4 }}>포장해 주세요.</Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 2 }}>
              À emporter, s'il vous plaît.
            </Text>
          </Card>

          <View style={{ height: 12 }} />

          <Card>
            <Text style={{ color: "rgba(34,211,238,0.9)", fontWeight: "900" }}>
              Dialogue 2 — deux éléments
            </Text>

            <Text style={{ color: TXT, marginTop: 10, fontWeight: "900" }}>
              Serveur
            </Text>
            <Text style={{ color: MUTED, marginTop: 4 }}>주문하시겠어요?</Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 2 }}>
              Voulez-vous commander ?
            </Text>

            <Text style={{ color: TXT, marginTop: 12, fontWeight: "900" }}>
              Client
            </Text>
            <Text style={{ color: MUTED, marginTop: 4 }}>
              라떼랑 쿠키 하나 주세요.
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 2 }}>
              Un latte et un cookie, s'il vous plaît.
            </Text>

            <Text style={{ color: TXT, marginTop: 12, fontWeight: "900" }}>
              Serveur
            </Text>
            <Text style={{ color: MUTED, marginTop: 4 }}>
              카드예요, 현금이에요?
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 2 }}>
              Carte ou espèces ?
            </Text>

            <Text style={{ color: TXT, marginTop: 12, fontWeight: "900" }}>
              Client
            </Text>
            <Text style={{ color: MUTED, marginTop: 4 }}>카드로 할게요.</Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 2 }}>
              Je vais payer par carte.
            </Text>
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
            Quelques vérifications rapides pour ancrer le contenu.
          </Text>
        </Card>

        <View style={{ height: 14 }} />

        <Card>
          <Text style={{ color: TXT, fontWeight: "900", fontSize: 18 }}>
            1) “Sur place ou à emporter ?” se dit…
          </Text>
          <Text style={{ color: MUTED, marginTop: 10 }}>
            매장에서 드세요, 가져가세요?
          </Text>
        </Card>

        <View style={{ height: 10 }} />

        <Card>
          <Text style={{ color: TXT, fontWeight: "900", fontSize: 18 }}>
            2) “Je vais payer par carte” se dit…
          </Text>
          <Text style={{ color: MUTED, marginTop: 10 }}>카드로 할게요.</Text>
        </Card>

        <View style={{ height: 10 }} />

        <Card>
          <Text style={{ color: TXT, fontWeight: "900", fontSize: 18 }}>
            3) “Un americano et un cookie, s'il vous plaît” se dit…
          </Text>
          <Text style={{ color: MUTED, marginTop: 10 }}>
            아메리카노하고 쿠키 하나 주세요.
          </Text>
        </Card>
      </>
    );
  }, [tab]);

  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      {/* glows */}
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
          Café — commande réelle
        </Text>

        <Text style={{ color: MUTED, marginTop: 8, lineHeight: 22 }}>
          Serveur, client, connecteurs naturels, mini-dialogues et petit quiz
          pour commander plus naturellement dans un café coréen.
        </Text>

        <View style={{ height: 14 }} />

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <Pill label="Café" active />
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
            Situations fréquentes : 주문 • 매장/포장 • 결제 • 연결어
          </Text>
        </View>

        <View style={{ height: 18 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
            ☕ Mode immersif
          </Text>
          <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
            Apprends comme si tu étais dans un café à Séoul : phrases du serveur
            → réponses client → connecteurs naturels → mini-dialogues →
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
