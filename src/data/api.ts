// Thin async API layer. Components import ONLY from this file, never from
// mockData.ts directly. Each function is shaped and named after the real
// endpoint it will eventually call — swapping the body for a fetch() is the
// only change needed to go live.

import type {
  Ingestion,
  TimeWindow,
  TimelinePoint,
  Explanation,
  FlaggedFlow,
  ModelRun,
  Severity,
  SourceType,
  DatasetName,
} from "./types";
import {
  mockIngestion,
  mockTimeWindows,
  mockTimeline,
  mockExplanations,
  mockFlaggedFlows,
  mockModelRuns,
  mockDefaultPredictionId,
} from "./mockData";

const NETWORK_DELAY_MS = 420;

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface UploadIngestionParams {
  sourceType: SourceType;
  filename: string;
  datasetName: DatasetName;
}

export interface UploadIngestionResult {
  ingestionId: string;
  status: Ingestion["status"];
}

/**
 * POST /api/ingest
 * Upload a CSV/PCAP file (or select the sample dataset) and kick off
 * feature extraction. Returns immediately with a pending status; poll
 * getIngestionStatus() to track progress.
 */
export async function uploadIngestion(
  params: UploadIngestionParams
): Promise<UploadIngestionResult> {
  // TODO(backend): replace with real fetch to POST /api/ingest (multipart/form-data)
  void params;
  return delay({ ingestionId: mockIngestion.id, status: "validating" }, 300);
}

/**
 * GET /api/ingest/:id/status
 * Poll feature-extraction progress for an ingestion.
 */
export async function getIngestionStatus(
  ingestionId: string
): Promise<Ingestion> {
  // TODO(backend): replace with real fetch to GET /api/ingest/:id/status
  return delay({ ...mockIngestion, id: ingestionId }, 250);
}

/**
 * POST /api/predict/:ingestionId
 * Trigger World Model inference (including K-step rollout) for an ingestion.
 * Returns the full set of predictions once complete.
 */
export async function runPrediction(
  ingestionId: string
): Promise<{ predictionCount: number; ready: boolean }> {
  // TODO(backend): replace with real fetch to POST /api/predict/:ingestionId
  void ingestionId;
  return delay({ predictionCount: mockTimeline.length, ready: true }, 600);
}

/**
 * GET /api/predict/:ingestionId/timeline
 * Chart-ready infiltration-probability timeline, including both observed
 * windows (kStepOffset = 0) and the forward-simulated K-step projection.
 */
export async function getTimeline(
  ingestionId: string
): Promise<TimelinePoint[]> {
  // TODO(backend): replace with real fetch to GET /api/predict/:ingestionId/timeline
  void ingestionId;
  return delay(mockTimeline);
}

/**
 * GET /api/explain/:predictionId
 * Top contributing features (SHAP values or attention weights) for a
 * single prediction, ranked by contribution.
 */
export async function getExplanation(
  predictionId: string
): Promise<Explanation[]> {
  // TODO(backend): replace with real fetch to GET /api/explain/:predictionId
  const explanations = mockExplanations[predictionId] ?? mockExplanations[mockDefaultPredictionId];
  return delay(explanations);
}

/**
 * GET /api/compare/baseline
 * World Model vs. Logistic Regression baseline metrics.
 */
export async function getBaselineComparison(): Promise<ModelRun[]> {
  // TODO(backend): replace with real fetch to GET /api/compare/baseline
  return delay(mockModelRuns);
}

export interface GetFlowsParams {
  windowId?: string;
  severity?: Severity;
}

/**
 * GET /api/flows?windowId=&severity=
 * Filterable flagged-flow list for the side panel.
 */
export async function getFlaggedFlows(
  params: GetFlowsParams = {}
): Promise<FlaggedFlow[]> {
  // TODO(backend): replace with real fetch to GET /api/flows
  let flows = mockFlaggedFlows;
  if (params.windowId) flows = flows.filter((f) => f.windowId === params.windowId);
  if (params.severity) flows = flows.filter((f) => f.severity === params.severity);
  return delay(flows);
}

/**
 * GET /api/ingest/:id (convenience — current dataset info for nav/status bar)
 */
export async function getIngestion(ingestionId: string): Promise<Ingestion> {
  // TODO(backend): replace with real fetch to GET /api/ingest/:id
  return delay({ ...mockIngestion, id: ingestionId });
}

/**
 * GET /api/export/:ingestionId?format=json
 * Full-results export (predictions + explanations + metrics) as a
 * downloadable JSON blob. Returns the object; ExportButton handles the
 * actual client-side download.
 */
export async function exportResults(
  ingestionId: string
): Promise<Record<string, unknown>> {
  // TODO(backend): replace with real fetch to GET /api/export/:ingestionId?format=json
  const [timeline, flows, comparison] = await Promise.all([
    getTimeline(ingestionId),
    getFlaggedFlows(),
    getBaselineComparison(),
  ]);
  return delay(
    {
      ingestionId,
      exportedAt: new Date().toISOString(),
      timeline,
      flaggedFlows: flows,
      baselineComparison: comparison,
    },
    150
  );
}

export function getTimeWindows(ingestionId: string): Promise<TimeWindow[]> {
  // TODO(backend): replace with real fetch to GET /api/ingest/:id/windows
  return delay(mockTimeWindows.filter((w) => w.ingestionId === ingestionId || true));
}

export { mockDefaultPredictionId as defaultPredictionId };
