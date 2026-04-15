#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import * as p from "@clack/prompts";
import { stripMarker, stripMarkerHash, stripMarkerJsx } from "./scripts/lib/stripMarker.js";

type Manifest = {
  features: Record<
    string,
    {
      paths: string[];
      markers: string[];
      inverseMarkers?: string[];
      deps: string[];
      envVars: string[];
      relocate?: { moves: { from: string; to: string }[] };
    }
  >;
  defaults: Record<string, boolean>;
};

const ROOT = process.cwd();
const MANIFEST: Manifest = JSON.parse(fs.readFileSync(path.join(ROOT, ".template.json"), "utf8"));

function parseArgs(argv: string[]) {
  const flags: Record<string, string | boolean> = {};
  for (const a of argv) {
    if (a.startsWith("--no-")) flags[a.slice(5)] = false;
    else if (a.startsWith("--with-")) flags[a.slice(7)] = true;
    else if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      flags[k] = v ?? true;
    }
  }
  return flags;
}

function walkFiles(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, acc);
    else if (/\.(ts|tsx|js|mjs|cjs|json|yaml|yml|css|md)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

function rimrafSafe(target: string) {
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
}

function renameProject(name: string) {
  const pkgPath = path.join(ROOT, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as Record<string, unknown>;
  pkg.name = name;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

function applyManifest(selected: Record<string, boolean>) {
  // 1. Delete feature paths when disabled
  for (const [feat, def] of Object.entries(MANIFEST.features)) {
    if (!selected[feat]) {
      for (const rel of def.paths) rimrafSafe(path.join(ROOT, rel));
    }
  }

  // 2. Strip markers from remaining files
  const filesToProcess = [...walkFiles(path.join(ROOT, "src")), path.join(ROOT, "next.config.ts")];
  const envExample = path.join(ROOT, ".env.example");
  for (const file of filesToProcess) {
    if (!fs.existsSync(file)) continue;
    let text = fs.readFileSync(file, "utf8");
    for (const [feat, def] of Object.entries(MANIFEST.features)) {
      for (const m of def.markers) {
        text = stripMarker(text, m, !!selected[feat]);
        text = stripMarkerJsx(text, m, !!selected[feat]);
      }
      for (const m of def.inverseMarkers ?? []) {
        text = stripMarker(text, m, !selected[feat]);
        text = stripMarkerJsx(text, m, !selected[feat]);
      }
    }
    fs.writeFileSync(file, text);
  }
  // .env.example uses # hash markers
  if (fs.existsSync(envExample)) {
    let text = fs.readFileSync(envExample, "utf8");
    for (const [feat, def] of Object.entries(MANIFEST.features)) {
      for (const m of def.markers) text = stripMarkerHash(text, m, !!selected[feat]);
      for (const m of def.inverseMarkers ?? []) text = stripMarkerHash(text, m, !selected[feat]);
    }
    fs.writeFileSync(envExample, text);
  }

  // 3. Relocation moves (e.g., i18n: relocate root pages under [locale]/)
  for (const [feat, def] of Object.entries(MANIFEST.features)) {
    if (selected[feat] && def.relocate) {
      for (const mv of def.relocate.moves) {
        const from = path.join(ROOT, mv.from);
        const to = path.join(ROOT, mv.to);
        if (fs.existsSync(from)) {
          fs.mkdirSync(path.dirname(to), { recursive: true });
          fs.renameSync(from, to);
        }
      }
    }
  }
}

function pruneDeps(selected: Record<string, boolean>) {
  const pkgPath = path.join(ROOT, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  for (const [feat, def] of Object.entries(MANIFEST.features)) {
    if (!selected[feat]) {
      for (const dep of def.deps) {
        if (pkg.dependencies) delete pkg.dependencies[dep];
        if (pkg.devDependencies) delete pkg.devDependencies[dep];
      }
    }
  }
  // Always strip @clack/prompts (setup.ts is being deleted)
  if (pkg.devDependencies) delete pkg.devDependencies["@clack/prompts"];
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

function writeEnvLocal() {
  const example = fs.readFileSync(path.join(ROOT, ".env.example"), "utf8");
  const localPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(localPath)) fs.writeFileSync(localPath, example);
}

function setupNeonBranch() {
  const user = process.env["USER"] ?? "dev";
  const branch = `dev-${user}`;
  const probe = spawnSync("neonctl", ["--version"], { stdio: "ignore" });
  if (probe.status !== 0) {
    p.note("neonctl not found; skipping Neon branch creation.");
    return;
  }
  spawnSync("neonctl", ["branches", "create", "--name", branch, "--parent", "main"], {
    stdio: "inherit",
  });
  p.note(`Run \`pnpm db:branch\` to link .env.local to the new branch.`);
}

function selfDestruct() {
  rimrafSafe(path.join(ROOT, "setup.ts"));
  rimrafSafe(path.join(ROOT, ".template.json"));
  rimrafSafe(path.join(ROOT, ".eslintignore"));
  rimrafSafe(path.join(ROOT, "scripts/lib/stripMarker.ts"));
  rimrafSafe(path.join(ROOT, "scripts/__tests__"));
  // Remove empty scripts/lib dir if possible
  try {
    fs.rmdirSync(path.join(ROOT, "scripts/lib"));
  } catch {}
}

function printChecklist(name: string, selected: Record<string, boolean>) {
  const lines = [
    `✅ Scaffolded ${name}.`,
    "",
    "Next steps:",
    "1. Create a Neon project and link via Vercel integration (https://vercel.com/integrations/neon).",
    "2. Create a Vercel Blob store (https://vercel.com/dashboard/stores).",
    "3. Generate PAYLOAD_SECRET: `openssl rand -hex 32` and add to .env.local.",
    "4. Run `pnpm db:branch` to link your Neon dev branch.",
    "5. Run `pnpm db:migrate` against your dev branch.",
    "6. Run `pnpm payload` to create the first admin user.",
  ];
  if (selected["contact"]) {
    lines.push(
      "7. Sign up for Resend (https://resend.com) and add RESEND_API_KEY / CONTACT_EMAIL_*.",
    );
  }
  if (selected["ga"]) {
    lines.push("8. Create a GA4 property and add NEXT_PUBLIC_GA_MEASUREMENT_ID.");
  }
  p.note(lines.join("\n"));
}

async function run() {
  const flags = parseArgs(process.argv.slice(2));

  let name: string;
  if (typeof flags["name"] === "string") {
    name = flags["name"];
  } else {
    const res = await p.text({ message: "Project name?" });
    if (p.isCancel(res)) process.exit(1);
    name = res;
  }

  const selected: Record<string, boolean> = {};
  for (const [feat, def] of Object.entries(MANIFEST.defaults)) {
    if (feat in flags) {
      selected[feat] = flags[feat] !== false;
    } else {
      const res = await p.confirm({ message: `Enable ${feat}?`, initialValue: def });
      if (p.isCancel(res)) process.exit(1);
      selected[feat] = res;
    }
  }

  const enabledList =
    Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(", ") || "(none)";
  p.note(`Scaffolding ${name} with features: ${enabledList}`);

  renameProject(name);
  applyManifest(selected);
  pruneDeps(selected);
  writeEnvLocal();

  // Re-format src/ to clean up any whitespace artifacts left by marker stripping
  spawnSync("pnpm", ["exec", "oxfmt", "--write", "src/"], { stdio: "inherit" });

  if (!flags["skip-neon"]) setupNeonBranch();

  if (!flags["skip-install"]) {
    spawnSync("pnpm", ["install"], { stdio: "inherit" });
  }

  if (!flags["skip-git"]) {
    spawnSync("git", ["init", "-b", "main"], { stdio: "inherit" });
    spawnSync("git", ["add", "-A"], { stdio: "inherit" });
    spawnSync("git", ["commit", "-m", "chore: initial commit from template"], { stdio: "inherit" });
  }

  selfDestruct();
  printChecklist(name, selected);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
