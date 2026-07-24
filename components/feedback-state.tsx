import type { ElementType } from "react";
import { Icon } from "./icon";

type FeedbackTone = "neutral" | "error" | "success";
type FeedbackVariant = "route" | "panel" | "embedded";

type FeedbackStateProps = {
  title: string;
  description?: string;
  icon: Parameters<typeof Icon>[0]["name"];
  tone?: FeedbackTone;
  variant?: FeedbackVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
  headingLevel?: 1 | 2 | 3;
};

const toneClasses: Record<FeedbackTone, string> = {
  neutral:
    "bg-[color:var(--vm-color-orientation-sky-soft)] text-[color:var(--vm-color-brand-blue)]",
  error:
    "bg-[color:var(--vm-color-error-soft)] text-[color:var(--vm-color-error)]",
  success:
    "bg-[color:var(--vm-color-success-soft)] text-[color:var(--vm-color-success)]",
};

const variantClasses: Record<FeedbackVariant, string> = {
  route: "surface-solid w-full max-w-lg p-8",
  panel: "surface-solid p-9",
  embedded: "p-10",
};

export function FeedbackState({
  title,
  description,
  icon,
  tone = "neutral",
  variant = "panel",
  action,
  headingLevel = 2,
}: FeedbackStateProps) {
  const Heading = `h${headingLevel}` as ElementType;

  return (
    <section
      role={tone === "error" ? "alert" : undefined}
      className={`${variantClasses[variant]} text-center`}
    >
      <span
        className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${toneClasses[tone]}`}
      >
        <Icon name={icon} />
      </span>
      <Heading
        className={`mt-4 font-semibold ${
          variant === "route" ? "text-2xl" : "text-xl"
        }`}
      >
        {title}
      </Heading>
      {description ? (
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
          {description}
        </p>
      ) : null}
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 min-h-11 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white"
        >
          {action.label}
        </button>
      ) : null}
    </section>
  );
}
