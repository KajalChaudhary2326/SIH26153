import { useEffect, useState } from "react";
import { RotateCcw, Shield, ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import { ProbabilityTimeline } from "../components/ProbabilityTimeline";
import { KStepProjection } from "../components/KStepProjection";
import { FlaggedFlowsList } from "../components/FlaggedFlowsList";
import { MITREStageBadge } from "../components/MITREStageBadge";
import { ExplainabilityPanel } from "../components/ExplainabilityPanel";
import { ExportButton } from "../components/ExportButton";
import {
  getTimeline,
  getFlaggedFlows,
  getSampleSessions,
  evaluateMitigationActions,
  type ScenarioSession,
  type MitigationResponse,
} from "../data/api";
import { useAppStore } from "../store/useAppStore";
import type { FlaggedFlow, Severity, TimelinePoint } from "../data/types";

export function SimulationPage() {
  const activeIngestion = useAppStore((s) => s.activeIngestion);
  const setActiveIngestion = useAppStore((s) => s.setActiveIngestion);

  const [sessions, setSessions] = useState<ScenarioSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("sess_bot_c2");
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [flows, setFlows] = useState<FlaggedFlow[]>([]);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [selectedPoint, setSelectedPoint] = useState<TimelinePoint | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [loading, setLoading] = useState(true);

  // Counterfactual Mitigation state
  const [mitigationData, setMitigationData] = useState<MitigationResponse | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>("RESET_CONNECTIONS");

  useEffect(() => {
    getSampleSessions().then((sList) => {
      setSessions(sList);
      if (!activeIngestion && sList.length > 0) {
        setActiveIngestion({
          id: sList[0].id,
          sourceType: "csv",
          filename: sList[0].name,
          datasetName: "cic-ids-2018",
          uploadedAt: new Date().toISOString(),
          status: "ready",
        });
        setSelectedSessionId(sList[0].id);
      }
    });
  }, [activeIngestion, setActiveIngestion]);

  useEffect(() => {
    const sessId = activeIngestion?.id || selectedSessionId;
    setLoading(true);
    Promise.all([getTimeline(sessId), getFlaggedFlows(), evaluateMitigationActions(sessId)]).then(
      ([tl, fl, mit]) => {
        setTimeline(tl);
        setFlows(fl);
        setMitigationData(mit);
        setSelectedAction(mit.safety_shield_recommendation || "RESET_CONNECTIONS");
        setLoading(false);
      }
    );
  }, [activeIngestion?.id, selectedSessionId, replayKey]);

  function handleSessionChange(id: string) {
    setSelectedSessionId(id);
    const found = sessions.find((s) => s.id === id);
    if (found) {
      setActiveIngestion({
        id: found.id,
        sourceType: "csv",
        filename: found.name,
        datasetName: "cic-ids-2018",
        uploadedAt: new Date().toISOString(),
        status: "ready",
      });
    }
  }

  const currentSession = sessions.find((s) => s.id === (activeIngestion?.id || selectedSessionId)) || sessions[0];
  const latestObserved = [...timeline].filter((p) => !p.isProjection).slice(-1)[0];
  const projectedPoints = timeline.filter((p) => p.isProjection);
  const isCritical =
    (latestObserved?.infiltrationProbability ?? 0) >= 0.8 ||
    projectedPoints.some((p) => p.infiltrationProbability >= 0.8);

  const activeMitigation = mitigationData?.actions.find((a) => a.action === selectedAction);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Scenario Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--color-text-secondary)]">
            <Activity size={14} className="text-[var(--color-accent)]" />
            <span>SCENARIO PRESET:</span>
          </div>
          <select
            value={activeIngestion?.id || selectedSessionId}
            onChange={(e) => handleSessionChange(e.target.value)}
            className="rounded-md border bg-[var(--color-base)] px-3 py-1.5 font-mono text-xs text-[var(--color-text-primary)] transition-colors focus:border-[var(--color-accent)] focus:outline-none"
            style={{ borderColor: "var(--color-border)" }}
          >
            {sessions.map((sess) => (
              <option key={sess.id} value={sess.id}>
                [{sess.severity.toUpperCase()}] {sess.name} ({sess.host_ip})
              </option>
            ))}
          </select>
          {latestObserved && <MITREStageBadge stage={latestObserved.predictedMitreStage} size="lg" />}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReplayKey((k) => k + 1)}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-panel-raised)]"
            style={{ borderColor: "var(--color-border)" }}
          >
            <RotateCcw size={13} />
            Replay
          </button>
          <ExportButton ingestionId={activeIngestion?.id || selectedSessionId} />
        </div>
      </div>

      {/* Host Meta Banner */}
      {currentSession && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border p-3.5 font-mono text-xs text-[var(--color-text-secondary)]" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel-raised)" }}>
          <div>
            <span className="text-[var(--color-text-muted)]">HOST IP: </span>
            <span className="text-[var(--color-accent)]">{currentSession.host_ip}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">TARGET IP: </span>
            <span className="text-[var(--color-text-primary)]">{currentSession.target_ip}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">SERVICE: </span>
            <span className="text-[var(--color-text-primary)]">{currentSession.target_service}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">GROUND TRUTH: </span>
            <span className="text-[var(--color-elevated)]">{currentSession.ground_truth_label}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Forecast Timeline & Side Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          {/* Timeline Chart */}
          <div
            className={`relative h-84 rounded-xl border p-4 ${isCritical ? "critical-edge-glow" : ""}`}
            style={{
              borderColor: isCritical ? "var(--color-critical)" : "var(--color-border)",
              backgroundColor: "var(--color-panel)",
              boxShadow: isCritical ? "0 0 24px -6px var(--color-critical)" : "none",
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs tracking-wider text-[var(--color-text-secondary)]">
                THREAT INFILTRATION PROBABILITY P(Attack) &amp; K-STEP FORWARD ROLLOUT
              </span>
              <span className="font-mono text-xs text-[var(--color-accent)]">
                {isCritical ? "CRITICAL RISK ELEVATION" : "NORMAL DYNAMICS"}
              </span>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center text-xs text-[var(--color-text-muted)]">
                Loading live state-space trajectory...
              </div>
            ) : (
              <ProbabilityTimeline
                data={timeline}
                onPointClick={setSelectedPoint}
                selectedPredictionId={selectedPoint?.predictionId}
              />
            )}
          </div>

          {/* K-Step Horizon Projection */}
          {!loading && projectedPoints.length > 0 && (
            <KStepProjection
              projectedPoints={projectedPoints}
              onSelect={setSelectedPoint}
              selectedPredictionId={selectedPoint?.predictionId}
            />
          )}

          {/* Counterfactual Mitigation & Safety Shield Simulator */}
          <div className="rounded-xl border p-5 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2">
                <Shield className="text-[var(--color-accent)]" size={18} />
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Counterfactual Mitigation Engine &amp; Safety Shield
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-[var(--color-text-muted)]">SAFETY SHIELD DECISION:</span>
                <span className="rounded bg-[var(--color-normal)]/20 px-2 py-0.5 font-bold text-[var(--color-normal)] border border-[var(--color-normal)]/40">
                  {mitigationData?.safety_shield_recommendation || "RESET_CONNECTIONS"}
                </span>
              </div>
            </div>

            <p className="mb-4 text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Select a defensive intervention operator T(S_t, a) to simulate forward trajectory divergence and evaluate risk reduction vs. operational disruption cost.
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5 mb-4">
              {mitigationData?.actions.map((act) => {
                const isSelected = selectedAction === act.action;
                return (
                  <button
                    key={act.action}
                    onClick={() => setSelectedAction(act.action)}
                    className={`flex flex-col items-start justify-between rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-lg"
                        : "border-[var(--color-border)] bg-[var(--color-base)] hover:border-[var(--color-text-muted)]"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-[var(--color-text-primary)]">{act.action}</span>
                      {act.is_recommended && <ShieldCheck size={14} className="text-[var(--color-normal)]" />}
                      {act.is_blocked_by_guardrail && <AlertTriangle size={14} className="text-[var(--color-critical)]" />}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--color-text-muted)]">
                      Cost: {act.operational_cost.toFixed(2)} | Red: -{(act.forecast_risk_reduction * 100).toFixed(0)}%
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Action Analysis */}
            {activeMitigation && (
              <div className="rounded-lg border p-4 bg-[var(--color-panel-raised)]" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-[var(--color-accent)]">
                    {activeMitigation.action}: {activeMitigation.description}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-[var(--color-text-muted)]">
                      RISK REDUCTION: <strong className="text-[var(--color-normal)]">-{(activeMitigation.forecast_risk_reduction * 100).toFixed(1)}%</strong>
                    </span>
                    <span className="text-[var(--color-text-muted)]">
                      COST: <strong className="text-[var(--color-elevated)]">{activeMitigation.operational_cost.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>

                {activeMitigation.is_blocked_by_guardrail && activeMitigation.guardrail_reason && (
                  <div className="mt-2 flex items-center gap-2 rounded border border-[var(--color-critical)]/40 bg-[var(--color-critical)]/10 p-2 text-xs text-[var(--color-critical)] font-mono">
                    <AlertTriangle size={14} />
                    <span>{activeMitigation.guardrail_reason}</span>
                  </div>
                )}

                {/* Counterfactual trajectory comparison */}
                <div className="mt-3 flex items-center gap-4 text-xs font-mono">
                  <span className="text-[var(--color-text-muted)]">Mitigated K-Step Trajectory:</span>
                  <div className="flex gap-2">
                    {activeMitigation.counterfactual_trajectory.map((p, idx) => (
                      <span
                        key={idx}
                        className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                          p < 0.3
                            ? "bg-[var(--color-normal)]/20 text-[var(--color-normal)]"
                            : p < 0.7
                            ? "bg-[var(--color-watch)]/20 text-[var(--color-watch)]"
                            : "bg-[var(--color-critical)]/20 text-[var(--color-critical)]"
                        }`}
                      >
                        T+{idx + 1}: {(p * 100).toFixed(0)}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Flagged Flows & Explainability */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border p-4 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
            <FlaggedFlowsList
              flows={flows}
              filter={severityFilter}
              onFilterChange={setSeverityFilter}
            />
          </div>
        </div>
      </div>

      {/* Slide-in Explainability Drawer */}
      <ExplainabilityPanel point={selectedPoint} onClose={() => setSelectedPoint(null)} />
    </div>
  );
}
