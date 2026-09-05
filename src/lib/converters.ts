import { statuses } from "@/types/data-type";

const statusLabels = new Map<string, string>(
  statuses.map((item) => [item.value, item.label]),
);

export function getStatusLabel(status: string): string {
  return (
    statusLabels.get(status) ??
    status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
export function getStatusClassName(status: string) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "draft":
      return "border-slate-200 bg-slate-50 text-slate-600";
    case "out_of_stock":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "archived":
      return "border-slate-200 bg-slate-50 text-slate-500";
    default:
      return "";
  }
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
