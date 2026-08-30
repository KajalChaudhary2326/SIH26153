import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MITREStageBadge } from "../components/MITREStageBadge";
import { ProbabilityTimeline } from "../components/ProbabilityTimeline";
import { MetricCard } from "../components/MetricCard";
import { CoreCapabilitiesSection } from "../components/CoreCapabilitiesSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { getTimeline } from "../data/api";
import type { TimelinePoint } from "../data/types";

export function HomePage() {
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);

  useEffect(() => {
    getTimeline("ing_sample_cicids2018").then(setTimeline);
  }, []);

  const latestPoint = useMemo(
    () => [...timeline].filter((p) => !p.isProjection).slice(-1)[0] ?? null,
    [timeline]
  );

  return (
    <div className="w-full pb-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid items-center gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16"
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]" style={{ borderColor: "var(--color-border)" }}>
            ShieldNet · NTRO
          </div>

          <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
            Forecasting network attacks before they happen, using World Models
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            SHIELDNET reads temporal network behavior, projects the next K windows, and explains
            why a trajectory is accelerating toward lateral movement, C2, or exfiltration.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90"
            >
              View Live Demo
              <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent)]"
              style={{ borderColor: "var(--color-border)" }}
            >
              How It Works
            </a>
          </div>
        </div>

        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 24 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl border p-4 shadow-2xl glow-box forecast-chart-card"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-primary)]">Threat model</div>
              <div className="mt-1 text-base font-medium text-[var(--color-text-primary)]">Live forecast preview</div>
            </div>
            {latestPoint && <MITREStageBadge stage={latestPoint.predictedMitreStage} size="lg" />}
          </div>

          <div className="h-56 w-full rounded-xl border p-3 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-base)" }}>
            {timeline.length > 0 ? (
              <ProbabilityTimeline data={timeline.slice(-16)} />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-muted)]">
                Loading trajectory…
              </div>
            )}
          </div>
        </motion.div>
      </motion.section>

      <section className="grid gap-4 py-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Inference latency" value="< 1s" accent="var(--color-accent)" />
        <MetricCard label="MITRE stages" value="5" accent="var(--color-normal)" />
        <MetricCard label="Feature tiers" value="2" accent="var(--color-elevated)" />
        <MetricCard label="Explainability" value="100%" accent="var(--color-watch)" />
      </section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mt-16"
      >
        <CoreCapabilitiesSection />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mt-16"
      >
        <HowItWorksSection />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mt-16 rounded-2xl border p-8 text-center glow-box"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
      >
        <h2 className="text-3xl font-semibold text-[var(--color-text-primary)]">Ready to see the forecast in motion?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--color-text-secondary)]">
          Explore the live dashboard, inspect flagged flows, and watch the model project risk before the next stage begins.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90"
        >
          Launch dashboard
          <ArrowRight size={16} />
        </Link>
      </motion.section>
    </div>
  );
}

