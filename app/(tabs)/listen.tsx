import { useMemo, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ABSOLUTE_FILL } from "../../constants/layout";

const listenBackground = require("../../assets/images/avatarIA.png");

const BG_DEEP = "#050508";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.64)";
const SOFT = "rgba(255,255,255,0.48)";
const LINE = "rgba(255,255,255,0.08)";

const CYAN = "#22D3EE";

const fonts = {
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  medium: "Outfit_500Medium",
  kr: "NotoSansKR_700Bold",
};

type ChatLine = {
  id: number;
  role: "user" | "teacher";
  text: string;
};

function createLocalAnswer(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("cafe") || normalized.includes("café")) {
    return "En coreen, tu peux dire : 커피 한 잔 주세요. Cela veut dire : un cafe, s'il vous plait.";
  }

  if (normalized.includes("bonjour") || normalized.includes("salut")) {
    return "Tu peux dire 안녕하세요. C'est la salutation polie la plus utile au quotidien.";
  }

  if (normalized.includes("merci")) {
    return "Merci se dit 감사합니다 dans une situation polie. Plus naturel entre proches : 고마워요.";
  }

  if (normalized.includes("restaurant")) {
    return "Au restaurant, une phrase tres pratique est 이거 주세요 : je voudrais ceci, s'il vous plait.";
  }

  return "Bonne question. Pour le moment, le prof IA fonctionne en local : essaie une question sur bonjour, merci, cafe ou restaurant.";
}

