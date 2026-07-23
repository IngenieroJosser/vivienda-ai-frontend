"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { stageEntryMessage } from "../pending-message";

export function LandingConversationComposer() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const hasMessage = Boolean(message.trim());

  function submit() {
    if (!hasMessage) return;
    stageEntryMessage(message);
    router.push("/orientacion");
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="prospect-entry-composer motion-rise motion-delay-3"
    >
      <label className="block">
        <span className="sr-only">Cuéntanos qué vivienda estás buscando</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          rows={1}
          maxLength={600}
          className="prospect-landing-textarea"
          placeholder="Cuéntanos qué vivienda estás buscando…"
        />
      </label>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
          Tu mensaje continuará en la conversación después de autorizar el uso de la información.
        </p>
        <button
          type="submit"
          disabled={!hasMessage}
          aria-label="Continuar la conversación"
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full transition duration-150 focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] ${
            hasMessage
              ? "bg-[color:var(--vm-color-brand-blue)] text-white shadow-[var(--vm-shadow-medium)] hover:-translate-y-0.5 hover:bg-[color:var(--vm-color-brand-blue-deep)]"
              : "bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]/45"
          }`}
        >
          <Icon name="arrow" className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
