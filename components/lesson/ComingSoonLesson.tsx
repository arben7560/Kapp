import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ComingSoonLessonProps = {
  title: string;
};

export function ComingSoonLesson({ title }: ComingSoonLessonProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050508" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900" }}>
          {title}
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.68)",
            fontSize: 16,
            lineHeight: 24,
            marginTop: 12,
          }}
        >
          Cette lecon arrive bientot.
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
