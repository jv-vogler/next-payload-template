import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const user = process.env.USER ?? "dev";
const branch = `dev-${user}`;

const projectId = process.env.NEON_PROJECT_ID;
if (!projectId) {
  console.error(
    "NEON_PROJECT_ID is not set. Add it to .env.local (find it via `neonctl projects list`).",
  );
  process.exit(1);
}

const neon = (args: string[]) =>
  spawnSync("neonctl", [...args, "--project-id", projectId], { encoding: "utf8" });

const list = neon(["branches", "list", "--output", "json"]);
if (list.status !== 0) {
  console.error(list.stderr || "neonctl branches list failed");
  process.exit(1);
}

const exists = JSON.parse(list.stdout).some((b: { name: string }) => b.name === branch);
if (!exists) {
  const r = spawnSync(
    "neonctl",
    ["branches", "create", "--name", branch, "--parent", "main", "--project-id", projectId],
    { stdio: "inherit" },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const cs = neon(["connection-string", branch]);
const url = cs.stdout.trim();
if (!url) {
  console.error(cs.stderr || "no connection string");
  process.exit(1);
}

const envPath = path.join(process.cwd(), ".env.local");
const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const next = /^POSTGRES_URL=/m.test(env)
  ? env.replace(/^POSTGRES_URL=.*/m, `POSTGRES_URL=${url}`)
  : env + `\nPOSTGRES_URL=${url}\n`;
fs.writeFileSync(envPath, next);
console.log(`POSTGRES_URL updated for branch ${branch}`);
