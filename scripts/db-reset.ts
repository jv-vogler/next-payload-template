import { spawnSync } from "node:child_process";

const user = process.env.USER ?? "dev";
const branch = `dev-${user}`;

const r = spawnSync("neonctl", ["branches", "reset", branch, "--to", "main"], { stdio: "inherit" });
process.exit(r.status ?? 0);
