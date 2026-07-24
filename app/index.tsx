import { Redirect } from "expo-router";

import "../components/app-text";

export default function IndexGate() {
  return <Redirect href="/onboarding" />;
}