export default function TeacherIARealtimeScreen() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ChatLine[]>([
    {
      id: 1,
      role: "teacher",
      text: "Le prof IA est maintenant en mode frontend local. Pose une question courte.",
    },
  ]);
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const videoHeight = Math.min(screenWidth * 0.9, screenHeight * 0.34);

  const lastUserMessage = useMemo(
    () => [...history].reverse().find((line) => line.role === "user")?.text,
    [history],
  );

  function sendLocalMessage() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const now = Date.now();
    setHistory((lines) => [
      ...lines,
      { id: now, role: "user", text: trimmedMessage },
      { id: now + 1, role: "teacher", text: createLocalAnswer(trimmedMessage) },
    ]);
    setMessage("");
  }

  const steps = ["Ecoute", "Local", "Echange", "Reponse"];
  const progressIndex = history.length > 1 ? 3 : 1;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboard}
    >
      <ImageBackground
        source={listenBackground}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={0}
      >
        <View pointerEvents="none" style={styles.backgroundDarkOverlay} />

        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <View
            style={[
              styles.header,
              { paddingTop: Math.max(6, insets.top * 0.15) },
            ]}
          >
            <View style={{ width: 42 }} />

            <View style={styles.modeBadge}>
              <Text style={styles.modeTxt}>PROF IA</Text>
            </View>

            <View style={{ width: 42 }} />
          </View>

          <View style={styles.body}>
            <View style={styles.topFixedSection}>
              <View style={styles.topInner}>
                <View style={styles.stepsContainer}>
                  {steps.map((step, index) => {
                    const active = index === progressIndex;
                    const done = index <= progressIndex;

                    return (
                      <View key={step} style={styles.stepWrapper}>
                        <View
                          style={[
                            styles.stepDot,
                            done && {
                              backgroundColor: CYAN,
                              opacity: active ? 1 : 0.7,
                            },
                          ]}
                        />

                        <Text
                          style={[
                            styles.stepLabel,
                            active && {
                              color: TXT,
                              fontFamily: fonts.bold,
                            },
                          ]}
                        >
                          {step}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View
                  style={[
                    styles.videoContainer,
                    {
                      height: videoHeight,
                      borderColor: "rgba(34,211,238,0.40)",
                    },
                  ]}
                >
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>AI</Text>
                  </View>

                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.62)"]}
                    style={styles.videoOverlay}
                  />
                </View>

                <View style={styles.aiCard}>
                  <Text style={styles.aiKr}>Mode local active</Text>

                  <Text style={styles.aiFr}>
                    Plus aucun appel serveur : les reponses sont generees dans
                    l&apos;application.
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.interactionScroll,
                { paddingBottom: Math.max(22, insets.bottom + 8) },
              ]}
            >
              <View style={styles.interactionSection}>
                <Text style={styles.sectionTitle}>Ton message</Text>

                {lastUserMessage ? (
                  <View style={styles.userBubble}>
                    <Text style={styles.choiceKr}>{lastUserMessage}</Text>
                    <Text style={styles.choiceFr}>Dernier message envoye</Text>
                  </View>
                ) : null}

                <View style={styles.historyList}>
                  {history.slice(-4).map((line) => (
                    <View
                      key={line.id}
                      style={[
                        styles.messageBubble,
                        line.role === "user" && styles.messageBubbleUser,
                      ]}
                    >
                      <Text style={styles.choiceKr}>{line.text}</Text>
                      <Text style={styles.choiceFr}>
                        {line.role === "user" ? "Toi" : "Prof IA"}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.inputCard}>
                  <TextInput
                    multiline
                    onChangeText={setMessage}
                    placeholder="Ex : Comment dire je voudrais un cafe en coreen ?"
                    placeholderTextColor={SOFT}
                    style={styles.input}
                    value={message}
                  />

                  <Pressable
                    disabled={!message.trim()}
                    onPress={sendLocalMessage}
                    style={({ pressed }) => [
                      styles.primaryAction,
                      (pressed || !message.trim()) && styles.buttonDimmed,
                    ]}
                  >
                    <LinearGradient
                      colors={[CYAN, "#56CCF2"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryActionInner}
                    >
                      <Text style={styles.primaryActionText}>Envoyer</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },

  backgroundImage: {
    flex: 1,
    backgroundColor: BG_DEEP,
  },

  backgroundDarkOverlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(5,5,8,0.64)",
  },

  body: {
    flex: 1,
  },

  topFixedSection: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },

  topInner: {
    flexShrink: 0,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  modeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: CYAN,
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  modeTxt: {
    color: CYAN,
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 1.4,
  },

  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
    marginTop: 6,
  },

  stepWrapper: {
    alignItems: "center",
    flex: 1,
  },

  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginBottom: 8,
  },

  stepLabel: {
    color: MUTED,
    fontSize: 12,
    fontFamily: fonts.medium,
  },

  videoContainer: {
    width: "88%",
    alignSelf: "center",
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "rgba(14,23,45,0.78)",
    borderWidth: 1,
  },

  avatarPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,5,8,0.34)",
  },

  avatarText: {
    color: TXT,
    fontSize: 52,
    fontFamily: fonts.black,
  },

  videoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
  },

  aiCard: {
    marginTop: -20,
    marginHorizontal: 18,
    backgroundColor: "rgba(10,13,26,0.96)",
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    shadowColor: "#000",
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },

  aiKr: {
    color: TXT,
    fontSize: 19,
    lineHeight: 29,
    fontFamily: fonts.kr,
    textAlign: "center",
    marginBottom: 10,
  },

  aiFr: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    fontStyle: "italic",
  },

  interactionScroll: {
    paddingHorizontal: 20,
    paddingTop: 26,
  },

  interactionSection: {
    minHeight: 220,
  },

  sectionTitle: {
    color: TXT,
    fontSize: 18,
    fontFamily: fonts.black,
    marginBottom: 14,
    marginLeft: 4,
  },

  userBubble: {
    backgroundColor: "rgba(5,5,8,0.74)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 5,
    marginBottom: 12,
  },

  historyList: {
    gap: 10,
    marginBottom: 12,
  },

  messageBubble: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: LINE,
  },

  messageBubbleUser: {
    backgroundColor: "rgba(34,211,238,0.08)",
    borderColor: "rgba(34,211,238,0.22)",
  },

  choiceKr: {
    color: TXT,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.bold,
    marginBottom: 6,
  },

  choiceFr: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
  },

  inputCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 14,
    overflow: "hidden",
  },

  input: {
    color: TXT,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.medium,
    minHeight: 112,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 12,
    textAlignVertical: "top",
  },

  primaryAction: {
    borderRadius: 18,
    overflow: "hidden",
  },

  primaryActionInner: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryActionText: {
    color: "white",
    fontSize: 14,
    fontFamily: fonts.bold,
  },

  buttonDimmed: {
    opacity: 0.62,
  },
});
