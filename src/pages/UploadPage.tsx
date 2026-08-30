import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, FileStack, FlaskConical, CheckCircle2 } from "lucide-react";
import { DataSourceCard } from "../components/DataSourceCard";
import { uploadIngestion, getIngestionStatus } from "../data/api";
import { useAppStore } from "../store/useAppStore";
import type { DatasetName, Ingestion, IngestionStatus, SourceType } from "../data/types";

const PROCESSING_STEPS: { status: IngestionStatus; label: string }[] = [
  { status: "validating", label: "Validating file" },
  { status: "extracting_features", label: "Extracting flow + packet features" },
  { status: "sequencing", label: "Sequencing time windows" },
  { status: "ready", label: "Ready" },
];

export function UploadPage() {
  const navigate = useNavigate();
  const setActiveIngestion = useAppStore((s) => s.setActiveIngestion);
  const [processing, setProcessing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [pendingSource, setPendingSource] = useState<{ type: SourceType; filename: string; dataset: DatasetName } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const pcapInputRef = useRef<HTMLInputElement>(null);

  async function beginProcessing(sourceType: SourceType, filename: string, datasetName: DatasetName) {
    setPendingSource({ type: sourceType, filename, dataset: datasetName });
    setProcessing(true);
    setStepIndex(0);

    const result = await uploadIngestion({ sourceType, filename, datasetName });

    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 550));
      setStepIndex(i);
    }

    const ingestion: Ingestion = await getIngestionStatus(result.ingestionId);
    setActiveIngestion({ ...ingestion, sourceType, filename, datasetName, status: "ready" });
    await new Promise((r) => setTimeout(r, 350));
    navigate("/simulation");
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>, sourceType: SourceType) {
    const file = e.target.files?.[0];
    if (!file) return;
    beginProcessing(sourceType, file.name, "custom");
  }

  if (processing && pendingSource) {
    return (
      <div className="flex h-full min-h-[70vh] items-center justify-center">
        <div
          className="w-full max-w-md rounded-xl border p-8 glow-box"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
        >
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Processing {pendingSource.filename}
          </h2>
          <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">
            {pendingSource.type.toUpperCase()} · {pendingSource.dataset}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {PROCESSING_STEPS.map((step, i) => {
              const isDone = i < stepIndex || (i === stepIndex && step.status === "ready");
              const isCurrent = i === stepIndex && step.status !== "ready";
              return (
                <div key={step.status} className="flex items-center gap-3 text-sm">
                  {isDone ? (
                    <CheckCircle2 size={16} style={{ color: "var(--color-normal)" }} />
                  ) : (
                    <motion.div
                      animate={isCurrent ? { opacity: [0.4, 1, 0.4] } : {}}
                      transition={{ duration: 1.1, repeat: Infinity }}
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
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Data source</h1>
        <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
          Provide traffic telemetry to run against the World Model. Everything below runs
          entirely on this machine — nothing leaves the device.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DataSourceCard
          icon={<FileText size={20} />}
          title="Upload CSV"
          description="NetFlow-style flow records (CIC-IDS-2018 / CTU-13 schema)."
          meta=".csv"
          onClick={() => csvInputRef.current?.click()}
        />
        <DataSourceCard
          icon={<FileStack size={20} />}
          title="Upload PCAP"
          description="Raw packet capture. Parsed for packet-level timing and sequencing features."
          meta=".pcap"
          onClick={() => pcapInputRef.current?.click()}
        />
        <DataSourceCard
          icon={<FlaskConical size={20} />}
          title="Use sample dataset"
          description="CIC-IDS-2018 demo capture — a reliable path for walkthroughs and evaluation."
          meta="cic-ids-2018"
          onClick={() => beginProcessing("csv", "cicids2018_sample_capture.csv", "cic-ids-2018")}
        />
      </div>

      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => handleFileSelected(e, "csv")}
      />
      <input
        ref={pcapInputRef}
        type="file"
        accept=".pcap,.pcapng"
        className="hidden"
        onChange={(e) => handleFileSelected(e, "pcap")}
      />
    </div>
  );
}
