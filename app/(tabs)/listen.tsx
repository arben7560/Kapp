import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { ABSOLUTE_FILL } from "../../constants/layout";

const API_BASE_URL = "https://clicker-squall-moocher.ngrok-free.dev";

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

type RealtimeStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "sending"
  | "error";

type WebViewEvent =
  | { type: "status"; status: RealtimeStatus; message?: string }
  | { type: "error"; message: string }
  | { type: "log"; message: string }
  | { type: "message-sent"; videoId?: string }
  | { type: "stream-ready" };

function escapeForInjectedJavaScript(value: string): string {
  return JSON.stringify(value).replace(/<\/script/gi, "<\\/script");
}

function createAvatarHtml(apiBaseUrl: string) {
  const safeApiBaseUrl = JSON.stringify(apiBaseUrl);

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: transparent;
        color: #c7d2fe;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      #root {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        isolation: isolate;
        background:
          radial-gradient(circle at 50% 18%, rgba(34, 211, 238, 0.18), transparent 34%),
          linear-gradient(180deg, rgba(14, 23, 45, 0.78), rgba(5, 5, 8, 0.92));
      }

      video {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: transparent;
        transform: scale(1.4) translateY(10px);
        transform-origin: center center;
        mix-blend-mode: screen;
        filter: saturate(1.04) contrast(1.06);
        opacity: 0;
        transition: opacity 180ms ease;
      }

      video.is-visible {
        opacity: 1;
      }

      #placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(circle at 50% 20%, rgba(34, 211, 238, 0.20), transparent 36%),
          linear-gradient(180deg, rgba(14, 23, 45, 0.82), rgba(5, 5, 8, 0.94));
        opacity: 1;
        transition: opacity 160ms ease;
      }

      #placeholder.is-hidden {
        opacity: 0;
        pointer-events: none;
      }
    </style>
  </head>
  <body>
    <div id="root">
      <video id="avatarVideo" autoplay playsinline></video>
      <div id="placeholder"></div>
    </div>

    <script>
      const API_BASE_URL = ${safeApiBaseUrl};
      let pc;
      let streamId;
      let didSessionId;
      let isSdpAccepted = false;
      const pendingCandidates = [];
      const video = document.getElementById("avatarVideo");
      const placeholder = document.getElementById("placeholder");

      function post(message) {
        window.ReactNativeWebView?.postMessage(JSON.stringify(message));
      }

      function log(message) {
        post({ type: "log", message });
      }

      function revealVideo() {
        video.classList.add("is-visible");
        placeholder.classList.add("is-hidden");
        window.setTimeout(() => {
          placeholder.style.display = "none";
        }, 180);
      }

      async function readApiResponse(response) {
        const text = await response.text();
        if (!text) return {};
        try {
          return JSON.parse(text);
        } catch {
          return { raw: text };
        }
      }

      function getError(data, fallback) {
        const value = data?.details ?? data?.error ?? data?.raw ?? fallback;
        return typeof value === "string" ? value : JSON.stringify(value, null, 2);
      }

      function getPlainCandidate(candidate) {
        return {
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
        };
      }

      async function sendCandidate(candidate) {
        const response = await fetch(API_BASE_URL + "/api/avatar/realtime/session/" + encodeURIComponent(streamId) + "/ice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...getPlainCandidate(candidate),
            session_id: didSessionId,
          }),
        });
        const data = await readApiResponse(response);
        if (!response.ok) {
          post({ type: "error", message: getError(data, "ice_failed") });
        }
      }

      async function connect() {
        try {
          post({ type: "status", status: "connecting" });
          await closeSession();

          const sessionResponse = await fetch(API_BASE_URL + "/api/avatar/realtime/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          });
          const session = await readApiResponse(sessionResponse);
          log("session response " + sessionResponse.status);

          if (!sessionResponse.ok) {
            throw new Error(getError(session, "session_failed"));
          }

          streamId = session.id;
          didSessionId = session.session_id;
          log("stream " + streamId + " chat " + (session.chat_id || "none"));

          if (!streamId || !didSessionId || !session.offer) {
            throw new Error("La session D-ID ne contient pas les informations WebRTC attendues.");
          }

          pc = new RTCPeerConnection({
            iceServers: session.ice_servers || session.iceServers || [],
          });

          pc.onconnectionstatechange = () => {
            log("pc connection " + pc.connectionState);
          };

          pc.oniceconnectionstatechange = () => {
            log("ice " + pc.iceConnectionState);
          };

          pc.ontrack = (event) => {
            log("track received");
            const [remoteStream] = event.streams || [];
            if (!remoteStream) return;
            video.srcObject = remoteStream;
            video.muted = false;
            video.onloadeddata = revealVideo;
            video.oncanplay = revealVideo;
            video.onplaying = revealVideo;
            video.play()
              .then(() => {
                revealVideo();
                post({ type: "stream-ready" });
              })
              .catch((error) => log("video play " + String(error?.message || error)));
          };

          pc.onicecandidate = (event) => {
            if (!event.candidate) return;
            if (!isSdpAccepted) {
              pendingCandidates.push(event.candidate);
              return;
            }
            sendCandidate(event.candidate).catch((error) => {
              post({ type: "error", message: String(error?.message || error) });
            });
          };

          await pc.setRemoteDescription(session.offer);
          log("remote description ok");
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          log("local description ok");

          const sdpResponse = await fetch(API_BASE_URL + "/api/avatar/realtime/session/" + encodeURIComponent(streamId) + "/sdp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              answer: {
                type: answer.type,
                sdp: answer.sdp,
              },
              session_id: didSessionId,
            }),
          });
          const sdpData = await readApiResponse(sdpResponse);
          log("sdp response " + sdpResponse.status);

          if (!sdpResponse.ok) {
            throw new Error(getError(sdpData, "sdp_failed"));
          }

          isSdpAccepted = true;
          await Promise.all(pendingCandidates.map(sendCandidate));
          pendingCandidates.length = 0;
          post({ type: "status", status: "connected" });
        } catch (error) {
          const message = String(error?.message || error);
          post({ type: "error", message });
        }
      }

      async function sendAgentMessage(message) {
        if (!streamId || !message) return;

        try {
          post({ type: "status", status: "sending" });
          const response = await fetch(API_BASE_URL + "/api/avatar/realtime/session/" + encodeURIComponent(streamId) + "/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message,
              session_id: didSessionId,
            }),
          });
          const data = await readApiResponse(response);
          log("message response " + response.status);

          if (!response.ok) {
            throw new Error(getError(data, "message_failed"));
          }

          post({ type: "message-sent", videoId: data.videoId || data.video_id });
          post({ type: "status", status: "connected" });
        } catch (error) {
          post({ type: "error", message: String(error?.message || error) });
        }
      }

      async function closeSession() {
        isSdpAccepted = false;
        pendingCandidates.length = 0;

        if (pc) {
          pc.close();
          pc = null;
        }

        video.classList.remove("is-visible");
        placeholder.classList.remove("is-hidden");
        placeholder.style.display = "flex";

        if (streamId) {
          await fetch(API_BASE_URL + "/api/avatar/realtime/session/" + encodeURIComponent(streamId), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: didSessionId }),
          }).catch(() => null);
        }

        streamId = undefined;
        didSessionId = undefined;
      }

      window.connectAvatar = connect;
      window.sendAgentMessage = sendAgentMessage;
      window.closeAvatar = closeSession;
      window.addEventListener("beforeunload", closeSession);
      connect();
    </script>
  </body>
