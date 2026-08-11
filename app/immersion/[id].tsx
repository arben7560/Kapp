import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../components/app-text";
import { AppBackButton } from "../../components/ui/app-back-button";
import { getScene, Step } from "../../data/immersionScenes";
import { resolveAutomaticScenePath } from "../../lib/immersionSceneFlow";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.65)";
const LINE = "rgba(255,255,255,0.12)";
const CARD = "rgba(255,255,255,0.06)";

type RenderLine = {
  kind: "line";
  speaker: "narrator" | "npc" | "user";
  kr: string;
  fr: string;
};

type RenderEnd = {
  kind: "end";
  summaryKr: string;
  summaryFr: string;
  keyPhrases: { kr: string; fr: string }[];
};
type RenderItem = RenderLine | RenderEnd;

function toRenderItem(step: Exclude<Step, { type: "choice" }>): RenderItem {
  if (step.type === "line") {
    return {
      kind: "line",
      speaker: step.speaker,
      kr: step.kr,
      fr: step.fr,
    };
  }

  return {
    kind: "end",
    summaryKr: step.summaryKr,
    summaryFr: step.summaryFr,
    keyPhrases: step.keyPhrases,
  };
}

function Bubble({
  side,
  kr,
  fr,
}: {
  side: "left" | "right" | "center";
  kr: string;
  fr: string;
}) {
  const align =
    side === "left" ? "flex-start" : side === "right" ? "flex-end" : "center";
  const bg =
    side === "right" ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.06)";
  const border =
    side === "right" ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.10)";

  return (
    <View style={{ alignSelf: align, maxWidth: "92%", marginBottom: 10 }}>
      <View
        style={{
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1,
          borderRadius: 18,
          padding: 12,
        }}
      >
        <AppText variant="koreanSecondary" script="korean"
          style={{
            color: TXT,
          }}
        >
          {kr}
        </AppText>
        <AppText variant="bodySecondary" style={{ color: MUTED, marginTop: 6}}>{fr}</AppText>
      </View>
    </View>
  );
}

