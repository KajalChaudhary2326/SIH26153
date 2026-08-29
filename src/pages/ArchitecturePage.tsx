import { motion } from "framer-motion";
import { ArrowRight, Database, BrainCircuit, Route, ShieldCheck, Eye, LayoutDashboard } from "lucide-react";
import { PipelineDiagram } from "../components/PipelineDiagram";

const stages = [
  ["01", "Ingestion", "CSV / PCAP telemetry enters the local pipeline.", Database],
  ["02", "Feature Extraction", "Flow-level and packet-level signals are prepared.", Route],
  ["03", "World Model", "Temporal state transitions are learned.", BrainCircuit],
  ["04", "K-Step Rollout", "The model projects the next network states.", ArrowRight],
  ["05", "MITRE Mapping", "Forecast risk is translated into attack stages.", ShieldCheck],
  ["06", "Explainability", "Feature drivers make each forecast inspectable.", Eye],
  ["07", "Dashboard", "Operators see trajectory, risk, and context.", LayoutDashboard],
] as const;

export function ArchitecturePage() {
  return (
    <div className="w-full pb-14">
      <motion.section initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} className="mb-8 flex flex-col justify-between gap-6 rounded-3xl border p-7 sm:p-10 lg:flex-row lg:items-end" style={{borderColor:"var(--color-border)",background:"linear-gradient(135deg, var(--color-panel), color-mix(in srgb, var(--color-accent) 6%, var(--color-panel))"}}>
        <div className="max-w-4xl"><div className="mb-3 text-xs font-mono uppercase tracking-[.22em] text-cyan-300">System architecture / SIH26153</div><h1 className="text-4xl font-bold sm:text-5xl">From raw telemetry to an explainable forecast.</h1><p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">Seven stages, one local pipeline. Sentinel models network state transitions, rolls them forward, maps the forecast to MITRE stages, and surfaces the reasoning in the dashboard.</p></div><div className="shrink-0 rounded-2xl border px-5 py-4" style={{borderColor:"color-mix(in srgb, var(--color-accent) 35%, var(--color-border))",backgroundColor:"color-mix(in srgb, var(--color-accent) 8%, transparent)"}}><div className="text-xs text-[var(--color-text-muted)]">DEPLOYMENT</div><div className="mt-1 font-semibold text-cyan-300">Offline / Local</div></div>
      </motion.section>

      <section className="glow-box rounded-3xl border p-4 sm:p-6" style={{borderColor:"var(--color-border)",backgroundColor:"var(--color-panel)"}}><div className="mb-5 flex items-center justify-between"><div><div className="text-xs font-mono uppercase tracking-[.2em] text-cyan-300">Pipeline</div><h2 className="mt-1 text-xl font-semibold">Temporal forecasting flow</h2></div><div className="text-xs text-[var(--color-text-muted)]">7 stages</div></div><PipelineDiagram /></section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stages.map(([num,title,text,Icon],i)=><motion.article key={title} initial={{opacity:0,y:15}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.04}} className="glow-box rounded-2xl border p-5" style={{borderColor:"var(--color-border)",backgroundColor:"var(--color-panel)"}}><div className="flex items-center justify-between"><span className="font-mono text-[10px] tracking-[.2em] text-[var(--color-text-muted)]">{num}</span><Icon size={17} className="text-cyan-300"/></div><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{text}</p></motion.article>)}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="glow-box rounded-2xl border p-7" style={{borderColor:"var(--color-border)",backgroundColor:"var(--color-panel)"}}><h2 className="text-xl font-semibold">State, not signatures</h2><p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">The model doesn't score individual flows against known attack signatures. It learns how network state evolves window to window, then rolls that model forward to see where the current trajectory is heading.</p></article>
        <article className="glow-box rounded-2xl border p-7" style={{borderColor:"var(--color-border)",backgroundColor:"var(--color-panel)"}}><h2 className="text-xl font-semibold">Critical information infrastructure</h2><p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">Power grid and banking networks share a constraint enterprise IT doesn't always have: by the time a known-signature alert fires, lateral movement may already be complete. Forecasting the next state buys defenders time to act.</p></article>
      </section>
    </div>
  );
}
