import { afterAll, beforeAll, describe, expect, it } from "vitest";
import robots from "../../app/robots";
import sitemap from "../../app/sitemap";
import { housingProjects } from "../housing-catalog";
import {
  absoluteUrl,
  createPageMetadata,
  getSiteOrigin,
  serializeJsonLd,
  siteConfig,
} from "../seo";

const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

describe("SEO contracts", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://vivienda.example";
  });

  afterAll(() => {
    if (previousSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
    }
  });

  it("builds canonical metadata from one site configuration", () => {
    const metadata = createPageMetadata({
      title: "Proyectos de vivienda",
      description: "Catálogo de proyectos de vivienda.",
      path: "/vivienda/proyectos",
    });

    expect(metadata.alternates?.canonical).toBe(
      absoluteUrl("/vivienda/proyectos"),
    );
    expect(metadata.openGraph).toMatchObject({
      url: absoluteUrl("/vivienda/proyectos"),
      siteName: siteConfig.name,
    });
  });

  it("never invents a production domain when none is configured", () => {
    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(getSiteOrigin()).toBeNull();
    expect(absoluteUrl("/vivienda/proyectos")).toBe("/vivienda/proyectos");
    expect(sitemap()).toEqual([]);

    process.env.NEXT_PUBLIC_SITE_URL = configuredUrl;
  });

  it("escapes structured data before injecting it into HTML", () => {
    expect(serializeJsonLd({ value: "</script><script>alert(1)</script>" }))
      .not.toContain("<");
  });

  it("indexes only public discovery routes in the sitemap", () => {
    const urls = new Set(sitemap().map(({ url }) => url));

    expect(urls).toContain(absoluteUrl("/"));
    expect(urls).toContain(absoluteUrl("/vivienda/proyectos"));
    for (const project of housingProjects) {
      expect(urls).toContain(
        absoluteUrl(`/vivienda/proyectos/${project.id}`),
      );
    }
    expect([...urls].some((url) => url.includes("/asesor"))).toBe(false);
    expect([...urls].some((url) => url.includes("/orientacion"))).toBe(false);
  });

  it("keeps operational and personalized routes out of crawling", () => {
    const policy = robots();
    const rules = Array.isArray(policy.rules) ? policy.rules : [policy.rules];
    const disallowed = rules.flatMap(({ disallow }) =>
      Array.isArray(disallow) ? disallow : disallow ? [disallow] : [],
    );

    expect(disallowed).toEqual(
      expect.arrayContaining([
        "/asesor/",
        "/login",
        "/orientacion/",
      ]),
    );
    expect(policy.sitemap).toBe(absoluteUrl("/sitemap.xml"));
  });
});
