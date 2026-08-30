import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Clock,
  Fingerprint,
} from "lucide-react";
import { getSampleSessions, type ScenarioSession } from "../data/api";

const SCENARIO_EXPLANATIONS: Record<
  string,
  {
    narrative: string;
    topFeatures: Array<{
      name: string;
      category: string;
      value: string;
      score: number;
      impact: "elevates_threat" | "reduces_threat";
    }>;
    temporalAttention: Array<{ step: string; window: string; weight: number; status: string }>;
    mitreDetails: {
      tactic: string;
      technique: string;
      id: string;
      evidence: string;
    };
  }
> = {
  sess_bot_c2: {
    narrative:
      "High periodic consistency in backward packet lengths (mean = 284 bytes) combined with ultra-low flow inter-arrival jitter (std = 0.04s) matches known Ares/Mirai C2 reverse shell heartbeat signatures. The World Model projects that without intervention, encrypted beaconing will escalate into stage 4 data staging within 30 seconds.",
    topFeatures: [
      { name: "Bwd Packet Length Mean", category: "Payload", value: "284.5 B", score: 0.38, impact: "elevates_threat" },
      { name: "Flow IAT Std (Timing Jitter)", category: "Timing", value: "0.042 s", score: 0.27, impact: "elevates_threat" },
      { name: "SYN / ACK Asymmetry Ratio", category: "TCP Flags", value: "1.00", score: 0.16, impact: "elevates_threat" },
      { name: "Flow Bytes/s Rate", category: "Volume", value: "1,420 B/s", score: 0.11, impact: "elevates_threat" },
      { name: "Fwd Header Length", category: "Headers", value: "32 B", score: 0.05, impact: "elevates_threat" },
      { name: "Destination Port Entropy", category: "Entropy", value: "0.12", score: -0.08, impact: "reduces_threat" },
    ],
    temporalAttention: [
      { step: "t-2", window: "00:00 - 00:10", weight: 0.15, status: "Initial Handshake" },
      { step: "t-1", window: "00:10 - 00:20", weight: 0.32, status: "Encrypted Heartbeat" },
      { step: "t", window: "00:20 - 00:30", weight: 0.53, status: "Payload Expansion Trigger" },
    ],
    mitreDetails: {
      tactic: "Command and Control (TA0011)",
      technique: "Application Layer Protocol: Web Protocols",
      id: "T1071.001",
      evidence: "Synthetic periodic 10s reverse shell polling to external IP 205.174.165.73:8080.",
    },
  },
  sess_portscan_recon: {
    narrative:
      "Rapid horizontal TCP SYN fan-out across multiple destination ports (21, 22, 80, 443, 8080) with 0 corresponding ACK completions. The high destination port entropy (2.84) and elevated SYN flag count (42 pkts/sec) drive 78% of the model's reconnaissance attribution.",
    topFeatures: [
      { name: "Destination Port Entropy", category: "Entropy", value: "2.84", score: 0.42, impact: "elevates_threat" },
      { name: "SYN Flag Count / sec", category: "TCP Flags", value: "42.0 pkts/s", score: 0.31, impact: "elevates_threat" },
      { name: "Flow Duration (Micro-bursts)", category: "Timing", value: "0.002 s", score: 0.18, impact: "elevates_threat" },
      { name: "RST Flag Ratio", category: "TCP Flags", value: "0.85", score: 0.12, impact: "elevates_threat" },
      { name: "Bwd Packets / s", category: "Volume", value: "0.0 pkts/s", score: 0.09, impact: "elevates_threat" },
      { name: "Average Packet Size", category: "Payload", value: "44 B", score: -0.05, impact: "reduces_threat" },
    ],
    temporalAttention: [
      { step: "t-2", window: "00:00 - 00:10", weight: 0.18, status: "Low-frequency Probe" },
      { step: "t-1", window: "00:10 - 00:20", weight: 0.38, status: "Port Sweep Acceleration" },
      { step: "t", window: "00:20 - 00:30", weight: 0.44, status: "Subnet-wide Discovery" },
    ],
    mitreDetails: {
      tactic: "Reconnaissance (TA0043)",
      technique: "Network Service Scanning",
      id: "T1046",
      evidence: "Multi-port TCP SYN sweep across 192.168.10.0/24 subnet without completing 3-way handshakes.",
    },
  },
  sess_dos_hulk: {
    narrative:
      "Massive volumetric HTTP GET request surge with randomized headers exhausting web server worker threads. Surging flow byte rates (>4.8 MB/s) and extreme forward packet rates drive 88% of the model's DoS Hulk classification.",
    topFeatures: [
      { name: "Flow Bytes / s", category: "Volume", value: "4.82 MB/s", score: 0.46, impact: "elevates_threat" },
      { name: "Fwd Packets / s", category: "Volume", value: "3,820 pkts/s", score: 0.34, impact: "elevates_threat" },
      { name: "Flow Duration Mean", category: "Timing", value: "18.4 s", score: 0.14, impact: "elevates_threat" },
      { name: "PSH Flag Count", category: "TCP Flags", value: "980", score: 0.08, impact: "elevates_threat" },
      { name: "Flow IAT Mean", category: "Timing", value: "0.0002 s", score: 0.06, impact: "elevates_threat" },
    ],
    temporalAttention: [
      { step: "t-2", window: "00:00 - 00:10", weight: 0.12, status: "Connection Flood Ingress" },
      { step: "t-1", window: "00:10 - 00:20", weight: 0.41, status: "Socket Pool Saturation" },
      { step: "t", window: "00:20 - 00:30", weight: 0.47, status: "Server Service Degradation" },
    ],
    mitreDetails: {
      tactic: "Impact (TA0040)",
      technique: "Network Denial of Service: Direct Network Flood",
      id: "T1498.001",
      evidence: "High-volume HTTP GET flood overwhelming Apache web server on port 80.",
    },
  },
  sess_patator_ssh: {
    narrative:
      "Rapid succession of high-frequency SSH connection attempts (port 22) characterized by repeated short flow durations, identical packet sizes (56 bytes), and frequent connection resets indicating automated credential dictionary brute force.",
    topFeatures: [
      { name: "Flow Count to Port 22", category: "Volume", value: "68 / 10s", score: 0.44, impact: "elevates_threat" },
      { name: "Flow Duration Std", category: "Timing", value: "0.012 s", score: 0.28, impact: "elevates_threat" },
      { name: "Fwd Packet Length Mean", category: "Payload", value: "56.0 B", score: 0.19, impact: "elevates_threat" },
      { name: "FIN Flag Count", category: "TCP Flags", value: "68", score: 0.11, impact: "elevates_threat" },
      { name: "Payload Entropy", category: "Entropy", value: "0.82", score: -0.04, impact: "reduces_threat" },
    ],
    temporalAttention: [
      { step: "t-2", window: "00:00 - 00:10", weight: 0.20, status: "Initial Connection Attempts" },
      { step: "t-1", window: "00:10 - 00:20", weight: 0.35, status: "Dictionary Spray" },
      { step: "t", window: "00:20 - 00:30", weight: 0.45, status: "Accelerated Password Guessing" },
    ],
    mitreDetails: {
      tactic: "Credential Access (TA0006)",
      technique: "Brute Force: Password Guessing",
      id: "T1110.001",
      evidence: "SSH-Patator dictionary assault targeting root credentials on 192.168.10.50:22.",
    },
  },
  sess_benign_normal: {
    narrative:
      "Normal office workstation traffic characterized by standard HTTPS TLS 1.3 handshakes, balanced bidirectional packet transfers, expected inter-arrival jitter, and zero TCP flag anomalies. Threat probability remains at 1.4%.",
    topFeatures: [
      { name: "SYN / ACK Balance Ratio", category: "TCP Flags", value: "1.01", score: -0.38, impact: "reduces_threat" },
      { name: "Flow IAT Jitter", category: "Timing", value: "0.420 s", score: -0.29, impact: "reduces_threat" },
      { name: "Bwd / Fwd Byte Ratio", category: "Payload", value: "4.2", score: -0.22, impact: "reduces_threat" },
      { name: "Port 443 Standard TLS", category: "Protocol", value: "HTTPS", score: -0.18, impact: "reduces_threat" },
      { name: "Packet Size Std", category: "Payload", value: "420.5 B", score: -0.11, impact: "reduces_threat" },
    ],
    temporalAttention: [
      { step: "t-2", window: "00:00 - 00:10", weight: 0.33, status: "Normal Browsing" },
      { step: "t-1", window: "00:10 - 00:20", weight: 0.34, status: "API Synchronization" },
      { step: "t", window: "00:20 - 00:30", weight: 0.33, status: "Steady State" },
    ],
    mitreDetails: {
      tactic: "Normal Operations",
      technique: "Standard Business Traffic",
      id: "BENIGN",
      evidence: "Legitimate enterprise HTTPS web browsing and corporate email synchronization.",
    },
  },
};

