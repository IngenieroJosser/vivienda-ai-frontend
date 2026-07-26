export const PROJECT_EMBED_HOSTS = [
  "heyzine.com",
  "shape.com.co",
  "storage.net-fs.com",
  "salasdeventas.com",
  "umbra3d.studio",
] as const;

export function isAllowedProjectEmbed(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.protocol === "https:"
      && PROJECT_EMBED_HOSTS.some(
        (host) =>
          parsedUrl.hostname === host
          || parsedUrl.hostname.endsWith(`.${host}`),
      )
    );
  } catch {
    return false;
  }
}
