import { isAllowedProjectEmbed } from "./embed";

export type ConnectionHint = "none" | "dns-prefetch" | "preconnect";

type NetworkContext = {
  saveData?: boolean;
  effectiveType?: string;
};

export function getProjectEmbedConnectionHint(
  network: NetworkContext | undefined,
): ConnectionHint {
  if (network?.saveData) return "none";
  if (network?.effectiveType === "slow-2g" || network?.effectiveType === "2g") {
    return "dns-prefetch";
  }
  return "preconnect";
}

export function getProjectEmbedOrigins(urls: readonly string[]): string[] {
  return [
    ...new Set(
      urls
        .filter(isAllowedProjectEmbed)
        .map((url) => new URL(url).origin),
    ),
  ];
}
