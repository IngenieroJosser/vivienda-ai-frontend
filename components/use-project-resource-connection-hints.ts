"use client";

import { useEffect } from "react";
import {
  getProjectEmbedConnectionHint,
  getProjectEmbedOrigins,
} from "@/lib/housing-catalog/connection-hints";
import type { ProjectResource } from "./project-media-gallery-model";

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

export function useProjectResourceConnectionHints(
  resources: readonly ProjectResource[],
) {
  useEffect(() => {
    const connection = (navigator as NavigatorWithConnection).connection;
    const hint = getProjectEmbedConnectionHint(connection);
    if (hint === "none") return;

    const origins = getProjectEmbedOrigins(
      resources.map(({ url }) => url),
    );
    for (const origin of origins) {
      const selector = `link[data-project-resource-origin="${origin}"][rel="${hint}"]`;
      if (document.head.querySelector(selector)) continue;
      const link = document.createElement("link");
      link.rel = hint;
      link.href = origin;
      link.dataset.projectResourceOrigin = origin;
      document.head.append(link);
    }
  }, [resources]);
}
