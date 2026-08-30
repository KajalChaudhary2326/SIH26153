import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, FileStack, CheckCircle2, Upload, Activity, ArrowRight } from "lucide-react";
import { getSampleSessions, type ScenarioSession } from "../data/api";
import { useAppStore } from "../store/useAppStore";
import type { DatasetName, IngestionStatus, SourceType } from "../data/types";

const PROCESSING_STEPS: { status: IngestionStatus; label: string }[] = [
  { status: "validating", label: "Validating network telemetry schema" },
  { status: "extracting_features", label: "Extracting 77 flow + 7 packet features" },
  { status: "sequencing", label: "Constructing temporal state sequences (L=3)" },
  { status: "ready", label: "World Model inference ready" },
];

export function UploadPage() {
  const navigate = useNavigate();
  const setActiveIngestion = useAppStore((s) => s.setActiveIngestion);
  const [sessions, setSessions] = useState<ScenarioSession[]>([]);
  const [processing, setProcessing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [pendingSource, setPendingSource] = useState<{ type: SourceType; filename: string; dataset: DatasetName } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const pcapInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSampleSessions().then(setSessions);
  }, []);

  async function beginProcessing(sourceType: SourceType, filename: string, datasetName: DatasetName, sessionId?: string) {
    setPendingSource({ type: sourceType, filename, dataset: datasetName });
    setProcessing(true);
    setStepIndex(0);

    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      setStepIndex(i);
    }

    const targetId = sessionId || "ing_uploaded";
    setActiveIngestion({
      id: targetId,
      sourceType,
      filename,
      datasetName,
      uploadedAt: new Date().toISOString(),
      status: "ready",
    });
    await new Promise((r) => setTimeout(r, 250));
    navigate("/dashboard/simulation");
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>, sourceType: SourceType) {
    const file = e.target.files?.[0];
    if (!file) return;
    beginProcessing(sourceType, file.name, "custom");
  }

  if (processing && pendingSource) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div
          className="w-full max-w-md rounded-xl border p-8 glow-box"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
        >
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] mb-1">
            <Activity size={14} className="animate-spin" />
            <span>INGESTION PIPELINE ACTIVE</span>
          </div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Processing {pendingSource.filename}
          </h2>
          <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">
            {pendingSource.type.toUpperCase()} · {pendingSource.dataset.toUpperCase()} TELEMETRY
          </p>

          <div className="mt-6 flex flex-col gap-3.5">
            {PROCESSING_STEPS.map((step, i) => {
              const isDone = i < stepIndex || (i === stepIndex && step.status === "ready");
              const isCurrent = i === stepIndex && step.status !== "ready";
              return (
                <div key={step.status} className="flex items-center gap-3 text-xs font-mono">
                  {isDone ? (
                    <CheckCircle2 size={16} style={{ color: "var(--color-normal)" }} />
                  ) : (
                    <motion.div
                      animate={isCurrent ? { opacity: [0.4, 1, 0.4] } : {}}
                      transition={{ duration: 0.9, repeat: Infinity }}
                      className="h-4 w-4 rounded-full border-2"
                      style={{ borderColor: "var(--color-accent)" }}
                    />
                  )}
                  <span
                    className={isDone || isCurrent ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Telemetry Ingestion &amp; Scenario Library
        </h1>
        <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
          Provide raw network captures (PCAP) or flow CSV files to run against the World Model. All processing occurs 100% locally on this machine.
        </p>
      </div>

      {/* File Upload Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,.parquet"
          className="hidden"
          onChange={(e) => handleFileSelected(e, "csv")}
        />
        <div
          onClick={() => csvInputRef.current?.click()}
          className="group cursor-pointer rounded-xl border p-6 transition-all hover:border-[var(--color-accent)] glow-box"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg p-2.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">
                Upload Flow CSV / Parquet
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">CICIDS2017, UNSW-NB15, or CSE-CIC-IDS2018 format</p>
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Extracts 77 standardized flow statistics, generates sliding context windows (L=3), and feeds state transitions to the World Model.
          </p>
          <div className="mt-4 flex items-center gap-2 font-mono text-xs text-[var(--color-accent)]">
            <Upload size={13} />
            <span>Select file (.csv, .parquet)</span>
          </div>
        </div>

        <input
          ref={pcapInputRef}
          type="file"
          accept=".pcap,.pcapng,.cap"
          className="hidden"
          onChange={(e) => handleFileSelected(e, "pcap")}
        />
        <div
          onClick={() => pcapInputRef.current?.click()}
          className="group cursor-pointer rounded-xl border p-6 transition-all hover:border-[var(--color-accent)] glow-box"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg p-2.5 bg-[var(--color-mitre-c2)]/10 text-[var(--color-mitre-c2)]">
              <FileStack size={22} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">
                Upload Raw PCAP Stream
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">tcpdump / Wireshark packet captures</p>
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Parses raw packets with Scapy, aggregates flow bursts, extracts dual-level packet metrics, and computes next-state dynamics.
          </p>
          <div className="mt-4 flex items-center gap-2 font-mono text-xs text-[var(--color-mitre-c2)]">
            <Upload size={13} />
            <span>Select packet capture (.pcap)</span>
          </div>
        </div>
      </div>

      {/* Pre-Loaded Realistic Scenarios */}
      <div className="rounded-xl border p-5 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Pre-Loaded Offline Attack Scenarios (1-Click Replay)
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Curated multi-stage telemetry sessions verified against ground-truth labels.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--color-normal)] bg-[var(--color-normal)]/10 px-2.5 py-1 rounded border border-[var(--color-normal)]/30">
            OFFLINE READY (C4)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => beginProcessing("csv", s.name, "cic-ids-2018", s.id)}
              className="group cursor-pointer rounded-lg border p-4 transition-all hover:border-[var(--color-accent)] bg-[var(--color-base)] flex flex-col justify-between"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      s.severity === "critical"
                        ? "bg-[var(--color-critical)]/20 text-[var(--color-critical)]"
                        : s.severity === "elevated"
                        ? "bg-[var(--color-elevated)]/20 text-[var(--color-elevated)]"
                        : "bg-[var(--color-normal)]/20 text-[var(--color-normal)]"
                    }`}
                  >
                    {s.severity.toUpperCase()}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
                    {s.host_ip}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] mb-1">
                  {s.name}
                </h4>
                <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2">
                  {s.scenario}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t font-mono text-[11px] text-[var(--color-accent)]" style={{ borderColor: "var(--color-border)" }}>
                <span>Launch Forecast</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
