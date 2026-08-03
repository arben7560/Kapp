import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../app-text";
import { AppBackButton } from "../ui/app-back-button";

type ComingSoonLessonProps = {
  title: string;
};

export function ComingSoonLesson({ title }: ComingSoonLessonProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050508" }}>
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
          {title}
        </AppText>
        <AppText
          variant="body"
          tone="muted"
          style={{
            color: "rgba(255,255,255,0.68)",
            marginTop: 12,
          }}
        >
          Cette lecon arrive bientot.
        </AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}
