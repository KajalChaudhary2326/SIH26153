import { useEffect, useState } from "react";
import { getBaselineComparison } from "../data/api";
import { BaselineComparisonChart } from "../components/BaselineComparisonChart";
import { MetricCard } from "../components/MetricCard";
import type { ModelRun } from "../data/types";

export function ComparePage() {
  const [runs, setRuns] = useState<ModelRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBaselineComparison().then((data) => {
      setRuns(data);
      setLoading(false);
    });
  }, []);

  const worldModel = runs.find((r) => r.modelType === "lstm" || r.modelType === "transformer" || r.modelType === "gnn");
  const baseline = runs.find((r) => r.modelType === "baseline_lr");

  const f1Delta =
    worldModel && baseline
      ? (((worldModel.f1Score - baseline.f1Score) / baseline.f1Score) * 100).toFixed(1)
      : null;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Baseline comparison
        </h1>
        <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
          World Model temporal-dynamics learning against a Logistic Regression classifier
          trained on the same feature set.
        </p>
      </div>

      {loading ? (
        <p className="text-xs text-[var(--color-text-muted)]">Loading metrics…</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard
              label="World Model F1"
              value={worldModel ? worldModel.f1Score.toFixed(3) : "—"}
              accent="var(--color-accent)"
            />
            <MetricCard
              label="Baseline F1"
              value={baseline ? baseline.f1Score.toFixed(3) : "—"}
            />
            <MetricCard
              label="Relative F1 gain"
              value={f1Delta ? `+${f1Delta}%` : "—"}
              deltaPositive
            />
            <MetricCard
              label="World Model FPR"
              value={worldModel ? `${(worldModel.falsePositiveRate * 100).toFixed(1)}%` : "—"}
              accent="var(--color-normal)"
            />
          </div>

          <div
            className="rounded-xl border p-5 glow-box"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
          >
            <BaselineComparisonChart runs={runs} />
          </div>

          <div
            className="mt-6 rounded-xl border p-5 glow-box"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
          >
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Why the World Model wins
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              The baseline treats each flow as an isolated benign/malicious label. It has no
              way to represent the order in which ports are probed, or the timing between
              reconnaissance packets. The World Model learns transition dynamics across
              time-windowed state — {f1Delta ? `a ${f1Delta}% relative F1 improvement` : "a measurable F1 improvement"}{" "}
              driven mainly by catching slow, multi-step infiltration patterns the baseline
              scores as a sequence of independent, low-risk flows.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
