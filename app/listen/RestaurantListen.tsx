import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RestaurantListenScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#060816" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900" }}>
          Ecoute restaurant
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.68)",
            fontSize: 16,
            lineHeight: 24,
            marginTop: 12,
          }}
        >
          Cette scene d&apos;ecoute arrive bientot.
        </Text>
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
          <Text style={{ color: "#fff", fontWeight: "800" }}>Retour</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
