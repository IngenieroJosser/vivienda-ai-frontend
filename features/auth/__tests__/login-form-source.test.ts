import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("advisor login form", () => {
  it("keeps credential inputs editable", () => {
    const source = readFileSync(
      resolve(process.cwd(), "app/login/page.tsx"),
      "utf8",
    );
    const inputs = source.match(/<input[\s\S]*?\/>/g) ?? [];

    expect(inputs).toHaveLength(2);
    expect(inputs.every((input) => !/\bdisabled\b/.test(input))).toBe(true);
    expect(inputs.every((input) => /\bonChange=/.test(input))).toBe(true);
  });
});
