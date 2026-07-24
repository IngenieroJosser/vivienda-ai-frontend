import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { extname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function sourceFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

describe("repository hygiene", () => {
  it("does not ship framework template assets or a public development route", () => {
    const forbiddenPaths = [
      "app/dev",
      "public/file.svg",
      "public/globe.svg",
      "public/next.svg",
      "public/vercel.svg",
      "public/window.svg",
    ];

    for (const path of forbiddenPaths) {
      expect(existsSync(resolve(root, path)), path).toBe(false);
    }
  });

  it("keeps debug logging out of production source modules", () => {
    const sources = ["app", "components", "features", "lib"]
      .flatMap((directory) => sourceFiles(resolve(root, directory)))
      .filter((path) => !path.includes(`${join("lib", "__tests__")}`))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");

    expect(sources).not.toMatch(/\bconsole\.(log|warn|error)\s*\(/);
  });
});
