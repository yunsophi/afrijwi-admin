import { CASE_STATUS_LABELS, CASE_STATUS_TONE } from "@/lib/constants";

const TONE_CLASSES: Record<string, string> = {
  neutral: "bg-tone-neutral-bg text-tone-neutral-text",
  info: "bg-tone-info-bg text-tone-info-text",
  warning: "bg-tone-warning-bg text-tone-warning-text",
  success: "bg-tone-success-bg text-tone-success-text",
  danger: "bg-tone-danger-bg text-tone-danger-text",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = CASE_STATUS_TONE[status] ?? "neutral";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {CASE_STATUS_LABELS[status] ?? status}
    </span>
  );
}