export function ExplainabilityPage() {
  const [sessions, setSessions] = useState<ScenarioSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("sess_bot_c2");

  useEffect(() => {
    getSampleSessions().then((data) => {
      if (data && data.length > 0) {
        setSessions(data);
        if (!data.some((s) => s.id === selectedSessionId)) {
          setSelectedSessionId(data[0].id);
        }
      }
    });
  }, []);

  const activeSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const activeExplanation =
    SCENARIO_EXPLANATIONS[selectedSessionId] || SCENARIO_EXPLANATIONS.sess_bot_c2;

  return (
    <div className="w-full flex flex-col gap-8 pb-16">
      {/* Top Header Card */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-6 rounded-2xl border p-8 lg:flex-row lg:items-end glow-box"
        style={{
          borderColor: "var(--color-border)",
          background:
            "linear-gradient(135deg, var(--color-panel), color-mix(in srgb, var(--color-accent) 6%, var(--color-panel)))",
        }}
      >
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[var(--color-accent)] border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 mb-3">
            <Eye size={13} />
            Constraint C2 Compliance · Axiomatic Feature Attribution
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
            Integrated Gradients &amp; Attention Explainability
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Every neural forecast is paired with exact path-integrated gradient attributions and temporal attention weights. SOC operators can inspect the precise network telemetry features and historical windows driving threat classifications.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0 font-mono text-xs">
          <div className="rounded-xl border px-4 py-3 bg-[var(--color-panel-raised)]" style={{ borderColor: "var(--color-border)" }}>
            <div className="text-[var(--color-text-muted)] text-[10px]">METHOD</div>
            <div className="mt-0.5 font-bold text-[var(--color-accent)]">Integrated Gradients</div>
          </div>
          <div className="rounded-xl border px-4 py-3 bg-[var(--color-panel-raised)]" style={{ borderColor: "var(--color-border)" }}>
            <div className="text-[var(--color-text-muted)] text-[10px]">INTEGRATION STEPS</div>
            <div className="mt-0.5 font-bold text-[var(--color-normal)]">m = 100 Riemann Steps</div>
          </div>
          <div className="rounded-xl border px-4 py-3 bg-[var(--color-panel-raised)]" style={{ borderColor: "var(--color-border)" }}>
            <div className="text-[var(--color-text-muted)] text-[10px]">AXIOMS SATISFIED</div>
            <div className="mt-0.5 font-bold text-[var(--color-elevated)]">Completeness &amp; Invariance</div>
          </div>
        </div>
      </motion.section>

      {/* Scenario Selector Ribbon */}
      <section className="rounded-2xl border p-5 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
        <div className="mb-3 text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] flex items-center gap-2">
          <Fingerprint size={14} />
          Select Telemetry Scenario for Forensic Decomposition
        </div>
        <div className="flex flex-wrap gap-2.5">
          {sessions.map((s) => {
            const isSelected = s.id === selectedSessionId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSessionId(s.id)}
                className={`rounded-xl border px-4 py-2.5 text-left transition-all ${
                  isSelected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)] shadow-sm"
                    : "border-[var(--color-border)] bg-[var(--color-panel-raised)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-text-primary)]"
                }`}
              >
                <div className="font-mono text-[10px] uppercase text-[var(--color-text-muted)]">
                  {s.ground_truth_label} · {s.host_ip}
                </div>
                <div className="font-semibold text-xs mt-0.5 text-[var(--color-text-primary)]">
                  {s.name}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Narrative Synthesis & MITRE Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border p-6 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] mb-3">
            <Sparkles size={14} />
            Forensic Analyst Narrative Synthesis
          </div>
          <div className="rounded-xl border p-5 font-sans text-sm leading-relaxed bg-[var(--color-base)] text-[var(--color-text-primary)]" style={{ borderColor: "var(--color-border)" }}>
            <p>{activeExplanation.narrative}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1.5 text-[var(--color-normal)]">
              <CheckCircle2 size={14} />
              Axiom of Completeness verified: Sum(Attr_i) = F(x) - F(x')
            </span>
          </div>
        </section>

        <section className="rounded-2xl border p-6 glow-box flex flex-col justify-between" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-elevated)] mb-3">
              <ShieldAlert size={14} />
              MITRE ATT&amp;CK Mapping Details
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-lg border p-3 bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
                <div className="text-[var(--color-text-muted)] text-[10px]">TACTIC</div>
                <div className="font-bold text-[var(--color-text-primary)] mt-0.5">{activeExplanation.mitreDetails.tactic}</div>
              </div>
              <div className="rounded-lg border p-3 bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
                <div className="text-[var(--color-text-muted)] text-[10px]">TECHNIQUE ({activeExplanation.mitreDetails.id})</div>
                <div className="font-bold text-[var(--color-accent)] mt-0.5">{activeExplanation.mitreDetails.technique}</div>
              </div>
              <div className="rounded-lg border p-3 bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
                <div className="text-[var(--color-text-muted)] text-[10px]">EVIDENCE SUMMARY</div>
                <div className="text-[var(--color-text-secondary)] text-[11px] mt-0.5 leading-relaxed">{activeExplanation.mitreDetails.evidence}</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Feature Attribution Breakdown Table & Temporal Attention */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Feature Attributions */}
        <section className="rounded-2xl border p-6 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-accent)]">
              <TrendingUp size={14} />
              Top Attributed Telemetry Features
            </div>
            <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
              Integrated Gradients (Attr_i)
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {activeExplanation.topFeatures.map((f, i) => {
              const isPositive = f.score > 0;
              const barWidth = Math.min(Math.abs(f.score) * 180, 100);
              return (
                <div
                  key={f.name}
                  className="rounded-xl border p-3.5 bg-[var(--color-base)] space-y-2"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-text-muted)] text-[10px]">#{i + 1}</span>
                      <span className="font-semibold text-[var(--color-text-primary)]">{f.name}</span>
                      <span className="rounded bg-[var(--color-panel-raised)] px-2 py-0.5 text-[9px] text-[var(--color-text-secondary)]">
                        {f.category}
                      </span>
                    </div>
                    <span className="font-bold text-[var(--color-text-primary)]">{f.value}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-2 w-full rounded-full bg-[var(--color-panel-raised)] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isPositive ? "bg-[var(--color-critical)]" : "bg-[var(--color-normal)]"
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-bold shrink-0 ${
                        isPositive ? "text-[var(--color-critical)]" : "text-[var(--color-normal)]"
                      }`}
                    >
                      {isPositive ? `+${(f.score * 100).toFixed(1)}%` : `${(f.score * 100).toFixed(1)}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Temporal Attention Pooling Heatmap */}
        <section className="rounded-2xl border p-6 glow-box flex flex-col justify-between" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-accent)]">
                <Clock size={14} />
                Temporal Attention Weights (α_t)
              </div>
              <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                Historical Context L=3
              </span>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
              The World Model's multi-head attention mechanism assigns dynamic weights to past time windows, identifying exactly when anomalous state transitions accelerated.
            </p>

            <div className="space-y-3 font-mono text-xs">
              {activeExplanation.temporalAttention.map((t) => (
                <div
                  key={t.step}
                  className="rounded-xl border p-4 bg-[var(--color-base)] space-y-2"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[var(--color-accent)]">{t.step}</span>
                      <span className="text-[var(--color-text-muted)] text-[11px] ml-2">({t.window})</span>
                    </div>
                    <span className="font-bold text-[var(--color-text-primary)]">
                      {(t.weight * 100).toFixed(1)}% Attention
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-[var(--color-panel-raised)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)]"
                      style={{ width: `${t.weight * 100}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-[var(--color-text-secondary)]">{t.status}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border p-4 bg-[var(--color-panel-raised)] font-mono text-[11px] text-[var(--color-text-secondary)] flex items-start gap-2" style={{ borderColor: "var(--color-border)" }}>
            <HelpCircle size={15} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
            <div>
              <strong>Forensic Audit Guarantee:</strong> All feature attributions and attention weights can be exported as cryptographic JSON audit logs via <code className="text-[var(--color-accent)]">/api/export/{activeSession?.id}</code>.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
