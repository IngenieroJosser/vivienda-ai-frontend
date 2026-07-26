"use client";

import { FeedbackState } from "./feedback-state";

export function RouteError({
  title,
  description,
  reset,
}: {
  title: string;
  description: string;
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-5 py-10">
      <FeedbackState
        title={title}
        description={description}
        icon="alert"
        tone="error"
        variant="route"
        headingLevel={1}
        action={{ label: "Intentar nuevamente", onClick: reset }}
      />
    </main>
  );
}
