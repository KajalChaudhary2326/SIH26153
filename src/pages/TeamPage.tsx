import { motion } from "framer-motion";

const members = [
  { name: "Team Member Name", role: "ML Lead" },
  { name: "Team Member Name", role: "Threat Intelligence Analyst" },
  { name: "Team Member Name", role: "Systems & Infrastructure" },
  { name: "Team Member Name", role: "Explainability & Visualization" },
];

export function TeamPage() {
  return (
    <div className="mx-auto max-w-5xl pb-10">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">Sentinel Team</h1>
        <p className="mt-3 text-base text-[var(--color-text-secondary)]">
          AI-driven defense for early-stage cyber threats and network risk forecasting.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mt-8 rounded-2xl border p-6 glow-box"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
      >
        <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Problem statement</div>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">SIH26153</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          AI-Based Network Attack Forecasting from Network Traffic Data — a solution designed for
          the NTRO, Blockchain & Cybersecurity theme, focused on catching malicious trajectory
          evolution before it becomes a full-scale intrusion.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {members.map((member, idx) => (
          <div
            key={`${member.name}-${idx}`}
            className="rounded-2xl border p-5 text-center glow-box"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border text-lg font-semibold text-[var(--color-text-primary)]" style={{ borderColor: "var(--color-border)", backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)" }}>
              {member.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
            </div>
            <h3 className="mt-4 text-base font-semibold text-[var(--color-text-primary)]">{member.name}</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{member.role}</p>
          </div>
        ))}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mt-10"
      >
        <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Links</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="https://github.com/" target="_blank" rel="noreferrer" className="rounded-md border px-4 py-2 text-sm text-[var(--color-text-primary)]" style={{ borderColor: "var(--color-border)" }}>
            GitHub repo
          </a>
          <a href="#" className="rounded-md border px-4 py-2 text-sm text-[var(--color-text-primary)]" style={{ borderColor: "var(--color-border)" }}>
            Demo video — TODO
          </a>
        </div>
      </motion.section>
    </div>
  );
}
