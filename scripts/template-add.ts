#!/usr/bin/env tsx
/**
 * template-add — install a recipe from `recipes/<name>/` into the project.
 *
 * Usage:
 *   pnpm template:add <name>            install the named recipe
 *   pnpm template:add                   interactive picker (lists recipes/)
 *   pnpm template:add <name> --force    overwrite existing files
 *   pnpm template:add <name> --dry-run  print what would happen, change nothing
 *
 * What it does:
 *   1. Reads recipes/<name>/recipe.json.
 *   2. Walks recipes/<name>/files/ and copies each file to the same path in
 *      the project root. Refuses to overwrite without --force.
 *   3. Prints a unified diff for each file that --force would overwrite.
 *   4. Runs `pnpm add <deps>` and `pnpm add -D <devDeps>` if any.
 *   5. Appends commented stubs for any envVars to .env.example (skipping
 *      duplicates).
 *   6. Prints `postInstall` notes from recipe.json + a pointer to the
 *      recipe's README.md.
 *
 * The recipes/ directory itself is left in place. Re-running with --force is
 * safe; users can `rm -rf recipes/` once they're done customising.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";

type Recipe = {
  name: string;
  description: string;
  deps?: string[];
  devDeps?: string[];
  envVars?: string[];
  postInstall?: string;
};

const ROOT = process.cwd();
const RECIPES_DIR = path.join(ROOT, "recipes");

function listRecipes(): string[] {
  if (!fs.existsSync(RECIPES_DIR)) return [];
  return fs
    .readdirSync(RECIPES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(RECIPES_DIR, entry.name, "recipe.json")))
    .map((entry) => entry.name)
    .sort();
}

function parseFlags(argv: string[]): { positional: string[]; flags: Record<string, boolean> } {
  const positional: string[] = [];
  const flags: Record<string, boolean> = {};
  for (const arg of argv) {
    if (arg.startsWith("--")) flags[arg.slice(2)] = true;
    else positional.push(arg);
  }
  return { positional, flags };
}

function walkFiles(dir: string, base = dir, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, base, acc);
    else acc.push(path.relative(base, full));
  }
  return acc;
}

function unifiedDiff(a: string, b: string, label: string): string {
  // Minimal line-level diff — just shows changed lines, prefixed - / +.
  // Good enough for a "would overwrite" preview without pulling in `diff`.
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const max = Math.max(aLines.length, bLines.length);
  const out: string[] = [`--- ${label} (existing)`, `+++ ${label} (recipe)`];
  for (let i = 0; i < max; i++) {
    const av = aLines[i];
    const bv = bLines[i];
    if (av === bv) continue;
    if (av !== undefined) out.push(`- ${av}`);
    if (bv !== undefined) out.push(`+ ${bv}`);
  }
  return out.join("\n");
}

function copyRecipeFiles(recipeName: string, force: boolean, dryRun: boolean): void {
  const filesRoot = path.join(RECIPES_DIR, recipeName, "files");
  if (!fs.existsSync(filesRoot)) {
    p.note("Recipe has no files/ directory; skipping file copy.", "files");
    return;
  }

  const relPaths = walkFiles(filesRoot);
  if (relPaths.length === 0) {
    p.note("No files to copy.", "files");
    return;
  }

  const conflicts: string[] = [];
  for (const rel of relPaths) {
    const dest = path.join(ROOT, rel);
    if (fs.existsSync(dest) && !force) conflicts.push(rel);
  }

  if (conflicts.length && !force) {
    p.log.error(
      `Refusing to overwrite ${conflicts.length} existing file(s). Re-run with --force to overwrite.`,
    );
    for (const rel of conflicts) {
      const existing = fs.readFileSync(path.join(ROOT, rel), "utf8");
      const incoming = fs.readFileSync(path.join(filesRoot, rel), "utf8");
      console.error(`\n${unifiedDiff(existing, incoming, rel)}\n`);
    }
    process.exit(1);
  }

  for (const rel of relPaths) {
    const src = path.join(filesRoot, rel);
    const dest = path.join(ROOT, rel);
    if (dryRun) {
      const verb = fs.existsSync(dest) ? "OVERWRITE" : "CREATE";
      console.log(`  ${verb}  ${rel}`);
      continue;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function installDeps(deps: string[], devDeps: string[], dryRun: boolean): void {
  if (deps.length) {
    if (dryRun) console.log(`  pnpm add ${deps.join(" ")}`);
    else spawnSync("pnpm", ["add", ...deps], { stdio: "inherit" });
  }
  if (devDeps.length) {
    if (dryRun) console.log(`  pnpm add -D ${devDeps.join(" ")}`);
    else spawnSync("pnpm", ["add", "-D", ...devDeps], { stdio: "inherit" });
  }
}

function appendEnvVars(envVars: string[], dryRun: boolean): void {
  if (envVars.length === 0) return;
  const envExample = path.join(ROOT, ".env.example");
  const existing = fs.existsSync(envExample) ? fs.readFileSync(envExample, "utf8") : "";
  const lines: string[] = [];
  for (const key of envVars) {
    const re = new RegExp(`^${key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}=`, "m");
    if (re.test(existing)) continue;
    lines.push(`${key}=`);
  }
  if (lines.length === 0) return;
  const block = `\n${lines.join("\n")}\n`;
  if (dryRun) {
    console.log(`  append to .env.example:\n${block}`);
    return;
  }
  fs.appendFileSync(envExample, block);
}

async function main() {
  const { positional, flags } = parseFlags(process.argv.slice(2));
  const force = !!flags["force"];
  const dryRun = !!flags["dry-run"];

  let name = positional[0];
  if (!name) {
    const available = listRecipes();
    if (available.length === 0) {
      p.log.error("No recipes found in recipes/.");
      process.exit(1);
    }
    const picked = await p.select({
      message: "Which recipe?",
      options: available.map((n) => ({ value: n, label: n })),
    });
    if (p.isCancel(picked)) process.exit(1);
    name = String(picked);
  }

  const recipeDir = path.join(RECIPES_DIR, name);
  const manifestPath = path.join(recipeDir, "recipe.json");
  if (!fs.existsSync(manifestPath)) {
    p.log.error(`Recipe not found: ${name} (no ${manifestPath})`);
    process.exit(1);
  }

  const recipe = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Recipe;
  p.note(`${recipe.name} — ${recipe.description}`, "Installing");

  copyRecipeFiles(name, force, dryRun);
  installDeps(recipe.deps ?? [], recipe.devDeps ?? [], dryRun);
  appendEnvVars(recipe.envVars ?? [], dryRun);

  const lines = ["Done."];
  if (recipe.postInstall) lines.push("", recipe.postInstall);
  const readme = path.join(recipeDir, "README.md");
  if (fs.existsSync(readme)) {
    lines.push("", `See: recipes/${name}/README.md`);
  }
  p.note(lines.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