function ChoiceButton({
  kr,
  fr,
  tone,
  onPress,
}: {
  kr: string;
  fr: string;
  tone?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
        backgroundColor: CARD,
        borderColor: LINE,
        borderWidth: 1,
        borderRadius: 18,
        padding: 12,
        marginBottom: 10,
      })}
    >
      <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <AppText variant="koreanSecondary" script="korean"
            style={{
              color: TXT,
            }}
          >
            {kr}
          </AppText>
          <AppText variant="bodySecondary" style={{ color: MUTED, marginTop: 6}}>
            {fr}
          </AppText>
        </View>

        {!!tone && (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(124,58,237,0.40)",
              backgroundColor: "rgba(124,58,237,0.12)",
            }}
          >
            <AppText variant="label" style={{ color: TXT}}>
              {tone}
            </AppText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function ImmersionScene() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scene = useMemo(
    () => (typeof id === "string" ? getScene(id) : null),
    [id],
  );

  const stepById = useMemo(() => {
    const m = new Map<string, Step>();
    scene?.steps.forEach((st) => m.set(st.id, st));
    return m;
  }, [scene]);

  const [cursor, setCursor] = useState<string>(() =>
    scene ? scene.start : "",
  );
  const [items, setItems] = useState<RenderItem[]>(() => []);
  const interactionLockRef = React.useRef(false);
  const exitLockRef = React.useRef(false);

  const current = cursor ? stepById.get(cursor) : undefined;

  React.useEffect(() => {
    interactionLockRef.current = false;
    exitLockRef.current = false;

    if (!scene) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- A route id change must clear the previous scene atomically.
      setCursor("");
      setItems([]);
      return;
    }

    const initialPath = resolveAutomaticScenePath(scene, scene.start);
    setCursor(initialPath.cursor);
    setItems(
      initialPath.transcriptSteps
        .filter((step) => step.type !== "choice")
        .map((step) => toRenderItem(step)),
    );
  }, [scene]);

  React.useEffect(() => {
    interactionLockRef.current = false;
    exitLockRef.current = false;
  }, [cursor]);

  function restart() {
    if (!scene) return;
    const initialPath = resolveAutomaticScenePath(scene, scene.start);
    interactionLockRef.current = false;
    setItems(
      initialPath.transcriptSteps
        .filter((step) => step.type !== "choice")
        .map((step) => toRenderItem(step)),
    );
    setCursor(initialPath.cursor);
  }

  function advanceFromLine(lineId: string) {
    if (!scene || interactionLockRef.current) return;
    const line = stepById.get(lineId);
    if (!line || line.type !== "line") return;

    const lineIndex = scene.steps.findIndex((step) => step.id === lineId);
    const nextStepId = line.goTo ?? scene.steps[lineIndex + 1]?.id;
    if (!nextStepId) return;

    interactionLockRef.current = true;
    const path = resolveAutomaticScenePath(scene, nextStepId);
    setItems((previous) => [
      ...previous,
      ...path.transcriptSteps
        .filter((step) => step.type !== "choice")
        .map((step) => toRenderItem(step)),
    ]);
    setCursor(path.cursor);
  }

  const handleExit = React.useCallback(() => {
    if (exitLockRef.current) return;
    exitLockRef.current = true;
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/immersion");
  }, []);

  if (!scene) {
    return (
      <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <AppBackButton style={{ marginBottom: 16 }} />
          <AppText variant="sectionTitle" style={{ color: TXT}}>
            Scène introuvable
          </AppText>
          <AppText variant="button" style={{ color: MUTED, marginTop: 8 }}>
            Retourne à Immersion.
          </AppText>
          <View style={{ height: 12 }} />
          <Pressable
            onPress={handleExit}
            style={{
              paddingVertical: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: CARD,
              alignItems: "center",
            }}
          >
            <AppText variant="button" style={{ color: TXT}}>Retour à l’immersion</AppText>
          </Pressable>
        </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <AppBackButton style={{ marginBottom: 16 }} />
        <AppText variant="screenTitle" style={{ color: TXT}}>
          {scene.title}
        </AppText>
        <AppText variant="bodySecondary" style={{ color: MUTED, marginTop: 6 }}>{scene.vibe}</AppText>

        <View style={{ height: 14 }} />

        {/* Transcript */}
        {items.map((it, idx) => {
          if (it.kind === "line") {
            const side =
              it.speaker === "npc"
                ? "left"
                : it.speaker === "user"
                  ? "right"
                  : "center";
            return <Bubble key={idx} side={side} kr={it.kr} fr={it.fr} />;
          }

          return (
            <View
              key={idx}
              style={{
                marginTop: 6,
                padding: 14,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: "rgba(34,211,238,0.35)",
                backgroundColor: "rgba(34,211,238,0.10)",
              }}
            >
              <AppText variant="koreanSecondary" script="korean" style={{ color: TXT}}>
                {it.summaryKr}
              </AppText>
              <AppText variant="bodySecondary" style={{ color: MUTED, marginTop: 6 }}>{it.summaryFr}</AppText>

              <View style={{ height: 10 }} />
              <AppText variant="sectionTitle" style={{ color: TXT}}>
                Phrases clés
              </AppText>
              <View style={{ height: 8 }} />

              {it.keyPhrases.map((p, j) => (
                <View key={j} style={{ marginBottom: 8 }}>
                  <AppText variant="koreanSecondary" script="korean" style={{ color: TXT}}>{p.kr}</AppText>
                  <AppText variant="bodySecondary" style={{ color: MUTED }}>{p.fr}</AppText>
                </View>
              ))}

              <View style={{ height: 12 }} />
              <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                <Pressable
                  onPress={restart}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: LINE,
                    backgroundColor: CARD,
                  }}
                >
                  <AppText variant="button" style={{ color: TXT}}>Rejouer la scène</AppText>
                </Pressable>

                <Pressable
                  onPress={handleExit}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: LINE,
                    backgroundColor: CARD,
                  }}
                >
                  <AppText variant="button" style={{ color: TXT}}>Retour à l’immersion</AppText>
                </Pressable>
              </View>
            </View>
          );
        })}

        {/* Interaction area */}
        <View style={{ height: 10 }} />

        {current?.type === "choice" && (
          <View
            style={{
              marginTop: 10,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderColor: LINE,
              borderWidth: 1,
              borderRadius: 22,
              padding: 14,
            }}
          >
            <AppText variant="koreanSecondary" script="korean" style={{ color: TXT}}>
              {current.promptKr}
            </AppText>
            <AppText variant="bodySecondary" style={{ color: MUTED, marginTop: 6 }}>
              {current.promptFr}
            </AppText>

            <View style={{ height: 12 }} />

            {current.options.map((opt) => (
              <ChoiceButton
                key={opt.id}
                kr={opt.kr}
                fr={opt.fr}
                tone={opt.tone}
                onPress={() => {
                  if (interactionLockRef.current) return;
                  const next = stepById.get(opt.goTo);
                  if (!next) return;

                  interactionLockRef.current = true;
                  const path = resolveAutomaticScenePath(scene, next.id);
                  setItems((previous) => [
                    ...previous,
                    {
                      kind: "line",
                      speaker: "user",
                      kr: opt.kr,
                      fr: opt.fr,
                    },
                    ...path.transcriptSteps
                      .filter((step) => step.type !== "choice")
                      .map((step) => toRenderItem(step)),
                  ]);
                  setCursor(path.cursor);
                }}
              />
            ))}
          </View>
        )}

        {current?.type === "line" && (
          <Pressable
            onPress={() => advanceFromLine(current.id)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.92 : 1,
              marginTop: 12,
              paddingVertical: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: CARD,
              alignItems: "center",
            })}
          >
            <AppText variant="button" style={{ color: TXT}}>Continuer</AppText>
          </Pressable>
        )}
      </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
