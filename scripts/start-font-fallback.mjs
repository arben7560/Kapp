import { spawn } from "node:child_process";

const executable = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(executable, ["expo", "start", "--web"], {
  env: {
    ...process.env,
    EXPO_PUBLIC_FORCE_FONT_FALLBACK: "1",
  },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
