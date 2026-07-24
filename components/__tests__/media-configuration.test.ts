import { readFileSync, readdirSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

const root = process.cwd();

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return extname(entry.name) === ".tsx" ? [path] : [];
  });
}

const interfaceSources = ["app", "components", "features"]
  .flatMap((directory) => sourceFiles(resolve(root, directory)))
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");

describe("media configuration", () => {
  it("uses only the two configured image quality tiers", () => {
    const configuredQualities = nextConfig.images?.qualities;
    const usedQualities = [
      ...interfaceSources.matchAll(/quality=\{(\d+)\}/g),
    ].map((match) => Number(match[1]));

    expect(configuredQualities).toEqual([75, 90]);
    expect(new Set(usedQualities)).toEqual(new Set([75, 90]));
  });

  it("sizes modal images to their container rather than the full viewport", () => {
    const viewer = readFileSync(
      resolve(root, "components/project-image-viewer.tsx"),
      "utf8",
    );

    expect(viewer).not.toContain('sizes="100vw"');
    expect(viewer).toContain("(max-width: 1200px) 92vw, 1120px");
  });

  it("declares smooth scrolling for Next route transitions", () => {
    const layout = readFileSync(resolve(root, "app/layout.tsx"), "utf8");

    expect(layout).toContain('data-scroll-behavior="smooth"');
  });

  it("does not duplicate fullscreen permissions on embedded resources", () => {
    const viewer = readFileSync(
      resolve(root, "components/project-resource-viewer.tsx"),
      "utf8",
    );

    expect(viewer).toContain('allow="fullscreen; accelerometer; gyroscope"');
    expect(viewer).not.toContain("allowFullScreen");
  });
});
