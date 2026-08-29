import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Info } from "lucide-react";
import { ProbabilityTimeline } from "../components/ProbabilityTimeline";
import { KStepProjection } from "../components/KStepProjection";
import { FlaggedFlowsList } from "../components/FlaggedFlowsList";
import { MITREStageBadge } from "../components/MITREStageBadge";
import { ExplainabilityPanel } from "../components/ExplainabilityPanel";
import { ExportButton } from "../components/ExportButton";
import { getTimeline, getFlaggedFlows } from "../data/api";
import { useAppStore } from "../store/useAppStore";
import type { FlaggedFlow, Severity, TimelinePoint } from "../data/types";

export function SimulationPage() {
  const navigate = useNavigate();
  const activeIngestion = useAppStore((s) => s.activeIngestion);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [flows, setFlows] = useState<FlaggedFlow[]>([]);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [selectedPoint, setSelectedPoint] = useState<TimelinePoint | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeIngestion) {
      navigate("/");
      return;
    }
    setLoading(true);
    Promise.all([getTimeline(activeIngestion.id), getFlaggedFlows()]).then(([tl, fl]) => {
      setTimeline(tl);
      setFlows(fl);
      setLoading(false);
    });
  }, [activeIngestion, navigate, replayKey]);

  if (!activeIngestion) return null;

  const latestObserved = [...timeline].filter((p) => !p.isProjection).slice(-1)[0];
  const projectedPoints = timeline.filter((p) => p.isProjection);
  const isCritical = (latestObserved?.infiltrationProbability ?? 0) >= 0.8 ||
    projectedPoints.some((p) => p.infiltrationProbability >= 0.8);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Live simulation
            </h1>
            {latestObserved && <MITREStageBadge stage={latestObserved.predictedMitreStage} size="lg" />}
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <Info size={12} />
            Replaying sample capture <span className="font-mono">{activeIngestion.filename}</span> —
            not a live packet feed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReplayKey((k) => k + 1)}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--color-panel-raised)]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
          >
            <RotateCcw size={13} />
            Replay
          </button>
          <ExportButton ingestionId={activeIngestion.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div
            className={`relative h-80 rounded-xl border p-4 ${isCritical ? "critical-edge-glow" : ""}`}
            style={{
              borderColor: isCritical ? "var(--color-critical)" : "var(--color-border)",
              backgroundColor: "var(--color-panel)",
              boxShadow: isCritical ? "0 0 24px -6px var(--color-critical)" : "none",
            }}
          >
            {loading ? (
              <ChartSkeleton />
            ) : (
              <ProbabilityTimeline
                data={timeline}
                onPointClick={setSelectedPoint}
                selectedPredictionId={selectedPoint?.predictionId}
              />
            )}
          </div>

          {!loading && projectedPoints.length > 0 && (
            <KStepProjection
              projectedPoints={projectedPoints}
              onSelect={setSelectedPoint}
              selectedPredictionId={selectedPoint?.predictionId}
            />
          )}
        </div>

        <div className="h-[520px] lg:h-auto">
          <FlaggedFlowsList
            flows={flows}
            filter={severityFilter}
            onFilterChange={setSeverityFilter}
          />
        </div>
      </div>

      <ExplainabilityPanel point={selectedPoint} onClose={() => setSelectedPoint(null)} />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <span className="font-mono text-xs text-[var(--color-text-muted)]">Loading timeline…</span>
    </div>
  );
}
