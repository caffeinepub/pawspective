interface Props {
  status: unknown;
}

function normalizeStatus(status: unknown): string {
  if (typeof status === "string") return status;
  if (status !== null && typeof status === "object") {
    return Object.keys(status as object)[0] ?? "";
  }
  return String(status ?? "");
}

const map: Record<string, { label: string; cls: string }> = {
  pending: {
    label: "Pending",
    cls: "bg-amber-100 text-amber-800 border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  completed: {
    label: "Completed",
    cls: "bg-blue-100 text-blue-800 border-blue-200",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-red-100 text-red-800 border-red-200",
  },
  stripe: {
    label: "Stripe",
    cls: "bg-violet-100 text-violet-800 border-violet-200",
  },
  manual: {
    label: "Manual",
    cls: "bg-slate-100 text-slate-700 border-slate-200",
  },
  paid: {
    label: "Paid",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  refunded: {
    label: "Refunded",
    cls: "bg-orange-100 text-orange-800 border-orange-200",
  },
};

export default function StatusBadge({ status }: Props) {
  const key = normalizeStatus(status);
  const cfg = map[key] ?? {
    label: key || String(status),
    cls: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}
