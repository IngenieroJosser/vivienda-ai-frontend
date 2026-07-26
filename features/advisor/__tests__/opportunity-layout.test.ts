import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const globalStyles = readFileSync(
  resolve(process.cwd(), "app/globals.css"),
  "utf8",
);

describe("opportunity workspace layout", () => {
  it("adapts the action dock to its detail panel instead of the viewport", () => {
    expect(globalStyles).toMatch(
      /\.advisor-detail-enter\s*\{[^}]*container-type:\s*inline-size/s,
    );
    expect(globalStyles).toMatch(
      /@container\s+opportunity-detail\s+\(max-width:\s*760px\)/,
    );
  });
});
