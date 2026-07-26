"use client";

import { RouteError } from "@/components/route-error";

export default function AdvisorError({ reset }: { reset: () => void }) {
  return (
    <RouteError
      title="No pudimos cargar el espacio comercial."
      description="Las acciones guardadas localmente permanecen en este dispositivo. Intenta cargar nuevamente la vista."
      reset={reset}
    />
  );
}
