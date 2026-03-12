import { Stack } from "expo-router";
import React from "react";
import { StoreProvider } from "../_store";

export default function RootLayout() {
  return (
    <StoreProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </StoreProvider>
  );
}
