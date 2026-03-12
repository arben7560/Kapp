// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Intro (landing) */}
      <Stack.Screen name="index" />

      {/* Tabs app */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
