import { test } from "node:test";
import assert from "node:assert/strict";
import { stripMarker, stripMarkerHash, stripMarkerJsx } from "../lib/stripMarker.js";

test("stripMarker keep=true removes only marker lines", () => {
  const src = `a\n// @template:foo-start\nb\n// @template:foo-end\nc\n`;
  assert.equal(stripMarker(src, "foo", true), "a\nb\nc\n");
});

test("stripMarker keep=false removes whole block", () => {
  const src = `a\n// @template:foo-start\nb\n// @template:foo-end\nc\n`;
  assert.equal(stripMarker(src, "foo", false), "a\nc\n");
});

test("stripMarker handles multiple blocks of same marker", () => {
  const src =
    `// @template:x-start\na\n// @template:x-end\n` +
    `// @template:x-start\nb\n// @template:x-end\n`;
  assert.equal(stripMarker(src, "x", false), "");
});

test("stripMarker keep preserves content across multiple blocks", () => {
  const src =
    `// @template:x-start\na\n// @template:x-end\n` +
    `// @template:x-start\nb\n// @template:x-end\n`;
  assert.equal(stripMarker(src, "x", true), "a\nb\n");
});

test("stripMarker leaves unrelated markers untouched", () => {
  const src = `// @template:foo-start\nA\n// @template:foo-end\n// @template:bar-start\nB\n// @template:bar-end\n`;
  assert.equal(stripMarker(src, "foo", false), `// @template:bar-start\nB\n// @template:bar-end\n`);
});

test("stripMarkerHash keep=true removes only marker lines (# comments)", () => {
  const src = `A\n# @template:foo-start\nB\n# @template:foo-end\nC\n`;
  assert.equal(stripMarkerHash(src, "foo", true), "A\nB\nC\n");
});

test("stripMarkerHash keep=false removes whole block (# comments)", () => {
  const src = `A\n# @template:foo-start\nB\n# @template:foo-end\nC\n`;
  assert.equal(stripMarkerHash(src, "foo", false), "A\nC\n");
});

test("stripMarkerJsx keep=true removes only marker lines", () => {
  const src = `A\n{/* @template:foo-start */}\nB\n{/* @template:foo-end */}\nC\n`;
  assert.equal(stripMarkerJsx(src, "foo", true), "A\nB\nC\n");
});

test("stripMarkerJsx keep=false removes whole block", () => {
  const src = `A\n{/* @template:foo-start */}\nB\n{/* @template:foo-end */}\nC\n`;
  assert.equal(stripMarkerJsx(src, "foo", false), "A\nC\n");
});
