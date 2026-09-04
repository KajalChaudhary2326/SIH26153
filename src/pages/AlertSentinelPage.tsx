import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Shield,
  Send,
  MessageSquare,
  Mail,
  Server,
  Building2,
  Globe,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Zap,
} from "lucide-react";
import { dispatchSentinelAlert, type SentinelAlertDispatchResponse } from "../data/api";
import { soundManager } from "../utils/soundEffects";

interface AttackPreset {
  id: string;
  name: string;
  category: string;
  attackerIp: string;
  threatProbability: number;
  mitreStage: string;
  color: string;
  icon: string;
}

const DEMO_PRESETS = [
  {
    label: "SBI Banking Server (192.168.10.50)",
    asset: "SBI Core Banking Portal & Substation",
    ip: "192.168.10.50",
    domain: "core-banking.sbi.co.in:443",
  },
  {
    label: "NCIIPC Smart Grid SCADA (10.0.100.42)",
    asset: "NCIIPC Northern Grid SCADA Gateway",
    ip: "10.0.100.42",
    domain: "scada-plc01.grid.nciipc.gov.in:502",
  },
  {
    label: "AIIMS Healthcare EMR (172.16.5.20)",
    asset: "AIIMS Central Patient ICU Telemetry Server",
    ip: "172.16.5.20",
    domain: "icu-telemetry.aiims.edu:8443",
  },
  {
    label: "Custom Blank Input",
    asset: "My Enterprise Production Server",
    ip: "192.168.1.100",
    domain: "internal-api.local:8080",
  },
];

const ATTACK_PRESETS: AttackPreset[] = [
  {
    id: "ddos",
    name: "Volumetric DDoS Hulk Flood",
    category: "Denial of Service (DoS)",
    attackerIp: "172.16.0.1",
    threatProbability: 0.984,
    mitreStage: "Impact (TA0040)",
    color: "rose",
    icon: "🌊",
  },
  {
    id: "botnet",
    name: "Botnet C2 Periodic Beacon",
    category: "Command & Control",
    attackerIp: "172.16.0.1",
    threatProbability: 0.968,
    mitreStage: "Command and Control (TA0011)",
    color: "purple",
    icon: "🤖",
  },
  {
    id: "ssh",
    name: "SSH-Patator Automated Brute Force",
    category: "Credential Access",
    attackerIp: "172.16.0.1",
    threatProbability: 0.942,
    mitreStage: "Credential Access (TA0006)",
    color: "amber",
    icon: "🔑",
  },
  {
    id: "scada",
    name: "NCIIPC CII SCADA Infiltration",
    category: "Critical Infrastructure",
    attackerIp: "10.0.100.42",
    threatProbability: 0.991,
    mitreStage: "Lateral Movement (TA0008)",
    color: "rose",
    icon: "⚡",
  },
  {
    id: "benign",
    name: "Normal Enterprise Traffic",
    category: "Baseline Stationary Flow",
    attackerIp: "192.168.10.15",
    threatProbability: 0.021,
    mitreStage: "Normal Operations",
    color: "emerald",
    icon: "🟢",
  },
];

