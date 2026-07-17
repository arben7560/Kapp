import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../../components/app-text";

export default function MetroListenScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#060816" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <AppText accessibilityRole="header" variant="screenTitle" style={{ color: "#fff" }}>
          Ecoute metro
        </AppText>
        <AppText
          variant="body"
          tone="muted"
          style={{
            color: "rgba(255,255,255,0.68)",
            marginTop: 12,
          }}
        >
          Cette scene d&apos;ecoute arrive bientot.
        </AppText>
        <Pressable
          onPress={() => router.back()}
          style={{
            alignSelf: "flex-start",
            marginTop: 24,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.12)",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <AppText variant="button" style={{ color: "#fff" }}>Retour</AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
