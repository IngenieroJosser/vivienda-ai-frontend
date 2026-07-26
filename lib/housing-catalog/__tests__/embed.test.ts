import { describe, expect, it } from "vitest";
import {
  isAllowedProjectEmbed,
  PROJECT_EMBED_HOSTS,
} from "../embed";

describe("project resource embeds", () => {
  it.each(PROJECT_EMBED_HOSTS)("allows the approved host %s", (host) => {
    expect(isAllowedProjectEmbed(`https://${host}/resource`)).toBe(true);
    expect(isAllowedProjectEmbed(`https://viewer.${host}/resource`)).toBe(true);
  });

  it("rejects insecure, malformed and lookalike resource URLs", () => {
    expect(isAllowedProjectEmbed("http://heyzine.com/resource")).toBe(false);
    expect(isAllowedProjectEmbed("not-a-url")).toBe(false);
    expect(isAllowedProjectEmbed("https://heyzine.com.example.com/resource")).toBe(
      false,
    );
  });
});