export function AlertSentinelPage() {
  const navigate = useNavigate();

  // Configuration State
  const [targetAsset, setTargetAsset] = useState("SBI Core Banking Portal & Grid Substation");
  const [targetIp, setTargetIp] = useState("192.168.10.50");
  const [targetDomain, setTargetDomain] = useState("core-banking.sbi.co.in");
  const [whatsappNumber, setWhatsappNumber] = useState("+91 98765 43210");
  const [recipientEmail, setRecipientEmail] = useState("soc-leads@cert-in.gov.in");
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.slack.com/services/SHIELDNET_SOC");

  // Status & Dispatch State
  const [isSaved, setIsSaved] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [selectedFirewallTab, setSelectedFirewallTab] = useState<"iptables" | "nftables" | "netsh" | "cisco" | "ebpf">("iptables");
  const [copiedRule, setCopiedRule] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [activeAlert, setActiveAlert] = useState<SentinelAlertDispatchResponse | null>(null);
  const [dispatchHistory, setDispatchHistory] = useState<Array<{
    id: string;
    time: string;
    attack: string;
    targetIp: string;
    threatProb: number;
    whatsappStatus: string;
    emailStatus: string;
  }>>([]);

  const handleSaveConfig = () => {
    setIsSaved(true);
    soundManager.playMitigationSuccess();
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleOpenRemediation = () => {
    if (!activeAlert) return;
    const url = activeAlert.remediation_link || "";
    try {
      const parsed = new URL(url);
      navigate(parsed.pathname + parsed.search);
    } catch {
      navigate("/dashboard/simulation");
    }
  };

  const triggerAttackAlert = async (preset: AttackPreset) => {
    setIsDispatching(true);

    if (preset.threatProbability >= 0.7) {
      soundManager.playCriticalSiren();
    } else {
      soundManager.playAlertPing();
    }

    const payload = {
      target_asset: targetAsset,
      target_ip: targetIp,
      attacker_ip: preset.attackerIp,
      attack_type: preset.name,
      threat_probability: preset.threatProbability,
      mitre_stage: preset.mitreStage,
      notification_channels: ["email", "webhook", "whatsapp"],
      recipient_email: recipientEmail,
      webhook_url: webhookUrl,
      whatsapp_number: whatsappNumber,
    };

    const res = await dispatchSentinelAlert(payload);
    setActiveAlert(res);
    setIsDispatching(false);

    // Append to history
    setDispatchHistory((prev) => [
      {
        id: `disp_${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        attack: preset.name,
        targetIp: targetIp,
        threatProb: preset.threatProbability,
        whatsappStatus: res.dispatches.whatsapp?.status || "SENT",
        emailStatus: res.dispatches.email?.status || "DELIVERED",
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleOpenRealWhatsApp = () => {
    if (!activeAlert?.dispatches.whatsapp) return;
    const cleanNum = whatsappNumber.replace(/[^0-9]/g, "");
    const msg = activeAlert.dispatches.whatsapp.message;
    const url = `https://api.whatsapp.com/send?phone=${cleanNum}&text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handleOpenRealEmail = () => {
    if (!activeAlert?.dispatches.email) return;
    const email = activeAlert.dispatches.email;
    const mailto = `mailto:${recipientEmail}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
    window.location.href = mailto;
  };

  const handleCopyFirewallRule = () => {
    if (!activeAlert) return;
    const rule =
      selectedFirewallTab === "iptables"
        ? activeAlert.firewall_rules.linux_iptables
        : selectedFirewallTab === "nftables"
        ? activeAlert.firewall_rules.linux_nftables
        : selectedFirewallTab === "netsh"
        ? activeAlert.firewall_rules.windows_netsh
        : selectedFirewallTab === "cisco"
        ? activeAlert.firewall_rules.cisco_ios
        : activeAlert.firewall_rules.ebpf_xdp || activeAlert.firewall_rules.linux_iptables;

    navigator.clipboard.writeText(rule);
    setCopiedRule(true);
    setTimeout(() => setCopiedRule(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* HERO HEADER */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl border p-6 glow-box relative overflow-hidden flex flex-col gap-3"
        style={{ borderColor: "var(--color-accent)", backgroundColor: "var(--color-panel)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 text-[var(--color-accent)] shadow-lg">
              <Bell size={24} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-accent)] font-bold">
                  AUTONOMOUS EARLY WARNING DEFENSE GRID
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                  24/7 SENTINEL WATCHDOG ACTIVE
                </span>
              </div>
              <h1 className="text-xl font-bold text-[var(--color-text-primary)] mt-0.5">
                24/7 Custom IP &amp; Instant Multi-Channel Alert Sentinel
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)] font-mono mt-0.5">
                Configure your custom network IP, WhatsApp number, and SOC email. Test instant alert dispatches with step-by-step remediation links.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveConfig}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-mono text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md"
            >
              {isSaved ? <Check size={14} /> : <CheckCircle2 size={14} />}
              <span>{isSaved ? "CONFIG SAVED & ARMED!" : "SAVE CONFIG & ARM"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* STEP 1: OPERATOR CONFIGURATION PANEL */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl border p-5 glow-box flex flex-col gap-4"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
      >
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--color-accent)] font-bold border-b pb-2" style={{ borderColor: "var(--color-border)" }}>
          <Server size={15} />
          <span>STEP 1: CONFIGURE CUSTOM TARGET IP &amp; DESTINATION CHANNELS</span>
        </div>

        {/* Quick Demo Pre-fill Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-[var(--color-text-muted)] font-semibold uppercase">
            ⚡ Quick Demo Presets:
          </span>
          {DEMO_PRESETS.map((dp) => (
            <button
              key={dp.label}
              onClick={() => {
                setTargetAsset(dp.asset);
                setTargetIp(dp.ip);
                setTargetDomain(dp.domain);
              }}
              className="px-2.5 py-1 rounded border font-mono text-[10px] font-medium bg-[var(--color-base)] text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent)] transition-all"
              style={{ borderColor: "var(--color-border)" }}
            >
              {dp.label}
            </button>
          ))}
        </div>

        {/* Target Asset Inputs */}
        <div>
          <span className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
            Target Host &amp; Infrastructure Binding:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1.5 font-mono text-xs">
            <div className="p-3 rounded-lg border bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <label className="text-[var(--color-text-muted)] flex items-center gap-1.5 text-[11px]">
                <Building2 size={13} className="text-[var(--color-accent)]" /> TARGET ASSET NAME
              </label>
              <input
                type="text"
                value={targetAsset}
                onChange={(e) => setTargetAsset(e.target.value)}
                placeholder="e.g. SBI Core Banking Portal"
                className="mt-1.5 w-full rounded border bg-slate-950 px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] border-slate-700 focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-lg border bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <label className="text-[var(--color-text-muted)] flex items-center gap-1.5 text-[11px]">
                <Server size={13} className="text-emerald-400" /> CUSTOM SERVER IP / SUBNET
              </label>
              <input
                type="text"
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                placeholder="e.g. 192.168.10.50 or 10.0.100.42"
                className="mt-1.5 w-full rounded border bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-emerald-400 border-slate-700 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-lg border bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <label className="text-[var(--color-text-muted)] flex items-center gap-1.5 text-[11px]">
                <Globe size={13} className="text-[var(--color-accent)]" /> DOMAIN / PORT IDENTIFIER
              </label>
              <input
                type="text"
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                placeholder="e.g. core-banking.sbi.co.in:443"
                className="mt-1.5 w-full rounded border bg-slate-950 px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] border-slate-700 focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Destination Channels */}
        <div>
          <span className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
            Instant Notification Targets (WhatsApp, Email, SIEM):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1.5 font-mono text-xs">
            <div className="p-3 rounded-lg border bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <label className="text-[var(--color-text-muted)] flex items-center gap-1.5 text-[11px]">
                <MessageSquare size={13} className="text-emerald-400" /> YOUR WHATSAPP NUMBER
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1.5 w-full rounded border bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-emerald-400 border-slate-700 focus:border-emerald-400 focus:outline-none"
              />
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                Dispatches early warning with direct link to secure asset.
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <label className="text-[var(--color-text-muted)] flex items-center gap-1.5 text-[11px]">
                <Mail size={13} className="text-cyan-400" /> YOUR SOC EMAIL ADDRESS
              </label>
              <input
                type="text"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="soc-lead@cert-in.gov.in"
                className="mt-1.5 w-full rounded border bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-cyan-400 border-slate-700 focus:border-cyan-400 focus:outline-none"
              />
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                Sends full forensic report and synthesized firewall script.
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-[var(--color-base)]" style={{ borderColor: "var(--color-border)" }}>
              <label className="text-[var(--color-text-muted)] flex items-center gap-1.5 text-[11px]">
                <Terminal size={13} className="text-purple-400" /> SIEM / WEBHOOK ENDPOINT
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="mt-1.5 w-full rounded border bg-slate-950 px-2.5 py-1.5 text-xs text-purple-300 border-slate-700 focus:border-purple-400 focus:outline-none"
              />
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                Zero-delay JSON webhook POST on P(Attack) &ge; 0.75.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* STEP 2: INTERACTIVE LIVE ATTACK SIMULATION MATRIX */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl border p-5 glow-box flex flex-col gap-4"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-2" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--color-accent)] font-bold">
            <Zap size={15} />
            <span>STEP 2: SIMULATE ATTACK &amp; TRIGGER REAL-TIME DISPATCH</span>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            Click any scenario to test instant notification push to your WhatsApp &amp; Email:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
          {ATTACK_PRESETS.map((preset) => {
            const isCrit = preset.threatProbability >= 0.8;
            return (
              <button
                key={preset.id}
                onClick={() => triggerAttackAlert(preset)}
                disabled={isDispatching}
                className={`flex flex-col justify-between p-3.5 rounded-lg border text-left transition-all hover:scale-105 active:scale-95 shadow-md ${
                  isCrit
                    ? "bg-rose-500/10 border-rose-500/40 hover:border-rose-500 hover:bg-rose-500/20"
                    : preset.threatProbability > 0.4
                    ? "bg-amber-500/10 border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/20"
                    : "bg-emerald-500/10 border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-500/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base">{preset.icon}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isCrit ? "bg-rose-500 text-white" : preset.threatProbability > 0.4 ? "bg-amber-400 text-slate-950" : "bg-emerald-500 text-slate-950"
                      }`}
                    >
                      {(preset.threatProbability * 100).toFixed(0)}% THREAT
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[var(--color-text-primary)] leading-tight mb-1">
                    {preset.name}
                  </h4>
                  <div className="text-[10px] text-[var(--color-text-muted)] truncate mb-2">
                    {preset.category}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-bold text-[var(--color-accent)]">
                  <span>DISPATCH ALERT</span>
                  <Send size={11} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* STEP 3: DISPATCHED ALERT PREVIEWS & DIRECT MESSAGING LINKS */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeAlert && (
        <div
          className="rounded-xl border p-5 glow-box flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300"
          style={{ borderColor: "var(--color-accent)", backgroundColor: "var(--color-panel)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500 animate-ping"></div>
              <h3 className="font-bold text-sm text-rose-400 uppercase tracking-wider">
                🚨 REAL-TIME DISPATCH CONFIRMATION &amp; REMEDIATION INSTRUCTIONS
              </h3>
            </div>
            <span className="font-mono text-xs text-[var(--color-text-muted)]">
              Dispatched at: [{new Date(activeAlert.timestamp).toLocaleTimeString()}]
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* WhatsApp Card Mockup */}
            <div className="flex flex-col justify-between rounded-lg border p-4 bg-slate-950 border-emerald-500/40 shadow-lg">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 mb-3 font-mono text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <MessageSquare size={14} /> WHATSAPP INCIDENT NOTIFICATION
                  </span>
                  <span className="text-emerald-300 text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    STATUS: {activeAlert.dispatches.whatsapp?.status || "SENT_VIA_GATEWAY"}
                  </span>
                </div>

                <div className="rounded-lg p-3 bg-emerald-950/20 border border-emerald-500/30 font-mono text-xs text-emerald-200 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {activeAlert.dispatches.whatsapp?.message}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-emerald-500/20 font-mono text-xs">
                <button
                  onClick={handleOpenRemediation}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-2 font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-md"
                  title="Directly opens the incident remediation dashboard in ShieldNet"
                >
                  <ExternalLink size={14} />
                  <span>SECURE ASSET: OPEN INCIDENT REMEDIATION DASHBOARD</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleOpenRealWhatsApp}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2 font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md"
                    title="Opens WhatsApp Web or App with this alert pre-filled"
                  >
                    <MessageSquare size={14} />
                    <span>OPEN IN REAL WHATSAPP WEB / APP</span>
                    <ExternalLink size={12} />
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeAlert.dispatches.whatsapp?.message || "");
                      setCopiedWhatsapp(true);
                      setTimeout(() => setCopiedWhatsapp(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
                  >
                    {copiedWhatsapp ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedWhatsapp ? "COPIED" : "COPY TEXT"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Email Dispatch Card */}
            <div className="flex flex-col justify-between rounded-lg border p-4 bg-slate-950 border-cyan-500/40 shadow-lg">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 mb-3 font-mono text-xs">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Mail size={14} /> SOC SECURITY EMAIL BRIEFING
                  </span>
                  <span className="text-cyan-300 text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                    STATUS: {activeAlert.dispatches.email?.status || "DELIVERED_SIMULATED"}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-[var(--color-text-secondary)] mb-2">
                  <strong>To:</strong> {recipientEmail} | <strong>Subject:</strong> {activeAlert.dispatches.email?.subject}
                </div>

                <div className="rounded-lg p-3 bg-cyan-950/20 border border-cyan-500/30 font-mono text-xs text-cyan-200 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-56">
                  {activeAlert.dispatches.email?.body}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-cyan-500/20 font-mono text-xs">
                <button
                  onClick={handleOpenRemediation}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-2 font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-md"
                  title="Directly opens the incident remediation dashboard in ShieldNet"
                >
                  <ExternalLink size={14} />
                  <span>SECURE ASSET: OPEN INCIDENT REMEDIATION DASHBOARD</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleOpenRealEmail}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2 font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all shadow-md border border-slate-700"
                    title="Opens your default email client with formatted message"
                  >
                    <Mail size={14} />
                    <span>OPEN IN DEFAULT EMAIL CLIENT</span>
                    <ExternalLink size={12} />
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeAlert.dispatches.email?.body || "");
                      setCopiedEmail(true);
                      setTimeout(() => setCopiedEmail(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
                  >
                    {copiedEmail ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedEmail ? "COPIED" : "COPY EMAIL"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Autonomous Firewall Synthesizer Rules */}
          <div className="rounded-lg border p-4 bg-slate-950 border-slate-800 flex flex-col gap-3 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-[var(--color-accent)] font-bold">
                <Shield size={14} />
                <span>SYNTHESIZED SOVEREIGN FIREWALL MITIGATION RULE</span>
              </div>
              <button
                onClick={handleCopyFirewallRule}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[var(--color-accent)] border border-slate-700"
              >
                {copiedRule ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedRule ? "COPIED" : "COPY COMMAND"}</span>
              </button>
            </div>

            {/* Firewall Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {(["iptables", "nftables", "netsh", "cisco", "ebpf"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedFirewallTab(tab)}
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-all ${
                    selectedFirewallTab === tab
                      ? "bg-[var(--color-accent)] text-slate-950"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {tab === "iptables"
                    ? "Linux iptables"
                    : tab === "nftables"
                    ? "Linux nftables"
                    : tab === "netsh"
                    ? "Windows Netsh"
                    : tab === "cisco"
                    ? "Cisco IOS ACL"
                    : "eBPF / XDP (<1µs)"}
                </button>
              ))}
            </div>

            <pre className="rounded bg-black/60 p-3 text-[var(--color-accent)] overflow-x-auto border border-white/5">
              {selectedFirewallTab === "iptables" && activeAlert.firewall_rules.linux_iptables}
              {selectedFirewallTab === "nftables" && activeAlert.firewall_rules.linux_nftables}
              {selectedFirewallTab === "netsh" && activeAlert.firewall_rules.windows_netsh}
              {selectedFirewallTab === "cisco" && activeAlert.firewall_rules.cisco_ios}
              {selectedFirewallTab === "ebpf" &&
                (activeAlert.firewall_rules.ebpf_xdp ||
                  `// eBPF XDP Line-rate Drop\nSEC("xdp") int drop_func(struct xdp_md *ctx) { if (iph->saddr == inet_addr("${activeAlert.attacker_ip}")) return XDP_DROP; return XDP_PASS; }`)}
            </pre>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* RECENT DISPATCH AUDIT LOG */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl border p-5 glow-box flex flex-col gap-3"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
      >
        <div className="flex items-center justify-between border-b pb-2 font-mono text-xs" style={{ borderColor: "var(--color-border)" }}>
          <span className="font-bold text-[var(--color-text-primary)]">
            RECENT 24/7 INCIDENT DISPATCH AUDIT LOG
          </span>
          <span className="text-[var(--color-text-muted)]">Air-Gapped Gateway Synchronized</span>
        </div>

        {dispatchHistory.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-[var(--color-text-muted)]">
            No incidents dispatched yet. Select an attack scenario above to trigger your first simulated alert.
          </div>
        ) : (
          <div className="flex flex-col gap-2 font-mono text-xs">
            {dispatchHistory.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border bg-[var(--color-base)]"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[var(--color-text-muted)]">[{item.time}]</span>
                  <strong className="text-[var(--color-text-primary)]">{item.attack}</strong>
                  <span className="text-[var(--color-text-secondary)]">→ Target: {item.targetIp}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    WhatsApp: {item.whatsappStatus}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                    Email: {item.emailStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
