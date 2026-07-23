import Link from "next/link";
import { ProductBrand } from "./brand";
import { Icon } from "./icon";

export function OrientationHeader({
  status,
  statusTone = "active",
}: {
  status: string;
  statusTone?: "active" | "success";
}) {
  return (
    <header className="orientation-header sticky top-0 z-40">
      <div className="mx-auto flex min-h-[72px] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <ProductBrand compact />
        <div
          className={`orientation-status ${
            statusTone === "success"
              ? "orientation-status--success"
              : ""
          }`}
        >
          <span aria-hidden="true" />
          {status}
        </div>
      </div>
    </header>
  );
}

export function HousingWindow({
  compact = false,
  label = "Tu próxima etapa comienza aquí",
}: {
  compact?: boolean;
  label?: string;
}) {
  return (
    <div
      className={`housing-window ${compact ? "housing-window--compact" : ""}`}
      aria-hidden="true"
    >
      <div className="housing-window__sky">
        <span className="housing-window__sun" />
        <span className="housing-window__cloud housing-window__cloud--one" />
        <span className="housing-window__cloud housing-window__cloud--two" />
        <div className="housing-window__city">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="housing-window__frame housing-window__frame--vertical" />
      <div className="housing-window__frame housing-window__frame--horizontal" />
      {!compact ? (
        <div className="housing-window__caption">{label}</div>
      ) : null}
    </div>
  );
}

export function OrientationTrustStrip() {
  return (
    <div className="orientation-trust-strip">
      <span>
        <Icon name="shield" className="h-4 w-4" />
        Información protegida
      </span>
      <span>
        <Icon name="history" className="h-4 w-4" />
        Avance recuperable
      </span>
      <span>
        <Icon name="heart" className="h-4 w-4" />
        Orientación para afiliados y no afiliados
      </span>
    </div>
  );
}

export function OrientationBackLink({
  href = "/",
  label = "Volver al inicio",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link href={href} className="orientation-back-link">
      <Icon name="arrow" className="h-4 w-4 rotate-180" />
      {label}
    </Link>
  );
}
