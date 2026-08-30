import type { LucideIcon } from "lucide-react";

interface KPIProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  variant?: string;
}

export default function KPI({
  icon: Icon,
  label,
  value,
  detail,
  variant = "default",
}:
  KPIProps) {
  return (
    <div className={`kpi ${variant}`}>
      <div className="kpi-icon">
        <Icon />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}