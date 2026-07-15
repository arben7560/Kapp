import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { AppMixedText, AppText } from "@/components/app-text";

const BG0 = "#070812";
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
      accessibilityRole={onPress ? "tab" : undefined}
      accessibilityState={onPress ? { selected: active } : undefined}
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
      <AppText
        variant="button"
        tone="strong"
        align="center"
        lineContract="singleLine"
      >
        {label}
      </AppText>
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
      accessibilityRole="button"
      accessibilityLabel={`Écouter ${kr}`}
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
      <AppText
        variant="caption"
        tone="strong"
        align="center"
        lineContract="singleLine"
      >
        🔊 Écouter
      </AppText>
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
          <AppText
            variant="koreanPrimary"
            script="korean"
            tone="strong"
            accessibilityLanguage="ko-KR"
          >
            {kr}
          </AppText>
          <AppText
            variant="bodySecondary"
            tone="muted"
            style={{ marginTop: 4 }}
          >
            {roman}
          </AppText>
          <AppText variant="caption" tone="muted" style={{ marginTop: 4 }}>
            • {level}
          </AppText>
        </View>

        <View style={{ alignItems: "flex-end", gap: 8 }}>
          <AppText
            variant="bodyStrong"
            tone="muted"
            align="end"
            style={{ marginTop: 4 }}
          >
            {fr}
          </AppText>
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
          <AppText
            variant="bodyStrong"
            tone="accent"
            style={{ marginBottom: 8 }}
          >
            {speaker}
          </AppText>
          <AppText
            variant="koreanSecondary"
            script="korean"
            tone="strong"
            accessibilityLanguage="ko-KR"
          >
            {kr}
          </AppText>
          <AppText variant="body" tone="muted" style={{ marginTop: 6 }}>
            {fr}
          </AppText>
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
            <AppText variant="sectionTitle" tone="strong">
              🛍️ Ce que dit souvent le vendeur
            </AppText>
            <AppText variant="body" tone="muted" style={{ marginTop: 8 }}>
              Les phrases fréquentes dans une boutique à Séoul.
            </AppText>
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
            <AppText variant="sectionTitle" tone="strong">
              🙋 Ce que dit souvent le client
            </AppText>
            <AppText variant="body" tone="muted" style={{ marginTop: 8 }}>
              Les phrases les plus utiles pour demander une taille, essayer et
              parler tax free.
            </AppText>
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
            <AppText variant="sectionTitle" tone="strong">
              🔗 Connecteurs naturels
            </AppText>
            <AppText variant="body" tone="muted" style={{ marginTop: 8 }}>
              Pour enchaîner taille, couleur, essayage et tax free plus
              naturellement.
            </AppText>
          </Card>

          <View style={{ height: 14 }} />

          <VocabRow kr="하고" roman="hago" fr="et / avec" />
          <VocabRow kr="이랑 / 랑" roman="irang / rang" fr="et / avec (oral)" />
          <VocabRow kr="그리고" roman="geurigo" fr="et puis / et" />
          <VocabRow kr="그럼" roman="geureom" fr="alors / dans ce cas" />
          <VocabRow kr="혹시" roman="hoksi" fr="par hasard / est-ce que..." />

          <View style={{ height: 10 }} />

          <Card>
            <AppText variant="cardTitle" tone="strong">
              Exemples utiles
            </AppText>

            <AppMixedText
              variant="koreanSecondary"
              tone="muted"
              style={{ marginTop: 10 }}
              segments={[
                { text: "M ", script: "latin" },
                {
                  text: "사이즈하고 검정색 있어요?",
                  script: "korean",
                  accessibilityLanguage: "ko-KR",
                },
              ]}
            />
            <AppText variant="body" tone="muted" style={{ marginTop: 4 }}>
              Vous avez du M et en noir ?
            </AppText>
            <AudioButton kr="M 사이즈하고 검정색 있어요?" />

            <AppText
              variant="koreanSecondary"
              script="korean"
              tone="muted"
              accessibilityLanguage="ko-KR"
              style={{ marginTop: 12 }}
            >
              그럼 이거 입어볼게요.
            </AppText>
            <AppText variant="body" tone="muted" style={{ marginTop: 4 }}>
              Alors je vais essayer celui-ci.
            </AppText>
            <AudioButton kr="그럼 이거 입어볼게요." />

            <AppText
              variant="koreanSecondary"
              script="korean"
              tone="muted"
              accessibilityLanguage="ko-KR"
              style={{ marginTop: 12 }}
            >
              혹시 택스프리 가능해요?
            </AppText>
            <AppText variant="body" tone="muted" style={{ marginTop: 4 }}>
              Est-ce que le tax free est possible ?
            </AppText>
            <AudioButton kr="혹시 택스프리 가능해요?" />
          </Card>
        </>
      );
    }

    if (tab === "dialogues") {
      return (
        <>
          <Card>
            <AppText variant="sectionTitle" tone="strong">
              💬 Mini-dialogues immersifs
            </AppText>
            <AppText variant="body" tone="muted" style={{ marginTop: 8 }}>
              De petites scènes réalistes en boutique.
            </AppText>
          </Card>

          <View style={{ height: 14 }} />

          <Card>
            <AppText variant="bodyStrong" tone="accent">
              Dialogue 1 — taille et essayage
            </AppText>

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
            <AppText variant="bodyStrong" tone="accent">
              Dialogue 2 — tax free
            </AppText>

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
          <AppText variant="sectionTitle" tone="strong">
            🧠 Mini-quiz
          </AppText>
          <AppText variant="body" tone="muted" style={{ marginTop: 8 }}>
            Petites vérifications rapides pour ancrer le contenu.
          </AppText>
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
    <LinearGradient
      colors={[BG0, "#0b0b1d", "#0b0f22"]}
      style={{ flex: 1, overflow: "hidden" }}
    >
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => router.back()}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <AppText variant="link" tone="muted" lineContract="singleLine">
            ← Retour
          </AppText>
        </Pressable>

        <View style={{ height: 14 }} />

        <AppText
          accessibilityRole="header"
          variant="sceneTitle"
          tone="strong"
        >
          Magasin — taille, essayage, détaxe
        </AppText>

        <AppText variant="body" tone="muted" style={{ marginTop: 8 }}>
          Vendeur, client, connecteurs naturels, mini-dialogues et petit quiz
          pour gérer une situation réelle en boutique.
        </AppText>

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
          <AppMixedText
            variant="bodyStrong"
            tone="strong"
            segments={[
              {
                text: "Situations fréquentes : ",
                script: "latin",
                accessibilityLanguage: "fr-FR",
              },
              {
                text: "사이즈 • 피팅룸 • 색 • 택스프리",
                script: "korean",
                accessibilityLanguage: "ko-KR",
              },
            ]}
          />
        </View>

        <View style={{ height: 18 }} />

        <Card>
          <AppText variant="sectionTitle" tone="strong">
            🛍️ Mode immersif
          </AppText>
          <AppText variant="body" tone="muted" style={{ marginTop: 8 }}>
            Apprends comme si tu étais dans une boutique à Séoul : phrases du
            vendeur → réponses client → connecteurs naturels → mini-dialogues →
            mini-quiz.
          </AppText>

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
