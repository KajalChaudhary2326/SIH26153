import { useEffect, useState } from "react";
import { RotateCcw, Activity, FileText } from "lucide-react";
import { ProbabilityTimeline } from "../components/ProbabilityTimeline";
import { KStepProjection } from "../components/KStepProjection";
import { FlaggedFlowsList } from "../components/FlaggedFlowsList";
import { MITREStageBadge } from "../components/MITREStageBadge";
import { ExplainabilityPanel } from "../components/ExplainabilityPanel";
import { ExportButton } from "../components/ExportButton";
import { TelemetryHeader } from "../components/TelemetryHeader";
import { ActiveIngestionBanner } from "../components/ActiveIngestionBanner";
import { MitreLifecycleTimeline } from "../components/MitreLifecycleTimeline";
import { DefenseSandboxPanel } from "../components/DefenseSandboxPanel";
import { IncidentDossierModal } from "../components/IncidentDossierModal";
import {
  getTimeline,
  getFlaggedFlows,
  getSampleSessions,
  evaluateMitigationActions,
  getMitreReasoning,
  type ScenarioSession,
  type MitigationResponse,
  type MitreReasoningResponse,
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

  // Counterfactual Mitigation & Symbolic MITRE state
  const [mitigationData, setMitigationData] = useState<MitigationResponse | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>("RESET_CONNECTIONS");
  const [mitreReasoning, setMitreReasoning] = useState<MitreReasoningResponse | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

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

    const currentSess = sessions.find((s) => s.id === sessId);

    Promise.all([
      getTimeline(sessId),
      getFlaggedFlows(),
      evaluateMitigationActions(sessId),
      getMitreReasoning({
        predicted_class: currentSess?.ground_truth_label || "SSH-Patator",
        confidence: currentSess ? currentSess.threat_trajectory.slice(-1)[0] : 0.98,
        host_ip: currentSess?.host_ip || "172.16.0.1",
        target_ip: currentSess?.target_ip || "192.168.10.50",
      }),
    ]).then(([tl, fl, mit, reason]) => {
      setTimeline(tl);
      setFlows(fl);
      setMitigationData(mit);
      setSelectedAction(mit.safety_shield_recommendation || "RESET_CONNECTIONS");
      setMitreReasoning(reason);
      setLoading(false);
    });
  }, [activeIngestion?.id, selectedSessionId, replayKey, sessions]);

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

  return (
    <div className="flex flex-col gap-6">
      {/* Sovereign Telemetry Header */}
      <TelemetryHeader />

      {/* Active Ingested File Banner */}
      <ActiveIngestionBanner
        ingestion={activeIngestion}
        scenarioName={currentSession?.name}
        hostIp={currentSession?.host_ip}
        targetIp={currentSession?.target_ip}
      />

      {/* Top Header & Scenario Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--color-text-secondary)]">
            <Activity size={14} className="text-[var(--color-accent)]" />
            <span>SCENARIO PRESET:</span>
          </div>
          <select
            value={activeIngestion?.id || selectedSessionId}
            onChange={(e) => handleSessionChange(e.target.value)}
            className="rounded-md border bg-[var(--color-base)] px-3 py-1.5 font-mono text-xs text-[var(--color-text-primary)] transition-colors focus:border-[var(--color-accent)] focus:outline-none"
            style={{ 
              borderColor: "var(--color-border)"
            }}
          >
            {activeIngestion && (
              <option value={activeIngestion.id}>
                📁 [INGESTED FILE] {activeIngestion.filename} ({activeIngestion.sourceType.toUpperCase()})
              </option>
            )}
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
            onClick={() => setIsDossierOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-md hover:scale-105"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            <FileText size={13} />
            <span>Sovereign Dossier</span>
          </button>
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
            <span className="text-[var(--color-text-muted)]">ACTIVE FILE: </span>
            <span className="text-emerald-400 font-bold truncate">{activeIngestion?.filename || currentSession.name}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">ADVERSARY HOST: </span>
            <span className="text-[var(--color-accent)]">{currentSession.host_ip}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">TARGET CII ASSET: </span>
            <span className="text-[var(--color-text-primary)]">{currentSession.target_ip}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">GROUND TRUTH: </span>
            <span className="text-[var(--color-elevated)]">{currentSession.ground_truth_label}</span>
          </div>
        </div>
      )}

      {/* Symbolic MITRE ATT&CK Lifecycle Timeline */}
      <MitreLifecycleTimeline
        reasoning={mitreReasoning}
        currentStage={currentSession?.mitre_stage || 2}
      />

      {/* Main Grid: Forecast Timeline & Side Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          {/* Timeline Chart */}
          <div
            className="relative h-84 rounded-xl border p-4"
            style={{
              borderColor: isCritical ? "var(--color-critical)" : "var(--color-border)",
              backgroundColor: "var(--color-panel)",
              boxShadow: isCritical ? "0 0 18px -8px var(--color-critical)" : "none",
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

          {/* Interactive What-If Counterfactual Sandbox Panel */}
          <DefenseSandboxPanel
            mitigationData={mitigationData}
            selectedAction={selectedAction}
            onSelectAction={setSelectedAction}
            onOpenDossier={() => setIsDossierOpen(true)}
          />
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

      {/* 1-Click Sovereign Incident Dossier Modal */}
      <IncidentDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        scenarioName={currentSession?.name || "SSH / FTP Brute Force"}
        hostIp={currentSession?.host_ip || "172.16.0.1"}
        targetIp={currentSession?.target_ip || "192.168.10.50"}
        predictedClass={currentSession?.ground_truth_label || "SSH-Patator"}
        confidence={currentSession?.threat_trajectory ? currentSession.threat_trajectory.slice(-1)[0] : 0.98}
      />
    </div>
  );
}
