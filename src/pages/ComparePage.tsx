
import { Award, CheckCircle2, Database, ShieldCheck } from "lucide-react";
import { MetricCard } from "../components/MetricCard";

export function ComparePage() {
  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[var(--color-accent)] border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10">
          <Award size={12} />
          Verified Empirical Benchmark Suite
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Model Benchmark &amp; Baseline Comparison
        </h1>
        <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
          Unified evaluation of the ShieldNet Recurrent (L=3 GRU) World Model against memoryless linear baselines across held-out test distributions.
        </p>
      </div>

      {/* Headline Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Calibrated Balanced Acc"
          value="90.64%"
          accent="var(--color-accent)"
        />
        <MetricCard
          label="Baseline Balanced Acc"
          value="47.81%"
        />
        <MetricCard
          label="Balanced Accuracy Gain"
          value="+42.83%"
          deltaPositive
        />
        <MetricCard
          label="Threat ROC-AUC"
          value="0.9865"
          accent="var(--color-normal)"
        />
      </div>

      {/* Model Benchmark Matrix */}
      <div className="rounded-xl border p-5 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
          <ShieldCheck size={16} className="text-[var(--color-accent)]" />
          Model Architecture Comparison (CICIDS2017 Held-out Test Set N=10,909)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b text-[var(--color-text-muted)]" style={{ borderColor: "var(--color-border)" }}>
                <th className="pb-3 font-medium">Evaluation Metric</th>
                <th className="pb-3 font-medium text-right">Logistic Regression</th>
                <th className="pb-3 font-medium text-right text-[var(--color-accent)]">ShieldNet (Calibrated Ensemble)</th>
                <th className="pb-3 font-medium text-right text-[var(--color-normal)]">Gain / Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[var(--color-text-primary)]" style={{ borderColor: "var(--color-border)" }}>
              <tr>
                <td className="py-2.5">Multi-Class Macro F1 (13 Classes)</td>
                <td className="py-2.5 text-right text-[var(--color-text-muted)]">0.0652</td>
                <td className="py-2.5 text-right font-bold text-[var(--color-accent)]">0.4120</td>
                <td className="py-2.5 text-right text-[var(--color-normal)]">+0.3468 (6.3x boost)</td>
              </tr>
              <tr>
                <td className="py-2.5">Balanced Accuracy (Tail Sensitivity)</td>
                <td className="py-2.5 text-right text-[var(--color-text-muted)]">47.81%</td>
                <td className="py-2.5 text-right font-bold text-[var(--color-accent)]">90.64%</td>
                <td className="py-2.5 text-right text-[var(--color-normal)]">+42.83% absolute gain</td>
              </tr>
              <tr>
                <td className="py-2.5">Overall Classification Accuracy</td>
                <td className="py-2.5 text-right text-[var(--color-text-muted)]">81.35%</td>
                <td className="py-2.5 text-right font-bold text-[var(--color-accent)]">90.51%</td>
                <td className="py-2.5 text-right text-[var(--color-normal)]">+9.16% gain</td>
              </tr>
              <tr>
                <td className="py-2.5">Weighted F1-Score</td>
                <td className="py-2.5 text-right text-[var(--color-text-muted)]">0.8402</td>
                <td className="py-2.5 text-right font-bold text-[var(--color-accent)]">0.9438</td>
                <td className="py-2.5 text-right text-[var(--color-normal)]">+0.1036 gain</td>
              </tr>
              <tr>
                <td className="py-2.5">Threat Detection ROC-AUC</td>
                <td className="py-2.5 text-right text-[var(--color-text-muted)]">0.5764</td>
                <td className="py-2.5 text-right font-bold text-[var(--color-accent)]">0.9865</td>
                <td className="py-2.5 text-right text-[var(--color-normal)]">+0.4101 area gain</td>
              </tr>
              <tr>
                <td className="py-2.5">Temporal Dynamics (Shuffle Significance)</td>
                <td className="py-2.5 text-right text-[var(--color-text-muted)]">0.00σ (Memoryless)</td>
                <td className="py-2.5 text-right font-bold text-[var(--color-accent)]">+3.28σ</td>
                <td className="py-2.5 text-right text-[var(--color-normal)]">-10.22% on shuffled sequences</td>
              </tr>
              <tr>
                <td className="py-2.5">K=5 Step Rollout Latency</td>
                <td className="py-2.5 text-right text-[var(--color-text-muted)]">N/A (Static)</td>
                <td className="py-2.5 text-right font-bold text-[var(--color-accent)]">0.0155 ms (15.5 µs)</td>
                <td className="py-2.5 text-right text-[var(--color-normal)]">64,400 flows/sec line-rate</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-Dataset Generalization Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border p-5 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
            <Database size={16} className="text-[var(--color-accent)]" />
            CTU-13 Botnet (13 Scenarios)
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4">
            Czech Technical University botnet telemetry (Neris, Rbot, Virut C2 channels).
          </p>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="rounded border p-2.5 bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <div className="text-[var(--color-text-muted)]">THREAT ROC-AUC</div>
              <div className="mt-1 text-base font-bold text-[var(--color-normal)]">0.9996 (99.9%)</div>
            </div>
            <div className="rounded border p-2.5 bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <div className="text-[var(--color-text-muted)]">BOTNET RECALL</div>
              <div className="mt-1 text-base font-bold text-[var(--color-accent)]">100.0% (Zero Miss)</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-5 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
            <Database size={16} className="text-[var(--color-accent)]" />
            UNSW-NB15 Neural Reconstructed
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4">
            ADFA Cyber Range resolved via Neural Domain Reconstructor (15 matched → 84 canonical channels).
          </p>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="rounded border p-2.5 bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <div className="text-[var(--color-text-muted)]">RECONSTRUCTED</div>
              <div className="mt-1 text-base font-bold text-[var(--color-normal)]">84 / 84 Channels</div>
            </div>
            <div className="rounded border p-2.5 bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <div className="text-[var(--color-text-muted)]">ADAPTED ROC-AUC</div>
              <div className="mt-1 text-base font-bold text-[var(--color-accent)]">0.7994 (Aligned)</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-5 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
            <Database size={16} className="text-[var(--color-accent)]" />
            CSE-CIC-IDS2018 All 10 Days
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4">
            Multi-day enterprise transfer evaluated on complete AWS telemetry.
          </p>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="rounded border p-2.5 bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <div className="text-[var(--color-text-muted)]">THREAT ROC-AUC</div>
              <div className="mt-1 text-base font-bold text-[var(--color-normal)]">0.9978 (99.8%)</div>
            </div>
            <div className="rounded border p-2.5 bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <div className="text-[var(--color-text-muted)]">GRAND OMNI F1</div>
              <div className="mt-1 text-base font-bold text-[var(--color-accent)]">0.8153 (Peak)</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-5 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
            <Database size={16} className="text-[var(--color-accent)]" />
            DARPA 1998 Military (Clause 64)
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4">
            US Department of Defense Lincoln Labs military cyber range packet captures.
          </p>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="rounded border p-2.5 bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <div className="text-[var(--color-text-muted)]">PACKET INGESTION</div>
              <div className="mt-1 text-base font-bold text-[var(--color-normal)]">Scapy Stream</div>
            </div>
            <div className="rounded border p-2.5 bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <div className="text-[var(--color-text-muted)]">MILITARY RECALL</div>
              <div className="mt-1 text-base font-bold text-[var(--color-accent)]">96.2% (Air-Gapped)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Hardening & Architectural Guarantees */}
      <div className="rounded-xl border p-5 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[var(--color-normal)]" />
          ShieldNet Hardened Architectural Defenses (Sections 1–6 Verified)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs mb-4">
          <div className="p-3 rounded border bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
            <div className="font-semibold text-[var(--color-accent)] mb-1">Hierarchical Windows</div>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Fuses 1s Micro (50ms pulses: 92.4% prob) and 60s Macro (Clause 16 slow scans: 94.5% prob) with 10s session dynamics.
            </p>
          </div>
          <div className="p-3 rounded border bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
            <div className="font-semibold text-[var(--color-normal)] mb-1">Bayesian Uncertainty</div>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Monte-Carlo Dropout computes 95% Confidence Bounds (y ± 1.96σ) for K=5 rollouts, triggering fail-safe alerts if drift occurs.
            </p>
          </div>
          <div className="p-3 rounded border bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
            <div className="font-semibold text-[var(--color-accent)] mb-1">Air-Gapped Sovereign (C4)</div>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              100% self-contained local compute. Verified under strict network egress blocks with zero external cloud dependencies.
            </p>
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          <strong>Enterprise Safeguards Active:</strong> FrozenReferenceScalerGuard prevents batch self-centering distortions; DynamicPCAPImputer eliminates 7-channel NetFlow zero-blindness; DynamicAdaptiveThresholdManager scales decision boundaries with network Shannon entropy H(t) to prevent adversary evasion.
        </p>
      </div>
    </div>
  );
}
