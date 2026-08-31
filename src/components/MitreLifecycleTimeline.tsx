import { Shield, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";
import type { MitreReasoningResponse } from "../data/api";

interface MitreLifecycleTimelineProps {
  reasoning: MitreReasoningResponse | null;
  currentStage: number;
}

const STAGES = [
  { id: 1, name: "Reconnaissance", tactic: "TA0043", color: "#818CF8", desc: "Port Scan & Service Sweep" },
  { id: 2, name: "Initial Access", tactic: "TA0001", color: "#F472B6", desc: "Brute Force & Exploit" },
  { id: 3, name: "Lateral Movement", tactic: "TA0008", color: "#FB923C", desc: "Substation Pivoting" },
  { id: 4, name: "Command & Control", tactic: "TA0011", color: "#F43F5E", desc: "Periodic C2 Beaconing" },
  { id: 5, name: "Impact / Exfil", tactic: "TA0040", color: "#DC2626", desc: "Exhaustion & Interruption" },
];

export function MitreLifecycleTimeline({ reasoning, currentStage }: MitreLifecycleTimelineProps) {
  const activeStage = reasoning?.mitre_stage_id || currentStage || 2;

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-5 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-[var(--color-accent)]" />
          <h3 className="font-semibold text-sm tracking-wide text-[var(--color-text-primary)]">
            SYMBOLIC MITRE ATT&CK® KILL-CHAIN LIFECYCLE REASONING
          </h3>
        </div>
        {reasoning?.risk_acceleration && (
          <span className="rounded-full px-2.5 py-0.5 text-xs font-mono font-medium" style={{ backgroundColor: "rgba(220, 38, 38, 0.15)", color: "#F87171", border: "1px solid rgba(220, 38, 38, 0.3)" }}>
            Risk Acceleration: {reasoning.risk_acceleration}
          </span>
        )}
      </div>

      {/* Stage Progression Nodes */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
        {STAGES.map((s) => {
          const isPassed = s.id < activeStage;
          const isCurrent = s.id === activeStage;

          return (
            <div
              key={s.id}
              className={`relative flex flex-col rounded-lg p-3 border transition-all duration-300 ${
                isCurrent
                  ? "ring-2 ring-[var(--color-accent)] shadow-lg"
                  : "opacity-80"
              }`}
              style={{
                backgroundColor: isCurrent ? "rgba(99, 102, 241, 0.12)" : "rgba(15, 23, 42, 0.4)",
                borderColor: isCurrent ? s.color : "var(--color-border)",
              }}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">STAGE {s.id}</span>
                {isPassed && <CheckCircle2 size={12} className="text-emerald-400" />}
                {isCurrent && <span className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: s.color }} />}
              </div>
              <span className="font-semibold text-xs truncate" style={{ color: isCurrent ? s.color : "var(--color-text-primary)" }}>
                {s.name}
              </span>
              <span className="text-[10px] font-mono text-[var(--color-text-secondary)] truncate">
                {s.tactic}
              </span>
              <span className="text-[10px] text-[var(--color-text-secondary)] mt-1 line-clamp-1">
                {s.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Deep Symbolic Forensic Narrative */}
      {reasoning && (
        <div className="rounded-lg p-3 text-xs leading-relaxed border" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", borderColor: "var(--color-border)" }}>
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle size={15} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
            <p className="text-[var(--color-text-primary)] font-sans">
              {reasoning.forensic_narrative}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t font-mono text-[11px]" style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}>
            <span className="text-[var(--color-text-secondary)]">
              TECHNIQUE: <strong className="text-[var(--color-accent)]">{reasoning.mitre_technique_id} ({reasoning.mitre_technique_name})</strong>
            </span>
            <span className="text-[var(--color-text-secondary)]">
              CAPEC: <strong className="text-pink-400">{reasoning.capec_id} ({reasoning.capec_name})</strong>
            </span>
            <span className="text-[var(--color-text-secondary)]">
              TRANSITION: <strong className="text-amber-400">{reasoning.lifecycle_transition}</strong>
            </span>
            {reasoning.mitre_url && (
              <a
                href={reasoning.mitre_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[var(--color-accent)] hover:underline ml-auto"
              >
                <span>MITRE Docs</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
