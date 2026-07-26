import { describe, expect, it } from "vitest";
import {
  getProjectEmbedConnectionHint,
  getProjectEmbedOrigins,
} from "../connection-hints";

describe("project embed connection hints", () => {
  it("preconnects on regular connections", () => {
    expect(getProjectEmbedConnectionHint(undefined)).toBe("preconnect");
    expect(getProjectEmbedConnectionHint({ effectiveType: "4g" })).toBe(
      "preconnect",
    );
  });

  it("reduces work on constrained connections", () => {
    expect(getProjectEmbedConnectionHint({ effectiveType: "2g" })).toBe(
      "dns-prefetch",
    );
    expect(
      getProjectEmbedConnectionHint({ effectiveType: "4g", saveData: true }),
    ).toBe("none");
  });

  it("deduplicates allowed origins and rejects unknown providers", () => {
    expect(
      getProjectEmbedOrigins([
        "https://shape.com.co/first",
        "https://shape.com.co/second",
        "https://heyzine.com/book",
        "https://example.com/not-allowed",
      ]),
    ).toEqual(["https://shape.com.co", "https://heyzine.com"]);
  });
});
