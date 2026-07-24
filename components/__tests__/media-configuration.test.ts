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

  it("uses the font variable emitted by next/font", () => {
    const styles = readFileSync(resolve(root, "app/globals.css"), "utf8");

    expect(styles).toContain(
      '--vm-font-family: var(--font-manrope), "Segoe UI", Arial, sans-serif;',
    );
  });

  it("discovers one responsive LCP candidate without duplicating the gallery", () => {
    const gallery = readFileSync(
      resolve(root, "components/project-media-gallery.tsx"),
      "utf8",
    );

    expect(gallery.match(/images\.map/g)).toHaveLength(1);
    expect(gallery).toContain('loading={index === 0 ? "eager" : "lazy"}');
    expect(gallery).toContain(
      'fetchPriority={index === 0 ? "high" : "auto"}',
    );
  });

  it("loads immersive viewers only after the user requests them", () => {
    const gallery = readFileSync(
      resolve(root, "components/project-media-gallery.tsx"),
      "utf8",
    );

    expect(gallery).toContain('import dynamic from "next/dynamic"');
    expect(gallery).not.toContain(
      'import { ProjectImageViewer } from "./project-image-viewer"',
    );
    expect(gallery).not.toContain(
      'import { ProjectResourceViewer } from "./project-resource-viewer"',
    );
  });

  it("does not duplicate fullscreen permissions on embedded resources", () => {
    const viewer = readFileSync(
      resolve(root, "components/project-resource-viewer.tsx"),
      "utf8",
    );

    expect(viewer).toContain('allow="fullscreen; accelerometer; gyroscope"');
    expect(viewer).not.toContain("allowFullScreen");
  });

  it("suspends rendering beneath an active embedded resource", () => {
    const viewer = readFileSync(
      resolve(root, "components/project-resource-viewer.tsx"),
      "utf8",
    );
    const styles = readFileSync(resolve(root, "app/globals.css"), "utf8");

    expect(viewer).toContain(
      'document.body.classList.add("project-resource-viewer-open")',
    );
    expect(viewer).toContain(
      'document.body.classList.remove("project-resource-viewer-open")',
    );
    expect(styles).toContain(
      "body.project-resource-viewer-open > :not(.project-resource-viewer)",
    );
    expect(styles).toContain("content-visibility: hidden");
  });

  it("caps the default 3D viewport and isolates its rendering work", () => {
    const styles = readFileSync(resolve(root, "app/globals.css"), "utf8");

    expect(styles).toContain("width: min(94vw, 1180px)");
    expect(styles).toContain("height: min(88dvh, 760px)");
    expect(styles).toContain("contain: layout paint style");
  });
});
