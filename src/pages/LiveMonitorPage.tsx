import { useState, useEffect, useRef } from "react";
import {
  Play,
  Square,
  Shield,
  Radio,
  Zap,
  Cpu,
  Server,
  Terminal,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { MITREStageBadge } from "../components/MITREStageBadge";
import type { MitreStage } from "../data/types";

interface LiveTelemetryPoint {
  timestamp: string;
  threatProbability: number;
  mitreStage: MitreStage;
  isProjection?: boolean;
}

interface LiveEventLog {
  id: string;
  time: string;
  severity: "normal" | "elevated" | "critical";
  message: string;
  action: string;
  snortRule: string;
}

export function LiveMonitorPage() {
  const [isRunning, setIsRunning] = useState(true);
  const [selectedInterface, setSelectedInterface] = useState("Wi-Fi (802.11ac Adapter - 192.168.1.105)");
  const [attackMode, setAttackMode] = useState<"normal" | "portscan" | "botnet" | "ddos" | "scada">("normal");

  // Metrics
  const [packetsPerSec, setPacketsPerSec] = useState(1240);
  const [totalPackets, setTotalPackets] = useState(14250);
  const [flowIat, setFlowIat] = useState(12.4);
  const [synRatio, setSynRatio] = useState(0.04);
  const [ttlVariance, setTtlVariance] = useState(1.2);
  const [threatProb, setThreatProb] = useState(0.02);
  const [mitreStage, setMitreStage] = useState<MitreStage>("Reconnaissance");

  // Chart data
  const [timeline, setTimeline] = useState<LiveTelemetryPoint[]>([]);
  const [kStepRollout, setKStepRollout] = useState<number[]>([0.02, 0.02, 0.03, 0.02, 0.03]);

  // Log events
  const [eventLogs, setEventLogs] = useState<LiveEventLog[]>([
    {
      id: "log_init",
      time: new Date().toLocaleTimeString(),
      severity: "normal",
      message: "Socket sniffer initialized on wlan0. 84 continuous telemetry channels synchronized.",
      action: "MONITORING",
      snortRule: "alert tcp any any -> $HOME_NET any (msg:\"ShieldNet Ingestion Active\"; sid:100001; rev:1;)",
    },
  ]);

  const tickRef = useRef(0);

  // Initialize initial 10 points
  useEffect(() => {
    const initialPoints: LiveTelemetryPoint[] = [];
    const now = Date.now();
    for (let i = 9; i >= 0; i--) {
      initialPoints.push({
        timestamp: new Date(now - i * 1500).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        threatProbability: 0.02 + (Math.sin(i) * 0.01),
        mitreStage: "Reconnaissance",
      });
    }
    setTimeline(initialPoints);
  }, []);

  // 1-second live ticker loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;
      const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      let currentP = 0.02;
      let pps = Math.floor(1100 + Math.random() * 300);
      let stage: MitreStage = "Reconnaissance";
      let iat = +(12.0 + Math.sin(t * 0.4) * 2.5).toFixed(2);
      let syn = +(0.03 + Math.random() * 0.02).toFixed(3);
      let ttl = +(1.2 + Math.random() * 0.4).toFixed(2);
      let newLog: LiveEventLog | null = null;

      if (attackMode === "normal") {
        currentP = +(0.02 + Math.random() * 0.015).toFixed(3);
        stage = "Reconnaissance";
      } else if (attackMode === "portscan") {
        currentP = Math.min(0.78, +(0.25 + (t % 15) * 0.04).toFixed(3));
        pps = Math.floor(2800 + Math.random() * 600);
        syn = 0.82;
        ttl = 8.4;
        stage = currentP > 0.5 ? "Initial Access" : "Reconnaissance";
        if (t % 4 === 0) {
          newLog = {
            id: `log_${Date.now()}`,
            time: nowStr,
            severity: "elevated",
            message: `Sequential horizontal SYN sweep detected across ports 21-8080 (Ratio: 82%).`,
            action: "RATE_LIMIT",
            snortRule: 'drop tcp $EXTERNAL_NET any -> $HOME_NET any (flags:S; threshold:type both, track by_src, count 70, seconds 5; msg:"ShieldNet: PortScan Detected"; sid:200001;)',
          };
        }
      } else if (attackMode === "botnet") {
        // Pulsing heartbeat beacon
        const wave = Math.abs(Math.sin(t * 0.8));
        currentP = Math.min(0.96, +(0.35 + wave * 0.55).toFixed(3));
        pps = Math.floor(1800 + wave * 900);
        iat = +(10.0 + (1 - wave) * 8.0).toFixed(2);
        stage = currentP > 0.7 ? "Command & Control" : "Lateral Movement";
        if (t % 4 === 0) {
          newLog = {
            id: `log_${Date.now()}`,
            time: nowStr,
            severity: "critical",
            message: `Periodic heartbeat beaconing (Jitter < 4ms) to external C2 channel detected.`,
            action: "BLOCK_IP",
            snortRule: 'drop tcp $HOME_NET any -> 205.174.165.73 8080 (msg:"ShieldNet: Ares/Mirai C2 Beacon Drop"; sid:200002;)',
          };
        }
      } else if (attackMode === "ddos") {
        currentP = Math.min(1.0, +(0.65 + (t % 12) * 0.05).toFixed(3));
        pps = Math.floor(32000 + Math.random() * 8000);
        syn = 0.96;
        iat = 0.01;
        stage = "Exfiltration";
        if (t % 3 === 0) {
          newLog = {
            id: `log_${Date.now()}`,
            time: nowStr,
            severity: "critical",
            message: `Volumetric HTTP socket pool exhaustion flood (38,000 pkts/s).`,
            action: "RATE_LIMIT",
            snortRule: 'drop tcp any any -> $HTTP_SERVERS 80 (detection_filter: track by_dst, count 5000, seconds 2; msg:"ShieldNet: Volumetric DoS Mitigation"; sid:200003;)',
          };
        }
      } else if (attackMode === "scada") {
        currentP = Math.min(0.99, +(0.20 + (t % 10) * 0.09).toFixed(3));
        pps = Math.floor(1450 + Math.random() * 200);
        stage = currentP > 0.75 ? "Exfiltration" : "Lateral Movement";
        if (t % 4 === 0) {
          newLog = {
            id: `log_${Date.now()}`,
            time: nowStr,
            severity: "critical",
            message: `Unauthorized Modbus TCP/502 coil command write bursts targeting Substation PLC.`,
            action: "BLOCK_IP",
            snortRule: 'drop tcp any any -> 10.0.100.1 502 (content:"|00 00 00 00 00 06|"; msg:"ShieldNet: NCIIPC Modbus Coil Injection Alert"; sid:200004;)',
          };
        }
      }

      setPacketsPerSec(pps);
      setTotalPackets((prev) => prev + pps);
      setFlowIat(iat);
      setSynRatio(syn);
      setTtlVariance(ttl);
      setThreatProb(currentP);
      setMitreStage(stage);

      // Rollout projection K=5
      const proj = [1, 2, 3, 4, 5].map((k) => {
        if (attackMode === "normal") return +(0.02 + Math.random() * 0.01).toFixed(3);
        return Math.min(1.0, +(currentP + 0.035 * k).toFixed(3));
      });
      setKStepRollout(proj);

      // Append point to rolling chart (keep last 15 points)
      setTimeline((prev) => {
        const updated = [...prev, { timestamp: nowStr, threatProbability: currentP, mitreStage: stage }];
        if (updated.length > 15) updated.shift();
        return updated;
      });

      if (newLog) {
        setEventLogs((prev) => [newLog!, ...prev.slice(0, 9)]);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isRunning, attackMode]);

  return (
    <div className="flex flex-col gap-6">
      {/* Live Radar Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5 glow-box relative overflow-hidden"
        style={{ borderColor: isRunning ? "var(--color-accent)" : "var(--color-border)", backgroundColor: "var(--color-panel)" }}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)]">
            <Radio
              size={20}
              className={isRunning ? "text-[var(--color-accent)] animate-pulse" : "text-[var(--color-text-muted)]"}
            />
            {isRunning && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-accent)]"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                REAL-TIME TELEMETRY SNIFFER & WORLD MODEL MONITOR
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                  isRunning ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
                }`}
              >
                {isRunning ? "🔴 LIVE STREAM ACTIVE" : "PAUSED"}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-xs text-[var(--color-text-secondary)]">
              Continuous 84-Dim State Ingestion (77 NetFlow + 7 PCAP Dynamics) · Autoregressive K=5 Rollout (+50s)
            </p>
          </div>
        </div>

        {/* Start / Stop Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-semibold shadow-md transition-all ${
              isRunning
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            }`}
          >
            {isRunning ? <Square size={14} /> : <Play size={14} />}
            {isRunning ? "PAUSE SNIFFER" : "RESUME MONITOR"}
          </button>
        </div>
      </div>

      {/* Control Bar: Interface & Attack Injector */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border p-4"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
      >
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 font-mono text-xs text-[var(--color-text-secondary)]">
            <Server size={14} className="text-[var(--color-accent)]" />
            SELECT ACTIVE NETWORK INTERFACE:
          </label>
          <select
            value={selectedInterface}
            onChange={(e) => setSelectedInterface(e.target.value)}
            className="rounded-md border bg-[var(--color-base)] px-3 py-2 font-mono text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
            style={{ borderColor: "var(--color-border)" }}
          >
            <option value="Wi-Fi (802.11ac Adapter - 192.168.1.105)">📡 Wi-Fi 802.11ac Adapter (192.168.1.105) - Active</option>
            <option value="Gigabit Ethernet PCIe (10.0.0.42)">🔌 Gigabit Ethernet PCIe (10.0.0.42)</option>
            <option value="Loopback Localhost (127.0.0.1)">🔄 Loopback Localhost (127.0.0.1)</option>
            <option value="Air-Gapped Sovereign Substation TAP">🛡️ NCIIPC Air-Gapped Substation TAP (TAP0)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 font-mono text-xs text-[var(--color-text-secondary)]">
            <Zap size={14} className="text-[var(--color-accent)]" />
            LIVE ATTACK TRAFFIC INJECTION (TEST HARNESS):
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: "normal", label: "Benign" },
              { id: "portscan", label: "PortScan" },
              { id: "botnet", label: "Botnet C2" },
              { id: "ddos", label: "DDoS" },
              { id: "scada", label: "SCADA" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setAttackMode(btn.id as any)}
                className={`rounded-md px-2 py-1.5 font-mono text-[11px] font-medium transition-all ${
                  attackMode === btn.id
                    ? "bg-[var(--color-accent)] text-[var(--color-base)] shadow-sm"
                    : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="font-mono text-[10px] text-[var(--color-text-secondary)]">PACKET RATE</div>
          <div className="mt-1 font-mono text-lg font-bold text-[var(--color-accent)]">{packetsPerSec.toLocaleString()} pkts/s</div>
          <div className="font-mono text-[10px] text-[var(--color-text-muted)]">Total: {totalPackets.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="font-mono text-[10px] text-[var(--color-text-secondary)]">FLOW IAT MEAN</div>
          <div className="mt-1 font-mono text-lg font-bold text-[var(--color-text-primary)]">{flowIat} ms</div>
          <div className="font-mono text-[10px] text-[var(--color-text-muted)]">Packet Interval</div>
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="font-mono text-[10px] text-[var(--color-text-secondary)]">SYN FLAG RATIO</div>
          <div className={`mt-1 font-mono text-lg font-bold ${synRatio > 0.6 ? "text-rose-400" : "text-emerald-400"}`}>
            {(synRatio * 100).toFixed(1)}%
          </div>
          <div className="font-mono text-[10px] text-[var(--color-text-muted)]">{synRatio > 0.6 ? "SYN Surge" : "Normal Ratio"}</div>
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="font-mono text-[10px] text-[var(--color-text-secondary)]">TTL VARIANCE</div>
          <div className="mt-1 font-mono text-lg font-bold text-[var(--color-text-primary)]">{ttlVariance}</div>
          <div className="font-mono text-[10px] text-[var(--color-text-muted)]">Hop Anomaly Check</div>
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="font-mono text-[10px] text-[var(--color-text-secondary)]">THREAT LEVEL</div>
          <div className={`mt-1 font-mono text-lg font-bold ${threatProb > 0.75 ? "text-rose-400" : threatProb > 0.4 ? "text-amber-400" : "text-emerald-400"}`}>
            {(threatProb * 100).toFixed(1)}%
          </div>
          <div className="font-mono text-[10px] text-[var(--color-text-muted)]">{threatProb > 0.75 ? "CRITICAL RISK" : threatProb > 0.4 ? "ELEVATED" : "BENIGN"}</div>
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="font-mono text-[10px] text-[var(--color-text-secondary)]">MITRE STAGE</div>
          <div className="mt-1">
            <MITREStageBadge stage={mitreStage} size="sm" />
          </div>
          <div className="mt-1 font-mono text-[10px] text-[var(--color-text-muted)]">Attack Lifecycle</div>
        </div>
      </div>

      {/* Rolling Threat Trajectory & K-Step Rollout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Rolling Trajectory Chart */}
        <div className="lg:col-span-2 rounded-xl border p-5 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                LIVE ROLLING THREAT TRAJECTORY (SLIDING 15-SEC WINDOW)
              </h3>
              <p className="font-mono text-xs text-[var(--color-text-secondary)]">
                State Transition Dynamics P(S_{"{t+1}"} | S_t) Evaluated in 15.5ms
              </p>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--color-base)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
              Latency: 0.015 ms
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeline} margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 1]}
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />
                <ReferenceLine y={0.8} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.6} />
                <ReferenceLine y={0.5} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.4} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-md border p-2 text-xs font-mono bg-slate-900 border-slate-700 text-white shadow-xl">
                          <div>Time: {data.timestamp}</div>
                          <div>Threat Prob: {(data.threatProbability * 100).toFixed(1)}%</div>
                          <div>Stage: {data.mitreStage}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="threatProbability"
                  stroke="var(--color-accent)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--color-accent)" }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Live K-Step Forward Forecast (+50s) */}
        <div className="rounded-xl border p-5 glow-box flex flex-col justify-between" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                K-STEP FORWARD ROLLOUT
              </h3>
              <Cpu size={16} className="text-[var(--color-accent)]" />
            </div>
            <p className="mt-1 font-mono text-xs text-[var(--color-text-secondary)]">
              World Model Autoregressive Rollout (+50s Horizon). Continuous self-feeding prediction.
            </p>
          </div>

          <div className="my-6 flex items-end gap-2 justify-between">
            {kStepRollout.map((val, idx) => {
              const heightPct = Math.max(8, val * 100);
              const isCrit = val >= 0.75;
              const isElev = val >= 0.4 && val < 0.75;
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                    {(val * 100).toFixed(0)}%
                  </span>
                  <div className="relative w-full h-32 rounded bg-[var(--color-base)] flex items-end border border-[var(--color-border)]">
                    <div
                      className={`w-full rounded-sm transition-all duration-300 ${
                        isCrit ? "bg-rose-500" : isElev ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                    T+{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border p-3 bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--color-accent)] font-semibold">
              <Shield size={14} />
              TACTICAL FORECAST VERDICT:
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              {threatProb > 0.75
                ? "Attacker trajectory converges to compromise in < 30s. Automated defense enforcement required."
                : threatProb > 0.4
                ? "Reconnaissance activity accelerating. Latent space mitigation recommended."
                : "Stationary benign equilibrium. Zero anomalous progression detected."}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: Real-Time Event Log & Auto-Generated Snort Rules */}
      <div className="rounded-xl border p-5 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-[var(--color-accent)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              LIVE NIDS DETECTIONS & SOVEREIGN RULE SYNTHESIS FEED
            </h3>
          </div>
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            Auto-Syncing with Snort / nftables Engine
          </span>
        </div>

        <div className="flex flex-col gap-2 font-mono text-xs max-h-56 overflow-y-auto pr-1">
          {eventLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-2.5 bg-[var(--color-base)]"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-[var(--color-text-muted)]">{log.time}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    log.severity === "critical"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : log.severity === "elevated"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {log.action}
                </span>
                <span className="text-[var(--color-text-primary)]">{log.message}</span>
              </div>
              <div className="text-[11px] text-[var(--color-accent)] truncate max-w-md bg-slate-950 px-2 py-1 rounded border border-slate-800">
                {log.snortRule}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
