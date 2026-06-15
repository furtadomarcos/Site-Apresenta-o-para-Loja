import { spawn } from "node:child_process";

const env = { ...process.env };

if (process.platform === "win32" && env.PATH && env.Path) {
  delete env.PATH;
}

const vite = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "--host", "0.0.0.0", "--configLoader", "runner"],
  {
    env,
    stdio: "inherit",
  },
);

vite.on("exit", (code) => {
  process.exit(code ?? 0);
});
