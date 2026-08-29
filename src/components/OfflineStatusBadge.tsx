import { WifiOff } from "lucide-react";

export function OfflineStatusBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider"
      style={{
        borderColor: "var(--color-normal)",
        color: "var(--color-normal)",
        backgroundColor: "color-mix(in srgb, var(--color-normal) 10%, transparent)",
      }}
      title="No network calls leave this device. All inference runs locally."
    >
      <WifiOff size={12} strokeWidth={2.5} />
      Offline
    </div>
  );
}
