"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
};

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/**
 * Precarga únicamente la siguiente ruta probable y solo cuando el navegador
 * está ocioso. En ahorro de datos o redes lentas se desactiva para no competir
 * con los recursos críticos de la pantalla actual.
 */
export function RoutePrefetcher({ routes }: { routes?: string[] }) {
  const router = useRouter();

  useEffect(() => {
    const targets = routes ?? [];
    if (!targets.length) return;

    const connection = (navigator as NavigatorWithConnection).connection;
    if (connection?.saveData || connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g") {
      return;
    }

    const browserWindow = window as WindowWithIdleCallback;
    const prefetch = () => targets.slice(0, 2).forEach((route) => router.prefetch(route));

    if (browserWindow.requestIdleCallback) {
      const idleId = browserWindow.requestIdleCallback(prefetch, { timeout: 1800 });
      return () => browserWindow.cancelIdleCallback?.(idleId);
    }

    const timer = window.setTimeout(prefetch, 1200);
    return () => window.clearTimeout(timer);
  }, [router, routes]);

  return null;
}
