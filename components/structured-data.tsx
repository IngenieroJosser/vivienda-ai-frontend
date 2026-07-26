import { getSiteOrigin, serializeJsonLd, type JsonLd } from "@/lib/seo";

export function StructuredData({ data }: { data: JsonLd }) {
  if (!getSiteOrigin()) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