</html>`;
}

export default function TeacherIARealtimeScreen() {
  const [message, setMessage] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState<string | undefined>();
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [debugLines, setDebugLines] = useState<string[]>([]);
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const webViewRef = useRef<WebView>(null);
  const avatarHtml = useMemo(() => createAvatarHtml(API_BASE_URL), []);
  const videoHeight = Math.min(screenWidth * 0.9, screenHeight * 0.34);

  function handleWebViewMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data) as WebViewEvent;

      if (data.type === "log") {
        console.log("Avatar WebView:", data.message);
        setDebugLines((lines) => [data.message, ...lines].slice(0, 6));
        return;
      }

      if (data.type === "status") {
        setStatus(data.status);
        setErrorMessage(undefined);
        return;
      }

      if (data.type === "stream-ready") {
        setIsStreamReady(true);
        setStatus("connected");
        setErrorMessage(undefined);
        return;
      }

      if (data.type === "message-sent") {
        setDebugLines((lines) =>
          [`message envoye${data.videoId ? ` (${data.videoId})` : ""}`, ...lines].slice(
            0,
            6,
          ),
        );
        return;
      }

      if (data.type === "error") {
        setStatus("error");
        setErrorMessage(data.message);
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }

  function reconnectAvatar() {
    setStatus("connecting");
    setErrorMessage(undefined);
    setIsStreamReady(false);
    webViewRef.current?.injectJavaScript("window.connectAvatar?.(); true;");
  }

  function sendRealtimeMessage() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setStatus("sending");
    setLastUserMessage(trimmedMessage);
    webViewRef.current?.injectJavaScript(
      `window.sendAgentMessage?.(${escapeForInjectedJavaScript(trimmedMessage)}); true;`,
    );
    setMessage("");
  }

  const steps = ["Ecoute", "Connexion", "Echange", "Reponse"];
  const progressIndex =
    status === "idle" || status === "connecting"
      ? 1
      : status === "sending"
        ? 3
        : status === "connected"
          ? 2
          : 0;

  const statusLabel =
    status === "connecting"
      ? "Connexion WebRTC..."
      : status === "connected"
        ? isStreamReady
          ? "Avatar realtime connecte."
          : "Session connectee, attente du flux video..."
        : status === "sending"
          ? "Message envoye a l'avatar..."
          : status === "error"
            ? "Session realtime indisponible"
            : "Session non connectee";

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
                  <WebView
                    allowsInlineMediaPlayback
                    androidLayerType="hardware"
                    containerStyle={styles.webViewContainer}
                    javaScriptEnabled
                    mediaPlaybackRequiresUserAction={false}
                    onMessage={handleWebViewMessage}
                    originWhitelist={["*"]}
                    ref={webViewRef}
                    source={{ html: avatarHtml, baseUrl: API_BASE_URL }}
                    style={styles.webView}
                  />

                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.62)"]}
                    style={styles.videoOverlay}
                  />

                  {status === "connecting" || status === "idle" ? (
                    <View pointerEvents="none" style={styles.loadingOverlay}>
                      <ActivityIndicator color={TXT} size="large" />
                    </View>
                  ) : null}
                </View>

                <View style={styles.aiCard}>
                  <Text style={styles.aiKr}>{statusLabel}</Text>

                  {errorMessage ? (
                    <Text style={styles.aiFr}>{errorMessage}</Text>
                  ) : (
                    <Text style={styles.aiFr}>
                      Pose une question courte et l&apos;avatar te repond en
                      direct.
                    </Text>
                  )}

                  {debugLines.length ? (
                    <Text style={styles.transcriptHint}>
                      {debugLines.slice(0, 2).join(" | ")}
                    </Text>
                  ) : null}
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

                <View style={styles.inputCard}>
                  <TextInput
                    multiline
                    onChangeText={setMessage}
                    placeholder="Ex : Comment dire je voudrais un cafe en coreen ?"
                    placeholderTextColor={SOFT}
                    style={styles.input}
                    value={message}
                  />

                  <View style={styles.actions}>
                    <Pressable
                      disabled={status !== "connected"}
                      onPress={sendRealtimeMessage}
                      style={({ pressed }) => [
                        styles.primaryAction,
                        (pressed || status !== "connected") &&
                          styles.buttonDimmed,
                      ]}
                    >
                      <LinearGradient
                        colors={[CYAN, "#56CCF2"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.primaryActionInner}
                      >
                        {status === "sending" ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={styles.primaryActionText}>
                            Envoyer a l&apos;avatar
                          </Text>
                        )}
                      </LinearGradient>
                    </Pressable>

                    <Pressable
                      disabled={status === "connecting"}
                      onPress={reconnectAvatar}
                      style={({ pressed }) => [
                        styles.secondaryAction,
                        (pressed || status === "connecting") &&
                          styles.buttonDimmed,
                      ]}
                    >
                      <Text style={styles.secondaryActionText}>
                        Reconnecter
                      </Text>
                    </Pressable>
                  </View>
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

  webViewContainer: {
    backgroundColor: "transparent",
  },

  webView: {
    backgroundColor: "transparent",
    flex: 1,
  },

  videoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
  },

  loadingOverlay: {
    ...ABSOLUTE_FILL,
    alignItems: "center",
    backgroundColor: "rgba(5,5,8,0.44)",
    justifyContent: "center",
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

  transcriptHint: {
    color: SOFT,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    fontFamily: fonts.medium,
    marginTop: 8,
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

  actions: {
    gap: 10,
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

  secondaryAction: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryActionText: {
    color: TXT,
    fontSize: 15,
    fontFamily: fonts.bold,
  },

  buttonDimmed: {
    opacity: 0.62,
  },
});
