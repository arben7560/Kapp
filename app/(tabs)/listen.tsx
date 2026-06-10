import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

const API_BASE_URL = "https://clicker-squall-moocher.ngrok-free.dev";

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
        background: #050816;
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
      }

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #050816;
      }

      #placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #050816;
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
            video.play().catch((error) => log("video play " + String(error?.message || error)));
            placeholder.style.display = "none";
            post({ type: "stream-ready" });
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
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [debugLines, setDebugLines] = useState<string[]>([]);
  const webViewRef = useRef<WebView>(null);
  const avatarHtml = useMemo(() => createAvatarHtml(API_BASE_URL), []);

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
    if (!message.trim()) return;

    setStatus("sending");
    webViewRef.current?.injectJavaScript(
      `window.sendAgentMessage?.(${escapeForInjectedJavaScript(message.trim())}); true;`,
    );
    setMessage("");
  }

  const statusLabel =
    status === "connecting"
      ? "Connexion WebRTC..."
      : status === "connected"
        ? isStreamReady
          ? "Avatar realtime connecte"
          : "Session connectee, attente du flux video..."
        : status === "sending"
          ? "Message envoye a l'avatar..."
          : status === "error"
            ? "Session realtime indisponible"
            : "Session non connectee";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Prof IA realtime</Text>

        <Text style={styles.subtitle}>
          Test WebRTC D-ID Agents via WebView pour compatibilite H264 Android.
        </Text>

        <View style={styles.avatarFrame}>
          <WebView
            allowsInlineMediaPlayback
            javaScriptEnabled
            mediaPlaybackRequiresUserAction={false}
            onMessage={handleWebViewMessage}
            originWhitelist={["*"]}
            ref={webViewRef}
            source={{ html: avatarHtml, baseUrl: API_BASE_URL }}
            style={styles.webView}
          />

          {status === "connecting" || status === "idle" ? (
            <View pointerEvents="none" style={styles.loadingOverlay}>
              <ActivityIndicator color="#C7D2FE" size="large" />
            </View>
          ) : null}
        </View>

        <View style={styles.statusPanel}>
          <Text style={styles.statusText}>{statusLabel}</Text>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {debugLines.length ? (
            <Text style={styles.debugText}>{debugLines.join("\n")}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Message</Text>

          <TextInput
            multiline
            onChangeText={setMessage}
            placeholder="Ex : Comment dire je voudrais un cafe en coreen ?"
            placeholderTextColor="#81889B"
            style={styles.input}
            value={message}
          />

          <TouchableOpacity
            disabled={status === "connecting"}
            onPress={reconnectAvatar}
            style={[
              styles.button,
              status === "connecting" && styles.buttonDisabled,
            ]}
          >
            {status === "connecting" ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Reconnecter avatar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={status !== "connected" || status === "sending"}
            onPress={sendRealtimeMessage}
            style={[
              styles.secondaryButton,
              status !== "connected" && styles.buttonDisabled,
            ]}
          >
            {status === "sending" ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Envoyer a avatar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0B1020",
    flex: 1,
  },

  content: {
    padding: 20,
    paddingTop: 70,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },

  subtitle: {
    color: "#AAB0C0",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },

  avatarFrame: {
    aspectRatio: 9 / 16,
    backgroundColor: "#050816",
    borderColor: "rgba(199,210,254,0.16)",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
    width: "100%",
  },

  webView: {
    backgroundColor: "#050816",
    flex: 1,
  },

  loadingOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(5,8,22,0.56)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },

  statusPanel: {
    backgroundColor: "rgba(91,124,250,0.12)",
    borderColor: "rgba(199,210,254,0.22)",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
  },

  statusText: {
    color: "#C7D2FE",
    fontSize: 14,
    fontWeight: "800",
  },

  errorText: {
    color: "#FDBA74",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },

  debugText: {
    color: "#AAB0C0",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },

  card: {
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },

  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#0B1020",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 14,
    minHeight: 110,
    padding: 14,
    textAlignVertical: "top",
  },

  button: {
    alignItems: "center",
    backgroundColor: "#5B7CFA",
    borderRadius: 14,
    marginBottom: 10,
    paddingVertical: 14,
  },

  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#26345F",
    borderRadius: 14,
    paddingVertical: 14,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
