import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { RotateCcw, Volume2 } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
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

const API_BASE_URL = "http://192.168.68.54:3001";

type AudioStatus = "idle" | "loading" | "playing" | "ready" | "error";

export default function TeacherIAScreen() {
  const [userMessage, setUserMessage] = useState("");
  const [iaResponse, setIaResponse] = useState("");
  const [currentAudioUri, setCurrentAudioUri] = useState<string | undefined>();
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const playerRef = useRef<AudioPlayer | null>(null);
  const playbackWatcherRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  function stopPlaybackWatcher() {
    if (playbackWatcherRef.current) {
      clearInterval(playbackWatcherRef.current);
      playbackWatcherRef.current = null;
    }
  }

  function releasePlayer() {
    stopPlaybackWatcher();

    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.remove();
      } catch {
        // The native player can already be released during fast navigation.
      }

      playerRef.current = null;
    }
  }

  useEffect(() => {
    setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    }).catch(() => null);

    return releasePlayer;
  }, []);

  function watchPlayback(player: AudioPlayer) {
    stopPlaybackWatcher();

    playbackWatcherRef.current = setInterval(() => {
      const isFinished =
        player.isLoaded &&
        !player.playing &&
        player.duration > 0 &&
        player.currentTime >= player.duration - 0.05;

      if (isFinished) {
        stopPlaybackWatcher();
        setAudioStatus("ready");
      }
    }, 250);
  }

  async function playAudio(uri: string) {
    try {
      setAudioStatus("loading");
      releasePlayer();

      const player = createAudioPlayer(
        { uri },
        {
          downloadFirst: true,
          updateInterval: 250,
        },
      );

      playerRef.current = player;
      player.seekTo(0);
      player.play();
      watchPlayback(player);
      setAudioStatus("playing");
    } catch (error) {
      console.log("Erreur lecture audio :", error);
      releasePlayer();
      setAudioStatus("error");
    }
  }

  async function sendMessage() {
    if (!userMessage.trim()) return;

    try {
      setIsLoading(true);
      setIaResponse("");
      setCurrentAudioUri(undefined);
      setAudioStatus("idle");
      releasePlayer();

      const response = await fetch(`${API_BASE_URL}/api/teacher/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          mode: "cafe",
          userId: "test-user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("Erreur backend :", data);
        setIaResponse("Erreur backend. Regarde la console.");
        setAudioStatus("error");
        return;
      }

      const nextAudioUri = data.audioUrl
        ? `${API_BASE_URL}${data.audioUrl}`
        : undefined;

      console.log("Réponse IA :", data.text);

      setIaResponse(data.text ?? "Aucune réponse reçue.");

      if (nextAudioUri) {
        setCurrentAudioUri(nextAudioUri);
        await playAudio(nextAudioUri);
      } else {
        setAudioStatus("error");
      }
    } catch (error) {
      console.log("Erreur fetch :", error);
      setIaResponse("Impossible de contacter le backend.");
      setAudioStatus("error");
    } finally {
      setIsLoading(false);
    }
  }

  const audioLabel =
    audioStatus === "loading"
      ? "Préparation de l'audio..."
      : audioStatus === "playing"
        ? "Lecture en cours"
        : audioStatus === "error"
          ? "Audio indisponible"
          : currentAudioUri
            ? "Audio prêt"
            : "Aucun audio généré";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Prof IA coréen</Text>

        <Text style={styles.subtitle}>
          Pose une question en français sur le coréen.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Ta question</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex : Comment dire je voudrais un café en coréen ?"
            placeholderTextColor="#888"
            value={userMessage}
            onChangeText={setUserMessage}
            multiline
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Envoyer</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.responseCard}>
          <Text style={styles.label}>Réponse IA</Text>

          {iaResponse ? (
            <Text style={styles.responseText}>{iaResponse}</Text>
          ) : (
            <Text style={styles.emptyText}>
              La réponse du professeur IA apparaîtra ici.
            </Text>
          )}

          {iaResponse ? (
            <View style={styles.audioPanel}>
              <View style={styles.audioInfo}>
                <Volume2 size={18} color="#C7D2FE" />
                <Text style={styles.audioStatusText}>{audioLabel}</Text>
              </View>

              {currentAudioUri ? (
                <TouchableOpacity
                  style={[
                    styles.audioButton,
                    audioStatus === "loading" && styles.audioButtonDisabled,
                  ]}
                  onPress={() => playAudio(currentAudioUri)}
                  disabled={audioStatus === "loading"}
                >
                  {audioStatus === "loading" ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <RotateCcw size={17} color="#FFFFFF" />
                      <Text style={styles.audioButtonText}>Réécouter</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {audioStatus === "error" && iaResponse ? (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={sendMessage}
              disabled={isLoading}
            >
              <Text style={styles.retryButtonText}>
                Regénérer la réponse audio
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
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
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#151B2E",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  responseCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  input: {
    minHeight: 120,
    backgroundColor: "#0B1020",
    color: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },

  button: {
    backgroundColor: "#5B7CFA",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  responseText: {
    color: "#E8ECF8",
    fontSize: 16,
    lineHeight: 24,
  },

  emptyText: {
    color: "#7E8799",
    fontSize: 15,
    lineHeight: 22,
  },

  audioPanel: {
    backgroundColor: "rgba(91,124,250,0.12)",
    borderColor: "rgba(199,210,254,0.22)",
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginTop: 16,
    padding: 12,
  },

  audioInfo: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  audioStatusText: {
    color: "#C7D2FE",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },

  audioButton: {
    alignItems: "center",
    backgroundColor: "#26345F",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  audioButtonDisabled: {
    opacity: 0.65,
  },

  audioButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  retryButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 12,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
