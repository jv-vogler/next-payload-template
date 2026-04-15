import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const user = process.env.USER ?? "dev";
const branch = `dev-${user}`;

const list = spawnSync("neonctl", ["branches", "list", "--output", "json"], { encoding: "utf8" });
if (list.status !== 0) {
  console.error("neonctl not available; install from https://neon.tech/docs/reference/cli");
  process.exit(1);
}

const exists = JSON.parse(list.stdout).some((b: { name: string }) => b.name === branch);
if (!exists) {
  const r = spawnSync("neonctl", ["branches", "create", "--name", branch, "--parent", "main"], {
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const cs = spawnSync("neonctl", ["connection-string", branch], { encoding: "utf8" });
const url = cs.stdout.trim();
if (!url) {
  console.error("no connection string");
  process.exit(1);
}

const envPath = path.join(process.cwd(), ".env.local");
const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const next = /^POSTGRES_URL=/m.test(env)
  ? env.replace(/^POSTGRES_URL=.*/m, `POSTGRES_URL=${url}`)
  : env + `\nPOSTGRES_URL=${url}\n`;
fs.writeFileSync(envPath, next);
console.log(`POSTGRES_URL updated for branch ${branch}`);
