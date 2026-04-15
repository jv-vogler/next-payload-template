export function stripMarker(text: string, marker: string, keep: boolean): string {
  const startRe = new RegExp(`^.*// @template:${marker}-start.*\\n`, "gm");
  const endRe = new RegExp(`^.*// @template:${marker}-end.*\\n`, "gm");
  if (keep) {
    return text.replace(startRe, "").replace(endRe, "");
  }
  const blockRe = new RegExp(
    `^.*// @template:${marker}-start[\\s\\S]*?// @template:${marker}-end.*\\n`,
    "gm",
  );
  return text.replace(blockRe, "");
}

// For JSX comment markers {/* @template:x-start */}
export function stripMarkerJsx(text: string, marker: string, keep: boolean): string {
  const startRe = new RegExp(`^.*\\{/\\* @template:${marker}-start \\*/\\}.*\\n`, "gm");
  const endRe = new RegExp(`^.*\\{/\\* @template:${marker}-end \\*/\\}.*\\n`, "gm");
  if (keep) {
    return text.replace(startRe, "").replace(endRe, "");
  }
  const blockRe = new RegExp(
    `^.*\\{/\\* @template:${marker}-start \\*/\\}[\\s\\S]*?\\{/\\* @template:${marker}-end \\*/\\}.*\\n`,
    "gm",
  );
  return text.replace(blockRe, "");
}

// For JSON/env-file-style markers using '#' comment prefix
export function stripMarkerHash(text: string, marker: string, keep: boolean): string {
  const startRe = new RegExp(`^.*# @template:${marker}-start.*\\n`, "gm");
  const endRe = new RegExp(`^.*# @template:${marker}-end.*\\n`, "gm");
  if (keep) {
    return text.replace(startRe, "").replace(endRe, "");
  }
  const blockRe = new RegExp(
    `^.*# @template:${marker}-start[\\s\\S]*?# @template:${marker}-end.*\\n`,
    "gm",
  );
  return text.replace(blockRe, "");
}
