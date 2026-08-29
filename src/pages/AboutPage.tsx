import { motion } from "framer-motion";
import { BrainCircuit, Database, Eye, Gauge, Layers3, ShieldCheck, Workflow } from "lucide-react";

const techStack = ["React + Vite", "TypeScript", "Framer Motion", "Recharts", "Zustand", "Threat Intelligence"];
const pillars = [
  { icon: BrainCircuit, title: "Temporal World Model", text: "Learns how network state evolves over time instead of treating every flow as an isolated event." },
  { icon: Workflow, title: "K-Step Forecasting", text: "Rolls the transition model forward to expose the trajectory before the next stage fully materializes." },
  { icon: Eye, title: "Explainable by design", text: "Forecasts are paired with feature drivers and MITRE stage context so analysts can understand the signal." },
];

export function AboutPage() {
  return (
    <div className="w-full pb-14">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }} className="relative overflow-hidden rounded-3xl border p-7 sm:p-10 lg:p-14 glow-box" style={{ borderColor: "var(--color-border)", background: "linear-gradient(135deg, color-mix(in srgb, var(--color-panel) 96%, transparent), color-mix(in srgb, var(--color-accent) 7%, var(--color-panel)))" }}>
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.22em] text-cyan-300" style={{ borderColor: "color-mix(in srgb, var(--color-accent) 35%, var(--color-border))" }}><ShieldCheck size={13}/> Sentinel / About</div>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">See the attack trajectory,<br/><span className="text-cyan-300">not just the alert.</span></h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg">Traditional intrusion detection often classifies each flow in isolation. Sentinel focuses on the transition between network states: scan, pivot, command-and-control, and data theft become a trajectory that can be forecast before the next state arrives.</p>
        </div>
      </motion.section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {pillars.map(({ icon: Icon, title, text }, i) => <motion.article key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i*.06 }} className="glow-box rounded-2xl border p-6" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><Icon size={20}/></div><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{text}</p></motion.article>)}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="glow-box rounded-2xl border p-7" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[.2em] text-cyan-300"><Database size={15}/> State transition model</div>
          <div className="mt-6 rounded-2xl border p-6" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-base)" }}><div className="font-mono text-2xl text-cyan-200">P(S<tspan style={{fontSize:11}}>t+1</tspan> | S<tspan style={{fontSize:11}}>t</tspan>)</div><p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">The model estimates how network state evolves from one time window to the next. Rolling that probability forward reveals whether the current trajectory is moving toward a higher-risk stage.</p></div>
        </div>
        <div className="glow-box rounded-2xl border p-7" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[.2em] text-cyan-300"><Gauge size={15}/> K-step rollout</div>
          <div className="mt-5 space-y-3">{[["t","Current state"],["t+1","Next risk estimate"],["t+K","Forecasted trajectory"]].map(([a,b],i)=><div key={a} className="flex items-center justify-between rounded-xl border px-4 py-3" style={{borderColor:"var(--color-border)",backgroundColor:i===0?"color-mix(in srgb, var(--color-accent) 12%, transparent)":"transparent"}}><span className="font-mono text-xs text-cyan-300">{a}</span><span className="text-sm">{b}</span></div>)}</div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        {[{title:"Flow + packet intelligence",text:"Volumetric attacks can appear in repeated bursts, destination fan-out, or port sweeps. Stealthier behavior can emerge through inter-arrival timing, TTL variance, retransmissions, and duration shifts. Sentinel combines both perspectives."},{title:"Built for critical infrastructure",text:"Power grid, banking, telecom, and industrial systems need early warning. Forecasting the next state gives operators more lead time to isolate, contain, and validate a threat before compromise."}].map(({title,text})=><article key={title} className="glow-box rounded-2xl border p-7" style={{borderColor:"var(--color-border)",backgroundColor:"var(--color-panel)"}}><div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300"><Layers3 size={17}/></div><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{text}</p></article>)}
      </section>

      <section className="mt-10"><div className="mb-4 text-xs font-mono uppercase tracking-[.22em] text-[var(--color-text-muted)]">Technology stack</div><div className="flex flex-wrap gap-3">{techStack.map(item=><span key={item} className="glow-box rounded-full border px-4 py-2 text-xs font-medium text-[var(--color-text-primary)]" style={{borderColor:"var(--color-border)",backgroundColor:"var(--color-panel)"}}>{item}</span>)}</div></section>
    </div>
  );
}
