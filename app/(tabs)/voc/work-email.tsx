import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.65)";
const LINE = "rgba(255,255,255,0.12)";
const CARD = "rgba(255,255,255,0.06)";
const CYAN = "rgba(34,211,238,0.50)";
const CYAN_BG = "rgba(34,211,238,0.12)";
const PINK = "rgba(255,99,132,0.40)";
const PINK_BG = "rgba(255,99,132,0.10)";
const PURPLE = "rgba(124,58,237,0.50)";
const PURPLE_BG = "rgba(124,58,237,0.12)";

function speakKR(text: string) {
  Speech.stop();
  Speech.speak(text, {
    language: "ko-KR",
    rate: 0.92,
    pitch: 1,
  });
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

function Pill({
  label,
  accent = "cyan",
}: {
  label: string;
  accent?: "cyan" | "pink" | "purple";
}) {
  const borderColor =
    accent === "pink" ? PINK : accent === "purple" ? PURPLE : CYAN;
  const backgroundColor =
    accent === "pink" ? PINK_BG : accent === "purple" ? PURPLE_BG : CYAN_BG;

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor,
        backgroundColor,
      }}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

function AudioButton({ text }: { text: string }) {
  return (
    <Pressable
      onPress={() => speakKR(text)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
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

function PhraseRow({
  kr,
  fr,
  note,
}: {
  kr: string;
  fr: string;
  note?: string;
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
              color: TXT,
              fontSize: 20,
              fontWeight: "900",
              lineHeight: 26,
            }}
          >
            {kr}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 8 }}>
            {fr}
          </Text>
          {!!note && (
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 19 }}>
              {note}
            </Text>
          )}
        </View>
        <AudioButton text={kr} />
      </View>
    </View>
  );
}

export default function WorkEmailPage() {
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

        <Text style={{ color: TXT, fontSize: 31, fontWeight: "900" }}>
          Travail & emails courts
        </Text>

        <Text style={{ color: MUTED, marginTop: 8, lineHeight: 22 }}>
          Formules courtes et utiles pour le travail, les messages
          professionnels et les réponses simples.
        </Text>

        <View style={{ height: 14 }} />

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <Pill label="Premium" accent="pink" />
          <Pill label="Pro simple" />
          <Pill label="Messages utiles" accent="purple" />
        </View>

        <View style={{ height: 18 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 21, fontWeight: "900" }}>
            💎 Contenu Premium
          </Text>
          <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
            Ce module est pensé pour répondre vite, poliment et proprement dans
            un contexte de travail ou de message professionnel court.
          </Text>
        </Card>

        <View style={{ height: 16 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
            📩 Réponses courtes utiles
          </Text>
          <View style={{ height: 12 }} />

          <PhraseRow
            kr="확인했습니다."
            fr="J’ai bien vérifié / confirmé."
            note="Ultra utile pour répondre sobrement à un message."
          />
          <PhraseRow
            kr="알겠습니다."
            fr="D’accord / j’ai compris."
            note="Très fréquent dans un contexte pro."
          />
          <PhraseRow
            kr="감사합니다."
            fr="Merci."
            note="Base incontournable, très neutre et professionnelle."
          />
          <PhraseRow
            kr="잘 부탁드립니다."
            fr="Je compte sur votre bienveillance / merci d’avance."
            note="Formule très coréenne, utile en message ou mail."
          />
        </Card>

        <View style={{ height: 16 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
            🗓️ Disponibilité / organisation
          </Text>
          <View style={{ height: 12 }} />

          <PhraseRow
            kr="가능한 시간 알려 주세요."
            fr="Merci de m’indiquer vos disponibilités."
          />
          <PhraseRow kr="내일 가능합니다." fr="C’est possible demain." />
          <PhraseRow
            kr="조금 늦을 것 같습니다."
            fr="Je risque d’être un peu en retard."
          />
          <PhraseRow
            kr="일정 확인 후 다시 연락드리겠습니다."
            fr="Je vous recontacte après vérification de mon planning."
          />
        </Card>

        <View style={{ height: 16 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
            ✉️ Mini formules d’email
          </Text>
          <View style={{ height: 12 }} />

          <PhraseRow kr="안녕하세요." fr="Bonjour." />
          <PhraseRow
            kr="문의드립니다."
            fr="Je vous contacte pour une demande / une question."
          />
          <PhraseRow kr="확인 부탁드립니다." fr="Merci de vérifier." />
          <PhraseRow kr="답변 기다리겠습니다." fr="J’attends votre réponse." />
          <PhraseRow
            kr="감사합니다. 좋은 하루 되세요."
            fr="Merci. Passez une bonne journée."
          />
        </Card>

        <View style={{ height: 16 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
            💬 Exemples courts
          </Text>
          <View style={{ height: 12 }} />

          <PhraseRow
            kr="안녕하세요. 확인했습니다. 감사합니다."
            fr="Bonjour. J’ai bien vérifié. Merci."
          />
          <PhraseRow
            kr="내일 가능합니다. 잘 부탁드립니다."
            fr="C’est possible demain. Merci d’avance."
          />
          <PhraseRow
            kr="일정 확인 후 다시 연락드리겠습니다."
            fr="Je vous recontacte après vérification du planning."
          />
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}
