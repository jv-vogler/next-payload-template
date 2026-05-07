import { spawnSync } from "node:child_process";

const user = process.env.USER ?? "dev";
const branch = `dev-${user}`;

const projectId = process.env.NEON_PROJECT_ID;
if (!projectId) {
  console.error(
    "NEON_PROJECT_ID is not set. Add it to .env.local (find it via `neonctl projects list`).",
  );
  process.exit(1);
}

const r = spawnSync(
  "neonctl",
  ["branches", "reset", branch, "--to", "main", "--project-id", projectId],
  { stdio: "inherit" },
);
process.exit(r.status ?? 0);
