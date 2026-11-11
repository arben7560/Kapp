/* global __dirname */
const { spawn } = require("node:child_process");
const path = require("node:path");
const { build } = require("../eas.json");

// A development client receives JS from local Metro, not the EAS build's env.
// Apply the very same profile to Metro without changing .env or printing keys.
const child = spawn(process.execPath, [
  require.resolve("expo/bin/cli"),
  "start", "--dev-client", "--port", "8082", "--clear",
  ...process.argv.slice(2),
], {
  cwd: path.resolve(__dirname, ".."),
  stdio: "inherit",
  env: { ...process.env, ...build.iapTest.env, EAS_BUILD_PROFILE: "iapTest" },
});
child.on("error", () => {
  console.error("Unable to start the iapTest development server.");
  process.exitCode = 1;
});
child.on("exit", (code) => { process.exitCode = code ?? 1; });
