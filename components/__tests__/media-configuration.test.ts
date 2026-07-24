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

const interfacePaths = ["app", "components", "features"].flatMap((directory) =>
  sourceFiles(resolve(root, directory)),
);

const interfaceSources = interfacePaths
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");

const visualSources = interfacePaths
  .filter((path) => path !== resolve(root, "app/layout.tsx"))
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");

const prospectSources = [
  ...sourceFiles(resolve(root, "features/prospect")),
  resolve(root, "app/page.tsx"),
  resolve(root, "app/orientacion/page.tsx"),
  resolve(root, "app/vivienda/proyectos/page.tsx"),
  resolve(root, "components/project-card.tsx"),
  resolve(root, "components/project-catalog.tsx"),
  resolve(root, "components/public-flow-shell.tsx"),
]
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

  it("avoids deprecated image priority and unoptimized project media", () => {
    const images = interfaceSources.match(/<Image[\s\S]*?\/>/g) ?? [];
    expect(images.every((image) => !/\bpriority\b/.test(image))).toBe(true);

    const login = readFileSync(
      resolve(root, "app/login/page.tsx"),
      "utf8",
    );
    expect(login).not.toContain("unoptimized");
    expect(login).toContain('loading="lazy"');
  });

  it("uses the font variable emitted by next/font", () => {
    const layout = readFileSync(resolve(root, "app/layout.tsx"), "utf8");
    const styles = readFileSync(resolve(root, "app/globals.css"), "utf8");

    expect(layout).toContain('import localFont from "next/font/local"');
    expect(layout).not.toContain("next/font/google");
    expect(layout).toContain('src: "./fonts/Manrope-Variable.woff2"');
    expect(styles).toContain(
      '--vm-font-family: var(--font-manrope), "Segoe UI", Arial, sans-serif;',
    );
  });

  it("keeps internal product terminology out of visible interface copy", () => {
    const internalTerms = [
      "Acceso de prototipo",
      "Esta demostración",
      "lead pago",
      "Leads que necesitan maduración",
      "matching original",
      "Material comercial aprobado",
      "Catálogo aprobado",
      "proyectos documentados",
      "vistas verificadas",
    ];

    for (const term of internalTerms) {
      expect(interfaceSources).not.toContain(term);
    }
  });

  it("keeps public supporting text at a readable minimum size", () => {
    expect(prospectSources).not.toMatch(/text-\[(?:9|10)px\]/);
  });

  it("keeps component colors, gradients and shadows behind visual tokens", () => {
    expect(visualSources).not.toMatch(/#[\da-f]{3,8}/i);
    expect(visualSources).not.toMatch(/rgba?\(/i);
    expect(visualSources).not.toMatch(/bg-\[linear-gradient/i);
    expect(visualSources).not.toMatch(/shadow-\[(?!var\()/);
    expect(visualSources).not.toMatch(
      /(?:bg|border|text)-(?:emerald|rose)-\d+/,
    );
  });

  it("shares feedback semantics across recoverable and empty states", () => {
    const feedback = readFileSync(
      resolve(root, "components/feedback-state.tsx"),
      "utf8",
    );

    expect(feedback).toContain('role={tone === "error" ? "alert" : undefined}');
    expect(interfaceSources.match(/<FeedbackState/g)?.length).toBeGreaterThanOrEqual(
      4,
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

  it("keeps mobile gallery observation separate from requested navigation", () => {
    const gallery = readFileSync(
      resolve(root, "components/project-media-gallery.tsx"),
      "utf8",
    );

    expect(gallery).toContain("getClosestSlideIndex");
    expect(gallery).toContain("getCenteredSlideOffset");
    expect(gallery).toContain("didDragRef");
    expect(gallery).not.toContain("useEffect(");
  });

  it("supports intentional swipe gestures inside the image viewer", () => {
    const viewer = readFileSync(
      resolve(root, "components/project-image-viewer.tsx"),
      "utf8",
    );

    expect(viewer).toContain("getHorizontalSwipeDirection");
    expect(viewer).toContain("onPointerDown");
    expect(viewer).toContain("onPointerUp");
    expect(viewer).toContain("images.length < 2");
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

  it("also defers immersive viewers in the advisor workspace", () => {
    const explorer = readFileSync(
      resolve(
        root,
        "features/advisor/components/advisor-project-explorer.tsx",
      ),
      "utf8",
    );

    expect(explorer).toContain('import dynamic from "next/dynamic"');
    expect(explorer).not.toContain(
      'import { ProjectImageViewer } from "@/components/project-image-viewer"',
    );
    expect(explorer).not.toContain(
      'import { ProjectResourceViewer } from "@/components/project-resource-viewer"',
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

  it("skips rendering project cards until they approach the viewport", () => {
    const styles = readFileSync(resolve(root, "app/globals.css"), "utf8");

    expect(styles).toContain(".projects-grid .project-card");
    expect(styles).toContain("content-visibility: auto");
    expect(styles).toContain("contain-intrinsic-size:");
  });
});
