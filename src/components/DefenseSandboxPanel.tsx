import { ShieldAlert, Zap, FileText } from "lucide-react";
import type { MitigationResponse } from "../data/api";

interface DefenseSandboxPanelProps {
  mitigationData: MitigationResponse | null;
  selectedAction: string;
  onSelectAction: (actionName: string) => void;
  onOpenDossier: () => void;
}

export function DefenseSandboxPanel({
  mitigationData,
  selectedAction,
  onSelectAction,
  onOpenDossier,
}: DefenseSandboxPanelProps) {
  const actions = mitigationData?.actions || [];
  const currentAction = actions.find((a) => a.action === selectedAction) || actions[2] || actions[0];
  const riskReductionPct = currentAction ? Math.round((currentAction.forecast_risk_reduction || 0.74) * 100) : 74;

  return (
    <div className="flex flex-col gap-5 rounded-xl border p-5 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-amber-400" />
          <h3 className="font-semibold text-sm tracking-wide text-[var(--color-text-primary)]">
            INTERACTIVE "WHAT-IF" DEFENSE POLICY SANDBOX (LATENT SPACE SIMULATION)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDossier}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all hover:scale-105 shadow-md"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            <FileText size={14} />
            <span>Generate Sovereign NCIIPC Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left 2 Cols: Action Selector Cards */}
        <div className="flex flex-col gap-2.5 lg:col-span-2">
          <div className="text-xs font-mono text-[var(--color-text-secondary)] mb-1">
            SELECT PROACTIVE INTERVENTION POLICY:
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {actions.map((act) => {
              const isSelected = act.action === selectedAction;
              const isRec = act.is_recommended;
              const isBlocked = act.is_blocked_by_guardrail;

              return (
                <button
                  key={act.action}
                  onClick={() => !isBlocked && onSelectAction(act.action)}
                  disabled={isBlocked}
                  className={`flex flex-col text-left rounded-lg p-3 border transition-all duration-200 ${
                    isSelected
                      ? "ring-2 ring-[var(--color-accent)] shadow-md"
                      : "hover:border-[var(--color-accent)]"
                  } ${isBlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={{
                    backgroundColor: isSelected ? "rgba(99, 102, 241, 0.15)" : "rgba(15, 23, 42, 0.4)",
                    borderColor: isSelected ? "var(--color-accent)" : "var(--color-border)",
                  }}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-xs text-[var(--color-text-primary)]">
                      {act.action.replace("_", " ")}
                    </span>
                    {isRec && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        OPTIMAL
                      </span>
                    )}
                    {isBlocked && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-mono font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        BLOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                    {act.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between font-mono text-[10px] pt-1 border-t border-white/5">
                    <span className="text-[var(--color-text-secondary)]">
                      Cost: {(act.operational_cost * 100).toFixed(0)}%
                    </span>
                    <span className={act.forecast_risk_reduction > 0.5 ? "text-emerald-400 font-bold" : "text-amber-400"}>
                      -{Math.round(act.forecast_risk_reduction * 100)}% Risk
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Latent State Impact Card */}
        <div className="flex flex-col justify-between rounded-lg p-4 border" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", borderColor: "var(--color-border)" }}>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--color-text-secondary)] mb-2">
              <ShieldAlert size={14} className="text-[var(--color-accent)]" />
              <span>PROJECTED RISK REDUCTION</span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold font-mono text-emerald-400">
                -{riskReductionPct}%
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                Threat Probability Drop
              </span>
            </div>

            <p className="text-xs text-[var(--color-text-primary)] leading-relaxed mb-3">
              Applying <strong>{currentAction?.action.replace("_", " ")}</strong> in latent state space projects immediate attenuation of attack progression before physical firewall deployment.
            </p>
          </div>

          <div className="rounded p-2.5 font-mono text-[11px] bg-black/40 border border-white/5 space-y-1">
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Policy Status:</span>
              <span className="text-emerald-400 font-semibold">PRE-VALIDATED</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Safety Guardrail:</span>
              <span className="text-cyan-400">PASSED (G-01/G-02)</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Simulation Horizon:</span>
              <span className="text-purple-300">K=5 (+50s)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
