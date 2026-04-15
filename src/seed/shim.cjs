/**
 * Pre-loader shim for @next/env compatibility with Payload 3.x + Next.js 16.
 *
 * Payload's internal loadEnv.js does:
 *   const { loadEnvConfig } = require('@next/env').default
 *
 * In Next.js 16, @next/env no longer ships a `.default` object — only named exports.
 * This shim adds a synthetic `.default.loadEnvConfig` so Payload doesn't crash.
 *
 * Usage (via tsx --require):
 *   tsx --require ./src/seed/shim.cjs ...
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mod = require("@next/env");

if (!mod.default) {
  mod.default = {};
}
if (!mod.default.loadEnvConfig) {
  mod.default.loadEnvConfig = function () {
    return { combinedEnv: process.env, loadedEnvFiles: [] };
  };
}
