/* global __dirname */
const { spawn } = require("node:child_process");
const path = require("node:path");
const { build } = require("../eas.json");
const { loadProjectEnv } = require("@expo/env");

const projectRoot = path.resolve(__dirname, "..");
Object.assign(process.env, build.iapTest.env, { EAS_BUILD_PROFILE: "iapTest" });

// Resolve dotenv before Expo evaluates app.config.js, including on CLI versions
// that evaluate config early. Keep profile flags authoritative over .env.
loadProjectEnv(projectRoot, { mode: "development", silent: true, force: true });
const testKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY?.trim();
const reason = process.env.EXPO_NO_DOTENV === "1"
  ? "dotenv-disabled"
  : process.env.EXPO_NO_CLIENT_ENV_VARS === "1"
    ? "client-env-inlining-disabled"
    : !testKey ? "test-key-missing"
      : !testKey.startsWith("test_") ? "test-key-prefix-mismatch"
        : "ready";
console.info(`[RevenueCat Metro] ${JSON.stringify({
  profile: "iapTest", store: "test", testKeyPresent: !!testKey, reason,
})}`);
if (reason !== "ready") {
  process.exit(1);
}

// A safe preflight: do not print expo config --json, which includes the key.
const { exp } = require("@expo/config").getConfig(projectRoot);
if (exp.extra?.revenueCatTestStore?.apiKey !== testKey) {
  console.error("[RevenueCat Metro] test-key-not-delivered-to-manifest");
  process.exit(1);
}
console.info("[RevenueCat Metro] manifest-key-present; native-IAP=1; Premium-bypasses=0");
if (process.argv.includes("--check")) process.exit(0);

// A development client receives JS from local Metro, not the EAS build's env.
// Apply the very same profile to Metro without changing .env or printing keys.
const child = spawn(process.execPath, [
  require.resolve("expo/bin/cli"),
  "start", "--dev-client", "--port", "8082", "--clear",
  // Expo's Android scheme discovery expects singleTask, whereas the existing
  // RevenueCat plugin uses singleTop. This scheme is already in the APK.
  "--scheme", require("../app.json").expo.scheme,
  ...process.argv.slice(2),
], {
  cwd: projectRoot,
  stdio: "inherit",
  env: process.env,
});
child.on("error", () => {
  console.error("Unable to start the iapTest development server.");
  process.exitCode = 1;
});
child.on("exit", (code) => { process.exitCode = code ?? 1; });
