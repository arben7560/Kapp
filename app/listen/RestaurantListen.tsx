import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../../components/app-text";
import { AppBackButton } from "../../components/ui/app-back-button";

export default function RestaurantListenScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#060816" }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 16,
        }}
      >
        <AppBackButton />
        <View style={{ flex: 1, justifyContent: "center" }}>
        <AppText accessibilityRole="header" variant="screenTitle" style={{ color: "#fff" }}>
          Ecoute restaurant
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
        </View>
      </View>
    </SafeAreaView>
  );
}
